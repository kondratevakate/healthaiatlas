// AUTO-GENERATED pipeline step (Phase 0 pattern): parse Una's curated
// health-AI news feed (~/una/news.json, schema `una-news/v1`) into typed
// NewsItem objects for the static build.
//
// Design rules (same contract as unaOpenCalls.cjs / jobsExternal.cjs):
//  - LOCAL SOURCE ONLY: reads Una's emitted JSON on THIS machine; the
//    generated TS module is the only thing that ships. The source path is a
//    PARAMETER (--source / UNA_NEWS_SRC), never fetched by the client and
//    never committed raw.
//  - INCLUDE: rows that carry a date, an https url, a non-empty summary, a
//    kind in KIND_MAP and at least one topic in TOPIC_MAP.
//  - EXCLUDE: anything already present in openCallEntries.una.ts (a call with
//    a deadline is an OPPORTUNITY, not news — see ~/una/news_SCHEMA.md).
//  - HTTPS ONLY (Zero Trust): an http:// row is dropped, never rewritten.
//  - NO INVENTED DATA: a row without `verified_at` is dropped, not stamped
//    with today's date. Topics/labels are passed through as slugs; the UI
//    translates them (EN/AR), so nothing is paraphrased here.
//  - ABORT-BEFORE-TRUNCATE: if the source is missing, unreadable, the wrong
//    schema, or yields ZERO valid items, this script exits non-zero and does
//    NOT touch the existing module. An empty feed must never wipe the feed.
//
// Usage:
//   node scripts/ingest/unaNews.cjs
//   node scripts/ingest/unaNews.cjs --source=/path/to/news.json
//   node scripts/ingest/unaNews.cjs --source=/path/to/news.json --out=src/data/newsEntries.una.ts
const fs = require('fs');
const path = require('path');
const os = require('os');

function arg(name, fallback) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

const DEFAULT_SRC = path.join(os.homedir(), 'una', 'news.json');
const SRC = arg('source', process.env.UNA_NEWS_SRC || DEFAULT_SRC);
const rawOut = arg('out', '') || process.env.UNA_NEWS_OUT || '';
const OUT = rawOut
  ? path.resolve(rawOut)
  : path.resolve(__dirname, '..', '..', 'src', 'data', 'newsEntries.una.ts');

// Controlled vocabularies from ~/una/news_SCHEMA.md. Slugs are emitted as-is;
// display labels live in LanguageContext.tsx (`news.topic.*`, `news.kind.*`)
// so the feed stays bilingual without duplicating prose here.
const TOPIC_MAP = new Set([
  'drug-discovery',
  'diagnostics-imaging',
  'oncology',
  'genomics',
  'health-data-ehr',
  'telemedicine',
  'trials',
  'policy-regulation',
  'funding',
  'model-release',
  'papers',
  'biosecurity',
]);
// Kinds are emitted in this stable order in the generated type union.
const KIND_ORDER = [
  'funding',
  'launch',
  'model-release',
  'paper',
  'policy',
  'dataset',
  'acquisition',
  'partnership',
  'regulatory-clearance',
];
const KIND_MAP = new Set(KIND_ORDER);
const SOURCE_KINDS = new Set(['primary', 'secondary']);

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/`/g, '\\`')
    .replace(/\r?\n+/g, ' ')
    .trim();
}
function q(s) {
  return `'${esc(s)}'`;
}
function hostOf(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}
const isIsoDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || ''));

// ── Load + validate the source (abort before touching the output) ──────────
if (!fs.existsSync(SRC)) {
  console.error(`ABORT: no news feed at ${SRC}`);
  console.error('       pass one with --source=/path/to/news.json');
  process.exit(1);
}

let feed;
try {
  feed = JSON.parse(fs.readFileSync(SRC, 'utf8'));
} catch (e) {
  console.error(`ABORT: ${SRC} is not valid JSON — ${e.message}`);
  process.exit(1);
}

if (!feed || feed.schema !== 'una-news/v1') {
  console.error(`ABORT: ${SRC} has schema ${JSON.stringify(feed && feed.schema)}; expected 'una-news/v1'`);
  process.exit(1);
}

const rows = Array.isArray(feed.items) ? feed.items : [];
if (rows.length === 0) {
  console.error(`ABORT: ${SRC} contains 0 items — refusing to emit an empty module.`);
  console.error('       (existing module left untouched)');
  process.exit(1);
}

// De-dupe against the open-calls feed: same url => it is a call, not news.
const callsPath = path.resolve(__dirname, '..', '..', 'src', 'data', 'openCallEntries.una.ts');
const callUrls = new Set();
if (fs.existsSync(callsPath)) {
  const t = fs.readFileSync(callsPath, 'utf8');
  for (const m of t.matchAll(/https?:\/\/[^\s'`]+/g)) callUrls.add(m[0].replace(/[.,;]+$/, ''));
}

// ── Transform ──────────────────────────────────────────────────────────────
const dropped = { noUrl: 0, notHttps: 0, noDate: 0, noTitle: 0, noSummary: 0, badKind: 0, noTopic: 0, noVerified: 0, dup: 0, isCall: 0 };
const seenIds = new Set();
const seenUrls = new Set();
const items = [];

for (const row of rows) {
  if (!row || typeof row !== 'object') continue;
  if (!row.url) { dropped.noUrl++; continue; }
  if (row.url !== 'https://' && !/^https:\/\/\S+$/.test(row.url)) { dropped.notHttps++; continue; }
  if (!isIsoDate(row.date)) { dropped.noDate++; continue; }
  if (!row.title) { dropped.noTitle++; continue; }
  if (!String(row.summary || '').trim()) { dropped.noSummary++; continue; }
  if (!KIND_MAP.has(row.kind)) { dropped.badKind++; continue; }
  const topics = (row.topics || []).filter((t) => TOPIC_MAP.has(t));
  if (topics.length === 0) { dropped.noTopic++; continue; }
  // Hard requirement from the schema doc: unverified rows are not written.
  if (!isIsoDate(row.verified_at)) { dropped.noVerified++; continue; }
  if (seenIds.has(row.id) || seenUrls.has(row.url)) { dropped.dup++; continue; }
  if (callUrls.has(row.url)) { dropped.isCall++; continue; }

  seenIds.add(row.id);
  seenUrls.add(row.url);

  items.push({
    id: row.id,
    title: row.title,
    url: row.url,
    source: row.source || hostOf(row.url),
    sourceKind: SOURCE_KINDS.has(row.source_kind) ? row.source_kind : 'secondary',
    date: row.date,
    datePrecision: row.date_precision === 'month' ? 'month' : 'day',
    kind: row.kind,
    topics,
    domain: row.domain || '',
    summary: String(row.summary || '').slice(0, 400),
    whyItMatters: String(row.why_it_matters || '').slice(0, 400),
    provenance: 'una',
    verifiedAt: row.verified_at,
  });
}

if (items.length === 0) {
  console.error(
    `ABORT: ${SRC} had ${rows.length} rows but none passed validation — refusing to emit an empty module.\n` +
      `       dropped: ${JSON.stringify(dropped)}`,
  );
  process.exit(1);
}

// Newest first — the page and the home block both render in this order.
items.sort((a, b) => b.date.localeCompare(a.date));

const emitted =
  `// AUTO-GENERATED by scripts/ingest/unaNews.cjs — do not edit by hand.\n` +
  `// Source: una-news/v1 feed (Una's curated, web-verified health-AI news feed).\n` +
  `//   read from a LOCAL path passed as --source; the raw feed never ships.\n` +
  `// Regenerate: node scripts/ingest/unaNews.cjs --source=<path>\n` +
  `// Freshness: UNA_NEWS_GENERATED_AT is when THIS module was emitted, not when\n` +
  `//   the site was built. The feed is a snapshot, never live.\n\n` +
  `export type NewsKind =\n` +
  KIND_ORDER.map((k) => `  | '${k}'`).join('\n') +
  `;\n\n` +
  `export interface NewsItem {\n` +
  `  id: string;\n` +
  `  title: string;\n` +
  `  url: string;              // https only (Zero Trust: no http, no invented links)\n` +
  `  source: string;\n` +
  `  sourceKind: 'primary' | 'secondary';\n` +
  `  date: string;             // ISO YYYY-MM-DD (YYYY-MM-01 when datePrecision === 'month')\n` +
  `  datePrecision: 'day' | 'month';\n` +
  `  kind: NewsKind;\n` +
  `  topics: string[];         // controlled slugs — labels live in LanguageContext\n` +
  `  domain: string;           // Atlas domain id, e.g. 'ai-life-sciences'\n` +
  `  summary: string;          // one line, factual, from the primary source\n` +
  `  whyItMatters: string;     // one line of editorial framing\n` +
  `  provenance: 'una';\n` +
  `  verifiedAt: string;       // ISO YYYY-MM-DD, copied from the source row\n` +
  `}\n\n` +
  `export const UNA_NEWS_GENERATED_AT = ${q(feed.generated_at)};\n` +
  `export const UNA_NEWS_WINDOW_DAYS = ${Number(feed.window_days) || 120};\n\n` +
  `export const unaNewsItems: NewsItem[] = [\n` +
  items
    .map(
      (it) =>
        `  {\n` +
        `    id: ${q(it.id)},\n` +
        `    title: ${q(it.title)},\n` +
        `    url: ${q(it.url)},\n` +
        `    source: ${q(it.source)},\n` +
        `    sourceKind: '${it.sourceKind}',\n` +
        `    date: '${it.date}',\n` +
        `    datePrecision: '${it.datePrecision}',\n` +
        `    kind: '${it.kind}',\n` +
        `    topics: [${it.topics.map(q).join(', ')}],\n` +
        `    domain: ${q(it.domain)},\n` +
        `    summary: ${q(it.summary)},\n` +
        `    whyItMatters: ${q(it.whyItMatters)},\n` +
        `    provenance: 'una',\n` +
        `    verifiedAt: '${it.verifiedAt}',\n` +
        `  }`,
    )
    .join(',\n') +
  `\n];\n`;

// Single write, only after every check above passed.
fs.writeFileSync(OUT, emitted);
console.log(`WROTE ${items.length} news items (of ${rows.length} rows) -> ${OUT}`);
console.log(`       generatedAt ${feed.generated_at} · window ${feed.window_days}d · newest ${items[0].date}`);
const droppedTotal = Object.values(dropped).reduce((a, b) => a + b, 0);
if (droppedTotal) console.log(`       dropped ${droppedTotal}: ${JSON.stringify(dropped)}`);
