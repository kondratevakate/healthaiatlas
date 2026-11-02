// E2E — roadmap H, P1a: Context moves INSIDE the Founder Toolkit.
//
// Run against the BUILT site (npm run preview). Verifies at 390px (mobile) and
// 1280px (desktop):
//   • /context                      → /founders/context (query + hash kept)
//   • /context?region=uk#top        → /founders/context?region=uk#top
//   • /founders/context, ?region=cn, ?region=ch render (not blank)
//   • /founders/context?region=cn|ch show the China / Switzerland panels
//   • header surfaces Context ONLY inside the Founder Toolkit
//   • zero console / page errors
//
// Usage: node scripts/e2e-ux-h-p1.cjs http://localhost:<port>

const { chromium } = require('playwright-core');

const BASE = process.argv[2] || 'http://localhost:4321';
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
  await page.waitForTimeout(1500);
}

function url(page) {
  const u = new URL(page.url());
  return u.pathname + u.search + u.hash;
}

async function bodyText(page) {
  return page.evaluate(() => document.body.innerText);
}

async function run(vp) {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const errors = [];
  const { context, page } = await newPage(browser, vp, errors);

  // ── 1. Retired top-level /context redirects INTO the Founder Toolkit ──────
  await goto(page, '/context');
  check(`[${vp.name}] /context → /founders/context`, url(page) === '/founders/context', url(page));
  const ctxText = await bodyText(page);
  check(
    `[${vp.name}] /founders/context renders Context content`,
    /Context/i.test(ctxText) && ctxText.length > 500,
    `${ctxText.length} chars`,
  );

  // ── 2. Query string + hash survive the redirect ───────────────────────────
  await goto(page, '/context?region=uk#top');
  check(
    `[${vp.name}] /context?region=uk#top → /founders/context?region=uk#top`,
    url(page) === '/founders/context?region=uk#top',
    url(page),
  );
  const ukText = await bodyText(page);
  check(`[${vp.name}] /founders/context?region=uk renders (not blank)`, ukText.length > 500, `${ukText.length} chars`);

  await goto(page, '/context?utm_source=linkedin#top');
  check(
    `[${vp.name}] redirect keeps unrelated query + hash`,
    url(page) === '/founders/context?utm_source=linkedin#top',
    url(page),
  );

  // ── 3. Canonical page: every region panel renders, incl. cn + ch ──────────
  for (const [region, needle] of [
    ['cn', /NMPA|China/i],
    ['ch', /Swissmedic|Switzerland/i],
    ['uk', /NICE|MHRA|NHS/i],
    ['us', /FDA|CMS/i],
  ]) {
    await goto(page, `/founders/context?region=${region}`);
    const t = await bodyText(page);
    const notFound = /couldn.t find/i.test(t);
    check(
      `[${vp.name}] /founders/context?region=${region} renders its panel`,
      url(page) === `/founders/context?region=${region}` && t.length > 500 && needle.test(t) && !notFound,
      `${url(page)} · ${t.length} chars${notFound ? ' · 404!' : ''}`,
    );
  }

  await goto(page, '/founders/context');
  const defaultText = await bodyText(page);
  check(
    `[${vp.name}] /founders/context default view renders`,
    url(page) === '/founders/context' && defaultText.length > 500 && !/couldn.t find/i.test(defaultText),
    `${defaultText.length} chars`,
  );

  // ── 4. Founder Toolkit index links at the canonical URL ───────────────────
  await goto(page, '/founders');
  const tocHref = await page.evaluate(() => {
    const a = [...document.querySelectorAll('a')].find((n) => n.getAttribute('href') === '/founders/context');
    return a ? a.getAttribute('href') : null;
  });
  check(`[${vp.name}] /founders links to /founders/context`, tocHref === '/founders/context', String(tocHref));
  const retiredHref = await page.evaluate(() =>
    [...document.querySelectorAll('a')].some((n) => {
      const h = n.getAttribute('href') || '';
      return h === '/context' || h.startsWith('/context?') || h.startsWith('/context#');
    }),
  );
  check(`[${vp.name}] no /founders link points at the retired /context`, retiredHref === false);

  // ── 5. Nav: Context ONLY inside the Founder Toolkit ───────────────────────
  if (vp.name === 'desktop') {
    await goto(page, '/');
    const navLabels = await page.evaluate(() => {
      const nav = document.querySelector('header nav');
      if (!nav) return [];
      return [...nav.children].map((el) => {
        const r = el.getBoundingClientRect();
        return { text: el.innerText.trim().split('\n')[0], x: r.x, right: r.right, y: r.y, bottom: r.bottom };
      });
    });
    const topLevelContext = navLabels.filter((l) => l.text === 'Context');
    check(
      '[desktop] no top-level Context nav item',
      topLevelContext.length === 0,
      JSON.stringify(navLabels.map((l) => l.text)),
    );

    // Hover the Founder Toolkit label → dropdown lists Context exactly once.
    await page.locator('header nav a', { hasText: 'Founder Toolkit' }).first().hover();
    await page.waitForTimeout(500);
    let items = await page.evaluate(() =>
      [...document.querySelectorAll('[role="menuitem"]')].map((n) => n.innerText.trim().split('\n')[0]),
    );
    if (items.length === 0) {
      // Fallback: keyboard-open the Radix trigger (hover can be swallowed).
      await page.locator('header nav a', { hasText: 'Founder Toolkit' }).first().focus();
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(500);
      items = await page.evaluate(() =>
        [...document.querySelectorAll('[role="menuitem"]')].map((n) => n.innerText.trim().split('\n')[0]),
      );
    }
    const ctxInDropdown = items.filter((t) => t === 'Context');
    check(
      '[desktop] Founder Toolkit dropdown contains Context exactly once',
      ctxInDropdown.length === 1,
      items.join(', ') || 'dropdown empty',
    );
    const dropdownHref = await page.evaluate(() => {
      const a = [...document.querySelectorAll('[role="menuitem"]')].find(
        (n) => n.innerText.trim().split('\n')[0] === 'Context',
      );
      return a ? a.getAttribute('href') : null;
    });
    check('[desktop] dropdown Context → /founders/context', dropdownHref === '/founders/context', String(dropdownHref));

    // Nav must not overflow / overlap after the change.
    let overlap = null;
    for (let i = 1; i < navLabels.length; i++) {
      const a = navLabels[i - 1];
      const b = navLabels[i];
      if (b.x < a.right - 0.5 && b.y < a.bottom && a.y < b.bottom) overlap = `${a.text} / ${b.text}`;
    }
    check('[desktop] nav items do not overlap', overlap === null, overlap || `${navLabels.length} items`);
    const headerFits = await page.evaluate(() => {
      const nav = document.querySelector('header nav');
      return nav.scrollWidth <= nav.clientWidth + 1;
    });
    check('[desktop] nav fits without horizontal overflow', headerFits);
  } else {
    await goto(page, '/');
    await page.locator('header button[aria-label="Toggle menu"]').click();
    await page.waitForTimeout(400);
    const mobile = await page.evaluate(() => {
      const links = [...document.querySelectorAll('header nav a')];
      return links.map((a) => ({
        text: a.innerText.trim().split('\n')[0],
        href: a.getAttribute('href'),
        // Sub-menu items sit in the indented group under their parent.
        nested: !!a.closest('[class*="border-l-2"]'),
      }));
    });
    const ctxLinks = mobile.filter((l) => l.text === 'Context');
    check('[mobile] menu surfaces exactly ONE Context item', ctxLinks.length === 1, mobile.map((l) => l.text).join(', '));
    check(
      '[mobile] Context is nested inside the Founder Toolkit group',
      ctxLinks.length === 1 && ctxLinks[0].nested && ctxLinks[0].href === '/founders/context',
      JSON.stringify(ctxLinks),
    );
    const topLevelContext = mobile.filter(
      (l) => l.text === 'Context' && !l.nested,
    );
    check('[mobile] no top-level Context item', topLevelContext.length === 0);
  }

  // ── 6. Zero console / page errors ─────────────────────────────────────────
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
