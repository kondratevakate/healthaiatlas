// News — dated, already-happened items (model releases, funding rounds,
// papers, policy steps). Deliberately NOT open calls: an item with a deadline
// and an action belongs to /open-calls. See ~/una/news_SCHEMA.md.
//
// The feed is a SNAPSHOT ingested from Una's local, web-verified news feed by
// scripts/ingest/unaNews.cjs — never a live fetch. The "updated" stamp makes
// that honest: it is when the module was emitted, not when the page loaded.
//
// Monochrome: kind and topic are separated by label + outline, never color
// (docs/design-decisions/2026-05-palette-strategy.md). RTL-safe: logical
// properties only (ms-auto, ps-*), no left/right classes.

import { useMemo, useState, type ReactNode } from 'react';
import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/shared/PageHeader';
import { NewsCard, newsKindKey, newsTopicKey } from '@/components/shared/NewsCard';
import { SuggestActions } from '@/components/shared/SuggestActions';
import { useLanguage } from '@/contexts/LanguageContext';
import { newsGeneratedOn, newsItems, newsKinds, newsTopics } from '@/data/newsFeed';
import { cn } from '@/lib/utils';

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'px-3 py-1.5 text-xs font-medium border transition-colors rounded-none',
        active
          ? 'border-foreground text-foreground'
          : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/40',
      )}
    >
      {children}
    </button>
  );
}

const News = () => {
  const { t } = useLanguage();
  const [topic, setTopic] = useState<string>('all');
  const [kind, setKind] = useState<string>('all');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return newsItems
      .filter((i) => (topic === 'all' ? true : i.topics.includes(topic)))
      .filter((i) => (kind === 'all' ? true : i.kind === kind))
      .filter((i) =>
        needle
          ? [i.title, i.summary, i.source, ...i.topics].join(' ').toLowerCase().includes(needle)
          : true,
      );
  }, [topic, kind, query]);

  const resetFilters = () => {
    setTopic('all');
    setKind('all');
    setQuery('');
  };

  const filtered = topic !== 'all' || kind !== 'all' || query !== '';

  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <PageHeader eyebrow={t('nav.news')} title={t('news.title')} subtitle={t('news.subtitle')} />

        {/* Filters — one row per question, monochrome, RTL-safe */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/40 w-16 shrink-0">
              {t('news.filter.topic')}
            </span>
            <Pill active={topic === 'all'} onClick={() => setTopic('all')}>
              {t('news.filter.all')}
            </Pill>
            {newsTopics.map((tp) => (
              <Pill key={tp} active={topic === tp} onClick={() => setTopic(tp)}>
                {t(newsTopicKey(tp))}
              </Pill>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/40 w-16 shrink-0">
              {t('news.filter.kind')}
            </span>
            <Pill active={kind === 'all'} onClick={() => setKind('all')}>
              {t('news.filter.all')}
            </Pill>
            {newsKinds.map((k) => (
              <Pill key={k} active={kind === k} onClick={() => setKind(k)}>
                {t(newsKindKey(k))}
              </Pill>
            ))}

            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('news.search')}
              aria-label={t('news.search')}
              className="ms-auto w-full sm:w-64 mt-2 sm:mt-0 px-3 py-1.5 text-sm border border-border bg-transparent rounded-none placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/40">
            {visible.length} {t('news.count')}
          </span>
          <div className="flex-1 h-px bg-border/40" />
          {newsGeneratedOn && (
            <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/40">
              {t('news.updated')} {newsGeneratedOn}
            </span>
          )}
        </div>

        {visible.length === 0 ? (
          <div className="border border-border p-10 text-center">
            <p className="text-sm text-muted-foreground mb-4">{t('news.empty')}</p>
            {filtered && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-medium underline underline-offset-4 hover:text-foreground text-muted-foreground"
              >
                {t('news.empty.reset')}
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <div className="mt-8">
          <SuggestActions />
        </div>
      </div>
    </Layout>
  );
};

export default News;
