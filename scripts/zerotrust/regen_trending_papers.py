"""Regenerate frontend/src/data/trendingPapers.ts from Airtable.

Reads the "Trending Papers" table (status=active, sorted by row order) and
writes a typed TypeScript snapshot.  Never edit trendingPapers.ts by hand —
update data in Airtable, then re-run this script.

Usage:
  python scripts/zerotrust/regen_trending_papers.py            # write file
  python scripts/zerotrust/regen_trending_papers.py --dry-run  # print, no write
"""
from __future__ import annotations

import json
import os
import sys
import time
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

REPO_ROOT  = Path(__file__).resolve().parents[2]
ENV_PATHS  = [REPO_ROOT / "backend" / ".env", REPO_ROOT / ".env"]
OUT_PATH   = REPO_ROOT / "frontend" / "src" / "data" / "trendingPapers.ts"
TABLE_NAME = "Trending Papers"
API_BASE   = "https://api.airtable.com/v0"
RATE_SLEEP = 0.15

DRY_RUN = "--dry-run" in sys.argv


# ── Helpers ───────────────────────────────────────────────────────────────────

def load_env() -> None:
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


def airtable_list(table: str, params: dict) -> list[dict]:
    tok    = os.environ["AIRTABLE_TOKEN"]
    base   = os.environ.get("AIRTABLE_BASE_ID") or os.environ["AIRTABLE_BASE"]
    tbl    = urllib.parse.quote(table)
    records: list[dict] = []
    offset = None
    while True:
        p = dict(params)
        if offset:
            p["offset"] = offset
        qs  = urllib.parse.urlencode(p, doseq=True)
        url = f"{API_BASE}/{base}/{tbl}?{qs}"
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {tok}"})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
        records.extend(data.get("records", []))
        offset = data.get("offset")
        if not offset:
            break
        time.sleep(RATE_SLEEP)
    return records


def js_str(s: str) -> str:
    """Escape a string for use in a TS single-quoted string literal."""
    return s.replace("\\", "\\\\").replace("'", "\\'")


# ── Render ────────────────────────────────────────────────────────────────────

def render_ts(papers: list[dict], snapshot_date: str, source_url: str) -> str:
    lines: list[str] = []

    lines += [
        "// GENERATED — do not edit by hand.",
        "// Source: Airtable \"Trending Papers\" table.",
        "// To update: edit rows in Airtable, then run:",
        "//   python scripts/zerotrust/regen_trending_papers.py",
        "//",
        f"// Regenerated: {date.today().isoformat()}",
        "",
        "export interface TrendingPaper {",
        "  /** arXiv subject-area code (cs.LG → \"LG\", math.CO → \"CO\", etc.) */",
        "  category: string;",
        "  title: string;",
        "}",
        "",
        f"/** ISO date of the snapshot shown in the UI. */",
        f"export const TRENDING_PAPERS_DATE = '{js_str(snapshot_date)}';",
        "",
        f"/** Attribution URL for the snapshot source. */",
        f"export const TRENDING_PAPERS_SOURCE = '{js_str(source_url)}';",
        "",
        "export const TRENDING_PAPERS: TrendingPaper[] = [",
    ]

    for p in papers:
        cat   = js_str(p.get("Category", ""))
        title = js_str(p.get("Title", ""))
        lines.append(f"  {{ category: '{cat}', title: '{title}' }},")

    lines += [
        "];",
        "",
        "/** Map category code → human-readable arXiv subject area label */",
        "export const CATEGORY_LABELS: Record<string, string> = {",
    ]

    # Collect unique categories from the data and build the map
    seen_cats: dict[str, str] = {}
    for p in papers:
        cat   = p.get("Category", "")
        label = p.get("Category Label", cat)
        if cat and cat not in seen_cats:
            seen_cats[cat] = label

    for cat, label in sorted(seen_cats.items()):
        lines.append(f"  {cat}: '{js_str(label)}',")

    lines += [
        "};",
        "",
        "/** Broad group for visual grouping — maps to a muted color class */",
        "export const CATEGORY_GROUP: Record<string, 'ml' | 'math' | 'science' | 'other'> = {",
    ]

    group_seen: dict[str, str] = {}
    for p in papers:
        cat   = p.get("Category", "")
        group = p.get("Group", "other")
        if cat and cat not in group_seen:
            group_seen[cat] = group

    for cat, group in sorted(group_seen.items()):
        lines.append(f"  {cat}: '{js_str(group)}',")

    lines += [
        "};",
        "",
    ]

    return "\n".join(lines)


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    load_env()

    print(f"[regen_trending_papers] fetching '{TABLE_NAME}' from Airtable…")
    records = airtable_list(TABLE_NAME, {
        "filterByFormula": "{Status}='active'",
        "fields[]": ["Title", "Category", "Category Label", "Group",
                     "Snapshot Date", "Source URL"],
    })

    if not records:
        print("  ERROR: no active records found — check table name and Status field.")
        sys.exit(1)

    print(f"  {len(records)} active papers")

    # Derive snapshot date and source URL from the first record that has them,
    # falling back to today/emergentmind if missing.
    snapshot_date = ""
    source_url    = ""
    for rec in records:
        f = rec.get("fields", {})
        if not snapshot_date and f.get("Snapshot Date"):
            snapshot_date = f["Snapshot Date"]
        if not source_url and f.get("Source URL"):
            source_url = f["Source URL"]
    snapshot_date = snapshot_date or date.today().isoformat()
    source_url    = source_url    or "https://www.emergentmind.com/"

    papers = [rec.get("fields", {}) for rec in records]
    ts     = render_ts(papers, snapshot_date, source_url)

    if DRY_RUN:
        print("\n── DRY RUN — would write to", OUT_PATH)
        print(ts[:1200], "…")
        return

    OUT_PATH.write_text(ts, encoding="utf-8")
    print(f"  wrote {len(ts):,} chars -> {OUT_PATH.relative_to(REPO_ROOT)}")
    print("[done] commit frontend/src/data/trendingPapers.ts")


if __name__ == "__main__":
    main()
