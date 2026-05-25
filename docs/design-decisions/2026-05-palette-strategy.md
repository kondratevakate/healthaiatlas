# Palette strategy — May 2026

**Status:** Decided  
**Date:** 2026-05-25  
**Decider:** Kate (founder)  
**Scope:** `frontend/src/` — all component color usage

---

## Problem

Three facts in the codebase conflict with each other:

1. `tailwind.config.ts` declares named domain-color tokens (`green`, `pink`, `yellow`, `blue`, `orange`, `purple`) each mapping to `hsl(var(--X))`.

2. `index.css` does **not** define `--pink`, `--yellow`, `--orange`, `--blue`, `--green`, `--purple`. So any class that references them (`bg-pink`, `hover:border-pink`, `bg-yellow`, etc.) resolves to `hsl()` with an undefined argument — rendering transparent or inheriting. **These are silently broken right now.**

   Affected files:
   - `components/cards/ConferenceCard.tsx` — `bg-pink`, `bg-yellow`, `bg-orange`
   - `components/home/PersonaCard.tsx` — `hover:border-pink`, `group-hover:text-pink`, `hover:border-yellow`, `hover:border-orange`, `hover:border-blue`

3. `index.css:56` states the explicit design intent: `/* Monochrome grays for categories (no bright colors) */`.

The existing test (`design-system.test.ts`, rule 2b `RAW_PALETTE_RE`) does **not** catch this class of bug. The regex requires a numeric suffix (`bg-pink-500`) and misses named-token classes (`bg-pink`) entirely — a dead zone in test coverage.

---

## Decision: Option A — Traffic-lights only for status indicators

**Category differentiation (ConferenceCard, PersonaCard, domain hubs) uses NO color.**  
Differentiation is achieved through: icon, border style, label text, and position.

**Status indicators (ConfidenceBadge, RiskScoreCard, EvidenceLabel) may use semantic traffic-light tokens.**  
These are defined as `--success`, `--warning`, `--info` (and the existing `--destructive`) in `index.css`.

### Rationale

- `index.css:56` already states the brand rule: monochrome for categories.
- Bright category colors have zero semantic value — a pink badge for "meetup" vs a yellow badge for "workshop" conveys nothing the label doesn't already say.
- Named tokens (`--pink`, `--yellow` etc.) were declared in `tailwind.config.ts` without corresponding CSS variable definitions — they were aspirational, not implemented. Defining them now would legitimise a design direction that contradicts the existing brand rule.
- "Traffic-lights for status only" is the minimal, coherent fix: it resolves the broken rendering, removes the ambiguity, and aligns with the monochrome-first philosophy.

### What this is NOT

This is not a decision to make the site fully grayscale. `--primary` (the brand blue) stays. `shadcn/ui` semantic tokens (`bg-primary`, `text-muted-foreground`, `border-border`) are unaffected. Dark mode tokens are unaffected.

---

## Named-token cleanup

The domain-color entries in `tailwind.config.ts` (`green`, `pink`, `yellow`, `blue`, `orange`, `purple` and their `-light` variants) should be **removed** once all component references are migrated. Until then, leaving them in config is harmless — Tailwind just emits unused CSS utility classes.

`--gray` and `--gray-light` stay: they are defined in `index.css` and used by legitimate monochrome UI.

---

## Migration plan (follow-up PR)

### Step 0 — Add the missing test (no tsx/css changes)

Add a new rule to `design-system.test.ts` that catches broken named-token usage:

```
// Rule 2c: named-token classes (bg-pink, text-green, border-yellow, hover:border-blue ...)
// are only allowed if the corresponding CSS variable is defined in index.css.
//
// Pattern: matches bg-X, text-X, border-X, hover:border-X etc. where X is one of
// the domain tokens declared in tailwind.config.ts but NOT in index.css:
// pink | yellow | orange | blue | green | purple
```

This test should fail immediately on the current codebase (ConferenceCard + PersonaCard), confirming the bug is real, and become the regression guard after the fix.

### Step 1 — Define semantic status tokens in `index.css`

Add to `:root` and `.dark`:

```css
/* Status / traffic-light tokens — for evidence badges only, not for categories */
--success:     142 76% 36%;   /* green */
--success-fg:  0 0% 100%;
--warning:     38 92% 50%;    /* amber */
--warning-fg:  0 0% 10%;
--info:        217 91% 60%;   /* sky-blue */
--info-fg:     0 0% 100%;
/* --destructive already defined by shadcn */
```

Dark variants to be confirmed against contrast ratio (WCAG AA: 4.5:1 for text).

### Step 2 — Migrate `ConfidenceBadge`, `RiskScoreCard`, `EvidenceLabel` to semantic tokens

Replace raw Tailwind palette classes (`text-green-800 bg-green-50`, `text-yellow-800 bg-yellow-50`, `text-red-800 bg-red-50`) with:

- `high` → `bg-success/10 text-success`
- `medium` → `bg-warning/10 text-warning`
- `low` / `unverified` → `bg-destructive/10 text-destructive`

After migration, remove these files from `RAW_PALETTE_ALLOWLIST` in the test.

### Step 3 — Rewrite `ConferenceCard` type differentiation

Remove `typeColors` map. Replace with icon + border-width differentiation:

| Type        | Current (broken) | After               |
|-------------|------------------|---------------------|
| conference  | `bg-primary`     | keep (semantic)     |
| meetup      | `bg-pink`        | `border-l-4 border-border` + Zap icon |
| workshop    | `bg-yellow`      | `border-l-2 border-border` + Wrench icon |
| demo-day    | `bg-orange`      | `border-l-4 border-primary/40` + Rocket icon |

Exact icon/border choices are a UX call — the point is to remove color as the sole differentiator.

### Step 4 — Rewrite `PersonaCard` hover differentiation

Remove `colorClass` entries for `hover:border-pink`, `hover:border-yellow`, `hover:border-orange`, `hover:border-blue`.

All persona cards get a unified hover: `hover:border-foreground/30` (or `hover:border-primary/50`). Differentiation is through the icon already rendered per persona and the label text.

### Step 5 — Remove dead named tokens from `tailwind.config.ts`

Delete the `green`, `pink`, `yellow`, `blue`, `orange`, `purple` blocks. Keep `gray` and `gray-light`. Add `success`, `warning`, `info` mapped to the new CSS variables.

### Step 6 — Shrink or eliminate `RAW_PALETTE_ALLOWLIST`

After Steps 2–4, the allowlist should contain only:
- `components/ui/toast.tsx` (shadcn boilerplate — destructive variant, leave it)
- Any remaining components confirmed to need traffic-light colors with no feasible semantic-token equivalent

---

## Test coverage gap — immediate action

**Even before the migration PR**, the broken named-token bug should be caught by a test. The test does not require touching any component — it is a static analysis rule on class names vs. defined CSS variables.

Add to `design-system.test.ts` as rule **2c** (between the existing 2b and section 3):

```typescript
// 2c. Named-token classes that reference undefined CSS variables are silently
// broken (render as transparent). If bg-pink / text-yellow / border-orange
// appear in a component, the corresponding --pink / --yellow / --orange MUST
// be defined in index.css.
//
// Currently: these variables are NOT defined → ConferenceCard + PersonaCard
// are broken. This test documents the bug and becomes the regression guard.
const UNDEFINED_NAMED_TOKENS = ['pink', 'yellow', 'orange', 'blue', 'green', 'purple'];
const NAMED_TOKEN_CLASS_RE = new RegExp(
  `\\b(?:hover:|focus:|group-hover:)?(?:text|bg|border|ring|fill|stroke|from|to)-(?:${UNDEFINED_NAMED_TOKENS.join('|')})(?:[/-]|\\b)(?![0-9])`,
);

it('no named-token classes referencing undefined CSS variables', () => {
  const offenders: string[] = [];
  for (const f of allTsx) {
    const src = stripCommentsOnly(readFileSync(f, 'utf8'));
    const lines = src.split('\n');
    lines.forEach((line, i) => {
      if (NAMED_TOKEN_CLASS_RE.test(line)) {
        offenders.push(`${rel(f)}:${i + 1}  ${line.trim().slice(0, 140)}`);
      }
    });
  }
  expect(
    offenders,
    `Named-token classes (bg-pink, text-yellow, hover:border-orange …) reference ` +
      `CSS variables (--pink, --yellow, --orange …) that are not defined in index.css.\n` +
      `Either define the variable, or remove the class.\n\n` +
      offenders.join('\n'),
  ).toEqual([]);
});
```

This test will **fail on the current codebase** (which is correct — it documents the existing bug) and pass after Step 3 and Step 4 of the migration.

---

## Files changed in this decision doc PR

- `docs/design-decisions/2026-05-palette-strategy.md` — this file (new)

No `.tsx`, `.css`, or `.ts` files are modified in this PR. All code changes belong in the migration PR described above.
