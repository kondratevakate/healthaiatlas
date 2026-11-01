// Events — conferences, workshops and demo days.
// One calm page with one job: show where the ecosystem meets, upcoming first.
// Sponsor data (who pays for the room) is rendered ONLY when it has been
// sourced; events without a confirmed sponsor list show nothing rather than a
// guess. See docs/design-decisions/2026-05-palette-strategy.md (monochrome).

import { useMemo, useState, type ReactNode } from 'react';
import { ConferenceCard } from '@/components/cards';
import { Layout } from '@/components/layout';
import { SuggestActions } from '@/components/shared/SuggestActions';
import { PageHeader } from '@/components/shared/PageHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { conferences } from '@/data/conferences';
import { Conference, ConferenceType } from '@/types';
import { cn } from '@/lib/utils';

const TYPES: ConferenceType[] = ['conference', 'workshop', 'demo-day', 'meetup'];

type Timeframe = 'all' | 'upcoming' | 'past';

// Upcoming first (soonest at the top), then past events most-recent-first.
function timeSort(a: Conference, b: Conference, today: string): number {
  const aUp = a.date >= today;
  const bUp = b.date >= today;
  if (aUp !== bUp) return aUp ? -1 : 1;
  return aUp ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
}

function matchesQuery(c: Conference, q: string): boolean {
  if (!q) return true;
  const needle = q.trim().toLowerCase();
  return [
    c.name.en,
    c.name.ar,
    c.location,
    c.description?.en ?? '',
    c.description?.ar ?? '',
    ...c.topics,
  ]
    .join(' ')
    .toLowerCase()
    .includes(needle);
}

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

const Events = () => {
  const { t, language } = useLanguage();
  const [type, setType] = useState<ConferenceType | 'all'>('all');
  const [timeframe, setTimeframe] = useState<Timeframe>('all');
  const [query, setQuery] = useState('');

  const today = new Date().toISOString().slice(0, 10);

  const visible = useMemo(() => {
    return conferences
      .filter((c) => (type === 'all' ? true : c.type === type))
      .filter((c) =>
        timeframe === 'all'
          ? true
          : timeframe === 'upcoming'
            ? c.date >= today
            : c.date < today,
      )
      .filter((c) => matchesQuery(c, query))
      .sort((a, b) => timeSort(a, b, today));
  }, [type, timeframe, query, today]);

  const resetFilters = () => {
    setType('all');
    setTimeframe('all');
    setQuery('');
  };

  const filtered = type !== 'all' || timeframe !== 'all' || query !== '';

  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <PageHeader
          eyebrow={t('nav.events')}
          title={t('events.title')}
          subtitle={t('events.subtitle')}
        />

        {/* Filters — one row per question, monochrome, RTL-safe */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/40 w-16 shrink-0">
              {t('events.filter.type')}
            </span>
            <Pill active={type === 'all'} onClick={() => setType('all')}>
              {t('events.filter.all')}
            </Pill>
            {TYPES.map((tt) => (
              <Pill key={tt} active={type === tt} onClick={() => setType(tt)}>
                {tt.replace('-', ' ')}
              </Pill>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/40 w-16 shrink-0">
              {language === 'ar' ? 'التوقيت' : 'When'}
            </span>
            <Pill active={timeframe === 'all'} onClick={() => setTimeframe('all')}>
              {t('events.filter.all')}
            </Pill>
            <Pill active={timeframe === 'upcoming'} onClick={() => setTimeframe('upcoming')}>
              {t('events.filter.upcoming')}
            </Pill>
            <Pill active={timeframe === 'past'} onClick={() => setTimeframe('past')}>
              {t('events.filter.past')}
            </Pill>

            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('events.search')}
              aria-label={t('events.search')}
              className="ms-auto w-full sm:w-64 mt-2 sm:mt-0 px-3 py-1.5 text-sm border border-border bg-transparent rounded-none placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/40">
            {visible.length} {t('events.count')}
          </span>
          <div className="flex-1 h-px bg-border/40" />
        </div>

        {visible.length === 0 ? (
          <div className="border border-border p-10 text-center">
            <p className="text-sm text-muted-foreground mb-4">{t('events.empty')}</p>
            {filtered && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-medium underline underline-offset-4 hover:text-foreground text-muted-foreground"
              >
                {t('events.empty.reset')}
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((c) => (
              // Anchor id keeps deep links (/#events, search results) working.
              <div key={c.id} id={c.id} className="scroll-mt-24">
                <ConferenceCard conference={c} className="h-full" />
              </div>
            ))}
          </div>
        )}

        <SuggestActions />
      </div>
    </Layout>
  );
};

export default Events;
