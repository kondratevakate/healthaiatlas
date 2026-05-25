import { describe, it, expect } from 'vitest';
import { formatCountdown, countdownSortKey, isArchivedNow } from '../countdown';

const NOW = new Date(Date.UTC(2026, 4, 6, 12, 0, 0));

describe('formatCountdown', () => {
  it('rolling', () => {
    expect(formatCountdown({ kind: 'rolling' }, NOW)).toEqual({ label: 'Rolling', tone: 'rolling' });
  });

  it('annual without window', () => {
    expect(formatCountdown({ kind: 'annual' }, NOW)).toEqual({ label: 'Annual cycle', tone: 'annual' });
  });

  it('annual with window', () => {
    expect(formatCountdown({ kind: 'annual', nextWindow: 'Sep 2026' }, NOW)).toEqual({
      label: 'Annual · Sep 2026',
      tone: 'annual',
    });
  });

  it('closed without next', () => {
    expect(formatCountdown({ kind: 'closed' }, NOW)).toEqual({ label: 'Closed', tone: 'closed' });
  });

  it('closed with next expected', () => {
    expect(formatCountdown({ kind: 'closed', nextExpected: 'Q4 2026' }, NOW)).toEqual({
      label: 'Closed · next Q4 2026',
      tone: 'closed',
    });
  });

  it('deadline urgent — 12 days out', () => {
    const d = new Date(Date.UTC(2026, 4, 18, 0, 0, 0));
    const out = formatCountdown({ kind: 'deadline', date: d }, NOW);
    expect(out.tone).toBe('urgent');
    expect(out.label).toBe('12 days left');
  });

  it('deadline urgent — same day, hours left', () => {
    const d = new Date(Date.UTC(2026, 4, 6, 0, 0, 0));
    const out = formatCountdown({ kind: 'deadline', date: d }, NOW);
    expect(out.tone).toBe('urgent');
    expect(out.label).toMatch(/h left|Closes today/);
  });

  it('deadline urgent — 1 day', () => {
    const d = new Date(Date.UTC(2026, 4, 7, 0, 0, 0));
    const out = formatCountdown({ kind: 'deadline', date: d }, NOW);
    expect(out).toEqual({ label: '1 day left', tone: 'urgent' });
  });

  it('deadline soon — 6 weeks out', () => {
    const d = new Date(Date.UTC(2026, 5, 17, 0, 0, 0));
    const out = formatCountdown({ kind: 'deadline', date: d }, NOW);
    expect(out.tone).toBe('soon');
    expect(out.label).toMatch(/weeks left/);
  });

  it('deadline distant — 8 months out', () => {
    const d = new Date(Date.UTC(2026, 12, 31, 0, 0, 0));
    const out = formatCountdown({ kind: 'deadline', date: d }, NOW);
    expect(out.tone).toBe('distant');
    expect(out.label).toMatch(/months left/);
  });

  it('deadline past', () => {
    const d = new Date(Date.UTC(2026, 4, 1, 0, 0, 0));
    expect(formatCountdown({ kind: 'deadline', date: d }, NOW)).toEqual({
      label: 'Closed',
      tone: 'past',
    });
  });
});

describe('countdownSortKey', () => {
  it('orders by urgency: deadline soonest first, then rolling, annual, closed, past', () => {
    const a = countdownSortKey({ kind: 'deadline', date: new Date(Date.UTC(2026, 4, 18)) }, NOW);
    const b = countdownSortKey({ kind: 'deadline', date: new Date(Date.UTC(2026, 5, 18)) }, NOW);
    const c = countdownSortKey({ kind: 'rolling' }, NOW);
    const d = countdownSortKey({ kind: 'annual' }, NOW);
    const e = countdownSortKey({ kind: 'closed' }, NOW);
    const f = countdownSortKey({ kind: 'deadline', date: new Date(Date.UTC(2026, 4, 1)) }, NOW);
    expect(a).toBeLessThan(b);
    expect(b).toBeLessThan(c);
    expect(c).toBeLessThan(d);
    expect(d).toBeLessThan(e);
    expect(e).toBeLessThan(f);
  });
});

describe('isArchivedNow', () => {
  // Pins the four branches of the helper so the Archive toggle behaves
  // predictably regardless of future tweaks to other countdown logic.
  it('explicit closed → archived', () => {
    expect(isArchivedNow({ kind: 'closed' }, NOW)).toBe(true);
    expect(isArchivedNow({ kind: 'closed', nextExpected: 'Q3' }, NOW)).toBe(true);
  });

  it('deadline in past → archived', () => {
    expect(isArchivedNow({ kind: 'deadline', date: new Date(Date.UTC(2026, 0, 27)) }, NOW)).toBe(true);
  });

  it('deadline today or future → NOT archived', () => {
    expect(isArchivedNow({ kind: 'deadline', date: NOW }, NOW)).toBe(false);
    expect(isArchivedNow({ kind: 'deadline', date: new Date(Date.UTC(2026, 11, 31)) }, NOW)).toBe(false);
  });

  it('rolling and annual → never archived', () => {
    expect(isArchivedNow({ kind: 'rolling' }, NOW)).toBe(false);
    expect(isArchivedNow({ kind: 'annual' }, NOW)).toBe(false);
    expect(isArchivedNow({ kind: 'annual', nextWindow: 'Sep 2026' }, NOW)).toBe(false);
  });
});
