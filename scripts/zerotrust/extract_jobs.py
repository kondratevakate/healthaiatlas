"""Extractor for Healthcare AI Jobs Tracker 2026.xlsx.

Schema (8 columns, two layout variants in the same sheet):

  Layout A (rows 2–~99):
    Company | Category | Open Positions (Count) | Key AI/Tech Roles |
    Location | Remote Friendly | Careers URL | Status

  Layout B (rows ~100+, Remote Friendly column absent):
    Company | Category | Open Positions (Count) | <blank> |
    Location | Careers URL | <blank> | Status

The extractor auto-detects the layout by checking whether column 6 or
column 5 holds the careers URL.

One company row -> one Entity + one Source (careers URL) + N Claims:
  - careers_url
  - open_roles_count  (if a number can be parsed from the count cell)
  - open_roles_description  (key role titles, truncated to 500 chars)
  - hiring_location
  - remote_policy
  - hiring_status

Rows with no careers URL are quarantined (missing_source_url) — we cannot
assert facts without a primary source.
"""
from __future__ import annotations

import re
from pathlib import Path

import openpyxl

from .common import (
    canonical_url, claim_id_for, entity_id_for,
    source_id_for, today,
)
from .predicates import VALID_PREDICATES
from .schema import Claim, Entity, QuarantineRow, Source

JOBS_XLSX = Path(r"C:\Users\kondr\Downloads\Healthcare AI Jobs Tracker 2026.xlsx")
JOBS_SHEET = "Sheet1"
DOMAIN_TAG = "jobs_2026"

# Category → canonical cluster label (same as frontend jobsData.json)
_CAT_MAP: dict[str, str] = {
    "Clinical Documentation AI":   "Clinical AI",
    "Clinical Decision Support AI":"Clinical AI",
    "Clinical AI / LLM":           "Clinical AI",
    "Clinical AI / Radiology":     "Radiology AI",
    "Clinical AI / Real-Time":     "Clinical AI",
    "Clinical AI / Robotics":      "Surgical Robotics",
    "Clinical Documents":          "Clinical AI",
    "AI Research / Foundation Models": "AI Research",
    "AI Research / MedSci":        "AI Research",
    "AI Research & Product":       "AI Research",
    "AI Drug Discovery / Longevity": "AI Drug Discovery",
    "AI Drug Discovery / Oncology": "AI Drug Discovery",
    "Digital Pathology AI":        "Pathology AI",
    "Genomic AI / Clinical":       "Genomic AI",
    "Genomic AI / Oncology":       "Genomic AI",
    "Hospital AI":                 "Hospital Operations AI",
    "Pharma AI / Digital":         "Pharma AI",
    "Surgical Robotics AI":        "Surgical Robotics",
    "Lab Automation AI":           "AI Lab Automation",
    "Humanoid Robotics AI":        "AI Research",
    "Healthcare AI / Prior Auth":  "Healthcare AI Platform",
    "Neurology / Cardiology AI":   "Cardiovascular AI",
    "~15":                         "Clinical AI",
}

_COUNT_RX = re.compile(r"(\d+)")


def _parse_count(raw) -> int | None:
    if raw is None:
        return None
    m = _COUNT_RX.search(str(raw))
    return int(m.group(1)) if m else None


def _normalize_remote(v: str) -> str:
    s = v.strip().lower()
    if s in ("yes", "y"):
        return "Yes"
    if s in ("no", "n"):
        return "No"
    if s == "partial":
        return "Partial"
    return ""


def extract() -> tuple[list[Entity], list[Claim], list[Source], list[QuarantineRow]]:
    wb = openpyxl.load_workbook(JOBS_XLSX, read_only=True, data_only=True)
    ws = wb[JOBS_SHEET]

    entities: dict[str, Entity] = {}
    claims: dict[str, Claim] = {}
    sources: dict[str, Source] = {}
    quarantine: list[QuarantineRow] = []
    seen_companies: set[str] = set()
    audit_date = today()

    def add_claim(
        eid: str, predicate: str, value: str, *,
        unit: str = "", source_id: str, row_label: str,
        confidence: str = "medium",
    ) -> None:
        if not value or value.lower() in {"none", "n/a", ""}:
            return
        if predicate not in VALID_PREDICATES:
            quarantine.append(QuarantineRow(
                reason=f"unknown_predicate:{predicate}",
                extracted_from=row_label, raw=value,
            ))
            return
        cid = claim_id_for(eid, predicate, audit_date, value)
        if cid in claims:
            cur = claims[cid]
            sids = {x for x in cur.source_ids.split(",") if x}
            sids.add(source_id)
            cur.source_ids = ",".join(sorted(sids))
            return
        claims[cid] = Claim(
            claim_id=cid, entity_id=eid, predicate=predicate,
            value=value, value_unit=unit, period=audit_date,
            confidence=confidence, source_ids=source_id,
            domain_tags=DOMAIN_TAG, tags="",
            extracted_from=row_label, extracted_at=audit_date,
        )

    for row_idx, row in enumerate(ws.iter_rows(min_row=2, values_only=True), 2):
        row_label = f"{JOBS_XLSX.name}#{JOBS_SHEET}!R{row_idx}"
        if not any(row):
            continue

        # Pad short rows to 8 columns
        row = tuple(row) + (None,) * max(0, 8 - len(row))

        company = str(row[0] or "").strip()
        if not company:
            continue

        # De-duplicate by company name (first occurrence wins)
        if company in seen_companies:
            continue

        category_raw = str(row[1] or "").strip()
        count_raw    = str(row[2] or "").strip()
        roles_raw    = str(row[3] or "").strip()
        location_raw = str(row[4] or "").strip()
        col5         = str(row[5] or "").strip()
        col6         = str(row[6] or "").strip()
        status_raw   = str(row[7] or "").strip()

        # Auto-detect layout: col6 URL → Layout A; col5 URL → Layout B
        if col6.startswith("http"):
            careers_url  = col6
            remote_raw   = col5
        elif col5.startswith("http"):
            careers_url  = col5
            remote_raw   = ""
        else:
            # No verifiable source URL — quarantine
            quarantine.append(QuarantineRow(
                reason="missing_source_url",
                extracted_from=row_label,
                raw=str(row),
            ))
            continue

        # Skip companies with no active roles
        if any(k in status_raw for k in ("No active", "Shut down", "Acquired by")):
            # Still register entity but skip claims — entity may appear elsewhere
            pass

        seen_companies.add(company)

        # ── Entity ──────────────────────────────────────────────────────────
        eid = entity_id_for(company)
        category = _CAT_MAP.get(category_raw, category_raw) or "Other"
        if eid not in entities:
            entities[eid] = Entity(
                entity_id=eid,
                name=company,
                type="vendor",
                country="",
                domain_tags=DOMAIN_TAG,
                aliases="",
                notes=category,  # store category in notes for regen
            )

        # ── Source (careers page) ────────────────────────────────────────────
        sid = source_id_for(careers_url)
        if sid not in sources:
            sources[sid] = Source(
                source_id=sid,
                url=canonical_url(careers_url),
                url_raw=careers_url,
                publisher=company,
                title=f"{company} Careers",
                published_at="",
                retrieved_at=audit_date,
                access="public",
                source_type="vendor_doc",
                excerpt=f"Careers page for {company}. Status: {status_raw}",
            )

        # ── Claims ───────────────────────────────────────────────────────────
        kwargs = dict(source_id=sid, row_label=row_label)

        add_claim(eid, "careers_url", careers_url, **kwargs, confidence="high")

        count = _parse_count(count_raw)
        if count is not None:
            add_claim(eid, "open_roles_count", str(count), unit="count",
                      **kwargs, confidence="medium")

        if roles_raw:
            add_claim(eid, "open_roles_description", roles_raw[:500], **kwargs)

        if location_raw:
            add_claim(eid, "hiring_location", location_raw, **kwargs)

        remote = _normalize_remote(remote_raw)
        if remote:
            add_claim(eid, "remote_policy", remote, **kwargs, confidence="high")

        if status_raw:
            add_claim(eid, "hiring_status", status_raw[:200], **kwargs)

    wb.close()
    return (
        list(entities.values()),
        list(claims.values()),
        list(sources.values()),
        quarantine,
    )


if __name__ == "__main__":
    e, c, s, q = extract()
    print(f"entities={len(e)}  claims={len(c)}  sources={len(s)}  quarantine={len(q)}")
    if q:
        print("Quarantine sample:")
        for row in q[:5]:
            print(f"  [{row.reason}] {row.extracted_from}: {row.raw[:80]}")
