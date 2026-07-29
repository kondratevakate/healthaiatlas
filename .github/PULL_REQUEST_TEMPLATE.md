<!-- Thanks for contributing to the open layer. Keep PRs focused — one topic per PR. -->

## What this changes

<!-- One or two sentences. Link the issue this resolves, e.g. "Closes #123". -->

## Type

- [ ] Data (new / corrected record)
- [ ] Bug fix (UI, build, deployment)
- [ ] Docs / methodology
- [ ] Other

## Data checklist (delete if not a data PR)

- [ ] Every new/changed `src` is either empty (`''`) or a real `https://` URL I opened myself — never guessed or pattern-matched (AGENTS.md rule #1).
- [ ] Confidence, source-type, source-date, and region tags are set per the schema in `CONTRIBUTING.md`.
- [ ] No banned content (marketing language, patient-level data, personal contact info, bulk LinkedIn/Crunchbase/PitchBook imports).
- [ ] Fact-asserting data went through the Zero Trust pipeline where applicable, not hand-edited into a generated file (AGENTS.md rule #3).

## Verification

- [ ] `npm run test --prefix frontend` passes locally (or I understand CI will run it).
- [ ] Headings use a `heading-*` utility, not raw Tailwind size classes (AGENTS.md rule #2).
