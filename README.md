# HealthAI Atlas

> **Open, structured knowledge about the healthcare AI ecosystem. UAE coverage live; more regions coming soon.**

HealthAI Atlas is an independent research and educational project mapping the healthcare AI ecosystem. The public layer is open knowledge for clinicians, students, researchers, and founders. The professional tier provides decision-ready data for institutional users (investment firms, healthcare organizations, consultancies, government bodies).

> The knowledge stays open; the tooling for professional use sustains the work.

**Status: alpha.** Public site not yet deployed. Repo currently private. See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the public roadmap.

## What's here

| Path | What it is |
|---|---|
| [`frontend/`](frontend/) | Vite + React 18 SPA — public site prototype |
| [`backend/`](backend/) | TBD — paid-tier API will live here |
| [`docs/strategy/`](docs/strategy/) | Strategic context: positioning, business model, customer segments, IP and legal |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Public 90-day execution plan + 24-month horizon |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | How to contribute organizations, claims, and domains |
| [`SECURITY.md`](SECURITY.md) | Vulnerability disclosure policy |
| [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) | Contributor Covenant 2.1 |
| [`LICENSE`](LICENSE) | TBD — license choice pending |
| [`ansible/`](ansible/) | One-shot EC2 provisioning for nginx static hosting |
| [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) | CI/CD: build and rsync to EC2 |
| [`.claude/agents/`](.claude/agents/) | Three project sub-agents: Chief Community Officer, CMO, Lead Researcher |

## Persona paths on the public site

- **Founders** — navigate the ecosystem, find collaborators and benchmarks
- **Job seekers** — see who is hiring in healthcare AI in the regions we cover
- **Businesses** — evaluate vendors and partnership candidates
- **Clinicians** — understand AI tools in deployment and how to evaluate them critically

## Public layer and Professional tier

HealthAI Atlas operates with two layers. The public layer is freely accessible open knowledge — directory, ecosystem map, methodology, news aggregation. The professional tier funds ongoing development and provides decision-ready data infrastructure for institutional users (investment firms, healthcare organizations, consultancies, government bodies).

The two layers have different licenses:

- **Public layer** — code under [AGPL-3.0](LICENSE), data under [CC BY-NC 4.0](LICENSE). Free for non-commercial use.
- **Professional tier** — separate commercial subscription with structured data access and commercial-use rights.

See [`docs/strategy/business-model.md`](docs/strategy/business-model.md) for the public-layer feature list.

## Local dev

```bash
cd frontend
npm install
npm run dev
```

Build the static site:

```bash
cd frontend
npm run build
# Output in frontend/dist/
```

Run tests:

```bash
cd frontend
npm run test
```

## Deploy

- Push to `dev` → staging (`/var/www/healthaiatlas-dev/`)
- Push to `main` → production (`/var/www/healthaiatlas/`)

CI builds `frontend/dist/` and rsyncs to the EC2 host. Nginx (configured via `ansible/playbook.yml`) serves the static files with SPA fallback.

First-time server setup:

```bash
export DEPLOY_HOST=... DEPLOY_USER=ubuntu DEPLOY_SSH_KEY_PATH=~/.ssh/deploy.key
ansible-playbook -i ansible/inventory.yml ansible/playbook.yml \
  -e prod_domain=<prod-domain> -e dev_domain=<dev-domain>
# Then, manually: certbot --nginx -d <prod-domain> -d <dev-domain>
```

See [`ansible/README.md`](ansible/README.md) for details.

## Environment variables

Build-time (pass via CI secret or `frontend/.env.local`):

- `VITE_GA_ID` — Google Analytics measurement ID. Optional; GA is silently disabled if unset.

GitHub Actions secrets:

- `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PORT`, `DEPLOY_SSH_KEY`
- `VITE_GA_ID`

## Contributing

We welcome contributions to the public layer — corrections, additions, methodology improvements. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a PR. Every data contribution requires an evidence URL and a confidence level.

## Independence

HealthAI Atlas is owned and operated by Dr. Ekaterina Kondrateva in personal capacity. It is independent from any other professional affiliations or commercial ventures the founder is associated with. See the public-site About and Terms pages for the canonical statement.

## Project agents

Three Claude Code sub-agents live in [`.claude/agents/`](.claude/agents/) and travel with the repo. They are invoked via the Task tool in any Claude Code session opened in this repo:

- `chief-community-officer` — community design, contributor onboarding, PR triage policy
- `cmo` — positioning, outbound copy, conferences, partnerships
- `lead-researcher` — data sourcing pipeline, verification queue, methodology evolution

Registered in `c:/Projects/00_agent/knowledge-vault/02_distill/agents-registry.md`.
