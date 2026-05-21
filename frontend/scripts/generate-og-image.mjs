// Rasterize frontend/public/og-image.svg → frontend/public/og-image.png at 1200×630.
//
// Why: LinkedIn, X, Slack, and many FB previewers do not render SVG OG
// images. A PNG is required for reliable social previews. We keep the SVG
// as the source of truth and regenerate the PNG from it.
//
// Usage (from frontend/):
//   node scripts/generate-og-image.mjs
//
// Requires Playwright's chromium browser to be installed. If it isn't,
// install it once with:
//   npx playwright install chromium

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FRONTEND = resolve(__dirname, '..');

const SVG_PATH = resolve(FRONTEND, 'public/og-image.svg');
const PNG_PATH = resolve(FRONTEND, 'public/og-image.png');

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
await page.goto(`file://${SVG_PATH.replace(/\\/g, '/')}`);
// Wait for fonts to settle. The SVG references system fonts so this is fast.
await page.waitForLoadState('networkidle');
await page.screenshot({ path: PNG_PATH, fullPage: false, omitBackground: false });
await browser.close();

console.log(`Wrote ${PNG_PATH}`);
