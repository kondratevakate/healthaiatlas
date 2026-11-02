// routes.test.tsx ────────────────────────────────────────────────────────────
//
// Guards against internal links that land on the NotFound page.
//
//   • Every internal path written in source (Link `to`, nav `path`, search
//     `url`, `href="/..."`, `navigate('/...')`) resolves to a <Route> in
//     App.tsx. Template parts (`${id}`) count as one dynamic segment.
//   • Every <loc> in public/sitemap.xml resolves to a <Route>.
//   • Legacy URLs shared outside the site (e.g. /landing on LinkedIn)
//     redirect to a real page and keep their query string and hash.
//
// Path checks are STATIC (fs + regex). The redirect check renders App.
// ────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = join(__dirname, '..');
const APP_TSX = join(SRC, 'App.tsx');
const SITEMAP = join(SRC, '..', 'public', 'sitemap.xml');
const TYPES_TS = join(SRC, 'types', 'index.ts');

// Known offenders. Each entry needs a reason; shrink this list, don't grow it.
const ALLOWLIST: Record<string, string> = {
  // Dynamic on UserPersona; the "persona routes" test below covers every value.
  'components/home/PersonaCard.tsx: /${persona}': 'checked per persona',
};

// ── Route table ────────────────────────────────────────────────────────────

const routePatterns = [...readFileSync(APP_TSX, 'utf8').matchAll(/<Route\s+path="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((p) => p !== '*');

const routeRegexes = routePatterns.map(
  (p) => new RegExp('^' + p.replace(/:[^/]+/g, '[^/]+') + '/?$'),
);

const resolvesToRoute = (pathname: string) => routeRegexes.some((re) => re.test(pathname));

// ── Link extraction ────────────────────────────────────────────────────────

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return name === 'test' ? [] : walk(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

// `to="/x"`, `to={'/x'}`, `to: '/x'`, `path: '/x'`, `url: \`/x/${id}\``,
// `href="/x"`, `navigate('/x')`.
const LINK_RE =
  /(?:\b(?:to|path|url|href)\s*[=:]\s*\{?\s*|\bnavigate\(\s*)(['"`])(\/[^'"`\s]*)\1/g;

const ASSET_RE = /\.(?:png|jpe?g|svg|ico|webp|pdf|xml|txt|json|css|js)$/i;

function toPathname(raw: string) {
  return raw.replace(/\$\{[^}]*\}/g, 'x').split(/[?#]/)[0] || '/';
}

const internalLinks = walk(SRC).flatMap((file) => {
  const text = readFileSync(file, 'utf8');
  return [...text.matchAll(LINK_RE)]
    .map((m) => ({ file: relative(SRC, file), raw: m[2], pathname: toPathname(m[2]) }))
    .filter((l) => !l.raw.startsWith('//') && !ASSET_RE.test(l.pathname));
});

describe('internal links resolve to a route', () => {
  it('finds routes and links to check', () => {
    expect(routePatterns.length).toBeGreaterThan(5);
    expect(internalLinks.length).toBeGreaterThan(20);
  });

  // Canonical pages (roadmap H, P0/P1a): Open Calls is /open-calls only and
  // Context is /founders/context only — Context lives INSIDE the Founder
  // Toolkit. The retired URLs still exist as redirects in App.tsx so
  // externally shared links survive, but nothing in src/ may *link* to them —
  // App.tsx is excluded because declaring the redirect route is the point.
  it('no source link points at a retired Open Calls / Context URL', () => {
    const retired = ['/discovery?section=opencalls', '/context'];
    const offenders = internalLinks
      .filter((l) => l.file !== 'App.tsx')
      .filter((l) =>
        retired.some(
          (r) => l.raw === r || l.raw.startsWith(`${r}?`) || l.raw.startsWith(`${r}#`),
        ),
      )
      .map((l) => `${l.file}: ${l.raw}`);
    expect(offenders).toEqual([]);
  });

  it('App.tsx declares both Context URLs — /founders/context canonical, /context redirecting into it', () => {
    const appSrc = readFileSync(APP_TSX, 'utf8');
    // Direction 1 (canonical): /founders/context renders the Context page.
    expect(routePatterns).toContain('/founders/context');
    expect(appSrc).toMatch(/path="\/founders\/context"\s+element=\{<FoundersContext\s*\/>\}/);
    // Direction 2 (retired URL): /context is still a Route, but it renders the
    // redirect element into the toolkit page, so old shared links never 404.
    expect(routePatterns).toContain('/context');
    expect(appSrc).toMatch(/RedirectToFoundersContext/);
    // /discovery?section=opencalls is caught inside the /discovery route.
    expect(appSrc).toMatch(/RedirectOpenCalls/);
  });

  it('App.tsx keeps a redirect for every retired URL', () => {
    const appSrc = readFileSync(APP_TSX, 'utf8');
    // /context is a declared Route that renders a redirect element.
    expect(routePatterns).toContain('/context');
    expect(appSrc).toMatch(/RedirectToFoundersContext/);
    // /discovery?section=opencalls is caught inside the /discovery route.
    expect(appSrc).toMatch(/RedirectOpenCalls/);
  });

  it('every internal link in src/ matches a <Route> in App.tsx', () => {
    const broken = internalLinks
      .filter((l) => !resolvesToRoute(l.pathname))
      .map((l) => `${l.file}: ${l.raw}`)
      .filter((key) => !(key in ALLOWLIST));
    expect(broken).toEqual([]);
  });

  it('every sitemap.xml <loc> matches a <Route>', () => {
    const locs = [...readFileSync(SITEMAP, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => new URL(m[1]).pathname,
    );
    expect(locs.length).toBeGreaterThan(0);
    expect(locs.filter((p) => !resolvesToRoute(p))).toEqual([]);
  });

  it('every UserPersona has a /<persona> route (PersonaCard links there)', () => {
    const union = readFileSync(TYPES_TS, 'utf8').match(/type UserPersona\s*=([^;]+);/);
    expect(union).not.toBeNull();
    const personas = [...union![1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
    expect(personas.length).toBeGreaterThan(0);
    expect(personas.filter((p) => !resolvesToRoute(`/${p}`))).toEqual([]);
  });
});

// ── Legacy redirects ───────────────────────────────────────────────────────

describe('legacy shared URLs redirect instead of 404', () => {
  beforeAll(() => {
    class StubObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
    const w = window as unknown as Record<string, unknown>;
    w.IntersectionObserver ??= StubObserver;
    w.ResizeObserver ??= StubObserver;
    window.scrollTo = () => {};
  });

  afterEach(() => {
    cleanup();
    window.history.pushState({}, '', '/');
  });

  it.each([
    ['/landing', ''],
    ['/landing/', ''],
    ['/landing?utm_source=linkedin#top', '?utm_source=linkedin'],
  ])('%s redirects to / and keeps the query', async (from, search) => {
    window.history.pushState({}, '', from);
    const { default: App } = await import('../App');
    const { container } = render(<App />);
    await waitFor(() => expect(window.location.pathname).toBe('/'));
    expect(window.location.search).toBe(search);
    expect(container.textContent).not.toMatch(/couldn.t find/i);
  }, 20_000); // first import of App is cold and slow under jsdom
});
