"""Extract Oncology AI map from the *frontend draft* into zerotrust CSVs.

The frontend file `frontend/src/data/oncology.ts` is **draft content** —
hand-curated claims, mostly with src URLs but never independently verified.
This extractor:

  1. Loads ONCO_BUBBLES / ONCO_RELIABILITY / ONCO_PHARMA via Node's native
     TS support (`dump_ts_module.mjs`).
  2. For every record:
       a. Schema check — non-empty src URL?
       b. URL-alive check — HEAD request returns 200/301/302?
       c. Domain classification → confidence tier (high/medium/low).
  3. Records that pass land in entities/claims/sources. Records that fail
     land in quarantine.csv with a `reason` field.

This is *Phase 1* verification — fast (HEAD only), no semantic check that
the source content actually supports the claim. Phase 2 LLM-based
content matching is a separate pass.

Confidence tier from domain (canonical scale `high|medium|low`):
  high   – arxiv, nature, *.gov, *.gov.uk, *.gc.ca, *.europa.eu, *.who.int,
           sec.gov filings, nih.gov / pmc.ncbi.nlm.nih.gov, jamanetwork.com,
           nejm.org, official corporate IR (investors.X / ir.X subdomains),
           businesswire.com (named press release distribution)
  medium – reuters, bloomberg, ft.com, wsj.com, techcrunch.com, axios,
           fiercehealthcare.com, modernpathology.org (peer review),
           prnewswire.com, named-company .com domains (vendor blog posts)
  low    – sacra.com, theinformation.com, crunchbase.com (analyst /
           aggregator), unknown blogs, dennisgong.com, etc.

Run:
  python -m scripts.zerotrust.extract_oncology              # verify only (no write)
  python -m scripts.zerotrust.extract_oncology --write      # write CSVs to zerotrust/
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
TS_FILE = REPO_ROOT / "frontend" / "src" / "data" / "oncology.ts"
DUMPER = REPO_ROOT / "scripts" / "zerotrust" / "dump_ts_module.mjs"
OUT_DIR = Path(r"C:\Projects\data\aiatls\zerotrust")
DOMAIN_TAG = "oncology"

# Local alias kept so the existing extract_bubbles call sites read naturally.
_downgrade = downgrade


# ── TS module load ──────────────────────────────────────────────────────────

def load_ts_module() -> dict:
    if not DUMPER.exists():
        raise FileNotFoundError(f"Dumper missing: {DUMPER}")
    proc = subprocess.run(
        ["node", "--experimental-strip-types", str(DUMPER), str(TS_FILE)],
        capture_output=True, text=True, encoding='utf-8', check=False,
    )
    if proc.returncode != 0:
        sys.stderr.write(proc.stderr)
        raise RuntimeError(f"TS dump failed: rc={proc.returncode}")
    return json.loads(proc.stdout)


# ── predicate mapping ───────────────────────────────────────────────────────

# OncoBubble.et -> (predicate, value_kind, value_source)
#   value_source: 'a' = bubble.a (millions $); 'p' = product name; 'year' = bubble.d year
ET_TO_PREDICATE = {
    "Founding":               ("founded_in_year",         "year"),
    "Funding_Round":          ("funding_amount_usd_m",    "a"),
    "Strategic_Investment":   ("funding_amount_usd_m",    "a"),
    "IPO":                    ("ipo_proceeds_usd_m",      "a"),
    "Acquisition":            ("ma_value_usd_m",          "a"),
    "Product_Launch":         ("released_product",        "p"),
    "Partnership":            ("ecosystem_event",         "desc"),  # no entity-ref target available
    "Event":                  ("ecosystem_event",         "desc"),
    "FDA_Cleared":            ("fda_clearance",           "r"),
    "Clinical_Trial_Result":  ("clinical_trial_result",   "desc"),
    "Regulatory":             ("regulatory_event",        "desc"),
}


def fractional_year_to_period(d: float) -> str:
    """ONCO bubbles encode dates as float years like 2021.25 (Q1). Return ISO-ish."""
    year = int(d)
    frac = d - year
    if frac == 0:
        return str(year)
    month = max(1, min(12, int(round(frac * 12)) + 1))
    return f"{year}-{month:02d}"


# ── main extract ────────────────────────────────────────────────────────────

def extract_bubbles(
    data: dict,
    url_status: dict[str, tuple[bool, str | int]],
    wayback_replacements: dict[str, str] | None = None,
):
    wayback_replacements = wayback_replacements or {}
    entities: dict[str, Entity] = {}
    claims: list[Claim] = []
    sources: dict[str, Source] = {}
    quarantine: list[QuarantineRow] = []

    for bubble in data.get("ONCO_BUBBLES", []):
        company = (bubble.get("c") or "").strip()
        product = (bubble.get("p") or "").strip()
        src = (bubble.get("src") or "").strip()
        et = (bubble.get("et") or "").strip()

        if not company:
            quarantine.append(QuarantineRow(
                reason="missing_entity_name",
                extracted_from=f"oncology.ts#ONCO_BUBBLES[et={et}]",
                raw=json.dumps(bubble, ensure_ascii=False),
            ))
            continue

        if not src:
            quarantine.append(QuarantineRow(
                reason="missing_source_url",
                extracted_from=f"oncology.ts#ONCO_BUBBLES[c={company}, et={et}]",
                raw=json.dumps(bubble, ensure_ascii=False),
            ))
            continue

        alive, status = url_status.get(src, (False, "unchecked"))
        if not alive:
            quarantine.append(QuarantineRow(
                reason=f"dead_url:{status}",
                extracted_from=f"oncology.ts#ONCO_BUBBLES[c={company}, et={et}]",
                raw=json.dumps({"src": src, **bubble}, ensure_ascii=False),
            ))
            continue

        # If the URL was salvaged via Wayback, use the snapshot URL as the
        # canonical source URL but keep the original in url_raw. Domain-based
        # confidence is downgraded by one tier because the snapshot is a
        # second-hand artefact (Internet Archive doesn't add evidence weight
        # to the original).
        wayback_url = wayback_replacements.get(src)
        eff_url = wayback_url or src
        confidence, source_type = classify_confidence(src)  # always score original domain
        if wayback_url:
            confidence = _downgrade(confidence)
        sid = source_id_for(eff_url)
        if sid not in sources:
            sources[sid] = Source(
                source_id=sid,
                url=canonical_url(eff_url),
                url_raw=src,
                source_type=source_type,
                retrieved_at=today(),
            )

        # Entity (company)
        eid = entity_id_for(company)
        if eid not in entities:
            entities[eid] = Entity(
                entity_id=eid,
                name=company,
                type="vendor",  # most are vendors; pharma majors classified below
                domain_tags=DOMAIN_TAG,
            )
        # Pharma majors override type
        if company in {"Roche", "AstraZeneca", "Novartis", "Pfizer", "Merck",
                       "BMS", "Sanofi", "Eli Lilly", "J&J/Janssen", "GSK", "Amgen"}:
            entities[eid].type = "pharma"

        # Predicate + value
        mapping = ET_TO_PREDICATE.get(et)
        if not mapping:
            quarantine.append(QuarantineRow(
                reason=f"unmapped_event_type:{et}",
                extracted_from=f"oncology.ts#ONCO_BUBBLES[c={company}]",
                raw=json.dumps(bubble, ensure_ascii=False),
            ))
            continue

        predicate, value_src_key = mapping
        if value_src_key == "year":
            value = str(int(bubble.get("d", 0)))
            value_unit = "year"
        elif value_src_key == "a":
            a = bubble.get("a") or 0
            if not a:
                # Funding/IPO with no amount → keep but as text claim
                value = bubble.get("desc", "")
                value_unit = ""
                predicate = "ecosystem_event"
            else:
                value = str(a)
                value_unit = "usd_m"
        elif value_src_key == "p":
            value = product
            value_unit = ""
        elif value_src_key == "r":
            value = bubble.get("r", "")
            value_unit = ""
        else:  # desc
            value = bubble.get("desc", "")
            value_unit = ""

        period = fractional_year_to_period(bubble.get("d", 0))

        cid = claim_id_for(eid, predicate, period, value)
        # Build tags
        tags = []
        if product:
            tags.append(f"product:{product}")
        if bubble.get("tm"):
            tags.append(f"tumor:{bubble['tm']}")
        if bubble.get("dp"):
            tags.append(f"decision_point:{bubble['dp']}")
        if bubble.get("e") and bubble["e"] not in ("N/A", ""):
            tags.append(f"evidence:{bubble['e']}")
        if bubble.get("r") and bubble["r"] not in ("none", "N/A", ""):
            tags.append(f"regulatory:{bubble['r']}")
        if wayback_url:
            tags.append("wayback_archived")
        tags.append(f"entity:{eid}")

        claims.append(Claim(
            claim_id=cid,
            entity_id=eid,
            predicate=predicate,
            value=value,
            value_unit=value_unit,
            period=period,
            confidence=confidence,
            source_ids=sid,
            domain_tags=DOMAIN_TAG,
            tags=",".join(tags),
            notes=bubble.get("desc", "") or "",
            extracted_from=f"oncology.ts#ONCO_BUBBLES[c={company}, et={et}, d={bubble.get('d')}]",
            extracted_at=today(),
        ))

    return entities, claims, sources, quarantine


def extract_reliability(data: dict, url_status, wayback_replacements=None):
    """Reliability warnings → claims about pathology AI products as a group."""
    wayback_replacements = wayback_replacements or {}
    claims = []
    quarantine = []
    sources = {}
    entities = {}

    for item in data.get("ONCO_RELIABILITY", []):
        c = (item.get("c") or "").strip()
        desc = (item.get("d") or "").strip()
        src = (item.get("src") or "").strip()
        if not c or not desc:
            continue
        if not src:
            quarantine.append(QuarantineRow(
                reason="missing_source_url",
                extracted_from=f"oncology.ts#ONCO_RELIABILITY[c={c}]",
                raw=json.dumps(item, ensure_ascii=False),
            ))
            continue
        alive, status = url_status.get(src, (False, "unchecked"))
        if not alive:
            quarantine.append(QuarantineRow(
                reason=f"dead_url:{status}",
                extracted_from=f"oncology.ts#ONCO_RELIABILITY[c={c}]",
                raw=json.dumps({"src": src, **item}, ensure_ascii=False),
            ))
            continue

        wayback_url = wayback_replacements.get(src)
        eff_url = wayback_url or src
        confidence, source_type = classify_confidence(src)
        if wayback_url:
            confidence = _downgrade(confidence)
        sid = source_id_for(eff_url)
        if sid not in sources:
            sources[sid] = Source(
                source_id=sid, url=canonical_url(eff_url), url_raw=src,
                source_type=source_type, retrieved_at=today(),
            )
        eid = entity_id_for(c)
        if eid not in entities:
            entities[eid] = Entity(
                entity_id=eid, name=c, type="other",
                domain_tags=f"{DOMAIN_TAG},reliability",
            )
        cid = claim_id_for(eid, "ecosystem_event", "", desc[:64])
        tags = [
            "category:reliability_warning",
            f"product:{item.get('p','')}",
            f"entity:{eid}",
        ]
        if wayback_url:
            tags.append("wayback_archived")
        claims.append(Claim(
            claim_id=cid, entity_id=eid, predicate="ecosystem_event",
            value=desc, confidence=confidence, source_ids=sid,
            domain_tags=f"{DOMAIN_TAG},reliability",
            tags=",".join(tags),
            notes=desc,
            extracted_from=f"oncology.ts#ONCO_RELIABILITY[c={c}]",
            extracted_at=today(),
        ))

    return entities, claims, sources, quarantine


def merge_dicts(*dicts):
    out = {}
    for d in dicts:
        for k, v in d.items():
            out.setdefault(k, v)
    return out


def collect_all_urls(data: dict) -> set[str]:
    """All distinct src URLs across the file — to verify in one pass."""
    urls: set[str] = set()
    for b in data.get("ONCO_BUBBLES", []):
        s = (b.get("src") or "").strip()
        if s:
            urls.add(s)
    for r in data.get("ONCO_RELIABILITY", []):
        s = (r.get("src") or "").strip()
        if s:
            urls.add(s)
    for cell_list in data.get("ONCO_PHARMA", {}).values():
        for cell in cell_list or []:
            s = (cell.get("src") or "").strip()
            if s:
                urls.add(s)
    return urls


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--write", action="store_true", help="write CSVs to zerotrust/")
    ap.add_argument("--skip-verify", action="store_true", help="assume all URLs alive (faster, no HEAD)")
    ap.add_argument("--skip-wayback", action="store_true", help="don't try Wayback Machine for dead URLs")
    args = ap.parse_args()

    print(f"Loading {TS_FILE}...")
    data = load_ts_module()
    n_bubbles = len(data.get("ONCO_BUBBLES", []))
    n_reliability = len(data.get("ONCO_RELIABILITY", []))
    n_pharma = sum(len(v or []) for v in data.get("ONCO_PHARMA", {}).values())
    print(f"  bubbles={n_bubbles}  reliability={n_reliability}  pharma_cells={n_pharma}")

    urls = collect_all_urls(data)
    print(f"\nVerifying {len(urls)} distinct URLs ...")
    wayback_replacements: dict[str, str] = {}
    if args.skip_verify:
        url_status = {u: (True, "skipped") for u in urls}
    else:
        t0 = time.time()
        url_status = verify_urls(urls)
        dt = time.time() - t0
        alive = sum(1 for v in url_status.values() if v[0])
        dead = len(url_status) - alive
        print(f"  done in {dt:.1f}s — alive={alive} dead={dead}")

        # Wayback Machine fallback for the dead URLs
        if not args.skip_wayback and dead:
            wayback_replacements = salvage_via_wayback(url_status)

    print("\nExtracting...")
    e1, c1, s1, q1 = extract_bubbles(data, url_status, wayback_replacements)
    e2, c2, s2, q2 = extract_reliability(data, url_status, wayback_replacements)

    entities = merge_dicts(e1, e2)
    claims = c1 + c2
    sources = merge_dicts(s1, s2)
    quarantine = q1 + q2

    # Summary
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

    # Confidence histogram
    if claims:
        from collections import Counter
        confs = Counter(c.confidence for c in claims)
        print(f"\n  confidence:")
        for c, n in confs.most_common():
            print(f"    {c:8s} {n}")

    if not args.write:
        print("\n(dry-run; pass --write to emit CSVs to zerotrust/)")
        return 0

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    write_entities(OUT_DIR / "entities_oncology.csv", entities.values())
    write_claims(OUT_DIR / "claims_oncology.csv", claims)
    write_sources(OUT_DIR / "sources_oncology.csv", sources.values())
    write_quarantine(OUT_DIR / "quarantine_oncology.csv", quarantine)
    print(f"\nWrote CSVs to {OUT_DIR}/*_oncology.csv")
    return 0


if __name__ == "__main__":
    sys.exit(main())
