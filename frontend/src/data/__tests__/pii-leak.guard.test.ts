// pii-leak.guard.test.ts ───────────────────────────────────────────────────
//
// The repo is PUBLIC (opened 2026-11-02). Everything under src/data ships in the
// client bundle, so anything that lands there is published to the world.
//
// Bill's rule (2026-11-02, open-data review): emails, phone numbers, personal
// handles and natural-person names in a private capacity are a GLOBAL DENY.
// One real hit existed when this test was written: a recruiter address in
// jobsData.json ("Accept CVs via careers@…") — scrubbed, and this guard is what
// keeps it from coming back through an ingest.
//
// This is the minimum gate Bill required BEFORE any data export may ship.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DATA_DIR = join(__dirname, '..');

// Deliberately broad: catches mailto:, obfuscated " at " forms and bare addresses.
const EMAIL_RE = /[A-Za-z0-9._%+-]+\s?(?:@|\(at\)|\[at\]|\s+at\s+)\s?[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
// Phone-shaped strings, but NOT when glued to more word characters — that is
// how DOI fragments (s41467-024-44824-z) and version strings look, and those
// produced 19 false positives on the first run.
const PHONE_RE = /(?<![\w-])(?:\+\d{1,3}[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]\d{3}[-.\s]\d{4}(?![\w-])/g;

// Known-good files that legitimately contain no contact data but look risky
// (e.g. long numeric tables). Extend only with a comment saying why.
const EXEMPT: Record<string, string> = {};

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    // Test fixtures are not shipped data. They legitimately contain fake
    // addresses (e.g. openDataExport.test.ts uses careers@a.test to prove the
    // export refuses PII) — scanning them made this guard fail on its own sibling.
    if (entry === '__tests__' || entry === 'test' || entry === 'tests') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (/\.(ts|tsx|json)$/.test(entry)) yield full;
  }
}

describe('public data contains no contact PII', () => {
  it('no email addresses in src/data', () => {
    const offenders: string[] = [];
    for (const file of walk(DATA_DIR)) {
      const rel = relative(DATA_DIR, file);
      if (EXEMPT[rel]) continue;
      for (const m of readFileSync(file, 'utf-8').matchAll(EMAIL_RE)) {
        // Skip obvious false positives: URLs with @ (npm scopes) and font files.
        if (m[0].includes('npm') || m[0].endsWith('.woff') || m[0].endsWith('.css')) continue;
        offenders.push(`${rel}: ${m[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('no phone numbers in src/data', () => {
    const offenders: string[] = [];
    for (const file of walk(DATA_DIR)) {
      const rel = relative(DATA_DIR, file);
      if (EXEMPT[rel]) continue;
      for (const m of readFileSync(file, 'utf-8').matchAll(PHONE_RE)) {
        offenders.push(`${rel}: ${m[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
