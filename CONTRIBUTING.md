# Contributing to HealthAI Atlas

Thank you for considering a contribution. HealthAI Atlas exists to make healthcare AI ecosystem intelligence open, structured, and accurate. The public layer of this project is built on community trust, and that trust depends on every contribution being verifiable.

> **The knowledge stays open; the tooling for professional use sustains the work.**

This document explains how to contribute to the public layer (open data) and what we cannot accept (paid-tier features).

## What we accept

| Type of contribution | Where |
|---|---|
| New organizations / players | `frontend/src/data/players.ts` |
| New claims (evidence-backed assertions about players) | `frontend/src/data/claims.ts` |
| New domains (taxonomy of AI applications) | `frontend/src/data/domains.ts` |
| New conferences, mentors, resources, tools, launches | `frontend/src/data/{conferences,mentors,resources,tools,launches}.ts` |
| Methodology refinements | GitHub issue → discussion → PR if accepted |
| Bug fixes (UI, build, deployment) | `frontend/`, `ansible/`, `scripts/` |
| Translations (Arabic first; later French, Spanish) | `frontend/src/locales/` (when i18n ships) |

## What we do not accept

- **Contributions to the paid tier.** The paid tier is a closed-source professional service. The public layer is open; the paid layer is not.
- **Marketing copy disguised as factual claims.** See "Banned content" below.
- **Unverified rumor.** Every claim must cite an evidence URL.
- **Scraped content from sources that prohibit redistribution** (LinkedIn, Crunchbase, PitchBook). Use them as cross-references, not as source of imported data.

## Required schema for data contributions

Every data PR **must** include:

1. **Evidence URL per claim.** A publicly accessible source backing the assertion. Examples: company press release, regulatory filing, news article from a reputable outlet, conference attendee list, official health authority announcement.
2. **Confidence level**, one of:
   - `high` — primary source (company itself, regulatory filing, official health-authority record)
   - `medium` — reputable secondary source (Reuters, Bloomberg, well-known industry publication)
   - `low` — single-source rumor, anonymous tip, or contested public claim. **Low-confidence claims must be marked clearly and may be removed if not corroborated within 90 days.**
3. **Source-type tag**: `primary`, `regulatory`, `press`, `industry-report`, `interview`, `public-statement`, `social-media`, `other`.
4. **Date of the source** — when the cited source was published.
5. **Geographic region tag** if applicable: `UAE`, `US`, `EU`, `MENA-other`, `global`.

Example minimal claim entry:

```ts
{
  id: "example-deployment-2026",
  playerId: "example-clinic-ae",
  type: "deployment",
  text: "Deployed AI radiology triage in Q1 2026 across 3 facilities",
  evidence: [
    {
      url: "https://example.com/press-release-2026-01-15",
      sourceType: "primary",
      sourceDate: "2026-01-15",
      confidence: "high",
    }
  ],
  region: "UAE",
}
```

## Banned content

| Pattern | Why we reject it |
|---|---|
| "World-leading", "best-in-class", "revolutionary" | Marketing copy, not factual claim. Replace with measurable specifics or remove. |
| Quotes from anonymous sources without corroboration | Unverifiable. Single-source low-confidence claims need at least one corroborating source within 90 days or are removed. |
| Patient names, patient counts identifiable to facility | Compliance risk (HIPAA / PDPL / GDPR). HealthAI Atlas does not store patient-level data. |
| Personal contact info (email, phone, personal social) on public layer | Privacy. Personal contact info is paid-tier only and subject to PDPL / GDPR. |
| Bulk-imported data from LinkedIn / Crunchbase / PitchBook | Terms of service of those platforms prohibit redistribution. Use as cross-reference only. |

## Submission process

1. **Open an issue first** for any non-trivial change. Describe the addition / correction and link the evidence. We will confirm whether the contribution fits scope before you invest in a PR.
2. **Fork the repo** and create a feature branch (`feat/add-player-X` or `fix/correct-claim-Y`).
3. **Make the change** following the schema above.
4. **Run `npm run test --prefix frontend`** to verify nothing is broken.
5. **Open a PR** linking the issue.
6. **PR will be reviewed by the [Chief Community Officer agent](.claude/agents/chief-community-officer.md) for triage** — evidence URLs verified, schema compliance checked, region/confidence tags validated. Then a maintainer reviews substance.

PRs without evidence URLs or with banned content patterns will be closed with feedback explaining why.

## Code-of-Conduct

All contributors are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md). Harassment, discrimination, or repeated bad-faith submissions result in account ban from this repo.

## Reporting errors in public data

If you spot a factual error in the public layer:

1. Open a GitHub issue with the URL where the error appears, the corrected information, and an evidence URL.
2. Tag the issue `error-correction`.
3. We will review and correct within 14 days; corrections are noted in a public changelog.

For more sensitive corrections (e.g., information about you personally that you want removed), email the contact listed in [`SECURITY.md`](SECURITY.md) — we treat removal requests as priority.

## License

By contributing to this repo, you agree:

- Source-code contributions are licensed under **AGPL-3.0**.
- Data and content contributions (rows in `frontend/src/data/`, methodology docs, etc.) are licensed under **CC BY-NC 4.0**.

See [`LICENSE`](LICENSE) for the full dual-licensing terms. By contributing data, you also confirm the data is from a publicly accessible source and you have not violated the source's terms of service in obtaining it.

## Thank you

Every verified contribution makes HealthAI Atlas more useful for clinicians, students, researchers, and founders globally. We genuinely appreciate the time you take to do this carefully.
