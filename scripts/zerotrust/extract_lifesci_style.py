"""Extractor for AI_LifeSci_Landscape_v4.xlsx — and by extension Oncology
(same 37-column schema).

One event row -> one Source + N Claims (all citing that source), e.g. a
Funding_Round row emits funding_round + funding_amount_usd_m + lead_investor.

The mapping from Event_Type to predicates is hard-coded: the Event_Type taxonomy
is small (~12 values) and stable in this xlsx family. New event types -> quarantine.
"""
from __future__ import annotations

import re
from pathlib import Path

import openpyxl

from .common import (
    canonical_url, claim_id_for, entity_id_for, slug,
    source_id_for, to_iso_date, today,
)
from .predicates import VALID_PREDICATES
from .schema import Claim, Entity, QuarantineRow, Source

LIFESCI_XLSX = Path(r"C:\Projects\data\aiatls\AI_LifeSci_Landscape_v4.xlsx")
LIFESCI_SHEET = "AI Life Sciences Events"

# ── helpers ────────────────────────────────────────────────────────────────

# "$1.0B" / "$600M" / "$50M" / "$1.2B" / "$600K" / "" / "undisclosed"
_AMT_RX = re.compile(r"^\$?\s*([\d.,]+)\s*([BMK])?", re.IGNORECASE)


def parse_amount_to_usd_m(s) -> float | None:
    if s is None:
        return None
    txt = str(s).strip()
    if not txt or txt.lower() in {"undisclosed", "n/a", "none", "0"}:
        return None
    m = _AMT_RX.match(txt)
    if not m:
        return None
    try:
        n = float(m.group(1).replace(",", ""))
    except ValueError:
        return None
    suffix = (m.group(2) or "").upper()
    mult = {"B": 1000.0, "M": 1.0, "K": 0.001, "": 1.0}.get(suffix, 1.0)
    return round(n * mult, 3)


def normalize_confidence(v) -> str:
    s = (str(v) if v is not None else "").strip().lower()
    if s in {"high", "medium", "low"}:
        return s
    return "low"


def map_entity_type(v) -> str:
    s = (str(v) if v is not None else "").strip().lower()
    mapping = {
        "vendor": "vendor", "pharma": "pharma", "hospital": "hospital",
        "regulator": "regulator", "government": "government",
        "research_lab": "research_lab", "academic_group": "academic_group",
        "open_dataset": "open_dataset", "open_benchmark": "open_benchmark",
        "open_source_tool": "open_source_tool", "foundationmodel": "foundation_model",
        "foundation_model": "foundation_model", "investor": "investor",
        "clinicalaidevice": "vendor", "computational_chemistry": "vendor",
    }
    return mapping.get(s, "other")


# ── main extractor (reusable across lifesci + oncology) ────────────────────

def extract_xlsx(
    xlsx_path: Path,
    sheet_name: str,
    domain_tag: str,
) -> tuple[list[Entity], list[Claim], list[Source], list[QuarantineRow]]:
    wb = openpyxl.load_workbook(xlsx_path, read_only=True, data_only=True)
    ws = wb[sheet_name]
    headers = [c.value for c in ws[1]]
    H = {h: i for i, h in enumerate(headers)}

    entities: dict[str, Entity] = {}
    claims: dict[str, Claim] = {}
    sources: dict[str, Source] = {}
    quarantine: list[QuarantineRow] = []
    audit_extracted_at = today()

    def get(rec: dict, key: str) -> str:
        v = rec.get(key)
        return "" if v is None else str(v).strip()

    def add_claim(
        entity_id: str, predicate: str, value: str, *,
        unit: str = "", period: str = "", confidence: str = "medium",
        source_id: str = "", tags: str = "", row_label: str = "",
    ) -> None:
        if not value or value.lower() in {"none", "n/a"}:
            return
        if predicate not in VALID_PREDICATES:
            quarantine.append(QuarantineRow(
                reason=f"unknown_predicate:{predicate}",
                extracted_from=row_label, raw=value,
            ))
            return
        if not source_id:
            quarantine.append(QuarantineRow(
                reason="claim_without_source",
                extracted_from=row_label, raw=f"{entity_id}/{predicate}={value}",
            ))
            return
        cid = claim_id_for(entity_id, predicate, period, value)
        if cid in claims:
            # merge tags / source_ids
            cur = claims[cid]
            cur_sids = {x for x in cur.source_ids.split(",") if x}
            cur_sids.add(source_id)
            cur.source_ids = ",".join(sorted(cur_sids))
            cur_tags = {x for x in cur.tags.split(",") if x} | {tags} if tags else set()
            cur.tags = ",".join(sorted(x for x in cur_tags if x))
            return
        claims[cid] = Claim(
            claim_id=cid, entity_id=entity_id, predicate=predicate,
            value=value, value_unit=unit, period=period,
            confidence=confidence, source_ids=source_id,
            domain_tags=domain_tag, tags=tags,
            extracted_from=row_label, extracted_at=audit_extracted_at,
        )

    for row_idx, row in enumerate(ws.iter_rows(min_row=2, values_only=True), 2):
        rec = dict(zip(headers, row))
        row_label = f"{xlsx_path.name}#{sheet_name}!R{row_idx}"

        company = get(rec, "Company")
        url = get(rec, "Source_URL")
        if not company:
            quarantine.append(QuarantineRow(
                reason="missing_company", extracted_from=row_label, raw=str(rec)))
            continue
        if not url:
            quarantine.append(QuarantineRow(
                reason="missing_source_url", extracted_from=row_label, raw=str(rec)))
            continue

        # entity
        eid = entity_id_for(company)
        if eid not in entities:
            entities[eid] = Entity(
                entity_id=eid, name=company,
                type=map_entity_type(get(rec, "Entity_Type")),
                country=get(rec, "Geographic_Market"),
                domain_tags=domain_tag,
                aliases="",
            )
        else:
            # union domain tags
            dts = {x for x in entities[eid].domain_tags.split(",") if x}
            dts.add(domain_tag)
            entities[eid].domain_tags = ",".join(sorted(dts))

        # source
        sid = source_id_for(url)
        if sid not in sources:
            sources[sid] = Source(
                source_id=sid,
                url=canonical_url(url), url_raw=url,
                publisher="",
                title=get(rec, "Event_Description")[:200],
                published_at=to_iso_date(rec.get("Date")),
                retrieved_at=audit_extracted_at,
                access="public",
                source_type=(get(rec, "Source_Type").lower() or "other"),
                excerpt=get(rec, "Event_Description")[:500],
            )

        # ── claims dispatch on Event_Type ────────────────────────────────
        event_type = get(rec, "Event_Type")
        date_iso = to_iso_date(rec.get("Date"))
        confidence = normalize_confidence(rec.get("Confidence"))
        common_kwargs = dict(
            confidence=confidence, source_id=sid, row_label=row_label,
        )

        # universal claims (any event type that mentions them)
        geo = get(rec, "Geographic_Market")
        if geo:
            add_claim(eid, "operates_in_jurisdiction", geo, period=date_iso,
                      tags=event_type.lower(), **common_kwargs)
        dp = get(rec, "Decision_Point")
        if dp:
            add_claim(eid, "covers_decision_point", dp, period=date_iso,
                      tags=event_type.lower(), **common_kwargs)

        if event_type == "Funding_Round":
            round_name = get(rec, "Funding_Round")
            if round_name:
                add_claim(eid, "funding_round", round_name, period=date_iso,
                          tags=event_type.lower(), **common_kwargs)
            amt = parse_amount_to_usd_m(get(rec, "Funding_Amount"))
            if amt is not None:
                add_claim(eid, "funding_amount_usd_m", str(amt), unit="usd_m",
                          period=date_iso, tags=round_name.lower(), **common_kwargs)
            lead = get(rec, "Lead_Investor")
            if lead:
                add_claim(eid, "lead_investor", lead, period=date_iso,
                          tags=round_name.lower(), **common_kwargs)

        elif event_type == "Acquisition":
            deal = parse_amount_to_usd_m(get(rec, "Deal_Value"))
            if deal is not None:
                add_claim(eid, "ma_value_usd_m", str(deal), unit="usd_m",
                          period=date_iso, **common_kwargs)
            buyer = get(rec, "Pharma_Partner") or get(rec, "Lead_Investor")
            if buyer:
                add_claim(eid, "acquired_by", buyer, period=date_iso, **common_kwargs)

        elif event_type == "Founding":
            year = (date_iso[:4] if date_iso else "")
            if year:
                add_claim(eid, "founded_in_year", year, unit="year",
                          period=year, **common_kwargs)

        elif event_type in {"FDA_Clearance", "Regulatory", "Regulatory_Milestone"}:
            desc = get(rec, "Event_Description")[:300]
            if desc:
                pred = "fda_clearance" if event_type == "FDA_Clearance" else "regulatory_event"
                add_claim(eid, pred, desc, period=date_iso, **common_kwargs)

        elif event_type == "Pharma_Deal":
            deal = parse_amount_to_usd_m(get(rec, "Deal_Value"))
            if deal is not None:
                add_claim(eid, "pharma_deal_value_usd_m", str(deal), unit="usd_m",
                          period=date_iso, **common_kwargs)
            partner = get(rec, "Pharma_Partner")
            if partner:
                add_claim(eid, "partnered_with", partner, period=date_iso, **common_kwargs)

        elif event_type == "Partnership":
            partner = get(rec, "Pharma_Partner")
            if partner:
                add_claim(eid, "partnered_with", partner, period=date_iso, **common_kwargs)

        elif event_type == "Product_Launch":
            prod = get(rec, "Product_Name")
            if prod:
                add_claim(eid, "released_product", prod, period=date_iso, **common_kwargs)

        elif event_type in {"Clinical_Trial", "Clinical_Trial_Result"}:
            ev = get(rec, "Clinical_Evidence") or get(rec, "Regulatory_Status")
            desc = get(rec, "Event_Description")[:300]
            add_claim(eid, "clinical_trial_result" if "Result" in event_type
                      else "clinical_trial_phase",
                      desc or ev or event_type, period=date_iso, **common_kwargs)

        elif event_type in {"IPO", "Strategic_Investment"}:
            deal = parse_amount_to_usd_m(get(rec, "Deal_Value")) or \
                   parse_amount_to_usd_m(get(rec, "Funding_Amount"))
            if deal is not None:
                pred = "ipo_proceeds_usd_m" if event_type == "IPO" else "funding_amount_usd_m"
                add_claim(eid, pred, str(deal), unit="usd_m",
                          period=date_iso, **common_kwargs)

        else:
            # Catch-all: keep the event linked to its source so we don't lose evidence.
            desc = get(rec, "Event_Description")[:300]
            if desc:
                add_claim(eid, "ecosystem_event", desc, period=date_iso,
                          tags=event_type.lower(), **common_kwargs)

    wb.close()
    return list(entities.values()), list(claims.values()), list(sources.values()), quarantine


def extract() -> tuple[list[Entity], list[Claim], list[Source], list[QuarantineRow]]:
    return extract_xlsx(LIFESCI_XLSX, LIFESCI_SHEET, "ai_lifesci")


if __name__ == "__main__":
    e, c, s, q = extract()
    print(f"entities={len(e)} claims={len(c)} sources={len(s)} quarantine={len(q)}")
