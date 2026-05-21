"""Wayback Machine fallback for dead source URLs.

When a frontend draft cites a URL that has since 404'd, the cited content
often still exists in the Internet Archive. This module probes Wayback
directly via the redirect endpoint `web.archive.org/web/0/<url>` and, if
a snapshot exists, returns its URL.

We deliberately avoid the `/wayback/available` JSON API because it is
behind aggressive Cloudflare rate-limiting (HTTP 429 after a single hit
from a fresh IP) and the CDX API frequently times out. The `/web/0/`
endpoint shares the normal Wayback rate-limit budget and is much more
reliable from a script.

Snapshots count as second-hand evidence for the *fact* (the original
content) — extractors that use a snapshot should downgrade the claim's
confidence by one tier and tag the claim `wayback_archived` so it can be
re-resolved when the original URL comes back online (or replaced when a
better source is found).

Usage:
  from scripts.zerotrust.wayback import wayback_lookup, wayback_batch

  snapshot = wayback_lookup("https://example.com/dead-page")
  if snapshot:
      url = snapshot["url"]               # web.archive.org/web/.../...
      timestamp = snapshot["timestamp"]   # YYYYMMDDhhmmss
"""
from __future__ import annotations

import re
import sys
import time
import urllib.error
import urllib.request


# `https://web.archive.org/web/<YYYYMMDDhhmmss>/<original_url>` — the
# canonical wayback URL shape. We parse the timestamp out of the Location
# header on a 302 response to /web/0/.
SNAPSHOT_RE = re.compile(r"/web/(\d{14})/")

TIMEOUT = 12  # seconds
# Wayback's normal serving budget is much higher than the API's; 1 req/s
# is a safe, polite pace that doesn't trip throttling in practice.
SLEEP_BETWEEN_CALLS = 1.0
MAX_RETRIES = 2


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    """Suppress automatic redirect so we can read the Location header."""

    def http_error_301(self, req, fp, code, msg, headers):
        return None

    def http_error_302(self, req, fp, code, msg, headers):
        return None

    def http_error_303(self, req, fp, code, msg, headers):
        return None


def wayback_lookup(url: str) -> dict | None:
    """Return {url, timestamp} of the closest archived snapshot, or None.

    Implementation: GET https://web.archive.org/web/0/<original_url> and
    expect either a 302 (Location header points at the snapshot) or 404
    (no snapshot known to Wayback). Anything else is treated as None.
    """
    probe = f"https://web.archive.org/web/0/{url}"

    opener = urllib.request.build_opener(_NoRedirect)
    for attempt in range(MAX_RETRIES):
        try:
            req = urllib.request.Request(
                probe,
                method="GET",
                headers={
                    "User-Agent": (
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/124.0.0.0 Safari/537.36"
                    ),
                    "Accept": "text/html,*/*;q=0.8",
                },
            )
            # Will raise HTTPError on 302 because _NoRedirect returns None.
            opener.open(req, timeout=TIMEOUT)
            # Unexpected 2xx — shouldn't happen, but handle it.
            return None
        except urllib.error.HTTPError as e:
            if e.code in (301, 302, 303, 307, 308):
                location = e.headers.get("Location", "")
                if not location:
                    return None
                # Sometimes Wayback redirects through a normalisation step
                # before the final snapshot. Resolve relative to the probe.
                if location.startswith("/"):
                    location = f"https://web.archive.org{location}"
                m = SNAPSHOT_RE.search(location)
                if not m:
                    return None
                return {"url": location, "timestamp": m.group(1)}
            if e.code == 404:
                return None  # no snapshot known
            if e.code in (429, 503) and attempt < MAX_RETRIES - 1:
                time.sleep(4 ** (attempt + 1))
                continue
            return None
        except (urllib.error.URLError, TimeoutError):
            if attempt < MAX_RETRIES - 1:
                time.sleep(2)
                continue
            return None
    return None


def wayback_batch(urls: list[str]) -> dict[str, dict | None]:
    """Sequential Wayback probe with polite 1 req/s spacing.

    Returns {url: snapshot_or_None}. Prints progress every 10 lookups so
    long batches don't appear stuck.
    """
    out: dict[str, dict | None] = {}
    n = len(urls)
    for i, url in enumerate(urls, 1):
        out[url] = wayback_lookup(url)
        if i < n:
            time.sleep(SLEEP_BETWEEN_CALLS)
        if i % 10 == 0:
            salvaged = sum(1 for v in out.values() if v)
            print(f"  wayback {i}/{n} (salvaged so far: {salvaged})", file=sys.stderr)
    return out
