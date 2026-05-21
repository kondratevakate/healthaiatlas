# Open-calls source list

Seed list of canonical URLs the daily-digest routine fetches first.
Each entry: organization name + URL + what to extract.
Edit this file freely — the routine reads it on every run.

If you remove a source, the routine stops checking it. If you add one,
the routine starts checking it on the next run (no config change needed).

---

## Tier 1 — UAE

- **DHA Dubai — Innovation & Research** — https://www.dha.gov.ae/en/Innovation — calls for innovation partnerships, AI pilots, research grants
- **DoH Abu Dhabi — Programs** — https://www.doh.gov.ae/en/programs — Abu Dhabi health innovation programs and accelerators
- **MOHAP — Initiatives** — https://mohap.gov.ae/en/Initiatives — federal MOHAP innovation calls
- **Hub71 — Programs** — https://hub71.com/programs — cohort intake, HealthTech track when active
- **ADGM RegLab** — https://www.adgm.com/operating-in-adgm/financial-services-regulatory-authority/fintech-and-reglab — RegLab cohorts (digital health regulatory sandbox eligible)
- **MBZUAI — Funding & Fellowships** — https://mbzuai.ac.ae/research/funding-and-fellowships/ — research fellowships in AI, including biomedical AI
- **Khalifa University — Research Funding** — https://www.ku.ac.ae/research/research-funding — internal and partner-funded health AI calls
- **Mohamed bin Rashid Innovation Fund** — https://www.mbrif.ae/ — UAE innovation grants, health track when active
- **G42 / Inception Institute** — https://www.inceptioniai.org/news/ — partnership and research collaboration announcements

## Tier 2 — MENA

- **QRDI Qatar — Funding** — https://qrdi.org.qa/en-us/Funding-Opportunities — Qatar national research funding (Priority Funding Cycle covers health)
- **Saudi Vision 2030 — Health Sector Transformation** — https://www.vision2030.gov.sa/en/explore/programs/health-sector-transformation-program — track for funding announcements
- **Plug and Play KSA** — https://www.plugandplaytechcenter.com/saudi-arabia — KSA cohort intake
- **Flat6Labs — Cairo / Riyadh** — https://flat6labs.com/programs/ — accelerator cohorts in MENA
- **Wamda** — https://www.wamda.com/ — MENA tech news, often first to report new accelerator cohorts
- **MAGNiTT** — https://magnitt.com/news — MENA startup data, deal flow

## Tier 3 — Global research grants

- **EU CORDIS — Funding & Tenders** — https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-search;callCode=HORIZON-HLTH — Horizon Europe Health cluster, all open calls
- **EU EIC Accelerator** — https://eic.ec.europa.eu/eic-funding-opportunities/eic-accelerator_en — EIC Accelerator open cut-offs
- **NIH — Active Funding Opportunities** — https://grants.nih.gov/grants/guide/index.html — full RFA/PAR feed, filter for AI/ML keywords
- **NIH — BRAIN Initiative** — https://braininitiative.nih.gov/research/funding-opportunities — AI/imaging neuroscience funding
- **ARPA-H — Open Solicitations** — https://arpa-h.gov/explore-funding/programs — health moonshot solicitations
- **Wellcome Leap — Programs** — https://wellcomeleap.org/programs/ — global health moonshots with PI funding
- **Gates Foundation — Grand Challenges** — https://grandchallenges.org/challenges?status=open — global health open challenges
- **WHO — Innovation Hub** — https://www.who.int/teams/digital-health-and-innovation/innovation — WHO innovation calls
- **MIT Solve — Open Challenges** — https://solve.mit.edu/challenges — annual themed challenges, health tracks
- **Echoing Green — Fellowship** — https://www.echoinggreen.org/fellowship/ — social impact fellowship, health eligible

## Tier 4 — Accelerators with rolling intake

- **Techstars — Programs Directory** — https://www.techstars.com/accelerators — list of active accelerators incl. health verticals
- **Plug and Play Health** — https://www.plugandplaytechcenter.com/health — quarterly health batches
- **Y Combinator — Apply** — https://www.ycombinator.com/apply — winter/summer batches
- **Antler — Programs** — https://www.antler.co/locations — global cohort intake
- **MassChallenge HealthTech** — https://masschallenge.org/programs-healthtech — annual program

## Tier 5 — Conference CFPs

- **MICCAI — Calls** — https://www.miccai.org/events/ — annual medical imaging + AI conference
- **HIMSS — Submit a Proposal** — https://www.himss.org/global-conference/call-for-proposals — global health IT conference
- **RSNA — Annual Meeting Abstract Submission** — https://www.rsna.org/annual-meeting/abstracts-and-sessions — radiology + AI
- **ML4H Symposium** — https://ml4health.github.io/ — ML for health workshop, annual CFP
- **NeurIPS Workshops** — https://neurips.cc/Conferences/2026/CallForWorkshops — health workshop submissions

---

## Aggregators (use with WebSearch, not WebFetch)

These index thousands of programs — search them, do not crawl them:

- f6s.com — startup programs and grants index
- grants.gov — US federal grants (filter by health AI keywords)
- eu-startups.com/category/funding/ — EU funding news

## Search query patterns

When supplementing the seed list with WebSearch, prefer these patterns:

- `"call for proposals" "AI" "health" 2026 deadline`
- `"applications open" "health AI" 2026`
- `"RFA" OR "RFP" AI medical imaging 2026`
- `Hub71 OR Flat6Labs OR Antler new cohort 2026 health`
- `"ARPA-H" OR "NIH" solicitation 2026 artificial intelligence`

Avoid: generic "AI health grants 2026" (returns marketing pages, not actual calls).

## Confidence flags for new entries

When a candidate is added to SOURCES.md, mark its confidence:
- No marker = verified canonical source
- `(probational)` = added recently, watch for whether it produces real calls
- `(low-yield)` = kept on list but rarely produces useful results; candidate for removal
