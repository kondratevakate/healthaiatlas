# Session notes — zero-trust pipeline (2026-05-17)

Hand-off document for code review in a fresh chat. Summarizes what was built,
what works, what's pending, and where to start reading.

## What was built

A pipeline that converts 8 mismatched xlsx files in `C:\Projects\data\aiatls\`
into three normalized tables (entities/claims/sources) where **every claim
cites at least one primary source URL** — the AGENTS.md compliance rule made
machine-enforceable. Outputs go to:

  - `C:\Projects\data\aiatls\zerotrust\{entities,claims,sources,quarantine}.csv`
  - Airtable base "AI Atlas" (`appiYen6pEW5tSVrn`), 4 tables

## File map (all under `scripts/zerotrust/`)

| File                          | Purpose                                                 |
|-------------------------------|---------------------------------------------------------|
| `schema.py`                   | dataclasses: Entity / Claim / Source / QuarantineRow    |
| `predicates.py`               | locked vocabulary of ~35 claim predicates               |
| `common.py`                   | slug, hash IDs, URL canonicalization, CSV I/O           |
| `extract_ai_arch_revenue.py`  | extractor #1 — ai_arch_revenue_data_final.xlsx          |
| `extract_lifesci_style.py`    | extractor #2 — AI_LifeSci_Landscape_v4.xlsx (Oncology reusable) |
| `build.py`                    | orchestrator: runs extractors, merges, dedupes, writes  |
| `validate.py`                 | invariants check (claim has source, no orphan refs, …)  |
| `to_airtable.py`              | idempotent uploader via External ID upsert keys         |
| `airtable_schema.md`          | one-time base setup doc (greenfield)                    |
| `README.md`                   | quickstart                                              |
| `.env.example`                | env template (real `.env` in `backend/.env`, gitignored)|

## Status numbers (as of session end)

```
Pipeline (CSV stage):    249 entities · 860 claims · 251 sources · 0 quarantine
Airtable upload:         249 entities · 213 claims · 251 sources · 3 tags (716 total / 1000 Free limit)
Skipped on upload:       647 claims (non-numeric values; no Value Text field on Claims table)
```

## Three things I'd want reviewer to look at first

1. **`schema.py` + `predicates.py`** — these define the data contract. Everything
   downstream pivots on them. The predicate vocabulary is locked (closed enum) —
   is that the right call vs. an open string with type-validation? See
   "Locked vocabulary" question below.

2. **`common.py` — the ID generators** (`slug`, `canonical_url`, `source_id_for`,
   `claim_id_for`). These are the idempotency contract. If the hash composition
   changes, every previously-generated ID is orphaned. Are the inputs to each
   hash the right ones? Specifically: `claim_id_for(entity_id, predicate, period, value)`
   — should `tags` or `source_ids` be in there too?

3. **`to_airtable.py` — the FIELDS dict** and the `_build_claim_payloads` function.
   The user's Airtable base was seeded by an AI template and has fields that don't
   match the greenfield schema in `airtable_schema.md`. The FIELDS dict is the
   single source of truth for that mapping. Is it readable / extensible enough?

## Known open questions to surface in review

### Architectural

- **`Claims` has no direct entity link in user's Airtable.** Encoded as
  `entity:<id>` in the `Tags` field as a workaround. Should we PATCH the schema
  via Meta API to add a real `Entity` linked field, or is the tag workaround OK?
- **Value vs Value Text split.** Number-only `Value` field forces ~60% skip rate.
  Adding `Value Text` (long text) lets us upload everything but pushes past Free
  plan limit. Is there a better design (single "Value" multi-type field via a
  Long Text + format hint)?
- **No reverse-sync.** Pipeline is one-way: xlsx → CSV → Airtable. Edits made in
  Airtable get overwritten on next `build.py`. Acceptable now (team = 1), but
  reviewer should call out if/when this becomes a blocker.

### Code quality

- **`extract_lifesci_style.py` is 200 lines of if/elif dispatch on `Event_Type`.**
  Should this be a registry/dict-of-handlers pattern? Each handler is small but
  there are 11 branches.
- **`_load_dotenv` in `to_airtable.py` is a hand-rolled 10-line dotenv parser.**
  Justification: zero deps. Reviewer: should we just pull in `python-dotenv`?
- **No tests.** The pipeline has zero unit tests right now. CSV → CSV is highly
  testable (deterministic, no I/O beyond filesystem). What's the minimum test
  surface that gives confidence?

### Scaling / operational

- **Scaling decision (Kate, 2026-05-17):** keep growing the CSV dataset to all
  8 xlsx files; upgrade to Airtable Team (~$20/user/mo, 50k-record cap) in ~1
  month. Until then, Airtable is a best-effort mirror — CSV is the canonical
  source.
- **`to_airtable.py` does NOT gracefully degrade at the 1000-record cap.** It
  will raise on the first POST that breaches the limit (`422 INVALID_RECORDS_LIMIT`)
  and abort the run. Reviewer: consider whether to add try/except + warning, or
  leave as-is (loud failure → forces upgrade decision faster).
- **`Europe_VS funds_ Incubations.xlsx` blew up on inspect** with `unsupported
  operand type(s) for +: 'NoneType' and 'int'`. Needs file-level investigation
  (likely a malformed cell) before its extractor can be written.
- **Six extractors not written yet.** Schema-similarity assessment:
  - Oncology_AI_enriched_v3 → reuse `extract_lifesci_style` (identical 37-col schema)
  - ai_scientist_signals + healthcare_pm → similar Row_Type schemas, possibly one shared extractor
  - ecosystem_events_db, AI_LifeSci_2026_Consolidated, Europe_VS funds → distinct, one extractor each
  Priority order is in memory file `project_zerotrust_status.md`.

## How to run

```powershell
# regenerate CSVs from xlsx
python -m scripts.zerotrust.build

# enforce invariants
python -m scripts.zerotrust.validate

# preview upload (no API calls)
python -m scripts.zerotrust.to_airtable --dry-run

# smoke test
python -m scripts.zerotrust.to_airtable --limit 5

# full upload (idempotent)
python -m scripts.zerotrust.to_airtable

# debug Airtable schema mismatch
python -m scripts.zerotrust.to_airtable --inspect
```

## Things deliberately NOT done

- **No `python-dotenv`, no `pyairtable`** — kept dependencies at zero. Both
  could be justified; reviewer may push back.
- **No frontend integration.** The existing `scripts/import-ai-life-sciences.py`
  still reads xlsx directly and writes `frontend/src/data/aiLifeSciences.ts`.
  Long-term we'd want the frontend importer to read the same CSVs the pipeline
  produces (single source of truth), but that's a separate change.
- **No CI hook.** `build.py` and `validate.py` could run on every PR that touches
  `scripts/zerotrust/`. Not wired up yet.
- **No Airtable Meta API schema bootstrap.** `to_airtable.py` assumes tables and
  fields already exist; user created them manually following `airtable_schema.md`
  (then it diverged because of an AI template, see FIELDS dict in `to_airtable.py`).

## Git state at session end

```
Untracked:
  scripts/zerotrust/                 (10 files, 0 staged)
  scripts/weak-sources-dump.txt      (legacy from prior session)
  .claude/worktrees/                 (this worktree)

Nothing committed this session.
```

Worktree branch: `claude/bold-wozniak-ff7e29`. Reviewer should decide what gets
committed where (likely: `scripts/zerotrust/*` → main, after review).
