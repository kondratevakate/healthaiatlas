# vision2030.ts — source backfill recommendations

Generated 2026-05-18 via Claude WebSearch (built-in, no API key required).
Each item below shows the suggested `src` URL to add to
`frontend/src/data/vision2030.ts`. Apply by adding `src: '<url>'` to each
record, then write `scripts/zerotrust/extract_vision2030.py` to flow the
file through the canonical pipeline.

Full candidates CSV (with alternates):
`C:/Projects/data/aiatls/zerotrust/backfill/vision2030_candidates_websearch_2026-05-18.csv`

---

## visionTargets

| id | suggested `src` |
|---|---|
| `ai-diagnostics` | `https://www.mediaoffice.abudhabi/en/technology/mohamed-bin-zayed-university-of-artificial-intelligence-driving-innovation-in-healthcare-in-abudhabi/` |
| `telemedicine` | `https://mohap.gov.ae/en/w/mohap-releases-2025-achievements-report-highlighting-its-role-as-one-of-the-fundamental-pillars-of-the-uae-s-healthcare-system-1` |
| `data-digitization` | `https://nabidh.dha.gov.ae/` |
| `ai-research` | `https://www.mediaoffice.abudhabi/en/education/mohamed-bin-zayed-university-of-artificial-intelligence-publishes-530-papers-in-2023/` |
| `healthtech-startups` | `https://www.hub71.com/program/hub71-plus-life-sciences` |
| `ai-workforce` | `https://www.mediaoffice.abudhabi/en/technology/mohamed-bin-zayed-university-of-artificial-intelligence-driving-innovation-in-healthcare-in-abudhabi/` |

## budgetAllocations

| year | suggested `src` |
|---|---|
| 2023 | `https://mohap.gov.ae/en/w/mohap-releases-2025-achievements-report-highlighting-its-role-as-one-of-the-fundamental-pillars-of-the-uae-s-healthcare-system-1` |
| 2024 | `https://www.g42.ai/resources/news/doh-and-g42-announce-genome-program` |
| 2025 | `https://www.thenationalnews.com/uae/2023/03/28/uae-president-launches-national-genome-strategy-to-prioritise-emirati-health-care/` |
| 2026 | *(projected — no primary source yet; mark `tier: 'inference'`)* |

## strategicPillars

| id | suggested `src` |
|---|---|
| `digital-first` | `https://nabidh.dha.gov.ae/` |
| `ai-integration` | `https://www.doh.gov.ae/en/news/DoH-Chairman-inaugurates-G42-Healthcares-Omics-Centre` |
| `genomics` | `https://www.g42.ai/resources/news/doh-and-g42-announce-genome-program` |
| `talent` | `https://mbzuai.ac.ae/` |

---

## Data updates implied by the sources

While searching for sources I also surfaced facts that update the
**`current`** baseline values in vision2030.ts:

- **`ai-research.current: '180'`** is stale. MBZUAI alone published
  530+ papers in 2023 per the Abu Dhabi Media Office. Suggest updating
  to `current: '530+'` (MBZUAI 2023 alone).
- **`data-digitization.current: '78%'`** is stale. NABIDH connects
  10.41 million records as of June 2025 (DHA reported). The percentage
  metric depends on the denominator definition — clarify in the next
  research pass.
- **`healthtech-startups.current: '85'`** can be cross-referenced with
  Hub71's cumulative cohort numbers (Cohort 17, Sep 2025: 26 startups,
  $223M raised, 80% AI-driven). Suggest updating after researching
  DIFC + Hub71 + Plug-and-play combined healthtech subset.

The actual percentage / count updates should be a separate human-review
pass — sources only confirm program existence, not the headline numbers.

---

## Next step after applying sources

Once each item has a `src` field:

```python
# Write the extractor and register in build.py
python -m scripts.zerotrust.extract_vision2030 --write
python -m scripts.zerotrust.validate
python -m scripts.zerotrust.to_airtable
```

vision2030 then becomes the **9th canonical domain** in Airtable
alongside the 7 already-uploaded ones (oncology, us_timeline, us_policy,
recent_signals, uae_market, eu_market, uk_market) plus the legacy two
(ai_lifesci, ai_arch_revenue).
