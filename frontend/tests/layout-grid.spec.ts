// layout-grid.spec.ts ───────────────────────────────────────────────────────
//
// Page gutters and the left grid line, measured in a real browser.
//
// Twice these were "set" in code and silently not applied:
//   • tailwind.config.ts asked for 24px/32px container gutters from sm/lg, but
//     Tailwind drops container.padding breakpoints that aren't in
//     container.screens, so every width shipped 16px.
//   • `container max-w-3xl` on Privacy/Terms/Contact/persona pages overrode the
//     container's own max-width and centred the column, so headings sat
//     250-360px right of the logo.
// This test checks the rendered result, not the config.
// ────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4173';

const ROUTES = [
  '/', '/directory', '/directory?domain=oncology', '/directory?domain=biosecurity', '/discovery',
  '/context', '/about', '/contact', '/privacy', '/terms', '/jobs', '/open-calls', '/founders',
  '/founders/markets', '/founders/architectures', '/founders/tech', '/founders/dead-valley',
  '/events', '/news', '/data',
];
// Retired persona URLs (including /patient) render the standalone 404 page,
// which intentionally has no header or shared page grid.

// Viewport width → expected .container side padding (src/index.css).
const WIDTHS: [number, number][] = [
  [390, 16],
  [800, 24],
  [1440, 32],
  [1920, 32],
];

for (const [width, gutter] of WIDTHS) {
  test(`gutters and left grid line at ${width}px`, async ({ page, context }) => {
    test.setTimeout(120_000);
    await context.route(/googletagmanager|google-analytics|cloudflareinsights/, (r) => r.abort());
    await page.setViewportSize({ width, height: 900 });
    const problems: string[] = [];

    for (const route of ROUTES) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
      await expect(page.locator('header a').first(), `${route}: header logo`).toBeVisible();
      const m = await page.evaluate(() => {
        const containers = [...document.querySelectorAll<HTMLElement>('.container')].map((el) => {
          const cs = getComputedStyle(el);
          return { pl: parseFloat(cs.paddingLeft), pr: parseFloat(cs.paddingRight), maxW: cs.maxWidth, cls: el.className };
        });
        const logo = document.querySelector('header a')!.getBoundingClientRect().left;
        const h1 = document.querySelector('main h1, #root h1');
        return { containers, logo, h1: h1 ? h1.getBoundingClientRect().left : null };
      });

      for (const c of m.containers) {
        if (c.pl !== gutter || c.pr !== gutter) {
          problems.push(`${route}: .container padding ${c.pl}/${c.pr}px, expected ${gutter}px  (class="${c.cls}")`);
        }
        if (width >= 1400 && c.maxW !== '1400px') {
          problems.push(`${route}: .container max-width ${c.maxW}, expected 1400px  (class="${c.cls}")`);
        }
      }
      if (m.h1 === null) problems.push(`${route}: no h1`);
      else if (Math.abs(m.h1 - m.logo) > 1) {
        problems.push(`${route}: h1 starts at ${Math.round(m.h1)}px, logo at ${Math.round(m.logo)}px`);
      }
    }

    expect(problems, problems.join('\n')).toEqual([]);
  });
}
