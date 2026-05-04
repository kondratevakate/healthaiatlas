# healthaiatlas — frontend

Vite + React 18 + Tailwind v3 + shadcn/ui SPA. Source of truth for the Health AI Atlas public site.

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
