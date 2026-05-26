"""
backfill_revenue_scope.py
-------------------------
Reads slug->scope mapping from revenue_scope_mapping.json,
finds matching revenue_usd_m Claims by entity slug in Tags,
and sets the Scope field on each matching record.

Idempotent: skips records that already have Scope set.
"""

import json
import os
import time
import urllib.parse
import urllib.request

from dotenv import load_dotenv

load_dotenv("backend/.env")
AIRTABLE_TOKEN = os.environ["AIRTABLE_TOKEN"]
AIRTABLE_BASE  = os.environ["AIRTABLE_BASE"]
TABLE_NAME     = "Claims"
SCOPE_MAP_PATH = "scripts/zerotrust/revenue_scope_mapping.json"


def api_get(path: str) -> dict:
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE}/{urllib.parse.quote(TABLE_NAME)}?{path}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {AIRTABLE_TOKEN}"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def api_patch(record_id: str, fields: dict) -> None:
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE}/{urllib.parse.quote(TABLE_NAME)}/{record_id}"
    payload = json.dumps({"fields": fields}).encode()
    req = urllib.request.Request(url, data=payload, headers={
        "Authorization": f"Bearer {AIRTABLE_TOKEN}",
        "Content-Type":  "application/json",
    })
    req.get_method = lambda: "PATCH"
    with urllib.request.urlopen(req) as resp:
        json.loads(resp.read())


def paginate(params: dict) -> list[dict]:
    records = []
    offset = None
    while True:
        p = dict(params)
        if offset:
            p["offset"] = offset
        qs = urllib.parse.urlencode(p, doseq=True)
        data = api_get(qs)
        records.extend(data["records"])
        offset = data.get("offset")
        if not offset:
            break
        time.sleep(0.15)
    return records


def main() -> None:
    with open(SCOPE_MAP_PATH, encoding="utf-8") as f:
        scope_map: dict[str, str] = json.load(f)
    print(f"Loaded {len(scope_map)} slug->scope mappings")

    # Fetch all revenue_usd_m claims
    print("Fetching revenue claims...")
    params = {
        "filterByFormula": "{Predicate}='revenue_usd_m'",
        "fields[]": ["External ID", "Tags", "Scope"],
        "pageSize": "100",
    }
    records = paginate(params)
    print(f"Found {len(records)} revenue claims")

    updated = skipped_scope = skipped_no_match = 0

    for rec in records:
        fields = rec.get("fields", {})

        if fields.get("Scope"):
            skipped_scope += 1
            continue

        # Extract entity slug from Tags
        entity_slug = None
        for tag in fields.get("Tags", []):
            if tag.startswith("entity:"):
                entity_slug = tag[len("entity:"):]
                break

        scope = scope_map.get(entity_slug) if entity_slug else None
        if not scope:
            skipped_no_match += 1
            continue

        api_patch(rec["id"], {"Scope": scope})
        updated += 1
        if updated % 25 == 0:
            print(f"  {updated} updated...")
        time.sleep(0.22)

    print(f"\nDone. Updated: {updated} | Already had scope: {skipped_scope} | No match: {skipped_no_match}")


if __name__ == "__main__":
    main()
