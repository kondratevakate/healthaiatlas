"""Map Una's career data (opportunities / contacts / nobel_map) into the atlas
schema (entities + claims) so it can be merged into db/atlas.sqlite.

This script is RUN BY UNA in her own environment (she has access to her
career.db / una-grounding.json; main & ops do NOT). It produces a portable
JSON snapshot that ops/main then imports into atlas.sqlite.

USAGE (Una runs this):
  # from the curated grounding export (PREFERRED — richer, human-checked)
  python una_to_atlas.py --input ~/una/db/grounding/una-grounding.json \
      --output /tmp/una_atlas.json
  # or straight from the raw career.db
  python una_to_atlas.py --input ~/una/db/career.db --output /tmp/una_atlas.json

INPUT FORMATS ACCEPTED:
  - JSON una-grounding.json (export_grounding.py output):
    {opportunities:[...], contacts:[...], nobel_map:[...]}
  - SQLite career.db. NOTE: career.db does NOT have opportunities/contacts/
    nobel_map tables. Its real schema is a generic EAV store:
        entities(id, type, name, attrs JSON, created_at, updated_at)
        links(id, src, dst, rel, weight, note)
        sources(id, url, entity_id, claim, status, checked_at)
    with entities.type in {grant, person, lab, domain, conference}.
    We adapt that shape here rather than expecting the manifest tables.

OUTPUT:
  {"entities":[...], "claims":[...]} matching migrate_atlas.py's table columns.

CONSTRAINTS ENFORCED (these bite at import time, so we enforce at export):
  - entity.type must be in schema.EntityType, else the row is meaningless
    downstream. career "grant"/"person"/"lab" are remapped:
        grant/award/fellowship -> "other"     (no funding-call type exists)
        conference             -> "conference"
        person                 -> "other"     (no person type in EntityType)
        lab/academic group     -> "research_lab"
  - claim.predicate must be in predicates.VALID_PREDICATES. There is no
    "funding_deadline" predicate, so deadlines are emitted as predicate
    "metric" with tags="deadline" and the ISO date in `period`.
  - website/source URLs are only emitted when they actually look like URLs.
    Una's grounding export has column drift ("Medium", "High for domain 8"
    leaking into source_url); per AGENTS.md rule #1 a non-URL becomes "",
    never a fabricated link.
"""
from __future__ import annotations

import argparse
import json
import sqlite3
import sys
from pathlib import Path

# ── entity type remapping ────────────────────────────────────────────────
# schema.EntityType has no "grant"/"person" member; map onto the closest
# legal value and keep the original in domain_tags/tags for filtering.
TYPE_MAP = {
    "grant": "other",
    "award": "other",
    "fellowship": "other",
    "conference": "conference",
    "conf": "conference",
    "person": "other",
    "lab": "research_lab",
    "academic_group": "academic_group",
    "research_lab": "research_lab",
    "domain": "other",
}


def _norm(v) -> str:
    return "" if v is None else str(v).strip()


def _url(v) -> str:
    """Return v only if it is really a URL. Never fabricate. AGENTS.md rule #1."""
    s = _norm(v)
    return s if s.startswith(("http://", "https://")) else ""


def _etype(raw: str) -> str:
    return TYPE_MAP.get(_norm(raw).lower(), "other")


def _claim(cid, eid, predicate, value, *, unit="", period="", conf="medium",
           dtags="", tags="", notes="") -> dict:
    return {
        "claim_id": cid,
        "entity_id": eid,
        "predicate": predicate,
        "value": _norm(value),
        "value_unit": unit,
        "period": period,
        "jurisdiction": "",
        "confidence": conf,
        "source_ids": "",
        "domain_tags": dtags,
        "tags": tags,
        "notes": notes,
    }


def map_opportunity(o: dict, idx: int) -> tuple[dict, list[dict]]:
    oid = _norm(o.get("id")) or f"una-opp-{idx}"
    eid = f"una:{oid}"
    raw_type = _norm(o.get("type")) or "grant"
    src_status = _norm(o.get("source_status"))
    # "verify" is Una's placeholder for an unchecked source -> low confidence.
    conf = "high" if src_status == "live" else "low"

    entity = {
        "entity_id": eid,
        "name": _norm(o.get("title")) or oid,
        "type": _etype(raw_type),
        "country": "",
        "city": "",
        "founded_year": None,
        "website": _url(o.get("source_url")),
        "domain_tags": f"career,opportunities,{raw_type}",
        "aliases": "",
        "description": _norm(o.get("why_fits")),
        "notes": _norm(o.get("next_step")),
    }

    claims: list[dict] = []
    dtags = "career,opportunities"

    if o.get("deadline"):
        d = _norm(o["deadline"])
        claims.append(_claim(
            f"c_{oid}_deadline", eid, "metric", d,
            period=d, conf=conf, dtags=dtags,
            tags=f"deadline,source_status:{src_status}",
            notes="application deadline",
        ))

    amt = o.get("amount")
    cur = _norm(o.get("currency"))
    if amt not in (None, ""):
        try:
            val = float(str(amt).replace(",", "").replace("€", "")
                        .replace("$", "").strip())
        except ValueError:
            # non-numeric amounts ("High", "Medium") are qualitative, not money
            claims.append(_claim(
                f"c_{oid}_amount_q", eid, "metric", amt,
                conf="low", dtags=dtags, tags="amount_qualitative",
                notes="non-numeric amount from career tracker",
            ))
        else:
            usd = val * 1.08 if cur.lower() in ("eur", "€") else val
            claims.append(_claim(
                f"c_{oid}_amount", eid, "funding_amount_usd_m",
                str(round(usd / 1_000_000, 3)), unit="usd_m",
                conf="medium", dtags=dtags, tags=f"currency:{cur}",
                notes=f"original amount={amt} {cur}"
                      + ("; EUR->USD @1.08" if cur.lower() in ("eur", "€") else ""),
            ))

    if o.get("eligibility"):
        claims.append(_claim(
            f"c_{oid}_elig", eid, "metric", o["eligibility"],
            conf="medium", dtags=dtags, tags="eligibility",
        ))

    if o.get("t_horizon"):
        claims.append(_claim(
            f"c_{oid}_horizon", eid, "metric", o["t_horizon"],
            conf="high", dtags=dtags, tags="t_horizon",
            notes="Una career horizon T0/T1/T2",
        ))

    return entity, claims


def map_contact(c: dict, idx: int) -> tuple[dict, list[dict]]:
    cid = _norm(c.get("id")) or f"una-contact-{idx}"
    eid = f"una:{cid}"
    role = _norm(c.get("role"))
    entity = {
        "entity_id": eid,
        "name": _norm(c.get("name")) or cid,
        "type": _etype(role if role in ("lab",) else "person"),
        "country": "",
        "city": "",
        "founded_year": None,
        "website": _url(c.get("source_url")),
        "domain_tags": "career,contacts",
        "aliases": _norm(c.get("affiliation") or c.get("org_lab")),
        # grounding export uses `why`, not `context`
        "description": _norm(c.get("why") or c.get("context")),
        "notes": _norm(c.get("relation") or c.get("last_touch")),
    }

    claims: list[dict] = []
    dtags = "career,contacts"
    # "(verify)" is a placeholder, not a real role
    if role and role != "(verify)":
        claims.append(_claim(
            f"c_{cid}_role", eid, "metric", role,
            conf="medium", dtags=dtags, tags="role",
        ))
    if c.get("affiliation"):
        claims.append(_claim(
            f"c_{cid}_affil", eid, "headquartered_in", c["affiliation"],
            conf="low", dtags=dtags, tags="affiliation",
            notes="affiliation from Una contact tracker",
        ))
    return entity, claims


def map_nobel(n: dict, idx: int) -> tuple[dict, list[dict]]:
    nid = _norm(n.get("laureate")) or f"una-nobel-{idx}"
    eid = f"una:{nid}"
    entity = {
        "entity_id": eid,
        "name": _norm(n.get("laureate")) or nid,
        "type": "other",
        "country": "",
        "city": "",
        "founded_year": None,
        "website": _url(n.get("source_url")),
        "domain_tags": "career,nobel_map",
        "aliases": "",
        "description": "",
        "notes": "",
    }
    claims: list[dict] = []
    dtags = "career,nobel_map"
    if n.get("orbit"):
        claims.append(_claim(f"c_{nid}_orbit", eid, "metric", n["orbit"],
                             dtags=dtags, tags="orbit"))
    if n.get("top_pub_venues"):
        claims.append(_claim(f"c_{nid}_venues", eid, "publication",
                             n["top_pub_venues"], conf="low",
                             dtags=dtags, tags="top_pub_venues"))
    return entity, claims


# ── input loading ────────────────────────────────────────────────────────

def _load_career_db(path: Path) -> dict:
    """career.db is a generic EAV store, not the manifest tables.

    entities(id, type, name, attrs JSON) with type in
    {grant, person, lab, domain, conference}. Flatten attrs into the
    opportunity/contact dict shape the mappers expect.
    """
    con = sqlite3.connect(str(path))
    con.row_factory = sqlite3.Row
    out: dict[str, list] = {"opportunities": [], "contacts": [], "nobel_map": []}

    tables = {r[0] for r in con.execute(
        "SELECT name FROM sqlite_master WHERE type='table'")}
    if "entities" not in tables:
        con.close()
        raise SystemExit(f"ERROR: {path} has no `entities` table (found {sorted(tables)})")

    # source urls live in a side table keyed by entity_id
    src_by_entity: dict[str, str] = {}
    if "sources" in tables:
        for r in con.execute("SELECT entity_id, url, status FROM sources"):
            if r["entity_id"] and _url(r["url"]) and r["entity_id"] not in src_by_entity:
                src_by_entity[str(r["entity_id"])] = r["url"]

    for r in con.execute("SELECT id, type, name, attrs FROM entities"):
        try:
            attrs = json.loads(r["attrs"]) if r["attrs"] else {}
        except (json.JSONDecodeError, TypeError):
            attrs = {}
        etype = _norm(r["type"]).lower()
        eid = f"{etype}:{r['id']}"
        url = src_by_entity.get(str(r["id"]), "") or attrs.get("url", "")

        if etype in ("grant", "conference"):
            out["opportunities"].append({
                "id": eid,
                "title": r["name"],
                "type": etype,
                "deadline": attrs.get("deadline") or attrs.get("date"),
                "amount": attrs.get("amount"),
                "currency": attrs.get("currency", ""),
                "t_horizon": attrs.get("t_horizon"),
                "eligibility": attrs.get("who") or attrs.get("eligibility"),
                # url is often a "verify on X" placeholder -> _url() drops it
                "source_url": url,
                "source_status": "live" if _url(url) else "verify",
                "why_fits": attrs.get("why"),
                "next_step": attrs.get("next_step"),
            })
        elif etype in ("person", "lab"):
            out["contacts"].append({
                "id": eid,
                "name": r["name"],
                "role": attrs.get("role") or ("lab" if etype == "lab" else ""),
                "affiliation": attrs.get("affiliation"),
                "why": attrs.get("why"),
                "source_url": url,
                "last_touch": attrs.get("last_touch"),
            })
        # type=domain is Una's taxonomy, not an atlas entity -> skipped
    con.close()
    return out


def load_input(path: Path) -> dict:
    if path.suffix == ".db":
        return _load_career_db(path)
    data = json.loads(path.read_text(encoding="utf-8"))
    return {
        "opportunities": data.get("opportunities", []),
        "contacts": data.get("contacts", []),
        "nobel_map": data.get("nobel_map", []),
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--input", required=True, help="career.db or una-grounding.json")
    ap.add_argument("--output", required=True, help="portable atlas snapshot JSON")
    args = ap.parse_args()

    inp = Path(args.input).expanduser()
    if not inp.exists():
        print(f"ERROR: input not found: {inp}", file=sys.stderr)
        return 2
    data = load_input(inp)

    e_out: list[dict] = []
    c_out: list[dict] = []
    for i, o in enumerate(data.get("opportunities", [])):
        e, cs = map_opportunity(o, i)
        e_out.append(e)
        c_out.extend(cs)
    for i, c in enumerate(data.get("contacts", [])):
        e, cs = map_contact(c, i)
        e_out.append(e)
        c_out.extend(cs)
    for i, n in enumerate(data.get("nobel_map", [])):
        e, cs = map_nobel(n, i)
        e_out.append(e)
        c_out.extend(cs)

    # dedupe by primary key — career.db and grounding can overlap
    seen_e, ents = set(), []
    for e in e_out:
        if e["entity_id"] in seen_e:
            continue
        seen_e.add(e["entity_id"])
        ents.append(e)
    seen_c, clms = set(), []
    for c in c_out:
        if c["claim_id"] in seen_c:
            continue
        seen_c.add(c["claim_id"])
        clms.append(c)

    snapshot = {"entities": ents, "claims": clms}
    out_path = Path(args.output).expanduser()
    out_path.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False),
                        encoding="utf-8")

    dropped_e = len(e_out) - len(ents)
    dropped_c = len(c_out) - len(clms)
    print(f"Wrote {out_path}", file=sys.stderr)
    print(f"  entities: {len(ents)} (opps={len(data.get('opportunities', []))} "
          f"contacts={len(data.get('contacts', []))} "
          f"nobel={len(data.get('nobel_map', []))}"
          + (f", {dropped_e} dup dropped" if dropped_e else "") + ")",
          file=sys.stderr)
    print(f"  claims  : {len(clms)}"
          + (f" ({dropped_c} dup dropped)" if dropped_c else ""), file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
