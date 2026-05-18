"""Extract UK Market Reality from frontend draft into zerotrust CSVs.

Source: frontend/src/data/ukMarketReality.ts — 8 arrays:
  UK_CONTRAST           (US vs UK comparison rows)
  UK_REGULATORY_LAYERS  (MHRA / UK MDR / NICE-DTAC / UK data law)
  UK_NICE_REJECTION     (Alzheimer's drugs in UK)
  UK_NHS_DEPLOYMENTS    (real production wins in NHS)
  UK_AIRLOCK_COHORT     (MHRA AI airlock sandbox participants)
  UK_FUNDING_ROUNDS     (UK healthcare AI funding events)
  UK_BABYLON_CASE       (Babylon Health failure case — editorial)
  UK_FOUNDER_FRAME      (founder lessons — editorial)

Predicate mapping:
  contrast    -> ecosystem_event
  reg layers  -> regulatory_event
  NICE reject -> regulatory_event   (one claim per outcome)
  NHS deploy  -> deployed_at        (vendor at NHS trust)
  airlock     -> ecosystem_event
  funding     -> funding_amount_usd_m / ma_value_usd_m
  babylon     -> ecosystem_event (editorial, tagged)
  founder     -> ecosystem_event (editorial, tagged)
"""
from __future__ import annotations

import argparse
import json
import re
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
TS_FILE = REPO_ROOT / "frontend" / "src" / "data" / "ukMarketReality.ts"
DUMPER = REPO_ROOT / "scripts" / "zerotrust" / "dump_ts_module.mjs"
OUT_DIR = Path(r"C:\Projects\data\aiatls\zerotrust")
DOMAIN_TAG = "uk_market"

# Parse "$30M", "£15m", "USD 60M" etc -> millions float, or None.
_AMOUNT_RE = re.compile(r"([0-9]+(?:\.[0-9]+)?)\s*([mMbBkK])?")


def parse_amount(s: str | None) -> float | None:
    if not s:
        return None
    m = _AMOUNT_RE.search(s)
    if not m:
        return None
    val = float(m.group(1))
    unit = (m.group(2) or "M").lower()
    if unit == "b":
        return val * 1000
    if unit == "k":
        return val / 1000
    return val  # default M


def load_ts_module() -> dict:
    proc = subprocess.run(
        ["node", "--experimental-strip-types", str(DUMPER), str(TS_FILE)],
        capture_output=True, text=True, encoding="utf-8", check=False,
    )
    if proc.returncode != 0:
        sys.stderr.write(proc.stderr)
        raise RuntimeError(f"TS dump failed: rc={proc.returncode}")
    return json.loads(proc.stdout)


def _build(
    *, raw_id, src, title, value, value_unit, period, entity_name,
    entity_type, predicate, extra_tags, extracted_from,
    url_status, wayback_replacements,
    notes: str = "",
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
        country="UK", domain_tags=DOMAIN_TAG,
    )
    sid = source_id_for(eff_url)
    source = Source(
        source_id=sid, url=canonical_url(eff_url), url_raw=src,
        source_type=source_type, retrieved_at=today(),
        title=title[:200],
    )
    cid = claim_id_for(eid, predicate, period, str(value)[:64])
    tags = [f"entity:{eid}"] + extra_tags
    if wb_url:
        tags.append("wayback_archived")
    claim = Claim(
        claim_id=cid, entity_id=eid, predicate=predicate,
        value=str(value)[:500], value_unit=value_unit, period=period,
        jurisdiction="UK", confidence=confidence,
        source_ids=sid, domain_tags=DOMAIN_TAG,
        tags=",".join(tags),
        notes=notes,
        extracted_from=extracted_from,
        extracted_at=today(),
    )
    return entity, claim, source, None


def extract(data, url_status, wayback_replacements=None):
    wayback_replacements = wayback_replacements or {}
    entities, claims, sources, quarantine = {}, [], {}, []

    def commit(e, c, s, q):
        if q:
            quarantine.append(q)
        else:
            entities.setdefault(e.entity_id, e)
            sources.setdefault(s.source_id, s)
            claims.append(c)

    # 1. Contrast
    for row in data.get("UK_CONTRAST", []):
        commit(*_build(
            raw_id=row.get("id", ""), src=row.get("src", ""),
            title=row.get("metric", ""),
            value=f"US={row.get('us','')}; UK={row.get('uk','')}; ratio={row.get('ratio','')}. {row.get('note','')}",
            value_unit="", period="",
            entity_name="UK Healthcare AI Market",
            entity_type="other", predicate="ecosystem_event",
            extra_tags=[
                "category:market_contrast",
                f"source_tier:{row.get('tier','')}",
                f"confidence_orig:{row.get('confidence','')}",
            ],
            extracted_from=f"ukMarketReality.ts#UK_CONTRAST[id={row.get('id')}]",
            url_status=url_status, wayback_replacements=wayback_replacements,
        ))

    # 2. Regulatory layers
    for row in data.get("UK_REGULATORY_LAYERS", []):
        commit(*_build(
            raw_id=row.get("id", ""), src=row.get("src", ""),
            title=row.get("name", ""),
            value=f"{row.get('regulationName','')} — {row.get('oneLiner','')}. Scope: {row.get('scope','')}",
            value_unit="", period=row.get("enteredForce", ""),
            entity_name=row.get("name") or "UK Regulator",
            entity_type="regulator", predicate="regulatory_event",
            extra_tags=[
                "category:regulatory_layer",
                f"source_tier:{row.get('tier','')}",
                f"penalties:{(row.get('penalties') or '')[:80]}",
            ],
            extracted_from=f"ukMarketReality.ts#UK_REGULATORY_LAYERS[id={row.get('id')}]",
            url_status=url_status, wayback_replacements=wayback_replacements,
        ))

    # 3. NICE rejection — one claim per outcome
    for row in data.get("UK_NICE_REJECTION", []):
        commit(*_build(
            raw_id=row.get("id", ""), src=row.get("src", ""),
            title=f"{row.get('drug','')} at {row.get('agency','')}: {row.get('outcome','')}",
            value=row.get("detail", ""),
            value_unit="", period=row.get("date", ""),
            entity_name=row.get("drug") or "Alzheimer's drug",
            entity_type="vendor", predicate="regulatory_event",
            extra_tags=[
                "category:regulatory_outcome",
                f"agency:{row.get('agency','')}",
                f"outcome:{row.get('outcome','')}",
                f"source_tier:{row.get('tier','')}",
            ],
            extracted_from=f"ukMarketReality.ts#UK_NICE_REJECTION[id={row.get('id')}]",
            url_status=url_status, wayback_replacements=wayback_replacements,
        ))

    # 4. NHS deployments — vendor deployed at NHS trust
    for row in data.get("UK_NHS_DEPLOYMENTS", []):
        vendor = row.get("vendor", "")
        commit(*_build(
            raw_id=row.get("id", ""), src=row.get("src", ""),
            title=f"{vendor}: {row.get('product','')}",
            value=f"{vendor} deployed {row.get('product','')} for {row.get('useCase','')}. Status: {row.get('status','')}. Scale: {row.get('scale','')}",
            value_unit="", period="",
            entity_name=vendor or "Unknown vendor",
            entity_type="vendor", predicate="deployed_at",
            extra_tags=[
                "category:nhs_deployment",
                f"vendor_hq:{row.get('vendorHq','')}",
                f"use_case:{row.get('useCase','')[:60]}",
                f"status:{row.get('status','')[:40]}",
                f"source_tier:{row.get('tier','')}",
            ],
            extracted_from=f"ukMarketReality.ts#UK_NHS_DEPLOYMENTS[id={row.get('id')}]",
            url_status=url_status, wayback_replacements=wayback_replacements,
        ))

    # 5. Airlock cohort
    for row in data.get("UK_AIRLOCK_COHORT", []):
        org = row.get("organisation", "") or row.get("name", "")
        commit(*_build(
            raw_id=row.get("id", ""), src=row.get("src", ""),
            title=f"MHRA AI Airlock: {row.get('name','')}",
            value=f"{org} ({row.get('product','')}): {row.get('challenge','')}",
            value_unit="", period="2024",
            entity_name=org or "Airlock participant",
            entity_type="vendor", predicate="ecosystem_event",
            extra_tags=[
                "category:mhra_airlock",
                f"product:{row.get('product','')[:80]}",
                f"source_tier:{row.get('tier','')}",
            ],
            extracted_from=f"ukMarketReality.ts#UK_AIRLOCK_COHORT[id={row.get('id')}]",
            url_status=url_status, wayback_replacements=wayback_replacements,
        ))

    # 6. Funding rounds
    for row in data.get("UK_FUNDING_ROUNDS", []):
        ftype = row.get("type", "funding")
        amount = parse_amount(row.get("amount", ""))
        if ftype == "acquisition":
            predicate = "ma_value_usd_m"
        elif ftype in ("delisting", "merger"):
            predicate = "ecosystem_event"
        else:
            predicate = "funding_amount_usd_m"
        commit(*_build(
            raw_id=row.get("id", ""), src=row.get("src", ""),
            title=f"{row.get('company','')}: {row.get('type','')} {row.get('amount','')}",
            value=str(amount) if amount is not None else row.get("amount", ""),
            value_unit="usd_m" if amount is not None else "",
            period=row.get("date", ""),
            entity_name=row.get("company") or "UK vendor",
            entity_type="vendor", predicate=predicate,
            extra_tags=[
                "category:funding",
                f"funding_type:{ftype}",
                f"founder:{row.get('founder','')[:60]}",
                f"source_tier:{row.get('tier','')}",
            ],
            extracted_from=f"ukMarketReality.ts#UK_FUNDING_ROUNDS[id={row.get('id')}]",
            url_status=url_status, wayback_replacements=wayback_replacements,
        ))

    # 7. Babylon case (editorial)
    for row in data.get("UK_BABYLON_CASE", []):
        commit(*_build(
            raw_id=row.get("id", ""), src=row.get("src", ""),
            title=row.get("title", "") or row.get("id", ""),
            value=row.get("body") or row.get("oneLiner", "") or row.get("title", ""),
            value_unit="", period=row.get("year", "") or "",
            entity_name="Babylon Health",
            entity_type="vendor", predicate="ecosystem_event",
            extra_tags=[
                "category:babylon_case",
                "editorial:true",
                f"source_tier:{row.get('tier','')}",
            ],
            extracted_from=f"ukMarketReality.ts#UK_BABYLON_CASE[id={row.get('id')}]",
            url_status=url_status, wayback_replacements=wayback_replacements,
        ))

    # 8. Founder frame (editorial)
    for row in data.get("UK_FOUNDER_FRAME", []):
        commit(*_build(
            raw_id=row.get("id", ""), src=row.get("src", ""),
            title=row.get("title", "") or row.get("id", ""),
            value=row.get("body") or row.get("oneLiner", "") or row.get("title", ""),
            value_unit="", period="",
            entity_name="UK Healthcare AI Market",
            entity_type="other", predicate="ecosystem_event",
            extra_tags=["category:founder_frame", "editorial:true"],
            extracted_from=f"ukMarketReality.ts#UK_FOUNDER_FRAME[id={row.get('id')}]",
            url_status=url_status, wayback_replacements=wayback_replacements,
        ))

    return entities, claims, sources, quarantine


def collect_urls(data: dict) -> set[str]:
    urls: set[str] = set()
    for arr_key in ("UK_CONTRAST", "UK_REGULATORY_LAYERS", "UK_NICE_REJECTION",
                    "UK_NHS_DEPLOYMENTS", "UK_AIRLOCK_COHORT",
                    "UK_FUNDING_ROUNDS", "UK_BABYLON_CASE", "UK_FOUNDER_FRAME"):
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

    print("Loading ukMarketReality.ts ...")
    data = load_ts_module()
    for k in ("UK_CONTRAST", "UK_REGULATORY_LAYERS", "UK_NICE_REJECTION",
              "UK_NHS_DEPLOYMENTS", "UK_AIRLOCK_COHORT",
              "UK_FUNDING_ROUNDS", "UK_BABYLON_CASE", "UK_FOUNDER_FRAME"):
        print(f"  {k:25s} {len(data.get(k, []))}")

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
    write_entities(OUT_DIR / "entities_uk.csv", entities.values())
    write_claims(OUT_DIR / "claims_uk.csv", claims)
    write_sources(OUT_DIR / "sources_uk.csv", sources.values())
    write_quarantine(OUT_DIR / "quarantine_uk.csv", quarantine)
    print(f"\nWrote CSVs to {OUT_DIR}/*_uk.csv")
    return 0


if __name__ == "__main__":
    sys.exit(main())
