"""Upload entities / sources / claims CSVs to Airtable base 'AI Atlas'.

Targets the actual field names found by `--inspect` in the user's base, not a
greenfield schema. Field-name mapping is in FIELDS below — single source of
truth for any future field renames.

Idempotency: uses 'External ID' field (must exist on every target table) to
look up records on each upsert. Re-runs after `build.py` only PATCH changed
rows; no duplicates.

Cascade order: Tags -> Sources -> Entities -> Claims (Claims links to all).

ENV:
  AIRTABLE_TOKEN     PAT with data.records:read/write + schema.bases:read
  AIRTABLE_BASE      base id (app...) — also accepts AIRTABLE_BASE_ID

Flags:
  --inspect    print the base schema and exit
  --dry-run    plan all upserts but make zero write calls
  --limit N    only process the first N records of each CSV (smoke test)
"""
from __future__ import annotations

import csv
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

# ── paths / config ──────────────────────────────────────────────────────────

OUT_DIR = Path(r"C:\Projects\data\aiatls\zerotrust")
REPO_ROOT = Path(__file__).resolve().parents[2]
ENV_SEARCH_PATHS = [
    Path(__file__).resolve().parent / ".env",
    REPO_ROOT / "backend" / ".env",
    REPO_ROOT / ".env",
]

API_BASE = "https://api.airtable.com/v0"
RATE_SLEEP = 0.25  # 4 req/s — safe under Airtable's 5 req/s/base limit

TABLE_TAGS = "Tags"
TABLE_SOURCES = "Sources"
TABLE_ENTITIES = "Entities"
TABLE_CLAIMS = "Claims"

# Mapping CSV column -> Airtable field name, per target table.
# 'External ID' is the upsert key on every table.
FIELDS = {
    TABLE_TAGS: {
        "external_id":  "External ID",
        "name":         "Tag Name",
        "description":  "Description",
    },
    TABLE_SOURCES: {
        "external_id":   "External ID",
        "name":          "Source Name",   # primary
        "url":           "URL",
        "source_type":   "Source Type",   # singleSelect, with typecast
        "published_at":  "Date Published",
    },
    TABLE_ENTITIES: {
        "external_id":  "External ID",
        "name":         "Entity Name",    # primary
        "description":  "Description",
        "website":      "Website",
        "industry":     "Industry",
        "location":     "Location",
    },
    TABLE_CLAIMS: {
        "external_id":   "External ID",
        "claim_id":      "Claim ID",      # primary, mirrors external_id for UI
        "predicate":     "Predicate",
        "value":         "Value",          # number — only numeric values go here
        "value_unit":    "Value Unit",     # singleSelect, typecast
        "period":        "Period",
        "jurisdiction":  "Jurisdiction",
        "confidence":    "Confidence",     # singleSelect
        "domain_tags":   "Domain Tags",    # linked -> Tags
        "tags":          "Tags",           # multipleSelects, typecast
        "sources":       "Extracted From", # linked -> Sources (user's schema reuses this)
        "extracted_at":  "Extracted At",
        # 'Value Text' (long text) is optional — if user adds it, non-numeric
        # values will be written there. Detected at runtime via _has_field().
        "value_text":    "Value Text",
        # 'Notes' (long text, multilineText) is optional — added by
        # schema_patch v2. Holds the original narrative `desc` / `detail`
        # field from the source draft so regen_*.py can reconstruct
        # narrative fields losslessly. Detected at runtime via _has_field().
        "notes":         "Notes",
    },
}

# Map our source_type vocabulary -> options that exist in user's Source Type field.
# Anything not in this map falls through as-is and Airtable creates the option
# (because we POST with typecast=true).
SOURCE_TYPE_MAP = {
    "press_release":    "Press Release",
    "filing":           "Financial Statement",
    "vendor_doc":       "Website",
    "policy":           "Report",
    "official_registry": "Report",
    "peer_reviewed":    "Report",
    "preprint":         "Report",
    "news":             "Other",
    "blog":             "Other",
    "social":           "Other",
    "other":            "Other",
}


# ── env loading ─────────────────────────────────────────────────────────────

def _load_dotenv(paths: list[Path]) -> Path | None:
    loaded: Path | None = None
    for path in paths:
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
        loaded = loaded or path
    return loaded


def _resolve_base_id() -> str | None:
    return os.environ.get("AIRTABLE_BASE_ID") or os.environ.get("AIRTABLE_BASE")


# ── HTTP ────────────────────────────────────────────────────────────────────

def _api(method: str, url: str, body: dict | None, token: str) -> dict:
    req = urllib.request.Request(
        url, method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        data=json.dumps(body).encode("utf-8") if body else None,
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        try:
            err_body = e.read().decode("utf-8")
        except Exception:
            err_body = "<no body>"
        raise RuntimeError(
            f"Airtable {method} {url}\n  -> HTTP {e.code}\n  body: {err_body}"
        ) from None


# ── schema inspection ──────────────────────────────────────────────────────

def _inspect_base(base_id: str, token: str) -> dict:
    """Return tables-by-name dict. Also prints summary if invoked standalone."""
    url = f"{API_BASE}/meta/bases/{base_id}/tables"
    data = _api("GET", url, None, token)
    return {t["name"]: t for t in data.get("tables", [])}


def _print_inspect(base_id: str, token: str) -> None:
    tables = _inspect_base(base_id, token)
    print(f"[inspect] base {base_id} has {len(tables)} table(s):\n")
    for name, t in tables.items():
        print(f"  TABLE  {name!r}  id={t['id']}")
        for fld in t.get("fields", []):
            opts = ""
            if fld.get("type") in {"singleSelect", "multipleSelects"}:
                names = [o["name"] for o in fld.get("options", {}).get("choices", [])]
                opts = f"  choices={names[:6]}{'…' if len(names) > 6 else ''}"
            elif fld.get("type") == "multipleRecordLinks":
                opts = f"  -> {fld.get('options', {}).get('linkedTableId', '?')}"
            print(f"           {fld['name']!r:32} {fld['type']}{opts}")
        print()


def _has_field(schema: dict, table: str, field: str) -> bool:
    if table not in schema:
        return False
    return any(f["name"] == field for f in schema[table].get("fields", []))


# ── existing records lookup ─────────────────────────────────────────────────

def _list_records(base_id: str, table: str, token: str,
                  fields: list[str]) -> dict[str, str]:
    """external_id -> Airtable record id, scanning the whole table."""
    out: dict[str, str] = {}
    offset = None
    ext_field = fields[0]
    while True:
        params = [("pageSize", "100")]
        for f in fields:
            params.append(("fields[]", f))
        if offset:
            params.append(("offset", offset))
        q = urllib.parse.urlencode(params)
        url = f"{API_BASE}/{base_id}/{urllib.parse.quote(table)}?{q}"
        page = _api("GET", url, None, token)
        for rec in page.get("records", []):
            ext = rec["fields"].get(ext_field)
            if ext:
                out[ext] = rec["id"]
        offset = page.get("offset")
        if not offset:
            return out
        time.sleep(RATE_SLEEP)


# ── upsert ──────────────────────────────────────────────────────────────────

def _chunks(seq: list, n: int):
    for i in range(0, len(seq), n):
        yield seq[i:i + n]


def _upsert(base_id: str, table: str, payloads: list[dict],
            existing: dict[str, str], ext_id_field: str,
            token: str, dry: bool) -> dict[str, str]:
    """payloads = [{"fields": {...}}, ...]; returns ext_id -> recid for new+existing."""
    to_create: list[dict] = []
    to_update: list[dict] = []
    new_recids: dict[str, str] = dict(existing)

    for p in payloads:
        ext = p["fields"].get(ext_id_field)
        if not ext:
            continue
        if ext in existing:
            to_update.append({"id": existing[ext], "fields": p["fields"]})
        else:
            to_create.append(p)

    if dry:
        print(f"  [{table}]  would create={len(to_create)}  update={len(to_update)}")
        # Pretend created records got recids so cascade resolution can continue
        for p in to_create:
            ext = p["fields"][ext_id_field]
            new_recids[ext] = f"rec_dry_{ext[:8]}"
        return new_recids

    url = f"{API_BASE}/{base_id}/{urllib.parse.quote(table)}"
    for chunk in _chunks(to_create, 10):
        resp = _api("POST", url, {"records": chunk, "typecast": True}, token)
        for rec in resp.get("records", []):
            ext = rec["fields"].get(ext_id_field)
            if ext:
                new_recids[ext] = rec["id"]
        time.sleep(RATE_SLEEP)
    for chunk in _chunks(to_update, 10):
        _api("PATCH", url, {"records": chunk, "typecast": True}, token)
        time.sleep(RATE_SLEEP)

    print(f"  [{table}]  created={len(to_create)}  updated={len(to_update)}")
    return new_recids


# ── CSV reading + payload building ─────────────────────────────────────────

def _read_csv(name: str, limit: int | None = None) -> list[dict]:
    with (OUT_DIR / name).open(encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))
    return rows if limit is None else rows[:limit]


def _split_list(s: str) -> list[str]:
    return [x.strip() for x in (s or "").split(",") if x.strip()]


def _build_tag_payloads(claims_rows: list[dict]) -> list[dict]:
    """Tags table seeded from unique domain_tags across all claims.

    External ID = the tag string itself (slug-form already, e.g. 'ai_lifesci').
    """
    unique: set[str] = set()
    for r in claims_rows:
        unique.update(_split_list(r["domain_tags"]))
    M = FIELDS[TABLE_TAGS]
    return [{"fields": {
        M["external_id"]: tag,
        M["name"]:        tag,
        M["description"]: f"Domain tag — claims tagged {tag!r}",
    }} for tag in sorted(unique)]


def _build_source_payloads(rows: list[dict]) -> list[dict]:
    M = FIELDS[TABLE_SOURCES]
    out = []
    for r in rows:
        # Source Name: prefer title, fall back to publisher, fall back to URL slug
        name = (r["title"] or r["publisher"] or r["url"]).strip()[:200]
        pub = r["published_at"].strip()
        # Airtable date field requires ISO date or empty; partial years get nulled.
        date_val = pub if len(pub) == 10 else ""
        st = SOURCE_TYPE_MAP.get(r["source_type"], r["source_type"] or "Other")
        out.append({"fields": {
            M["external_id"]:  r["source_id"],
            M["name"]:         name,
            M["url"]:          r["url"],
            M["source_type"]:  st,
            M["published_at"]: date_val,
        }})
    return out


def _build_entity_payloads(rows: list[dict]) -> list[dict]:
    M = FIELDS[TABLE_ENTITIES]
    out = []
    for r in rows:
        location = ", ".join(x for x in [r["city"], r["country"]] if x)
        out.append({"fields": {
            M["external_id"]: r["entity_id"],
            M["name"]:        r["name"],
            M["description"]: r["notes"],
            M["website"]:     r["website"],
            M["industry"]:    r["type"],
            M["location"]:    location,
        }})
    return out


def _build_claim_payloads(rows: list[dict],
                          entity_map: dict[str, str],
                          source_map: dict[str, str],
                          tag_map: dict[str, str],
                          has_value_text: bool,
                          has_notes: bool = False) -> tuple[list[dict], int]:
    """Returns (payloads, skipped_non_numeric_count)."""
    M = FIELDS[TABLE_CLAIMS]
    out = []
    skipped = 0
    for r in rows:
        val_raw = r["value"].strip()
        is_numeric = _looks_numeric(val_raw)
        if not is_numeric and not has_value_text:
            skipped += 1
            continue
        src_recs = [source_map[s] for s in _split_list(r["source_ids"]) if s in source_map]
        if not src_recs:
            skipped += 1
            continue
        ent_rec = entity_map.get(r["entity_id"])
        if not ent_rec:
            skipped += 1
            continue
        domain_recs = [tag_map[t] for t in _split_list(r["domain_tags"]) if t in tag_map]
        # Claims has no entity link in user's schema — but it has 'Extracted From' -> Sources.
        # The entity is reachable via Sources -> Claims rollup; we cannot link entity
        # directly without adding a new field. For now, encode entity_id in Tags
        # so it's at least filterable/searchable.
        tags = _split_list(r["tags"]) + [f"entity:{r['entity_id']}"]

        fields = {
            M["external_id"]:  r["claim_id"],
            M["claim_id"]:     r["claim_id"],
            M["predicate"]:    r["predicate"],
            M["value_unit"]:   r["value_unit"],
            M["period"]:       r["period"],
            M["jurisdiction"]: r["jurisdiction"],
            M["confidence"]:   r["confidence"],
            M["domain_tags"]:  domain_recs,
            M["tags"]:         tags,
            M["sources"]:      src_recs,
            M["extracted_at"]: r["extracted_at"],
        }
        if is_numeric:
            try:
                fields[M["value"]] = float(val_raw)
            except ValueError:
                pass
        elif has_value_text:
            fields[M["value_text"]] = val_raw

        if has_notes and r.get("notes", "").strip():
            fields[M["notes"]] = r["notes"].strip()

        out.append({"fields": fields})
    return out, skipped


def _looks_numeric(s: str) -> bool:
    if not s:
        return False
    try:
        float(s)
        return True
    except ValueError:
        return False


# ── main ────────────────────────────────────────────────────────────────────

def main() -> int:
    loaded = _load_dotenv(ENV_SEARCH_PATHS)
    if loaded:
        print(f"[env] loaded {loaded}")
    token = os.environ.get("AIRTABLE_TOKEN")
    base_id = _resolve_base_id()

    if base_id and not base_id.startswith("app"):
        print(f"[error] AIRTABLE_BASE must be a base id (app...), got prefix {base_id[:3]!r}",
              file=sys.stderr)
        return 2

    if "--inspect" in sys.argv:
        if not token or not base_id:
            print("AIRTABLE_TOKEN and AIRTABLE_BASE_ID required", file=sys.stderr)
            return 1
        _print_inspect(base_id, token)
        return 0

    dry = "--dry-run" in sys.argv or os.environ.get("AIRTABLE_DRY_RUN") == "1"
    limit = None
    if "--limit" in sys.argv:
        i = sys.argv.index("--limit")
        limit = int(sys.argv[i + 1])

    if not token or not base_id:
        print("AIRTABLE_TOKEN and AIRTABLE_BASE_ID env vars are required", file=sys.stderr)
        return 1

    print(f"[base] {base_id}  dry_run={dry}  limit={limit}")

    # 0. Inspect schema (one round-trip) to know which optional fields exist.
    schema = _inspect_base(base_id, token)
    has_value_text = _has_field(schema, TABLE_CLAIMS, FIELDS[TABLE_CLAIMS]["value_text"])
    if not has_value_text:
        print("[warn] Claims has no 'Value Text' field — non-numeric claims will be skipped.")
    has_notes = _has_field(schema, TABLE_CLAIMS, FIELDS[TABLE_CLAIMS]["notes"])
    if not has_notes:
        print("[warn] Claims has no 'Notes' field — original narrative `desc` will not be uploaded.")

    # 1. Tags ──────────────────────────────────────────────────────────────
    print("[1/4] Tags …")
    claims_rows = _read_csv("claims.csv", limit)
    tag_payloads = _build_tag_payloads(claims_rows)
    tag_existing = _list_records(base_id, TABLE_TAGS, token,
                                 [FIELDS[TABLE_TAGS]["external_id"]])
    tag_map = _upsert(base_id, TABLE_TAGS, tag_payloads, tag_existing,
                      FIELDS[TABLE_TAGS]["external_id"], token, dry)

    # 2. Sources ──────────────────────────────────────────────────────────
    print("[2/4] Sources …")
    src_payloads = _build_source_payloads(_read_csv("sources.csv", limit))
    src_existing = _list_records(base_id, TABLE_SOURCES, token,
                                 [FIELDS[TABLE_SOURCES]["external_id"]])
    source_map = _upsert(base_id, TABLE_SOURCES, src_payloads, src_existing,
                         FIELDS[TABLE_SOURCES]["external_id"], token, dry)

    # 3. Entities ─────────────────────────────────────────────────────────
    print("[3/4] Entities …")
    ent_payloads = _build_entity_payloads(_read_csv("entities.csv", limit))
    ent_existing = _list_records(base_id, TABLE_ENTITIES, token,
                                 [FIELDS[TABLE_ENTITIES]["external_id"]])
    entity_map = _upsert(base_id, TABLE_ENTITIES, ent_payloads, ent_existing,
                         FIELDS[TABLE_ENTITIES]["external_id"], token, dry)

    # 4. Claims ───────────────────────────────────────────────────────────
    print("[4/4] Claims …")
    claim_payloads, skipped = _build_claim_payloads(
        claims_rows, entity_map, source_map, tag_map, has_value_text,
        has_notes=has_notes)
    if skipped:
        print(f"  [Claims] skipped {skipped} rows (non-numeric without Value Text, "
              f"or unresolved entity/source linkage)")
    cl_existing = _list_records(base_id, TABLE_CLAIMS, token,
                                [FIELDS[TABLE_CLAIMS]["external_id"]])
    _upsert(base_id, TABLE_CLAIMS, claim_payloads, cl_existing,
            FIELDS[TABLE_CLAIMS]["external_id"], token, dry)

    print("\ndone")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
