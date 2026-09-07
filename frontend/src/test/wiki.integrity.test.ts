// wiki.integrity.test.ts ────────────────────────────────────────────────────
//
// The wiki accepts pull requests from outside contributors, so the guard rails
// have to be mechanical rather than social. These tests fail the PR before a
// malformed or unevidenced article can reach production.
//
// The loader itself throws on malformed frontmatter at module load — importing
// it here is therefore already a smoke test of the whole corpus.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { wikiArticles, getWikiArticle, wikiArticlesByTag, wikiEditUrl } from '@/lib/wiki';

const CONTENT_DIR = join(__dirname, '..', 'content', 'wiki');

describe('wiki: corpus loads', () => {
  it('every .md file in src/content/wiki becomes an article', () => {
    const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'));
    expect(files.length).toBeGreaterThan(0);
    expect(wikiArticles.length).toBe(files.length);
  });

  it('slugs are unique and URL-safe', () => {
    const seen = new Set<string>();
    for (const a of wikiArticles) {
      expect(a.slug, `slug "${a.slug}" is not lowercase-kebab`).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(seen.has(a.slug), `duplicate slug: ${a.slug}`).toBe(false);
      seen.add(a.slug);
    }
  });

  it('getWikiArticle resolves every slug and rejects unknown ones', () => {
    for (const a of wikiArticles) expect(getWikiArticle(a.slug)?.title).toBe(a.title);
    expect(getWikiArticle('definitely-not-an-article')).toBeUndefined();
  });

  it('articles are sorted newest-updated first', () => {
    const dates = wikiArticles.map((a) => a.updated);
    expect([...dates].sort((x, y) => y.localeCompare(x))).toEqual(dates);
  });
});

describe('wiki: editorial standard', () => {
  it('every article has a non-trivial summary', () => {
    const offenders = wikiArticles
      .filter((a) => a.summary.length < 40)
      .map((a) => `${a.slug}: summary is ${a.summary.length} chars`);
    expect(
      offenders,
      'The summary is what a reader sees on the index card and in ⌘K results.\n' +
        'One full sentence, not a label.\n\n' + offenders.join('\n'),
    ).toEqual([]);
  });

  it('every article carries at least one tag', () => {
    const offenders = wikiArticles.filter((a) => a.tags.length === 0).map((a) => a.slug);
    expect(
      offenders,
      'Tags drive index filtering and the per-section reading lists ' +
        '(e.g. /biosecurity pulls tag "biosecurity").\n\n' + offenders.join('\n'),
    ).toEqual([]);
  });

  // AGENTS.md hard rule #1: never fabricate a source URL. We cannot verify a
  // URL resolves from a unit test, but we CAN block the shapes that are always
  // wrong — placeholder hosts and example domains that look like evidence.
  it('no placeholder or example URLs masquerading as evidence', () => {
    const BANNED = /https?:\/\/(?:example\.(?:com|org|net)|localhost|your-source-here|todo)/i;
    const offenders: string[] = [];
    for (const a of wikiArticles) {
      a.body.split('\n').forEach((line, i) => {
        if (BANNED.test(line)) offenders.push(`${a.slug}:${i + 1}  ${line.trim().slice(0, 120)}`);
      });
    }
    expect(
      offenders,
      'Placeholder URLs read as verified evidence and are not. Remove the link ' +
        'or cut the claim.\n\n' + offenders.join('\n'),
    ).toEqual([]);
  });

  it('internal links point at routes that exist', () => {
    const appSrc = readFileSync(join(__dirname, '..', 'App.tsx'), 'utf8');
    const routes = [...appSrc.matchAll(/<Route\s+path=['"]([^'"]+)['"]/g)].map((m) => m[1]);
    const staticRoutes = new Set(routes.filter((r) => !r.includes(':') && r !== '*'));

    const offenders: string[] = [];
    for (const a of wikiArticles) {
      for (const m of a.body.matchAll(/\]\((\/[^)\s]*)\)/g)) {
        const path = m[1].split('#')[0].split('?')[0].replace(/\/$/, '') || '/';
        // /wiki/<slug> resolves against the corpus, everything else against App.tsx.
        if (path.startsWith('/wiki/')) {
          const slug = path.slice('/wiki/'.length);
          if (!getWikiArticle(slug)) offenders.push(`${a.slug} → ${path} (no such article)`);
        } else if (!staticRoutes.has(path)) {
          offenders.push(`${a.slug} → ${path} (no such route in App.tsx)`);
        }
      }
    }
    expect(offenders, `Broken internal links:\n\n${offenders.join('\n')}`).toEqual([]);
  });
});

describe('wiki: wiring', () => {
  it('the biosecurity section has a reading list to render', () => {
    expect(wikiArticlesByTag('biosecurity').length).toBeGreaterThan(0);
  });

  it('edit URLs point at a file that actually exists', () => {
    for (const a of wikiArticles) {
      const url = wikiEditUrl(a.slug);
      expect(url).toContain(`/frontend/src/content/wiki/${a.slug}.md`);
      expect(existsSync(join(CONTENT_DIR, `${a.slug}.md`))).toBe(true);
    }
  });

  it('/wiki, /wiki/:slug and /biosecurity are routed', () => {
    const appSrc = readFileSync(join(__dirname, '..', 'App.tsx'), 'utf8');
    for (const path of ['/wiki', '/wiki/:slug', '/biosecurity']) {
      expect(appSrc, `missing <Route path="${path}">`).toContain(`path="${path}"`);
    }
  });
});
