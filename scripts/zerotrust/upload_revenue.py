"""Upload revenue_research_output.csv -> Airtable Claims (+ Sources).

Only uploads rows that have revenue_usd_m populated.
Idempotent: uses External ID = claim_id built from entity_slug + period_year.
Skips rows already in Airtable (External ID match).

Usage:
  python scripts/zerotrust/upload_revenue.py
  python scripts/zerotrust/upload_revenue.py --dry-run
  python scripts/zerotrust/upload_revenue.py --limit 5
"""
from __future__ import annotations

import csv
import hashlib
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
CSV_PATH = REPO_ROOT / "scripts" / "zerotrust" / "revenue_research_clean.csv"
ENV_PATHS = [REPO_ROOT / "backend" / ".env", REPO_ROOT / ".env"]

API_BASE = "https://api.airtable.com/v0"
RATE_SLEEP = 0.26  # stay under 4 req/s

LIFESCI_TAG_ID = "rec0mNqfNomaZKtXo"  # Tags row for ai_lifesci


def load_env():
    for p in ENV_PATHS:
        if not p.exists():
            continue
        for line in p.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k, v = k.strip(), v.strip().strip('"').strip("'")
            if k and k not in os.environ:
                os.environ[k] = v


def api(method: str, path: str, body: dict | None = None) -> dict:
    tok = os.environ["AIRTABLE_TOKEN"]
    base = os.environ.get("AIRTABLE_BASE_ID") or os.environ["AIRTABLE_BASE"]
    # path may contain query string — split and re-encode it properly
    if "?" in path:
        p, qs = path.split("?", 1)
        pairs = urllib.parse.parse_qsl(qs, keep_blank_values=True)
        url = f"{API_BASE}/{base}/{p}?" + urllib.parse.urlencode(pairs)
    else:
        url = f"{API_BASE}/{base}/{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(
        url, data=data, method=method,
        headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        msg = e.read().decode()
        raise RuntimeError(f"{method} {path} -> {e.code}: {msg}") from e


def slug_hash(s: str) -> str:
    return hashlib.sha1(s.encode()).hexdigest()[:10]


def upsert_source(row: dict, dry_run: bool) -> str | None:
    if not row.get("source_url"):
        return None
    src_id = f"s_rev_{slug_hash(row['source_url'])}"
    if not dry_run:
        resp = api("GET", f"Sources?filterByFormula=FIND('{src_id}',{{External ID}})")
        if resp.get("records"):
            return resp["records"][0]["id"]
        resp = api("POST", "Sources", {"records": [{"fields": {
            "External ID": src_id,
            "Source Name": row.get("source_publisher", row["source_url"][:120]),
            "URL": row["source_url"],
            "Source Type": {"filing": "Financial Statement", "press_release": "Press Release"}.get(
                row.get("source_type", ""), "Other"
            ),
            "Date Published": row.get("source_published_at", ""),
        }}], "typecast": True})
        return resp["records"][0]["id"]
    return "__dry_src__"


def upsert_claim(row: dict, src_airtable_id: str | None, dry_run: bool) -> bool:
    claim_id = f"c_rev_{slug_hash(row['entity_slug'] + row.get('period_year',''))}"
    if not dry_run:
        resp = api("GET", f"Claims?filterByFormula=FIND('{claim_id}',{{External ID}})")
        if resp.get("records"):
            print(f"  skip (exists): {claim_id}")
            return False

    fields: dict = {
        "External ID": claim_id,
        "Claim ID": claim_id,
        "Predicate": "revenue_usd_m",
        "Value": float(row["revenue_usd_m"]),
        "Value Unit": row.get("value_unit", "usd_m"),
        "Period": f"{row['period_year']}-01-01T00:00:00",
        "Confidence": row.get("confidence", "low"),
        "Domain Tags": [LIFESCI_TAG_ID],
        "Tags": [f"entity:{row['entity_slug']}", "revenue"],
        "Extracted At": "2026-05-26",
    }
    if src_airtable_id:
        fields["Extracted From"] = [src_airtable_id]
    if row.get("notes"):
        fields["Notes"] = row["notes"]

    if not dry_run:
        api("POST", "Claims", {"records": [{"fields": fields}], "typecast": True})
    return True


def main():
    load_env()
    dry_run = "--dry-run" in sys.argv
    limit = None
    if "--limit" in sys.argv:
        limit = int(sys.argv[sys.argv.index("--limit") + 1])

    rows = []
    with open(CSV_PATH, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row.get("revenue_usd_m"):
                rows.append(row)
    if limit:
        rows = rows[:limit]

    print(f"{'DRY RUN — ' if dry_run else ''}Uploading {len(rows)} revenue claims to Airtable")
    uploaded = skipped = errors = 0

    for i, row in enumerate(rows, 1):
        name = row.get("entity_name", row["entity_slug"])
        print(f"[{i}/{len(rows)}] {name}  ${row['revenue_usd_m']}M ({row.get('value_unit','')})  conf={row.get('confidence')}", end=" ")
        try:
            src_id = upsert_source(row, dry_run)
            time.sleep(RATE_SLEEP)
            ok = upsert_claim(row, src_id, dry_run)
            time.sleep(RATE_SLEEP)
            if ok:
                uploaded += 1
                print("-> uploaded")
            else:
                skipped += 1
        except Exception as e:
            errors += 1
            print(f"ERROR: {e}")

    print(f"\nDone. uploaded={uploaded}  skipped(exists)={skipped}  errors={errors}")


if __name__ == "__main__":
    main()
