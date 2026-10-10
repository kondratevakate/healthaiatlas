// nav-overview.spec.ts ──────────────────────────────────────────────────────
//
// On desktop, "Domains" and "Founder Toolkit" in the header are buttons that
// open a dropdown (AGENTS.md hard rule #4), so they can't also be links. The
// section's overview page must therefore be the first item of each dropdown.
// It once wasn't for Domains, which left /directory unreachable from the
// header on desktop.
// ────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';

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
