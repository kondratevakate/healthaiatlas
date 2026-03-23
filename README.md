# Health AI Atlas

Curated maps and analysis of AI in healthcare — oncology, patient management, and medical tourism.

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

## Deploy

EC2 + PM2 + Cloudflare

```bash
npm run build
pm2 start npm --name "healthaiatlas" -- start
```

## Pages

- `/` — Landing page
- `/oncology` — Oncology AI Landscape
- `/healthcare-pm` — Healthcare PM & Automation
- `/funnel` — Patient Funnel Diagnostic
- `/contact` — Contact form
