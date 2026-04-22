# Health AI Atlas

Research-driven navigator for the UAE healthcare AI ecosystem. Paths for founders, job seekers, businesses, and clinicians; directory of players, claims, and domains (oncology, process mining, medical tourism, clinical AI).

## Monorepo layout

```
healthaiatlas/
├── frontend/     # Vite + React 18 SPA (mirror of civic-design-compass)
├── backend/      # TBD — not yet implemented
├── ansible/      # one-shot EC2 provisioning for nginx static hosting
├── scripts/      # sync-from-civic.sh and friends
└── .github/workflows/deploy.yml
```

## Working on the frontend

Frontend changes are made in the sister repo [`civic-design-compass`](../civic-design-compass) (Lovable-backed, designer-friendly) and pulled into this repo via:

```bash
./scripts/sync-from-civic.sh
git diff frontend/
git add frontend/
git commit -m "Sync frontend from civic-design-compass"
```

See [`frontend/README.md`](frontend/README.md) for local dev.

## Deploy

- Push to `main` → production (`/var/www/healthaiatlas/`)
- Push to `dev` → staging (`/var/www/healthaiatlas-dev/`)

CI builds `frontend/dist/` and rsyncs to the EC2 host. Nginx (configured via `ansible/playbook.yml`) serves the static files with SPA fallback.

First-time server setup:

```bash
export DEPLOY_HOST=... DEPLOY_USER=ubuntu DEPLOY_SSH_KEY_PATH=~/.ssh/deploy.key
ansible-playbook -i ansible/inventory.yml ansible/playbook.yml \
  -e prod_domain=<prod-domain> -e dev_domain=<dev-domain>
# Then, manually: sudo certbot --nginx -d <prod-domain> -d <dev-domain>
```

See [`ansible/README.md`](ansible/README.md) for details.

## Environment variables

Build-time (pass via CI secret or `frontend/.env.local`):

- `VITE_GA_ID` — Google Analytics measurement ID. Optional; GA is silently disabled if unset.

GitHub Actions secrets required:

- `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PORT`, `DEPLOY_SSH_KEY`
- `VITE_GA_ID`
