"""Extract EU + Switzerland Market Reality into zerotrust CSVs.

Source: frontend/src/data/euMarketReality.ts — 8 arrays totalling ~37
base records (Alzheimer's bridge nests ~12 outcome rows). Each base
record has a top-level `src` URL; some nested outcomes carry their own
src (the Alzheimer's bridge case).

Predicate mapping (canonical):
  EU_REGULATORY_LAYERS     -> regulatory_event   (EU rulebook)
  EU_ALZHEIMERS_BRIDGE     -> regulatory_event   (per outcome — one
                              claim per (drug, agency) outcome)
  EU_CEE_ARBITRAGE         -> ecosystem_event    (cost arbitrage by
                              country)
  EU_PHARMA_GRAVITY        -> partnered_with     (pharma-vendor cases)
  EU_IMAGING_CONSOLIDATION -> acquired_by        (M&A: which European
                              imaging vendor was rolled up by whom)
  EU_FOUNDER_FRAME         -> ecosystem_event    (editorial — tagged)
  SWISS_PROFILE            -> ecosystem_event    (Swiss-specific notes)
  EU_CONTRAST              -> ecosystem_event    (comparison rows)
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
TS_FILE = REPO_ROOT / "frontend" / "src" / "data" / "euMarketReality.ts"
DUMPER = REPO_ROOT / "scripts" / "zerotrust" / "dump_ts_module.mjs"
OUT_DIR = Path(r"C:\Projects\data\aiatls\zerotrust")
DOMAIN_TAG = "eu_market"


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
    *, raw_id, src, title, value, period, entity_name, entity_type,
    predicate, country, extra_tags, extracted_from,
    url_status, wayback_replacements,
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
        country=country, domain_tags=DOMAIN_TAG,
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
        value=value[:500], period=period, jurisdiction=country or "EU",
        confidence=confidence, source_ids=sid, domain_tags=DOMAIN_TAG,
        tags=",".join(tags),
        extracted_from=extracted_from,
        extracted_at=today(),
    )
    return entity, claim, source, None


def extract(data, url_status, wayback_replacements=None):
    wayback_replacements = wayback_replacements or {}
    entities, claims, sources, quarantine = {}, [], {}, []

    def commit(e, c, s, q):
        if q: quarantine.append(q)
        else:
            entities.setdefault(e.entity_id, e)
            sources.setdefault(s.source_id, s)
            claims.append(c)

    # 1. Regulatory layers
    for row in data.get("EU_REGULATORY_LAYERS", []):
        commit(*_build(
            raw_id=row.get("id", ""),
            src=row.get("src", ""),
            title=row.get("name", ""),
            value=f"{row.get('regulationName','')} — {row.get('oneLiner','')}. Scope: {row.get('scope','')}",
            period=row.get("enteredForce", ""),
            entity_name=row.get("name") or "European Commission",
            entity_type="regulator",
            predicate="regulatory_event",
            country="EU",
            extra_tags=[
                "category:regulatory_layer",
                f"source_tier:{row.get('tier','')}",
                f"penalties:{(row.get('penalties') or '')[:80]}",
            ],
            extracted_from=f"euMarketReality.ts#EU_REGULATORY_LAYERS[id={row.get('id')}]",
            url_status=url_status,
            wayback_replacements=wayback_replacements,
        ))

    # 2. Alzheimer's bridge — one claim per (drug, outcome) tuple
    for case in data.get("EU_ALZHEIMERS_BRIDGE", []):
        drug = case.get("drug", "")
        for out in case.get("outcomes", []) or []:
            commit(*_build(
                raw_id=f"{case.get('id','')}-{out.get('agency','')}",
                src=out.get("src", ""),
                title=f"{drug} at {out.get('agency','')}: {out.get('outcome','')}",
                value=out.get("detail", ""),
                period=out.get("date", ""),
                entity_name=drug or "Alzheimer's drug",
                entity_type="vendor",
                predicate="regulatory_event",
                country="EU",
                extra_tags=[
                    "category:regulatory_outcome",
                    f"agency:{out.get('agency','')}",
                    f"outcome:{out.get('outcome','')}",
                    f"manufacturer:{case.get('manufacturer','')}",
                    f"source_tier:{out.get('tier','')}",
                ],
                extracted_from=f"euMarketReality.ts#EU_ALZHEIMERS_BRIDGE[id={case.get('id')}, agency={out.get('agency')}]",
                url_status=url_status,
                wayback_replacements=wayback_replacements,
            ))

    # 3. CEE arbitrage — country trial-cost arbitrage
    for row in data.get("EU_CEE_ARBITRAGE", []):
        commit(*_build(
            raw_id=row.get("id", ""),
            src=row.get("src", ""),
            title=row.get("country", "") or row.get("id", ""),
            value=f"{row.get('country','')}: {row.get('costEdge','')}. {row.get('detail') or row.get('note','')}",
            period="",
            entity_name=row.get("country") or "European country",
            entity_type="other",
            predicate="ecosystem_event",
            country=row.get("country", "EU")[:2].upper() if row.get("country") else "EU",
            extra_tags=[
                "category:cee_arbitrage",
                f"source_tier:{row.get('tier','')}",
            ],
            extracted_from=f"euMarketReality.ts#EU_CEE_ARBITRAGE[id={row.get('id')}]",
            url_status=url_status,
            wayback_replacements=wayback_replacements,
        ))

    # 4. Pharma gravity
    for row in data.get("EU_PHARMA_GRAVITY", []):
        commit(*_build(
            raw_id=row.get("id", ""),
            src=row.get("src", ""),
            title=row.get("pharma") or row.get("title") or row.get("id", ""),
            value=row.get("detail") or row.get("body") or row.get("title", ""),
            period=str(row.get("year") or ""),
            entity_name=row.get("pharma") or "EU pharma",
            entity_type="pharma",
            predicate="partnered_with",
            country="EU",
            extra_tags=[
                "category:pharma_gravity",
                f"source_tier:{row.get('tier','')}",
            ],
            extracted_from=f"euMarketReality.ts#EU_PHARMA_GRAVITY[id={row.get('id')}]",
            url_status=url_status,
            wayback_replacements=wayback_replacements,
        ))

    # 5. Imaging consolidation — M&A in EU radiology AI
    for row in data.get("EU_IMAGING_CONSOLIDATION", []):
        target = row.get("target") or row.get("acquired") or ""
        acquirer = row.get("acquirer") or row.get("acquiredBy") or ""
        commit(*_build(
            raw_id=row.get("id", ""),
            src=row.get("src", ""),
            title=f"{target} -> {acquirer}",
            value=f"{target} acquired by {acquirer} in {row.get('year','')}. {row.get('detail') or row.get('note','')}",
            period=str(row.get("year") or ""),
            entity_name=target or "EU imaging vendor",
            entity_type="vendor",
            predicate="acquired_by",
            country=row.get("country", "EU"),
            extra_tags=[
                "category:imaging_consolidation",
                f"acquirer:{acquirer}",
                f"source_tier:{row.get('tier','')}",
            ],
            extracted_from=f"euMarketReality.ts#EU_IMAGING_CONSOLIDATION[id={row.get('id')}]",
            url_status=url_status,
            wayback_replacements=wayback_replacements,
        ))

    # 6. Founder frame (editorial) — keep but flagged
    for row in data.get("EU_FOUNDER_FRAME", []):
        commit(*_build(
            raw_id=row.get("id", ""),
            src=row.get("src", ""),
            title=row.get("title", "") or row.get("id", ""),
            value=row.get("body") or row.get("oneLiner", "") or row.get("title", ""),
            period="",
            entity_name="EU Healthcare AI Market",
            entity_type="other",
            predicate="ecosystem_event",
            country="EU",
            extra_tags=["category:founder_frame", "editorial:true"],
            extracted_from=f"euMarketReality.ts#EU_FOUNDER_FRAME[id={row.get('id')}]",
            url_status=url_status,
            wayback_replacements=wayback_replacements,
        ))

    # 7. Swiss profile
    for row in data.get("SWISS_PROFILE", []):
        commit(*_build(
            raw_id=row.get("id", ""),
            src=row.get("src", ""),
            title=row.get("title") or row.get("id", ""),
            value=row.get("body") or row.get("detail") or row.get("oneLiner", ""),
            period="",
            entity_name="Swiss Healthcare AI Market",
            entity_type="other",
            predicate="ecosystem_event",
            country="CH",
            extra_tags=[
                "category:swiss_profile",
                f"source_tier:{row.get('tier','')}",
            ],
            extracted_from=f"euMarketReality.ts#SWISS_PROFILE[id={row.get('id')}]",
            url_status=url_status,
            wayback_replacements=wayback_replacements,
        ))

    # 8. EU contrast (comparison rows)
    for row in data.get("EU_CONTRAST", []):
        commit(*_build(
            raw_id=row.get("id", ""),
            src=row.get("src", ""),
            title=row.get("metric", ""),
            value=f"EU={row.get('eu','')}; vs={row.get('comparison') or row.get('other','')}; ratio={row.get('ratio','')}. {row.get('note','')}",
            period="",
            entity_name="EU Healthcare AI Market",
            entity_type="other",
            predicate="ecosystem_event",
            country="EU",
            extra_tags=[
                "category:eu_contrast",
                f"source_tier:{row.get('tier','')}",
            ],
            extracted_from=f"euMarketReality.ts#EU_CONTRAST[id={row.get('id')}]",
            url_status=url_status,
            wayback_replacements=wayback_replacements,
        ))

    return entities, claims, sources, quarantine


def collect_urls(data: dict) -> set[str]:
    urls: set[str] = set()
    for arr_key in ("EU_REGULATORY_LAYERS", "EU_CEE_ARBITRAGE",
                    "EU_PHARMA_GRAVITY", "EU_IMAGING_CONSOLIDATION",
                    "EU_FOUNDER_FRAME", "SWISS_PROFILE", "EU_CONTRAST"):
        for item in data.get(arr_key, []):
            s = (item.get("src") or "").strip()
            if s:
                urls.add(s)
    # Alzheimer's bridge nests
    for case in data.get("EU_ALZHEIMERS_BRIDGE", []):
        for out in case.get("outcomes", []) or []:
            s = (out.get("src") or "").strip()
            if s:
                urls.add(s)
    return urls


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--skip-verify", action="store_true")
    ap.add_argument("--skip-wayback", action="store_true")
    args = ap.parse_args()

    print("Loading euMarketReality.ts ...")
    data = load_ts_module()
    for k in ("EU_REGULATORY_LAYERS", "EU_ALZHEIMERS_BRIDGE",
              "EU_CEE_ARBITRAGE", "EU_PHARMA_GRAVITY",
              "EU_IMAGING_CONSOLIDATION", "EU_FOUNDER_FRAME",
              "SWISS_PROFILE", "EU_CONTRAST"):
        print(f"  {k:30s} {len(data.get(k, []))}")

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
    write_entities(OUT_DIR / "entities_eu.csv", entities.values())
    write_claims(OUT_DIR / "claims_eu.csv", claims)
    write_sources(OUT_DIR / "sources_eu.csv", sources.values())
    write_quarantine(OUT_DIR / "quarantine_eu.csv", quarantine)
    print(f"\nWrote CSVs to {OUT_DIR}/*_eu.csv")
    return 0


if __name__ == "__main__":
    sys.exit(main())
