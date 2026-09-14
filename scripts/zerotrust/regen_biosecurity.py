"""Regenerate frontend/src/data/biosecurity.ts from the zerotrust CSVs.

Input (written by extract_biosecurity --write, checked by validate --domain biosecurity):
  entities_biosecurity.csv, claims_biosecurity.csv, sources_biosecurity.csv,
  biosecurity_taxonomy.json

Output: frontend/src/data/biosecurity.ts — auto-generated, never hand-edited.

Unlike regen_oncology.py (a PoC that writes *.regenerated.ts for diffing), the
biosecurity hub has no hand-written draft to protect, so this writes the
authoritative module directly. The CSV intermediate stands in for the Airtable
snapshot until the domain is uploaded; the entity/claim/source shape is the same.

Run:
  python -m scripts.zerotrust.regen_biosecurity           # print to stdout
  python -m scripts.zerotrust.regen_biosecurity --write
"""
from __future__ import annotations

import argparse
import csv
import json
import sys
from collections import Counter
from pathlib import Path

from .common import data_dir

REPO_ROOT = Path(__file__).resolve().parents[2]
OUT_TS = REPO_ROOT / "frontend" / "src" / "data" / "biosecurity.ts"
DOMAIN_TAG = "biosecurity"

# Editorial display colours per top-level category (structural, not factual).
GROUP_COLORS = {
    "prevention": "hsl(160 45% 34%)",
    "detection": "hsl(35 75% 40%)",
    "response": "hsl(355 55% 46%)",
    "transversal": "hsl(220 25% 42%)",
}
FALLBACK_COLOR = "hsl(var(--muted-foreground))"


def _load_csv(name: str) -> list[dict]:
    path = data_dir(name)
    if not path.exists():
        raise FileNotFoundError(f"{path} not found — run extract_biosecurity --write first")
    with path.open(encoding="utf-8", newline="") as fh:
        return list(csv.DictReader(fh))


def _parse_tags(raw: str) -> dict[str, list[str]]:
    out: dict[str, list[str]] = {}
    for part in (raw or "").split(","):
        key, sep, value = part.strip().partition(":")
        if sep and value:
            out.setdefault(key, []).append(value)
    return out


def build(entities: list[dict], claims: list[dict], sources: list[dict], taxonomy: dict) -> dict:
    ent_by_id = {e["entity_id"]: e for e in entities}
    src_by_id = {s["source_id"]: s for s in sources}
    orgs: dict[str, dict] = {}

    for c in claims:
        if DOMAIN_TAG not in (c.get("domain_tags") or "").split(","):
            continue
        ent = ent_by_id.get(c["entity_id"])
        if not ent:
            continue
        first_sid = (c.get("source_ids") or "").split(",")[0].strip()
        src_url = src_by_id.get(first_sid, {}).get("url", "")

        org = orgs.get(ent["entity_id"])
        if org is None:
            org = orgs[ent["entity_id"]] = {
                "id": ent["entity_id"], "name": ent["name"], "desc": "",
                "type": "", "activity": [], "focus": [], "approach": [],
                "loc": [], "gcbr": False, "cols": [],
                "web": ent.get("website", ""), "webAlive": False, "src": src_url,
            }

        if c["predicate"] == "covers_decision_point":
            tags = _parse_tags(c.get("tags", ""))
            if c["value"] not in org["cols"]:
                org["cols"].append(c["value"])
            org["desc"] = org["desc"] or (c.get("notes") or "")
            org["type"] = (tags.get("org_type") or [""])[0]
            org["activity"] = tags.get("activity", [])
            focus = tags.get("focus", [])
            org["focus"] = [f for f in focus if not f.startswith("[")]
            org["approach"] = [f.strip("[]").lower() for f in focus if f.startswith("[")]
            org["gcbr"] = tags.get("gcbr") == ["yes"]
            org["webAlive"] = tags.get("website") == ["alive"]
        elif c["predicate"] == "operates_in_jurisdiction":
            org["loc"] = [x for x in c["value"].split("; ") if x]

    # Columns: per group, a "General" column when orgs are filed directly under
    # the group, followed by its sub-categories in Notion order.
    used = Counter(col for o in orgs.values() for col in o["cols"])
    columns = []
    for g in taxonomy["groups"]:
        if used[g["id"]]:
            columns.append({"id": g["id"], "label": "General", "group": g["id"]})
        columns.extend({"id": s["id"], "label": s["label"], "group": s["group"]}
                       for s in taxonomy["subcats"] if s["group"] == g["id"])

    focus_counts = Counter(f for o in orgs.values() for f in o["focus"])
    return {
        "groups": [{**g, "color": GROUP_COLORS.get(g["id"], FALLBACK_COLOR)} for g in taxonomy["groups"]],
        "columns": columns,
        "focus_order": [f for f, _ in sorted(focus_counts.items(), key=lambda kv: (-kv[1], kv[0]))],
        "orgs": sorted(orgs.values(), key=lambda o: o["name"].lower()),
        "source": {"name": taxonomy["publisher"], "url": taxonomy["source_url"],
                   "retrievedAt": taxonomy["retrieved_at"]},
    }


def render_ts(data: dict) -> str:
    dump = lambda v: json.dumps(v, indent=2, ensure_ascii=False)  # noqa: E731
    return "\n".join([
        "// AUTO-GENERATED by scripts/zerotrust/regen_biosecurity.py — do not edit by hand.",
        "// Upstream: Biosecurity World organisation directory (public Notion database).",
        "// Pipeline: extract_biosecurity -> validate --domain biosecurity -> regen_biosecurity.",
        f"// Organisations: {len(data['orgs'])}",
        "",
        "export interface BioGroup { id: string; label: string; color: string }",
        "export interface BioColumn { id: string; label: string; group: string }",
        "export interface BioOrg {",
        "  id: string;",
        "  name: string;",
        "  desc: string;",
        "  /** Organization Type as listed upstream. */",
        "  type: string;",
        "  activity: string[];",
        "  /** Intervention focus areas (approach tags removed). */",
        "  focus: string[];",
        "  /** 'governance' | 'technical' approach tags. */",
        "  approach: string[];",
        "  loc: string[];",
        "  /** Upstream 'GCBR focus' flag. */",
        "  gcbr: boolean;",
        "  /** BIO_COLUMNS ids the directory files this org under. */",
        "  cols: string[];",
        "  web: string;",
        "  /** Website answered a liveness check at extraction time. */",
        "  webAlive: boolean;",
        "  /** Primary evidence for the categorisation claims. */",
        "  src: string;",
        "}",
        "",
        f"export const BIO_SOURCE = {dump(data['source'])} as const;",
        "",
        f"export const BIO_GROUPS: BioGroup[] = {dump(data['groups'])};",
        "",
        f"export const BIO_COLUMNS: BioColumn[] = {dump(data['columns'])};",
        "",
        f"export const BIO_FOCUS_ORDER: string[] = {dump(data['focus_order'])};",
        "",
        f"export const BIO_ORGS: BioOrg[] = {dump(data['orgs'])};",
        "",
    ])


def regen() -> str:
    taxonomy = json.loads(data_dir("biosecurity_taxonomy.json").read_text(encoding="utf-8"))
    data = build(_load_csv("entities_biosecurity.csv"), _load_csv("claims_biosecurity.csv"),
                 _load_csv("sources_biosecurity.csv"), taxonomy)
    return render_ts(data)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--write", action="store_true", help="write frontend/src/data/biosecurity.ts")
    args = ap.parse_args()
    ts = regen()
    if args.write:
        OUT_TS.write_text(ts, encoding="utf-8")
        print(f"Wrote {OUT_TS.relative_to(REPO_ROOT)} ({len(ts)} chars)", file=sys.stderr)
    else:
        sys.stdout.write(ts)
    return 0


if __name__ == "__main__":
    sys.exit(main())
