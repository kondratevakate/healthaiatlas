"""Extractor for ai_arch_revenue_data_final.xlsx.

This xlsx is already structured as a zero-trust dataset:
  - Sources sheet: claim_id, entity, metric, value, unit, period, publisher, url, retrieved, confidence, quote
  - Architectures sheet: arch + paper_url
  - Products sheet: product + company + revenue_m_usd with FK -> Sources.claim_id (revenue_source_claim)
  - Hardware sheet: vendor + chip + workload + revenue_source_claim FK
  - WorkloadPapers sheet: paper title/url per workload

Strategy:
  1. Walk Sources first -> build a (claim_id -> Source) registry.
  2. Walk Architectures -> emit one entity per arch + a "publication" claim citing paper_url.
  3. Walk Products -> emit one entity per product, claims for revenue / valuation that *reuse*
     the source built from the referenced Sources row.

Output: lists of (entities, claims, sources, quarantine).
"""
from __future__ import annotations

from pathlib import Path

import openpyxl

from .common import (
    canonical_url, claim_id_for, entity_id_for, slug,
    source_id_for, to_iso_date, today,
)
from .predicates import VALID_PREDICATES
from .schema import Claim, Entity, QuarantineRow, Source

XLSX = Path(r"C:\Projects\data\aiatls\ai_arch_revenue_data_final.xlsx")
DOMAIN_TAG = "ai_arch_revenue"


def _conf_from_primary_secondary(v: str | None) -> str:
    s = (v or "").strip().upper()
    return {"PRIMARY": "high", "SECONDARY": "medium"}.get(s, "low")


def _metric_to_predicate(metric: str | None, unit: str | None) -> tuple[str, str]:
    """Map a free-form (metric, unit) to (predicate, value_unit)."""
    m = (metric or "").strip().lower()
    u = (unit or "").strip()
    if "revenue" in m and "usd" in u.lower():
        return "revenue_usd_m", "usd_m"
    if "valuation" in m and "usd" in u.lower():
        return "valuation_usd_m", "usd_m"
    if "ipo" in m and "proceed" in m:
        return "ipo_proceeds_usd_m", "usd_m"
    if "users" in m or "headcount" in m:
        return "users_count" if "user" in m else "headcount", "count"
    return "metric", u


def extract() -> tuple[list[Entity], list[Claim], list[Source], list[QuarantineRow]]:
    wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)
    entities: dict[str, Entity] = {}
    claims: list[Claim] = []
    sources: dict[str, Source] = {}
    quarantine: list[QuarantineRow] = []
    # Map original Sources.claim_id (S001…) -> generated source_id, so Products
    # / Hardware rows can re-link without duplicating evidence.
    src_lookup: dict[str, str] = {}

    audit_extracted_at = today()

    # ── 1. Sources sheet ─────────────────────────────────────────────────────
    ws = wb["Sources"]
    headers = [c.value for c in ws[1]]
    H = {h: i for i, h in enumerate(headers)}
    for row_idx, row in enumerate(ws.iter_rows(min_row=2, values_only=True), 2):
        rec = {h: row[H[h]] for h in headers}
        url = (rec.get("url") or "").strip()
        if not url:
            quarantine.append(QuarantineRow(
                reason="missing_source_url",
                extracted_from=f"{XLSX.name}#Sources!R{row_idx}",
                raw=str(rec),
            ))
            continue
        sid = source_id_for(url)
        src_lookup[str(rec.get("claim_id") or "")] = sid
        if sid not in sources:
            sources[sid] = Source(
                source_id=sid,
                url=canonical_url(url),
                url_raw=url,
                publisher=(rec.get("publisher") or "").strip(),
                title="",
                published_at="",
                retrieved_at=to_iso_date(rec.get("retrieved")) or "",
                access="public",
                source_type="press_release" if "press" in (rec.get("publisher") or "").lower() else "other",
                excerpt=(rec.get("exact_quote_or_basis") or "").strip()[:500],
            )
        # entity
        ent_name = (rec.get("entity") or "").strip()
        if not ent_name:
            quarantine.append(QuarantineRow(
                reason="missing_entity_name",
                extracted_from=f"{XLSX.name}#Sources!R{row_idx}",
                raw=str(rec),
            ))
            continue
        eid = entity_id_for(ent_name)
        entities.setdefault(eid, Entity(
            entity_id=eid, name=ent_name, type="vendor",
            domain_tags=DOMAIN_TAG,
        ))
        # claim
        predicate, vunit = _metric_to_predicate(rec.get("metric"), rec.get("unit"))
        period = str(rec.get("period") or "").strip()
        value = "" if rec.get("value") is None else str(rec.get("value"))
        cid = claim_id_for(eid, predicate, period, value)
        confidence = _conf_from_primary_secondary(rec.get("confidence"))
        claims.append(Claim(
            claim_id=cid, entity_id=eid, predicate=predicate,
            value=value, value_unit=vunit, period=period,
            confidence=confidence, source_ids=sid,
            domain_tags=DOMAIN_TAG,
            tags=(rec.get("metric") or "").strip().lower(),
            extracted_from=f"{XLSX.name}#Sources!R{row_idx}",
            extracted_at=audit_extracted_at,
        ))

    # ── 2. Architectures sheet ───────────────────────────────────────────────
    ws = wb["Architectures"]
    headers = [c.value for c in ws[1]]
    H = {h: i for i, h in enumerate(headers)}
    for row_idx, row in enumerate(ws.iter_rows(min_row=2, values_only=True), 2):
        rec = {h: row[H[h]] for h in headers}
        name = (rec.get("name") or "").strip()
        paper_url = (rec.get("paper_url") or "").strip()
        if not name or not paper_url:
            quarantine.append(QuarantineRow(
                reason="missing_name_or_paper_url",
                extracted_from=f"{XLSX.name}#Architectures!R{row_idx}",
                raw=str(rec),
            ))
            continue
        eid = "arch-" + slug(name)
        entities.setdefault(eid, Entity(
            entity_id=eid, name=name, type="other",
            domain_tags=f"{DOMAIN_TAG},architecture",
            notes=f"family={rec.get('family') or ''}; authors={rec.get('authors') or ''}",
        ))
        sid = source_id_for(paper_url)
        sources.setdefault(sid, Source(
            source_id=sid, url=canonical_url(paper_url), url_raw=paper_url,
            publisher=(rec.get("authors") or "").strip(),
            title=(rec.get("paper_title") or "").strip(),
            published_at=str(rec.get("paper_year") or "").strip(),
            retrieved_at=audit_extracted_at, access="public",
            source_type="preprint" if "arxiv" in paper_url.lower() else "peer_reviewed",
            excerpt="",
        ))
        if rec.get("paper_year"):
            year = str(rec["paper_year"])
            cid = claim_id_for(eid, "released_in_year", year, year)
            claims.append(Claim(
                claim_id=cid, entity_id=eid, predicate="released_in_year",
                value=year, value_unit="year", period=year,
                confidence="high", source_ids=sid, domain_tags=f"{DOMAIN_TAG},architecture",
                extracted_from=f"{XLSX.name}#Architectures!R{row_idx}",
                extracted_at=audit_extracted_at,
            ))
        # always emit publication
        title = (rec.get("paper_title") or name).strip()
        cid = claim_id_for(eid, "publication", str(rec.get("paper_year") or ""), title)
        claims.append(Claim(
            claim_id=cid, entity_id=eid, predicate="publication",
            value=title, value_unit="",
            period=str(rec.get("paper_year") or ""),
            confidence="high", source_ids=sid,
            domain_tags=f"{DOMAIN_TAG},architecture",
            tags=(rec.get("domain_tags") or "").lower().replace(";", ","),
            extracted_from=f"{XLSX.name}#Architectures!R{row_idx}",
            extracted_at=audit_extracted_at,
        ))

    # ── 3. Products sheet ────────────────────────────────────────────────────
    ws = wb["Products"]
    headers = [c.value for c in ws[1]]
    H = {h: i for i, h in enumerate(headers)}
    for row_idx, row in enumerate(ws.iter_rows(min_row=2, values_only=True), 2):
        rec = {h: row[H[h]] for h in headers}
        prod_name = (rec.get("name") or "").strip()
        company = (rec.get("company") or "").strip()
        if not prod_name or not company:
            quarantine.append(QuarantineRow(
                reason="missing_product_or_company",
                extracted_from=f"{XLSX.name}#Products!R{row_idx}",
                raw=str(rec),
            ))
            continue
        # company entity
        ceid = entity_id_for(company)
        entities.setdefault(ceid, Entity(
            entity_id=ceid, name=company, type="vendor",
            domain_tags=DOMAIN_TAG,
        ))
        # link revenue claim back to its referenced Sources row
        rev_claim_ref = str(rec.get("revenue_source_claim") or "").strip()
        sid = src_lookup.get(rev_claim_ref, "")
        if rec.get("revenue_m_usd") and sid:
            v = str(rec["revenue_m_usd"])
            cid = claim_id_for(ceid, "revenue_usd_m", "", v)
            claims.append(Claim(
                claim_id=cid, entity_id=ceid, predicate="revenue_usd_m",
                value=v, value_unit="usd_m",
                confidence="high", source_ids=sid,
                domain_tags=DOMAIN_TAG,
                tags=f"product:{prod_name}",
                extracted_from=f"{XLSX.name}#Products!R{row_idx}",
                extracted_at=audit_extracted_at,
            ))
        val_claim_ref = str(rec.get("valuation_source_claim") or "").strip()
        vsid = src_lookup.get(val_claim_ref, "")
        if rec.get("valuation_m_usd") and vsid:
            v = str(rec["valuation_m_usd"])
            cid = claim_id_for(ceid, "valuation_usd_m", "", v)
            claims.append(Claim(
                claim_id=cid, entity_id=ceid, predicate="valuation_usd_m",
                value=v, value_unit="usd_m",
                confidence="high", source_ids=vsid,
                domain_tags=DOMAIN_TAG,
                tags=f"product:{prod_name}",
                extracted_from=f"{XLSX.name}#Products!R{row_idx}",
                extracted_at=audit_extracted_at,
            ))

    wb.close()

    # Drop claims whose predicate is not in the locked vocabulary (safety net).
    bad = [c for c in claims if c.predicate not in VALID_PREDICATES]
    for c in bad:
        quarantine.append(QuarantineRow(
            reason=f"unknown_predicate:{c.predicate}",
            extracted_from=c.extracted_from,
            raw=str(c),
        ))
    claims = [c for c in claims if c.predicate in VALID_PREDICATES]

    return list(entities.values()), claims, list(sources.values()), quarantine


if __name__ == "__main__":
    e, c, s, q = extract()
    print(f"entities={len(e)} claims={len(c)} sources={len(s)} quarantine={len(q)}")
