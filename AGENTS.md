# Agent rules for healthaiatlas

## Repo layout

Monorepo with two top-level packages:

- `frontend/` — Vite + React 18 + Tailwind v3 + shadcn/ui SPA. **Mirror of [`civic-design-compass`](../civic-design-compass)** (Lovable source of truth). Editing files here directly is discouraged — the next `scripts/sync-from-civic.sh` will overwrite them. Backport UI changes to civic-design-compass first.
- `backend/` — placeholder for server-side stack (TBD: Node/Express or FastAPI). Not yet implemented.

Server provisioning lives in `ansible/`. Deployment workflow is `.github/workflows/deploy.yml`.

## Stack facts for agents

- **Not Next.js.** The frontend is a plain Vite SPA — no App Router, no server components, no `'use client'` pragma, no `next/*` imports. Routing is `react-router-dom` v6 (`BrowserRouter` in `frontend/src/App.tsx`).
- **Tailwind v3** with `tailwindcss-animate`. Config in `frontend/tailwind.config.ts`. Do not use Tailwind v4 syntax (`@theme`, arbitrary `--` variables as classes, etc.).
- **React 18**, not 19. No `use()` hook, no server-client transitions.
- **Static build.** `npm run build` emits `frontend/dist/` — served by nginx on EC2. SPA fallback is handled at the nginx layer, not in the app.
- **Content is static.** All directory/player/claim data lives in `frontend/src/data/*.ts`. No database or API yet.

## When syncing from civic-design-compass

Only `package.json#name` is healthaiatlas-specific; `scripts/sync-from-civic.sh` restores it after rsync. Everything else in `frontend/` should match civic-design-compass byte-for-byte.

## Deploy

Push to `dev` → staging (`/var/www/healthaiatlas-dev/`). Push to `main` → production (`/var/www/healthaiatlas/`). Both served by nginx — no systemd unit for the app itself. See `ansible/README.md` for one-shot server bootstrap.
