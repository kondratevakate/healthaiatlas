#!/usr/bin/env node
// buildDownloads.cjs ─────────────────────────────────────────────────────────
//
// Builds the PUBLIC open-data download files from the COMMITTED data modules
// in src/data. Hard rules (Bill's 2026-11-02 GO-WITH-CONDITIONS):
//
//   1. Source = committed TS/JSON views only. No database read, no network
//      fetch, nothing generated on EC2. This script never reads a .db/.sqlite
//      file and never opens a socket.
//   2. "If it is not rendered on the public page today, it does not go in the
//      download." The committed allowlist (scripts/export/allowlist.json) is
//      the ceiling: emitting a field that is not listed FAILS the run (exit 1).
//   3. Global deny: emails, phone numbers, personal handles, natural-person
//      names, free-text notes, editorial prose, rows with no source URL, and
//      anything whose only provenance is LinkedIn / Crunchbase / PitchBook /
//      Airtable.
//   4. Every row carries a source URL. A row without one is REFUSED (dropped
//      and reported in the manifest) — it is never emitted silently.
//
// Output: dist/data/<dataset>.<YYYY-MM-DD>.csv|.json + dist/data/manifest.json
// The dated filenames are immutable: a rebuild on another day writes new
// filenames and never overwrites a published one.
//
// Usage: node scripts/export/buildDownloads.cjs [--out <dir>] [--check]
//        (npm run export:data)
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');

const ROOT = path.resolve(__dirname, '..', '..'); // frontend/
const SRC = path.join(ROOT, 'src');
const ALLOWLIST_PATH = path.join(__dirname, 'allowlist.json');

const SITE = 'https://healthaiatlas.com';
const LICENCE = 'CC BY-NC 4.0';
const DISCLAIMER =
  'Not medical advice. HealthAI Atlas is an independent research directory; ' +
  'nothing in these files is clinical guidance, diagnosis, or treatment advice.';

// ── Global deny ────────────────────────────────────────────────────────────
const DENY_HOSTS = ['linkedin.com', 'crunchbase.com', 'pitchbook.com', 'airtable.com'];
const DENY_PATTERNS = {
  email: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  longDigitRun: /[0-9]{11,}/,
  personalHandle: /(?<![A-Za-z0-9._%+-])@[A-Za-z0-9_]{4,}\b/,
};

// Phone numbers are structural, not a bare regex: "+15.5-18.1%" is a statistic,
// "+971 50 123 4567" is a phone. A hit needs ≥9 digits inside a `+`-prefixed
// run of digits/spaces/./()/- and must not be a percentage.
function hasPhone(text) {
  const re = /(?<![0-9A-Za-z])\+[0-9][0-9\s().-]{6,}/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const candidate = m[0];
    if (candidate.includes('%')) continue;
    if (candidate.replace(/\D/g, '').length >= 9) return true;
  }
  return false;
}

function fail(message) {
  throw new Error(`open-data export REFUSED: ${message}`);
}

/** YYYY-MM-DD from a Date, an ISO string, or anything date-ish. */
function isoDate(value) {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function str(value) {
  return value === null || value === undefined ? '' : String(value);
}

/** Arrays become `;`-joined strings in CSV; kept as arrays in JSON. */
function cell(value) {
  if (Array.isArray(value)) return value.join('; ');
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

function csvEscape(value) {
  const s = cell(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

// ── Load the committed data modules (no DB, no network) ─────────────────────
const ENTRY = [
  "export { openCallEntries } from './data/openCallEntries';",
  "export { conferences } from './data/conferences';",
  "export { newsItems } from './data/newsFeed';",
  "export { domains } from './data/domains';",
  "export { projectMilestones } from './data/projectTimeline';",
  "export { externalJobs_80000hours } from './data/jobsExternal.80000hours';",
].join('\n');

function loadDataModules() {
  // Required lazily: esbuild self-checks a TextEncoder invariant that a jsdom
  // test environment does not satisfy, so a test that imports this module for
  // its validators must not pay for it.
  const esbuild = require('esbuild');
  return esbuild
    .build({
      stdin: { contents: ENTRY, resolveDir: SRC, loader: 'ts', sourcefile: 'openDataEntry.ts' },
      bundle: true,
      write: false,
      format: 'cjs',
      platform: 'node',
      target: 'node18',
      alias: { '@': SRC },
      logLevel: 'silent',
      legalComments: 'none',
    })
    .then((result) => {
      const code = result.outputFiles[0].text;
      const mod = new Module('openDataEntry');
      mod.filename = path.join(SRC, '__openDataEntry.js');
      mod.paths = Module._nodeModulePaths(SRC);
      mod._compile(code, mod.filename);
      return mod.exports;
    });
}

// ── Row builders: source record -> allowlisted flat row ─────────────────────
function openCallRow(entry) {
  const c = entry.countdown || {};
  return {
    id: entry.id,
    title: entry.title,
    organizer: entry.organizer,
    url: entry.url,
    region: entry.region,
    category: entry.category,
    deadline_kind: str(c.kind),
    deadline_date: c.kind === 'deadline' ? isoDate(c.date) : '',
    deadline_as_stated: str(c.asStated),
    amount: str(entry.amount),
    audience: str(entry.audience),
    verified_at: str(entry.verifiedAt),
    provenance: str(entry.provenance),
  };
}

function jobRow(job) {
  return {
    company: job.company,
    category: job.category,
    count: job.count === null || job.count === undefined ? null : job.count,
    count_raw: str(job.count_raw),
    roles: str(job.roles),
    location: str(job.location),
    remote: str(job.remote),
    url: job.url,
    status: str(job.status),
    active: Boolean(job.active),
    uae: Boolean(job.uae),
    provenance: str(job.provenance),
    verified_at: str(job.verifiedAt),
  };
}

function eventRow(c) {
  return {
    id: c.id,
    name_en: c.name?.en ?? '',
    name_ar: c.name?.ar ?? '',
    date: isoDate(c.date),
    end_date: isoDate(c.endDate),
    location: str(c.location),
    type: str(c.type),
    topics: Array.isArray(c.topics) ? c.topics : [],
    website: str(c.website),
    description_en: c.description?.en ?? '',
    description_ar: c.description?.ar ?? '',
    source_url: str(c.sourceUrl) || str(c.website),
  };
}

function newsRow(item) {
  return {
    id: item.id,
    title: item.title,
    url: item.url,
    source: str(item.source),
    source_kind: str(item.sourceKind),
    date: isoDate(item.date),
    date_precision: str(item.datePrecision),
    kind: str(item.kind),
    topics: Array.isArray(item.topics) ? item.topics : [],
    domain: str(item.domain),
    summary: str(item.summary),
  };
}

function domainRow(d) {
  return {
    id: d.id,
    name_en: d.name?.en ?? '',
    name_ar: d.name?.ar ?? '',
    subtitle_en: d.subtitle?.en ?? '',
    subtitle_ar: d.subtitle?.ar ?? '',
    player_count: Array.isArray(d.playerIds) ? d.playerIds.length : 0,
    source_url: `${SITE}/directory/${d.id}`,
  };
}

function milestoneRow(m) {
  return {
    id: m.id,
    date: isoDate(m.date),
    commit: str(m.commit),
    kind: str(m.kind),
    title_en: m.title?.en ?? '',
    title_ar: m.title?.ar ?? '',
    source_url: `https://github.com/kondratevakate/healthaiatlas/commit/${m.commit}`,
  };
}

// ── Validation ─────────────────────────────────────────────────────────────
/**
 * Returns the global-deny violations in one value. A violated value means the
 * ROW is refused (never emitted, always reported) — we do not silently redact
 * published content, and we do not abort the whole export over one bad row.
 */
function valueViolations(field, value) {
  const text = cell(value);
  if (!text) return [];
  const hits = [];
  for (const [name, re] of Object.entries(DENY_PATTERNS)) {
    if (re.test(text)) hits.push(`${field} matches "${name}"`);
  }
  if (hasPhone(text)) hits.push(`${field} matches "phone"`);
  return hits;
}

/**
 * Enforce the allowlist and the per-row source-URL rule.
 *  - a field outside the allowlist   -> throw (fail loudly, nothing is written)
 *  - a row with no usable source URL -> refused (dropped + reported)
 */
function validate(datasetId, spec, rows) {
  const allowed = new Set(spec.fields);
  const deniedSourceFields = Object.keys(spec.excludedSourceFields || {});
  const sourceField = spec.sourceUrlField;
  const kept = [];
  const refused = [];

  for (const row of rows) {
    const label = str(row.id || row.title || row.company || row.name_en);

    for (const key of Object.keys(row)) {
      if (!allowed.has(key)) {
        fail(
          `dataset "${datasetId}" would emit field "${key}", which is not in ` +
            `scripts/export/allowlist.json. Add it to the allowlist only if the ` +
            `public page renders it today.`,
        );
      }
    }
    for (const key of deniedSourceFields) {
      if (key in row) fail(`dataset "${datasetId}" carries denied source field "${key}".`);
    }
    for (const key of allowed) {
      if (!(key in row)) fail(`dataset "${datasetId}" row "${label}" is missing allowlisted field "${key}".`);
    }
    const dirty = [];
    for (const [field, value] of Object.entries(row)) {
      dirty.push(...valueViolations(field, value));
    }
    if (dirty.length) {
      refused.push({ id: label, reason: `global deny: ${dirty.join(', ')}` });
      continue;
    }

    const sourceUrl = str(row[sourceField]);
    const host = hostOf(sourceUrl);
    if (!/^https:\/\//.test(sourceUrl) || !host) {
      refused.push({ id: label, reason: 'missing or non-https source URL' });
      continue;
    }
    if (DENY_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
      refused.push({ id: label, reason: `source host "${host}" is on the provenance denylist` });
      continue;
    }
    kept.push(row);
  }

  if (refused.length) {
    process.stderr.write(
      `[export:data] ${datasetId}: refused ${refused.length} row(s): ` +
        refused
          .slice(0, 5)
          .map((r) => `${String(r.id).slice(0, 60)} (${r.reason})`)
          .join('; ') +
        (refused.length > 5 ? `; … +${refused.length - 5} more` : '') +
        '\n',
    );
  }
  return { kept, refused };
}

// ── Writers ────────────────────────────────────────────────────────────────
function writeCsv(filePath, fields, rows) {
  const lines = [fields.join(',')];
  for (const row of rows) lines.push(fields.map((f) => csvEscape(row[f])).join(','));
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}

function writeJson(filePath, payload) {
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

// ── Main ───────────────────────────────────────────────────────────────────
async function buildAll(options = {}) {
  const allowlist = JSON.parse(fs.readFileSync(ALLOWLIST_PATH, 'utf8'));
  const buildDate = new Date().toISOString().slice(0, 10);
  const outDir = path.resolve(options.outDir || path.join(ROOT, 'dist', 'data'));
  fs.mkdirSync(outDir, { recursive: true });

  const mods = await loadDataModules();
  const jobsSeed = JSON.parse(fs.readFileSync(path.join(SRC, 'data', 'jobsData.json'), 'utf8'));

  const sources = {
    'open-calls': (mods.openCallEntries || []).map(openCallRow),
    jobs: [...jobsSeed, ...(mods.externalJobs_80000hours || [])].map(jobRow),
    events: (mods.conferences || []).map(eventRow),
    news: (mods.newsItems || []).map(newsRow),
    domains: (mods.domains || []).map(domainRow),
    'project-timeline': (mods.projectMilestones || []).map(milestoneRow),
  };

  const datasets = [];
  for (const [id, spec] of Object.entries(allowlist.datasets)) {
    const rows = sources[id];
    if (!rows) fail(`dataset "${id}" is in the allowlist but has no committed source module wired up.`);
    const { kept, refused } = validate(id, spec, rows);

    const base = `${id}.${buildDate}`;
    const csvName = `${base}.csv`;
    const jsonName = `${base}.json`;
    writeCsv(path.join(outDir, csvName), spec.fields, kept);
    writeJson(path.join(outDir, jsonName), {
      dataset: id,
      asOf: buildDate,
      generatedAt: buildDate,
      licence: LICENCE,
      disclaimer: DISCLAIMER,
      source: spec.source,
      renderedOn: spec.renderedOn,
      sourceUrlField: spec.sourceUrlField,
      fields: spec.fields,
      rows: kept.length,
      data: kept,
    });

    datasets.push({
      id,
      label: spec.label,
      rows: kept.length,
      rowsRefused: refused.length,
      refusedSample: refused.slice(0, 10),
      asOf: buildDate,
      renderedOn: spec.renderedOn,
      sourceModule: spec.source.module,
      sourceUrlField: spec.sourceUrlField,
      fields: spec.fields,
      excludedRenderedFields: spec.excludedRenderedFields || {},
      excludedSourceFields: spec.excludedSourceFields || {},
      files: {
        csv: csvName,
        json: jsonName,
        csvUrl: `/data/${csvName}`,
        jsonUrl: `/data/${jsonName}`,
      },
    });
  }

  const manifest = {
    dataset: 'healthaiatlas-open-data',
    site: SITE,
    asOf: buildDate,
    generatedAt: buildDate,
    buildDateSuffix: buildDate,
    licence: LICENCE,
    licenceNote:
      'Data is licensed CC BY-NC 4.0 (attribution, non-commercial). Code is licensed separately (AGPL-3.0).',
    disclaimer: DISCLAIMER,
    notMedicalAdvice: true,
    takedown: {
      note:
        'If a row concerns you or your organisation and you want it removed or corrected, use the contact page — takedown requests are handled there.',
      url: '/contact',
      absoluteUrl: `${SITE}/contact`,
    },
    sourceOfTruth:
      'Committed public data modules under frontend/src/data only. No database, no live service, no private source is read to build these files.',
    excludedFieldsNote:
      'Only fields rendered on a public page today are emitted, and only those named in scripts/export/allowlist.json. Fields rendered but deliberately withheld under the global deny: open-calls.notes (free-text notes), news.whyItMatters (editorial prose), project-timeline.detail (editorial prose), events.sponsors (third-party attribution). Never emitted: emails, phone numbers, personal handles, natural-person names.',
    excludedRowsNote:
      'Rows without a usable https source URL, or whose only provenance is LinkedIn / Crunchbase / PitchBook / Airtable, are refused and excluded; the count per dataset is in rowsRefused.',
    counts: Object.fromEntries(datasets.map((d) => [d.id, d.rows])),
    datasets,
  };
  writeJson(path.join(outDir, 'manifest.json'), manifest);

  return { outDir, buildDate, manifest, datasets };
}

module.exports = { buildAll, validate, ALLOWLIST_PATH, ROOT };

if (require.main === module) {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  const outDir = outIdx >= 0 ? args[outIdx + 1] : undefined;
  buildAll({ outDir })
    .then(({ outDir: dir, buildDate, datasets }) => {
      process.stdout.write(`[export:data] as of ${buildDate} -> ${dir}\n`);
      for (const d of datasets) {
        process.stdout.write(
          `[export:data]   ${d.id}: ${d.rows} rows` +
            (d.rowsRefused ? ` (${d.rowsRefused} refused: no usable source URL)` : '') +
            `  ${d.files.csv} / ${d.files.json}\n`,
        );
      }
    })
    .catch((err) => {
      process.stderr.write(`${err && err.stack ? err.stack : err}\n`);
      process.exit(1);
    });
}
