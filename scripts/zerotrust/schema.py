"""Zero-Trust dataset schema.

Three tables, normalized, Airtable-ready:

  entities   — canonical subjects (one row per company/org/dataset/regulator)
  claims     — facts about an entity (one row per fact, FK -> entity + source[s])
  sources    — primary evidence URLs (one row per URL, reused across claims)

Invariants enforced by validate.py:
  - every claim has >= 1 source_id
  - every source_id resolves to a row in sources.csv
  - every claim.entity_id resolves to a row in entities.csv
  - every source has url + retrieved_at
  - no duplicate source URLs (deduped on normalized URL)
  - no orphan entities (entity with zero claims is fine but flagged)

Confidence scale (locked, canonical across all domains):  high | medium | low
"""
from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Literal

Confidence = Literal["high", "medium", "low"]
EntityType = Literal[
    "vendor", "pharma", "hospital", "government", "regulator",
    "research_lab", "academic_group", "open_dataset", "open_benchmark",
    "open_source_tool", "foundation_model", "investor", "conference", "other",
]
SourceType = Literal[
    "press_release", "news", "official_registry", "policy",
    "vendor_doc", "preprint", "peer_reviewed", "filing",
    "blog", "social", "other",
]
Access = Literal["public", "paywall", "registration", "archive"]


@dataclass
class Entity:
    entity_id: str          # slug, stable across domains: "insilico-medicine"
    name: str
    type: EntityType
    country: str = ""       # ISO-3166-1 or "Global"
    city: str = ""
    founded_year: int | None = None
    website: str = ""
    domain_tags: str = ""   # comma-separated: "ai_lifesci,oncology"
    aliases: str = ""       # comma-separated alt names seen in source xlsx
    notes: str = ""


@dataclass
class Claim:
    claim_id: str           # deterministic hash of (entity_id, predicate, period, value)
    entity_id: str          # FK -> entities.entity_id
    predicate: str          # from PREDICATES taxonomy (see predicates.py)
    value: str              # canonical string form; for numbers, the number
    value_unit: str = ""    # "usd_m", "year", "count", "" for free text
    period: str = ""        # ISO date or year or year-range: "2024-06" / "2024" / "2023..2025"
    jurisdiction: str = ""  # "US" / "AE-Dubai" / "EU" / "Global"
    confidence: Confidence = "medium"
    source_ids: str = ""    # comma-separated -> sources.source_id
    domain_tags: str = ""   # which hub(s) this claim feeds: "ai_lifesci"
    tags: str = ""          # free-form, comma-separated
    extracted_from: str = ""  # path to xlsx + sheet + row, for audit
    extracted_at: str = ""    # ISO date


@dataclass
class Source:
    source_id: str          # deterministic hash of normalized url
    url: str                # canonical (trailing slash stripped, scheme lowered)
    url_raw: str = ""       # first-seen original url
    publisher: str = ""
    title: str = ""
    published_at: str = ""  # ISO date or empty
    retrieved_at: str = ""  # ISO date — REQUIRED
    access: Access = "public"
    source_type: SourceType = "other"
    excerpt: str = ""       # short quote that anchors the claim


@dataclass
class QuarantineRow:
    """A row that was rejected during extract — kept for human review."""
    reason: str             # "missing_source_url" / "unparseable_date" / ...
    extracted_from: str
    raw: str                # JSON of the original row


ENTITY_COLS = list(Entity.__dataclass_fields__.keys())
CLAIM_COLS = list(Claim.__dataclass_fields__.keys())
SOURCE_COLS = list(Source.__dataclass_fields__.keys())
QUARANTINE_COLS = list(QuarantineRow.__dataclass_fields__.keys())


def as_row(obj) -> dict:
    return asdict(obj)
