// nav-overview.spec.ts ──────────────────────────────────────────────────────
//
// On desktop, "Domains" and "Founder Toolkit" in the header are buttons that
// open a dropdown (AGENTS.md hard rule #4), so they can't also be links. The
// section's overview page must therefore be the first item of each dropdown.
// It once wasn't for Domains, which left /directory unreachable from the
// header on desktop.
// ────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4173';

const SECTIONS = [
  { trigger: /Open Domains sub-sections/, path: '/directory', heading: /Domains/ },
  { trigger: /Open Founder Toolkit sub-sections/, path: '/founders', heading: /founder needs to know/i },
];

test.use({ viewport: { width: 1280, height: 800 } });

for (const s of SECTIONS) {
  test(`header dropdown leads to the ${s.path} overview`, async ({ page, context }) => {
    await context.route(/googletagmanager|google-analytics|cloudflareinsights/, (r) => r.abort());
    await page.goto(`${BASE_URL}/about`);

    await page.locator('header nav').getByRole('button', { name: s.trigger }).click();
    const items = page.getByRole('menuitem');
    await expect(items.first()).toContainText('Overview');

    await items.first().click();
    await expect(page).toHaveURL(new RegExp(`${s.path}$`));
    await expect(page.locator('h1').first()).toHaveText(s.heading);
  });
}

// Domains menu: newest-updated hub first (dates from LAST_UPDATED in
// src/data/constants.ts, ties keep the domains.ts order), and every item's
// text starts at the left edge of the menu (Radix Slot does not de-duplicate
// Tailwind classes, so layout classes on the inner Link once lost to the
// item's base items-center and the text rendered centred).
test('Domains menu is left-aligned and sorted by last update', async ({ page, context }) => {
  const src = (f: string) => readFileSync(join(HERE, '..', 'src', 'data', f), 'utf8');
  const updated = Object.fromEntries(
    [...src('constants.ts').matchAll(/^\s*'?([a-z-]+)'?: '(\d{4}-\d{2}-\d{2})',/gm)].map((m) => [m[1], m[2]]),
  );
  const hubs = [...src('domains.ts').matchAll(/id: '([a-z-]+)',\s*name: \{ en: '([^']+)'/g)]
    .map((m, i) => ({ id: m[1], name: m[2], i }))
    .filter((d) => d.id !== 'overview');
  const expected = [...hubs]
    .sort((a, b) => (updated[b.id] ?? '').localeCompare(updated[a.id] ?? '') || a.i - b.i)
    .map((d) => d.name);
  expect(expected.length).toBeGreaterThan(2);

  await context.route(/googletagmanager|google-analytics|cloudflareinsights/, (r) => r.abort());
  await page.goto(`${BASE_URL}/about`);
  await page.locator('header nav').getByRole('button', { name: /Open Domains sub-sections/ }).click();

  const items = page.getByRole('menuitem');
  await expect(items.first()).toContainText('Overview');
  const names = (
    await items.evaluateAll((els) => els.map((el) => el.querySelector('span')?.textContent ?? ''))
  )
    .slice(1)
    .map((t) => t.replace(/\s*\d+$/, '').trim());
  expect(names).toEqual(expected);

  const menu = await page.getByRole('menu').boundingBox();
  for (const box of await items.evaluateAll((els) =>
    els.map((el) => (el.firstElementChild as HTMLElement).getBoundingClientRect().left),
  )) {
    expect(box - menu!.x, 'menu item text should start at the left edge').toBeLessThan(20);
  }
});
