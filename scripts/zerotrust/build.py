"""Orchestrator: run xlsx extractors, merge per-domain CSVs, write unified output.

Two-tier pipeline:
  Tier 1 — xlsx extractors (fast, no network, in-memory):
    extract_ai_arch_revenue, extract_lifesci_style
    Called directly; their extract() returns (list[E], list[C], list[S], list[Q]).

  Tier 2 — TS extractors (slow, URL-verified, write their own CSVs):
    extract_eu, extract_uae, extract_uk, extract_oncology,
    extract_us_policy, extract_us_timeline, extract_recent_signals
    Run individually with `python -m scripts.zerotrust.<module> --write`
    to do URL verification and produce per-domain CSVs.
    build.py reads those CSVs and merges them in.

Dedup rules (stable across both tiers):
  - sources:  by source_id (canonical URL hash). First writer wins; later
              writers fill missing publisher/title/excerpt.
  - entities: by entity_id. domain_tags and aliases are UNIONED; other
              fields preserved from first writer unless empty.
  - claims:   by claim_id. source_ids from later writers are UNIONED in.

Output: 4 CSVs in C:/Projects/data/aiatls/zerotrust/
"""
from __future__ import annotations

from pathlib import Path

from .common import (
    read_claims, read_entities, read_quarantine, read_sources,
    write_claims, write_entities, write_quarantine, write_sources,
)
from .extract_ai_arch_revenue import extract as extract_ai_arch_revenue
from .extract_lifesci_style import extract as extract_ai_lifesci
from .schema import Claim, Entity, QuarantineRow, Source

OUT_DIR = Path(r"C:\Projects\data\aiatls\zerotrust")

# Tier 1: xlsx extractors called in-memory.
XLSX_EXTRACTORS: list[tuple[str, object]] = [
    ("ai_arch_revenue", extract_ai_arch_revenue),
    ("ai_lifesci",      extract_ai_lifesci),
]

# Tier 2: TS extractor domain prefixes. build.py looks for
# {entities,claims,sources,quarantine}_{prefix}.csv in OUT_DIR.
# Run the individual extractor with --write to (re)generate them.
DOMAIN_CSV_PREFIXES: list[str] = [
    "oncology",
    "eu",
    "uae",
    "uk",
    "us_policy",
    "us_timeline",
    "recent_signals",
]


# ─── merge helpers ────────────────────────────────────────────────────────────

def _union(a: str, b: str) -> str:
    """Union two comma-separated tag strings, stable sorted."""
    parts = {x.strip() for x in (a + "," + b).split(",") if x.strip()}
    return ",".join(sorted(parts))


def merge_entities(dst: dict[str, Entity], add: list[Entity]) -> None:
    for e in add:
        if e.entity_id not in dst:
            dst[e.entity_id] = e
            continue
        cur = dst[e.entity_id]
        cur.domain_tags = _union(cur.domain_tags, e.domain_tags)
        cur.aliases = _union(cur.aliases, e.aliases)
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
        cur.source_ids = _union(cur.source_ids, c.source_ids)
        cur.domain_tags = _union(cur.domain_tags, c.domain_tags)
        cur.tags = _union(cur.tags, c.tags)


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


# ─── main ─────────────────────────────────────────────────────────────────────

def main() -> int:
    entities: dict[str, Entity] = {}
    claims: dict[str, Claim] = {}
    sources: dict[str, Source] = {}
    quarantine: list[QuarantineRow] = []

    # Tier 1 — xlsx extractors (in-memory, no network)
    for name, fn in XLSX_EXTRACTORS:
        e_list, c_list, s_list, q_list = fn()
        merge_entities(entities, e_list)
        merge_claims(claims, c_list)
        merge_sources(sources, s_list)
        quarantine.extend(q_list)
        print(f"[xlsx:{name}] entities={len(e_list)} claims={len(c_list)} "
              f"sources={len(s_list)} quarantine={len(q_list)}")

    # Tier 2 — per-domain CSVs from TS extractors
    for prefix in DOMAIN_CSV_PREFIXES:
        ep = OUT_DIR / f"entities_{prefix}.csv"
        cp = OUT_DIR / f"claims_{prefix}.csv"
        sp = OUT_DIR / f"sources_{prefix}.csv"
        qp = OUT_DIR / f"quarantine_{prefix}.csv"

        if not ep.exists():
            print(f"[csv:{prefix}] SKIPPED — {ep.name} not found "
                  f"(run: python -m scripts.zerotrust.extract_{prefix} --write)")
            continue

        e_list = read_entities(ep)
        c_list = read_claims(cp) if cp.exists() else []
        s_list = read_sources(sp) if sp.exists() else []
        q_list = read_quarantine(qp) if qp.exists() else []

        merge_entities(entities, e_list)
        merge_claims(claims, c_list)
        merge_sources(sources, s_list)
        quarantine.extend(q_list)
        print(f"[csv:{prefix}] entities={len(e_list)} claims={len(c_list)} "
              f"sources={len(s_list)} quarantine={len(q_list)}")

    # Write unified output
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    write_entities(OUT_DIR / "entities.csv", entities.values())
    write_claims(OUT_DIR / "claims.csv", claims.values())
    write_sources(OUT_DIR / "sources.csv", sources.values())
    write_quarantine(OUT_DIR / "quarantine.csv", quarantine)

    print(f"\nwrote:")
    print(f"  entities.csv   {len(entities)} rows")
    print(f"  claims.csv     {len(claims)} rows")
    print(f"  sources.csv    {len(sources)} rows")
    print(f"  quarantine.csv {len(quarantine)} rows")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
