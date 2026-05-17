# Zero-Trust dataset pipeline

> Mixed xlsx with inconsistent schemas → three normalized tables
> (`entities`, `claims`, `sources`) where **every claim cites at least
> one primary source URL**.

Inspired by aisafety.com's directory model + AGENTS.md compliance rule
("every entry that asserts a fact must include a `src` URL pointing at
primary evidence"). Designed so the same dataset feeds:

1. **Airtable** for analysis (filter/group/rollup)
2. **Frontend hubs** (TS data generation — already does this for
   `aiLifeSciences.ts`)
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
