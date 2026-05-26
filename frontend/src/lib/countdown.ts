import { useEffect, useState } from 'react';

export type CountdownStatus =
  | { kind: 'deadline'; date: Date }
  | { kind: 'rolling' }
  | { kind: 'annual'; nextWindow?: string }
  | { kind: 'closed'; nextExpected?: string };

export type CountdownTone =
  | 'urgent'
  | 'soon'
  | 'distant'
  | 'rolling'
  | 'annual'
  | 'closed'
  | 'past';

export interface CountdownDisplay {
  label: string;
  tone: CountdownTone;
}

const MS_PER_DAY = 86_400_000;

// UTC calendar-day delta: today = 0, tomorrow = 1, yesterday = -1.
// Treats both `deadline` and `now` as their UTC midnight, so timezone of the
// host machine never changes the answer.
function calendarDaysUntilUtc(deadline: Date, now: Date): number {
  const deadlineDay = Date.UTC(deadline.getUTCFullYear(), deadline.getUTCMonth(), deadline.getUTCDate());
  const todayDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((deadlineDay - todayDay) / MS_PER_DAY);
}

export function formatCountdown(status: CountdownStatus, now: Date = new Date()): CountdownDisplay {
  switch (status.kind) {
    case 'rolling':
      return { label: 'Rolling', tone: 'rolling' };
    case 'annual':
      return {
        label: status.nextWindow ? `Annual · ${status.nextWindow}` : 'Annual cycle',
        tone: 'annual',
      };
    case 'closed':
      return {
        label: status.nextExpected ? `Closed · next ${status.nextExpected}` : 'Closed',
        tone: 'closed',
      };
    case 'deadline': {
      const days = calendarDaysUntilUtc(status.date, now);
      if (days < 0) return { label: 'Closed', tone: 'past' };
      if (days === 0) {
        // Same calendar day — count hours to end-of-day UTC.
        const endOfDay = Date.UTC(
          status.date.getUTCFullYear(),
          status.date.getUTCMonth(),
          status.date.getUTCDate(),
          23, 59, 59, 999,
        );
        const hours = Math.max(Math.ceil((endOfDay - now.getTime()) / 3_600_000), 0);
        return { label: hours === 0 ? 'Closes today' : `${hours}h left`, tone: 'urgent' };
      }
      if (days === 1) return { label: '1 day left', tone: 'urgent' };
      if (days < 30) return { label: `${days} days left`, tone: 'urgent' };
      if (days < 90) {
        const weeks = Math.round(days / 7);
        return { label: `${weeks} weeks left`, tone: 'soon' };
      }
      const months = Math.round(days / 30);
      return { label: `${months} months left`, tone: 'distant' };
    }
  }
}

/**
 * "Archived" = not actionable today.
 *
 * Two conditions count as archived:
 *   1. `kind === 'closed'`           — explicitly ended programs (Impetus
 *                                      Grants Round 3, NIH Bridge2AI, etc.)
 *   2. `kind === 'deadline'` in past — annual programs whose 2026 window
 *                                      has passed and hasn't been re-dated
 *                                      to 2027 yet.
 *
 * Annual + rolling are NEVER archived — they're either "check the website"
 * or "submit anytime".
 *
 * Used by the Open Calls filter to hide archived entries behind a "Show
 * archive" toggle. Centralised here so the same definition powers any
 * future archive-count badges, sort tweaks, or analytics.
 */
export function isArchivedNow(status: CountdownStatus, now: Date = new Date()): boolean {
  if (status.kind === 'closed') return true;
  if (status.kind === 'deadline') {
    return calendarDaysUntilUtc(status.date, now) < 0;
  }
  return false;
}

export function countdownSortKey(status: CountdownStatus, now: Date = new Date()): number {
  switch (status.kind) {
    case 'deadline': {
      const days = calendarDaysUntilUtc(status.date, now);
      if (days < 0) return 9_000_000 + Math.abs(days);
      return days;
    }
    case 'rolling':
      return 5_000_000;
    case 'annual':
      return 6_000_000;
    case 'closed':
      return 8_000_000;
  }
}

export function useCountdown(status: CountdownStatus): CountdownDisplay {
  const [display, setDisplay] = useState(() => formatCountdown(status));
  useEffect(() => {
    setDisplay(formatCountdown(status));
    if (status.kind !== 'deadline') return;
    const id = setInterval(() => setDisplay(formatCountdown(status)), 60_000);
    return () => clearInterval(id);
  }, [status]);
  return display;
}
