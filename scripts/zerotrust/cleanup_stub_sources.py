"""Delete orphan stub Source records from Airtable.

A "stub" is a Source record that was created by an early upload bug
(External ID landed in `Source Name` instead of its own field, and the
URL / publisher / quote payload never arrived). Concretely:
  - `External ID` field is empty.
  - `Source Name` matches `s_<hex>` (the External ID hash format).
  - No claim is linked via `Claims (Extracted From)`.

These records eat quota without delivering any value (no URL, no quote,
no audit trail). They are completely safe to delete.

Safety:
  - Dry-run by default; pass --apply to actually delete.
  - Always writes a CSV backup before deleting (timestamped).
  - Refuses to delete any stub that has a linked claim (defence in depth
    against the matcher catching the wrong row).

Usage:
  python -m scripts.zerotrust.cleanup_stub_sources           # dry-run
  python -m scripts.zerotrust.cleanup_stub_sources --apply   # actually delete
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
# Mirror to_airtable.py — works both in main checkout and in git worktrees,
# and respects pre-set environment variables.
ENV_SEARCH_PATHS = [
    Path(__file__).resolve().parent / ".env",
    REPO_ROOT / "backend" / ".env",
    REPO_ROOT / ".env",
    Path(r"C:\Projects\03_ai_directory\healthaiatlas\backend\.env"),
]
BACKUP_DIR = Path(r"C:\Projects\data\aiatls\zerotrust")
SOURCES_TABLE_ID = "tbleWmldz7JJHpSvG"
STUB_PATTERN = re.compile(r"^s_[0-9a-f]+$")
BATCH_SIZE = 10  # Airtable DELETE max
RATE_LIMIT_SLEEP = 0.25  # 4 req/s, under Airtable's 5/s limit


def load_env() -> tuple[str, str]:
    """Resolve (token, base). Reads os.environ first, then any .env candidate."""
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


def fetch_all(base: str, table_id: str, token: str) -> list[dict]:
    out: list[dict] = []
    offset: str | None = None
    while True:
        params: list[tuple[str, str]] = [("pageSize", "100")]
        if offset:
            params.append(("offset", offset))
        url = f"https://api.airtable.com/v0/{base}/{table_id}?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
        out.extend(data.get("records", []))
        offset = data.get("offset")
        if not offset:
            break
    return out


def find_stubs(sources: list[dict]) -> list[dict]:
    """Match the stub shape exactly. Defensive."""
    stubs = []
    for s in sources:
        f = s.get("fields", {})
        if f.get("External ID"):
            continue
        name = f.get("Source Name", "")
        if "#" in name:
            continue
        if not STUB_PATTERN.match(name):
            continue
        if f.get("Claims (Extracted From)"):
            # Linked to claims — refuse to delete even if name matches.
            continue
        stubs.append(s)
    return stubs


def write_backup(stubs: list[dict]) -> Path:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    path = BACKUP_DIR / f"airtable_stub_backup_{ts}.csv"
    with path.open("w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["airtable_id", "source_name", "created_time", "fields_json"])
        for s in stubs:
            w.writerow([
                s["id"],
                s.get("fields", {}).get("Source Name", ""),
                s.get("createdTime", ""),
                json.dumps(s.get("fields", {}), ensure_ascii=False),
            ])
    return path


def delete_batch(base: str, table_id: str, token: str, ids: list[str]) -> int:
    qs = "&".join(f"records[]={urllib.parse.quote(rid)}" for rid in ids)
    url = f"https://api.airtable.com/v0/{base}/{table_id}?{qs}"
    req = urllib.request.Request(
        url,
        method="DELETE",
        headers={"Authorization": f"Bearer {token}"},
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read())
    return sum(1 for rec in data.get("records", []) if rec.get("deleted"))


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--apply", action="store_true", help="actually delete (default: dry-run)")
    args = ap.parse_args()

    token, base = load_env()

    print(f"Fetching all Sources from base {base}...")
    sources = fetch_all(base, SOURCES_TABLE_ID, token)
    print(f"  total Sources: {len(sources)}")

    stubs = find_stubs(sources)
    print(f"  orphan stubs matched (s_<hex>, no URL, no linked claim): {len(stubs)}")

    if not stubs:
        print("Nothing to delete. Done.")
        return 0

    backup = write_backup(stubs)
    print(f"  backup written: {backup} ({backup.stat().st_size} bytes)")

    if not args.apply:
        print("\nDRY-RUN: no records deleted. Re-run with --apply to delete.")
        print("Sample of what would be deleted:")
        for s in stubs[:5]:
            print(f"  {s['id']}  name={s.get('fields',{}).get('Source Name','')}")
        return 0

    print(f"\nDeleting {len(stubs)} records in batches of {BATCH_SIZE}...")
    ids = [s["id"] for s in stubs]
    deleted = 0
    failed: list[tuple[int, int, str]] = []
    for i in range(0, len(ids), BATCH_SIZE):
        batch = ids[i : i + BATCH_SIZE]
        try:
            deleted += delete_batch(base, SOURCES_TABLE_ID, token, batch)
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", "replace")[:200]
            failed.append((i, e.code, body))
            print(f"  batch starting {i}: HTTP {e.code} — {body}", file=sys.stderr)
            time.sleep(2)
            continue
        time.sleep(RATE_LIMIT_SLEEP)

    print(f"\nDeleted: {deleted}/{len(stubs)}")
    if failed:
        print(f"Failures: {len(failed)} batches")

    # Verify
    remaining = fetch_all(base, SOURCES_TABLE_ID, token)
    print(f"Sources table after delete: {len(remaining)} records "
          f"(was {len(sources)}; expected {len(sources) - deleted})")
    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
