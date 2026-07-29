"""Regenerate frontend/src/data/oncology.ts from the canonical store.

Closes the round-trip loop for the oncology hub:

  oncology.ts (draft)
        |
        v  scripts.zerotrust.extract_oncology
        |
        v
   entities_oncology.csv + claims_oncology.csv + sources_oncology.csv
        |
        v  scripts.zerotrust.to_airtable
        |
        v  Airtable (canonical)
        |
        v  scripts.zerotrust.from_airtable --domain oncology
        |
        v
   from_airtable/oncology.json
        |
        v  scripts.zerotrust.regen_oncology       <-- THIS FILE
        |
        v
   frontend/src/data/oncology.ts (auto-generated, authoritative)

In this iteration the regenerator reads the *CSV intermediate* directly
because the oncology domain hasn't been uploaded to Airtable yet. The
input shape (entity / claim / source) is identical to the Airtable view,
so swapping to the JSON snapshot is one line of code.

Lossiness: the round-trip is partial. Original OncoBubble.desc was a
free-text narrative that doesn't fit a single canonical predicate cleanly.
We approximate it from claim.value (when the predicate is ecosystem_event)
or by joining tag fields. Fields that survive cleanly:
  c   = entity.name
  p   = tag `product:...`
  dp  = tag `decision_point:...`
  d   = claim.period → float year
  a   = claim.value (when value_unit == usd_m)
  tm  = tag `tumor:...`
  e   = tag `evidence:...`
  r   = tag `regulatory:...`
  et  = reverse-predicate map
  src = source.url
  desc = claim.value (for text predicates) — LOSSY for numeric events

This script does NOT replace the existing oncology.ts. It writes
`oncology.regenerated.ts` alongside so a human can diff before adoption.
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
# Override with ZEROTRUST_DATA_DIR so this runs on any contributor's machine,
# not just the maintainer's local disk. Default preserves the legacy path.
CSV_DIR = Path(os.environ.get("ZEROTRUST_DATA_DIR") or r"C:\Projects\data\aiatls\zerotrust")
OUT_TS = REPO_ROOT / "frontend" / "src" / "data" / "oncology.regenerated.ts"


# Reverse of ET_TO_PREDICATE in extract_oncology.py.
# Most predicates map back unambiguously; partner/event/regulatory share
# `ecosystem_event`/`regulatory_event` so we re-disambiguate via tags.
PREDICATE_TO_ET = {
    "founded_in_year":       "Founding",
    "funding_amount_usd_m":  "Funding_Round",  # could also be Strategic_Investment
    "ipo_proceeds_usd_m":    "IPO",
    "ma_value_usd_m":        "Acquisition",
    "released_product":      "Product_Launch",
    "fda_clearance":         "FDA_Cleared",
    "clinical_trial_result": "Clinical_Trial_Result",
    "regulatory_event":      "Regulatory",
    "ecosystem_event":       "Event",  # default for catch-all
}


def parse_tag(tags_csv: str, key: str) -> str:
    """Tags are stored as 'k1:v1,k2:v2'. Return v for matching k, or empty."""
    for raw in tags_csv.split(","):
        raw = raw.strip()
        if raw.startswith(f"{key}:"):
            return raw[len(key) + 1:].strip()
    return ""


def period_to_float_year(period: str) -> float:
    """ISO 'YYYY-MM' or 'YYYY' → float year (e.g. 2021.42 for May 2021)."""
    period = (period or "").strip()
    if not period:
        return 0.0
    m = re.match(r"^(\d{4})(?:-(\d{2}))?", period)
    if not m:
        return 0.0
    year = int(m.group(1))
    if not m.group(2):
        return float(year)
    month = int(m.group(2))
    return year + (month - 1) / 12.0


def load_csv(name: str) -> list[dict]:
    p = CSV_DIR / name
    if not p.exists():
        print(f"ERROR: {p} not found — run extract_oncology --write first.", file=sys.stderr)
        sys.exit(2)
    with open(p, encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def regen() -> str:
    entities = {e["entity_id"]: e for e in load_csv("entities_oncology.csv")}
    claims = load_csv("claims_oncology.csv")
    sources = {s["source_id"]: s for s in load_csv("sources_oncology.csv")}

    bubbles: list[dict] = []
    for c in claims:
        # Skip reliability claims — they're a separate array in oncology.ts
        if "reliability" in (c.get("domain_tags") or ""):
            continue

        eid = c["entity_id"]
        ent = entities.get(eid)
        if not ent:
            continue

        # Resolve source URL (first one if multiple)
        sid = (c.get("source_ids") or "").split(",")[0].strip()
        src = sources.get(sid, {}).get("url", "")

        tags = c.get("tags") or ""
        predicate = c.get("predicate") or ""
        et = PREDICATE_TO_ET.get(predicate, "Event")

        # Lossless desc reconstruction (after schema_patch v2):
        #   notes field carries the original OncoBubble.desc verbatim.
        # Fallback for pre-Notes data: value when predicate is narrative.
        value_unit = (c.get("value_unit") or "").strip()
        narrative_predicates = {
            "ecosystem_event", "regulatory_event", "clinical_trial_result",
            "released_product", "fda_clearance",
        }
        amount = float(c.get("value") or 0) if value_unit == "usd_m" else 0.0
        notes = (c.get("notes") or "").strip()
        if notes:
            desc = notes
        elif value_unit != "usd_m" and predicate in narrative_predicates:
            desc = (c.get("value") or "").strip()
        else:
            desc = ""

        bubble = {
            "c": ent["name"],
            "p": parse_tag(tags, "product"),
            "dp": parse_tag(tags, "decision_point"),
            "d": period_to_float_year(c.get("period", "")),
            "a": amount,
            "tm": parse_tag(tags, "tumor") or "pan-cancer",
            "e": parse_tag(tags, "evidence") or "N/A",
            "r": parse_tag(tags, "regulatory") or "none",
            "et": et,
            "desc": desc,
            "src": src,
        }
        bubbles.append(bubble)

    # Sort by date for stable diffs
    bubbles.sort(key=lambda b: (b["d"], b["c"], b["p"]))

    # Emit TS module
    out = [
        "// AUTO-GENERATED by scripts/zerotrust/regen_oncology.py",
        "// Source of truth: Airtable (via zerotrust). CSV intermediate used in this PoC run.",
        f"// Bubbles: {len(bubbles)}",
        "//",
        "// Round-trip fidelity: PARTIAL. Original `desc` field for funding /",
        "// IPO / acquisition events does not survive (claim.value carries the",
        "// numeric amount). Re-extract with --preserve-desc if a future schema",
        "// patch adds a `Claim.Notes` field.",
        "//",
        "// Editorial overlays (cluster colors, decision-point order labels,",
        "// pharma cross-tab matrix) stay in the original oncology.ts until a",
        "// regen for them lands. Do NOT delete the original file yet.",
        "",
        "import type { OncoBubble } from './oncology';",
        "",
        f"export const ONCO_BUBBLES_REGEN: OncoBubble[] = {json.dumps(bubbles, indent=2, ensure_ascii=False)};",
        "",
    ]
    return "\n".join(out)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--write", action="store_true",
                    help="write the regenerated TS file (default: print to stdout)")
    args = ap.parse_args()

    ts = regen()
    if args.write:
        OUT_TS.parent.mkdir(parents=True, exist_ok=True)
        OUT_TS.write_text(ts, encoding="utf-8")
        print(f"Wrote {OUT_TS.relative_to(REPO_ROOT)} ({len(ts)} chars)", file=sys.stderr)
    else:
        sys.stdout.write(ts)
    return 0


if __name__ == "__main__":
    sys.exit(main())
