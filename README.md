# Health AI Atlas

Curated maps and analysis of AI in healthcare — oncology, process mining, and medical tourism.

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS v4
- TypeScript

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Routes

- `/` — Landing page
- `/oncology` — Oncology
- `/process-mining` — Process Mining
- `/medical-tourism` — Medical Tourism
- `/contact` — Contact

Legacy routes kept as redirects:

- `/ai-automation` → `/process-mining`
- `/healthcare-pm` → `/process-mining`
- `/funnel` → `/medical-tourism`

## Embedded Maps

The oncology and process-mining sections are currently static HTML artifacts embedded by thin page shells:

- `public/maps/oncology.html`
- `public/maps/process-mining.html`

Those assets are rendered through:

- `src/app/oncology/page.tsx`
- `src/app/process-mining/page.tsx`

`/medical-tourism` remains a React page and is intentionally outside the embedded-map migration boundary for now.

## Environment

The only documented runtime environment variable at the moment is:

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

If `NEXT_PUBLIC_GA_ID` is unset, Google Analytics stays disabled.

## Deploy

Deployment is handled by GitHub Actions in `.github/workflows/deploy.yml`.

- Pushes to `main` deploy to `/home/ubuntu/healthaiatlas`
- Pushes to `dev` deploy to `/home/ubuntu/healthaiatlas-dev`
- The workflow runs `npm ci`, `npm run build`, and restarts the matching `systemd` service over SSH

The old PM2-based flow is no longer the source of truth for deployment.
