# Voice & Tone — HealthAI Atlas

The voice we use on this site, in marketing copy, and in any external communication. Derived from the existing tone in `frontend/src/data/*.ts` and the project's stated purpose: a verifiable directory of who is actually building healthcare AI, region by region.

## Stance

We document what's deployed and who's accountable. Not what's announced, not what's pitched.

The directory exists because the healthcare AI space is dense with PR claims and thin on independently-verifiable infrastructure. Every entry on this site is either backed by a primary source URL or labelled as inference. That epistemic stance shapes how we write.

## Rules

1. **Every factual claim has a source.** In data files this means a `src` URL pointing at primary evidence. In long-form copy this means an inline link or citation. No source → label `e: 'inference'` or omit the claim entirely.

2. **Verbs of action over verbs of intent.**
   - Yes: "deployed", "connects", "publishes spec", "operates", "mandates"
   - No: "aims to", "is positioned to", "will be exploring", "envisions"

3. **No marketing intensifiers.** Strike these on sight:
   - "leading", "innovative", "cutting-edge", "world-class", "best-in-class"
   - "comprehensive", "holistic", "transformative", "revolutionary"
   - "AI-powered" (assume AI; describe what it does)
   - "solutions", "initiatives" (name the actual product or program)

4. **Numbers beat adjectives.** "500K genomes processed" beats "large-scale program". "Connects 14 hospitals" beats "extensive network". If you don't have the number, the claim probably isn't earned.

5. **Identify actors by their function, not by their PR.**
   - Yes: "DHA's health information exchange platform"
   - No: "DHA's flagship transformation initiative"

6. **Bilingual EN/AR are first-class.** Both versions are written, not translated. Phrasing can differ to fit the language's idiom. Don't run the English through Google Translate — write it.

7. **Short sentences.** 1–2 sentences per `description`. If you need a third, you're explaining instead of describing.

8. **No three-element parallel lists when two would do.**
   - Trim: "founders, businesses, students and researchers, and job seekers"
   - To: "founders and researchers" (or whichever two you actually serve)

## Voice characteristics

| Dimension | Where we sit |
|---|---|
| Register | Technical, not marketing. Audience: founders, researchers, regulators, journalists. |
| Tone | Epistemically careful. We label confidence. We cite. We say "not yet evidenced" when we don't know. |
| Authority | Earned, not claimed. We don't tell you we're authoritative — we show the source URL. |
| Tense | Present and present-perfect ("has deployed", "connects") — past for historical milestones. Future tense is suspect; if used, it must be a regulator's published commitment, not aspiration. |
| Person | Third-person for entries. First-person plural ("we") only in editorial / About / Privacy. |

## Glossary — preferred terms

| Use | Don't use |
|---|---|
| Health information exchange (HIE) | "Unified digital health platform" |
| Deployed | Live, in-market, operating |
| Mandate / regulatory requirement | "Strategic imperative", "vision pillar" |
| Connects to / integrates with | "Seamlessly integrates with" |
| Primary evidence | "Sources" (too vague) |
| Inference | "Estimate" (lower confidence than we want) |
| Founder / researcher / clinician | "Stakeholder", "ecosystem participant" |

## Examples — before / after

### Player description

**Before:** "AI-powered healthcare company developing precision medicine solutions, genomics, and population health initiatives."

**After:** "Builds precision-medicine and genomics infrastructure for the UAE health system. Runs the country's main population-scale sequencing program."

### Tagline

**Before:** "Research-driven navigator for the global healthcare AI ecosystem. A directory, system map, talent hub, and open-calls feed for founders, businesses, students and researchers, and job seekers."

**After:** "Who's building healthcare AI globally — and what's actually deployed. With evidence links, not marketing claims."

### Hub subtitle

**Before:** "A comprehensive overview of leading oncology AI initiatives across the region."

**After:** "Oncology AI in the UAE — which tools are in clinical use, where, and under whose protocol."

## Where this guide applies

- All `description.en` / `description.ar` in `frontend/src/data/*.ts`
- `frontend/index.html` meta tags
- All marketing copy (LinkedIn posts, conference materials, pitch decks)
- Newsletter, when launched
- README and public-facing docs

## What this guide does not cover

- Internal docs (runbooks, ADRs) — those can be more conversational
- Code comments — see CLAUDE.md
- Legal pages (Privacy, Terms) — those have their own register

## Maintenance

Update this file when a recurring stylistic decision shows up in review more than twice. Don't add rules pre-emptively.

---

**Last updated:** 2026-05-16
