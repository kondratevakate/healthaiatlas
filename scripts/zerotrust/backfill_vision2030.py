"""Find primary source URLs for vision2030.ts entries.

frontend/src/data/vision2030.ts has ~46 rows (vision targets, budget
allocations, strategic pillars) with NO src URL — only a free-text
`source` like 'Federal Budget' or 'G42'. The zerotrust extractor cannot
accept any of them as-is.

This script:
  1. Loads vision2030.ts via the TS dumper.
  2. For each item, runs a targeted web search restricted to UAE
     government domains (u.ae, mohap.gov.ae, doh.gov.ae, dha.gov.ae,
     mohap.gov.ae) + Vision-2030 official announcements.
  3. Writes a candidates CSV the editor reviews. Approved URLs are
     pasted into vision2030.ts as `src: '...'`, after which an
     extract_vision2030.py extractor can be written that flows through
     the canonical pipeline.

Backends in priority order (env var):
  1. TAVILY_API_KEY
  2. BRAVE_API_KEY
  3. SERPAPI_KEY

Preview mode (no key set): prints the queries it WOULD run + the
target government domains it WOULD prefer in ranking. Useful for
auditing the search bank before burning quota.

Usage:
  python -m scripts.zerotrust.backfill_vision2030                # preview
  python -m scripts.zerotrust.backfill_vision2030 --limit 3      # 3 hits each
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import subprocess
import sys
import time
from datetime import date
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: 'requests' package needed. pip install requests.", file=sys.stderr)
    sys.exit(2)

REPO_ROOT = Path(__file__).resolve().parents[2]
TS_FILE = REPO_ROOT / "frontend" / "src" / "data" / "vision2030.ts"
DUMPER = REPO_ROOT / "scripts" / "zerotrust" / "dump_ts_module.mjs"
OUT_DIR = Path(r"C:\Projects\data\aiatls\zerotrust\backfill")

# Domains that count as authoritative for UAE Vision 2030.
UAE_OFFICIAL_DOMAINS = [
    "u.ae", "uaecabinet.ae",
    "mohap.gov.ae", "doh.gov.ae", "dha.gov.ae", "ssmc.ae",
    "wam.ae",                       # state news agency
    "mof.gov.ae",                   # Ministry of Finance
    "moccae.gov.ae", "moe.gov.ae",  # other ministries
    "g42.ai",                       # G42 = state-aligned, partial primary
    "mubadala.com",                 # sovereign wealth, partial primary
]


def load_ts_module() -> dict:
    proc = subprocess.run(
        ["node", "--experimental-strip-types", str(DUMPER), str(TS_FILE)],
        capture_output=True, text=True, encoding="utf-8", check=False,
    )
    if proc.returncode != 0:
        sys.stderr.write(proc.stderr)
        raise RuntimeError(f"TS dump failed: rc={proc.returncode}")
    return json.loads(proc.stdout)


def pick_backend() -> tuple[str, str] | None:
    for name, env in (("tavily", "TAVILY_API_KEY"),
                      ("brave", "BRAVE_API_KEY"),
                      ("serpapi", "SERPAPI_KEY")):
        key = os.environ.get(env)
        if key:
            return name, key
    return None


def run_search(backend: str, key: str, query: str, limit: int) -> list[dict]:
    if backend == "tavily":
        r = requests.post(
            "https://api.tavily.com/search",
            json={"api_key": key, "query": query, "max_results": limit,
                  "search_depth": "basic"},
            timeout=20,
        )
        r.raise_for_status()
        return [{"title": h.get("title", ""), "url": h.get("url", ""),
                 "snippet": h.get("content", "")[:300]}
                for h in r.json().get("results", [])]
    if backend == "brave":
        r = requests.get(
            "https://api.search.brave.com/res/v1/web/search",
            headers={"X-Subscription-Token": key},
            params={"q": query, "count": limit},
            timeout=20,
        )
        r.raise_for_status()
        return [{"title": h.get("title", ""), "url": h.get("url", ""),
                 "snippet": h.get("description", "")[:300]}
                for h in (r.json().get("web", {}).get("results") or [])[:limit]]
    # serpapi
    r = requests.get(
        "https://serpapi.com/search.json",
        params={"q": query, "api_key": key, "num": limit, "engine": "google"},
        timeout=20,
    )
    r.raise_for_status()
    return [{"title": h.get("title", ""), "url": h.get("link", ""),
             "snippet": h.get("snippet", "")[:300]}
            for h in (r.json().get("organic_results") or [])[:limit]]


def is_uae_official(url: str) -> bool:
    from urllib.parse import urlparse
    host = (urlparse(url).hostname or "").lower()
    if host.startswith("www."):
        host = host[4:]
    return any(host == d or host.endswith("." + d) for d in UAE_OFFICIAL_DOMAINS)


def queries_for_vision_target(t: dict) -> list[str]:
    label = (t.get("label", {}) or {}).get("en", "") or t.get("id", "")
    return [
        f'site:u.ae UAE Vision 2030 "{label}"',
        f'site:mohap.gov.ae OR site:doh.gov.ae OR site:dha.gov.ae "{label}" target',
        f'UAE "{label}" 2030 official strategy primary source',
    ]


def queries_for_budget(b: dict) -> list[str]:
    focus = (b.get("focus", {}) or {}).get("en", "")
    year = b.get("year", "")
    return [
        f'site:mof.gov.ae UAE budget {year} "{focus}"',
        f'UAE Federal Budget {year} healthcare AI {focus}',
    ]


def queries_for_pillar(p: dict) -> list[str]:
    title = (p.get("title", {}) or {}).get("en", "") or p.get("id", "")
    return [
        f'site:u.ae UAE strategic pillar "{title}" Vision 2030',
        f'UAE Vision 2030 "{title}" strategy official',
    ]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--limit", type=int, default=3, help="results per query")
    args = ap.parse_args()

    data = load_ts_module()
    backend = pick_backend()
    if not backend:
        print("# WARNING: no search-API key set "
              "(TAVILY_API_KEY / BRAVE_API_KEY / SERPAPI_KEY).", file=sys.stderr)
        print("# Running in preview mode — printing queries only.\n", file=sys.stderr)

    print(f"Loaded vision2030.ts:", file=sys.stderr)
    print(f"  visionTargets:      {len(data.get('visionTargets', []))}", file=sys.stderr)
    print(f"  budgetAllocations:  {len(data.get('budgetAllocations', []))}", file=sys.stderr)
    print(f"  strategicPillars:   {len(data.get('strategicPillars', []))}", file=sys.stderr)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUT_DIR / f"vision2030_candidates_{date.today().isoformat()}.csv"

    cols = ["section", "item_id", "item_label", "query", "url", "title",
            "snippet", "uae_official", "backend"]
    rows: list[dict] = []

    sections = [
        ("visionTarget",   data.get("visionTargets", []),
         lambda t: t.get("id", ""),
         lambda t: (t.get("label", {}) or {}).get("en", ""),
         queries_for_vision_target),
        ("budgetAllocation", data.get("budgetAllocations", []),
         lambda b: str(b.get("year", "")),
         lambda b: f"{b.get('year','')} — {(b.get('focus', {}) or {}).get('en','')}",
         queries_for_budget),
        ("strategicPillar", data.get("strategicPillars", []),
         lambda p: p.get("id", ""),
         lambda p: (p.get("title", {}) or {}).get("en", ""),
         queries_for_pillar),
    ]

    for section_name, items, id_fn, label_fn, query_fn in sections:
        for item in items:
            item_id = id_fn(item)
            item_label = label_fn(item)
            for q in query_fn(item):
                if backend is None:
                    rows.append({
                        "section": section_name, "item_id": item_id,
                        "item_label": item_label, "query": q,
                        "url": "", "title": "(preview — no API key)",
                        "snippet": "", "uae_official": "",
                        "backend": "",
                    })
                    continue
                try:
                    hits = run_search(backend[0], backend[1], q, args.limit)
                except Exception as e:
                    print(f"  search err: {type(e).__name__}: {e}", file=sys.stderr)
                    time.sleep(2)
                    continue
                for h in hits:
                    if not h["url"]:
                        continue
                    rows.append({
                        "section": section_name, "item_id": item_id,
                        "item_label": item_label, "query": q,
                        "url": h["url"], "title": h["title"],
                        "snippet": h["snippet"],
                        "uae_official": "yes" if is_uae_official(h["url"]) else "no",
                        "backend": backend[0],
                    })
                time.sleep(0.5)

    with out_path.open("w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=cols)
        w.writeheader()
        w.writerows(rows)

    print(f"\nWrote {out_path} — {len(rows)} candidate rows", file=sys.stderr)
    if backend:
        official = sum(1 for r in rows if r.get("uae_official") == "yes")
        print(f"  UAE-official hits (priority): {official}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
