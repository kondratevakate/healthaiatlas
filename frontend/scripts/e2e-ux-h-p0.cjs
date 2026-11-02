// E2E — roadmap H, P0: canonical Open Calls + Context pages.
//
// Run against the BUILT site (npm run preview). Verifies at 390px (mobile) and
// 1280px (desktop):
//   • /discovery?section=opencalls  → /open-calls   (query + hash preserved)
//   • /founders/context             → /context      (query preserved)
//   • /open-calls, /context, /discovery render normally
//   • zero console / page errors
//
// Usage: node scripts/e2e-ux-h-p0.cjs http://localhost:<port>

const { chromium } = require('playwright-core');

const BASE = process.argv[2] || 'http://localhost:4319';
const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 900 },
];

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

async function newPage(browser, vp, errors) {
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
  return { context, page };
}

async function goto(page, path) {
  await page.goto(BASE + path, { waitUntil: 'load' });
  // The redirect is client-side (react-router <Navigate replace>) — give the
  // SPA a beat to mount and settle before reading the URL.
  await page.waitForTimeout(1200);
}

function url(page) {
  const u = new URL(page.url());
  return u.pathname + u.search + u.hash;
}

async function run(vp) {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const errors = [];
  const { context, page } = await newPage(browser, vp, errors);

  // ── 1. Legacy Open Calls deep link redirects to the canonical page ────────
  await goto(page, '/discovery?section=opencalls');
  check(`[${vp.name}] /discovery?section=opencalls → /open-calls`, url(page) === '/open-calls', url(page));
  const openCallsText = await page.evaluate(() => document.body.innerText);
  check(
    `[${vp.name}] /open-calls shows the Open Calls UI`,
    /Open Calls 2026/i.test(openCallsText) && /Grants, fellowships, accelerators, prizes/i.test(openCallsText),
    openCallsText.slice(0, 80).replace(/\n/g, ' | '),
  );
  const cards = await page.locator('a[href^="http"], .border.rounded-lg, [class*="rounded-lg"]').count();
  check(`[${vp.name}] /open-calls renders cards`, cards > 0, `${cards} card-ish nodes`);

  // ── 2. Query string + hash survive the redirect ───────────────────────────
  await goto(page, '/discovery?section=opencalls&utm_source=linkedin#some-entry');
  check(
    `[${vp.name}] redirect keeps query + hash`,
    url(page) === '/open-calls?utm_source=linkedin#some-entry',
    url(page),
  );

  // ── 3. Legacy Context deep link redirects to the canonical page ───────────
  await goto(page, '/founders/context');
  check(`[${vp.name}] /founders/context → /context`, url(page) === '/context', url(page));
  const ctxText = await page.evaluate(() => document.body.innerText);
  check(
    `[${vp.name}] /context renders Context content`,
    /Context/i.test(ctxText) && ctxText.length > 500,
    `${ctxText.length} chars`,
  );

  await goto(page, '/founders/context?side=healthcare&region=uk');
  check(`[${vp.name}] /founders/context?region=uk → /context?region=uk`, url(page) === '/context?region=uk', url(page));
  const ukText = await page.evaluate(() => document.body.innerText);
  check(`[${vp.name}] /context?region=uk renders (not blank)`, ukText.length > 500, `${ukText.length} chars`);

  // A region value /context does not have a panel for must not blank the page.
  await goto(page, '/context?region=cn');
  const cnText = await page.evaluate(() => document.body.innerText);
  check(`[${vp.name}] /context?region=cn falls back, not blank`, cnText.length > 500, `${cnText.length} chars`);

  // ── 4. Canonical + newsfeed pages render normally ─────────────────────────
  for (const [path, needle] of [
    ['/open-calls', /Open Calls 2026/i],
    ['/context', /Context/i],
    ['/discovery', /Events/i],
  ]) {
    await goto(page, path);
    const t = await page.evaluate(() => document.body.innerText);
    const notFound = /couldn.t find/i.test(t);
    check(
      `[${vp.name}] ${path} renders normally`,
      url(page) === path && needle.test(t) && t.length > 400 && !notFound,
      `${url(page)} · ${t.length} chars${notFound ? ' · 404!' : ''}`,
    );
  }

  // ── 5. Discovery keeps its newsfeed tabs ──────────────────────────────────
  await goto(page, '/discovery');
  const tabs = await page.evaluate(() =>
    [...document.querySelectorAll('[role="tab"]')].map((n) => n.innerText.trim()).filter(Boolean),
  );
  const hasTabs = ['Events', 'Launches', 'Leaders', 'Prompts'].every((t) => tabs.includes(t));
  check(`[${vp.name}] /discovery keeps newsfeed tabs`, hasTabs, tabs.join(', '));
  const discText = await page.evaluate(() => document.body.innerText);
  check(`[${vp.name}] /discovery no longer renders Open Calls cards`, !/Open Calls 2026/i.test(discText));

  // ── 6. Nav: exactly one Context entry, no overlap/overflow (desktop) ──────
  if (vp.name === 'desktop') {
    const navLinks = await page.evaluate(() => {
      const nav = document.querySelector('header nav');
      if (!nav) return [];
      return [...nav.children].map((el) => {
        const r = el.getBoundingClientRect();
        return { text: el.innerText.trim().split('\n')[0], x: r.x, right: r.right, y: r.y, bottom: r.bottom };
      });
    });
    const contextItems = navLinks.filter((l) => l.text === 'Context');
    check('[desktop] nav surfaces exactly ONE Context item', contextItems.length === 1, JSON.stringify(navLinks.map((l) => l.text)));

    let overlap = null;
    for (let i = 1; i < navLinks.length; i++) {
      const a = navLinks[i - 1];
      const b = navLinks[i];
      if (b.x < a.right - 0.5 && b.y < a.bottom && a.y < b.bottom) overlap = `${a.text} / ${b.text}`;
    }
    check('[desktop] nav items do not overlap', overlap === null, overlap || `${navLinks.length} items`);

    const headerFits = await page.evaluate(() => {
      const nav = document.querySelector('header nav');
      return nav.scrollWidth <= nav.clientWidth + 1;
    });
    check('[desktop] nav fits without horizontal overflow', headerFits);
  } else {
    // Mobile: the hamburger must reveal Context exactly once.
    await page.locator('header button[aria-label="Toggle menu"]').click();
    await page.waitForTimeout(300);
    const mobileLinks = await page.evaluate(() =>
      [...document.querySelectorAll('header nav.md\\:hidden a')].map((a) => a.innerText.trim().split('\n')[0]),
    );
    const ctxCount = mobileLinks.filter((t) => t === 'Context').length;
    check('[mobile] menu surfaces exactly ONE Context item', ctxCount === 1, mobileLinks.join(', '));
  }

  // ── 7. Zero console / page errors ─────────────────────────────────────────
  check(`[${vp.name}] zero console/page errors`, errors.length === 0, errors.slice(0, 5).join(' | '));

  await context.close();
  await browser.close();
}

(async () => {
  for (const vp of VIEWPORTS) await run(vp);
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error('E2E crashed:', e);
  process.exit(2);
});
