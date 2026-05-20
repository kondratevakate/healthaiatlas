// Unified search index for the Atlas — flattens every directory data file into
// a single searchable shape. cmdk consumes `value` (concatenated searchable
// text) and runs its own fuzzy matcher; this module's only job is to produce
// uniform records with stable keys so cmdk and any future indexer (Fuse,
// Pagefind) see the same shape.

import { players } from '@/data/players';
import { openCallEntries, categoryLabel } from '@/data/openCallEntries';
import { domains } from '@/data/domains';
import { conferences } from '@/data/conferences';
import { launches } from '@/data/launches';

export type SearchableType = 'opencall' | 'player' | 'domain' | 'conference' | 'launch';

export interface SearchableEntity {
  id: string;
  type: SearchableType;
  title: string;
  // One-line context shown below the title (org, location, tagline).
  subtitle?: string;
  // Searchable but not rendered — region, category, tags, alt-language names.
  keywords: string[];
  // Internal route the user lands on when they pick this result.
  url: string;
  // Optional small mono-font badge — region, category, year.
  meta?: string;
}

type Lang = 'en' | 'ar';

/**
 * Build the cross-section search index for a given UI language. Pure function:
 * call inside useMemo and re-run on language change.
 */
export function buildSearchIndex(language: Lang = 'en'): SearchableEntity[] {
  const index: SearchableEntity[] = [];

  for (const e of openCallEntries) {
    index.push({
      id: `opencall:${e.id}`,
      type: 'opencall',
      title: e.title,
      subtitle: e.organizer,
      keywords: [
        e.region,
        e.category,
        categoryLabel[e.category],
        ...(e.audience ? [e.audience] : []),
        ...(e.notes ? [e.notes] : []),
      ],
      url: `/discovery?section=opencalls#${e.id}`,
      meta: `${categoryLabel[e.category]} · ${e.region}`,
    });
  }

  for (const p of players) {
    index.push({
      id: `player:${p.id}`,
      type: 'player',
      title: p.name[language],
      subtitle: [p.city, p.country].filter(Boolean).join(', '),
      keywords: [
        p.type,
        p.country,
        p.city,
        p.name.en,
        p.name.ar,
        ...(p.aiAreas ?? []),
      ].filter(Boolean) as string[],
      url: `/directory`,
      meta: p.type,
    });
  }

  for (const d of domains) {
    if (d.id === 'overview') continue;
    index.push({
      id: `domain:${d.id}`,
      type: 'domain',
      title: d.name[language],
      subtitle: d.subtitle?.[language],
      keywords: [d.name.en, d.name.ar, d.subtitle?.en ?? '', d.subtitle?.ar ?? ''].filter(Boolean),
      url: `/directory?domain=${d.id}`,
    });
  }

  for (const c of conferences) {
    index.push({
      id: `conf:${c.id}`,
      type: 'conference',
      title: c.name[language],
      subtitle: c.location,
      keywords: [
        c.location,
        c.type,
        c.name.en,
        c.name.ar,
        ...(c.topics ?? []),
      ],
      url: `/discovery#${c.id}`,
      meta: c.date?.slice(0, 4),
    });
  }

  for (const l of launches) {
    index.push({
      id: `launch:${l.id}`,
      type: 'launch',
      title: l.name,
      subtitle: l.tagline,
      keywords: [...(l.topics ?? []), l.description ?? ''],
      url: `/discovery?tab=launches#${l.id}`,
      meta: l.launchDate?.toISOString().slice(0, 7), // YYYY-MM
    });
  }

  return index;
}

export const SEARCHABLE_TYPE_LABELS: Record<SearchableType, { en: string; ar: string }> = {
  opencall: { en: 'Open Calls', ar: 'دعوات مفتوحة' },
  player: { en: 'Players', ar: 'اللاعبون' },
  domain: { en: 'Domains', ar: 'المجالات' },
  conference: { en: 'Events', ar: 'الفعاليات' },
  launch: { en: 'Launches', ar: 'إطلاقات' },
};
