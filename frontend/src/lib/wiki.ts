// Wiki loader ───────────────────────────────────────────────────────────────
//
// The Atlas wiki is a folder of Markdown files. Adding an article = adding one
// `.md` file to `src/content/wiki/` — no index to register, no route to wire.
// Vite's `import.meta.glob` picks the file up at build time and this module
// turns it into a typed record.
//
// Why Markdown-in-repo rather than a GitHub Wiki:
//   • Every change arrives as a pull request, so the Atlas source rules
//     (AGENTS.md hard rule #1 — never fabricate a source URL) get a review
//     gate before anything reaches production.
//   • Articles live on the Atlas domain, inherit the brand shell, and join
//     the ⌘K search index.
//   • Zero new dependencies: react-markdown is already in package.json.
//
// FAILURE POLICY: a malformed article throws at module load. That surfaces in
// `npm run build` and therefore in PR CI — loud and early — instead of
// rendering a blank card in production. Do not soften this to a console.warn.

export interface WikiArticle {
  /** URL segment, derived from the filename: `dna-synthesis-screening.md` → `dna-synthesis-screening`. */
  slug: string;
  title: string;
  /** One-sentence abstract shown on the index card and in search results. */
  summary: string;
  /** Lowercase topic tags. Drives index filtering and cross-links from domain pages. */
  tags: string[];
  /** ISO date (YYYY-MM-DD) of the last substantive edit. */
  updated: string;
  /** Display names of contributors, in order of contribution. */
  authors: string[];
  /** Markdown body with the frontmatter block removed. */
  body: string;
}

const REQUIRED_FIELDS = ['title', 'summary', 'updated'] as const;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parse the leading `---` frontmatter block.
 *
 * Deliberately a strict, tiny subset of YAML — scalars and inline `[a, b]`
 * arrays only. A full YAML parser would be another dependency and would let
 * contributors write structures this renderer cannot display.
 */
function parseFrontmatter(raw: string, file: string): { meta: Record<string, string | string[]>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`[wiki] ${file}: missing frontmatter. Every article must open with a --- block.`);
  }

  const [, block, body] = match;
  const meta: Record<string, string | string[]> = {};

  for (const line of block.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) {
      throw new Error(`[wiki] ${file}: cannot parse frontmatter line: ${line}`);
    }
    const [, key, rawValue] = kv;
    const value = rawValue.trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      meta[key] = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
    } else {
      meta[key] = value.replace(/^['"]|['"]$/g, '');
    }
  }

  return { meta, body: body.trim() };
}

function toArticle(path: string, raw: string): WikiArticle {
  const file = path.split('/').pop() ?? path;
  const slug = file.replace(/\.md$/, '');
  const { meta, body } = parseFrontmatter(raw, file);

  for (const field of REQUIRED_FIELDS) {
    if (typeof meta[field] !== 'string' || !meta[field]) {
      throw new Error(`[wiki] ${file}: frontmatter field \`${field}\` is required and must be a non-empty string.`);
    }
  }
  if (!ISO_DATE.test(meta.updated as string)) {
    throw new Error(`[wiki] ${file}: \`updated\` must be an ISO date (YYYY-MM-DD), got "${meta.updated}".`);
  }
  if (!body) {
    throw new Error(`[wiki] ${file}: article body is empty.`);
  }

  const asArray = (v: string | string[] | undefined): string[] =>
    Array.isArray(v) ? v : v ? [v] : [];

  return {
    slug,
    title: meta.title as string,
    summary: meta.summary as string,
    tags: asArray(meta.tags).map((t) => t.toLowerCase()),
    updated: meta.updated as string,
    authors: asArray(meta.authors),
    body,
  };
}

const modules = import.meta.glob('../content/wiki/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** Every article, newest edit first. */
export const wikiArticles: WikiArticle[] = Object.entries(modules)
  .map(([path, raw]) => toArticle(path, raw))
  .sort((a, b) => (a.updated === b.updated ? a.title.localeCompare(b.title) : b.updated.localeCompare(a.updated)));

export function getWikiArticle(slug: string): WikiArticle | undefined {
  return wikiArticles.find((a) => a.slug === slug);
}

/** Distinct tags across the corpus, ordered by frequency then alphabetically. */
export function wikiTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const a of wikiArticles) {
    for (const tag of a.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => (b.count - a.count) || a.tag.localeCompare(b.tag));
}

/** Articles carrying a given tag — used by domain pages to pull their reading list. */
export function wikiArticlesByTag(tag: string): WikiArticle[] {
  return wikiArticles.filter((a) => a.tags.includes(tag.toLowerCase()));
}

/** GitHub web-editor URL for an article — powers the "Edit this page" affordance. */
export function wikiEditUrl(slug: string): string {
  return `https://github.com/kondratevakate/healthaiatlas/edit/main/frontend/src/content/wiki/${slug}.md`;
}

export const WIKI_NEW_ARTICLE_URL =
  'https://github.com/kondratevakate/healthaiatlas/new/main/frontend/src/content/wiki';
