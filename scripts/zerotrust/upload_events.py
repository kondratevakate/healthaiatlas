"""Upload events_research_output.csv -> Airtable Claims (+ Sources).

Maps event_type to predicate + tags following the existing ai_lifesci schema:

  Funding_Round       -> funding_amount_usd_m  + tags: funding_round
  IPO                 -> ipo_proceeds_usd_m    + tags: ipo
  Acquisition         -> ma_value_usd_m        + tags: acquisition
  Pharma_Deal         -> pharma_deal_value_usd_m + tags: pharma_deal
  FDA_Clearance       -> regulatory_event      + tags: fda_clearance
  Regulatory          -> regulatory_event      + tags: regulatory_milestone
  Clinical_Trial_Result -> clinical_trial_result + tags: clinical_trial_result
  Product_Launch      -> released_product      + tags: product_launch
  Partnership         -> partnered_with        + tags: partnership
  Layoff              -> ecosystem_event       + tags: layoff

Idempotent: External ID = c_ev_<hash(slug+date+event_type)>.

Usage:
  python scripts/zerotrust/upload_events.py
  python scripts/zerotrust/upload_events.py --dry-run
  python scripts/zerotrust/upload_events.py --limit 5
"""
from __future__ import annotations

import csv
import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
CSV_PATH = REPO_ROOT / "scripts" / "zerotrust" / "events_research_output.csv"
ENV_PATHS = [REPO_ROOT / "backend" / ".env", REPO_ROOT / ".env"]

API_BASE = "https://api.airtable.com/v0"
RATE_SLEEP = 0.26
LIFESCI_TAG_ID = "rec0mNqfNomaZKtXo"

# event_type -> (predicate, numeric_field, extra_tag)
EVENT_MAP = {
    "Funding_Round":        ("funding_amount_usd_m",    True,  "funding_round"),
    "IPO":                  ("ipo_proceeds_usd_m",       True,  "ipo"),
    "Acquisition":          ("ma_value_usd_m",           True,  "acquisition"),
    "Pharma_Deal":          ("pharma_deal_value_usd_m",  True,  "pharma_deal"),
    "FDA_Clearance":        ("regulatory_event",         False, "fda_clearance"),
    "Regulatory":           ("regulatory_event",         False, "regulatory_milestone"),
    "Clinical_Trial_Result":("clinical_trial_result",    False, "clinical_trial_result"),
    "Product_Launch":       ("released_product",         False, "product_launch"),
    "Partnership":          ("partnered_with",           False, "partnership"),
    "Layoff":               ("ecosystem_event",          False, "layoff"),
}


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
        raise RuntimeError(f"{method} {path} -> {e.code}: {e.read().decode()}") from e


def slug_hash(s: str) -> str:
    return hashlib.sha1(s.encode()).hexdigest()[:10]


def upsert_source(row: dict, dry_run: bool) -> str | None:
    url = row.get("source_url", "").strip()
    if not url:
        return None
    src_id = f"s_ev_{slug_hash(url)}"
    if dry_run:
        return "__dry__"
    resp = api("GET", f"Sources?filterByFormula=FIND('{src_id}',{{External ID}})")
    if resp.get("records"):
        return resp["records"][0]["id"]
    resp = api("POST", "Sources", {"records": [{"fields": {
        "External ID": src_id,
        "Source Name": row.get("entity_name", "")[:60] + " — " + row.get("event_type", ""),
        "URL": url,
        "Source Type": "Other",
    }}], "typecast": True})
    return resp["records"][0]["id"]


def upsert_claim(row: dict, src_id: str | None, dry_run: bool) -> bool:
    event_type = row.get("event_type", "")
    mapping = EVENT_MAP.get(event_type)
    if not mapping:
        print(f"  SKIP unknown event_type: {event_type}")
        return False

    predicate, is_numeric, extra_tag = mapping
    claim_id = f"c_ev_{slug_hash(row['entity_slug'] + row.get('event_date','') + event_type)}"

    if not dry_run:
        resp = api("GET", f"Claims?filterByFormula=FIND('{claim_id}',{{External ID}})")
        if resp.get("records"):
            print(f"  skip (exists): {claim_id}")
            return False

    amount_raw = row.get("amount_usd_m", "").strip()
    has_amount = bool(amount_raw)

    fields: dict = {
        "External ID": claim_id,
        "Claim ID": claim_id,
        "Predicate": predicate,
        "Period": row.get("event_date", "2025-01-01") + "T00:00:00",
        "Confidence": row.get("confidence", "medium"),
        "Domain Tags": [LIFESCI_TAG_ID],
        "Tags": [f"entity:{row['entity_slug']}", extra_tag],
        "Extracted At": "2026-05-26",
    }

    if is_numeric and has_amount:
        fields["Value"] = float(amount_raw)
        fields["Value Unit"] = "usd_m"
    elif row.get("description"):
        fields["Value Text"] = row["description"][:500]

    if row.get("notes"):
        fields["Notes"] = row["notes"]
    if src_id:
        fields["Extracted From"] = [src_id]

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
            rows.append(row)
    if limit:
        rows = rows[:limit]

    print(f"{'DRY RUN — ' if dry_run else ''}Uploading {len(rows)} events to Airtable")
    uploaded = skipped = errors = 0

    for i, row in enumerate(rows, 1):
        name = row.get("entity_name", row["entity_slug"])
        amt = f" ${row['amount_usd_m']}M" if row.get("amount_usd_m") else ""
        print(f"[{i}/{len(rows)}] {name} — {row.get('event_type')}{amt} ({row.get('event_date')}) conf={row.get('confidence')}", end=" ")
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
