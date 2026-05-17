"""Extract US Healthcare Timeline from frontend draft into zerotrust CSVs.

Source: frontend/src/data/usHealthcareTimeline.ts (US_TIMELINE: USEvent[])

Each USEvent is a historical fact about the US healthcare-AI decision
chain (FDA, AMA, CMS, payers). Records are mapped to one of three
predicates depending on `type`:

  type=law / agency       -> ecosystem_event   (legislation / agency
                                                creation)
  type=approval / code    -> fda_clearance     (with the FDA / CPT code)
  type=guidance / pricing -> regulatory_event
  type=crisis             -> ecosystem_event
  type=withdrawal         -> regulatory_event

Entity is detected from the event title by keyword (FDA, CMS, AMA,
Congress, NIH, …). If no match, falls back to `us-healthcare-system`
(a generic entity).
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
TS_FILE = REPO_ROOT / "frontend" / "src" / "data" / "usHealthcareTimeline.ts"
DUMPER = REPO_ROOT / "scripts" / "zerotrust" / "dump_ts_module.mjs"
OUT_DIR = Path(r"C:\Projects\data\aiatls\zerotrust")
DOMAIN_TAG = "us_healthcare_timeline"


def load_ts_module() -> dict:
    proc = subprocess.run(
        ["node", "--experimental-strip-types", str(DUMPER), str(TS_FILE)],
        capture_output=True, text=True, check=False,
    )
    if proc.returncode != 0:
        sys.stderr.write(proc.stderr)
        raise RuntimeError(f"TS dump failed: rc={proc.returncode}")
    return json.loads(proc.stdout)


# event.type → predicate (canonical)
TYPE_TO_PREDICATE = {
    "law":        "ecosystem_event",
    "agency":     "ecosystem_event",
    "approval":   "fda_clearance",
    "code":       "regulatory_event",
    "guidance":   "regulatory_event",
    "pricing":    "regulatory_event",
    "crisis":     "ecosystem_event",
    "withdrawal": "regulatory_event",
}

# Title keyword → entity (case-insensitive substring match). Order matters
# (first hit wins). Falls back to `us-healthcare-system` if nothing matches.
ENTITY_KEYWORDS = [
    (re.compile(r"\bFDA\b", re.I),                "FDA"),
    (re.compile(r"\bCMS\b", re.I),                "CMS"),
    (re.compile(r"\bAMA\b|\bCPT\b", re.I),        "AMA"),
    (re.compile(r"\bNIH\b", re.I),                "NIH"),
    (re.compile(r"\bONC\b", re.I),                "ONC"),
    (re.compile(r"\bCongress\b", re.I),           "US Congress"),
    (re.compile(r"\bHHS\b", re.I),                "HHS"),
    (re.compile(r"\bMedicare\b", re.I),           "Medicare"),
    (re.compile(r"\bMedicaid\b", re.I),           "Medicaid"),
    (re.compile(r"\bHIPAA\b", re.I),              "HHS"),  # HIPAA = HHS rulemaking
    (re.compile(r"\bACA\b|Affordable Care", re.I), "US Congress"),
    (re.compile(r"\bHITECH\b", re.I),             "US Congress"),
    (re.compile(r"\bMACRA\b", re.I),              "US Congress"),
    (re.compile(r"\bCDC\b", re.I),                "CDC"),
    (re.compile(r"\bFTC\b", re.I),                "FTC"),
    (re.compile(r"\bIDx-DR\b", re.I),             "IDx Technologies"),
    (re.compile(r"\bAduhelm\b|Biogen", re.I),     "Biogen"),
    (re.compile(r"\bWatson Health\b", re.I),      "IBM"),
]

# Entity type lookup for the agencies we created above.
ENTITY_TYPES = {
    "FDA": "regulator", "CMS": "regulator", "AMA": "regulator",
    "NIH": "government", "ONC": "government", "HHS": "government",
    "CDC": "government", "FTC": "government",
    "US Congress": "government", "Medicare": "government",
    "Medicaid": "government",
    "IDx Technologies": "vendor", "Biogen": "vendor", "IBM": "vendor",
}


def pick_entity(event: dict) -> tuple[str, str]:
    title = event.get("title", "") or ""
    for pat, name in ENTITY_KEYWORDS:
        if pat.search(title):
            return name, ENTITY_TYPES.get(name, "other")
    return "US Healthcare System", "other"


def extract_timeline(data, url_status, wayback_replacements=None):
    wayback_replacements = wayback_replacements or {}
    entities: dict[str, Entity] = {}
    claims: list[Claim] = []
    sources: dict[str, Source] = {}
    quarantine: list[QuarantineRow] = []

    for ev in data.get("US_TIMELINE", []):
        src = (ev.get("src") or "").strip()
        title = (ev.get("title") or "").strip()
        if not title:
            continue
        if not src:
            quarantine.append(QuarantineRow(
                reason="missing_source_url",
                extracted_from=f"usHealthcareTimeline.ts#US_TIMELINE[id={ev.get('id')}]",
                raw=json.dumps(ev, ensure_ascii=False),
            ))
            continue
        alive, status = url_status.get(src, (False, "unchecked"))
        if not alive:
            quarantine.append(QuarantineRow(
                reason=f"dead_url:{status}",
                extracted_from=f"usHealthcareTimeline.ts#US_TIMELINE[id={ev.get('id')}]",
                raw=json.dumps({"src": src, **ev}, ensure_ascii=False),
            ))
            continue

        wb_url = wayback_replacements.get(src)
        eff_url = wb_url or src
        confidence, source_type = classify_confidence(src)
        if wb_url:
            confidence = downgrade(confidence)

        sid = source_id_for(eff_url)
        if sid not in sources:
            sources[sid] = Source(
                source_id=sid, url=canonical_url(eff_url), url_raw=src,
                source_type=source_type, retrieved_at=today(),
                title=title[:200],
            )

        entity_name, entity_type = pick_entity(ev)
        eid = entity_id_for(entity_name)
        if eid not in entities:
            entities[eid] = Entity(
                entity_id=eid, name=entity_name, type=entity_type,
                country="US", domain_tags=DOMAIN_TAG,
            )

        ev_type = (ev.get("type") or "").strip()
        predicate = TYPE_TO_PREDICATE.get(ev_type, "ecosystem_event")

        # Build value: title + brief why; full detail kept in tags excerpt.
        value = f"{title} — {ev.get('why', '')}"[:500]

        period = ev.get("date") or str(ev.get("year") or "")
        cid = claim_id_for(eid, predicate, period, title[:64])

        tags = [
            f"era:{ev.get('era', '')}",
            f"type:{ev_type}",
            f"event_id:{ev.get('id', '')}",
            f"entity:{eid}",
        ]
        if wb_url:
            tags.append("wayback_archived")

        claims.append(Claim(
            claim_id=cid, entity_id=eid, predicate=predicate,
            value=value, value_unit="", period=period,
            jurisdiction="US", confidence=confidence,
            source_ids=sid, domain_tags=DOMAIN_TAG,
            tags=",".join(tags),
            extracted_from=f"usHealthcareTimeline.ts#US_TIMELINE[id={ev.get('id')}]",
            extracted_at=today(),
        ))

    return entities, claims, sources, quarantine


def collect_all_urls(data: dict) -> set[str]:
    urls: set[str] = set()
    for ev in data.get("US_TIMELINE", []):
        s = (ev.get("src") or "").strip()
        if s:
            urls.add(s)
    return urls


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--skip-verify", action="store_true")
    ap.add_argument("--skip-wayback", action="store_true")
    args = ap.parse_args()

    print(f"Loading {TS_FILE.name}...")
    data = load_ts_module()
    n_events = len(data.get("US_TIMELINE", []))
    print(f"  events: {n_events}")

    urls = collect_all_urls(data)
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
    entities, claims, sources, quarantine = extract_timeline(
        data, url_status, wayback_replacements
    )

    print(f"\nResults:")
    print(f"  entities:   {len(entities)}")
    print(f"  claims:     {len(claims)}")
    print(f"  sources:    {len(sources)}")
    print(f"  quarantine: {len(quarantine)}")
    if quarantine:
        from collections import Counter
        reasons = Counter(q.reason.split(":")[0] for q in quarantine)
        for r, n in reasons.most_common():
            print(f"    {r:25s} {n}")
    if claims:
        from collections import Counter
        confs = Counter(c.confidence for c in claims)
        print(f"  confidence:")
        for c, n in confs.most_common():
            print(f"    {c:8s} {n}")

    if not args.write:
        print("\n(dry-run; pass --write to emit CSVs)")
        return 0

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    write_entities(OUT_DIR / "entities_us_timeline.csv", entities.values())
    write_claims(OUT_DIR / "claims_us_timeline.csv", claims)
    write_sources(OUT_DIR / "sources_us_timeline.csv", sources.values())
    write_quarantine(OUT_DIR / "quarantine_us_timeline.csv", quarantine)
    print(f"\nWrote CSVs to {OUT_DIR}/*_us_timeline.csv")
    return 0


if __name__ == "__main__":
    sys.exit(main())
