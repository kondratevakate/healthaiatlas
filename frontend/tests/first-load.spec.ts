// first-load.spec.ts ────────────────────────────────────────────────────────
//
// What a visitor on a phone actually sees while the site opens, measured on
// the production build (`vite preview`) with a throttled mobile connection.
// Unit tests can't catch this: in Oct 2026 the site passed every test while
// mobile visitors stared at a white screen for ~12 s (no gzip, one 2.2 MB
// bundle, render-blocking Google Fonts, a spinner that is not "content").
//
// Budgets (generous for slow CI runners; the Oct 2026 build missed all three):
//   • something meaningful is painted (FCP: the loader's site name) ≤ 1.5 s
//   • landing page content is on screen                            ≤ 3.5 s
//   • no font files from third-party hosts
// Run: npm run build && npx vite preview --port 4173 &
//      BASE_URL=http://127.0.0.1:4173 npx playwright test tests/first-load.spec.ts
// ────────────────────────────────────────────────────────────────────────────

import { test, expect, devices } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4173';

// Mid-range mobile: 1.6 Mbps down, 750 kbps up, 150 ms RTT.
const NETWORK = { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 };

const FCP_BUDGET_MS = 1500;
const CONTENT_BUDGET_MS = 3500;

test.use({ ...devices['iPhone 13'], browserName: 'chromium' });

test('landing page loads fast on a throttled phone, with a visible loader', async ({ page, context }) => {
  const origin = new URL(BASE_URL).host;
  const thirdPartyFonts: string[] = [];
  page.on('request', (r) => {
    const url = new URL(r.url());
    if (/\.(woff2?|ttf|otf)$/.test(url.pathname) && url.host !== origin) thirdPartyFonts.push(r.url());
  });
  // Analytics beacons are irrelevant here and unreachable in CI.
  await context.route(/googletagmanager|google-analytics|cloudflareinsights/, (r) => r.abort());

  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', NETWORK);

  const start = Date.now();
  await page.goto(`${BASE_URL}/`, { waitUntil: 'commit' });

  // Landing content: the hero heading rendered by React inside #root.
  await expect(page.locator('#root h1').first()).toBeVisible({ timeout: CONTENT_BUDGET_MS * 3 });
  const contentMs = Date.now() - start;

  const fcpMs = await page.evaluate(
    () => performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null,
  );

  test.info().annotations.push({ type: 'timing', description: `fcp=${fcpMs}ms content=${contentMs}ms` });

  expect(fcpMs, 'nothing contentful painted: a bare spinner is not content').not.toBeNull();
  expect(fcpMs!, `first contentful paint ${fcpMs}ms > ${FCP_BUDGET_MS}ms`).toBeLessThanOrEqual(FCP_BUDGET_MS);
  expect(contentMs, `landing content after ${contentMs}ms > ${CONTENT_BUDGET_MS}ms`).toBeLessThanOrEqual(CONTENT_BUDGET_MS);
  expect(thirdPartyFonts, 'fonts must be self-hosted').toEqual([]);

  // The boot overlay is gone once the page is up.
  await expect(page.locator('#boot-loader')).toHaveCount(0, { timeout: 2000 });
});
