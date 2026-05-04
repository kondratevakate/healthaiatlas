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

## Deploy

Push to `dev` → staging (`/var/www/healthaiatlas-dev/`). Push to `main` → production (`/var/www/healthaiatlas/`). Both served by nginx — no systemd unit for the app itself. See `ansible/README.md` for one-shot server bootstrap.
