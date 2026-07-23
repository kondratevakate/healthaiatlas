# HealthAI Atlas — Design System

> **Vendored copy.** This folder is a checked-in export of the
> [claude.ai/design](https://claude.ai/design) "HealthAI Atlas Design System"
> project (which was itself generated *from* this repo — `frontend/` remains the
> source of truth). It is reference documentation for contributors: brand tokens,
> type/color/spacing specimen cards, and representative component previews. It is
> **not** part of the SPA build and nothing here is imported by `frontend/`.
> Open any `*.card.html` or `ui_kits/**/index.html` in a browser to view a
> specimen (they self-render via `_ds_bundle.js` + React UMD from CDN).
>
> Not copied from the export: raster sample imagery (`assets/og-image.png` and
> the four hospital `.jpg`s described below) and the claude.ai pane scaffolding
> (`.thumbnail`, `thumbnail.html`, `_adherence.oxlintrc.json`). The SVG assets and
> everything referenced by a specimen card are included.

Source: [`healthaiatlas/`](healthaiatlas/) codebase (Vite + React 18 + Tailwind SPA), mounted read-only via File System Access API — no Figma or GitHub link was provided. Key files read: `frontend/src/index.css`, `frontend/tailwind.config.ts`, `docs/brand/voice.md`, `frontend/src/components/**` (ui/, home/, layout/, claims/, research/, resources/), `frontend/public/favicon.svg`, root `README.md`.

## Company

HealthAI Atlas is an independent research and educational project mapping the global healthcare AI ecosystem — a directory, system map, talent hub, and open-calls feed. It runs on two layers: a free public layer (AGPL-3.0 code / CC BY-NC 4.0 data) and a paid professional tier for institutional users. It is owned and operated independently by its founder, Dr. Ekaterina Kondrateva. Status: alpha, UAE coverage live, more regions planned. Persona paths on the public site: founders, job seekers, businesses, clinicians.

## Products in this codebase

- **Marketing / directory site** (`frontend/`) — the only product surface found. A public SPA: homepage, directory, discovery/open-calls, jobs, founder toolkit (markets, SOTA, tech signals, dead valley), context pages (per-region), about, contact. No separate mobile app or docs site exists in the repo.
- `backend/` is a stub (TBD, paid-tier API — no design surface yet).

## Content fundamentals

See [`docs/brand/voice.md` in the source repo] and full rules restated below (already CC-cited into practice — this is the site's actual style guide, not inferred):

- **Stance**: document what's deployed and who's accountable, not what's announced or pitched. Every factual claim needs a primary-source URL or an explicit `inference` label.
- **Verbs of action over intent**: "deployed", "connects", "operates" — never "aims to", "is positioned to", "envisions".
- **No marketing intensifiers**: strike "leading", "innovative", "cutting-edge", "world-class", "comprehensive", "transformative", "AI-powered", "solutions/initiatives" (name the actual product).
- **Numbers beat adjectives**: "connects 14 hospitals" beats "extensive network".
- **Identify actors by function, not PR title.**
- **Bilingual EN/AR are first-class** — both hand-written, not translated.
- **Short sentences** — 1–2 per description.
- **Two-element lists, not three** — "founders and researchers", not "founders, businesses, students, and researchers".
- **Register**: technical, not marketing, for founders/researchers/regulators/journalists. Third person for entries; "we" only in editorial/About.
- **Tense**: present / present-perfect. Future tense only for a regulator's published commitment.

## Visual foundations

- **Palette**: strictly monochrome. `--primary` is black; there is no brand hue. The only chromatic colors in the system are semantic — success (green), warning (amber), info (blue) — reserved exclusively for evidence/confidence chips, never for category decoration or navigation. Categories differentiate by icon, not color (see `docs/design-decisions/2026-05-palette-strategy.md`, referenced in source comments). One warm dark tone (`--footer`, a warm charcoal, not pure black) is the sole departure from black/white.
- **Type**: Space Grotesk (sans, UI + display, the workhorse — headings, body, nav, buttons), Lora (serif, reserved narrowly for "editorial" headings inside Context/Founder Toolkit modules — regional histories, regulatory narratives — never UI chrome), Space Mono (data values, counts, source metadata), IBM Plex Sans Arabic (RTL locale). Display sizes are large and tight-tracked (up to 7rem hero type). No italics used except mono in some data contexts.
- **Corner radius**: 0 everywhere. No exceptions — not even pills (tag-filled is a hard rectangle). Badges (shadcn holdover) round to full-pill and are the one soft-corner exception, kept for small status counts only.
- **Cards / surfaces**: flat, 1px solid black/white border, no shadow at rest. Hover on interactive cards: border lightens to `foreground/50%`, optional 1–2px lift, no color fill change. Hard "brutalist" offset shadows exist as design tokens (`--shadow` through `--shadow-2xl`, `5px 5px 0 #000` etc.) but are rarely applied in real components — treat as an available accent, not the default.
- **Buttons**: solid black fill (primary), 1px border (outline), light gray fill (secondary), transparent (ghost), underline-only (link). Hover = opacity dim or accent-fill, never a hue swap. No shrink/scale on press.
- **Borders / dividers**: 1px solid, always full-opacity foreground or background color (no soft grays for borders — border color IS foreground/background token).
- **Backgrounds**: flat white (or flat black in dark mode). No gradients, no textures, no illustrations, no photography-driven hero units. The one repeating graphic device is the **section marker** — a small solid black square placed before display headings (`.section-marker::before`).
- **Animation**: minimal and purposeful — `data-reveal` scroll-fade-up (14px rise + opacity, 0.55s custom cubic-bezier), a slow 3.2s radar-ping keyframe used once on the About page hero. No bounce, no spring, no page-transition choreography.
- **Transparency/blur**: essentially none — no backdrop-blur, no glassmorphism. Only translucent hex-alpha usage is for hover/selection tints (`primary/20`, `accent/90` on badges).
- **Imagery**: a handful of documentary-style photos (hospitals, campuses — e.g. Cleveland Clinic Abu Dhabi, Seha, MBZUAI, G42 Healthcare) used in timeline/resource cards, never full-bleed hero backgrounds. Cool, clinical, unfiltered — no warm grain or stylization applied.
- **Layout**: standard container (max-width 1400px, responsive side padding 16→32px), sticky header, no fixed sidebars on the main site (sidebars appear only in FounderToolkit's dense data views).

## Iconography

- **Lucide** (`lucide-react`) is the icon set throughout — outline style, ~1.5–2px stroke, no fill. This design system does not vendor Lucide locally; consumers should link it from CDN (`https://unpkg.com/lucide@latest` or the React package) — same stroke weight, so no substitution needed.
- No custom icon font, no PNG icon set, no SVG sprite in the repo beyond the single favicon/logo mark.
- Emoji: never used in UI. Unicode arrows (→, ↗, ⌘) appear as inline glyphs for external-link and keyboard-shortcut hints — that's the extent of "icon-as-character" usage.
- Categories/personas differentiate by icon alone (never color) — see `PersonaCard`.

## Logo

**No standalone wordmark or logo lockup exists in the source.** The only mark found is `frontend/public/favicon.svg` — a simplified "atlas radar" glyph (three concentric rings + a center node + three satellite nodes), copied here as `assets/logo-mark.svg`. Everywhere else the brand name appears as plain Space Grotesk 700 type ("HealthAI Atlas"). Do not invent a wordmark; if one is designed later, replace this note.

## Assets copied in

- `assets/logo-mark.svg` — the radar glyph (from `public/favicon.svg`)
- `assets/og-image.svg`, `assets/og-image.png` — social preview card
- `assets/placeholder.svg` — generic image placeholder used in dev
- `assets/imagery/*.jpg` — 4 sample documentary photos from the timeline dataset (Cleveland Clinic, Seha, MBZUAI, G42 Healthcare)

## Components

Built from the codebase's actual `components/ui/*` (shadcn-based) + custom feedback/navigation primitives. This is a representative core set, not the full ~40-file shadcn inventory — see Caveats.

- **Button** (`components/core/Button.jsx`) — 6 variants × 4 sizes, square corners
- **Badge / Tag** (`components/core/Badge.jsx`) — status pill + uppercase category tag
- **Card** (`components/core/Card.jsx`) — flat bordered surface, optional interactive hover
- **EvidenceLabel** (`components/feedback/EvidenceLabel.jsx`) — Official/Observed/Anecdotal/Inference chip
- **ConfidenceBadge** (`components/feedback/ConfidenceBadge.jsx`) — computed High/Medium/Low chip
- **PersonaCard** (`components/navigation/PersonaCard.jsx`) — homepage audience-segment card

### Intentional additions

None beyond what the source defines — Badge/Tag split mirrors the source's actual `.tag-label`/`.tag-filled` CSS classes plus the shadcn `Badge`, both real patterns in the codebase.

## UI kits

- `ui_kits/marketing-site/index.html` — homepage recreation: header w/ nav + search + language toggle, hero, stats strip, 5-card persona picker, footer. Tagged as a Design System card and a Starting Point.

## Index

```
styles.css              → tokens/fonts, colors, typography, spacing, shadows, base
tokens/                  CSS custom properties, one file per concern
components/core/         Button, Badge/Tag, Card
components/feedback/     EvidenceLabel, ConfidenceBadge
components/navigation/    PersonaCard
guidelines/              foundation specimen cards (Colors, Type, Spacing, Brand)
ui_kits/marketing-site/  homepage recreation
assets/                  logo mark, og-image, placeholder, sample imagery
SKILL.md                 Claude Code / Agent Skills entry point
```

## Caveats & next steps

- **No Figma or design tool was attached** — everything here is read from the live codebase (CSS variables, Tailwind config, actual `.tsx` component source), which is the strongest possible source but means dense data-visualization screens (treemaps, bubble charts, matrices in `ai-life-sciences/`, `context-*`, `medical-tourism/`) were **not** rebuilt as UI kit screens — they're chart-heavy and better read directly from source when needed.
- Only 6 components were built as a **representative core set** (Button, Badge/Tag, Card, EvidenceLabel, ConfidenceBadge, PersonaCard), not the full `components/ui/*` shadcn inventory (~40 files: dialog, sheet, tabs, accordion, etc.) or the many domain-specific cards (ConferenceCard, OpenCallCard, RiskScoreCard, RedFlagCard, ClaimCard...). Tell me which additional families matter most and I'll build them next — dialog/sheet/tabs and the RiskScoreCard/ClaimCard family are the natural next batch.
- Only one UI kit screen exists (homepage). A directory-listing screen and a founder-toolkit data screen would round out the kit — let me know if you want those.
- Fonts are loaded via Google Fonts `@import` (matches the source exactly) rather than self-hosted `@font-face` — no local font files exist in the repo to copy.

**Ask:** tell me which components or screens to build out next, and I'll iterate.
