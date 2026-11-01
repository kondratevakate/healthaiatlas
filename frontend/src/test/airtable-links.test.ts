// airtable-links.test.ts ────────────────────────────────────────────────────
//
// The Airtable share form and base behind every "suggest entry / correction"
// CTA were closed in October 2026. The site kept linking to them for weeks:
// no build error, no console error, just a dead "This private share link is
// no longer available" page behind every contribute button.
//
// Static guard: no airtable.com URL may appear in app source. Comments that
// merely mention Airtable as history are fine; URLs are not.
// ────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = join(__dirname, '..');
const URL_RE = /https?:\/\/(?:www\.)?airtable\.com\/[^\s'"`)]*/g;

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.') || entry === '__tests__' || entry === 'test') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (/\.(tsx?|json)$/.test(entry)) yield full;
  }
}

describe('closed Airtable links', () => {
  it('app source contains no airtable.com URLs', () => {
    const offenders: string[] = [];
    for (const file of walk(SRC)) {
      for (const match of readFileSync(file, 'utf-8').matchAll(URL_RE)) {
        offenders.push(`${relative(SRC, file)}: ${match[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('index.html contains no airtable.com URLs', () => {
    const html = readFileSync(join(SRC, '..', 'index.html'), 'utf-8');
    expect(html.match(URL_RE) ?? []).toEqual([]);
  });
});
