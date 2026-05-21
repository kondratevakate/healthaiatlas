# Airtable schema for the Zero-Trust dataset

Create one base, three tables. Field names below are exact — `to_airtable.py`
fails if any field is missing or renamed.

## Table: `Sources`

| Field          | Type                    | Notes                                  |
|----------------|-------------------------|----------------------------------------|
| `source_id`    | Single line text        | Primary field. External ID, e.g. `s_03db7c7b62` |
| `url`          | URL                     |                                         |
| `publisher`    | Single line text        |                                         |
| `title`        | Long text               |                                         |
| `published_at` | Single line text        | ISO date or year — keep as text, dates can be partial |
| `retrieved_at` | Single line text        | ISO date — required by validator        |
| `access`       | Single select           | options: `public`, `paywall`, `registration`, `archive` |
| `source_type`  | Single select           | options: `press_release`, `news`, `official_registry`, `policy`, `vendor_doc`, `preprint`, `peer_reviewed`, `filing`, `blog`, `social`, `other` |
| `excerpt`      | Long text               | Quoted text that anchors the claim     |

## Table: `Entities`

| Field          | Type                    | Notes                                  |
|----------------|-------------------------|----------------------------------------|
| `entity_id`    | Single line text        | Primary field. e.g. `insilico-medicine` |
| `name`         | Single line text        |                                         |
| `type`         | Single select           | options match `EntityType` in `schema.py`: `vendor`, `pharma`, `hospital`, `government`, `regulator`, `research_lab`, `academic_group`, `open_dataset`, `open_benchmark`, `open_source_tool`, `foundation_model`, `investor`, `conference`, `other` |
| `country`      | Single line text        |                                         |
| `city`         | Single line text        |                                         |
| `founded_year` | Number (integer)        |                                         |
| `website`      | URL                     |                                         |
| `domain_tags`  | Multiple select         | e.g. `ai_lifesci`, `oncology`, `ai_arch_revenue` |
| `aliases`      | Single line text        | Comma-separated alt names              |
| `notes`        | Long text               |                                         |

## Table: `Claims`

| Field            | Type                              | Notes                                            |
|------------------|-----------------------------------|--------------------------------------------------|
| `claim_id`       | Single line text                  | Primary field. e.g. `c_a1b2c3d4e5`               |
| `entity`         | **Linked record** → `Entities`    | Single link                                      |
| `predicate`      | Single select                     | options = keys of `PREDICATES` in `predicates.py` |
| `value`          | Single line text                  | Canonical string form                            |
| `value_unit`     | Single line text                  | `usd_m`, `year`, `count`, `…`                     |
| `period`         | Single line text                  | ISO date, year, or year-range                    |
| `jurisdiction`   | Single line text                  | `US`, `AE-Dubai`, `EU`, `Global`, `…`             |
| `confidence`     | Single select                     | options: `high`, `medium`, `low`                  |
| `sources`        | **Linked record** → `Sources`     | Allow multiple                                   |
| `domain_tags`    | Multiple select                   | which hub(s) this claim feeds                    |
| `tags`           | Multiple select                   | free-form                                        |
| `extracted_from` | Single line text                  | audit trail: `file#sheet!Rrow`                   |
| `extracted_at`   | Single line text                  | ISO date                                         |

## Recommended Airtable views

In `Claims`:
- **Weak evidence** — filter `confidence = low`
- **Money flows** — filter `predicate in (funding_amount_usd_m, ma_value_usd_m, valuation_usd_m, ipo_proceeds_usd_m)`; sort by `value` desc
- **Regulatory** — filter `predicate in (fda_clearance, regulatory_event)`
- **By domain** — group by `domain_tags`

In `Entities`:
- **Most-cited** — sort by count of `Claims` rollup
- **Orphans** — filter where `Claims count = 0` (these are entities in xlsx but
  no facts were extracted; usually a sign of a needs-review xlsx row)

In `Sources`:
- **Unused** — `Claims count = 0` (added by mistake or via merge collision)
- **By publisher** — group by `publisher`

## One-time PAT setup

1. https://airtable.com/create/tokens
2. Scopes: `data.records:read`, `data.records:write`, `schema.bases:read`
3. Access: pick the base you just created
4. Copy token, then:
   ```
   $env:AIRTABLE_TOKEN  = "pat..."
   $env:AIRTABLE_BASE_ID = "appXXXXXXXXXXXXXX"
   python -m scripts.zerotrust.to_airtable
   ```

`to_airtable.py` is idempotent — re-run after every `python -m scripts.zerotrust.build`
and it will only PATCH changed rows.
