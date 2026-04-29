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
- `VITE_AI_INSIGHTS_URL` — chat completion endpoint for the Discovery copilot (Sparkles panel on `/discovery`).
- `VITE_AI_INSIGHTS_MODEL` — model name passed in the request body.
- `VITE_AI_INSIGHTS_API_KEY` — bearer token for the URL above. Optional.
- `VITE_NEWSLETTER_SIGNUP_URL` — POST endpoint that captures newsletter signups from the Get Notified form (header) and the Subscribe section. Defaults to localStorage-only. To enable real capture, deploy [`00_infra/email-collect`](../../00_infra/email-collect/README.md) and put its URL here.
- `VITE_HUG_API_KEY` — HuggingFace Inference API token. Optional but **strongly recommended**: with it, the copilot can race 6 HuggingFace models in parallel (including gated Llama / Phi / Qwen), and the anonymous rate-limit cap is removed. Without it the HF attempts still run but only against non-gated models with anonymous quotas. Token: `https://huggingface.co/settings/tokens` → "Read" role is enough. **Note the `VITE_` prefix is required** — Vite hides non-prefixed env vars from the client bundle.

### Recommended setup — HuggingFace token (simplest)

HuggingFace's Inference Providers API gives every account a generous free tier and a unified OpenAI-compatible endpoint that auto-routes to the fastest available inference provider per model. One env var, one HF account.

1. Sign in at `https://huggingface.co`. Free, no card.
2. Create a **fine-grained** token at `Account → Settings → Access Tokens → Create new token`. Required permission: **"Make calls to Inference Providers"**.
3. Put the token in `frontend/.env.local` (this file goes inside `frontend/`, **not** the repo root — Vite reads env from where `vite.config.ts` lives):

   ```bash
   VITE_HUG_API_KEY=hf_...
   ```

4. **Verify the token before relying on the React app** — run the smoke test:

   ```bash
   cd frontend
   node --env-file=.env.local scripts/test-hf-token.mjs
   ```

   This pings 5 free models on the HF router directly. If it prints `✓` for at least one, the token is valid. If everything is `✗`, fix the token (most common: missing "Make calls to Inference Providers" permission).

5. Restart the dev server (`npm run dev`). The Discovery copilot's parallel race now hits the HF router with your token, alongside the anonymous fallbacks.

If the copilot still fails after all this, the on-screen error now lists every endpoint that failed and how (HTTP code, "notice", "fetch error", etc.) — share that diagnostic to debug.

### Alternative — OpenRouter free tier

OpenRouter hosts free models from Llama, Gemini-Flash and others. Free tier is rate-limited per account (≈ 200 req/day on free models, configurable per-account). To wire it up:

1. Sign up at `https://openrouter.ai`. Verify email; no card needed.
2. Create an API key in `Account → Keys`.
3. **In OpenRouter settings, set a low daily / monthly spend cap** (e.g. `$0.00`) so even paid models can't accidentally bill — free models don't bill anyway, but the cap is a belt-and-braces guard.
4. Add to `frontend/.env.local` (do NOT commit this file — it's gitignored):

   ```bash
   VITE_AI_INSIGHTS_URL=https://openrouter.ai/api/v1/chat/completions
   VITE_AI_INSIGHTS_MODEL=meta-llama/llama-3.3-70b-instruct:free
   VITE_AI_INSIGHTS_API_KEY=sk-or-v1-...
   ```

5. Restart the dev server. The authenticated endpoint runs first in the parallel race; it reliably returns answers when the anonymous endpoints don't.

Other working OpenAI-compatible providers (same env-var shape, different URL/model):
- **Groq free tier** — `https://api.groq.com/openai/v1/chat/completions` + e.g. `llama-3.3-70b-versatile`.
- **Together AI free tier** — `https://api.together.xyz/v1/chat/completions` + e.g. `meta-llama/Llama-3.3-70B-Instruct-Turbo-Free`.

### Copilot guard rails (already in code)

- **Hard 400-token cap per response** (`max_tokens` in every request).
- **3 free questions per anonymous browser** (localStorage counter), then a sign-in gate.
- **30 questions per day per signed-in user** (localStorage counter, resets at midnight local).
- **One-time privacy disclosure** before the first message.
- **Parallel race across endpoints** (authenticated first if a key is set, then 4 anonymous fallbacks) — first non-null reply wins, siblings aborted to save bandwidth.
- System prompt + few-shot set tuned for a senior-colleague register; see `frontend/src/data/aiInsightsPrompt.ts`.

The on-screen disclaimer always says: "responses can be wrong; do not paste personal info; verify before acting."

> **Bundle exposure note**: Vite's `import.meta.env.VITE_*` values are inlined into the client bundle at build time. The `VITE_AI_INSIGHTS_API_KEY` value will be readable by anyone who downloads the page. This is acceptable for a free-tier key with a strict per-account cap, but for any key you'd be unhappy to see published, use the Worker proxy described below.

### Production deploy — keep the token off the client

For production, point the copilot at the [`insights-proxy` Cloudflare Worker](../../00_infra/insights-proxy/README.md). The Worker holds the HuggingFace token server-side and enforces a CORS allowlist; the client bundle ships zero secrets.

1. Deploy the Worker once (see its README) — get a URL like `https://insights-proxy.<account>.workers.dev`.
2. In healthaiatlas's GitHub Actions secrets (or `frontend/.env.production`):
   ```bash
   VITE_AI_INSIGHTS_URL=https://insights-proxy.<account>.workers.dev
   VITE_AI_INSIGHTS_MODEL=meta-llama/Llama-3.3-70B-Instruct:fastest
   # No VITE_AI_INSIGHTS_API_KEY — Worker handles auth.
   # No VITE_HUG_API_KEY — same reason.
   ```
3. CI build picks the Worker URL; the deployed bundle calls `/v1/chat/completions` on that URL with no Authorization header. The Worker validates the Origin, attaches the Bearer token, and forwards to HuggingFace.

The frontend code already supports both modes (key + direct provider URL, or no-key + Worker URL) — see `tryAuthenticatedOpenAI` in [`frontend/src/components/research/EventInsights.tsx`](frontend/src/components/research/EventInsights.tsx).

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
