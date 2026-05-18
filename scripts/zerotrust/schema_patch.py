"""Add missing fields to Airtable base via Metadata API.

The base was set up by Airtable's AI template, which left out several
fields that the zerotrust pipeline + Airtable-as-canonical architecture
require:

  1. Claims.Value Text  (multilineText)
       Purpose: hold non-numeric claim values (e.g. partnered_with = "Microsoft",
                released_product = "ISM8969", lead_investor = "a16z"). Without
                this field, to_airtable.py skips ~60% of generated claims.

  2. Claims.Entity      (multipleRecordLinks -> Entities)
       Purpose: real Claim -> Entity link, so Airtable rollups
                (Entities.Total Claims, Entities.Total Revenue, ...) work
                correctly. Currently the relation is encoded as a string
                tag, which breaks rollups.

  3. Entities.Domain Tags (multipleRecordLinks -> Tags)
       Purpose: filter Entities by domain in the Airtable UI. Currently all
                470 Entities have empty domain attribution at the entity
                level — domain is only on Claims.

Requires AIRTABLE_TOKEN to have `schema.bases:write` scope.

Safety:
  - Dry-run by default. Pass --apply to actually create fields.
  - Idempotent: if a field already exists, it is skipped (no error).
  - Backs up the full current schema as JSON before any write.

Usage:
  python -m scripts.zerotrust.schema_patch           # dry-run
  python -m scripts.zerotrust.schema_patch --apply
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
ENV_SEARCH_PATHS = [
    Path(__file__).resolve().parent / ".env",
    REPO_ROOT / "backend" / ".env",
    REPO_ROOT / ".env",
    Path(r"C:\Projects\03_ai_directory\healthaiatlas\backend\.env"),
]
BACKUP_DIR = Path(r"C:\Projects\data\aiatls\zerotrust")

CLAIMS_TABLE_ID = "tbl0UzeKWnx11w91Q"
ENTITIES_TABLE_ID = "tbl8eSLv4G3RWxYm7"
TAGS_TABLE_ID = "tbllRllHLPZpk5TVI"


def load_env() -> tuple[str, str]:
    for path in ENV_SEARCH_PATHS:
        if not path.exists():
            continue
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k = k.strip()
            v = v.strip().strip('"').strip("'")
            if k and k not in os.environ:
                os.environ[k] = v
    token = os.environ.get("AIRTABLE_TOKEN") or os.environ.get("AIRTABLE_PAT") or ""
    base = os.environ.get("AIRTABLE_BASE") or os.environ.get("AIRTABLE_BASE_ID") or ""
    if not token or not base:
        print("ERROR: AIRTABLE_TOKEN / AIRTABLE_BASE not in env or any .env:", file=sys.stderr)
        for p in ENV_SEARCH_PATHS:
            print(f"  - {p}", file=sys.stderr)
        sys.exit(2)
    return token, base


def get_schema(base: str, token: str) -> dict:
    url = f"https://api.airtable.com/v0/meta/bases/{base}/tables"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def field_exists(schema: dict, table_id: str, field_name: str) -> bool:
    for t in schema["tables"]:
        if t["id"] != table_id:
            continue
        for fld in t["fields"]:
            if fld["name"].lower() == field_name.lower():
                return True
    return False


def create_field(base: str, table_id: str, token: str, body: dict) -> dict:
    url = f"https://api.airtable.com/v0/meta/bases/{base}/tables/{table_id}/fields"
    req = urllib.request.Request(
        url,
        method="POST",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


# Field specs — name + body for Airtable Metadata API
PATCHES = [
    {
        "table_id": CLAIMS_TABLE_ID,
        "table_name": "Claims",
        "field_name": "Value Text",
        "body": {
            "name": "Value Text",
            "type": "multilineText",
            "description": (
                "Holds non-numeric claim values (e.g. partnered_with='Microsoft', "
                "released_product='ISM8969'). Use this when Predicate is "
                "categorical, not numeric. Value (number) stays empty in that case."
            ),
        },
    },
    {
        "table_id": CLAIMS_TABLE_ID,
        "table_name": "Claims",
        "field_name": "Entity",
        "body": {
            "name": "Entity",
            "type": "multipleRecordLinks",
            "description": (
                "The Entity this claim is about. Required for Airtable rollups "
                "on Entities (Total Claims, Total Revenue, etc.) to work."
            ),
            "options": {
                "linkedTableId": ENTITIES_TABLE_ID,
            },
        },
    },
    {
        "table_id": ENTITIES_TABLE_ID,
        "table_name": "Entities",
        "field_name": "Domain Tags",
        "body": {
            "name": "Domain Tags",
            "type": "multipleRecordLinks",
            "description": (
                "Domains this entity participates in (oncology, ai_lifesci, "
                "ai_arch_revenue, etc.). Mirrors the Tags table. Should be "
                "rolled up from this entity's Claims at upload time."
            ),
            "options": {
                "linkedTableId": TAGS_TABLE_ID,
            },
        },
    },
    {
        "table_id": CLAIMS_TABLE_ID,
        "table_name": "Claims",
        "field_name": "Notes",
        "body": {
            "name": "Notes",
            "type": "multilineText",
            "description": (
                "Free-text annotation preserved from the original frontend "
                "draft. Used by regen_*.py scripts to reconstruct narrative "
                "fields (OncoBubble.desc, USEvent.detail, etc.) that don't "
                "fit cleanly into Value / Value Text / Tags. Closes the "
                "round-trip fidelity gap for narrative descriptions."
            ),
        },
    },
]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--apply", action="store_true", help="actually create fields (default: dry-run)")
    args = ap.parse_args()

    token, base = load_env()

    print(f"Fetching current schema for base {base}...")
    schema = get_schema(base, token)

    # Backup schema
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_path = BACKUP_DIR / f"airtable_schema_backup_{ts}.json"
    backup_path.write_text(json.dumps(schema, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  schema backup: {backup_path}")

    print("\nPatch plan:")
    todo = []
    for p in PATCHES:
        exists = field_exists(schema, p["table_id"], p["field_name"])
        mark = "ALREADY EXISTS" if exists else "WILL CREATE"
        print(f"  {p['table_name']:10s} . {p['field_name']:15s}  {p['body']['type']:25s} {mark}")
        if not exists:
            todo.append(p)

    if not todo:
        print("\nAll fields already exist. Nothing to do.")
        return 0

    if not args.apply:
        print(f"\nDRY-RUN: {len(todo)} field(s) would be created. Re-run with --apply.")
        return 0

    print(f"\nCreating {len(todo)} field(s)...")
    for p in todo:
        try:
            result = create_field(base, p["table_id"], token, p["body"])
            print(f"  OK  {p['table_name']}.{p['field_name']} -> id={result.get('id')}")
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", "replace")[:300]
            print(f"  FAIL {p['table_name']}.{p['field_name']}: HTTP {e.code} {body}", file=sys.stderr)
            if e.code == 403:
                print("  HINT: token may need `schema.bases:write` scope.", file=sys.stderr)
            return 1

    print("\nDone. Now re-run scripts.zerotrust.to_airtable to populate skipped claims.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
