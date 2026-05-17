"""Extract UAE Market Reality from frontend draft into zerotrust CSVs.

Source: frontend/src/data/uaeMarketReality.ts — four arrays:
  UAE_CONTRAST          (US vs UAE comparison rows, with metric/ratio)
  UAE_PROCUREMENT       (12 procurement contracts: customer/vendor/year)
  UAE_ACCELERATORS      (6 accelerator programs)
  UAE_FOUNDER_TAKEAWAYS (editorial founder lessons — kept as
                         ecosystem_event with editorial flag)

The source file already has a `tier: primary|secondary` field on each
record. We preserve it as a tag (`source_tier:primary`) but compute
confidence from the URL domain via verify.classify_confidence so that
the canonical scale stays high/medium/low.

Predicate mapping:
  ContrastRow         -> ecosystem_event
  ProcurementContract -> deployed_at (vendor deployed at customer)
  AcceleratorProgram  -> ecosystem_event
  FounderTakeaway     -> ecosystem_event (editorial, tagged)
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

from .common import (
    canonical_url, claim_id_for, entity_id_for, source_id_for, today,
    write_claims, write_entities, write_quarantine, write_sources,
)
from .schema import Claim, Entity, QuarantineRow, Source
from .verify import (
    classify_confidence, downgrade, salvage_via_wayback, verify_urls,
)

REPO_ROOT = Path(__file__).resolve().parents[2]
TS_FILE = REPO_ROOT / "frontend" / "src" / "data" / "uaeMarketReality.ts"
DUMPER = REPO_ROOT / "scripts" / "zerotrust" / "dump_ts_module.mjs"
OUT_DIR = Path(r"C:\Projects\data\aiatls\zerotrust")
DOMAIN_TAG = "uae_market"


def load_ts_module() -> dict:
    proc = subprocess.run(
        ["node", "--experimental-strip-types", str(DUMPER), str(TS_FILE)],
        capture_output=True, text=True, encoding='utf-8', check=False,
    )
    if proc.returncode != 0:
        sys.stderr.write(proc.stderr)
        raise RuntimeError(f"TS dump failed: rc={proc.returncode}")
    return json.loads(proc.stdout)


def _build(
    *,
    raw_id: str,
    src: str,
    title: str,
    value: str,
    period: str,
    entity_name: str,
    entity_type: str,
    predicate: str,
    extra_tags: list[str],
    extracted_from: str,
    url_status,
    wayback_replacements,
):
    if not src:
        return None, None, None, QuarantineRow(
            reason="missing_source_url",
            extracted_from=extracted_from,
            raw=json.dumps({"id": raw_id, "title": title}, ensure_ascii=False),
        )
    alive, status = url_status.get(src, (False, "unchecked"))
    if not alive:
        return None, None, None, QuarantineRow(
            reason=f"dead_url:{status}",
            extracted_from=extracted_from,
            raw=json.dumps({"src": src, "id": raw_id, "title": title}, ensure_ascii=False),
        )

    wb_url = wayback_replacements.get(src)
    eff_url = wb_url or src
    confidence, source_type = classify_confidence(src)
    if wb_url:
        confidence = downgrade(confidence)

    eid = entity_id_for(entity_name)
    entity = Entity(
        entity_id=eid, name=entity_name, type=entity_type,
        country="AE", domain_tags=DOMAIN_TAG,
    )

    sid = source_id_for(eff_url)
    source = Source(
        source_id=sid, url=canonical_url(eff_url), url_raw=src,
        source_type=source_type, retrieved_at=today(),
        title=title[:200],
    )

    cid = claim_id_for(eid, predicate, period, title[:64])
    tags = [f"entity:{eid}"] + extra_tags
    if wb_url:
        tags.append("wayback_archived")
    claim = Claim(
        claim_id=cid, entity_id=eid, predicate=predicate,
        value=value[:500], period=period, jurisdiction="AE",
        confidence=confidence, source_ids=sid, domain_tags=DOMAIN_TAG,
        tags=",".join(tags),
        extracted_from=extracted_from,
        extracted_at=today(),
    )
    return entity, claim, source, None


def extract(data, url_status, wayback_replacements=None):
    wayback_replacements = wayback_replacements or {}
    entities: dict[str, Entity] = {}
    claims: list[Claim] = []
    sources: dict[str, Source] = {}
    quarantine: list[QuarantineRow] = []

    # 1. Contrast rows
    for row in data.get("UAE_CONTRAST", []):
        e, c, s, q = _build(
            raw_id=row.get("id", ""),
            src=row.get("src", ""),
            title=row.get("metric", ""),
            value=f"US={row.get('us','')}; UAE={row.get('uae','')}; ratio={row.get('ratio','')}. {row.get('note','')}",
            period="2024",  # contrast rows are mostly 2024 snapshots
            entity_name="UAE Healthcare AI Market",
            entity_type="other",
            predicate="ecosystem_event",
            extra_tags=[
                "category:market_contrast",
                f"source_tier:{row.get('tier','')}",
                f"confidence_orig:{row.get('confidence','')}",
            ],
            extracted_from=f"uaeMarketReality.ts#UAE_CONTRAST[id={row.get('id')}]",
            url_status=url_status,
            wayback_replacements=wayback_replacements,
        )
        if q:
            quarantine.append(q)
        else:
            entities.setdefault(e.entity_id, e)
            sources.setdefault(s.source_id, s)
            claims.append(c)

    # 2. Procurement contracts — entity = vendor (the one being deployed)
    for row in data.get("UAE_PROCUREMENT", []):
        vendor = row.get("vendor", "")
        e, c, s, q = _build(
            raw_id=row.get("id", ""),
            src=row.get("src", ""),
            title=f"{vendor} -> {row.get('customer','')}: {row.get('product','')}",
            value=f"{vendor} (HQ {row.get('vendorHq','')}) deployed {row.get('product','')} at {row.get('customer','')} in {row.get('year','')}",
            period=str(row.get("year", "")),
            entity_name=vendor or "Unknown vendor",
            entity_type="vendor",
            predicate="deployed_at",
            extra_tags=[
                "category:procurement",
                f"customer:{row.get('customer','')[:80]}",
                f"product:{row.get('product','')[:80]}",
                f"vendor_hq:{row.get('vendorHq','')}",
                f"source_tier:{row.get('tier','')}",
            ],
            extracted_from=f"uaeMarketReality.ts#UAE_PROCUREMENT[id={row.get('id')}]",
            url_status=url_status,
            wayback_replacements=wayback_replacements,
        )
        if q:
            quarantine.append(q)
        else:
            entities.setdefault(e.entity_id, e)
            sources.setdefault(s.source_id, s)
            claims.append(c)

    # 3. Accelerator programs
    for row in data.get("UAE_ACCELERATORS", []):
        name = row.get("name", "")
        e, c, s, q = _build(
            raw_id=row.get("id", ""),
            src=row.get("src", ""),
            title=name,
            value=f"{name} ({row.get('owner','')}, since {row.get('since','')}). {row.get('oneLiner','')}",
            period=str(row.get("since", "")),
            entity_name=name or "UAE Accelerator",
            entity_type="other",
            predicate="ecosystem_event",
            extra_tags=[
                "category:accelerator",
                f"pattern:{row.get('pattern','')}",
                f"owner:{row.get('owner','')[:80]}",
                f"source_tier:{row.get('tier','')}",
                f"confidence_orig:{row.get('confidence','')}",
            ],
            extracted_from=f"uaeMarketReality.ts#UAE_ACCELERATORS[id={row.get('id')}]",
            url_status=url_status,
            wayback_replacements=wayback_replacements,
        )
        if q:
            quarantine.append(q)
        else:
            entities.setdefault(e.entity_id, e)
            sources.setdefault(s.source_id, s)
            claims.append(c)

    # 4. Founder takeaways (editorial — flagged as such)
    for row in data.get("UAE_FOUNDER_TAKEAWAYS", []):
        e, c, s, q = _build(
            raw_id=row.get("id", ""),
            src=row.get("src", ""),
            title=row.get("title", "") or row.get("id", ""),
            value=row.get("body", "") or row.get("oneLiner", "") or row.get("title", ""),
            period="",
            entity_name="UAE Healthcare AI Market",
            entity_type="other",
            predicate="ecosystem_event",
            extra_tags=[
                "category:founder_takeaway",
                "editorial:true",
            ],
            extracted_from=f"uaeMarketReality.ts#UAE_FOUNDER_TAKEAWAYS[id={row.get('id')}]",
            url_status=url_status,
            wayback_replacements=wayback_replacements,
        )
        if q:
            quarantine.append(q)
        else:
            entities.setdefault(e.entity_id, e)
            sources.setdefault(s.source_id, s)
            claims.append(c)

    return entities, claims, sources, quarantine


def collect_urls(data: dict) -> set[str]:
    urls: set[str] = set()
    for arr_key in ("UAE_CONTRAST", "UAE_PROCUREMENT", "UAE_ACCELERATORS",
                    "UAE_FOUNDER_TAKEAWAYS"):
        for item in data.get(arr_key, []):
            s = (item.get("src") or "").strip()
            if s:
                urls.add(s)
    return urls


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--skip-verify", action="store_true")
    ap.add_argument("--skip-wayback", action="store_true")
    args = ap.parse_args()

    print("Loading uaeMarketReality.ts ...")
    data = load_ts_module()
    print(f"  contrast:        {len(data.get('UAE_CONTRAST', []))}")
    print(f"  procurement:     {len(data.get('UAE_PROCUREMENT', []))}")
    print(f"  accelerators:    {len(data.get('UAE_ACCELERATORS', []))}")
    print(f"  takeaways:       {len(data.get('UAE_FOUNDER_TAKEAWAYS', []))}")

    urls = collect_urls(data)
    print(f"\nVerifying {len(urls)} distinct URLs ...")
    wayback_replacements: dict[str, str] = {}
    if args.skip_verify:
        url_status = {u: (True, "skipped") for u in urls}
    else:
        t0 = time.time()
        url_status = verify_urls(urls)
        alive = sum(1 for v in url_status.values() if v[0])
        print(f"  done in {time.time()-t0:.1f}s — alive={alive} dead={len(urls)-alive}")
        if not args.skip_wayback and (len(urls) - alive) > 0:
            wayback_replacements = salvage_via_wayback(url_status)

    print("\nExtracting...")
    entities, claims, sources, quarantine = extract(
        data, url_status, wayback_replacements
    )

    print(f"\nResults:")
    print(f"  entities:   {len(entities)}")
    print(f"  claims:     {len(claims)}")
    print(f"  sources:    {len(sources)}")
    print(f"  quarantine: {len(quarantine)}")
    if claims:
        from collections import Counter
        confs = Counter(c.confidence for c in claims)
        print(f"  confidence:")
        for c, n in confs.most_common():
            print(f"    {c:8s} {n}")

    if not args.write:
        return 0

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    write_entities(OUT_DIR / "entities_uae.csv", entities.values())
    write_claims(OUT_DIR / "claims_uae.csv", claims)
    write_sources(OUT_DIR / "sources_uae.csv", sources.values())
    write_quarantine(OUT_DIR / "quarantine_uae.csv", quarantine)
    print(f"\nWrote CSVs to {OUT_DIR}/*_uae.csv")
    return 0


if __name__ == "__main__":
    sys.exit(main())
