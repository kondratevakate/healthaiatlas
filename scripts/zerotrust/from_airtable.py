"""Read the canonical (Airtable) zerotrust dataset back out.

This closes the loop. The full pipeline is:

    frontend draft / xlsx
            |
            v
    scripts/zerotrust/extract_<name>.py    (verify + Wayback fallback)
            |
            v
    entities.csv / claims.csv / sources.csv  (intermediate)
            |
            v
    scripts/zerotrust/to_airtable.py
            |
            v
    >>>  Airtable: canonical store  <<<
            |
            v
    scripts/zerotrust/from_airtable.py     (THIS FILE)
            |
            v
    JSON snapshot per domain          (generic, lossy round-trip)
            |
            v
    scripts/zerotrust/regen_<file>.py      (per-file reverse mapping)
            |
            v
    frontend/src/data/<file>.ts             (auto-generated, authoritative)

Usage:
  python -m scripts.zerotrust.from_airtable                       # list domain tags
  python -m scripts.zerotrust.from_airtable --domain ai_lifesci   # JSON snapshot
  python -m scripts.zerotrust.from_airtable --domain ai_lifesci --ts
                                          # also write TS for the frontend

Output:
  C:/Projects/data/aiatls/zerotrust/from_airtable/<domain>.json
  frontend/src/data/from_airtable/<domain>.ts   (when --ts)

The JSON shape is the canonical zerotrust schema (Entity / Claim / Source).
Per-file shape reconstruction (e.g. rebuilding OncoBubble) lives in
separate `regen_<file>.py` scripts that consume this JSON.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
ENV_SEARCH_PATHS = [
    Path(__file__).resolve().parent / ".env",
    REPO_ROOT / "backend" / ".env",
    REPO_ROOT / ".env",
    Path(r"C:\Projects\03_ai_directory\healthaiatlas\backend\.env"),
]
OUT_JSON_DIR = Path(r"C:\Projects\data\aiatls\zerotrust\from_airtable")
OUT_TS_DIR = REPO_ROOT / "frontend" / "src" / "data" / "from_airtable"

TABLE_IDS = {
    "Claims":   "tbl0UzeKWnx11w91Q",
    "Entities": "tbl8eSLv4G3RWxYm7",
    "Sources":  "tbleWmldz7JJHpSvG",
    "Tags":     "tbllRllHLPZpk5TVI",
}


def load_env() -> tuple[str, str]:
    for path in ENV_SEARCH_PATHS:
        if not path.exists():
            continue
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k = k.strip()
            v = v.strip().strip('"').strip("'")
            if k and k not in os.environ:
                os.environ[k] = v
    token = os.environ.get("AIRTABLE_TOKEN") or os.environ.get("AIRTABLE_PAT") or ""
    base = os.environ.get("AIRTABLE_BASE") or os.environ.get("AIRTABLE_BASE_ID") or ""
    if not token or not base:
        print("ERROR: AIRTABLE_TOKEN / AIRTABLE_BASE not set.", file=sys.stderr)
        sys.exit(2)
    return token, base


def fetch_all(base: str, table_id: str, token: str) -> list[dict]:
    out: list[dict] = []
    offset: str | None = None
    while True:
        params: list[tuple[str, str]] = [("pageSize", "100")]
        if offset:
            params.append(("offset", offset))
        url = f"https://api.airtable.com/v0/{base}/{table_id}?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
        out.extend(data.get("records", []))
        offset = data.get("offset")
        if not offset:
            break
    return out


def _norm_field(value):
    """Airtable returns linked-record fields as arrays; flatten the common cases."""
    if isinstance(value, list):
        # multipleRecordLinks comes as list of record IDs; we'll re-resolve later
        return value
    if isinstance(value, dict):
        # AI/rollup fields sometimes nest {state, value, ...}; pull `value`
        if "value" in value:
            return value["value"]
        return value
    return value


def airtable_to_canonical(records: list[dict], kind: str) -> list[dict]:
    """Map Airtable records into the canonical zerotrust dataclass shape."""
    out = []
    for r in records:
        f = r.get("fields", {})
        if kind == "entity":
            out.append({
                "airtable_id": r["id"],
                "external_id": f.get("External ID", ""),
                "name": f.get("Entity Name", ""),
                "type": f.get("Industry", "") or "other",
                "country": f.get("Location", ""),
                "city": "",
                "founded_year": None,
                "website": f.get("Website", ""),
                "description": f.get("Description", ""),
                "total_claims": f.get("Total Claims", 0),
            })
        elif kind == "claim":
            out.append({
                "airtable_id": r["id"],
                "external_id": f.get("External ID", ""),
                "predicate": f.get("Predicate", ""),
                "value": f.get("Value"),
                "value_text": f.get("Value Text", ""),  # may not exist yet
                "value_unit": f.get("Value Unit", ""),
                "period": f.get("Period", ""),
                "jurisdiction": f.get("Jurisdiction", ""),
                "confidence": f.get("Confidence", ""),
                "claim_id": f.get("Claim ID", ""),
                "domain_tags": f.get("Domain Tags", []) or [],
                "tags": f.get("Tags", []) or [],
                "extracted_from": f.get("Extracted At", ""),
                "extracted_from_sources": f.get("Extracted From", []) or [],
            })
        elif kind == "source":
            out.append({
                "airtable_id": r["id"],
                "external_id": f.get("External ID", ""),
                "name": f.get("Source Name", ""),
                "url": f.get("URL", ""),
                "source_type": f.get("Source Type", ""),
                "date_published": f.get("Date Published", ""),
                "claims_extracted": f.get("# Claims Extracted", 0),
            })
        elif kind == "tag":
            out.append({
                "airtable_id": r["id"],
                "external_id": f.get("External ID", ""),
                "tag_name": f.get("Tag Name", ""),
                "description": f.get("Description", ""),
                "claim_count": f.get("Claim Count", 0),
            })
    return out


def filter_by_domain(claims: list[dict], tag_records_by_id: dict,
                     domain_tag: str) -> list[dict]:
    """Return claims linked to the Tag whose Tag Name == domain_tag.

    Claims.Domain Tags is a list of Tag Airtable record IDs. We map each
    of those back to its Tag Name via tag_records_by_id and filter.
    """
    target_tag_ids = {
        rid for rid, t in tag_records_by_id.items()
        if t["tag_name"].lower() == domain_tag.lower()
    }
    if not target_tag_ids:
        return []
    return [c for c in claims if any(t in target_tag_ids for t in c["domain_tags"])]


def resolve_sources(claims: list[dict], source_records_by_id: dict) -> list[dict]:
    """Replace Claim.extracted_from_sources (Airtable IDs) with full source dicts."""
    used = set()
    for c in claims:
        used.update(c["extracted_from_sources"])
    return [source_records_by_id[sid] for sid in used if sid in source_records_by_id]


def resolve_entities(claims: list[dict], entity_records_by_id: dict) -> list[dict]:
    """Entities aren't directly linked from Claims in this schema (Claims.Entity
    field doesn't exist yet — see schema_patch.py). For now we extract the
    entity_id from each claim's Tags field where it's encoded as `entity:<id>`.

    Returns the entities whose External ID matches any tag in any claim.
    """
    needed_entity_ids: set[str] = set()
    for c in claims:
        for tag in c["tags"]:
            if isinstance(tag, str) and tag.startswith("entity:"):
                needed_entity_ids.add(tag[len("entity:"):].strip())
    out = []
    for e in entity_records_by_id.values():
        if e["external_id"] in needed_entity_ids:
            out.append(e)
    return out


def emit_ts(domain_tag: str, snapshot: dict, ts_path: Path) -> None:
    """Write a typed TS module exporting the canonical view of one domain."""
    ts_path.parent.mkdir(parents=True, exist_ok=True)
    header = (
        f"// AUTO-GENERATED by scripts/zerotrust/from_airtable.py\n"
        f"// Domain: {domain_tag}\n"
        f"// Snapshot taken: {snapshot['snapshot_at']}\n"
        f"// Counts: {len(snapshot['entities'])} entities, "
        f"{len(snapshot['claims'])} claims, "
        f"{len(snapshot['sources'])} sources\n"
        f"//\n"
        f"// This module is the canonical view of one zerotrust domain.\n"
        f"// Per-file regenerators (regen_<file>.ts) reverse-map this data\n"
        f"// into hub-specific shapes (OncoBubble, USEvent, etc.).\n"
        f"\n"
    )
    types = """export interface AtEntity {
  externalId: string;
  name: string;
  type: string;
  country: string;
  description: string;
  totalClaims: number;
}

export interface AtClaim {
  externalId: string;
  predicate: string;
  value: number | string | null;
  valueText: string;
  valueUnit: string;
  period: string;
  jurisdiction: string;
  confidence: string;
  tags: string[];
  sourceIds: string[];   // external IDs of linked Sources
}

export interface AtSource {
  externalId: string;
  name: string;
  url: string;
  sourceType: string;
  datePublished: string;
}

"""
    # Build sourceId resolution: claim.extracted_from_sources (Airtable IDs) ->
    # source.external_id (the canonical key the frontend should use).
    src_aid_to_ext = {
        # we have full Source dicts in snapshot["sources_full"] with airtable_id
        s.get("airtable_id", ""): s.get("external_id", "")
        for s in snapshot.get("sources_full", [])
    }

    def claim_to_ts(c: dict) -> dict:
        return {
            "externalId": c["external_id"],
            "predicate": c["predicate"],
            "value": c.get("value"),
            "valueText": c.get("value_text", "") or "",
            "valueUnit": c.get("value_unit", "") or "",
            "period": c.get("period", "") or "",
            "jurisdiction": c.get("jurisdiction", "") or "",
            "confidence": c.get("confidence", "") or "",
            "tags": [str(t) for t in c.get("tags", [])],
            "sourceIds": [src_aid_to_ext.get(aid, "") for aid in c.get("extracted_from_sources", [])],
        }

    body = [
        f"export const DOMAIN = {json.dumps(domain_tag)} as const;",
        "",
        "export const ENTITIES: AtEntity[] = " + json.dumps(
            [
                {
                    "externalId": e["external_id"], "name": e["name"],
                    "type": e["type"], "country": e["country"] or "",
                    "description": e.get("description", "") or "",
                    "totalClaims": e.get("total_claims", 0) or 0,
                }
                for e in snapshot["entities"]
            ],
            indent=2, ensure_ascii=False,
        ) + ";",
        "",
        "export const CLAIMS: AtClaim[] = " + json.dumps(
            [claim_to_ts(c) for c in snapshot["claims"]],
            indent=2, ensure_ascii=False,
        ) + ";",
        "",
        "export const SOURCES: AtSource[] = " + json.dumps(
            [
                {
                    "externalId": s["external_id"],
                    "name": s.get("name", "") or "",
                    "url": s.get("url", "") or "",
                    "sourceType": s.get("source_type", "") or "",
                    "datePublished": s.get("date_published", "") or "",
                }
                for s in snapshot["sources"]
            ],
            indent=2, ensure_ascii=False,
        ) + ";",
        "",
    ]
    ts_path.write_text(header + types + "\n".join(body), encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--domain", help="Tag Name to pull (e.g. ai_lifesci, oncology)")
    ap.add_argument("--ts", action="store_true",
                    help="also emit a TS module to frontend/src/data/from_airtable/")
    ap.add_argument("--list", action="store_true",
                    help="just list available domain tags + claim counts, then exit")
    args = ap.parse_args()

    token, base = load_env()
    print(f"Fetching from Airtable base {base} ...", file=sys.stderr)

    t0 = time.time()
    raw_tags = fetch_all(base, TABLE_IDS["Tags"], token)
    raw_entities = fetch_all(base, TABLE_IDS["Entities"], token)
    raw_claims = fetch_all(base, TABLE_IDS["Claims"], token)
    raw_sources = fetch_all(base, TABLE_IDS["Sources"], token)
    print(f"  fetched {len(raw_tags)} tags, {len(raw_entities)} entities, "
          f"{len(raw_claims)} claims, {len(raw_sources)} sources in {time.time()-t0:.1f}s",
          file=sys.stderr)

    tags = airtable_to_canonical(raw_tags, "tag")
    entities = airtable_to_canonical(raw_entities, "entity")
    claims = airtable_to_canonical(raw_claims, "claim")
    sources = airtable_to_canonical(raw_sources, "source")

    tag_by_aid = {r["id"]: t for r, t in zip(raw_tags, tags)}
    entity_by_aid = {r["id"]: e for r, e in zip(raw_entities, entities)}
    source_by_aid = {r["id"]: s for r, s in zip(raw_sources, sources)}

    # Attach airtable_id for source resolution later
    for s, e in zip(sources, [s for s in sources]):
        pass
    for s_dict, raw in zip(sources, raw_sources):
        s_dict["airtable_id"] = raw["id"]

    if args.list or not args.domain:
        # List tags with claim counts
        from collections import Counter
        # Count claims per tag — group by Domain Tags links
        per_tag = Counter()
        for c in claims:
            for t_aid in c["domain_tags"]:
                tname = tag_by_aid.get(t_aid, {}).get("tag_name", t_aid)
                per_tag[tname] += 1
        print("\nAvailable domain tags (Tag Name → claim count):", file=sys.stderr)
        for tname, n in per_tag.most_common():
            print(f"  {tname:25s} {n}", file=sys.stderr)
        if not args.domain:
            return 0

    # Filter
    filtered_claims = filter_by_domain(claims, tag_by_aid, args.domain)
    filtered_sources = resolve_sources(filtered_claims, source_by_aid)
    filtered_entities = resolve_entities(filtered_claims, entity_by_aid)

    print(f"\nDomain={args.domain}:", file=sys.stderr)
    print(f"  entities: {len(filtered_entities)}", file=sys.stderr)
    print(f"  claims:   {len(filtered_claims)}", file=sys.stderr)
    print(f"  sources:  {len(filtered_sources)}", file=sys.stderr)

    snapshot = {
        "domain": args.domain,
        "snapshot_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "entities": filtered_entities,
        "claims": filtered_claims,
        "sources": filtered_sources,
        "sources_full": sources,  # so claim.extracted_from_sources can resolve
    }

    OUT_JSON_DIR.mkdir(parents=True, exist_ok=True)
    json_path = OUT_JSON_DIR / f"{args.domain}.json"
    json_path.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False),
                         encoding="utf-8")
    print(f"\nWrote {json_path}", file=sys.stderr)

    if args.ts:
        ts_path = OUT_TS_DIR / f"{args.domain}.ts"
        emit_ts(args.domain, snapshot, ts_path)
        print(f"Wrote {ts_path.relative_to(REPO_ROOT)}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    sys.exit(main())
