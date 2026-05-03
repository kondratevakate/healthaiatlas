"""Search the web for new candidate entries for the Discovery page.

For each content type (grants, programs, open_calls, launches, conferences),
runs a curated set of search queries against a web-search API and prints
candidate entries as JSON. Entries are NOT auto-merged into the data files —
output is for human review and paste.

Compliance: every emitted candidate must include a source URL so the editor
can verify before merging. No claim ships without a primary-source link.

Usage
-----
    python scripts/find-discovery-news.py grants
    python scripts/find-discovery-news.py grants programs open_calls
    python scripts/find-discovery-news.py --all
    python scripts/find-discovery-news.py grants --limit 5

Search backend (in priority order; falls through if a key is unset)
    1. Tavily         — set TAVILY_API_KEY
    2. Brave Search   — set BRAVE_API_KEY
    3. SerpAPI        — set SERPAPI_KEY

If none are set, the script prints the queries it WOULD have run and exits.
This is useful for reviewing the query bank without burning API quota.

Adding a new content type
-------------------------
Append a block to QUERY_BANK keyed by the content type. Each block holds:
    - queries: list[str]               — the searches to run
    - schema_hint: str                 — multi-line example of the data shape
                                         the editor should fill out per result
    - prefer_domains: list[str]        — domains to prioritize in ranking
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import dataclass, field
from datetime import date
from typing import Iterable
from urllib.parse import urlparse

import requests


# ---------------------------------------------------------------------------
# Query bank — what to search for, per content type.
# ---------------------------------------------------------------------------

@dataclass
class TypeConfig:
    queries: list[str]
    schema_hint: str
    prefer_domains: list[str] = field(default_factory=list)


QUERY_BANK: dict[str, TypeConfig] = {
    "grants": TypeConfig(
        queries=[
            "NIH healthcare AI grant call 2026",
            "NIH Bridge2AI funding opportunity announcement",
            "ARPA-H open BAA healthcare AI",
            "Horizon Europe health cluster AI funding 2026",
            "ARIA UK funding opportunity health",
            "Wellcome Leap program announcement",
            "Cancer Grand Challenges open call",
            "NIHR AI in Health and Care award",
            "EU AI Act health funding 2026",
        ],
        prefer_domains=[
            "nih.gov", "commonfund.nih.gov", "arpa-h.gov",
            "ec.europa.eu", "aria.org.uk", "wellcomeleap.org",
            "cancergrandchallenges.org", "nihr.ac.uk",
        ],
        schema_hint="""# Paste-ready entry for frontend/src/data/grants.ts
{
  id: '<slug>',
  title: '<title>',
  funder: '<funder org>',
  region: 'US' | 'EU' | 'UK' | 'UAE' | 'Global',
  amount: '<e.g. $30M+ or rolling>',
  deadline: '<ISO yyyy-mm-dd or "rolling">',
  eligibility: '<one sentence>',
  roles: ['founder', 'student', ...],
  src: '<funder URL>',
  notes: '<one-line context>',
},""",
    ),
    "programs": TypeConfig(
        queries=[
            "Y Combinator healthtech batch 2026",
            "Plug and Play Health accelerator cohort 2026",
            "Hub71 HealthTech application",
            "MIT Hacking Medicine grand hack 2026",
            "Stanford StartX Med",
            "Roche startup creator accelerator",
            "NIH AI ML postdoctoral fellowship",
            "Berkeley SkyDeck health cohort",
            "EIT Health accelerator open call",
        ],
        prefer_domains=[
            "ycombinator.com", "plugandplaytechcenter.com",
            "hub71.com", "hackingmedicine.mit.edu", "startx.com",
            "roche.com", "training.nih.gov", "skydeck.berkeley.edu",
            "eithealth.eu",
        ],
        schema_hint="""# Paste-ready entry for frontend/src/data/programs.ts
{
  id: '<slug>',
  title: '<program name>',
  organizer: '<org>',
  region: 'US' | 'EU' | 'UK' | 'UAE' | 'Global',
  type: 'accelerator' | 'fellowship' | 'incubator' | 'residency',
  duration: '<e.g. 12 weeks>',
  cohortDates: '<optional>',
  audience: '<one sentence>',
  roles: ['founder', 'student', ...],
  src: '<program URL>',
  notes: '<one-line context>',
},""",
    ),
    "open_calls": TypeConfig(
        queries=[
            "FDA pre-submission program AI medical device",
            "NHS AI Diagnostic Fund open call",
            "MHRA AI-Airlock regulatory sandbox application",
            "EU AI Act regulatory sandbox healthcare",
            "DHA Dubai innovation licensing pilot",
            "ARPA-H BAA healthcare innovation 2026",
            "FDA AI ML Software as Medical Device",
            "European Health Data Space pilot",
            "AHRQ patient safety RFP AI",
        ],
        prefer_domains=[
            "fda.gov", "england.nhs.uk", "transform.england.nhs.uk",
            "gov.uk", "digital-strategy.ec.europa.eu",
            "dha.gov.ae", "arpa-h.gov", "ahrq.gov",
        ],
        schema_hint="""# Paste-ready entry for frontend/src/data/openCalls.ts
{
  id: '<slug>',
  title: '<call title>',
  issuer: '<issuer org>',
  region: 'US' | 'EU' | 'UK' | 'UAE' | 'Global',
  type: 'rfp' | 'pilot' | 'sandbox' | 'challenge' | 'tender',
  deadline: '<ISO date or "rolling">',
  audience: '<one sentence>',
  roles: ['founder', 'business', ...],
  src: '<URL>',
  notes: '<one-line context>',
},""",
    ),
    "launches": TypeConfig(
        queries=[
            "healthcare AI product launch 2026",
            "FDA cleared AI medical device 2026",
            "AI radiology platform launch 2026",
            "AI drug discovery startup announcement 2026",
            "AI patient monitoring platform launch",
            "FierceBiotech AI launch 2026",
            "STAT News AI launch 2026",
            "TechCrunch healthcare AI startup launch 2026",
        ],
        prefer_domains=[
            "fiercebiotech.com", "fiercehealthcare.com",
            "statnews.com", "techcrunch.com",
            "fda.gov", "businesswire.com", "prnewswire.com",
        ],
        schema_hint="""# Paste-ready entry for frontend/src/data/launches.ts
{
  id: '<slug>',
  name: '<product name>',
  tagline: '<short tagline>',
  description: '<one or two sentences>',
  topics: ['<topic>', ...],
  logo: '<emoji or empty>',
  launchDate: new Date('<yyyy-mm-dd>'),
  website: '<product URL>',
  sourceUrl: '<press URL>',
  whyItMatters: '<one sentence>',
  curatedDate: '<today ISO>',
},""",
    ),
    "conferences": TypeConfig(
        queries=[
            "healthcare AI conference 2026",
            "AI medicine summit 2026",
            "MICCAI conference dates 2026",
            "HIMSS AI healthcare 2026",
            "RSNA AI radiology 2026",
            "GITEX healthcare 2026",
            "Arab Health AI 2026",
            "NEJM AI conference 2026",
            "AAAI medicine workshop 2026",
        ],
        prefer_domains=[
            "miccai.org", "himss.org", "rsna.org",
            "gitex.com", "arabhealthonline.com",
            "ai.nejm.org", "aaai.org",
        ],
        schema_hint="""# Paste-ready entry for frontend/src/data/conferences.ts
{
  id: '<slug>',
  name: { en: '<English name>', ar: '<Arabic name>' },
  date: '<yyyy-mm-dd>',
  endDate: '<yyyy-mm-dd, optional>',
  location: '<city, country>',
  type: 'conference' | 'meetup' | 'workshop' | 'demo-day',
  topics: ['<topic>', ...],
  website: '<URL>',
  description: { en: '<one sentence>', ar: '<one sentence>' },
},""",
    ),
}


# ---------------------------------------------------------------------------
# Search backends.
# ---------------------------------------------------------------------------

@dataclass
class Hit:
    title: str
    url: str
    snippet: str
    source: str  # which backend produced this hit
    domain: str

    def asdict(self) -> dict:
        return {
            "title": self.title,
            "url": self.url,
            "snippet": self.snippet,
            "source": self.source,
            "domain": self.domain,
        }


def _domain_of(url: str) -> str:
    try:
        return urlparse(url).netloc.lower().lstrip("www.")
    except Exception:
        return ""


def search_tavily(query: str, api_key: str, limit: int) -> list[Hit]:
    resp = requests.post(
        "https://api.tavily.com/search",
        json={
            "api_key": api_key,
            "query": query,
            "max_results": limit,
            "search_depth": "basic",
            "include_answer": False,
        },
        timeout=20,
    )
    resp.raise_for_status()
    data = resp.json()
    hits: list[Hit] = []
    for r in data.get("results", []):
        hits.append(Hit(
            title=r.get("title", ""),
            url=r.get("url", ""),
            snippet=r.get("content", "")[:300],
            source="tavily",
            domain=_domain_of(r.get("url", "")),
        ))
    return hits


def search_brave(query: str, api_key: str, limit: int) -> list[Hit]:
    resp = requests.get(
        "https://api.search.brave.com/res/v1/web/search",
        headers={"X-Subscription-Token": api_key, "Accept": "application/json"},
        params={"q": query, "count": limit},
        timeout=20,
    )
    resp.raise_for_status()
    data = resp.json()
    hits: list[Hit] = []
    for r in (data.get("web", {}).get("results") or [])[:limit]:
        hits.append(Hit(
            title=r.get("title", ""),
            url=r.get("url", ""),
            snippet=r.get("description", "")[:300],
            source="brave",
            domain=_domain_of(r.get("url", "")),
        ))
    return hits


def search_serpapi(query: str, api_key: str, limit: int) -> list[Hit]:
    resp = requests.get(
        "https://serpapi.com/search.json",
        params={"q": query, "api_key": api_key, "num": limit, "engine": "google"},
        timeout=20,
    )
    resp.raise_for_status()
    data = resp.json()
    hits: list[Hit] = []
    for r in (data.get("organic_results") or [])[:limit]:
        hits.append(Hit(
            title=r.get("title", ""),
            url=r.get("link", ""),
            snippet=r.get("snippet", "")[:300],
            source="serpapi",
            domain=_domain_of(r.get("link", "")),
        ))
    return hits


def pick_backend() -> tuple[str, str] | None:
    """Return (name, key) of the first available backend, or None."""
    for name, env in (("tavily", "TAVILY_API_KEY"), ("brave", "BRAVE_API_KEY"), ("serpapi", "SERPAPI_KEY")):
        key = os.environ.get(env)
        if key:
            return name, key
    return None


def run_search(backend: str, key: str, query: str, limit: int) -> list[Hit]:
    if backend == "tavily":
        return search_tavily(query, key, limit)
    if backend == "brave":
        return search_brave(query, key, limit)
    if backend == "serpapi":
        return search_serpapi(query, key, limit)
    raise RuntimeError(f"unknown backend: {backend}")


# ---------------------------------------------------------------------------
# Ranking + dedup.
# ---------------------------------------------------------------------------

def rank_and_dedup(hits: Iterable[Hit], prefer_domains: list[str], limit: int) -> list[Hit]:
    seen_urls: set[str] = set()
    boosted: list[tuple[int, Hit]] = []
    for h in hits:
        if not h.url or h.url in seen_urls:
            continue
        seen_urls.add(h.url)
        # Higher score = preferred. Negate for sort stability.
        score = 1 if any(d in h.domain for d in prefer_domains) else 0
        boosted.append((-score, h))
    boosted.sort(key=lambda pair: pair[0])
    return [h for _, h in boosted[:limit]]


# ---------------------------------------------------------------------------
# Main entrypoint.
# ---------------------------------------------------------------------------

def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("types", nargs="*", choices=list(QUERY_BANK.keys()),
                        help="Content types to search for. If omitted, use --all.")
    parser.add_argument("--all", action="store_true", help="Run every content type.")
    parser.add_argument("--limit", type=int, default=8, help="Max hits per query (default 8).")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print queries that would run; do not call any API.")
    args = parser.parse_args(argv)

    types = list(QUERY_BANK.keys()) if args.all else args.types
    if not types:
        parser.error("specify at least one content type, or pass --all")

    backend = pick_backend()
    dry_run = args.dry_run or backend is None
    if dry_run and not args.dry_run:
        print("# WARNING: no search-API key set (TAVILY_API_KEY / BRAVE_API_KEY / SERPAPI_KEY).", file=sys.stderr)
        print("# Falling back to dry-run: queries will be printed, no network calls made.", file=sys.stderr)
        print("", file=sys.stderr)

    today = date.today().isoformat()
    print(f"# find-discovery-news.py — {today}")
    if backend and not dry_run:
        print(f"# backend: {backend[0]}")
    print()

    for type_name in types:
        cfg = QUERY_BANK[type_name]
        print(f"## {type_name}")
        print()
        print(cfg.schema_hint)
        print()

        all_hits: list[Hit] = []
        for q in cfg.queries:
            print(f"### query: {q}")
            if dry_run:
                print("  (dry-run — no results)")
                print()
                continue
            try:
                hits = run_search(backend[0], backend[1], q, args.limit)
            except requests.HTTPError as e:
                print(f"  HTTP error: {e}", file=sys.stderr)
                continue
            except Exception as e:
                print(f"  error: {e}", file=sys.stderr)
                continue
            all_hits.extend(hits)
            print(json.dumps([h.asdict() for h in hits], indent=2, ensure_ascii=False))
            print()

        if not dry_run:
            ranked = rank_and_dedup(all_hits, cfg.prefer_domains, limit=args.limit * 2)
            print(f"### {type_name} — top candidates (deduped, preferred-domains first)")
            print(json.dumps([h.asdict() for h in ranked], indent=2, ensure_ascii=False))
            print()

    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
