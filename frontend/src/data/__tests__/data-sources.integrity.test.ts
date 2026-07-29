// Zero Trust — source-URL honesty guard.
//
// AGENTS.md hard rule #1: "If a source URL is not present in the input data,
// set src: ''. Never construct, guess, or pattern-match a URL. Empty string is
// honest. 404 is not."
//
// Until now that rule was enforced by convention only — the single production
// incident (fabricated TechCrunch date-slug URLs, every link a 404) had no
// automated guard. This test makes the invariant executable: every `src:` /
// `url:` literal in frontend/src/data/*.ts must be EITHER an empty string
// (honest "no source") OR a well-formed absolute https:// URL. A relative
// path, an http:// link, a placeholder ('TODO', 'TBD', 'example.com'), or any
// non-URL string fails CI fast — the exact class of slip that reached prod.
//
// Scope note (v1): this guards URL *shape*, not liveness. It cannot detect a
// well-formed URL that 404s — that stays a human/Zero-Trust-pipeline
// responsibility (scripts/zerotrust/verify.py + wayback.py). A follow-up guard
// could assert every fact-asserting file carries a generated-header; that is
// intentionally left out of v1 to avoid a wall of red on legacy hand-authored
// files. This test is the cheap, safe half that closes the fabrication hole.

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const DATA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Keys whose value is a source/evidence link and must therefore be a real URL.
// `source:` is deliberately excluded — it holds prose labels ('Projected',
// 'Federal Budget'), not links.
const URL_KEYS = ['src', 'url', 'link'];

// Match  key: 'value'  or  key: "value"  (string literals only; expressions /
// variable references are skipped — they can't be statically validated here).
const LITERAL_RE = new RegExp(
  `\\b(${URL_KEYS.join('|')})\\s*:\\s*(['"])((?:\\\\.|(?!\\2).)*)\\2`,
  'g',
);

function isHonest(value: string): boolean {
  if (value === '') return true; // honest "no source"
  return /^https:\/\/\S+$/.test(value);
}

const dataFiles = readdirSync(DATA_DIR)
  .filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts'))
  .sort();

describe('Zero Trust — every src/url is empty or a well-formed https URL', () => {
  it('has data files to scan', () => {
    expect(dataFiles.length).toBeGreaterThan(0);
  });

  for (const file of dataFiles) {
    it(`${file}: no fabricated / malformed source URLs`, () => {
      const text = readFileSync(path.join(DATA_DIR, file), 'utf8');
      const violations: string[] = [];

      for (const match of text.matchAll(LITERAL_RE)) {
        const key = match[1];
        const value = match[3];
        if (!isHonest(value)) {
          // line number for a fast fix
          const line = text.slice(0, match.index).split('\n').length;
          violations.push(`${file}:${line} → ${key}: '${value}'`);
        }
      }

      expect(
        violations,
        `Non-empty source fields must be absolute https URLs (AGENTS.md rule #1). ` +
          `Use src: '' if you have no primary source — never a placeholder or guessed URL.\n` +
          violations.join('\n'),
      ).toEqual([]);
    });
  }
});
