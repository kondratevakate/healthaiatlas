"""Dedupe duplicate Tag rows in Airtable.

The Tags table has rows like:
  - "ai_lifesci"   (External ID=ai_lifesci,  91 claims linked) ← zerotrust upload
  - "ai_lifesci"   (no External ID,         701 claims linked) ← AI auto-tag

This happens when both zerotrust upload AND Airtable's AI auto-tagging
created their own row for the same tag name. Both rows then accumulate
Related Claims independently, so neither has the full picture.

Strategy:
  1. Group all Tag rows by `Tag Name` (case-insensitive).
  2. Within each group, pick the row WITH External ID as canonical.
  3. UNION the `Related Claims` from all sibling rows into the canonical.
     This is done by patching every linked Claim's `Domain Tags` to
     point at the canonical row (instead of the duplicate), and removing
     the duplicate from those Claims' link list.
  4. Delete the now-empty duplicate Tag rows.

Safety:
  - Dry-run by default. Pass --apply to write.
  - Writes a backup CSV of all Tag rows + their Related Claims before any
    mutation.
  - Skips groups where no member has External ID (ambiguous — user must
    decide which is canonical).

Usage:
  python -m scripts.zerotrust.cleanup_duplicate_tags           # dry-run
  python -m scripts.zerotrust.cleanup_duplicate_tags --apply   # rewire + delete
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
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
TAGS_TABLE_ID = "tbllRllHLPZpk5TVI"
BATCH_SIZE = 10
RATE_LIMIT_SLEEP = 0.25


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


def patch_records(
    base: str, table_id: str, token: str, updates: list[tuple[str, dict]]
) -> int:
    """PATCH with typecast — updates is list of (record_id, fields_dict)."""
    n = 0
    for i in range(0, len(updates), BATCH_SIZE):
        batch = updates[i : i + BATCH_SIZE]
        body = {
            "records": [{"id": rid, "fields": flds} for rid, flds in batch],
            "typecast": True,
        }
        url = f"https://api.airtable.com/v0/{base}/{table_id}"
        req = urllib.request.Request(
            url,
            method="PATCH",
            data=json.dumps(body).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
        )
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
            n += len(data.get("records", []))
        time.sleep(RATE_LIMIT_SLEEP)
    return n


def delete_batch(base: str, table_id: str, token: str, ids: list[str]) -> int:
    n = 0
    for i in range(0, len(ids), BATCH_SIZE):
        batch = ids[i : i + BATCH_SIZE]
        qs = "&".join(f"records[]={urllib.parse.quote(rid)}" for rid in batch)
        url = f"https://api.airtable.com/v0/{base}/{table_id}?{qs}"
        req = urllib.request.Request(
            url, method="DELETE", headers={"Authorization": f"Bearer {token}"}
        )
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
        n += sum(1 for r in data.get("records", []) if r.get("deleted"))
        time.sleep(RATE_LIMIT_SLEEP)
    return n


def write_backup(tags: list[dict]) -> Path:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    path = BACKUP_DIR / f"airtable_tags_backup_{ts}.csv"
    with path.open("w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["airtable_id", "tag_name", "external_id", "claim_count",
                    "related_claim_ids", "created_time"])
        for t in tags:
            f = t.get("fields", {})
            related = f.get("Related Claims") or []
            w.writerow([
                t["id"],
                f.get("Tag Name", ""),
                f.get("External ID", ""),
                f.get("Claim Count", 0),
                ";".join(related),
                t.get("createdTime", ""),
            ])
    return path


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--apply", action="store_true", help="actually rewire + delete (default: dry-run)")
    args = ap.parse_args()

    token, base = load_env()

    print("Fetching all Tags...")
    tags = fetch_all(base, TAGS_TABLE_ID, token)
    print(f"  total: {len(tags)}")

    # Group by Tag Name (case-insensitive)
    groups: dict[str, list[dict]] = defaultdict(list)
    for t in tags:
        name = (t.get("fields", {}).get("Tag Name") or "").strip().lower()
        if name:
            groups[name].append(t)

    duplicates = {name: rows for name, rows in groups.items() if len(rows) > 1}
    print(f"  unique tag names: {len(groups)}")
    print(f"  duplicated names: {len(duplicates)}")
    if not duplicates:
        print("No duplicates. Done.")
        return 0

    backup = write_backup(tags)
    print(f"  backup written: {backup}")

    print("\nDuplicate groups:")
    plan: list[tuple[dict, list[dict]]] = []  # (canonical, dupes_to_merge)
    for name, rows in duplicates.items():
        canonical = next((r for r in rows if r.get("fields", {}).get("External ID")), None)
        if canonical is None:
            print(f"  {name}: SKIP — no member has External ID; ambiguous which is canonical")
            continue
        dupes = [r for r in rows if r["id"] != canonical["id"]]
        canonical_claims = set(canonical.get("fields", {}).get("Related Claims") or [])
        dup_claims_union: set[str] = set()
        for d in dupes:
            dup_claims_union |= set(d.get("fields", {}).get("Related Claims") or [])
        to_add = dup_claims_union - canonical_claims
        print(f"  {name}: canonical={canonical['id']} (ExtID, {len(canonical_claims)} claims) "
              f"+ {len(dupes)} dup(s) ({len(dup_claims_union)} claims), {len(to_add)} new claims to rewire")
        plan.append((canonical, dupes))

    if not args.apply:
        print("\nDRY-RUN: no writes. Re-run with --apply.")
        return 0

    # Apply: for each claim in any duplicate, patch its Domain Tags to point at canonical
    # instead of the duplicate.
    print("\nFetching all Claims to compute Domain Tags rewrites...")
    claims = fetch_all(base, CLAIMS_TABLE_ID, token)
    claim_by_id = {c["id"]: c for c in claims}

    rewrites: list[tuple[str, dict]] = []
    dup_ids_to_delete: list[str] = []
    for canonical, dupes in plan:
        canon_id = canonical["id"]
        dup_ids = {d["id"] for d in dupes}
        dup_ids_to_delete.extend(dup_ids)
        # Collect all claims linked to any duplicate
        affected_claim_ids: set[str] = set()
        for d in dupes:
            for cid in d.get("fields", {}).get("Related Claims") or []:
                affected_claim_ids.add(cid)
        for cid in affected_claim_ids:
            claim = claim_by_id.get(cid)
            if not claim:
                continue
            current = list(claim.get("fields", {}).get("Domain Tags") or [])
            new = [tid for tid in current if tid not in dup_ids]
            if canon_id not in new:
                new.append(canon_id)
            if new != current:
                rewrites.append((cid, {"Domain Tags": new}))

    print(f"\nRewriting {len(rewrites)} Claims to point at canonical Tag rows...")
    if rewrites:
        n = patch_records(base, CLAIMS_TABLE_ID, token, rewrites)
        print(f"  patched: {n}")

    print(f"\nDeleting {len(dup_ids_to_delete)} duplicate Tag rows...")
    n_del = delete_batch(base, TAGS_TABLE_ID, token, dup_ids_to_delete)
    print(f"  deleted: {n_del}/{len(dup_ids_to_delete)}")

    # Verify
    remaining = fetch_all(base, TAGS_TABLE_ID, token)
    print(f"\nTags table after dedupe: {len(remaining)} rows (was {len(tags)})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
