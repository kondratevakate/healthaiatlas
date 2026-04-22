# healthaiatlas — frontend

Vite + React 18 + Tailwind v3 + shadcn/ui SPA.

## Source of truth

This directory is a **mirror** of the [`civic-design-compass`](../../civic-design-compass) repo, which is the Lovable-driven source of truth for frontend changes.

**Do not edit files here directly unless you also backport the change to civic-design-compass** — the next sync will overwrite local edits. Use `../scripts/sync-from-civic.sh` to pull the latest from civic-design-compass.

Exception: `package.json` `name` field is healthaiatlas-specific and the sync script restores it after rsync.

## Local development

```bash
npm ci
npm run dev          # http://localhost:8080
npm run build        # dist/
npm run preview      # http://localhost:4173 (serves built dist/)
npm run lint
npm run test
```

## Environment variables

Runtime expects `VITE_GA_ID` to be set at build time for Google Analytics to load. Locally, create `frontend/.env.local`:

```
VITE_GA_ID=G-E05C741HZQ
```

`.env.local` is gitignored. In CI, pass it as a GitHub secret to the build step.

## Deployment

Push to `main` → production (`/var/www/healthaiatlas/` on EC2). Push to `dev` → staging. Both served by nginx as static. See `../ansible/` and `../.github/workflows/deploy.yml`.
