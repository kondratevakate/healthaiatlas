# TODO — UX work parked for the next pass

Pending work pulled out of the UX audits run on 2026-04-29. Filed here so it doesn't get lost between branches. Each item is shippable independently.

## 🟥 Discovery copilot — grounding (RAG) + data-source migration

**Problem.** The free open-weights models we race in `EventInsights.tsx` hallucinate. A deployed user got a confident recommendation for "AI Health 2024 in New York, June 14–16" with two fabricated speakers. That event isn't in the Atlas database. Tightening the system prompt with hard "do not invent events" rules and lowering temperature to 0.2 helps but doesn't eliminate the problem — every free model we ping still has the entire training corpus to draw from.

**Two-layer fix.**

### Layer 1 — RAG retrieval before the model call

Today the entire conferences list is inlined into the system prompt as a string. That works at small scale but:
- doesn't scale once players, mentors, launches, claims, vendors are also added (10× the tokens);
- doesn't bias the model toward the Atlas data — the inline list is "context", not "ground truth";
- doesn't help when the user asks about "AI Medicine Summit" — the model still completes from training data because there's no retrieval step that says "these are the only relevant Atlas records for this query".

**Architecture target:**
1. Build embeddings of every record in `frontend/src/data/*.ts` (events, players, mentors, launches, claims, vendors). One row → one vector.
2. At query time: embed the user message, retrieve top-K similar records, inject them into the system prompt as `ATLAS_RECORDS` block.
3. System prompt rule: "answer ONLY from ATLAS_RECORDS; if a query has no relevant records, say so."
4. Run the retrieval inside the `insights-proxy` Cloudflare Worker so the client doesn't ship an embedding lib.

**Storage options for the index** (Cloudflare ecosystem, free tier):
- Cloudflare Vectorize — purpose-built, 5M vectors free, simplest fit.
- Cloudflare D1 + manual cosine-similarity — works for a few thousand records, slower at scale.
- Build-time precomputed JSON shipped with the Worker — zero runtime cost, fine for small datasets, full re-deploy needed when data updates.

**Embedding model.** `Workers AI` has `@cf/baai/bge-base-en-v1.5` available on the Workers AI free tier; runs at the edge, no extra service.

### Layer 2 — Move the source of truth out of TS files

Right now the data lives in `frontend/src/data/*.ts` — fine for engineers, awful for editorial updates. Every "WHX Dubai is now WHX MENA 2026" change requires a code commit. Once the project goes public-contribution, the TS-file model breaks down.

**Airtable as the canonical source** (Kate's call):
- One base, one table per entity: `events`, `players`, `vendors`, `mentors`, `launches`, `claims`, `red_flags`.
- Schema tracks `last_verified` + `evidence_url` + `confidence` (already required by `CONTRIBUTING.md`).
- Editorial team (or just Kate) updates Airtable directly; no code commits needed.

**Sync to runtime:**
- A Worker (cron-triggered nightly + on-demand webhook) pulls Airtable → writes to KV / D1 / regenerates the Vectorize index.
- Frontend fetches via the existing `insights-proxy` (which now also serves a `/atlas/{entity}` endpoint), or via a build-time prebuild step that snapshots Airtable to JSON.
- Airtable token sits as a Worker secret — never in the bundle.

**Migration path:**
1. Stand up Airtable base with the same shape as current TS files (~1 day; CSV-import the existing data).
2. Worker endpoint `/atlas/snapshot` that returns the live Airtable contents as JSON (~1 day).
3. Vite build hook that fetches `/atlas/snapshot` at build-time and inlines into the bundle (so production users still get static-fast first paint, no CORS, no runtime fetch). For dev, fall back to live fetch on each reload (~1 day).
4. Switch Discovery copilot to consume the Atlas snapshot via the Worker (same data shape, just sourced from Airtable now). Build the Vectorize index from the same snapshot (~2 days).
5. Decommission `frontend/src/data/*.ts` once Airtable is the source of truth (~1 day cleanup).

Total ≈ 1 week of focused work for the migration. Should land BEFORE any major content-team onboarding; doing it after means migrating live edits.

**Out of scope for v1:**
- Multi-table Airtable views per editorial role
- Audit log of Atlas edits (Airtable has revision history; that's enough for v1)
- Multi-language data (defer until US/EU coverage actually ships)

## 🟦 Big redesign — Context / system framework page (value-stream model)

**Goal:** one explorable surface that replaces the three near-duplicate domain tabs. Keep the systems-thinking shape (Purpose → Components → Activities → Impacts) as the analytical frame; render the domains as **value streams** running through it.

**Why value streams, not categories.** The right systems-thinking framing isn't "Oncology lives inside Activities" or "inside Components" — it's that every domain is a vertical pathway through the same shared infrastructure. Components are shared. Purpose is shared. Activities and Impacts are domain-specific subsets. Each value stream pulls from the same Components, organises its own Activities, produces its own Impacts, all rolling up to the shared Purpose.

```
                      SHARED PURPOSE
            (improve health, economic growth, …)
                            ▲
                            │
                  ┌─────────┴─────────┐
                  │ SHARED COMPONENTS │
                  │ (data, AI tools,  │
                  │  hospitals,       │
                  │  research, govt,  │
                  │  capital)         │
                  └────┬────┬────┬────┘
                       │    │    │
                       ▼    ▼    ▼
        ┌──────────┬──────────┬──────────┐
        │ ONCOLOGY │ MED TOUR │ PROC MIN │   ← value streams
        │ activs + │ activs + │ activs + │
        │ impacts  │ impacts  │ impacts  │
        └─────┬────┴─────┬────┴─────┬────┘
              │          │          │
              └──────────┴──────────┘
                         │
                         ▼
                  SYSTEM OUTCOMES
```

**Three states (state machine):**

| State | Trigger | What changes |
|---|---|---|
| 1. Global abstract | Default | Diagram with generic labels. Value-stream lanes show domain names + abstract sub-activities. |
| 2. Country instantiation | Country selector (🇺🇸 / 🇪🇺 / 🇨🇳 / 🇦🇪 / 🇮🇳) | Labels swap to concrete orgs. Each value-stream lane shows market size, # orgs, key players for that country. |
| 3. Domain deep-dive | Click a value-stream lane | Modal or right-rail: full domain breakdown for the selected country — activities with $ figures, key players, controlling gate (e.g. "FDA Approval 12–24 mo"), blockers, opportunities. Diagram stays visible. |

**Data shape:**

```ts
frameworkAbstract = { purpose, components, valueStreams: { oncology: {…}, medicalTourism: {…}, processMining: {…} } }
frameworkByCountry = {
  usa: { ...same shape, every leaf populated with concrete orgs + $ figures + gates + blockers },
  uae: { … },
  …
}
```

Renderer is a single switch on `selectedCountry`. Adding a country = one new key in `frameworkByCountry`; no UI changes needed.

**Where in the codebase:**
- `frontend/src/pages/Context.tsx` is the natural target page — current layout can be replaced entirely.
- `frontend/src/components/home/HeroDiagram.tsx` and `SystemDiagram.tsx` already render a flavour of the circular shape — start here for the abstract layer.
- `frontend/src/data/players.ts` and `domains.ts` already carry the per-country / per-domain data hooks.

**Implementation phases (≈ 6 weeks):**
1. Lock the abstract framework (Purpose / Components / 3 value streams / Impacts) — 1 wk
2. Country selector + per-country data structure scaffold — 1 wk
3. Dynamic text-replacement on country select — 1 wk
4. Domain deep-dive panel (state 3) — 2 wk
5. Comparative analysis (compare same domain across countries) — 1 wk

**Out of scope for this pass:**
- Animations between states (later, polish)
- Mobile interactions (desktop-first; mobile gets a stripped one-domain-at-a-time view eventually)
- Feedback-loop visualisation between domains (advanced systems-thinking layer; v2 of this page)

---

## 🟨 Process Mining — leftover from the 2026-04-29 audit

Already shipped on `process-mining-fixes`: multi-select event filter, company search, combined colour+size legend, click → detail Sheet, Y-axis sort indicator, view descriptions in HubShell.

Still open:

- **Sidebar layout for filters.** Top toolbar works on desktop today; on tall data it would scroll out of view. Move the filter strip + search into a left sidebar that stays visible while scrolling the chart.
- **Vertical jitter for overlapping bubbles.** When the same vendor has multiple events in the same year, they stack on top of each other. Apply a deterministic small vertical offset based on event index within (vendor, year).
- **Mobile complete redesign for Deal Flow.** Mobile currently falls back to a list view; the chart isn't shown at all. Either add a simplified mini-chart or sortable / filterable mobile table that mirrors the data layer.
- **Other tabs.** `Products`, `Open Landscape`, `Geography`, `Timeline` got tab descriptions but no UX overhaul. Each likely needs its own focused pass:
  - `Products`: vendor cards grouped by use-case, with evidence-tagged client outcomes. Currently a long list; needs filters + density controls.
  - `Open Landscape`: open-source projects + datasets list. Needs categorisation + last-active dates.
  - `Geography`: today TBD. Could drive off the country selector from the big redesign above.
  - `Timeline`: reuses Deal Flow events but as a chronological feed. Currently visually identical to Deal Flow; differentiate.
- **Search across all events**, not just by company. Filter by deal-value range, date range. Today only company-name search.

---

## 🟧 Oncology Pharma & Product Benchmark — leftover from the 2026-04-29 audit

Already shipped on `process-mining-fixes`: vendor penetration summary, multi-select category filter, "show only gaps" toggle, click cell → Sheet (filled and gap), click vendor chip → vendor profile Sheet, last-updated badge in toolbar, "Market gap" rename.

Still open:

- **Mobile card layout.** Matrix is horizontally scrollable on small screens but unreadable. On `< sm` breakpoint render as one card per pharma, with the value chain inside as a vertical list ( category → use case → vendors / gap ).
- **Vendor name truncation.** Chips are `max-w-[90px] truncate`; full name only on hover. On wider screens we could let chips wrap to two lines for readability without breaking the matrix.
- **CSV / clipboard export.** "Download as CSV" button — pharma × use case × vendor list. Investors and BD teams will pull this offline.
- **Sticky group / category headers.** First column already sticky-left; group-row + use-case-row headers should also stay visible when scrolling vertically through the table.
- **Vendor-centric (inverted) view toggle.** Same data, vendors as rows, pharmas as columns. Easier for "who else uses Tempus AI?" type questions.
- **Heatmap view toggle.** For pure penetration view: cell intensity = number of vendors / "is this a gap". Drops the chip names entirely; pure pattern view.
- **Network graph view toggle.** Pharma ↔ Vendor edges, edge thickness = count. For ecosystem-level relationship questions.

---

## 🟪 Cross-cutting (smaller, hit when convenient)

- **Bundle code-splitting.** Vite warns the client bundle is over 500 KB minified. Lazy-load Discovery copilot, BubbleMap, PharmaMatrixView, DealFlowView via `React.lazy()`. They're heavy and not every visitor will open them.
- **Dark mode pass.** Some category colors (e.g. Oncology Funding hsl(var(--foreground) / 0.7)) need verification on dark theme; intent was to use foreground-tinted opacity but a few hardcoded `bg-amber-50` etc don't auto-adapt.
- **`Privacy.tsx` still references atelic.ai** in the "Who we are" paragraph (line ~21). Per the independence statement on About / Terms, that mention should be removed for consistency.
- **Discovery copilot streaming.** `askInsight` waits for full response. Pollinations + HuggingFace router both support SSE; streaming would make replies feel near-instant. ~50 lines change.

---

## ✅ Done in the 2026-04-29 push

For reference — what already shipped on the audit-fix branches.

- `medical-tourism` branch: bubble map (Demand × Growth + Supply bars), specialty sidebar, transplant specialty, Self-Assessment intro for international clinics, Directory split-button dropdown, footer alignment, About + Terms with V2/V3 copy, license dual AGPL-3.0 + CC BY-NC 4.0, Discovery copilot panel with auth/disclosure/intake/quota, parallel free-model race, Worker proxy support.
- `process-mining-fixes` branch: process-mining + oncology fixes (this file lives on this branch).
