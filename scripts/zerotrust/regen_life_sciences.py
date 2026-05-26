"""
regen_life_sciences.py
----------------------
Pulls canonical data from Airtable and regenerates frontend TypeScript files:

  frontend/src/data/aiLifeSciencesRevenue.ts

Run this after adding or updating revenue claims in Airtable.

Usage:
  python scripts/zerotrust/regen_life_sciences.py           # regenerate revenue TS
  python scripts/zerotrust/regen_life_sciences.py --dry-run # print output, don't write files

Future:
  Phase 2 — regenerate aiLifeSciencesFDA.ts specialty stats from fda_clearance claims
  Phase 3 — regenerate LS_BUBBLES from ecosystem_event + funding claims (needs cluster tags in Claims)
"""

import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime

from dotenv import load_dotenv

load_dotenv("backend/.env")
AIRTABLE_TOKEN = os.environ["AIRTABLE_TOKEN"]
AIRTABLE_BASE  = os.environ["AIRTABLE_BASE"]

DRY_RUN = "--dry-run" in sys.argv

OUT_REVENUE = "frontend/src/data/aiLifeSciencesRevenue.ts"


# ---------------------------------------------------------------------------
# Airtable helpers
# ---------------------------------------------------------------------------

def airtable_list(table: str, params: dict) -> list[dict]:
    """Paginate through all records in a table matching params."""
    records = []
    offset = None
    while True:
        p = dict(params)
        if offset:
            p["offset"] = offset
        qs = urllib.parse.urlencode(p, doseq=True)
        url = f"https://api.airtable.com/v0/{AIRTABLE_BASE}/{urllib.parse.quote(table)}?{qs}"
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {AIRTABLE_TOKEN}"})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
        records.extend(data["records"])
        offset = data.get("offset")
        if not offset:
            break
        time.sleep(0.15)
    return records


def load_entity_names() -> dict[str, str]:
    """Return {entity_slug: display_name} for all Entities."""
    records = airtable_list("Entities", {
        "fields[]": ["Entity Name", "External ID"],
        "pageSize": "100",
    })
    slug_to_name: dict[str, str] = {}
    for rec in records:
        fields = rec["fields"]
        name = fields.get("Entity Name", "")
        ext_id = fields.get("External ID", "")
        if not ext_id:
            continue
        # External ID is the slug directly (e.g. "abridge", "c_ent_fda_siemens-healthineers")
        slug = ext_id.lstrip("c_ent_fda_").replace("-", "-")  # keep fda slugs as-is
        slug_to_name[ext_id] = name  # index by external ID
        # Also index by the name-derived slug for curated entities
        name_slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
        slug_to_name[name_slug] = name
    return slug_to_name


# ---------------------------------------------------------------------------
# Revenue TS generation
# ---------------------------------------------------------------------------

def parse_year(period: str | None) -> int:
    """Extract a 4-digit year from Airtable period strings."""
    if not period:
        return datetime.now().year
    m = re.search(r"(\d{4})", period)
    return int(m.group(1)) if m else datetime.now().year


def build_revenue_ts(entity_names: dict[str, str]) -> str:
    """Pull revenue_usd_m claims and generate aiLifeSciencesRevenue.ts content."""
    print("Fetching revenue claims (source=curated)...")
    records = airtable_list("Claims", {
        "filterByFormula": "AND({Predicate}='revenue_usd_m', {Source}='curated')",
        "fields[]": ["External ID", "Value", "Value Unit", "Period", "Confidence", "Tags", "Scope", "Notes"],
        "pageSize": "100",
    })
    print(f"  {len(records)} revenue claims found")

    # Group by entity slug, keep the most recent year with the highest value
    by_slug: dict[str, dict] = {}

    for rec in records:
        fields = rec.get("fields", {})
        value = fields.get("Value")
        if value is None:
            continue

        # Extract entity slug from Tags
        entity_slug: str | None = None
        for tag in fields.get("Tags", []):
            if tag.startswith("entity:"):
                entity_slug = tag[len("entity:"):]
                break
        if not entity_slug:
            continue  # can't link to a company

        scope = fields.get("Scope")
        if not scope:
            # No scope tag means this company was not mapped to the life-sciences domain.
            # Skip rather than guess — Airtable is truth, not the default.
            continue

        year = parse_year(fields.get("Period"))
        revenue_m = float(value)
        unit_raw = fields.get("Value Unit", "usd_m")
        unit = "arr_usd_m" if "arr" in unit_raw.lower() else "usd_m"
        confidence = fields.get("Confidence", "low")
        name = entity_names.get(entity_slug, entity_slug.replace("-", " ").title())

        candidate = {
            "slug": entity_slug, "name": name, "year": year,
            "revenue_m": revenue_m, "unit": unit,
            "confidence": confidence, "scope": scope,
        }

        # Keep most recent year; tie-break by higher revenue
        existing = by_slug.get(entity_slug)
        if existing is None or year > existing["year"] or (year == existing["year"] and revenue_m > existing["revenue_m"]):
            by_slug[entity_slug] = candidate

    entries = list(by_slug.values())

    # Sort: product first, then company; within each group by revenue descending
    entries.sort(key=lambda e: (0 if e["scope"] == "product" else 1, -e["revenue_m"]))

    today = datetime.now().strftime("%Y-%m-%d")
    lines = [
        "// Revenue data for AI Life Sciences companies.",
        f"// AUTO-GENERATED by scripts/zerotrust/regen_life_sciences.py on {today}",
        "// Source: Airtable Claims (predicate=revenue_usd_m, source=curated)",
        "//",
        "// scope: \"product\" = AI product / platform revenue (counts toward cluster Revenue signal)",
        "//         \"company\" = total company revenue — AI is a component, not the whole business",
        "//           (big pharma, Intuitive Surgical, OpenAI/Anthropic as general AI platforms)",
        "",
        "export interface LSRevenue {",
        "  slug: string; name: string; year: number; revenue_m: number;",
        "  unit: \"usd_m\" | \"arr_usd_m\"; confidence: \"high\" | \"medium\" | \"low\";",
        "  scope: \"product\" | \"company\";",
        "}",
        "",
        "export const LS_REVENUE: LSRevenue[] = [",
    ]

    for e in entries:
        lines.append(
            f"  {{ slug: '{e['slug']}', name: '{e['name']}', year: {e['year']}, "
            f"revenue_m: {e['revenue_m']}, unit: '{e['unit']}', "
            f"confidence: '{e['confidence']}', scope: '{e['scope']}' }},"
        )

    lines.append("];")
    lines.append("")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    print("Loading entity names from Airtable...")
    entity_names = load_entity_names()
    print(f"  {len(entity_names)} entity name mappings loaded")

    revenue_ts = build_revenue_ts(entity_names)

    if DRY_RUN:
        print("\n--- REVENUE TS (dry run) ---")
        print(revenue_ts[:3000])
        print("...")
    else:
        with open(OUT_REVENUE, "w", encoding="utf-8", newline="\n") as f:
            f.write(revenue_ts)
        print(f"\nWritten: {OUT_REVENUE}")


if __name__ == "__main__":
    main()
