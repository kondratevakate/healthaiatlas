"""Orchestrator: run all registered extractors, merge, dedupe, write CSVs.

Dedup rules:
  - sources:  by source_id (== canonical URL hash). First writer wins, but later
              writers can fill in missing publisher / title / excerpt.
  - entities: by entity_id. Domain tags from later writers are *unioned* into the
              first writer's row. Other fields preserved from first writer
              unless empty.
  - claims:   by claim_id. Later writers' source_ids unioned in.

Output: 4 CSVs in C:/Projects/data/aiatls/zerotrust/.
"""
from __future__ import annotations

from pathlib import Path

from .common import (
    write_claims, write_entities, write_quarantine, write_sources,
)
from .extract_ai_arch_revenue import extract as extract_ai_arch_revenue
from .extract_lifesci_style import extract as extract_ai_lifesci
from .schema import Claim, Entity, QuarantineRow, Source

OUT_DIR = Path(r"C:\Projects\data\aiatls\zerotrust")

EXTRACTORS = [
    ("ai_arch_revenue", extract_ai_arch_revenue),
    ("ai_lifesci",      extract_ai_lifesci),
    # ("oncology",      extract_oncology),          # TODO
    # ("healthcare_pm", extract_healthcare_pm),     # TODO
    # ("ai_scientist",  extract_ai_scientist),      # TODO
    # ("ecosystem",     extract_ecosystem_events),  # TODO
    # ("eu_funds",      extract_eu_funds),          # TODO
    # ("lifesci_2026",  extract_lifesci_2026),      # TODO
]


def _merge_lists(a: str, b: str) -> str:
    parts = {x.strip() for x in (a + "," + b).split(",") if x.strip()}
    return ",".join(sorted(parts))


def merge_entities(dst: dict[str, Entity], add: list[Entity]) -> None:
    for e in add:
        if e.entity_id not in dst:
            dst[e.entity_id] = e
            continue
        cur = dst[e.entity_id]
        cur.domain_tags = _merge_lists(cur.domain_tags, e.domain_tags)
        cur.aliases = _merge_lists(cur.aliases, e.aliases)
        # fill empty fields
        for fld in ("country", "city", "website", "notes"):
            if not getattr(cur, fld) and getattr(e, fld):
                setattr(cur, fld, getattr(e, fld))
        if cur.founded_year is None and e.founded_year is not None:
            cur.founded_year = e.founded_year


def merge_claims(dst: dict[str, Claim], add: list[Claim]) -> None:
    for c in add:
        if c.claim_id not in dst:
            dst[c.claim_id] = c
            continue
        cur = dst[c.claim_id]
        cur.source_ids = _merge_lists(cur.source_ids, c.source_ids)
        cur.domain_tags = _merge_lists(cur.domain_tags, c.domain_tags)
        cur.tags = _merge_lists(cur.tags, c.tags)


def merge_sources(dst: dict[str, Source], add: list[Source]) -> None:
    for s in add:
        if s.source_id not in dst:
            dst[s.source_id] = s
            continue
        cur = dst[s.source_id]
        for fld in ("publisher", "title", "published_at", "excerpt"):
            if not getattr(cur, fld) and getattr(s, fld):
                setattr(cur, fld, getattr(s, fld))
        if not cur.retrieved_at and s.retrieved_at:
            cur.retrieved_at = s.retrieved_at


def main() -> int:
    entities: dict[str, Entity] = {}
    claims: dict[str, Claim] = {}
    sources: dict[str, Source] = {}
    quarantine: list[QuarantineRow] = []

    for name, fn in EXTRACTORS:
        e, c, s, q = fn()
        print(f"[{name}] entities={len(e)} claims={len(c)} sources={len(s)} quarantine={len(q)}")
        merge_entities(entities, e)
        merge_claims(claims, c)
        merge_sources(sources, s)
        quarantine.extend(q)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    write_entities(OUT_DIR / "entities.csv", entities.values())
    write_claims(OUT_DIR / "claims.csv", claims.values())
    write_sources(OUT_DIR / "sources.csv", sources.values())
    write_quarantine(OUT_DIR / "quarantine.csv", quarantine)

    print("\nwrote:")
    print(f"  {OUT_DIR / 'entities.csv'}   ({len(entities)} rows)")
    print(f"  {OUT_DIR / 'claims.csv'}     ({len(claims)} rows)")
    print(f"  {OUT_DIR / 'sources.csv'}    ({len(sources)} rows)")
    print(f"  {OUT_DIR / 'quarantine.csv'} ({len(quarantine)} rows)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
