// E2E — open-data download page (/data).
//
// Run against the BUILT site with the data export already generated
// (npm run build && npm run export:data && npm run preview).
// Verifies at 390px (mobile) and 1280px (desktop):
//   • /data renders: heading, row counts, "as of" date, licence, disclaimer,
//     takedown note linking to /contact
//   • every CSV / JSON download link resolves 200
//   • zero console / page errors
//
// Usage: node scripts/export/e2e-data-page.cjs http://localhost:<port>

const { chromium } = require('playwright-core');

const BASE = process.argv[2] || 'http://localhost:4173';
const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 900 },
];

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

async function run(vp) {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const errors = [];
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: vp.name === 'mobile',
    hasTouch: vp.name === 'mobile',
  });
  const page = await context.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

  await page.goto(`${BASE}/data`, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const text = await page.evaluate(() => document.body.innerText);

  check(`[${vp.name}] /data renders a heading`, /Open data/i.test(text), `${text.length} chars`);
  check(`[${vp.name}] /data shows the "as of" date`, /As of\s+20\d\d-\d\d-\d\d/.test(text));

  // Row counts: six datasets, each "<n> rows".
  const counts = [...text.matchAll(/(\d+)\s+rows/g)].map((m) => Number(m[1]));
  check(
    `[${vp.name}] /data lists row counts for 6 datasets`,
    counts.length === 6 && counts.every((n) => n > 0),
    counts.join(', '),
  );

  check(`[${vp.name}] licence note present`, /CC BY-NC 4\.0/.test(text));
  check(`[${vp.name}] "not medical advice" disclaimer present`, /Not medical advice/i.test(text));
  check(`[${vp.name}] "what is not included" note present`, /What is not included/i.test(text));

  const takedownHref = await page.evaluate(() => {
    const a = [...document.querySelectorAll('a')].find((el) => el.getAttribute('href') === '/contact');
    return a ? a.getAttribute('href') : null;
  });
  check(`[${vp.name}] takedown note links to /contact`, takedownHref === '/contact', String(takedownHref));

  // Every download link resolves 200 and is a real file.
  const links = await page.evaluate(() =>
    [...document.querySelectorAll('a[href*="/data/"]')]
      .map((a) => a.getAttribute('href'))
      .filter((h) => /\.(csv|json)$/.test(h || '')),
  );
  check(`[${vp.name}] 12 download links (6 datasets x CSV/JSON)`, links.length === 12, String(links.length));

  const bad = [];
  for (const href of links) {
    const res = await page.request.get(BASE + href);
    const okStatus = res.status() === 200;
    const body = await res.text();
    const looksReal = href.endsWith('.csv') ? body.split('\n').length > 1 : body.trim().startsWith('{');
    if (!okStatus || !looksReal) bad.push(`${href} -> ${res.status()} (${body.slice(0, 40)})`);
  }
  check(`[${vp.name}] every download link resolves 200 with real content`, bad.length === 0, bad.join('; '));

  // No overlap / overflow: the dataset rows must stack inside the viewport width.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(`[${vp.name}] no horizontal overflow`, overflow <= 1, `${overflow}px`);

  check(`[${vp.name}] zero console / page errors`, errors.length === 0, errors.join(' | '));

  await browser.close();
}

(async () => {
  for (const vp of VIEWPORTS) await run(vp);
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
})();
