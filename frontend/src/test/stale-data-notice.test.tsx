// stale-data-notice.test.tsx ────────────────────────────────────────────────
//
// Freshness banner on hand-curated, time-sensitive pages (Jobs, Open Calls).
// Guards two regressions:
//   1. Tone flips to "May be outdated" once the snapshot is > 60 days old.
//   2. A page passes a `section` key that LAST_UPDATED lacks — the notice
//      throws, so the page-render smoke test would crash on it; this test
//      names the missing key directly.
// ────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { StaleDataNotice } from '@/components/shared/StaleDataNotice';
import { LAST_UPDATED } from '@/data/constants';

function renderNotice(section: string) {
  return render(
    <MemoryRouter>
      <StaleDataNotice section={section} verifyAt="the source" />
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('StaleDataNotice', () => {
  it('uses the neutral tone within 60 days of the snapshot', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z')); // 20 days after jobs snapshot
    renderNotice('jobs');
    expect(screen.getByRole('note').textContent).toMatch(/Snapshot · updated May 26, 2026/);
  });

  it('flags the list as outdated after 60 days', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-27T12:00:00Z'));
    renderNotice('jobs');
    expect(screen.getByRole('note').textContent).toMatch(/May be outdated/);
  });

  it('renders all three calls to action', () => {
    renderNotice('open-calls');
    expect(screen.getByRole('link', { name: /Suggest an update/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Join as contributor/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Co-found with me/ })).toBeTruthy();
  });

  it('every page that mounts the notice has a LAST_UPDATED entry', () => {
    for (const page of ['Jobs.tsx', 'OpenCalls.tsx']) {
      const src = readFileSync(resolve(__dirname, '../pages', page), 'utf8');
      const keys = [...src.matchAll(/<StaleDataNotice[^>]*section="([^"]+)"/g)].map(m => m[1]);
      expect(keys.length, `${page} should mount StaleDataNotice`).toBeGreaterThan(0);
      for (const k of keys) expect(LAST_UPDATED[k], `LAST_UPDATED["${k}"]`).toBeTruthy();
    }
  });
});
