// NewsCard — one dated news item.
//
// Monochrome by design: kind and topic are differentiated by LABEL + outline,
// never by color (docs/design-decisions/2026-05-palette-strategy.md).
// RTL-safe: logical properties only (ms-auto, ps-3, border-s-2), no left/right.
//
// The whole card is the outbound link: the item's url is the provenance, so
// every card points at the source it was verified against.

import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { NewsItem } from '@/data/newsEntries.una';
import { cn } from '@/lib/utils';

/** Translation key for a topic slug from the controlled Una vocabulary. */
export const newsTopicKey = (topic: string): string => `news.topic.${topic}`;
/** Translation key for a kind slug from the controlled Una vocabulary. */
export const newsKindKey = (kind: string): string => `news.kind.${kind}`;

/**
 * Month-precision rows must not pretend to a day they don't have, so they
 * render as YYYY-MM. Numeric, so it reads the same in LTR and RTL.
 */
export function formatNewsDate(item: NewsItem): string {
  return item.datePrecision === 'month' ? item.date.slice(0, 7) : item.date;
}

const chip =
  'border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground';

export function NewsCard({ item, compact = false }: { item: NewsItem; compact?: boolean }) {
  const { t } = useLanguage();

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group block border border-border bg-background p-4 hover:border-foreground/40 transition-colors',
        compact ? 'h-full' : '',
      )}
    >
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="font-mono text-[10px] text-muted-foreground">{formatNewsDate(item)}</span>
        <span className={chip}>{t(newsKindKey(item.kind))}</span>
        <span className="text-[10px] text-muted-foreground/70">
          {item.sourceKind === 'primary' ? t('news.primary') : t('news.secondary')}
        </span>
      </div>

      <h3 className="text-sm font-medium leading-snug mb-1.5">{item.title}</h3>

      {!compact && <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">{item.summary}</p>}

      {!compact && item.whyItMatters && (
        <p className="text-[12px] text-muted-foreground border-s-2 border-border ps-3 mb-3 leading-relaxed">
          <span className="font-mono uppercase tracking-wide text-[10px]">
            {t('news.whyMatters')}
          </span>{' '}
          {item.whyItMatters}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {item.topics.map((topic) => (
          <span key={topic} className={chip}>
            {t(newsTopicKey(topic))}
          </span>
        ))}
        <span className="ms-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground min-w-0">
          <span className="truncate">{item.source}</span>
          <ArrowUpRight className="h-3 w-3 shrink-0" aria-hidden />
        </span>
      </div>
    </a>
  );
}
