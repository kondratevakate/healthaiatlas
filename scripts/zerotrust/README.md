# Zero-Trust dataset pipeline

> Mixed xlsx with inconsistent schemas → three normalized tables
> (`entities`, `claims`, `sources`) where **every claim cites at least
> one primary source URL**.

Inspired by aisafety.com's directory model + AGENTS.md compliance rule
("every entry that asserts a fact must include a `src` URL pointing at
primary evidence"). Designed so the same dataset feeds:

1. **Airtable** — canonical store (base `appiYen6pEW5tSVrn`, "AI Atlas")
2. **Frontend** — `frontend/src/data/*.ts` generated FROM Airtable
   (target architecture; some files currently bypass Airtable and will
   be migrated — see `feedback_zerotrust_is_canonical.md` in memory)
3. **Audits** — `validate.py` enforces invariants on every build

## Quickstart

```
# 1. regenerate CSVs from xlsx sources
python -m scripts.zerotrust.build

# 2. enforce zero-trust invariants
python -m scripts.zerotrust.validate

# 3a. preview Airtable upload (no API calls)
$env:AIRTABLE_DRY_RUN = "1"
python -m scripts.zerotrust.to_airtable

# 3b. real upload (one-time setup: see airtable_schema.md)
$env:AIRTABLE_TOKEN   = "pat..."
$env:AIRTABLE_BASE_ID = "app..."
python -m scripts.zerotrust.to_airtable
```

Output (regenerated each build, not checked into git):

```
C:\Projects\data\aiatls\zerotrust\
  entities.csv      # one row per canonical company / org / dataset
  claims.csv        # one row per fact; entity FK + source FKs
  sources.csv       # one row per primary URL
  quarantine.csv    # rows rejected during extract (audit only)
```

## Files

| File                        | Role                                                       |
|-----------------------------|------------------------------------------------------------|
| `schema.py`                 | Dataclasses + canonical column lists                       |
| `predicates.py`             | **Locked** vocabulary of claim predicates                  |
| `common.py`                 | slug / hash IDs / URL canonicalization / CSV I/O           |
| `extract_ai_arch_revenue.py`| Extractor for `ai_arch_revenue_data_final.xlsx`            |
| `extract_lifesci_style.py`  | Extractor for `AI_LifeSci_Landscape_v4.xlsx` (also works for `Oncology_AI_enriched_v3.xlsx` — same 37-col schema) |
| `build.py`                  | Runs all extractors, merges, writes CSVs                   |
| `validate.py`               | Enforces invariants (claims have sources, no dup URLs, …)  |
| `to_airtable.py`            | Idempotent upload via PAT                                  |
| `airtable_schema.md`        | One-time base setup instructions                           |
| `cleanup_stub_sources.py`   | Delete orphan stub Source rows (no URL, no claims linked)  |
| `cleanup_duplicate_tags.py` | Dedupe Tags rows that share a Tag Name                     |
| `schema_patch.py`           | Add missing fields (`Value Text`, `Entity`, `Domain Tags`) via Metadata API |

## Hygiene scripts

The base accumulates parallel/duplicate data over time (Airtable native
xlsx imports, AI auto-tagging, abandoned upload attempts). The
`cleanup_*` and `schema_patch` scripts are the canonical way to fix it.

All three are **dry-run by default** and write timestamped backups to
`C:\Projects\data\aiatls\zerotrust\` before any mutation.

```
# Inspect what would change
python -m scripts.zerotrust.cleanup_stub_sources
python -m scripts.zerotrust.cleanup_duplicate_tags
python -m scripts.zerotrust.schema_patch

# Apply
python -m scripts.zerotrust.cleanup_stub_sources --apply
python -m scripts.zerotrust.cleanup_duplicate_tags --apply
python -m scripts.zerotrust.schema_patch --apply

# Then re-run upload to fill what was previously skipped
python -m scripts.zerotrust.to_airtable
```

### What `schema_patch.py` adds

| Table     | Field         | Type                   | Purpose |
|-----------|---------------|------------------------|---------|
| Claims    | `Value Text`  | multilineText          | Holds non-numeric claim values (`partnered_with=Microsoft`, `released_product=ISM8969`). Without it `to_airtable.py` skips ~60% of generated claims. |
| Claims    | `Entity`      | multipleRecordLinks → Entities | Real Claim → Entity FK so rollups on Entities (Total Claims, Total Revenue, …) work. |
| Entities  | `Domain Tags` | multipleRecordLinks → Tags | Filter Entities by domain in the Airtable UI. Currently all 470 Entities have no domain attribution at entity level — only at claim level. |

Requires `schema.bases:write` scope on the PAT. If 403, regenerate the
token at https://airtable.com/create/tokens with that scope checked.

## Invariants

Hard (validator exits 1):

- Every claim has at least one `source_ids` entry
- Every `source_ids` entry resolves to a row in `sources.csv`
- Every claim's `entity_id` resolves to a row in `entities.csv`
- Every source has `url` + `retrieved_at`
- No duplicate canonical URLs across sources
- No duplicate `claim_id`s

Soft (warnings only):

- Orphan entities (zero claims) — usually fine but flagged
- Orphan sources (referenced by no claim)

## Confidence scale

Locked across **all** domains: `high` / `medium` / `low`.

Other source xlsx use shapes like `PRIMARY/SECONDARY` (in
`ai_arch_revenue`) or `1-5` reliability scores (in `aiLifeSciences.ts`).
Extractors translate these into the canonical scale; original values are
preserved in the source `excerpt` field where lossless.

## Adding a new xlsx

1. Inspect: `python -c "import openpyxl; wb = openpyxl.load_workbook(PATH, read_only=True); …"`
2. Copy `extract_lifesci_style.py` → `extract_<name>.py`
3. Map source columns → `(entity, predicate, value, period, source_url, confidence)`
   tuples. Reuse predicates from `predicates.py`; add new ones only with
   reviewer sign-off (they propagate to Airtable single-select options).
4. Register in `build.py`'s `EXTRACTORS` list.
5. Run `build` + `validate`. Fix until both green.
6. Run `to_airtable` (dry-run first).
