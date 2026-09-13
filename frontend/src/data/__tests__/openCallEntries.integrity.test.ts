// Integrity for hard deadlines rendered as live countdowns on Open Calls.
//
// A `deadline` entry turns a single Date into a public countdown. Every past
// defect in this file was that Date being wrong while looking plausible:
// dates that had already passed, a deadline that did not exist, a guessed
// date rendered as fact, and a PT deadline stored as UTC midnight (four hours
// early). None of these fail tsc or render tests.
//
// So every deadline must carry the issuer's own wording (`asStated`) and a
// verification stamp, which makes the Date conversion reviewable.
//
// Deliberately NOT checked: whether a deadline is still in the future. Deploy
// runs this suite on every push to main, including the daily routine commit,
// so a date-relative assertion would start failing production deploys the day
// a deadline passes. Expiry is handled at render time by isArchivedNow().

import { describe, it, expect } from 'vitest';

import { openCallEntries } from '../openCallEntries';

const deadlineEntries = openCallEntries.flatMap((e) =>
  e.countdown.kind === 'deadline' ? [{ entry: e, countdown: e.countdown }] : [],
);

describe('openCallEntries deadline integrity', () => {
  it('every deadline has a valid Date', () => {
    const invalid = deadlineEntries
      .filter(({ countdown }) => Number.isNaN(countdown.date.getTime()))
      .map(({ entry }) => entry.id);
    expect(invalid, `Invalid deadline Date: ${invalid.join(', ')}`).toEqual([]);
  });

  it('every deadline records the issuer wording in asStated', () => {
    const missing = deadlineEntries
      .filter(({ countdown }) => !countdown.asStated?.trim())
      .map(({ entry }) => entry.id);
    expect(missing, `Deadline without asStated: ${missing.join(', ')}`).toEqual([]);
  });

  it('every deadline has been verified', () => {
    const missing = deadlineEntries
      .filter(({ entry }) => !entry.verifiedAt)
      .map(({ entry }) => entry.id);
    expect(missing, `Deadline without verifiedAt: ${missing.join(', ')}`).toEqual([]);
  });
});

describe('openCallEntries verifiedAt format', () => {
  it('every verifiedAt is an ISO calendar date', () => {
    const malformed = openCallEntries
      .filter((e) => e.verifiedAt !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(e.verifiedAt))
      .map((e) => `${e.id} → ${e.verifiedAt}`);
    expect(malformed, `Malformed verifiedAt: ${malformed.join(', ')}`).toEqual([]);
  });
});
