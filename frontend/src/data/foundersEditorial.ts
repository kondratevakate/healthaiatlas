// Founders Toolkit editorial cards — auto-pulled from existing datasets.
//
// Three cards refresh deterministically:
//   LATEST    — latest editorial-worthy event from DEVREL_TL_ROWS
//   CASE      — most recent dead company from PM_EVENTS
//   REGION    — daily rotation across PM_GEO entries
//
// Logic is pure / module-scope cached. No re-computation per render.
//
// Honesty contract: we use "LATEST" not "THIS WEEK" because our data lives at
// H1/H2 granularity (DevRel) or YYYY-MM (Dead Valley). Don't claim freshness
// the data can't support.

import {
  DEVREL_TL_ROWS,
  DEVREL_PERIODS,
  DEVREL_PERIOD_LABELS,
  type DevRelPeriod,
  type EventType,
  type TlEvent,
} from './devrelSignal';
import { PM_EVENTS, PM_GEO, type PMEvent, type PMGeoEntry } from './processMining';

export interface EditorialCard {
  /** Top-of-card label, monospace small caps. */
  eyebrow: string;
  /** Main headline, editorial-voice. */
  headline: string;
  /** Supporting one-liner under the headline. */
  dek: string;
  /** Where this card links. */
  link: { to: string; label: string };
  /** Optional dateline ("Q1 2025", "Feb 2025") shown small. */
  asOf?: string;
}

// ── LATEST DevRel event ──────────────────────────────────────────────────────
//
// Editorial weight prefers signals a founder can act on:
//   move > gap > hire > launch > content
// Talent moves are the strongest leading indicator (Kilpatrick → Google
// preceded Gemini's developer push by 6+ months).

const EVENT_WEIGHT: Record<EventType, number> = {
  move:    100,
  gap:      80,
  hire:     60,
  launch:   40,
  content:  20,
};

interface RankedTlEvent extends TlEvent {
  row: string;
  period: DevRelPeriod;
}

function pickLatestDevRelEvent(): RankedTlEvent | null {
  // Walk periods newest first.
  const reverse = [...DEVREL_PERIODS].reverse();
  for (const period of reverse) {
    const candidates: RankedTlEvent[] = [];
    for (const row of DEVREL_TL_ROWS) {
      for (const ev of row.events[period] ?? []) {
        candidates.push({ ...ev, row: row.label, period });
      }
    }
    if (candidates.length === 0) continue;
    candidates.sort((a, b) => EVENT_WEIGHT[b.type] - EVENT_WEIGHT[a.type]);
    return candidates[0];
  }
  return null;
}

export function getLatestDevRelCard(): EditorialCard {
  const ev = pickLatestDevRelEvent();
  if (!ev) {
    return {
      eyebrow: 'LATEST · TALENT SIGNAL',
      headline: 'No recent DevRel events on file',
      dek: 'Timeline empty. Add events to devrelSignal.ts.',
      link: { to: '/founders/tech', label: 'Open Tech Signals' },
    };
  }
  return {
    eyebrow: `LATEST · ${ev.type.toUpperCase()} · ${ev.row}`,
    headline: ev.label,
    dek: ev.tip,
    asOf: DEVREL_PERIOD_LABELS[ev.period],
    link: { to: '/founders/tech', label: 'See full DevRel atlas' },
  };
}

// ── Latest Dead Valley case ──────────────────────────────────────────────────

function pickLatestDeadEvent(): PMEvent | null {
  // PM_EVENTS.d is "YYYY-MM" — lexicographic sort matches chronological.
  const dead = PM_EVENTS.filter((e) => e.dead === true);
  if (dead.length === 0) return null;
  dead.sort((a, b) => b.d.localeCompare(a.d));
  return dead[0];
}

// Format "2025-02" → "Feb 2025".
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function formatYM(ym: string): string {
  const [y, m] = ym.split('-');
  const mi = parseInt(m, 10) - 1;
  if (!y || isNaN(mi) || mi < 0 || mi > 11) return ym;
  return `${MONTH_NAMES[mi]} ${y}`;
}

export function getLatestDeadValleyCard(): EditorialCard {
  const ev = pickLatestDeadEvent();
  if (!ev) {
    return {
      eyebrow: 'CASE',
      headline: 'No dead cases on file',
      dek: '',
      link: { to: '/founders/dead-valley', label: 'Open Dead Valley' },
    };
  }
  return {
    eyebrow: 'CASE · DEAD VALLEY',
    headline: `${ev.v} — ${ev.h}`,
    dek: ev.x,
    asOf: formatYM(ev.d),
    link: { to: '/founders/dead-valley', label: 'See all $50B+ destroyed' },
  };
}

// ── Region in focus (daily rotation) ─────────────────────────────────────────
//
// Deterministic rotation: `dayOfYear % N` so every visitor on a given day sees
// the same region (cacheable / shareable). Skips Indonesia + Italy + Australia
// from rotation because their data depth is currently thin — surface only the
// regions with deep dives.

const ROTATION_REGIONS = new Set([
  'United States', 'China', 'United Kingdom', 'Germany', 'Japan', 'India',
]);

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function pickRegion(date: Date): PMGeoEntry | null {
  const pool = PM_GEO.filter((g) => ROTATION_REGIONS.has(g.n));
  if (pool.length === 0) return null;
  return pool[dayOfYear(date) % pool.length];
}

export function getRegionInFocusCard(date: Date = new Date()): EditorialCard {
  const g = pickRegion(date);
  if (!g) {
    return {
      eyebrow: 'REGION',
      headline: 'No regions on file',
      dek: '',
      link: { to: '/founders/markets', label: 'Open regions' },
    };
  }
  const headline = `${g.f}  ${g.n} — ${g.mkt} healthcare`;
  // Pick the most editorially interesting fragment as dek: deal flow if rich,
  // otherwise customer signal, otherwise process-mining note.
  const dek = g.dl?.length > 20 ? g.dl
            : g.cu?.length > 20 ? g.cu
            : g.pm;
  return {
    eyebrow: `REGION · ${g.sh}% GLOBAL SHARE`,
    headline,
    dek,
    asOf: 'rotating daily',
    link: { to: '/founders/markets', label: 'See all regions' },
  };
}

// ── Module-scope cache ───────────────────────────────────────────────────────
// Cards computed once per page load — they don't change while user is on site.
// (Region rotates per day, not per render, so caching at module-load is fine
// unless someone keeps the tab open across midnight.)

export const FOUNDERS_EDITORIAL_CARDS: readonly EditorialCard[] = [
  getLatestDevRelCard(),
  getLatestDeadValleyCard(),
  getRegionInFocusCard(),
];
