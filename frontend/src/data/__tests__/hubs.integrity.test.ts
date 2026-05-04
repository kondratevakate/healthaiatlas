// Regression test for the PR #6 incident (2026-05-04) where Directory.tsx and
// constants.ts were merged with references to a hub whose component directory
// and data files had been created locally but never `git add`-ed. CI fresh
// checkout failed at vite import resolution: "Could not load
// /home/runner/.../frontend/src/components/ai-life-sciences".
//
// This test enforces the four invariants every hub id in HUB_DOMAIN_IDS must
// satisfy, so a missing-file slip fails fast before the deploy build runs.

import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

import { HUB_DOMAIN_IDS, LAST_UPDATED } from '../constants';
import { domains } from '../domains';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = resolve(__dirname, '../..');
const DIRECTORY_TSX = resolve(SRC_DIR, 'pages/Directory.tsx');

describe('HUB_DOMAIN_IDS integrity', () => {
  const directorySrc = readFileSync(DIRECTORY_TSX, 'utf8');

  for (const id of HUB_DOMAIN_IDS) {
    describe(`hub: ${id}`, () => {
      it('has a committed component barrel at src/components/<id>/index.ts', () => {
        const indexPath = resolve(SRC_DIR, 'components', id, 'index.ts');
        expect(
          existsSync(indexPath),
          `Missing ${indexPath}. If the file exists locally but the test fails on a fresh checkout, the directory was not staged — run \`git status\` and add it.`,
        ).toBe(true);
      });

      it('has a domains.ts entry', () => {
        const entry = domains.find((d) => d.id === id);
        expect(entry, `domains.ts has no entry with id "${id}"`).toBeTruthy();
      });

      it('has a LAST_UPDATED entry', () => {
        expect(
          LAST_UPDATED[id],
          `LAST_UPDATED in constants.ts is missing key "${id}"`,
        ).toBeTruthy();
      });

      it('is imported and dispatched in Directory.tsx', () => {
        expect(
          directorySrc.includes(`from '@/components/${id}'`),
          `Directory.tsx is missing import: from '@/components/${id}'`,
        ).toBe(true);
        expect(
          directorySrc.includes(`activeDomainId === '${id}'`),
          `Directory.tsx is missing dispatch: activeDomainId === '${id}'`,
        ).toBe(true);
      });
    });
  }
});
