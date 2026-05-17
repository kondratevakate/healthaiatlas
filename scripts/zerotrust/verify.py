"""Shared URL-alive verification for zerotrust frontend extractors.

The frontend `frontend/src/data/*.ts` files are *drafts* — each claim has
a src URL but those URLs were never independently checked. This module
verifies that every src URL responds and classifies it by domain into
the canonical zerotrust confidence scale `high | medium | low`.

Pipeline (per URL):
  1. GET with browser-like headers (HEAD is too often rejected).
  2. On 4xx/dns_fail/ssl_fail, try Wayback Machine snapshot via
     `wayback_lookup`. If a snapshot exists, the original URL is
     considered "salvaged" — source becomes the snapshot URL, confidence
     is downgraded one tier, claim tagged `wayback_archived`.
  3. If both fail, the record goes to quarantine.csv.

Confidence classification (domain → tier):
  high   – arxiv, *.gov, nature, nejm, jamanetwork, businesswire,
           investor relations subdomains, NIH PMC, FTC, FDA, EMA
  medium – reuters, bloomberg, ft, wsj, techcrunch, axios, fortune,
           fiercehealthcare, modernpathology, named vendor .com sites
  low    – sacra, theinformation, crunchbase, dennisgong.com, blogs
"""
from __future__ import annotations

import re
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

from .wayback import wayback_batch

# ── HTTP probe ──────────────────────────────────────────────────────────────

URL_TIMEOUT = 8  # seconds
BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "close",
}


def check_url(url: str) -> tuple[bool, str]:
    """GET with browser headers + redirect following. Returns (alive, status_tag).

    Status tags follow `http_<code>` / `dns_fail` / `ssl_fail` / `timeout`
    so the extractor can choose to retry-via-Wayback only on truly-stale
    URLs vs anti-bot blocks (where the source is alive in a real browser
    and the URL is fine).
    """
    try:
        req = urllib.request.Request(url, method="GET", headers=BROWSER_HEADERS)
        with urllib.request.urlopen(req, timeout=URL_TIMEOUT) as resp:
            return True, f"http_{resp.status}"
    except urllib.error.HTTPError as e:
        # 403/451/429 → blocked by anti-bot, almost certainly alive in a browser.
        if e.code in (403, 451, 429):
            return True, f"http_{e.code}_blocked"
        return False, f"http_{e.code}"
    except urllib.error.URLError as e:
        reason = str(e.reason)
        if "CERTIFICATE_VERIFY_FAILED" in reason or "SSL" in reason.upper():
            try:
                ctx = ssl.create_default_context()
                ctx.check_hostname = False
                ctx.verify_mode = ssl.CERT_NONE
                req = urllib.request.Request(url, method="GET", headers=BROWSER_HEADERS)
                with urllib.request.urlopen(req, timeout=URL_TIMEOUT, context=ctx) as resp:
                    return True, f"http_{resp.status}_ssl_bad_cert"
            except Exception:
                return False, "ssl_fail"
        if "getaddrinfo" in reason or "Name or service not known" in reason:
            return False, "dns_fail"
        if "timed out" in reason.lower():
            return False, "timeout"
        return False, f"url_err:{reason[:40]}"
    except Exception as e:
        return False, f"{type(e).__name__}:{str(e)[:40]}"


def verify_urls(urls: set[str], workers: int = 8) -> dict[str, tuple[bool, str]]:
    """Parallel verify. Returns {url: (alive, status_tag)}."""
    results: dict[str, tuple[bool, str]] = {}
    urls_list = sorted(urls)
    with ThreadPoolExecutor(max_workers=workers) as ex:
        futures = {ex.submit(check_url, u): u for u in urls_list}
        for i, fut in enumerate(as_completed(futures), 1):
            u = futures[fut]
            try:
                results[u] = fut.result()
            except Exception as e:
                results[u] = (False, f"{type(e).__name__}: {e}")
            if i % 20 == 0:
                print(f"  verified {i}/{len(urls_list)}...", file=sys.stderr)
    return results


def salvage_via_wayback(
    url_status: dict[str, tuple[bool, str]],
) -> dict[str, str]:
    """For every dead URL, try Wayback. If a snapshot exists, mark as alive
    (status `wayback_<YYYYMMDD>`) and return {original_url: snapshot_url}.

    Mutates `url_status` in place — the extractor can re-check liveness
    after calling this. Wayback runs sequentially with polite pacing.
    """
    dead = [u for u, (alive, _) in url_status.items() if not alive]
    if not dead:
        return {}
    print(f"\nLooking up {len(dead)} dead URLs on Wayback Machine ...", file=sys.stderr)
    snapshots = wayback_batch(dead)
    replacements: dict[str, str] = {}
    salvaged = 0
    for orig, snap in snapshots.items():
        if snap and snap.get("url"):
            replacements[orig] = snap["url"]
            ts = snap.get("timestamp", "")[:8]
            url_status[orig] = (True, f"wayback_{ts}")
            salvaged += 1
    print(f"  salvaged {salvaged}/{len(dead)} via Wayback "
          f"({len(dead) - salvaged} stay dead)", file=sys.stderr)
    return replacements


# ── domain → confidence tier ────────────────────────────────────────────────

PRIMARY_DOMAINS = {
    "arxiv.org", "nature.com", "nih.gov", "fda.gov", "sec.gov",
    "europa.eu", "who.int", "pmc.ncbi.nlm.nih.gov",
    "jamanetwork.com", "nejm.org", "thelancet.com", "bmj.com",
    "businesswire.com", "prnewswire.com",
    "ftc.gov", "ema.europa.eu", "cms.gov", "hhs.gov",
    "mhra.gov.uk", "nice.org.uk", "nhs.uk",
    "doh.gov.ae", "mohap.gov.ae", "dha.gov.ae",
}
PRIMARY_SUFFIXES = (".gov", ".gov.uk", ".gov.ae", ".europa.eu", ".gc.ca")
PRIMARY_PATTERNS = (
    re.compile(r"^(investors|ir)\."),
    re.compile(r"^press\."),
)

SECONDARY_DOMAINS = {
    "reuters.com", "bloomberg.com", "ft.com", "wsj.com",
    "techcrunch.com", "axios.com", "fortune.com",
    "fiercehealthcare.com", "fiercebiotech.com", "fiercepharma.com",
    "modernpathology.org",
    "healthcareittoday.com", "spglobal.com", "koreabiomed.com",
    "cancerletter.com", "biospace.com",
    "technode.com", "lbx-summit.com",
    "endpts.com", "statnews.com", "beckershospitalreview.com",
    "modernhealthcare.com", "healthcaredive.com",
    "ema.europa.eu",
    "rockhealth.com",
    "magnitt.com", "wamda.com", "menabytes.com",
}


def is_company_domain(host: str) -> bool:
    parts = host.split(".")
    if len(parts) < 2:
        return False
    if parts[-1] in {"com", "ai", "io", "co", "health", "bio", "tech"}:
        return True
    return False


LOW_DOMAINS = {
    "sacra.com", "theinformation.com", "crunchbase.com",
    "dennisgong.com",
}


def classify_confidence(url: str) -> tuple[str, str]:
    """Return (confidence, source_type). canonical scale high|medium|low.

    source_type is one of the SourceType Literals from schema.py:
      `press_release`, `news`, `official_registry`, `policy`, `vendor_doc`,
      `preprint`, `peer_reviewed`, `filing`, `blog`, `social`, `other`.
    """
    try:
        host = urllib.parse.urlparse(url).hostname or ""
    except Exception:
        return "low", "other"
    host = host.lower()
    if host.startswith("www."):
        host = host[4:]

    if host in PRIMARY_DOMAINS:
        if host in {"arxiv.org", "nature.com", "nejm.org", "jamanetwork.com",
                    "thelancet.com", "bmj.com", "pmc.ncbi.nlm.nih.gov"}:
            return "high", "peer_reviewed"
        if host.endswith(".gov") or host in {"fda.gov", "sec.gov", "cms.gov", "hhs.gov"}:
            return "high", "official_registry"
        if host in {"businesswire.com", "prnewswire.com"}:
            return "high", "press_release"
        return "high", "official_registry"

    if any(host.endswith(s) for s in PRIMARY_SUFFIXES):
        return "high", "policy"
    if any(p.search(host) for p in PRIMARY_PATTERNS):
        return "high", "press_release"

    if host in LOW_DOMAINS:
        return "low", "blog"

    if host in SECONDARY_DOMAINS:
        return "medium", "news"

    if is_company_domain(host):
        return "medium", "vendor_doc"
    return "low", "other"


_CONF_ORDER = ["high", "medium", "low"]


def downgrade(confidence: str) -> str:
    """One tier down on the canonical high/medium/low scale."""
    try:
        idx = _CONF_ORDER.index(confidence)
        return _CONF_ORDER[min(idx + 1, len(_CONF_ORDER) - 1)]
    except ValueError:
        return "low"
