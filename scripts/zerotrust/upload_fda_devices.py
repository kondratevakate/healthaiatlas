"""Upload fda_ai_devices.csv -> Airtable Claims.

Each FDA clearance becomes a Claim:
  predicate:   fda_clearance
  Value Text:  "{device_name} ({decision_number})"
  Period:      decision_date
  Tags:        fda_clearance, ai_device, specialty:<slug>, entity:<company_slug>
  Domain Tags: ai_lifesci
  Source:      fda_url -> Sources table

Idempotent: External ID = c_fda_<hash(decision_number)>.

Usage:
  python scripts/zerotrust/upload_fda_devices.py
  python scripts/zerotrust/upload_fda_devices.py --dry-run
  python scripts/zerotrust/upload_fda_devices.py --limit 5
"""
from __future__ import annotations

import csv, hashlib, json, os, re, sys, time, urllib.error, urllib.parse, urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
CSV_PATH  = REPO_ROOT / "scripts" / "zerotrust" / "fda_ai_devices_full.csv"
ENV_PATHS = [REPO_ROOT / "backend" / ".env", REPO_ROOT / ".env"]

API_BASE      = "https://api.airtable.com/v0"
RATE_SLEEP    = 0.26
LIFESCI_TAG   = "rec0mNqfNomaZKtXo"


def load_env():
    for p in ENV_PATHS:
        if not p.exists(): continue
        for line in p.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line: continue
            k, v = line.split("=", 1)
            k, v = k.strip(), v.strip().strip('"').strip("'")
            if k and k not in os.environ: os.environ[k] = v


def api(method: str, path: str, body: dict | None = None) -> dict:
    tok  = os.environ["AIRTABLE_TOKEN"]
    base = os.environ.get("AIRTABLE_BASE_ID") or os.environ["AIRTABLE_BASE"]
    if "?" in path:
        p, qs = path.split("?", 1)
        url = f"{API_BASE}/{base}/{p}?" + urllib.parse.urlencode(urllib.parse.parse_qsl(qs, keep_blank_values=True))
    else:
        url = f"{API_BASE}/{base}/{path}"
    data = json.dumps(body).encode() if body else None
    req  = urllib.request.Request(url, data=data, method=method,
           headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as r: return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{method} {path} -> {e.code}: {e.read().decode()}") from e


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

def h(s: str) -> str:
    return hashlib.sha1(s.encode()).hexdigest()[:10]


def upsert_source(row: dict, dry_run: bool) -> str | None:
    url = (row.get("fda_url") or "").strip()
    if not url: return None
    src_id = f"s_fda_{h(url)}"
    if dry_run: return "__dry__"
    resp = api("GET", f"Sources?filterByFormula=FIND('{src_id}',{{External ID}})")
    if resp.get("records"): return resp["records"][0]["id"]
    resp = api("POST", "Sources", {"records": [{"fields": {
        "External ID": src_id,
        "Source Name": f"FDA CDRH — {row.get('decision_number','')}",
        "URL": url,
        "Source Type": "Report",
    }}], "typecast": True})
    return resp["records"][0]["id"]


def upsert_claim(row: dict, src_id: str | None, dry_run: bool) -> bool:
    dec_num = row.get("decision_number", "").strip()
    if not dec_num: return False
    claim_id = f"c_fda_{h(dec_num)}"
    if not dry_run:
        resp = api("GET", f"Claims?filterByFormula=FIND('{claim_id}',{{External ID}})")
        if resp.get("records"):
            print(f"  skip: {claim_id}")
            return False

    device   = row.get("device_name", "").strip()
    company  = row.get("company_name", "").strip()
    spec     = row.get("specialty", "").strip()
    dec_date = row.get("decision_date", "").strip()
    dec_type = row.get("decision_type", "510k").strip()

    # Period: FDA uses MM/DD/YYYY; fallback handles YYYY-MM-DD
    if "/" in dec_date:
        parts = dec_date.split("/")
        period = f"{parts[2]}-{parts[0].zfill(2)}-{parts[1].zfill(2)}T00:00:00"
    elif "-" in dec_date:
        period_parts = dec_date.split("-")
        period = f"{period_parts[0]}-{period_parts[1].zfill(2)}-01T00:00:00"
    else:
        period = "2025-01-01T00:00:00"

    tags = [
        "fda_clearance",
        "ai_device",
        f"specialty:{slug(spec)}" if spec else None,
        f"entity:{slug(company)}" if company else None,
        dec_type.lower().replace(" ", "_"),
    ]
    tags = [t for t in tags if t]

    fields: dict = {
        "External ID": claim_id,
        "Claim ID":    claim_id,
        "Predicate":   "fda_clearance",
        "Value Text":  f"{device} ({dec_num})",
        "Period":      period,
        "Confidence":  "high",
        "Domain Tags": [LIFESCI_TAG],
        "Tags":        tags,
        "Extracted At":"2026-05-26",
        "Notes":       f"Company: {company} | Specialty: {spec} | Product code: {row.get('product_code','')} | Type: {dec_type}",
    }
    if src_id: fields["Extracted From"] = [src_id]

    if not dry_run:
        api("POST", "Claims", {"records": [{"fields": fields}], "typecast": True})
    return True


def main():
    load_env()
    dry_run = "--dry-run" in sys.argv
    limit   = int(sys.argv[sys.argv.index("--limit") + 1]) if "--limit" in sys.argv else None

    rows = []
    with open(CSV_PATH, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    if limit: rows = rows[:limit]

    print(f"{'DRY RUN — ' if dry_run else ''}Uploading {len(rows)} FDA clearances to Airtable")
    uploaded = skipped = errors = 0

    for i, row in enumerate(rows, 1):
        dec_num = row.get("decision_number","?")
        company = row.get("company_name","?")[:40]
        spec    = row.get("specialty","?")
        print(f"[{i}/{len(rows)}] {dec_num}  {company}  ({spec})", end=" ")
        try:
            src_id = upsert_source(row, dry_run)
            time.sleep(RATE_SLEEP)
            ok = upsert_claim(row, src_id, dry_run)
            time.sleep(RATE_SLEEP)
            if ok: uploaded += 1; print("-> uploaded")
            else:  skipped  += 1
        except Exception as e:
            errors += 1; print(f"ERROR: {e}")

    print(f"\nDone. uploaded={uploaded}  skipped={skipped}  errors={errors}")


if __name__ == "__main__":
    main()
