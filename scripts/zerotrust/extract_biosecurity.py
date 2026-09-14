"""Extract the Biosecurity World organisation directory into zerotrust CSVs.

Upstream: a public Notion database published at biosecurityworld.notion.site
(curated by the Biosecurity World team, not by the Atlas). We read it through
Notion's public-site JSON endpoint (`/api/v3/queryCollection`) — the same call
the published page makes in the browser. This is an undocumented interface, so
`parse_rows` fails loudly on schema drift instead of emitting partial data, and
`tests/test_extract_biosecurity.py::test_live_contract` pins the response shape.

Pipeline position:

  Notion (biosecurityworld.notion.site)
        |
        v  scripts.zerotrust.extract_biosecurity   <-- THIS FILE
        |
        v
   entities_biosecurity.csv + claims_biosecurity.csv + sources_biosecurity.csv
   quarantine_biosecurity.csv + biosecurity_taxonomy.json
        |
        v  scripts.zerotrust.validate --domain biosecurity
        |
        v  scripts.zerotrust.regen_biosecurity
        |
        v
   frontend/src/data/biosecurity.ts (auto-generated)

Claims emitted per approved organisation:
  covers_decision_point     one per category the directory files the org under
                            (value = category slug, e.g. `medical-countermeasures`)
  operates_in_jurisdiction  locations as listed by the directory

Sourcing and confidence:
  - Every claim cites the public directory view URL (DIRECTORY_URL), exactly as
    shared by the maintainer. Per-row Notion page URLs are NOT derived from
    block ids — AGENTS.md hard rule 1 forbids constructing source URLs.
  - Confidence is `medium`: a curated third-party directory, not independently
    verified by the Atlas. Organisation websites are liveness-checked and kept
    on the entity (`website`), tagged `website:alive|dead|none`; dead links are
    also written to quarantine for follow-up. A dead website is a signal, not
    proof of closure, so the organisation is not dropped.

Rows rejected into quarantine: category nodes are skipped silently (they become
the taxonomy); non-Approved rows, rows without a category, unnamed rows and
duplicate entity ids are quarantined with a reason.

Run:
  python -m scripts.zerotrust.extract_biosecurity                    # live fetch, dry-run
  python -m scripts.zerotrust.extract_biosecurity --write            # live fetch, write CSVs
  python -m scripts.zerotrust.extract_biosecurity --snapshot F.json --write
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
import urllib.request
from collections import Counter
from pathlib import Path

from .common import (
    canonical_url, claim_id_for, data_dir, entity_id_for, slug, source_id_for,
    today, write_claims, write_entities, write_quarantine, write_sources,
)
from .schema import Claim, Entity, QuarantineRow, Source

DOMAIN_TAG = "biosecurity"

NOTION_QUERY_URL = "https://biosecurityworld.notion.site/api/v3/queryCollection"
SPACE_ID = "e0920d0e-cf7d-469b-ad96-c19a1c3b8d3b"
COLLECTION_ID = "7c344b6c-4967-41de-8335-ec9c5333ed9d"
VIEW_ID = "1335ef21-6bed-477f-930d-e7c35d5a36e9"

# Public directory view, verbatim from the maintainer (tracking `pvs` param dropped).
DIRECTORY_URL = (
    "https://biosecurityworld.notion.site/24326cc06be04b34a48076a260482c7b"
    "?v=1335ef216bed477f930de7c35d5a36e9"
)
PUBLISHER = "Biosecurity World"

# Cloudflare in front of notion.site rejects the default Python-urllib agent (403).
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36"

REQUIRED_PROPERTIES = (
    "Name", "Description", "Link", "Organization Type", "Activity Type",
    "Intervention Focus", "Location (City, Country, Region)", "GCBR focus",
    "Is intermediate node", "Status", "Parent",
)

# Display order of top-level categories: the outbreak timeline, then the
# cross-cutting layer. Categories not listed here sort last.
GROUP_ORDER = ("Prevention", "Detection", "Response", "Transversal")

ORG_TYPE_TO_ENTITY_TYPE = {
    "For-profit company": "vendor",
    "Government": "government",
    "Intergovernmental entity": "government",
    "Research institute / lab / network": "research_lab",
}


class SchemaDriftError(RuntimeError):
    """The Notion response no longer matches the shape this extractor expects."""


# ── Notion payload decoding ─────────────────────────────────────────────────

def _unwrap(entry) -> dict:
    """recordMap entries are either {value: record} or {value: {value: record}}."""
    if not isinstance(entry, dict):
        return {}
    v = entry.get("value", entry)
    if isinstance(v, dict) and "id" not in v and isinstance(v.get("value"), dict):
        v = v["value"]
    return v if isinstance(v, dict) else {}


def clean_text(s: str) -> str:
    """NFKC (turns NBSP into a space) and collapse whitespace."""
    return re.sub(r"\s+", " ", unicodedata.normalize("NFKC", s or "")).strip()


def plain(prop) -> str:
    return clean_text("".join(seg[0] for seg in (prop or []) if seg and seg[0] != "‣"))


def split_multi(prop) -> list[str]:
    return [v for v in (clean_text(p) for p in plain(prop).split(",")) if v]


def relation_ids(prop) -> list[str]:
    """Relation cells interleave mention segments with bare ',' separators."""
    ids: list[str] = []
    for seg in prop or []:
        if len(seg) > 1 and seg[0] == "‣":
            ids.extend(ann[1] for ann in seg[1] if ann and ann[0] == "p")
    return ids


def url_value(prop) -> str:
    for seg in prop or []:
        for ann in (seg[1] if len(seg) > 1 else []):
            if ann and ann[0] == "a":
                return ann[1].strip()
    return plain(prop)


def parse_rows(response: dict) -> list[dict]:
    try:
        rm = response["recordMap"]
        coll = _unwrap(rm["collection"][COLLECTION_ID])
        group = response["result"]["reducerResults"]["collection_group_results"]
        block_ids = group["blockIds"]
    except (KeyError, TypeError) as exc:
        raise SchemaDriftError(f"unexpected queryCollection payload: missing {exc}") from exc

    if group.get("hasMore"):
        raise SchemaDriftError("queryCollection reported hasMore=true; refusing to emit a truncated dataset")

    by_name = {s.get("name"): key for key, s in (coll.get("schema") or {}).items()}
    missing = [p for p in REQUIRED_PROPERTIES if p not in by_name]
    if missing:
        raise SchemaDriftError(f"Notion schema is missing properties: {missing}")

    rows = []
    for bid in block_ids:
        props = _unwrap(rm.get("block", {}).get(bid)).get("properties") or {}

        def get(name: str):
            return props.get(by_name[name])

        rows.append({
            "id": bid,
            "name": plain(get("Name")),
            "description": plain(get("Description")),
            "link": url_value(get("Link")),
            "org_type": plain(get("Organization Type")),
            "activity": split_multi(get("Activity Type")),
            "focus": split_multi(get("Intervention Focus")),
            "locations": split_multi(get("Location (City, Country, Region)")),
            "gcbr_focus": plain(get("GCBR focus")),
            "is_node": plain(get("Is intermediate node")) == "Yes",
            "status": plain(get("Status")),
            "parent_ids": relation_ids(get("Parent")),
        })
    return rows


def fetch_live() -> dict:
    body = {
        "source": {"type": "collection", "id": COLLECTION_ID, "spaceId": SPACE_ID},
        "collectionView": {"id": VIEW_ID, "spaceId": SPACE_ID},
        "loader": {
            "type": "reducer",
            "reducers": {"collection_group_results": {"type": "results", "limit": 10000}},
            "sort": [], "searchQuery": "", "userTimeZone": "UTC",
        },
    }
    req = urllib.request.Request(
        NOTION_QUERY_URL,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": USER_AGENT},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.load(resp)


# ── taxonomy + extraction ───────────────────────────────────────────────────

def build_taxonomy(rows: list[dict]) -> dict:
    nodes = [r for r in rows if r["is_node"]]
    node_by_id = {n["id"]: n for n in nodes}
    rank = {name: i for i, name in enumerate(GROUP_ORDER)}
    groups = sorted((n for n in nodes if not n["parent_ids"]),
                    key=lambda n: rank.get(n["name"], len(rank)))

    subcats = []
    for g in groups:
        for n in nodes:  # Notion result order within a group
            if g["id"] in n["parent_ids"]:
                subcats.append({"id": slug(n["name"]), "label": n["name"], "group": slug(g["name"])})

    node_group = {slug(g["name"]): slug(g["name"]) for g in groups}
    node_group.update({s["id"]: s["group"] for s in subcats})
    return {
        "groups": [{"id": slug(g["name"]), "label": g["name"]} for g in groups],
        "subcats": subcats,
        "node_slug": {nid: slug(n["name"]) for nid, n in node_by_id.items()},
        "node_group": node_group,
    }


def _tag(key: str, value: str) -> str:
    return f"{key}:{value.replace(',', ' ')}"


def extract(rows: list[dict], url_status: dict[str, tuple[bool, str]], retrieved_at: str):
    tax = build_taxonomy(rows)
    entities: dict[str, Entity] = {}
    claims: list[Claim] = []
    quarantine: list[QuarantineRow] = []

    dir_sid = source_id_for(DIRECTORY_URL)
    sources = {dir_sid: Source(
        source_id=dir_sid,
        url=canonical_url(DIRECTORY_URL),
        url_raw=DIRECTORY_URL,
        publisher=PUBLISHER,
        title="Biosecurity World organisation directory",
        retrieved_at=retrieved_at,
        source_type="other",
    )}

    for r in rows:
        if r["is_node"]:
            continue
        origin = f"notion:biosecurityworld#{r['id']}"

        def reject(reason: str, row=r, origin=origin):
            quarantine.append(QuarantineRow(reason=reason, extracted_from=origin,
                                            raw=json.dumps(row, ensure_ascii=False)))

        if not r["name"]:
            reject("missing_entity_name")
            continue
        if r["status"] != "Approved":
            reject(f"not_approved:{r['status'] or 'empty'}")
            continue
        cats = [tax["node_slug"][p] for p in r["parent_ids"] if p in tax["node_slug"]]
        if not cats:
            reject("missing_category")
            continue
        eid = entity_id_for(r["name"])
        if eid in entities:
            reject(f"duplicate_entity:{eid}")
            continue

        website = canonical_url(r["link"]) if r["link"] else ""
        if not website:
            website_state = "none"
        elif url_status.get(website, (False, "unchecked"))[0]:
            website_state = "alive"
        else:
            website_state = "dead"
            quarantine.append(QuarantineRow(
                reason=f"dead_url:{url_status.get(website, (False, 'unchecked'))[1]}",
                extracted_from=origin,
                raw=json.dumps({"entity_id": eid, "url": r["link"]}, ensure_ascii=False),
            ))

        gcbr = {"Yes": "yes", "No": "no"}.get(r["gcbr_focus"], "unknown")
        base_tags = (
            [_tag("org_type", r["org_type"])]
            + [_tag("activity", a) for a in r["activity"]]
            + [_tag("focus", f) for f in r["focus"]]
            + [f"gcbr:{gcbr}", f"website:{website_state}", f"entity:{eid}"]
        )

        entities[eid] = Entity(
            entity_id=eid,
            name=r["name"],
            type=ORG_TYPE_TO_ENTITY_TYPE.get(r["org_type"], "other"),
            website=website,
            domain_tags=DOMAIN_TAG,
        )

        for cat in cats:
            claims.append(Claim(
                claim_id=claim_id_for(eid, "covers_decision_point", "", cat),
                entity_id=eid,
                predicate="covers_decision_point",
                value=cat,
                confidence="medium",
                source_ids=dir_sid,
                domain_tags=DOMAIN_TAG,
                tags=",".join(base_tags + [f"group:{tax['node_group'].get(cat, cat)}"]),
                notes=r["description"],
                extracted_from=origin,
                extracted_at=retrieved_at,
            ))
        if r["locations"]:
            value = "; ".join(r["locations"])
            claims.append(Claim(
                claim_id=claim_id_for(eid, "operates_in_jurisdiction", "", value),
                entity_id=eid,
                predicate="operates_in_jurisdiction",
                value=value,
                confidence="medium",
                source_ids=dir_sid,
                domain_tags=DOMAIN_TAG,
                tags=f"entity:{eid}",
                extracted_from=origin,
                extracted_at=retrieved_at,
            ))

    taxonomy = {"groups": tax["groups"], "subcats": tax["subcats"],
                "source_url": DIRECTORY_URL, "publisher": PUBLISHER,
                "retrieved_at": retrieved_at}
    return entities, claims, sources, quarantine, taxonomy


# ── CLI ─────────────────────────────────────────────────────────────────────

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--write", action="store_true", help="write CSVs + taxonomy to the zerotrust data dir")
    ap.add_argument("--snapshot", type=Path, help="read a saved queryCollection JSON instead of fetching")
    ap.add_argument("--skip-verify", action="store_true", help="skip website liveness checks (all tagged dead=unchecked)")
    args = ap.parse_args()

    retrieved_at = today()
    if args.snapshot:
        response = json.loads(args.snapshot.read_text(encoding="utf-8"))
        print(f"Loaded snapshot {args.snapshot}")
    else:
        print(f"Fetching {NOTION_QUERY_URL} ...")
        response = fetch_live()
        if args.write:
            snap = data_dir("raw", f"biosecurity_notion_{retrieved_at}.json")
            snap.parent.mkdir(parents=True, exist_ok=True)
            snap.write_text(json.dumps(response, ensure_ascii=False), encoding="utf-8")
            print(f"  raw snapshot -> {snap}")

    rows = parse_rows(response)
    print(f"  rows={len(rows)}  nodes={sum(r['is_node'] for r in rows)}")

    websites = {canonical_url(r["link"]) for r in rows if not r["is_node"] and r["link"]}
    if args.skip_verify:
        url_status = {u: (False, "unchecked") for u in websites}
    else:
        from .verify import verify_urls  # network-heavy import kept out of tests
        print(f"Verifying {len(websites)} websites ...")
        url_status = verify_urls(websites)

    entities, claims, sources, quarantine, taxonomy = extract(rows, url_status, retrieved_at)
    print(f"\nentities={len(entities)} claims={len(claims)} sources={len(sources)} quarantine={len(quarantine)}")
    for reason, n in Counter(q.reason.split(":")[0] for q in quarantine).most_common():
        print(f"  {reason:22s} {n}")

    if not args.write:
        print("\n(dry-run; pass --write to emit CSVs)")
        return 0

    out = data_dir()
    write_entities(out / "entities_biosecurity.csv", entities.values())
    write_claims(out / "claims_biosecurity.csv", claims)
    write_sources(out / "sources_biosecurity.csv", sources.values())
    write_quarantine(out / "quarantine_biosecurity.csv", quarantine)
    (out / "biosecurity_taxonomy.json").write_text(
        json.dumps(taxonomy, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nWrote {out}/*_biosecurity.csv + biosecurity_taxonomy.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
