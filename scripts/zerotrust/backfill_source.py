"""
backfill_source.py
------------------
Sets the Source field on all Claims records based on External ID prefix:
  c_fda_*  → fda
  anything else (curated events, revenue, original claims) → curated

Processes in batches of 10 (Airtable batch update limit).
Skips records that already have Source set.
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


def infer_source(external_id: str) -> str:
    return "fda" if external_id.startswith("c_fda_") else "curated"


def paginate_claims() -> list[dict]:
    """Fetch all Claims records with External ID and Source fields."""
    records = []
    offset = None
    while True:
        params = {"fields[]": ["External ID", "Source"], "pageSize": "100"}
        if offset:
            params["offset"] = offset
        qs = urllib.parse.urlencode(params, doseq=True)
        url = f"https://api.airtable.com/v0/{AIRTABLE_BASE}/{urllib.parse.quote(TABLE_NAME)}?{qs}"
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {AIRTABLE_TOKEN}"})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
        records.extend(data["records"])
        offset = data.get("offset")
        if not offset:
            break
        time.sleep(0.15)
    return records


def batch_patch(updates: list[dict]) -> None:
    """PATCH up to 10 records in one request."""
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE}/{urllib.parse.quote(TABLE_NAME)}"
    payload = json.dumps({"records": updates}).encode()
    req = urllib.request.Request(url, data=payload, headers={
        "Authorization": f"Bearer {AIRTABLE_TOKEN}",
        "Content-Type":  "application/json",
    })
    req.get_method = lambda: "PATCH"
    try:
        with urllib.request.urlopen(req) as resp:
            json.loads(resp.read())  # consume response
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        raise RuntimeError(f"PATCH {url}: {e.code} {body}") from e


def main() -> None:
    print("Fetching all Claims records…")
    records = paginate_claims()
    print(f"Total records: {len(records)}")

    to_update = []
    already_set = 0

    for rec in records:
        fields = rec.get("fields", {})
        if fields.get("Source"):  # already backfilled
            already_set += 1
            continue
        ext_id = fields.get("External ID", "")
        source = infer_source(ext_id)
        to_update.append({"id": rec["id"], "fields": {"Source": source}})

    print(f"Already have Source: {already_set} | To backfill: {len(to_update)}")
    if not to_update:
        print("Nothing to do.")
        return

    # Process in batches of 10
    BATCH_SIZE = 10
    done = 0
    for i in range(0, len(to_update), BATCH_SIZE):
        batch = to_update[i : i + BATCH_SIZE]
        batch_patch(batch)
        done += len(batch)
        if done % 100 == 0 or done == len(to_update):
            print(f"  {done}/{len(to_update)} updated…")
        time.sleep(0.22)  # stay under 5 req/s

    print(f"\nDone. Backfilled {done} records.")


if __name__ == "__main__":
    main()
