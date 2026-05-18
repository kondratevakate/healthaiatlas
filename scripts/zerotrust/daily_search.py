"""Daily web-search enrichment: surface new claims for entities in Airtable.

For each entity in the canonical store, run a small set of web queries
("<EntityName> healthcare AI 2026", "<EntityName> partnership", etc.).
Each result becomes a *candidate* new Claim — emitted to a CSV that the
editor reviews before promotion into Airtable.

We do not auto-upload. The whole point of zerotrust is that nothing
reaches the canonical store without a human-reviewable trail.

Pipeline:
  Airtable (entities) -> web search per entity -> dedup vs known URLs ->
  classify_confidence -> candidates_<date>.csv -> human review -> CSV
  merged into the next to_airtable run.

Backends (in priority order, fall-through):
  1. Tavily          set TAVILY_API_KEY
  2. Brave Search    set BRAVE_API_KEY
  3. SerpAPI         set SERPAPI_KEY

If no key is set the script prints the queries it WOULD have run and
exits — useful for reviewing the query bank without burning quota.

Usage:
  python -m scripts.zerotrust.daily_search                    # preview queries
  python -m scripts.zerotrust.daily_search --domain ai_lifesci --limit 5
                                                              # run for 5 entities
  python -m scripts.zerotrust.daily_search --domain oncology --top-n 20
                                                              # top 20 by claim count
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
from dataclasses import dataclass
from datetime import date
from pathlib import Path

from .from_airtable import (
    TABLE_IDS, airtable_to_canonical, fetch_all, filter_by_domain, load_env,
)
from .verify import classify_confidence

# Import the existing search backends. find-discovery-news.py is at the
# scripts/ root and uses the `requests` library; mirror its dispatch here
# to keep the search-API surface a single source of truth.
try:
    import requests
except ImportError:
    print("ERROR: 'requests' package needed. pip install requests.", file=sys.stderr)
    sys.exit(2)

REPO_ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = Path(r"C:\Projects\data\aiatls\zerotrust\daily")
QUERY_TEMPLATES = [
    "{name} healthcare AI 2026",
    "{name} FDA clearance",
    "{name} funding round",
    "{name} partnership",
]


@dataclass
class Hit:
    title: str
    url: str
    snippet: str
    backend: str

    @property
    def domain(self) -> str:
        try:
            return urllib.parse.urlparse(self.url).hostname or ""
        except Exception:
            return ""


def _domain(url: str) -> str:
    try:
        return urllib.parse.urlparse(url).hostname or ""
    except Exception:
        return ""


def search_tavily(query: str, key: str, limit: int) -> list[Hit]:
    r = requests.post(
        "https://api.tavily.com/search",
        json={"api_key": key, "query": query, "max_results": limit,
              "search_depth": "basic", "include_answer": False},
        timeout=20,
    )
    r.raise_for_status()
    return [Hit(h.get("title", ""), h.get("url", ""), h.get("content", "")[:300], "tavily")
            for h in r.json().get("results", [])]


def search_brave(query: str, key: str, limit: int) -> list[Hit]:
    r = requests.get(
        "https://api.search.brave.com/res/v1/web/search",
        headers={"X-Subscription-Token": key, "Accept": "application/json"},
        params={"q": query, "count": limit},
        timeout=20,
    )
    r.raise_for_status()
    return [Hit(h.get("title", ""), h.get("url", ""), h.get("description", "")[:300], "brave")
            for h in (r.json().get("web", {}).get("results") or [])[:limit]]


def search_serpapi(query: str, key: str, limit: int) -> list[Hit]:
    r = requests.get(
        "https://serpapi.com/search.json",
        params={"q": query, "api_key": key, "num": limit, "engine": "google"},
        timeout=20,
    )
    r.raise_for_status()
    return [Hit(h.get("title", ""), h.get("link", ""), h.get("snippet", "")[:300], "serpapi")
            for h in (r.json().get("organic_results") or [])[:limit]]


def pick_backend() -> tuple[str, str] | None:
    for name, env in (("tavily", "TAVILY_API_KEY"),
                      ("brave", "BRAVE_API_KEY"),
                      ("serpapi", "SERPAPI_KEY")):
        key = os.environ.get(env)
        if key:
            return name, key
    return None


def run_search(backend: str, key: str, query: str, limit: int) -> list[Hit]:
    if backend == "tavily":
        return search_tavily(query, key, limit)
    if backend == "brave":
        return search_brave(query, key, limit)
    return search_serpapi(query, key, limit)


# Domains we never want to emit even if Tavily ranks them high.
SPAM_DOMAINS = {
    "wikipedia.org",  # not primary
    "linkedin.com",   # rarely cite-worthy in this context
    "facebook.com", "twitter.com", "x.com", "instagram.com",
    "youtube.com", "tiktok.com",
    "indeed.com", "glassdoor.com",
    "pinterest.com",
    "quora.com", "reddit.com",
    "medium.com",  # blog overflow, rarely primary
}


def domain_blocked(url: str) -> bool:
    host = _domain(url).lower().lstrip("www.")
    for s in SPAM_DOMAINS:
        if host == s or host.endswith("." + s):
            return True
    return False


def known_urls(sources: list[dict]) -> set[str]:
    """URL set we already have in Airtable — skip re-emitting these."""
    out: set[str] = set()
    for s in sources:
        u = s.get("url") or ""
        if u:
            out.add(u.rstrip("/"))
    return out


def candidates_for_entity(
    entity: dict, backend: tuple[str, str] | None, limit: int,
    known: set[str],
) -> list[dict]:
    """Run the query bank for one entity and return candidate Claim rows."""
    name = entity.get("name", "")
    if not name:
        return []
    out = []
    for tmpl in QUERY_TEMPLATES:
        q = tmpl.format(name=name)
        if backend is None:
            # Preview mode — emit one row noting the query.
            out.append({
                "entity_id": entity.get("external_id", ""),
                "entity_name": name,
                "query": q,
                "title": "(no API key — preview only)",
                "url": "",
                "snippet": "",
                "confidence": "",
                "source_type": "",
                "domain": "",
                "backend": "",
                "is_new": "",
            })
            continue
        try:
            hits = run_search(backend[0], backend[1], q, limit)
        except Exception as e:
            print(f"  search err for '{q}': {type(e).__name__}: {e}", file=sys.stderr)
            time.sleep(2)
            continue
        for h in hits:
            if not h.url or domain_blocked(h.url):
                continue
            is_new = h.url.rstrip("/") not in known
            confidence, source_type = classify_confidence(h.url)
            out.append({
                "entity_id": entity.get("external_id", ""),
                "entity_name": name,
                "query": q,
                "title": h.title,
                "url": h.url,
                "snippet": h.snippet,
                "confidence": confidence,
                "source_type": source_type,
                "domain": h.domain,
                "backend": h.backend,
                "is_new": "yes" if is_new else "no",
            })
        time.sleep(0.5)  # polite pacing between queries
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--domain", help="restrict to one domain_tag (e.g. ai_lifesci, oncology)")
    ap.add_argument("--top-n", type=int, default=10,
                    help="run search on the top-N entities by claim count (default 10)")
    ap.add_argument("--limit", type=int, default=3,
                    help="results per query (default 3)")
    args = ap.parse_args()

    token, base = load_env()
    backend = pick_backend()
    if not backend:
        print("# WARNING: no search-API key set "
              "(TAVILY_API_KEY / BRAVE_API_KEY / SERPAPI_KEY).", file=sys.stderr)
        print("# Running in preview mode — printing queries only.", file=sys.stderr)

    print("Fetching entities + sources from Airtable ...", file=sys.stderr)
    raw_entities = fetch_all(base, TABLE_IDS["Entities"], token)
    raw_sources = fetch_all(base, TABLE_IDS["Sources"], token)
    raw_claims = fetch_all(base, TABLE_IDS["Claims"], token)
    raw_tags = fetch_all(base, TABLE_IDS["Tags"], token)
    entities = airtable_to_canonical(raw_entities, "entity")
    sources = airtable_to_canonical(raw_sources, "source")
    claims = airtable_to_canonical(raw_claims, "claim")
    tags = airtable_to_canonical(raw_tags, "tag")
    tag_by_aid = {r["id"]: t for r, t in zip(raw_tags, tags)}

    # Domain filter (entity-level): an entity is "in" a domain if any of its
    # claims is tagged with that domain. We compute that from claims.
    if args.domain:
        filtered_claims = filter_by_domain(claims, tag_by_aid, args.domain)
        entity_ids_in_domain: set[str] = set()
        for c in filtered_claims:
            for t in c["tags"]:
                if isinstance(t, str) and t.startswith("entity:"):
                    entity_ids_in_domain.add(t[len("entity:"):].strip())
        entities = [e for e in entities if e["external_id"] in entity_ids_in_domain]
        print(f"  filtered to {len(entities)} entities in domain={args.domain}",
              file=sys.stderr)

    # Sort by total_claims desc, take top-N
    entities.sort(key=lambda e: (e.get("total_claims") or 0), reverse=True)
    entities = entities[: args.top_n]
    print(f"  running on top {len(entities)} entities by claim count", file=sys.stderr)

    known = known_urls(sources)
    print(f"  {len(known)} URLs already in Airtable — will skip these", file=sys.stderr)

    all_candidates: list[dict] = []
    for i, e in enumerate(entities, 1):
        if backend:
            print(f"  [{i}/{len(entities)}] {e['name']!r} ...", file=sys.stderr)
        all_candidates.extend(candidates_for_entity(e, backend, args.limit, known))

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUT_DIR / f"candidates_{date.today().isoformat()}.csv"
    cols = ["entity_id", "entity_name", "query", "title", "url",
            "snippet", "confidence", "source_type", "domain", "backend", "is_new"]
    with out_path.open("w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=cols)
        w.writeheader()
        w.writerows(all_candidates)
    print(f"\nWrote {out_path} — {len(all_candidates)} candidate rows", file=sys.stderr)

    # Summary
    if backend:
        new = sum(1 for r in all_candidates if r.get("is_new") == "yes")
        primary = sum(1 for r in all_candidates if r.get("confidence") == "high")
        print(f"  new (URL not in Airtable):    {new}", file=sys.stderr)
        print(f"  high-confidence by domain:    {primary}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    sys.exit(main())
