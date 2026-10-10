// nav-overview.spec.ts ──────────────────────────────────────────────────────
//
// "Domains" and "Founder Toolkit" in the desktop header are both a link and a
// dropdown (src/components/layout/NavDropdown.tsx):
//   • clicking the label (or Enter) opens the section's overview page;
//   • hovering it (or Space / ArrowDown) opens the sub-section menu.
// History: the labels were once menu-only buttons, so /directory was
// unreachable from the desktop header; then an "Overview" item was added to
// the menu, which the owner rejected in favour of the label itself linking.
// Also checks the Domains order (newest LAST_UPDATED first) and that menu
// text starts at the menu's left edge (it once rendered centred).
// ────────────────────────────────────────────────────────────────────────────

import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4173';

const SECTIONS = [
  { label: /^Domains/, path: '/directory', heading: /Domains/, firstItemHref: /\/directory\?domain=/ },
  { label: /^Founder Toolkit/, path: '/founders', heading: /founder needs to know/i, firstItemHref: /\/founders\/markets/ },
];

test.use({ viewport: { width: 1280, height: 800 } });

test.beforeEach(async ({ context }) => {
  await context.route(/googletagmanager|google-analytics|cloudflareinsights/, (r) => r.abort());
});

const navLink = (page: Page, label: RegExp) => page.locator('header nav').getByRole('link', { name: label });

for (const s of SECTIONS) {
  test(`clicking "${s.label.source.slice(1)}" opens ${s.path}`, async ({ page }) => {
    await page.goto(`${BASE_URL}/about`);
    await navLink(page, s.label).click();
    await expect(page).toHaveURL(new RegExp(`${s.path}$`));
    await expect(page.locator('h1').first()).toHaveText(s.heading);
    await expect(page.getByRole('menu')).toHaveCount(0);
  });

  test(`hovering "${s.label.source.slice(1)}" opens its menu, and a menu item navigates`, async ({ page }) => {
    await page.goto(`${BASE_URL}/about`);
    await navLink(page, s.label).hover();
    const items = page.getByRole('menuitem');
    await expect(items.first()).toBeVisible();
    await expect(items.filter({ hasText: /^Overview/ })).toHaveCount(0);
    await expect(items.first()).toHaveAttribute('href', s.firstItemHref);

    // Moving the pointer from the label into the menu keeps it open.
    await items.first().hover();
    await items.first().click();
    await expect(page).toHaveURL(s.firstItemHref);
  });
}

test('keyboard: ArrowDown opens the menu, Enter on the label opens the overview', async ({ page }) => {
  await page.goto(`${BASE_URL}/about`);
  const domains = navLink(page, /^Domains/);
  await domains.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem').first()).toBeVisible();
  await page.keyboard.press('Escape');
  await domains.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/directory$/);
});

test('Domains menu is left-aligned and sorted by last update', async ({ page }) => {
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

  await page.goto(`${BASE_URL}/about`);
  await navLink(page, /^Domains/).hover();
  const items = page.getByRole('menuitem');
  await expect(items.first()).toBeVisible();
  const names = (await items.evaluateAll((els) => els.map((el) => el.querySelector('span')?.textContent ?? ''))).map(
    (t) => t.replace(/\s*\d+$/, '').trim(),
  );
  expect(names).toEqual(expected);

  const menu = await page.getByRole('menu').boundingBox();
  for (const left of await items.evaluateAll((els) =>
    els.map((el) => (el.firstElementChild as HTMLElement).getBoundingClientRect().left),
  )) {
    expect(left - menu!.x, 'menu item text should start at the left edge').toBeLessThan(20);
  }
});
