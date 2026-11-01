// ci-workflow.test.ts ───────────────────────────────────────────────────────
//
// On 2026-11-01 GitHub moved `ubuntu-latest` to Ubuntu 26.04. The CI job's
// `npx playwright install --with-deps chromium` step then failed with
// "Playwright does not support chromium on ubuntu26.04-x64" on a docs-only PR:
// nothing in the repo changed, the floating runner label did.
//
// Static guard: a job that installs Playwright browsers must run on a pinned
// runner image, so an image change arrives as a deliberate edit together with
// a Playwright upgrade, not as a red check on an unrelated PR.
// ────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const CI_YML = join(__dirname, '..', '..', '..', '.github', 'workflows', 'ci.yml');

// Split the workflow into job blocks: a job starts at a 2-space-indented key
// under `jobs:` and runs until the next one.
function jobBlocks(yml: string): string[] {
  const jobs = yml.split(/^jobs:\s*$/m)[1] ?? '';
  return jobs.split(/^ {2}(?=[\w-]+:\s*$)/m).filter((b) => b.trim());
}

describe('CI workflow runner images', () => {
  it('jobs that install Playwright browsers use a pinned runner, not *-latest', () => {
    const offenders = jobBlocks(readFileSync(CI_YML, 'utf-8'))
      .filter((block) => /playwright install/.test(block))
      .filter((block) => !/runs-on:\s*ubuntu-\d{2}\.\d{2}\b/.test(block))
      .map((block) => block.split('\n')[0].trim());
    expect(offenders).toEqual([]);
  });
});
