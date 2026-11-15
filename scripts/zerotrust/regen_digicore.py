"""Regenerate frontend/src/data/digicore.ts from the DIGICORE workshop decision database.

Upstream: the decision board built from the DIGICORE real-world-evidence workshop
(Erice, 12-15 Nov 2026) and public sources, stored as SQLite (`decisions.sqlite`,
tables evidence / candidates / verdicts / centres / use_cases / ...). Every row there
cites evidence ids; every evidence row has a source string and a `verified` flag.

Output: frontend/src/data/digicore.ts, auto-generated, never hand-edited.

Publication rules applied here (the page is public, the repo is public):
  - Only rows whose evidence is all confirmed (verified=1) or a company's own claim
    are emitted. Unconfirmed rows (notes, partial checks, open [CONFIRM]) are dropped,
    the same rule as the board's default "Show unconfirmed = off".
  - Sources: only URLs read verbatim from the evidence `source` string are emitted
    (AGENTS.md hard rule 1). A workshop-slide source becomes `slides: true`; deck file
    names are NOT emitted because they carry speaker names.
  - No natural persons: speaker columns are dropped, and a guard fails the run if any
    person named in the workshop material appears in the emitted text.
  - The map embeds organisations and companies only (never people), from the workshop
    decks only (the ESMO paper's COI / affiliation lists are excluded).

The database path is a required argument: there is no default copy to fall back on.

Run:
  python -m scripts.zerotrust.regen_digicore --db PATH/decisions.sqlite            # dry run
  python -m scripts.zerotrust.regen_digicore --db PATH/decisions.sqlite --write
"""
from __future__ import annotations

import argparse
import json
import re
import sqlite3
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
OUT_TS = REPO_ROOT / "frontend" / "src" / "data" / "digicore.ts"

STATUS_ORDER = ["confirmed", "company claim", "unconfirmed"]
PUBLISHABLE = {"confirmed", "company claim"}
URL_RE = re.compile(r"https?://[^\s;,'\"<>]+")
SLIDE_PREFIX = "digicore-rwe-workshop-2026/"

# t-SNE settings, fixed so the map is reproducible.
TSNE = {"perplexity": 15, "seed": 0, "metric": "cosine", "init": "pca", "max_iter": 2000}
MAP_TYPES = ("organisation", "company")

# First-pass themes (assigned in the decision db) folded to seven groups, so the map
# needs no more than seven categorical colours. Order = legend order = colour slot.
THEME_GROUPS = [
    ("centres", "Clinical centres and academia", ["clinical centres and academia"]),
    ("patients", "Patient networks", ["patient networks"]),
    ("industry", "Pharma and industry", ["pharma"]),
    ("regulators", "Regulators", ["regulators"]),
    ("funding", "Funding and policy", ["funding and policy"]),
    ("data", "Data, methods and genomics", ["data infrastructure", "methods", "genomics", "imaging", "clinical evidence"]),
    ("other", "Other", ["other", "education and events", "people"]),
]
# Muted hues in the atlas's own hsl() style (cf. aiLifeSciences.ts); validated with the dataviz
# skill's validate_palette.js in light and dark mode (hex: 2e67b8 ab3c2b 1d876c bb861b a94c8a 608131 7d56b3).
THEME_COLORS = ["hsl(215 60% 45%)", "hsl(8 60% 42%)", "hsl(165 65% 32%)", "hsl(40 75% 42%)",
                "hsl(320 38% 48%)", "hsl(85 45% 35%)", "hsl(265 38% 52%)"]


# A company claim needs the explicit marker "(company claim" / "(company claims" in the source;
# any other mention of "company" (a company page, a /company/ URL) stays unconfirmed.
COMPANY_CLAIM_RE = re.compile(r"\(company claims?\b", re.IGNORECASE)
# Name particles that are also ordinary words; never treated as a name on their own.
NAME_STOPWORDS = {"van", "von", "de", "der", "den", "di", "da", "du", "dos", "del", "la", "le", "el", "al", "bin", "ten"}
# Fields that hold organisation names or URLs: kept verbatim by redact().
VERBATIM_KEYS = ("src", "name", "institution", "organisation")


class PublicationError(RuntimeError):
    pass


def evidence_map(con: sqlite3.Connection) -> dict[str, dict]:
    out = {}
    for eid, verified, source in con.execute("SELECT evidence_id, verified, source FROM evidence"):
        if verified:
            status = "confirmed"
        elif COMPANY_CLAIM_RE.search(source):
            status = "company claim"
        else:
            status = "unconfirmed"
        out[eid] = {
            "status": status,
            "urls": [u.rstrip(".)") for u in URL_RE.findall(source)],
            "slides": SLIDE_PREFIX in source,
        }
    return out


def row_meta(ev: dict[str, dict], evidence_ids: str | None, text: str = "") -> dict | None:
    """Status + sources for a row, or None when the row may not be published."""
    ids = [i.strip() for i in (evidence_ids or "").split(",") if i.strip()]
    if not ids or "[CONFIRM]" in text:
        return None
    missing = [i for i in ids if i not in ev]
    if missing:
        raise PublicationError(f"evidence ids not in evidence table: {missing}")
    status = max((ev[i]["status"] for i in ids), key=STATUS_ORDER.index)
    if status not in PUBLISHABLE:
        return None
    urls: list[str] = []
    for i in ids:
        for u in ev[i]["urls"]:
            if u not in urls:
                urls.append(u)
    return {"status": status, "src": urls, "slides": any(ev[i]["slides"] for i in ids)}


def rows(con, sql: str) -> list[dict]:
    cur = con.execute(sql)
    cols = [d[0] for d in cur.description]
    return [dict(zip(cols, r)) for r in cur.fetchall()]


def publish(con, ev, sql: str, text_cols: tuple[str, ...]) -> tuple[list[dict], int]:
    out, dropped = [], 0
    for r in rows(con, sql):
        meta = row_meta(ev, r.pop("evidence_ids"), " ".join(str(r.get(c) or "") for c in text_cols))
        if meta is None:
            dropped += 1
            continue
        out.append({**{k: (v if v is not None else "") for k, v in r.items()}, **meta})
    return out, dropped


def org_map(con) -> list[dict]:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.manifold import TSNE as SkTSNE

    group_of = {theme: gid for gid, _, themes in THEME_GROUPS for theme in themes}
    placeholders = ",".join("?" for _ in MAP_TYPES)
    recs = con.execute(
        f"SELECT canonical, type, cluster_theme, description, relevance, source_url, source_kind "
        f"FROM mentions WHERE file NOT LIKE 'ESMO%' AND type IN ({placeholders}) ORDER BY id",
        MAP_TYPES,
    ).fetchall()
    orgs: dict[str, dict] = {}
    for canonical, typ, theme, desc, rel, url, kind in recs:
        o = orgs.setdefault(canonical, {"name": canonical, "type": typ, "theme": theme, "desc": "", "rel": "",
                                        "url": "", "kind": "", "mentions": 0})
        o["mentions"] += 1
        if not o["desc"] and desc and not desc.startswith("shown on the slide"):
            o.update(desc=desc, rel=rel or "", url=url or "", kind=kind or "")
    keep = []
    for o in orgs.values():
        k = o["kind"].lower()
        if not o["desc"] or k.startswith("not found") or "no public page" in k or k.startswith("slide"):
            continue  # no public description to embed or to show
        if o["theme"] not in group_of:
            raise PublicationError(f"theme {o['theme']!r} of {o['name']!r} has no group")
        keep.append(o)
    texts = [f"{o['desc']} {o['rel']}" for o in keep]
    X = TfidfVectorizer(stop_words="english", sublinear_tf=True, min_df=1).fit_transform(texts).toarray()
    xy = SkTSNE(n_components=2, perplexity=TSNE["perplexity"], random_state=TSNE["seed"], metric=TSNE["metric"],
                init=TSNE["init"], max_iter=TSNE["max_iter"]).fit_transform(X)
    lo, hi = xy.min(axis=0), xy.max(axis=0)
    xy = (xy - lo) / (hi - lo)
    out = []
    for o, (x, y) in zip(keep, xy):
        out.append({
            "name": o["name"], "type": o["type"], "group": group_of[o["theme"]],
            "x": round(float(x), 4), "y": round(float(y), 4),
            "desc": o["desc"], "src": o["url"] if o["url"].startswith("http") else "",
            "companyClaim": "company claim" in o["kind"].lower(), "mentions": o["mentions"],
        })
    return sorted(out, key=lambda r: r["name"].lower())


def _people(con) -> set[str]:
    names = {r[0] for r in con.execute("SELECT DISTINCT canonical FROM mentions WHERE type='person'")}
    names |= {r[0] for r in con.execute("SELECT DISTINCT speaker FROM use_cases WHERE speaker IS NOT NULL")}
    return {n.strip() for n in names if n and n.strip()}


def person_names(con) -> set[str]:
    """Every name part of 2+ letters (initials and particles excluded), for redaction and the guard."""
    tokens = set()
    for n in _people(con):
        for part in re.split(r"[\s,/()]+", n):
            if len(part) >= 2 and not part.endswith(".") and part.lower() not in NAME_STOPWORDS:
                tokens.add(part)
    return tokens


WITHHELD = "(name withheld)"
INITIAL_NAME_RE = re.compile(r"\b(?:[A-Z]\.\s?){1,2}[A-Z][a-z]+(?:-[A-Z][a-z]+)?\b")


def full_person_names(con) -> list[str]:
    """Known person names as whole strings (one-word names included), longest first."""
    return sorted(_people(con), key=len, reverse=True)


def redact(value, names: list[str], surnames: set[str]):
    """Replace natural-person names in emitted text: known full names, '(First) Part' for every known
    name part, and 'J. Surname' forms. Organisation-name and URL fields stay verbatim."""
    if isinstance(value, str):
        for n in names:
            value = re.sub(r"\b" + re.escape(n) + r"\b", WITHHELD, value)
        for t in surnames:
            value = re.sub(r"\b(?:[A-Z][\w-]+\s)?" + re.escape(t) + r"\b", WITHHELD, value)
        return INITIAL_NAME_RE.sub(WITHHELD, value)
    if isinstance(value, list):
        return [redact(v, names, surnames) for v in value]
    if isinstance(value, dict):
        return {k: (v if k in VERBATIM_KEYS else redact(v, names, surnames)) for k, v in value.items()}
    return value


def _strings(value, key=None):
    """(key, string) pairs of every string in the payload."""
    if isinstance(value, str):
        yield key, value
    elif isinstance(value, list):
        for v in value:
            yield from _strings(v, key)
    elif isinstance(value, dict):
        for k, v in value.items():
            yield from _strings(v, k)


def guard_people(payload: dict, tokens: set[str], names: list[str] = ()) -> list[str]:
    """Fail on any person name (whole name, or a capitalised name part) in free-text fields.

    Organisation-name fields are exempt only for themselves: a surname inside an organisation's name
    (e.g. a foundation) does not exempt that surname anywhere else. URL fields cannot be redacted
    (they are copied verbatim), so hits there are returned as warnings instead of failing.
    """
    # Whole names match in any case; single name parts match as written (capitalised), so ordinary
    # words ("young", "per") and acronyms (the NELSON trial) are not mistaken for people.
    needles = [(t, 0) for t in tokens] + [(n, re.IGNORECASE) for n in names]
    hits, warnings = set(), set()
    for key, text in _strings(payload):
        for t, flags in needles:
            if re.search(r"\b" + re.escape(t) + r"\b", text, flags):
                if key == "src":
                    warnings.add(f"{t} in URL {text}")
                elif key not in VERBATIM_KEYS:
                    hits.add(t)
    if hits:
        raise PublicationError(f"person names in public output: {sorted(hits)}")
    return sorted(warnings)


def build(db: Path) -> dict:
    con = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
    ev = evidence_map(con)
    dropped: dict[str, int] = {}

    def take(name, sql, text_cols=()):
        out, d = publish(con, ev, sql, text_cols)
        dropped[name] = d
        return out

    filters = rows(con, "SELECT filter_id AS id, label, meaning FROM filters ORDER BY filter_id")
    candidates = rows(con, "SELECT candidate_id AS id, setting, cohort FROM candidates ORDER BY candidate_id")
    verdicts = {}
    for v in rows(con, "SELECT candidate_id, filter_id, verdict, evidence_ids FROM verdicts"):
        meta = row_meta(ev, v["evidence_ids"])
        verdicts[f"{v['candidate_id']}|{v['filter_id']}"] = (
            {"verdict": v["verdict"], **meta} if meta else {"verdict": "unconfirmed", "status": "unconfirmed",
                                                             "src": [], "slides": False})
    payload = {
        "filters": filters,
        "candidates": [{**c, "cells": [verdicts[f"{c['id']}|{f['id']}"] for f in filters]} for c in candidates],
        "centres": take("centres", "SELECT institution, country, digicore, digione_pilot, atomcat, imaging, genomics, "
                        "federated_omop, rare_cancer, evidence_ids FROM centres ORDER BY id",
                        ("imaging", "genomics", "federated_omop", "rare_cancer")),
        "useCases": take("use_cases", "SELECT organisation, tumour, use_case AS useCase, imaging, evidence_ids "
                         "FROM use_cases ORDER BY id", ("use_case",)),
        "clinical": take("clinical_examples", "SELECT tumour, image, decision, who_has_images AS holders, "
                         "evidence_ids FROM clinical_examples ORDER BY id", ("image", "decision", "who_has_images")),
        "cohorts": take("open_cohorts", "SELECT name, region, access, licence, patients, images, contours, dose, "
                        "outcomes, evidence_ids FROM open_cohorts ORDER BY id", ("licence",)),
        "regulation": take("regulation", "SELECT law, article, requirement, evidence_ids FROM regulation ORDER BY id",
                           ("requirement",)),
        "funding": take("funding", "SELECT funder, instrument, type, amount, deadline, fit, evidence_ids "
                        "FROM funding ORDER BY id"),
        "tools": take("tools", "SELECT tool, does, limits, licence, evidence_ids FROM tools ORDER BY id",
                      ("does", "limits")),
        "orgMap": org_map(con),
    }
    tokens, names = person_names(con), full_person_names(con)
    payload = redact(payload, names, tokens)
    for w in guard_people(payload, tokens, names):
        print(f"warning: {w}", file=sys.stderr)
    payload["_dropped"] = dropped
    return payload


def render(p: dict, db: Path) -> str:
    dropped = p.pop("_dropped")
    groups = [{"id": gid, "label": label, "color": THEME_COLORS[i]} for i, (gid, label, _) in enumerate(THEME_GROUPS)]
    j = lambda v: json.dumps(v, ensure_ascii=False, indent=2)
    return f"""// AUTO-GENERATED by scripts/zerotrust/regen_digicore.py, do not edit by hand.
// Upstream: DIGICORE RWE workshop decision database ({db.name}), confirmed rows and company claims only.
// Rows dropped as unconfirmed: {json.dumps(dropped)}

export type RowStatus = 'confirmed' | 'company claim';
export interface Sourced {{
  status: RowStatus;
  /** URLs read verbatim from the evidence record. */
  src: string[];
  /** Also evidenced by a workshop slide (not public). */
  slides: boolean;
}}
export interface DcFilter {{ id: string; label: string; meaning: string }}
export type DcCell = (Sourced & {{ verdict: 'pass' | 'fail' | 'unknown' }}) |
  {{ verdict: 'unconfirmed'; status: 'unconfirmed'; src: string[]; slides: boolean }};
export interface DcCandidate {{ id: string; setting: string; cohort: string; cells: DcCell[] }}
export interface DcCentre extends Sourced {{
  institution: string; country: string; digicore: string; digione_pilot: string; atomcat: string;
  imaging: string; genomics: string; federated_omop: string; rare_cancer: string;
}}
export interface DcUseCase extends Sourced {{ organisation: string; tumour: string; useCase: string; imaging: string }}
export interface DcClinical extends Sourced {{ tumour: string; image: string; decision: string; holders: string }}
export interface DcCohort extends Sourced {{
  name: string; region: string; access: string; licence: string; patients: string;
  images: string; contours: string; dose: string; outcomes: string;
}}
export interface DcRegulation extends Sourced {{ law: string; article: string; requirement: string }}
export interface DcFunding extends Sourced {{
  funder: string; instrument: string; type: string; amount: string; deadline: string; fit: string;
}}
export interface DcTool extends Sourced {{ tool: string; does: string; limits: string; licence: string }}
export interface DcOrgGroup {{ id: string; label: string; color: string }}
export interface DcOrgPoint {{
  name: string; type: 'organisation' | 'company'; group: string; x: number; y: number;
  desc: string; src: string; companyClaim: boolean; mentions: number;
}}

export const DC_SOURCE = {{
  workshop: 'DIGICORE workshop on methods in real-world-evidence cancer research, Erice, 12-15 Nov 2026',
  network: 'https://digicore-cancer.eu/about-us/our-community',
}} as const;

export const DC_TSNE = {j({**TSNE, "features": "TF-IDF of each organisation's public description and relevance text",
                              "types": list(MAP_TYPES), "excluded": "people; ESMO paper COI and affiliation lists; organisations without a public description"})} as const;

export const DC_FILTERS: DcFilter[] = {j(p['filters'])};
export const DC_CANDIDATES: DcCandidate[] = {j(p['candidates'])};
export const DC_CENTRES: DcCentre[] = {j(p['centres'])};
export const DC_USE_CASES: DcUseCase[] = {j(p['useCases'])};
export const DC_CLINICAL: DcClinical[] = {j(p['clinical'])};
export const DC_COHORTS: DcCohort[] = {j(p['cohorts'])};
export const DC_REGULATION: DcRegulation[] = {j(p['regulation'])};
export const DC_FUNDING: DcFunding[] = {j(p['funding'])};
export const DC_TOOLS: DcTool[] = {j(p['tools'])};
export const DC_ORG_GROUPS: DcOrgGroup[] = {j(groups)};
export const DC_ORG_MAP: DcOrgPoint[] = {j(p['orgMap'])};
"""


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--db", type=Path, required=True, help="path to decisions.sqlite")
    ap.add_argument("--write", action="store_true")
    a = ap.parse_args(argv)
    if not a.db.exists():
        raise SystemExit(f"{a.db} not found")
    payload = build(a.db)
    counts = {k: len(v) for k, v in payload.items() if isinstance(v, list)}
    ts = render(payload, a.db)
    print(f"counts: {counts}", file=sys.stderr)
    if a.write:
        OUT_TS.write_text(ts, encoding="utf-8", newline="\n")
        print(f"wrote {OUT_TS}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
