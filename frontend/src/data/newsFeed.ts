// News feed — hand-written aggregation layer over the GENERATED per-source
// modules (src/data/newsEntries.una.ts, written by scripts/ingest/unaNews.cjs).
//
// This file is NOT generated: it is the single import point the UI uses, so a
// second source can be added here without touching the pages. The generated
// modules stay machine-owned — re-run the ingest to change their contents.
//
// Newest first. The generated module is already sorted, but the UI must not
// depend on the generator's sort, so it is re-applied here.

import {
  unaNewsItems,
  UNA_NEWS_GENERATED_AT,
  UNA_NEWS_WINDOW_DAYS,
  type NewsItem,
} from './newsEntries.una';

export type { NewsItem, NewsKind } from './newsEntries.una';
export { UNA_NEWS_GENERATED_AT, UNA_NEWS_WINDOW_DAYS };

/** Every news item, newest first. */
export const newsItems: NewsItem[] = [...unaNewsItems].sort((a, b) => b.date.localeCompare(a.date));

/** Topics present in the feed, in first-appearance order (stable, not guessed). */
export const newsTopics: string[] = [...new Set(newsItems.flatMap((i) => i.topics))];

/** Kinds present in the feed, in first-appearance order. */
export const newsKinds: string[] = [...new Set(newsItems.map((i) => i.kind))];

/** ISO date (YYYY-MM-DD) the source feed was last generated. */
export const newsGeneratedOn: string = String(UNA_NEWS_GENERATED_AT || '').slice(0, 10);
