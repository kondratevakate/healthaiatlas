# HealthAI Atlas — Roadmap

Owner: Kate. Maintained by agents (Claude on the workstation, Hermes / Una on the server).
Last updated: 2026-11-03.

This file is the single plan for the site. Every agent working on this repo or on the
Atlas data reads it before starting and updates it when an item changes state. The public
version (Now / Next / Later, timeline, freshness) will be rendered on `/about` from
`frontend/src/data/roadmap.ts` — see Now #3.

## Rules for agents

- **Now holds at most 3 items.** Adding one means moving another to Next.
- Every item names an owner and what "done" looks like.
- Dates in the timeline come from `git log` or a primary source, never from memory.
- When you finish an item: move it to "Done", add the date and the PR link.
- Do not add items Kate did not ask for. Put proposals under "Proposed" and let her decide.

## Timeline (from git)

| Date | Milestone |
|---|---|
| 2026-03-23 | Project start (Next.js). Oncology and Healthcare Process Mining maps, funnel diagnostic; Medical Tourism the same day |
| 2026-04-22 | Move to the Vite monorepo: Directory with the Oncology, Process Mining, Medical Tourism hubs; Events (`/discovery`); Context |
| 2026-05-03 | Lovable sync retired; `frontend/` becomes the source of truth |
| 2026-05-04 | AI Life Sciences hub |
| 2026-05-20 | Founder Toolkit, 5-item navigation, ⌘K search |
| 2026-05-26 | Jobs |
| 2026-05-27 | Open Calls |
| 2026-09-14 | Biosecurity hub |
| 2026-10 | Airtable closed; canonical store moves to `db/atlas.sqlite` on the server |

## Now

| # | Item | Owner | Done when |
|---|---|---|---|
| 2 | **Stale surfaces.** Events shows past events (18 May, 10 Jun 2026) under "Upcoming"; Home "Recent launches" are all from Feb 2026 and promise "Tweets and market signals coming next"; About promises data exports and an API that do not exist | Claude | Past events filtered out; Home shows only data newer than 90 days (or "Open calls closing soon" instead); About lists only what exists, the rest moves to Later |
| 3 | **Roadmap and freshness on `/about`.** Render this plan from `frontend/src/data/roadmap.ts`: timeline, Now / Next / Later, and a freshness table computed from `LAST_UPDATED` (stale after 90 days) | Claude | `/about` shows the three blocks; no hand-maintained dates outside `roadmap.ts` and `constants.ts` |

## Next

| # | Item | Owner | Done when |
|---|---|---|---|
| 4 | **Daily scout → database → site.** Una's daily finds (`~/una/db/career.db` `scout_inbox`), the open-calls routine (`routines/open-calls/inbox/`, 24 digests in October 2026) and the workstation night scout land in `db/atlas.sqlite` as `status=candidate`, keyed by a hash of the normalised URL so the three scouts never duplicate. A check (URL live, deadline read on the issuer's page) promotes a row to `verified`. `openCallEntries.ts` is generated from verified rows, never hand-edited | Hermes / Una (DB side), Claude (generator + site) | Open Calls on the site is newer than 7 days without manual edits |
| 5 | **Public / private split in the database.** `atlas.sqlite` also holds Kate's contacts (`domain_tags` `career,contacts`, `career,contacts,nobel_map`) and her career domains D1-D12. Every generator that writes public TS selects by an allow-list of domain tags; `snippet`, Una's domain tags and status never reach the site | Claude | A test fails if a contact entity or a D-tag appears in generated TS |
| 6 | **Bring Una's three local commits into the repo.** `C:\Projects\03_products\healthaiatlas` has commits that exist nowhere else: career→atlas mapper (`scripts/zerotrust/una_to_atlas.py`), tracker deadlines + nobel orbit, "collapse laureates onto their contact entity" | Claude, with Kate's yes | Commits on a branch on GitHub; the second clone can be removed |
| 7 | **Per-domain decision.** Oncology, Process Mining and Medical Tourism have not changed since April 2026. For each: refresh, freeze with a visible "snapshot, April 2026" label, or archive | Kate decides, Claude applies | Every hub shows either a date under 90 days or a snapshot label |
| 8 | **Jobs: refresh monthly or close.** Data from 2026-05-26 | Kate decides | Either a dated monthly refresh or the page removed from navigation |

## Later

- Structured data exports and an API for institutional users (removed from the About copy until they exist).
- Legal entity to receive donations (Kate is looking for a co-founder).
- People radar: artifacts-not-profiles harvest (parked design, 2026-10-31).
- Contribution model: decide whether the repo goes public (the "Open a PR" CTA on About points at a private repo today).

## Proposed (waiting for Kate)

- New domains to add next: not decided.
- Pre-existing test failure on `main`: `routes.test.tsx` flags `` `/${persona}` `` in `components/home/PersonaCard.tsx`.

## Done

| Date | Item |
|---|---|
| 2026-11-03 | Repair pre-existing CI failures exposed by Dependabot: remove conflicting landing-row display classes; replace the retired `/patient` route in the grid check with Events, News and Data, and assert the header is visible before measuring. [PR #80](https://github.com/kondratevakate/healthaiatlas/pull/80) |
| 2026-11-01 | Dead Airtable links (was Now #1): every "Suggest entry / correction / Get in touch" CTA and provenance link now points at LinkedIn or is removed; `airtable-links.test.ts` blocks new ones. [PR #75](https://github.com/kondratevakate/healthaiatlas/pull/75), deployed to production and checked on the live bundle |
| 2026-09-27 | Support section: Manifund dropped, co-founder invitation added |
| 2026-09-27 | Freshness notice with update / join / support CTAs on Jobs and Open Calls |
