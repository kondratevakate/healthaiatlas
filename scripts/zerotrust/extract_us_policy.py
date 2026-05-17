"""Extract US policy & decision-stack data from frontend drafts.

Covers two files at once because both describe the US healthcare-AI
operating environment at a similar grain:

  frontend/src/data/usPolicyHorizons.ts  — federal missions (CMS Account-
       able Care 2030, FDA AI Action Plan, ARPA-H, etc.). Each row is a
       PolicyHorizon with owner + targetYear + src.

  frontend/src/data/usDecisionStack.ts   — four arrays:
       US_ACTORS         (FDA/AMA/CMS/payers/pharma — veto-power table)
       US_DRUG_PRICES    (Aduhelm, GLP-1, etc.)
       US_VSL            (Value-of-Statistical-Life policy anchors)
       US_ROADMAP        (near-term policy roadmap items)

Mapping rules:
  PolicyHorizon  -> entity=owner, predicate=ecosystem_event, period=targetYear
  DecisionActor  -> entity=name, predicate=ecosystem_event (veto role)
  DrugPricing    -> entity=drug/sponsor, predicate=ecosystem_event
  VSLAnchor      -> entity=agency, predicate=ecosystem_event
  RoadmapItem    -> entity=owner, predicate=ecosystem_event
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
HORIZONS_TS = REPO_ROOT / "frontend" / "src" / "data" / "usPolicyHorizons.ts"
STACK_TS = REPO_ROOT / "frontend" / "src" / "data" / "usDecisionStack.ts"
DUMPER = REPO_ROOT / "scripts" / "zerotrust" / "dump_ts_module.mjs"
OUT_DIR = Path(r"C:\Projects\data\aiatls\zerotrust")
DOMAIN_TAG = "us_policy"


def load_ts_module(path: Path) -> dict:
    proc = subprocess.run(
        ["node", "--experimental-strip-types", str(DUMPER), str(path)],
        capture_output=True, text=True, encoding='utf-8', check=False,
    )
    if proc.returncode != 0:
        sys.stderr.write(proc.stderr)
        raise RuntimeError(f"TS dump failed for {path}: rc={proc.returncode}")
    return json.loads(proc.stdout)


# ── Owner → canonical entity (regulators, agencies, etc.)

OWNER_ENTITY_TYPE = {
    "HHS": "government", "CMS": "regulator", "CMS / FDA": "regulator",
    "ONC / ASTP": "government", "FDA": "regulator", "NIH": "government",
    "White House": "government",
    "ARPA-H": "government", "ARPA": "government",
    "AMA": "regulator",
}


def _build_record(
    raw_id: str, src: str, title: str, value: str, period: str,
    entity_name: str, extra_tags: list[str],
    url_status: dict, wayback_replacements: dict,
    extracted_from: str,
):
    """Common path: emit (entity, claim, source) or a QuarantineRow."""
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
    etype = OWNER_ENTITY_TYPE.get(entity_name, "other")
    entity = Entity(
        entity_id=eid, name=entity_name, type=etype,
        country="US", domain_tags=DOMAIN_TAG,
    )

    sid = source_id_for(eff_url)
    source = Source(
        source_id=sid, url=canonical_url(eff_url), url_raw=src,
        source_type=source_type, retrieved_at=today(),
        title=title[:200],
    )

    cid = claim_id_for(eid, "ecosystem_event", period, title[:64])
    tags = [f"entity:{eid}"] + extra_tags
    if wb_url:
        tags.append("wayback_archived")
    claim = Claim(
        claim_id=cid, entity_id=eid, predicate="ecosystem_event",
        value=value[:500], period=period, jurisdiction="US",
        confidence=confidence, source_ids=sid, domain_tags=DOMAIN_TAG,
        tags=",".join(tags),
        extracted_from=extracted_from,
        extracted_at=today(),
    )
    return entity, claim, source, None


def extract_horizons(data, url_status, wayback):
    entities, claims, sources, quarantine = {}, [], {}, []
    for h in data.get("US_POLICY_HORIZONS", []):
        owner = h.get("owner", "") or "US Government"
        e, c, s, q = _build_record(
            raw_id=h.get("id", ""),
            src=h.get("src", ""),
            title=h.get("title", ""),
            value=f"{h.get('title','')} — {h.get('oneLiner','')}",
            period=str(h.get("targetYear", "")),
            entity_name=owner,
            extra_tags=[f"horizon:{h.get('id','')}", f"target_year:{h.get('targetYear','')}"],
            url_status=url_status, wayback_replacements=wayback,
            extracted_from=f"usPolicyHorizons.ts#US_POLICY_HORIZONS[id={h.get('id')}]",
        )
        if q:
            quarantine.append(q)
        else:
            entities.setdefault(e.entity_id, e)
            sources.setdefault(s.source_id, s)
            claims.append(c)
    return entities, claims, sources, quarantine


def extract_stack(data, url_status, wayback):
    entities, claims, sources, quarantine = {}, [], {}, []

    for actor in data.get("US_ACTORS", []):
        e, c, s, q = _build_record(
            raw_id=actor.get("id", ""),
            src=actor.get("src", ""),
            title=actor.get("name", ""),
            value=f"{actor.get('expanded','')} — {actor.get('role','')}; veto: {actor.get('vetoPower','')}",
            period="",
            entity_name=actor.get("name") or "US Healthcare System",
            extra_tags=["category:decision_actor",
                        f"cadence:{actor.get('cadence', '')[:60]}"],
            url_status=url_status, wayback_replacements=wayback,
            extracted_from=f"usDecisionStack.ts#US_ACTORS[id={actor.get('id')}]",
        )
        if q:
            quarantine.append(q)
        else:
            entities.setdefault(e.entity_id, e)
            sources.setdefault(s.source_id, s)
            claims.append(c)

    for px in data.get("US_DRUG_PRICES", []):
        e, c, s, q = _build_record(
            raw_id=px.get("id", ""),
            src=px.get("src", ""),
            title=px.get("drug") or px.get("title") or "drug-pricing",
            value=json.dumps(px, ensure_ascii=False)[:500],
            period=str(px.get("year") or px.get("period") or ""),
            entity_name=px.get("sponsor") or px.get("drug") or "US Pharma",
            extra_tags=["category:drug_pricing"],
            url_status=url_status, wayback_replacements=wayback,
            extracted_from=f"usDecisionStack.ts#US_DRUG_PRICES[id={px.get('id')}]",
        )
        if q:
            quarantine.append(q)
        else:
            entities.setdefault(e.entity_id, e)
            sources.setdefault(s.source_id, s)
            claims.append(c)

    for v in data.get("US_VSL", []):
        e, c, s, q = _build_record(
            raw_id=v.get("id", ""),
            src=v.get("src", ""),
            title=v.get("agency") or "VSL anchor",
            value=json.dumps(v, ensure_ascii=False)[:500],
            period=str(v.get("year") or ""),
            entity_name=v.get("agency") or "US Government",
            extra_tags=["category:vsl_anchor"],
            url_status=url_status, wayback_replacements=wayback,
            extracted_from=f"usDecisionStack.ts#US_VSL[id={v.get('id')}]",
        )
        if q:
            quarantine.append(q)
        else:
            entities.setdefault(e.entity_id, e)
            sources.setdefault(s.source_id, s)
            claims.append(c)

    for r in data.get("US_ROADMAP", []):
        e, c, s, q = _build_record(
            raw_id=r.get("id", ""),
            src=r.get("src", ""),
            title=r.get("title", ""),
            value=f"{r.get('title','')} — {r.get('detail') or r.get('oneLiner','')}",
            period=str(r.get("year") or r.get("targetYear") or ""),
            entity_name=r.get("owner") or "US Government",
            extra_tags=["category:roadmap"],
            url_status=url_status, wayback_replacements=wayback,
            extracted_from=f"usDecisionStack.ts#US_ROADMAP[id={r.get('id')}]",
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
    for arr_key in ("US_POLICY_HORIZONS", "US_ACTORS", "US_DRUG_PRICES",
                    "US_VSL", "US_ROADMAP"):
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

    print("Loading usPolicyHorizons.ts + usDecisionStack.ts ...")
    horizons = load_ts_module(HORIZONS_TS)
    stack = load_ts_module(STACK_TS)
    merged = {**horizons, **stack}
    print(f"  horizons: {len(horizons.get('US_POLICY_HORIZONS', []))}")
    print(f"  actors:   {len(stack.get('US_ACTORS', []))}")
    print(f"  prices:   {len(stack.get('US_DRUG_PRICES', []))}")
    print(f"  vsl:      {len(stack.get('US_VSL', []))}")
    print(f"  roadmap:  {len(stack.get('US_ROADMAP', []))}")

    urls = collect_urls(merged)
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
    e1, c1, s1, q1 = extract_horizons(horizons, url_status, wayback_replacements)
    e2, c2, s2, q2 = extract_stack(stack, url_status, wayback_replacements)
    entities = {**e1, **e2}
    claims = c1 + c2
    sources = {**s1, **s2}
    quarantine = q1 + q2

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
        print("\n(dry-run; pass --write)")
        return 0

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    write_entities(OUT_DIR / "entities_us_policy.csv", entities.values())
    write_claims(OUT_DIR / "claims_us_policy.csv", claims)
    write_sources(OUT_DIR / "sources_us_policy.csv", sources.values())
    write_quarantine(OUT_DIR / "quarantine_us_policy.csv", quarantine)
    print(f"\nWrote CSVs to {OUT_DIR}/*_us_policy.csv")
    return 0


if __name__ == "__main__":
    sys.exit(main())
