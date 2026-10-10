// class-conflicts.spec.ts ───────────────────────────────────────────────────
//
// Catches classes that are asked for but silently ignored.
//
// If one element carries two Tailwind classes that set the same property
// (`items-center` + `items-start`, `p-2` + `px-4`, `text-left` + `text-center`),
// only one wins and nothing warns. `cn()` resolves such conflicts when
// classes are combined in code, but some paths skip it: Radix `asChild` /
// `Slot` concatenates parent and child classes as-is, and plain template
// strings do too. In Oct 2026 that left the header dropdowns centred while
// the code said `items-start text-left`.
//
// The test renders real pages in a browser, reads the class list of every
// element and runs it through tailwind-merge (the same resolver `cn()` uses).
// Any class tailwind-merge would drop is a class someone asked for that the
// page does not apply. It reports page, element and the dropped class.
// ────────────────────────────────────────────────────────────────────────────

import { test, expect, type Page } from '@playwright/test';
// Same resolver as cn(), including the project's custom text-* utilities.
import { twMerge } from '../src/lib/utils';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4173';

const ROUTES = [
  '/', '/directory', '/directory?domain=ai-life-sciences', '/directory?domain=oncology',
  '/directory?domain=process-mining', '/directory?domain=medical-tourism', '/directory?domain=biosecurity',
  '/discovery', '/context', '/about', '/contact', '/privacy', '/terms', '/jobs', '/open-calls',
  '/founders', '/founders/markets', '/founders/architectures', '/founders/tech', '/founders/dead-valley',
  '/founders/context', '/patient', '/doctor', '/business', '/startup', '/leader', '/no-such-page',
];

// Known conflicts that are intentional: the dropped class plus a fragment of the
// element's class attribute that identifies it. Each entry needs a reason;
// shrink this list, don't grow it.
const ALLOWLIST: { dropped: string; classIncludes: string; reason: string }[] = [
  {
    dropped: 'aria-selected:opacity-100',
    classIncludes: 'rdp-button',
    reason: 'shadcn Calendar: days outside the month are meant to be dimmer when selected (day_outside sets opacity-30)',
  },
];

const allowed = (dropped: string, cls: string) =>
  ALLOWLIST.some((a) => a.dropped === dropped && cls.includes(a.classIncludes));

type Conflict = { where: string; element: string; dropped: string; classAttr: string };

async function collect(page: Page, where: string): Promise<Conflict[]> {
  const elements = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[class]')).map((el) => ({
      cls: el.getAttribute('class') ?? '',
      tag: el.tagName.toLowerCase(),
      text: ((el as HTMLElement).innerText ?? el.textContent ?? '').trim().slice(0, 40),
    })),
  );
  const seen = new Set<string>();
  const out: Conflict[] = [];
  for (const { cls, tag, text } of elements) {
    const classes = cls.split(/\s+/).filter(Boolean);
    const kept = new Set(twMerge(cls).split(/\s+/));
    for (const c of new Set(classes)) {
      if (kept.has(c)) continue;
      const key = `${c} in ${cls.slice(0, 60)}`;
      if (allowed(c, cls) || seen.has(key)) continue;
      seen.add(key);
      out.push({ where, element: `<${tag}> "${text}"`, dropped: c, classAttr: cls });
    }
  }
  return out;
}

test.use({ viewport: { width: 1280, height: 900 } });

test('no element carries a Tailwind class that another class on it overrides', async ({ page, context }) => {
  test.setTimeout(180_000);
  await context.route(/googletagmanager|google-analytics|cloudflareinsights/, (r) => r.abort());
  const conflicts: Conflict[] = [];

  for (const route of ROUTES) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
    conflicts.push(...(await collect(page, route)));
  }

  // States that only exist after interaction: header dropdowns and the mobile menu.
  await page.goto(`${BASE_URL}/about`, { waitUntil: 'networkidle' });
  for (const name of [/Open Domains sub-sections/, /Open Founder Toolkit sub-sections/]) {
    await page.locator('header nav').getByRole('button', { name }).click();
    await page.getByRole('menu').waitFor();
    conflicts.push(...(await collect(page, `/about + ${name.source}`)));
    await page.keyboard.press('Escape');
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  const burger = page.locator('header button').last();
  await burger.click();
  conflicts.push(...(await collect(page, '/ + mobile menu')));

  const unique = new Map(conflicts.map((c) => [`${c.dropped} in ${c.classAttr.slice(0, 60)}`, c]));
  const report = [...unique.values()].map(
    (c) => `${c.where} ${c.element}: "${c.dropped}" is overridden\n    class="${c.classAttr}"`,
  );
  expect(report, `Classes asked for but silently ignored:\n${report.join('\n')}`).toEqual([]);
});
