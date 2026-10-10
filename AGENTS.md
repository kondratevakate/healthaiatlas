# Agent rules for healthaiatlas

## Repo layout

Monorepo with two top-level packages:

- `frontend/` — Vite + React 18 + Tailwind v3 + shadcn/ui SPA. **Source of truth** for the public site. Edit this directory directly and ship through the normal git flow.
- `backend/` — placeholder for server-side stack (TBD: Node/Express or FastAPI). Not yet implemented.

Server provisioning lives in `ansible/`. Deployment workflow is `.github/workflows/deploy.yml`.

## Stack facts for agents

- **Not Next.js.** The frontend is a plain Vite SPA — no App Router, no server components, no `'use client'` pragma, no `next/*` imports. Routing is `react-router-dom` v6 (`BrowserRouter` in `frontend/src/App.tsx`).
- **Tailwind v3** with `tailwindcss-animate`. Config in `frontend/tailwind.config.ts`. Do not use Tailwind v4 syntax (`@theme`, arbitrary `--` variables as classes, etc.).
- **React 18**, not 19. No `use()` hook, no server-client transitions.
- **Static build.** `npm run build` emits `frontend/dist/` — served by nginx on EC2. SPA fallback is handled at the nginx layer, not in the app.
- **Content is static.** All directory/player/claim data lives in `frontend/src/data/*.ts`. No database or API yet.

## Adding a new domain hub

The Directory page dispatches to a per-domain hub component (`OncologyHub`, `ProcessMiningHub`, `MedicalTourismHub`, `AiLifeSciencesHub`). To add a new one:

1. Create `frontend/src/data/<domain>.ts` with the hub's data (mirror the shape of `frontend/src/data/aiLifeSciences.ts` — typed bubbles + decision-point taxonomy + reliability flags).
2. Append an entry to `frontend/src/data/domains.ts` (`{ id, name: { en, ar }, subtitle, color, playerIds }`).
3. Add the id to `HUB_DOMAIN_IDS` and `LAST_UPDATED` in `frontend/src/data/constants.ts`.
4. Create `frontend/src/components/<domain>/` with a `Hub` component wrapping `<HubShell>` plus the views it composes. Re-export via an `index.ts`.
5. Add a dispatch line in `frontend/src/pages/Directory.tsx` next to the existing `activeDomainId === '...' && <Hub />` checks.

The Header dropdown auto-iterates `domains.ts`, so no nav code is needed.

**Compliance rule:** every entry that asserts a fact (a milestone, a funding round, a regulatory event) must include a `src` URL pointing at primary evidence. Mark un-evidenced entries `e: 'inference'` with `src` empty, or omit them.

## Discovery Copilot feature flag

The Discovery page (`frontend/src/pages/Discovery.tsx`) renders an LLM chat sidebar (`EventInsights`) gated by `VITE_DISCOVERY_COPILOT=on`. Default is off. The component, its multi-fallback LLM chain (`frontend/src/data/aiInsightsPrompt.ts`), and the auth scaffolding (`AuthProvider`, `SignInModal`) stay in the codebase — flip the env var when the upstream endpoints and rate-limits are confirmed stable.

## DEPRECATED: civic-design-compass sync

Until 2026-05-03, `frontend/` was a controlled mirror of the `civic-design-compass` Lovable project, kept in sync by `scripts/sync-from-civic.sh` (rsync with `--delete`). That workflow has been retired:

- The sync script now exits non-zero with a deprecation notice. Do not revive it without coordinating — running it as written would wipe `frontend/`.
- Lovable / civic-design-compass is no longer the upstream. All edits land directly in `frontend/`.

## Git attribution

- PR descriptions: no "🤖 Generated with Claude Code" footer and no claude.ai session link.
- Commits: no `Claude-Session` trailer. Keep the `Co-Authored-By` trailer so git history shows which commits were made with AI.
- Same as the Claude Code `attribution` setting `{ "pr": "", "sessionUrl": false }`; `.claude/settings.json` is gitignored here, so the rule lives in this file.

## Deploy

Push to `dev` → staging (`/var/www/healthaiatlas-dev/`). Push to `main` → production (`/var/www/healthaiatlas/`). Both served by nginx — no systemd unit for the app itself. See `ansible/README.md` for one-shot server bootstrap.

---

## ⛔ Hard rules — production incidents log

These rules exist because the agent violated them and it caused real damage.
**Not guidelines. Not suggestions. Do not proceed past any of these without explicit user override.**

---

### 1. Never fabricate source URLs

**What happened:** agent constructed TechCrunch URLs by pattern (`/YYYY-MM-DD/openai-acquires-X`)
instead of extracting real URLs from the source file. Every link was a 404.

**Rule:** If a source URL is not present in the input data, set `src: ''`.
Never construct, guess, or pattern-match a URL. Empty string is honest. 404 is not.

Before writing any `src:` field: ask yourself "did I read this URL from the actual file?"
If the answer is anything other than yes — leave it empty.

---

### 2. Never override brand typography with raw Tailwind size classes

**What happened:** agent wrote `<h1 className="text-2xl md:text-3xl font-bold">` instead of
`<h1 className="heading-editorial">`. Result: heading rendered in system sans-serif instead of
Lora serif. Brand broken silently — no error, just wrong font.

**Rule:** Heading elements (`h1`, `h2`, `h3`) must use a utility from `frontend/src/index.css`:
- `heading-display` / `heading-display-xl` — hero titles
- `heading-serif` / `heading-serif-sm` — section headings
- `heading-editorial` — Founder Toolkit / editorial context (serif, bold)
- `heading-xl` / `heading-lg` / `heading-md` — UI headings

A CI test (`design-system.test.ts › heading elements use heading utilities`) enforces this.
If the test fails on your code, fix the heading class — do not add to the allowlist unless
you have a written reason.

---

### 3. New data with `src` / `confidence` fields goes through Zero Trust, not directly to TypeScript

**What happened:** agent wrote `acquihireSignal.ts` with hardcoded data directly,
bypassing the verification pipeline. Data with fabricated URLs reached production.

**Rule:** Any new dataset that has source URLs, confidence levels, or factual claims
must go through the Zero Trust pipeline:
```
raw data (xlsx/csv)
  → scripts/zerotrust/<extract_X>.py  (parse + validate)
  → scripts/zerotrust/zerotrust/       (CSV: entities / claims / sources)
  → Airtable (canonical store, human-verifiable)
  → scripts/zerotrust/from_airtable.py
  → frontend/src/data/<X>.ts           (generated, never hand-edited)
```

Exception: purely editorial/structural data (e.g. UI copy, navigation labels) may go
directly to TypeScript. Data that asserts facts about the world may not.

---

### 4. Dropdown menus must anchor to the full trigger label, not just the chevron icon

**What happened:** agent built `DropdownMenu` with a separate `Link` for the label
and a separate `DropdownMenuTrigger` for the chevron icon only. The dropdown opened
anchored to the chevron, not the label — visually misaligned.

**Rule:** The `DropdownMenuTrigger` must wrap the entire clickable unit (label + chevron).
Use `asChild` on a `<button>` that contains both. `align="start"` then anchors to the
left edge of the full button, not to a small icon.

Header section entries (Domains, Founder Toolkit) use `NavDropdown`
(`frontend/src/components/layout/NavDropdown.tsx`): the trigger is a `<Link>`
wrapping label + chevron. Click / Enter opens the section's overview page; hover or
Space / ArrowDown opens the menu. Do not add an "Overview" item to these menus;
the label is the way to the overview (owner's call, Oct 2026).

---

### 5. Data pages show data — not introductions to data

**What happened:** agent added warning boxes, intro paragraphs, dual headings, and
ComparativeMatrix (already on another page) to a page that should just show a chart.
The Markets page went from "show the chart" to 9,400 characters of noise.

**Rule:** Before adding any non-data element to a data page, ask:
"If I remove this, does the data become less understandable?"
If yes — keep it. If no — remove it.

Warning boxes, "coming soon" banners, repeated intro paragraphs, and duplicated
components from other pages are noise until proven otherwise.

---

### 6. Clarify what data means before building the data structure

**What happened:** agent assumed "AQVI hire signal" = job postings.
User meant acqui-hire deals. Agent built the wrong data model.

**Rule:** When a new data entity is introduced by name, read the actual source file
before writing any code. If no source file exists yet, ask:
"What does one row of this data look like?"
Do not assume the schema from the name alone.

---

### 7. Do not duplicate content across pages

**What happened:** agent added `ComparativeMatrix` to Markets page.
`ComparativeMatrix` already existed on the Context page. Same component, two places,
both outdated at different times.

**Rule:** Before adding a component to a page, grep for where it already renders:
```bash
grep -r "ComponentName" frontend/src/pages/
```
If it renders elsewhere, link to that page — don't embed a second copy.

---

### Summary — check before every data file commit

- [ ] Every `src:` field contains a URL I actually read from the source file
- [ ] Every heading element uses a `heading-*` utility class
- [ ] Data with factual claims is going through Zero Trust, not raw TypeScript
- [ ] No content duplicated from another page
- [ ] Dropdown triggers wrap the full label, not just an icon
- [ ] The page shows data, not introductions to data
