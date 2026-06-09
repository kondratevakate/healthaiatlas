// design-system.test.ts ─────────────────────────────────────────────────────
//
// Enforces the visual-consistency rules declared in frontend/src/index.css
// and AGENTS.md. The site uses shadcn/ui + Tailwind v3 with a tight design
// vocabulary inherited from the "Sandbox Dubai" minimal-government style:
//
//   • Sans-serif only (Space Grotesk). `font-serif` is forbidden in app code.
//   • Heading sizes live in `.heading-*` utilities in index.css.
//     Raw `text-5xl..text-9xl` in components bypasses the responsive scale
//     and is the #1 cause of "title sizes pляшут".
//   • Colors must use shadcn semantic tokens (foreground, muted-foreground,
//     primary, border, …) or the named domain tokens already declared in
//     tailwind.config.ts (green/pink/yellow/blue/orange/purple/gray).
//     Raw Tailwind palette classes (text-red-500, bg-emerald-100, …) and
//     hardcoded hex colors break dark mode and the brand palette.
//   • Every routed page wraps content in <Layout> so header/footer chrome
//     stays uniform. NotFound is the documented exception.
//   • Pages share the canonical `container py-12 md:py-16` content shell.
//     Hero-style pages (Index) opt-out explicitly via the allowlist.
//   • Every entry in the Header's `navLinks` resolves to a <Route> in App.tsx.
//
// All checks are STATIC — pure `fs` + regex, no JSDOM, no React renderer.
// Allowlists at the top of each section capture KNOWN current offenders
// so the suite is green today; the rules block NEW drift. Audit and shrink
// allowlists during cleanup passes.
// ────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const PROJECT_ROOT = join(__dirname, '..');
const PAGES_DIR = join(PROJECT_ROOT, 'pages');
const COMPONENTS_DIR = join(PROJECT_ROOT, 'components');
const INDEX_CSS = join(PROJECT_ROOT, 'index.css');
const APP_TSX = join(PROJECT_ROOT, 'App.tsx');
const HEADER_TSX = join(PROJECT_ROOT, 'components', 'layout', 'Header.tsx');

// ── File walker ────────────────────────────────────────────────────────────

function* walk(dir: string, exts = ['.tsx', '.ts']): Generator<string> {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full, exts);
    else if (exts.some((ext) => full.endsWith(ext))) yield full;
  }
}

function rel(file: string): string {
  return file.slice(PROJECT_ROOT.length + 1).replace(/\\/g, '/');
}

function gatherTsx(roots: string[]): string[] {
  const out: string[] = [];
  for (const root of roots) for (const f of walk(root, ['.tsx'])) out.push(f);
  return out;
}

const allTsx = gatherTsx([PAGES_DIR, COMPONENTS_DIR]);
const pageTsx = gatherTsx([PAGES_DIR]);

// Strip block + line comments + string contents that don't influence the rendered DOM.
// We DON'T strip JSX className strings — those are the whole point of the audit.
function stripCommentsOnly(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

// ─── 1. TYPOGRAPHY ─────────────────────────────────────────────────────────

describe('design-system: typography', () => {
  // 1a. font-serif is the editorial accent for the Context / Founder Toolkit
  // sections (regional histories, regulatory grammars, market scale narratives).
  // Outside those modules the design is sans-only — any font-serif in a
  // top-level page or home component is drift.
  //
  // TODO(design-system): extract a `.heading-editorial` utility so the 30+
  // `font-serif text-2xl md:text-3xl font-bold ...` repetitions across
  // context-* modules collapse into one class. Until then, the directories
  // below are the only place font-serif is allowed.
  const FONT_SERIF_DIR_ALLOWLIST = [
    'components/context-architecture/',
    'components/context-compare/',
    'components/context-eu/',
    'components/context-uk/',
    'components/context-uae/',
    'components/context-us/',
    'components/dead-valley/',
    // Editorial data-viz where serif labels are intentional inside SVG.
    'components/home/HeroDiagram.tsx',
    'components/home/SystemDiagram.tsx',
  ];
  const FONT_SERIF_FILE_ALLOWLIST = new Set<string>([
    'pages/Context.tsx',           // Founder Toolkit landing — serif headings by design
    'pages/FoundersArchitectures.tsx', // editorial stat numbers in Founder Toolkit SOTA page
  ]);

  function isFontSerifAllowed(r: string): boolean {
    if (FONT_SERIF_FILE_ALLOWLIST.has(r)) return true;
    return FONT_SERIF_DIR_ALLOWLIST.some((prefix) => r.startsWith(prefix));
  }

  it('no font-serif outside the editorial / context-* modules', () => {
    const offenders: string[] = [];
    for (const f of allTsx) {
      if (isFontSerifAllowed(rel(f))) continue;
      const src = stripCommentsOnly(readFileSync(f, 'utf8'));
      const lines = src.split('\n');
      lines.forEach((line, i) => {
        if (/\bfont-serif\b/.test(line)) {
          offenders.push(`${rel(f)}:${i + 1}  ${line.trim().slice(0, 120)}`);
        }
      });
    }
    expect(
      offenders,
      `font-serif is reserved for the editorial Context / Founder Toolkit modules.\n` +
        `In the main site (Home, Directory, Discovery, About, …) use .heading-display / ` +
        `.heading-serif / .heading-xl from index.css instead.\n\n` +
        offenders.join('\n'),
    ).toEqual([]);
  });

  // 1b. Raw display-sized classes (text-5xl and up) in TSX should go through
  // the .heading-display* or .heading-serif* utilities so the responsive
  // breakpoints stay in one place. Allowlist: components where the size is
  // intentionally bespoke (brand logo, stat counters).
  const DISPLAY_SIZE_ALLOWLIST = new Set<string>([
    'components/layout/Footer.tsx',           // big footer logo
    'components/home/StatsSection.tsx',       // stat counters (different rhythm than headings)
    'components/home/SubscribeSection.tsx',   // intentional override of heading-display
    'components/dead-valley/DeadValleyView.tsx', // failure-stat numbers
    'pages/FoundersDeadValley.tsx',           // failure-stat numbers
    'pages/Founders.tsx',                     // module stat counters ($14T, 29, 6, 5)
    'pages/NotFound.tsx',                     // 404 numeral
  ]);

  const DISPLAY_SIZE_RE = /\btext-(?:5xl|6xl|7xl|8xl|9xl)\b/;

  it('no raw text-5xl..text-9xl outside heading utilities (use .heading-display / .heading-serif)', () => {
    const offenders: string[] = [];
    for (const f of allTsx) {
      if (DISPLAY_SIZE_ALLOWLIST.has(rel(f))) continue;
      const src = stripCommentsOnly(readFileSync(f, 'utf8'));
      const lines = src.split('\n');
      lines.forEach((line, i) => {
        if (DISPLAY_SIZE_RE.test(line)) {
          offenders.push(`${rel(f)}:${i + 1}  ${line.trim().slice(0, 120)}`);
        }
      });
    }
    expect(
      offenders,
      `Raw display-size classes bypass the responsive heading scale in index.css.\n` +
        `Replace with .heading-display, .heading-display-xl, .heading-serif, or .heading-serif-sm.\n\n` +
        offenders.join('\n'),
    ).toEqual([]);
  });

  // 1c. heading-display utility must not be re-sized with text-Nxl on the
  // same element — the whole point of the utility is to own the scale.
  it('.heading-display is not re-sized inline with text-Nxl on the same element', () => {
    const offenders: string[] = [];
    const RE = /heading-display[^"']*\btext-[0-9]/;
    for (const f of allTsx) {
      const src = readFileSync(f, 'utf8');
      const lines = src.split('\n');
      lines.forEach((line, i) => {
        if (RE.test(line)) {
          offenders.push(`${rel(f)}:${i + 1}  ${line.trim().slice(0, 120)}`);
        }
      });
    }
    expect(
      offenders,
      `Don't override .heading-display with raw text-Nxl on the same element — ` +
        `pick the utility that already has the right size.\n\n` +
        offenders.join('\n'),
    ).toEqual([]);
  });

  // 1d. Every page renders exactly one h1, sourced from PageHeader or a hero
  // component. We can't guarantee "exactly one" statically without a parser,
  // but we CAN catch pages that hand-roll an h1 with raw Tailwind classes
  // instead of going through PageHeader / HeroSection.
  const RAW_H1_ALLOWLIST = new Set<string>([
    'pages/NotFound.tsx',  // 404 numeral, intentionally bespoke
    'pages/Share.tsx',     // assessment-summary page, custom hero
    'pages/Index.tsx',     // home hero, custom layout
    'pages/Founders.tsx',           // tight editorial masthead replaces PageHeader intentionally
    'pages/FoundersMarkets.tsx',    // chart-first layout, minimal caption heading
    'pages/FoundersAcquihires.tsx', // editorial masthead with stat strip
    'pages/Jobs.tsx',               // data-density page, tight header above stat bar
    'pages/OpenCalls.tsx',          // custom hero layout, heading-display used directly
  ]);

  // 1e. Heading elements must not bypass the brand type scale.
  // If you write `<h1 className="text-3xl font-bold">` you get sans-serif at an
  // arbitrary size — losing the font-serif axis that .heading-editorial sets.
  // The fix is always to pick a heading utility from index.css.
  //
  // Catches lines where a heading tag AND a raw text-Nxl coexist without a
  // heading-* utility on the same line. Multi-line classNames are rare in this
  // codebase so single-line matching is sufficient.
  const RAW_HEADING_SIZE_ALLOWLIST = new Set<string>([
    'pages/NotFound.tsx',       // intentionally bespoke 404 numeral
    'pages/Share.tsx',          // assessment-summary custom hero
    'pages/Index.tsx',          // home hero — uses heading-display elsewhere but has inline overrides
    'components/ui/card.tsx',   // shadcn CardTitle boilerplate — do not modify
  ]);

  it('heading elements use heading utilities, not raw text-Nxl classes', () => {
    // Matches: tag opens with h1/h2/h3, AND a `text-Nxl` size class appears,
    // AND no heading-* utility appears — all on the same source line.
    const HEADING_TAG_RE    = /<h[123]\b/;
    const RAW_SIZE_RE       = /\btext-[2-9]xl\b/;
    const UTILITY_RE        = /\bheading-(?:display|serif|editorial|xl|lg|md)\b/;

    const offenders: string[] = [];
    for (const f of allTsx) {
      if (RAW_HEADING_SIZE_ALLOWLIST.has(rel(f))) continue;
      const src = stripCommentsOnly(readFileSync(f, 'utf8'));
      src.split('\n').forEach((line, i) => {
        if (HEADING_TAG_RE.test(line) && RAW_SIZE_RE.test(line) && !UTILITY_RE.test(line)) {
          offenders.push(`${rel(f)}:${i + 1}  ${line.trim().slice(0, 120)}`);
        }
      });
    }
    expect(
      offenders,
      `Heading elements must use brand utilities from index.css — not raw text-Nxl.\n` +
        `Replace with: heading-display, heading-serif, heading-serif-sm, heading-editorial,\n` +
        `heading-xl, heading-lg, or heading-md.\n\n` +
        offenders.join('\n'),
    ).toEqual([]);
  });

  it('every page uses PageHeader or a known hero for its h1', () => {
    const offenders: string[] = [];
    for (const f of pageTsx) {
      if (RAW_H1_ALLOWLIST.has(rel(f))) continue;
      const src = readFileSync(f, 'utf8');
      const hasRawH1 = /<h1\b/.test(src);
      const hasPageHeader = /\bPageHeader\b/.test(src);
      if (hasRawH1 && !hasPageHeader) {
        offenders.push(rel(f));
      }
    }
    expect(
      offenders,
      `Pages should render their h1 via <PageHeader> so the title size, ` +
        `eyebrow, and section-marker stay consistent.\n\n` +
        offenders.join('\n'),
    ).toEqual([]);
  });
});

// ─── 2. COLOR PALETTE ──────────────────────────────────────────────────────

describe('design-system: color palette', () => {
  // 2a. No hardcoded hex in component code (except shadcn boilerplate and
  // brand-logo SVGs).
  const HEX_ALLOWLIST = new Set<string>([
    'components/ui/chart.tsx',                            // shadcn boilerplate
    'components/auth/SignInModal.tsx',                    // Google brand SVG colors
    'components/ai-life-sciences/ModalityMatrixView.tsx', // data-viz fallback color
    'components/context-architecture/BubbleChart.tsx',    // SVG stroke/fill defaults
    'components/context-architecture/ProductTable.tsx',   // chart family fallback
  ]);

  // Match #fff, #ffffff, #ffff (rgba) in string contexts. Skip SVG path `d=`
  // attributes (no `#` there) and hex-encoded entities.
  const HEX_RE = /['"]#[0-9a-fA-F]{3,8}['"]/;

  it('no hardcoded hex colors in component code', () => {
    const offenders: string[] = [];
    for (const f of allTsx) {
      if (HEX_ALLOWLIST.has(rel(f))) continue;
      const src = stripCommentsOnly(readFileSync(f, 'utf8'));
      const lines = src.split('\n');
      lines.forEach((line, i) => {
        if (HEX_RE.test(line)) {
          offenders.push(`${rel(f)}:${i + 1}  ${line.trim().slice(0, 120)}`);
        }
      });
    }
    expect(
      offenders,
      `Hardcoded hex colors bypass dark mode and the brand palette.\n` +
        `Use shadcn tokens (hsl(var(--foreground))) or named tokens from tailwind.config.ts.\n\n` +
        offenders.join('\n'),
    ).toEqual([]);
  });

  // 2b. Raw Tailwind palette classes (text-red-500, bg-emerald-100, etc.)
  // bypass the semantic tokens. The allowlist below contains ONLY:
  //
  //   a) shadcn boilerplate (toast.tsx) — do not touch
  //   b) Data-visualisation / editorial context components that encode
  //      categorical data in color (drug identity, event type, funding stage).
  //      These use emerald/amber/blue for data encoding, NOT status indication,
  //      so migrating to --success/--warning/--info would be semantically wrong.
  //      They may be migrated once the data-viz layer has its own token system.
  //
  // Core status-indicator components (ConfidenceBadge, RiskScoreCard,
  // EvidenceLabel, CompactRedFlagItem, EventInsights) have been migrated to
  // semantic tokens (--success, --warning, --info, --destructive) and are
  // no longer in this list. New files MUST use semantic tokens only.
  const RAW_PALETTE_ALLOWLIST = new Set<string>([
    // Context data-visualisation — categorical color encoding, not status
    'pages/Founders.tsx',                 // editorial card signal-type accents (blue=tech, red=dead-valley, green=region)
    'pages/FoundersDevRel.tsx',           // timeline event-type legend (hire/move/launch/content/gap)
    'components/context-uk/UkFounderMap/NiceRejection.tsx',
    'components/context-uk/UkFounderMap/NhsDeployments.tsx',
    'components/context-uk/UkFounderMap/FundingRounds.tsx',
    'components/context-eu/EuFounderMap/SwissAnimal.tsx',
    'components/context-eu/EuFounderMap/AlzheimersBridge.tsx',
    'components/context-eu/EuFounderMap/PharmaGravity.tsx',
    'components/context-us/UsSidebar.tsx',
    'components/home/SubscribeSection.tsx',
    // shadcn boilerplate — do not migrate
    'components/ui/toast.tsx',
    // Categorical color encoding for domain taxonomy (not status indication)
    'components/ai-life-sciences/RecentSignalsView.tsx',
    'pages/Jobs.tsx',                  // domain category badges + remote-status pills
  ]);

  const RAW_PALETTE_RE =
    /\b(?:text|bg|border|ring|from|to|via|fill|stroke)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}(?:\/\d+)?\b/;

  it('no raw Tailwind palette classes outside status-indicator allowlist', () => {
    const offenders: string[] = [];
    for (const f of allTsx) {
      if (RAW_PALETTE_ALLOWLIST.has(rel(f))) continue;
      const src = stripCommentsOnly(readFileSync(f, 'utf8'));
      const lines = src.split('\n');
      lines.forEach((line, i) => {
        if (RAW_PALETTE_RE.test(line)) {
          offenders.push(`${rel(f)}:${i + 1}  ${line.trim().slice(0, 140)}`);
        }
      });
    }
    expect(
      offenders,
      `Raw Tailwind palette classes break dark mode and the brand palette.\n` +
        `Use semantic shadcn tokens (text-foreground, text-muted-foreground, ` +
        `bg-primary, border-border) or semantic status tokens (bg-success/10, ` +
        `text-warning, text-destructive) from tailwind.config.ts.\n\n` +
        offenders.join('\n'),
    ).toEqual([]);
  });

  // 2c. Named-token classes that reference CSS variables not defined in
  // index.css resolve to hsl() with an empty argument → render transparent.
  // Specifically: --pink, --yellow, --orange, --blue, --green, --purple are
  // declared in tailwind.config.ts but NOT defined in index.css.
  // Decision: these tokens will be removed, not defined. Categories use
  // icon + border differentiation only (see 2026-05-palette-strategy.md).
  // This test catches any re-introduction of broken named-token classes.
  const UNDEFINED_DOMAIN_TOKENS = ['pink', 'yellow', 'orange', 'blue', 'green', 'purple'];
  const BROKEN_NAMED_TOKEN_RE = new RegExp(
    `\\b(?:(?:hover|focus|group-hover|active|disabled)\\:)?` +
      `(?:text|bg|border|ring|fill|stroke|from|to|via)-` +
      `(?:${UNDEFINED_DOMAIN_TOKENS.join('|')})` +
      `(?:[/-](?!\\d)|\\b(?!-)(?!light\\b))`,
  );
  // Exception: the `-light` variant (e.g. bg-pink-light) follows the same
  // variable naming so is equally broken — intentionally not exempted here.

  it('no named-token classes referencing undefined CSS variables (--pink, --yellow, --orange, --blue, --green, --purple)', () => {
    const offenders: string[] = [];
    for (const f of allTsx) {
      const src = stripCommentsOnly(readFileSync(f, 'utf8'));
      const lines = src.split('\n');
      lines.forEach((line, i) => {
        if (BROKEN_NAMED_TOKEN_RE.test(line)) {
          offenders.push(`${rel(f)}:${i + 1}  ${line.trim().slice(0, 140)}`);
        }
      });
    }
    expect(
      offenders,
      `Named-token classes (bg-pink, text-yellow, hover:border-orange, …) reference\n` +
        `CSS variables (--pink, --yellow, --orange, --blue, --green, --purple) that are\n` +
        `NOT defined in index.css — they render as transparent.\n` +
        `Fix: use semantic tokens (text-foreground, bg-success/10, border-border)\n` +
        `or differentiate by icon/border-style per the palette strategy decision.\n\n` +
        offenders.join('\n'),
    ).toEqual([]);
  });
});

// ─── 2d. BADGE / TINT CONTRAST ──────────────────────────────────────────────
//
// Tailwind shades 100/200/300/400 of a hue are designed as TEXT on dark
// backgrounds or as BACKGROUND on light. Using them as text on a low-alpha
// tint of the same hue over the site's default white `--background` drops
// below WCAG AA (4.5:1).
//
// Anti-pattern caught here:
//   bg-emerald-500/15 text-emerald-300          ← unreadable on light
//
// Required shape when a low-alpha tint is used as the badge fill:
//   bg-emerald-500/15 text-emerald-700 dark:text-emerald-300
//
// History: 2026-05-30 the Jobs page badges (Clinical AI, Pathology AI, etc.)
// shipped with the dark-mode-only palette and were illegible against the
// default light background. The remote-status pills had the same bug.

describe('design-system: badge contrast', () => {
  const TAILWIND_HUES =
    'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';

  // Per-line scanning matches the convention of the typography rules above
  // and works equally well for className attributes AND for class-lookup
  // tables (e.g. CATEGORY_COLOR maps in Jobs.tsx). In this codebase Tailwind
  // class strings live on a single source line — multi-line className via
  // `cn(...)` still puts each string literal on its own line.

  const LIGHT_TEXT_RE = new RegExp(`\\btext-(${TAILWIND_HUES})-(100|200|300|400)(?:/\\d+)?\\b`, 'g');
  const DARK_TEXT_RE  = new RegExp(`\\btext-(${TAILWIND_HUES})-(600|700|800|900|950)(?:/\\d+)?\\b`, 'g');

  // Allowlist: files where light text shades are intentional because the
  // background is guaranteed dark (modal overlays, inverted heroes) OR the
  // shade is used as a categorical signal accent rather than a badge fill.
  // Add new entries with a one-line justification — bare additions revert.
  const LIGHT_TEXT_ALLOWLIST = new Set<string>([
    // Editorial signal-type accents (blue=tech, red=dead-valley, green=region).
    // Already exempt from RAW_PALETTE_ALLOWLIST (§2b) for the same reason —
    // categorical color encoding inside the editorial card surface, not a badge.
    'pages/Founders.tsx',
    // DevRel timeline event-type accents — categorical color encoding for
    // hire/move/launch/content/gap on a dark card; same reason as Founders.tsx.
    'pages/FoundersDevRel.tsx',
    // shadcn boilerplate — the destructive variant gives the toast a dark
    // red background, so `group-[.destructive]:text-red-300` reads against
    // dark red, not against the site default white. Do not modify.
    'components/ui/toast.tsx',
  ]);

  it('low-light text shades (text-X-100..400) are paired with a dark sibling on the same line', () => {
    const offenders: string[] = [];
    for (const f of allTsx) {
      if (LIGHT_TEXT_ALLOWLIST.has(rel(f))) continue;
      const src = stripCommentsOnly(readFileSync(f, 'utf8'));
      const lines = src.split('\n');
      lines.forEach((line, i) => {
        // Collect every light-shade text hue used in BASE (no dark: prefix)
        // and every dark-shade text hue present anywhere on the same line.
        const lightHues = new Set<string>();
        const darkHues  = new Set<string>();
        for (const m of line.matchAll(LIGHT_TEXT_RE)) {
          // m.index points at the start of the match; check the 6 chars before
          // to see if it's `dark:`-prefixed (those apply only in dark mode and
          // are fine as long as a base dark shade exists for the same hue).
          const idx = m.index ?? 0;
          const isDarkPrefixed = line.slice(Math.max(0, idx - 5), idx) === 'dark:';
          if (!isDarkPrefixed) lightHues.add(m[1]);
        }
        if (lightHues.size === 0) return;
        // For dark shades, ANY occurrence on the line (with or without
        // `dark:` prefix) counts as a pair — what matters is that a dark
        // shade is reachable in light mode. In Tailwind, an un-prefixed
        // dark-shade token applies in BOTH modes, so it pairs with the light
        // shade automatically.
        for (const m of line.matchAll(DARK_TEXT_RE)) {
          const idx = m.index ?? 0;
          const isDarkPrefixed = line.slice(Math.max(0, idx - 5), idx) === 'dark:';
          if (!isDarkPrefixed) darkHues.add(m[1]);
        }
        for (const hue of lightHues) {
          if (!darkHues.has(hue)) {
            offenders.push(
              `${rel(f)}:${i + 1}  text-${hue}-{1xx..4xx} without a paired text-${hue}-{6xx..9xx} for light mode\n` +
              `    ${line.trim().slice(0, 160)}`,
            );
          }
        }
      });
    }
    expect(
      offenders,
      `Light Tailwind text shades (1xx..4xx) are designed for dark backgrounds.\n` +
        `On the site's default white background they fall below WCAG AA (4.5:1).\n\n` +
        `Fix: pair the light shade with a dark sibling so light mode reads correctly.\n` +
        `  Before: text-emerald-300\n` +
        `  After:  text-emerald-700 dark:text-emerald-300\n\n` +
        offenders.join('\n'),
    ).toEqual([]);
  });
});

// ─── 3. SPACING & SECTION SEPARATION ───────────────────────────────────────

describe('design-system: spacing', () => {
  // 3a. Every routed page wraps its top-level content in the canonical
  // `container py-12 md:py-16` shell. Pages with bespoke heros are exempt.
  const CONTAINER_SHELL_EXEMPT = new Set<string>([
    'pages/Index.tsx',          // custom multi-section hero
    'pages/Discovery.tsx',      // sticky filter bar + tabs, custom shell
    'pages/Share.tsx',          // assessment summary, custom centering
    'pages/NotFound.tsx',       // full-screen vertical center
    'pages/PersonaPage.tsx',    // already uses container py-12 md:py-16 max-w-4xl
    'pages/Jobs.tsx',           // max-w-7xl data-table layout — wider than standard container
    'pages/OpenCalls.tsx',      // custom layout without standard container shell
  ]);

  const CONTAINER_SHELL_RE = /\bcontainer\s+py-12\s+md:py-16\b/;

  it('every routed page uses the canonical `container py-12 md:py-16` shell', () => {
    const offenders: string[] = [];
    for (const f of pageTsx) {
      if (CONTAINER_SHELL_EXEMPT.has(rel(f))) continue;
      const src = readFileSync(f, 'utf8');
      if (!CONTAINER_SHELL_RE.test(src)) offenders.push(rel(f));
    }
    expect(
      offenders,
      `Pages should share the same outer rhythm: \`<div className="container py-12 md:py-16">\`.\n` +
        `If a page intentionally deviates, add it to CONTAINER_SHELL_EXEMPT with a comment.\n\n` +
        offenders.join('\n'),
    ).toEqual([]);
  });
});

// ─── 4. PAGE CHROME ────────────────────────────────────────────────────────

describe('design-system: page chrome', () => {
  // 4a. Every page imports Layout so the header/footer wrap is consistent.
  // NotFound is the documented exception.
  const LAYOUT_EXEMPT = new Set<string>(['pages/NotFound.tsx']);

  it('every page wraps content in <Layout>', () => {
    const offenders: string[] = [];
    for (const f of pageTsx) {
      if (LAYOUT_EXEMPT.has(rel(f))) continue;
      const src = readFileSync(f, 'utf8');
      const importsLayout = /from\s+['"]@\/components\/layout['"]/.test(src);
      const usesLayout = /<Layout\b/.test(src);
      if (!importsLayout || !usesLayout) {
        offenders.push(`${rel(f)}  (importsLayout=${importsLayout} usesLayout=${usesLayout})`);
      }
    }
    expect(
      offenders,
      `Every routed page must wrap in <Layout> so header/footer chrome stays uniform.\n\n` +
        offenders.join('\n'),
    ).toEqual([]);
  });
});

// ─── 5. NAVIGATION ─────────────────────────────────────────────────────────

describe('design-system: navigation', () => {
  // 5a. Every path in the Header's navLinks resolves to a Route in App.tsx.
  // We parse the literal nav-link paths and assert App.tsx declares a Route
  // with that pathname.
  it('every Header navLink resolves to a Route declared in App.tsx', () => {
    const headerSrc = readFileSync(HEADER_TSX, 'utf8');
    const appSrc = readFileSync(APP_TSX, 'utf8');

    // Capture all path values from the navLinks array literal in Header.tsx.
    // Form: `path: '/discovery?section=opencalls'` — we want just `/discovery`.
    const navPaths = new Set<string>();
    for (const m of headerSrc.matchAll(/\bpath:\s*['"]([^'"]+)['"]/g)) {
      const [base] = m[1].split('?');
      if (base.startsWith('/')) navPaths.add(base);
    }

    // Capture all Route paths declared in App.tsx.
    const routePaths = new Set<string>();
    for (const m of appSrc.matchAll(/<Route\s+path=['"]([^'"]+)['"]/g)) {
      routePaths.add(m[1]);
    }

    const missing = [...navPaths].filter((p) => !routePaths.has(p));
    expect(
      missing,
      `Header navLink paths must each have a matching <Route> in App.tsx ` +
        `(otherwise the link 404s).\n\n` +
        `Missing routes: ${missing.join(', ')}\n` +
        `Declared routes: ${[...routePaths].join(', ')}`,
    ).toEqual([]);
  });
});

// ─── 6. DESIGN-TOKEN INTEGRITY ─────────────────────────────────────────────

describe('design-system: token integrity', () => {
  // 6a. index.css must declare the heading utilities the rest of the codebase
  // assumes. If someone deletes a utility, this fails before the missing
  // class silently renders as un-styled text.
  it('index.css declares the heading + body typography utilities', () => {
    const css = readFileSync(INDEX_CSS, 'utf8');
    const required = [
      '.heading-display',
      '.heading-display-xl',
      '.heading-serif',
      '.heading-serif-sm',
      '.heading-xl',
      '.heading-lg',
      '.heading-md',
      '.text-body',
      '.text-body-sm',
      '.text-small',
      '.tag-label',
      '.tag-filled',
      '.section-marker',
    ];
    const missing = required.filter((sel) => !css.includes(sel));
    expect(
      missing,
      `index.css is missing typography utilities the rest of the codebase uses:\n  ${missing.join('\n  ')}`,
    ).toEqual([]);
  });
});

// ─── 7. HUB SHELL INTEGRITY ─────────────────────────────────────────────────

describe('design-system: hub tabs', () => {
  // All domain hub components that wrap <HubShell views={[...]}>. Extend when
  // a new hub is added. Each entry is relative to COMPONENTS_DIR.
  const HUB_FILES = [
    'ai-life-sciences/AiLifeSciencesHub.tsx',
    'oncology/OncologyHub.tsx',
    'medical-tourism/MedicalTourismHub.tsx',
    'process-mining/ProcessMiningHub.tsx',
  ];

  // Extracts id: '...' or id: "..." values from a TSX source.
  // Scoped to the views prop by ignoring anything before `views={[`.
  function extractViewIds(src: string): string[] {
    const viewsStart = src.indexOf('views={[');
    if (viewsStart === -1) return [];
    const viewsSection = src.slice(viewsStart);
    const ids: string[] = [];
    for (const m of viewsSection.matchAll(/\bid:\s*['"]([^'"]*)['"]/g)) {
      ids.push(m[1]);
    }
    return ids;
  }

  function extractViewLabels(src: string): string[] {
    const viewsStart = src.indexOf('views={[');
    if (viewsStart === -1) return [];
    const viewsSection = src.slice(viewsStart);
    const labels: string[] = [];
    for (const m of viewsSection.matchAll(/\blabel:\s*['"]([^'"]*)['"]/g)) {
      labels.push(m[1]);
    }
    return labels;
  }

  it('every hub declares at least one view with id and label', () => {
    const offenders: string[] = [];
    for (const relPath of HUB_FILES) {
      const full = join(COMPONENTS_DIR, relPath);
      if (!existsSync(full)) {
        offenders.push(`${relPath} — FILE NOT FOUND`);
        continue;
      }
      const src = readFileSync(full, 'utf8');
      const ids = extractViewIds(src);
      const labels = extractViewLabels(src);
      if (ids.length === 0)
        offenders.push(`${relPath} — no view ids found (views={[...]} missing or empty?)`);
      if (labels.length === 0)
        offenders.push(`${relPath} — no view labels found`);
      if (ids.length !== labels.length)
        offenders.push(`${relPath} — id count (${ids.length}) ≠ label count (${labels.length})`);
    }
    expect(
      offenders,
      `Hub files must declare at least one view with both id and label.\n\n` +
        offenders.join('\n'),
    ).toEqual([]);
  });

  it('no hub has duplicate view ids', () => {
    const offenders: string[] = [];
    for (const relPath of HUB_FILES) {
      const full = join(COMPONENTS_DIR, relPath);
      if (!existsSync(full)) continue;
      const src = readFileSync(full, 'utf8');
      const ids = extractViewIds(src);
      const seen = new Set<string>();
      for (const id of ids) {
        if (seen.has(id))
          offenders.push(`${relPath} — duplicate view id: '${id}'`);
        seen.add(id);
      }
    }
    expect(
      offenders,
      `HubShell uses view.id as the Tabs value key — duplicate ids cause ` +
        `two tabs to share state and one never renders.\n\n` +
        offenders.join('\n'),
    ).toEqual([]);
  });

  it('no hub view has an empty id or empty label', () => {
    const offenders: string[] = [];
    for (const relPath of HUB_FILES) {
      const full = join(COMPONENTS_DIR, relPath);
      if (!existsSync(full)) continue;
      const src = readFileSync(full, 'utf8');
      const ids = extractViewIds(src);
      const labels = extractViewLabels(src);
      ids.forEach((id, i) => {
        if (!id.trim())
          offenders.push(`${relPath} — view[${i}] has empty id`);
      });
      labels.forEach((label, i) => {
        if (!label.trim())
          offenders.push(`${relPath} — view[${i}] has empty label`);
      });
    }
    expect(
      offenders,
      `Empty id causes the tab to never be selectable. ` +
        `Empty label renders a blank tab trigger.\n\n` +
        offenders.join('\n'),
    ).toEqual([]);
  });
});

// ─── 8. PAGE HEADER CONSISTENCY ─────────────────────────────────────────────

describe('design-system: page headers', () => {
  // 8a. Every page that uses <PageHeader> must pass a subtitle prop.
  //     Subtitle is the one-sentence description that sets context for the
  //     visitor. Pages without subtitle are exempt if they have a deliberate
  //     reason (dynamic content assembled from data, not static strings).
  const SUBTITLE_EXEMPT = new Set<string>([
    'pages/Share.tsx',         // assessment result — content is dynamic, no static subtitle
    'pages/NotFound.tsx',      // 404 page — no PageHeader
    'pages/Index.tsx',         // custom hero — no PageHeader
    'pages/FoundersDevRel.tsx',// title is self-explanatory; tabs immediately show the two datasets
  ]);

  it('every PageHeader has a subtitle prop', () => {
    const offenders: string[] = [];
    for (const f of pageTsx) {
      if (SUBTITLE_EXEMPT.has(rel(f))) continue;
      const src = readFileSync(f, 'utf8');
      if (!/<PageHeader\b/.test(src)) continue; // no PageHeader → not applicable
      // Check that every <PageHeader ...> block contains subtitle=
      // We look for PageHeader blocks without subtitle by scanning
      // the string between consecutive <PageHeader and the closing />
      const blocks = src.split('<PageHeader');
      for (let i = 1; i < blocks.length; i++) {
        const block = blocks[i].split('/>')[0];
        if (!/\bsubtitle\s*=/.test(block)) {
          offenders.push(`${rel(f)} — <PageHeader> missing subtitle prop`);
        }
      }
    }
    expect(
      offenders,
      `PageHeader subtitle is the one-sentence context line visible below the title.\n` +
        `Add a subtitle, or add the page to SUBTITLE_EXEMPT with a comment.\n\n` +
        offenders.join('\n'),
    ).toEqual([]);
  });

  // 8b. The "Back to Domains" button in Directory.tsx must use the
  //     t('nav.domains') translation key — not a hardcoded "Directory" string.
  //     This prevents label drift when the nav label is updated.
  it('Directory back-button uses t(\'nav.domains\') not hardcoded "Directory"', () => {
    const src = readFileSync(join(PAGES_DIR, 'Directory.tsx'), 'utf8');
    expect(src).not.toMatch(/Back to Directory/);
    expect(src).toMatch(/nav\.domains/);
  });
});

// ─── 9. FILTER CHIP ↔ DATA MARK COLOR CONTRACT ──────────────────────────────
//
// When a component renders categorical filter chips (buttons that filter a
// visualisation by category) AND colors those categories in the visualisation,
// BOTH must derive their color from the SAME exported map. Duplicating colors
// in two places (e.g. a TUMOR_EMOJI constant in the component vs ONCO_TUMOR_META
// in the data file) causes silent drift — the chip shows one hue, the bubble
// another.
//
// Rule: a TSX file that imports a categorical COLOR map from a data module
// must NOT also declare a local Record/object whose keys overlap with that map.
// Instead the component must derive the chip color directly from the imported map.
//
// Currently enforced for oncology/LandscapeView.tsx and the ONCO_TUMOR_META map.
// Extend CHIP_COLOR_PAIRS when new domain hubs adopt the same pattern.

describe('design-system: filter chip ↔ data mark color contract', () => {
  // Each pair: { component file (relative to src/), data export that owns colors }
  const CHIP_COLOR_PAIRS = [
    {
      component: 'components/oncology/LandscapeView.tsx',
      // The canonical color map for this domain.
      canonicalExport: 'ONCO_TUMOR_META',
      // Local Record declarations whose keys might duplicate the canonical map.
      // If any of these strings appear as a top-level `const XXXXXX` in the
      // component file it means the author introduced a shadow map.
      forbiddenLocalMaps: ['TUMOR_EMOJI', 'TUMOR_COLORS', 'TUMOR_META'],
    },
  ];

  it('filter chip color maps are imported from the data module, not redeclared locally', () => {
    const offenders: string[] = [];
    for (const pair of CHIP_COLOR_PAIRS) {
      const full = join(PROJECT_ROOT, pair.component);
      if (!existsSync(full)) {
        offenders.push(`${pair.component} — FILE NOT FOUND`);
        continue;
      }
      const src = stripCommentsOnly(readFileSync(full, 'utf8'));

      // Must import the canonical map.
      if (!src.includes(pair.canonicalExport)) {
        offenders.push(
          `${pair.component} — does not import '${pair.canonicalExport}'. ` +
            `Filter chip colors must derive from the canonical data export.`,
        );
      }

      // Must NOT re-declare a local shadow map.
      for (const forbidden of pair.forbiddenLocalMaps) {
        // Match: `const FORBIDDEN` or `const FORBIDDEN:` at any indentation.
        if (new RegExp(`\\bconst\\s+${forbidden}\\b`).test(src)) {
          offenders.push(
            `${pair.component} — declares local '${forbidden}'. ` +
              `This duplicates '${pair.canonicalExport}' and will drift. ` +
              `Remove it and read from the canonical map instead.`,
          );
        }
      }
    }
    expect(
      offenders,
      `Filter chip colors must come from the same source as the data marks they filter.\n` +
        `Redeclaring a local color/emoji map next to an imported canonical map causes\n` +
        `silent drift (chip hue ≠ bubble hue). Fix: remove the local map and read\n` +
        `from the canonical data export.\n\n` +
        offenders.join('\n'),
    ).toEqual([]);
  });
});
