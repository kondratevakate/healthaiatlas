# TODO — UX work parked for the next pass

Pending work pulled out of the UX audits run on 2026-04-29. Filed here so it doesn't get lost between branches. Each item is shippable independently.

## 🟦 Big redesign — Context / system framework page

**Goal:** keep the existing circular framework (PURPOSE → ACTIVITIES → IMPACTS → COMPONENTS) as the spine of the page, add domains as interactive bubbles inside it, and let the user pick a country to swap abstract labels for concrete companies — instead of having three separate tabs that show the same shape three times.

**Three states:**

| State | Trigger | What changes |
|---|---|---|
| 1. Global abstract | Default load | Circular diagram with abstract labels ("Drug Discovery", "Diagnostics"). Three domain bubbles (Oncology / Medical Tourism / Process Mining) sit inside the diagram as small coloured chips. |
| 2. Country selected | User picks 🇺🇸 / 🇪🇺 / 🇨🇳 / 🇦🇪 / 🇮🇳 from a top selector | Same diagram. Abstract labels are replaced with concrete orgs for that country. Domain bubbles show market size / org count / global lead % for that country. |
| 3. Domain expanded | User clicks one domain bubble | Modal or right-rail with that domain's full breakdown for the selected country: activities with $ figures, key players, gate (e.g. "FDA Approval, 18–24 mo"), power %, blockers. Diagram stays visible behind / next to. |

**Why this is worth doing:**
- Replaces three near-duplicate tabs with one explorable surface.
- Makes country comparison trivial — user changes one selector and the diagram updates in place rather than re-navigating.
- Systems-thinking shape (Activities / Impacts / Components) is preserved as the analytical frame, not buried.

**Where in the codebase:**
- `frontend/src/components/home/HeroDiagram.tsx` and `SystemDiagram.tsx` already render a flavor of the circular shape — start here.
- `frontend/src/data/players.ts`, `domains.ts` already have the per-country / per-domain data shape.
- `/context` page (`frontend/src/pages/Context.tsx`) is the natural target page; could replace its current layout entirely.

**Out of scope for this pass:**
- Animation when transitioning between states.
- Mobile interactions — desktop first.

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
