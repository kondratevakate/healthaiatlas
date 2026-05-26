# Zerotrust pipeline — TODO

Open data-sourcing tasks blocking specific Founder Toolkit modules. Each item
lists: what's needed, where it surfaces in the frontend, and a rough sourcing
plan.

---

## 1. Software vs Hardware classification per company

**Frontend dependency:** `frontend/src/pages/FoundersMarkets.tsx` — top section
("Software vs Hardware — two different worlds"). Currently illustrative,
warning banner visible.

**What we need:** per-company `product_type` flag with values:
- `software` — pure SaaS / cloud-hosted / API-first
- `hardware` — physical device, FDA 510(k) hardware path
- `hybrid` — software + physical sensor / device combo
- `services` — managed services / clinical-ops (Forward, Babylon)

**Source plan:**
- Pull from FDA AI/ML device list (`fda_ai_devices_full.csv`) — already has
  device class, can infer hardware vs software from device type field.
- Cross-reference against PM_GEO `v` (vendor) arrays.
- For non-FDA companies (EU, UK, UAE, CN) — manual classification from
  primary sources (company website "Product" page).

**Output:** new column in Airtable Entities table; new `productType` field on
`Entity` schema in `scripts/zerotrust/schema.py`.

**Story:** without this, the Markets page intro is editorial-only. Once
classified, we can compute real ratios per region (e.g. "82% of UAE
healthcare-AI by count is software, but 60% of revenue is hardware").

---

## 2. AQVI hire signal

**Frontend dependency:** `frontend/src/pages/FoundersDevRel.tsx`
(`/founders/tech`) — second tier alongside DevRel cluster atlas. Currently
referenced in the home `CONTEXT_MODULES.tech` blurb as "coming next".

**What we need:** structured hiring signal per AI/health vendor:
- `vendor` — company name
- `role_title` — exact JD title (e.g. "Sr. Developer Advocate, AI Agentic Systems")
- `posted_date` — when the listing went live
- `product_name_in_title` — boolean; product in title = 3-6 months from push
- `archived_url` — Wayback Machine snapshot for permanence

**Source plan:**
- LinkedIn jobs API (rate-limited) OR weekly RSS scrape of company careers
  pages. Maintain a static seed list of ~30 vendors (NVIDIA, Databricks,
  Anthropic, Stripe, Cloudflare, Modal, etc.).
- Daily script `scripts/zerotrust/extract_aqvi_signal.py` → CSV → Airtable
  `Hire_Signals` table → frontend TypeScript via `from_airtable.py`.

**Output:** new file `frontend/src/data/aqviSignal.ts` mirroring shape of
`devrelSignal.ts`. Surfaced on `/founders/tech` as second tab next to "Atlas /
Timeline / People".

**Story:** DevRel atlas shows where vendors are NOW. AQVI signal shows what
they're hiring for, which is a 3-6 month leading indicator on what they will
push next. Founder watching the signal can position 6 months ahead of GTM.

---

## Priority

1. **Software vs Hardware** — higher priority. Unlocks the Markets intro and
   makes per-country ratios concrete.
2. **AQVI hire signal** — lower priority. DevRel atlas already lives and is
   independently useful; AQVI is a layer on top.

## Owners

Both are atlas-curator tasks (the user as primary editor) — no engineering
blockers. Scripts exist as patterns; just need to extend them.
