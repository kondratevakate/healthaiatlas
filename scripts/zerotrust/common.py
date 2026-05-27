"""Shared helpers: slugify, deterministic IDs, URL canonicalization, CSV I/O."""
from __future__ import annotations

import csv
import hashlib
import re
from datetime import date
from pathlib import Path
from typing import Iterable
from urllib.parse import urlsplit, urlunsplit

from .schema import (
    Entity, Claim, Source, QuarantineRow,
    ENTITY_COLS, CLAIM_COLS, SOURCE_COLS, QUARANTINE_COLS,
    as_row,
)

# ─── slug / ID ────────────────────────────────────────────────────────────────

_SLUG_RX = re.compile(r"[^a-z0-9]+")


def slug(text: str) -> str:
    """Slugify to ascii-lowercase-hyphen.  'G42 Healthcare' -> 'g42-healthcare'."""
    if not text:
        return ""
    s = text.strip().lower()
    s = s.replace("&", "and")
    s = _SLUG_RX.sub("-", s).strip("-")
    return s or "unknown"


def hash_id(prefix: str, *parts: str, length: int = 10) -> str:
    """Stable short hash, prefixed.  hash_id('c', entity_id, predicate, period) -> 'c_a1b2c3d4e5'."""
    h = hashlib.sha1("\x1f".join(parts).encode("utf-8")).hexdigest()[:length]
    return f"{prefix}_{h}"


# ─── URL canonicalization ────────────────────────────────────────────────────

def canonical_url(url: str) -> str:
    """Normalize a URL so the same source resolves to the same source_id.

    Rules:
      - lowercase scheme + host
      - strip default ports
      - strip trailing slash on path
      - drop fragment
      - keep query (it often matters: ?id=…)

    Does NOT follow redirects (offline).
    """
    if not url:
        return ""
    u = url.strip()
    if "://" not in u:
        u = "https://" + u
    try:
        parts = urlsplit(u)
    except ValueError:
        return u
    host = parts.hostname or ""
    if parts.port and not (
        (parts.scheme == "http" and parts.port == 80)
        or (parts.scheme == "https" and parts.port == 443)
    ):
        host = f"{host}:{parts.port}"
    path = parts.path.rstrip("/") or "/"
    return urlunsplit((parts.scheme.lower(), host.lower(), path, parts.query, ""))


def source_id_for(url: str) -> str:
    """Same URL -> same source_id, deterministically."""
    return hash_id("s", canonical_url(url), length=10)


def claim_id_for(entity_id: str, predicate: str, period: str, value: str) -> str:
    return hash_id("c", entity_id, predicate, period, value, length=10)


def entity_id_for(name: str, override_slug: str | None = None) -> str:
    return override_slug or slug(name)


# ─── date helpers ────────────────────────────────────────────────────────────

def to_iso_date(v) -> str:
    """Best-effort conversion. Returns '' if it can't be parsed cleanly."""
    if v is None or v == "":
        return ""
    if isinstance(v, date):
        return v.isoformat()
    s = str(v).strip()
    # excel decimal year ("2023.7479") — treat as year+month
    if re.fullmatch(r"\d{4}\.\d+", s):
        year = int(float(s))
        frac = float(s) - year
        month = max(1, min(12, int(round(frac * 12)) + 1))
        return f"{year:04d}-{month:02d}"
    # plain year
    if re.fullmatch(r"\d{4}(\.0+)?", s):
        return f"{int(float(s)):04d}"
    # ISO-ish already
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", s):
        return s
    if re.fullmatch(r"\d{4}-\d{2}", s):
        return s
    return ""


def today() -> str:
    return date.today().isoformat()


# ─── CSV I/O ─────────────────────────────────────────────────────────────────

def write_csv(path: Path, rows: Iterable[dict], cols: list[str]) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    n = 0
    with path.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        for r in rows:
            w.writerow(r)
            n += 1
    return n


def write_entities(path: Path, items: Iterable[Entity]) -> int:
    return write_csv(path, (as_row(e) for e in items), ENTITY_COLS)


def write_claims(path: Path, items: Iterable[Claim]) -> int:
    return write_csv(path, (as_row(c) for c in items), CLAIM_COLS)


def write_sources(path: Path, items: Iterable[Source]) -> int:
    return write_csv(path, (as_row(s) for s in items), SOURCE_COLS)


def write_quarantine(path: Path, items: Iterable[QuarantineRow]) -> int:
    return write_csv(path, (as_row(q) for q in items), QUARANTINE_COLS)


# ─── CSV readers ─────────────────────────────────────────────────────────────
# Used by build.py to ingest pre-generated per-domain CSVs from TS extractors.
# Writers are the source of truth for column order; readers must tolerate
# missing optional columns (extrasaction-equivalent: .get with defaults).

def _read_csv(path: Path) -> list[dict]:
    with path.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def read_entities(path: Path) -> list[Entity]:
    out = []
    for r in _read_csv(path):
        fy = r.get("founded_year", "")
        out.append(Entity(
            entity_id=r["entity_id"],
            name=r["name"],
            type=r.get("type", "other"),
            country=r.get("country", ""),
            city=r.get("city", ""),
            founded_year=int(fy) if fy else None,
            website=r.get("website", ""),
            domain_tags=r.get("domain_tags", ""),
            aliases=r.get("aliases", ""),
            notes=r.get("notes", ""),
        ))
    return out


def read_claims(path: Path) -> list[Claim]:
    out = []
    for r in _read_csv(path):
        out.append(Claim(
            claim_id=r["claim_id"],
            entity_id=r["entity_id"],
            predicate=r["predicate"],
            value=r.get("value", ""),
            value_unit=r.get("value_unit", ""),
            period=r.get("period", ""),
            jurisdiction=r.get("jurisdiction", ""),
            confidence=r.get("confidence", "medium"),
            source_ids=r.get("source_ids", ""),
            domain_tags=r.get("domain_tags", ""),
            tags=r.get("tags", ""),
            notes=r.get("notes", ""),
            extracted_from=r.get("extracted_from", ""),
            extracted_at=r.get("extracted_at", ""),
        ))
    return out


def read_sources(path: Path) -> list[Source]:
    out = []
    for r in _read_csv(path):
        out.append(Source(
            source_id=r["source_id"],
            url=r["url"],
            url_raw=r.get("url_raw", ""),
            publisher=r.get("publisher", ""),
            title=r.get("title", ""),
            published_at=r.get("published_at", ""),
            retrieved_at=r.get("retrieved_at", ""),
            access=r.get("access", "public"),
            source_type=r.get("source_type", "other"),
            excerpt=r.get("excerpt", ""),
        ))
    return out


def read_quarantine(path: Path) -> list[QuarantineRow]:
    out = []
    for r in _read_csv(path):
        out.append(QuarantineRow(
            reason=r.get("reason", ""),
            extracted_from=r.get("extracted_from", ""),
            raw=r.get("raw", ""),
        ))
    return out
