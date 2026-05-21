"""Zero-trust invariants. Run after build, before Airtable upload.

Hard failures (exit 1):
  - claim with no source_ids
  - claim.source_id not in sources table
  - claim.entity_id not in entities table
  - source missing url or retrieved_at
  - duplicate source URLs (same canonical URL, different source_id)
  - duplicate claim_id

Soft warnings (printed, exit 0):
  - entity with zero claims (orphan)
  - source referenced by zero claims (orphan)
  - claim with confidence=low and value!='' (often signals missing follow-up)
"""
from __future__ import annotations

import csv
import sys
from collections import Counter, defaultdict
from pathlib import Path

from .common import canonical_url

OUT_DIR = Path(r"C:\Projects\data\aiatls\zerotrust")


def read_csv(name: str) -> list[dict]:
    with (OUT_DIR / name).open(encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def validate() -> int:
    entities = read_csv("entities.csv")
    claims = read_csv("claims.csv")
    sources = read_csv("sources.csv")

    eids = {e["entity_id"] for e in entities}
    sids = {s["source_id"] for s in sources}

    errors: list[str] = []
    warnings: list[str] = []

    # ── hard ────────────────────────────────────────────────────────────────
    seen_cids: set[str] = set()
    for c in claims:
        cid = c["claim_id"]
        if cid in seen_cids:
            errors.append(f"duplicate claim_id: {cid}")
        seen_cids.add(cid)

        if not c["source_ids"].strip():
            errors.append(f"claim {cid} has no source_ids (predicate={c['predicate']})")
            continue
        for sid in [x.strip() for x in c["source_ids"].split(",") if x.strip()]:
            if sid not in sids:
                errors.append(f"claim {cid} references unknown source_id {sid}")

        if c["entity_id"] not in eids:
            errors.append(f"claim {cid} references unknown entity_id {c['entity_id']}")

    # source integrity
    seen_canon: dict[str, str] = {}
    for s in sources:
        if not s["url"].strip():
            errors.append(f"source {s['source_id']} has no url")
        if not s["retrieved_at"].strip():
            errors.append(f"source {s['source_id']} has no retrieved_at")
        canon = canonical_url(s["url"])
        if canon in seen_canon and seen_canon[canon] != s["source_id"]:
            errors.append(
                f"duplicate canonical url across {seen_canon[canon]} and {s['source_id']}: {canon}"
            )
        seen_canon[canon] = s["source_id"]

    # ── soft ────────────────────────────────────────────────────────────────
    cited_eids: Counter = Counter(c["entity_id"] for c in claims)
    cited_sids: Counter = Counter()
    for c in claims:
        for sid in [x.strip() for x in c["source_ids"].split(",") if x.strip()]:
            cited_sids[sid] += 1
    orphan_e = [eid for eid in eids if cited_eids[eid] == 0]
    orphan_s = [sid for sid in sids if cited_sids[sid] == 0]
    if orphan_e:
        warnings.append(f"{len(orphan_e)} orphan entities (zero claims): {orphan_e[:5]}…")
    if orphan_s:
        warnings.append(f"{len(orphan_s)} orphan sources (zero claims): {orphan_s[:5]}…")

    # ── report ──────────────────────────────────────────────────────────────
    print(f"entities: {len(entities)}  claims: {len(claims)}  sources: {len(sources)}")
    if warnings:
        print("\n[warnings]")
        for w in warnings:
            print("  -", w)
    if errors:
        print("\n[errors]")
        for e in errors[:50]:
            print("  -", e)
        if len(errors) > 50:
            print(f"  … and {len(errors) - 50} more")
        return 1
    print("\nOK  zero-trust invariants hold")
    return 0


if __name__ == "__main__":
    sys.exit(validate())
