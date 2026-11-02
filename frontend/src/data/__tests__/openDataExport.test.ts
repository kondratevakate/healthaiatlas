// openDataExport.test.ts ─────────────────────────────────────────────────────
//
// CI gate for the public open-data download (Bill's 2026-11-02 conditions).
// It runs the real exporter into a temp dir and asserts the two hard rules:
//
//   1. NO emitted file contains a field outside scripts/export/allowlist.json.
//   2. NO emitted row lacks a usable https source URL (and no row survives
//      with an email / phone / personal handle in it, or with a source host on
//      the provenance denylist).
//
// It also pins the allowlist itself: no allowlisted field may be one of the
// globally denied ones, and the exporter must refuse (throw) on a
// non-allowlisted field rather than emitting it.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, beforeAll } from 'vitest';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const exporter: any = require('../../../scripts/export/buildDownloads.cjs');

const FRONTEND = join(__dirname, '..', '..', '..');
const ALLOWLIST = JSON.parse(
  readFileSync(join(FRONTEND, 'scripts', 'export', 'allowlist.json'), 'utf8'),
);

const DENY_HOSTS = ['linkedin.com', 'crunchbase.com', 'pitchbook.com', 'airtable.com'];
const DENY_FIELD_NAMES = [
  'notes',
  'detail',
  'whyItMatters',
  'sponsors',
  'email',
  'phone',
  'contact',
  'playerIds',
];
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

let outDir: string;
let manifest: Record<string, unknown>;
let buildDate: string;

beforeAll(async () => {
  outDir = mkdtempSync(join(tmpdir(), 'atlas-open-data-'));
  // Run the real exporter in a child node process: the jsdom test environment
  // breaks esbuild's TextEncoder invariant, and CI must exercise the shipped
  // script exactly as `npm run export:data` does.
  execFileSync(process.execPath, [join(FRONTEND, 'scripts', 'export', 'buildDownloads.cjs'), '--out', outDir], {
    cwd: FRONTEND,
    stdio: 'pipe',
  });
  manifest = JSON.parse(readFileSync(join(outDir, 'manifest.json'), 'utf8'));
  buildDate = String(manifest.asOf);
}, 180_000);

describe('open-data export: allowlist', () => {
  it('allowlists every dataset the exporter emits', () => {
    const ids = Object.keys(ALLOWLIST.datasets);
    expect(ids.length).toBeGreaterThanOrEqual(6);
    expect(ids).toEqual(
      expect.arrayContaining(['open-calls', 'jobs', 'events', 'news', 'domains', 'project-timeline']),
    );
  });

  it('no allowlisted field is a globally denied field', () => {
    for (const [id, spec] of Object.entries(ALLOWLIST.datasets) as [string, any][]) {
      for (const field of spec.fields) {
        expect(DENY_FIELD_NAMES).not.toContain(field);
      }
      expect(spec.fields).toContain(spec.sourceUrlField);
    }
  });

  it('refuses to emit a field that is not in the allowlist (fails loudly)', () => {
    const spec = { fields: ['id', 'url'], sourceUrlField: 'url', excludedSourceFields: {} };
    expect(() => exporter.validate('probe', spec, [{ id: 'x', url: 'https://a.test', secret: 'x' }])).toThrow(
      /not in/,
    );
  });

  it('refuses rows with no usable source URL and rows carrying an email', () => {
    const spec = { fields: ['id', 'url', 'roles'], sourceUrlField: 'url', excludedSourceFields: {} };
    const { kept, refused } = exporter.validate('probe', spec, [
      { id: 'no-url', url: '', roles: '' },
      { id: 'http-url', url: 'http://a.test/x', roles: '' },
      { id: 'linkedin', url: 'https://www.linkedin.com/company/x', roles: '' },
      { id: 'has-mail', url: 'https://a.test/x', roles: 'write to careers@a.test' },
      { id: 'ok', url: 'https://a.test/x', roles: '' },
    ]);
    expect(kept.map((r: any) => r.id)).toEqual(['ok']);
    expect(refused.length).toBe(4);
  });
});

describe('open-data export: emitted files', () => {
  const files = () => readdirSync(outDir);

  it('writes a dated CSV + JSON per dataset and a manifest', () => {
    const names = files();
    expect(names).toContain('manifest.json');
    for (const id of Object.keys(ALLOWLIST.datasets)) {
      expect(names).toContain(`${id}.${buildDate}.csv`);
      expect(names).toContain(`${id}.${buildDate}.json`);
    }
  });

  for (const id of Object.keys(ALLOWLIST.datasets)) {
    describe(id, () => {
      const spec = (ALLOWLIST.datasets as Record<string, any>)[id];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let payload: any;

      beforeAll(() => {
        payload = JSON.parse(readFileSync(join(outDir, `${id}.${buildDate}.json`), 'utf8'));
      });

      it('emits only allowlisted fields, and all of them', () => {
        const allowed = new Set<string>(spec.fields);
        expect(payload.fields).toEqual(spec.fields);
        for (const row of payload.data) {
          for (const key of Object.keys(row)) {
            expect(allowed.has(key), `${id}: unexpected field "${key}"`).toBe(true);
          }
          for (const key of spec.fields) {
            expect(key in row, `${id}: missing field "${key}"`).toBe(true);
          }
        }
      });

      it('every row carries a usable https source URL', () => {
        expect(payload.data.length).toBeGreaterThan(0);
        for (const row of payload.data) {
          const url = String(row[spec.sourceUrlField] ?? '');
          expect(url.startsWith('https://'), `${id}: row without https source URL`).toBe(true);
          const host = new URL(url).hostname.replace(/^www\./, '');
          for (const denied of DENY_HOSTS) {
            expect(host === denied || host.endsWith(`.${denied}`)).toBe(false);
          }
        }
      });

      it('no row carries an email address', () => {
        for (const row of payload.data) {
          for (const value of Object.values(row)) {
            expect(EMAIL_RE.test(String(value ?? ''))).toBe(false);
          }
        }
      });

      it('CSV header matches the allowlist and the JSON row count', () => {
        const csv = readFileSync(join(outDir, `${id}.${buildDate}.csv`), 'utf8').trim().split('\n');
        expect(csv[0]).toBe(spec.fields.join(','));
        expect(csv.length - 1).toBe(payload.data.length);
      });

      it('manifest row count matches the emitted rows', () => {
        expect((manifest.counts as Record<string, number>)[id]).toBe(payload.data.length);
      });
    });
  }
});

describe('open-data export: manifest', () => {
  it('carries the as-of date, licence, disclaimer, takedown and exclusion note', () => {
    expect(manifest.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(manifest.licence).toBe('CC BY-NC 4.0');
    expect(String(manifest.disclaimer)).toMatch(/not medical advice/i);
    expect((manifest.takedown as Record<string, string>).url).toBe('/contact');
    expect(String(manifest.excludedFieldsNote)).toMatch(/emails/);
    expect(String(manifest.sourceOfTruth)).toMatch(/Committed public data modules/);
    expect(Object.keys(manifest.counts as Record<string, number>).length).toBe(
      Object.keys(ALLOWLIST.datasets).length,
    );
  });

  it('names the excluded rendered fields per dataset', () => {
    const byId = Object.fromEntries((manifest.datasets as any[]).map((d) => [d.id, d]));
    expect(Object.keys(byId['open-calls'].excludedRenderedFields)).toContain('notes');
    expect(Object.keys(byId['news'].excludedRenderedFields)).toContain('whyItMatters');
    expect(Object.keys(byId['project-timeline'].excludedRenderedFields)).toContain('detail');
    expect(Object.keys(byId['events'].excludedRenderedFields)).toContain('sponsors');
  });
});
