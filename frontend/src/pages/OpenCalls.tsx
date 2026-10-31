import { useState, useMemo, useEffect, useRef } from 'react';
import { Layout } from '@/components/layout';
import { OpenCallCard } from '@/components/cards';
import { cn } from '@/lib/utils';
import {
  openCallEntries,
  OPEN_CALL_REGIONS,
  OPEN_CALL_CATEGORIES,
  categoryLabel,
  GrantRegion,
  OpenCallCategory,
} from '@/data/openCallEntries';
import { countdownSortKey, isArchivedNow } from '@/lib/countdown';
import { PageHeader } from '@/components/shared/PageHeader';
import { StaleDataNotice } from '@/components/shared/StaleDataNotice';

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysUntilUtc(deadline: Date, now: Date): number {
  return Math.floor((deadline.getTime() - now.getTime()) / 86_400_000);
}

// ── Animated counter ─────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    setValue(0);
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return value;
}

function StatItem({ target, suffix = '', label }: { target: number; suffix?: string; label: string }) {
  const value = useCountUp(target);
  return (
    <div className="bg-card border border-border rounded-lg p-4 text-center">
      <div className="text-2xl font-bold text-foreground tabular-nums">{value}{suffix}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

// ── Animated results count ────────────────────────────────────────────────────

function ResultsCount({ count }: { count: number }) {
  const animated = useCountUp(count, 600);
  return (
    <div className="text-xs text-muted-foreground mb-4 font-mono">
      {animated} {count === 1 ? 'call' : 'calls'}
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CLOSING_WINDOW_DAYS = 90;

const VISIBLE_CATEGORIES: OpenCallCategory[] = [
  'grant', 'fellowship', 'accelerator', 'prize', 'hackathon', 'sandbox', 'research-lab',
];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OpenCalls() {
  const [regionFilter, setRegion]     = useState<GrantRegion | 'all'>('all');
  const [catFilter, setCat]           = useState<OpenCallCategory | 'all'>('all');
  const [statusFilter, setStatus]     = useState<'' | 'closing' | 'coming'>('');
  const [showArchive, setArchive]     = useState(false);
  const [visibleCount, setVisible]    = useState(12);

  const now = useMemo(() => new Date(), []);

  const archivedCount = useMemo(
    () => openCallEntries.filter(e => isArchivedNow(e.countdown, now)).length,
    [now],
  );

  const filtered = useMemo(() => {
    return [...openCallEntries]
      .filter(e => showArchive || !isArchivedNow(e.countdown, now))
      .filter(e => regionFilter === 'all' || e.region === regionFilter)
      .filter(e => catFilter === 'all' || e.category === catFilter)
      .filter(e => {
        if (statusFilter === '') return true;
        if (statusFilter === 'closing') {
          if (e.countdown.kind !== 'deadline') return false;
          const d = daysUntilUtc(e.countdown.date, now);
          return d >= 0 && d <= CLOSING_WINDOW_DAYS;
        }
        return e.countdown.kind === 'annual';
      })
      .sort((a, b) => countdownSortKey(a.countdown, now) - countdownSortKey(b.countdown, now));
  }, [regionFilter, catFilter, statusFilter, showArchive, now]);

  const resetVisible = () => setVisible(12);

  const activeCount  = openCallEntries.filter(e => !isArchivedNow(e.countdown, now)).length;
  const regionCounts = useMemo(() => {
    const base = openCallEntries.filter(e => showArchive || !isArchivedNow(e.countdown, now));
    const m: Record<string, number> = { all: base.length };
    OPEN_CALL_REGIONS.forEach(r => { m[r] = base.filter(e => e.region === r).length; });
    return m;
  }, [showArchive, now]);

  const catCounts = useMemo(() => {
    const base = openCallEntries
      .filter(e => showArchive || !isArchivedNow(e.countdown, now))
      .filter(e => regionFilter === 'all' || e.region === regionFilter);
    const m: Record<string, number> = { all: base.length };
    VISIBLE_CATEGORIES.forEach(c => { m[c] = base.filter(e => e.category === c).length; });
    return m;
  }, [showArchive, now, regionFilter]);

  return (
    <Layout>
      <div className="container pt-8 md:pt-10 pb-12">

        <PageHeader
          title="Open Calls 2026"
          subtitle="Grants, fellowships, accelerators, prizes. Sorted by deadline."
        />

        <StaleDataNotice section="open-calls" verifyAt="the issuer's page" />

        {/* Stat bar */}
        <div className="grid grid-cols-2 gap-3 mb-8 max-w-xs">
          <StatItem target={activeCount} label="Open calls" />
          <StatItem target={openCallEntries.length} label="Total tracked" />
        </div>

        {/* ── Category filter ────────────────────────────────────────────── */}
        <div className="mb-2">
          <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-2">Category</div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => { setCat('all'); resetVisible(); }}
              className={cn(
                'inline-flex items-baseline gap-1 text-xs px-3 py-1.5 font-mono border transition-colors',
                catFilter === 'all'
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card text-muted-foreground border-border hover:border-foreground/20',
              )}
            >
              All categories
            </button>
            {VISIBLE_CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => { setCat(c === catFilter ? 'all' : c); resetVisible(); }}
                className={cn(
                  'inline-flex items-baseline gap-1 text-xs px-3 py-1.5 font-mono border transition-colors',
                  catFilter === c
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card text-muted-foreground border-border hover:border-foreground/20',
                )}
              >
                {categoryLabel[c]}
              </button>
            ))}
          </div>
        </div>

        {/* ── Region filter ──────────────────────────────────────────────── */}
        <div className="mb-2">
          <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-2 mt-3">Region</div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => { setRegion('all'); resetVisible(); }}
              className={cn(
                'inline-flex items-baseline gap-1 text-xs px-3 py-1.5 font-mono border transition-colors',
                regionFilter === 'all'
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card text-muted-foreground border-border hover:border-foreground/20',
              )}
            >
              All regions
            </button>
            {OPEN_CALL_REGIONS.map(r => (
              <button
                key={r}
                onClick={() => { setRegion(r === regionFilter ? 'all' : r); resetVisible(); }}
                className={cn(
                  'inline-flex items-baseline gap-1 text-xs px-3 py-1.5 font-mono border transition-colors',
                  regionFilter === r
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card text-muted-foreground border-border hover:border-foreground/20',
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Status + archive toggles */}
        <div className="flex flex-wrap gap-1.5 mb-6 mt-2">
          {[
            { id: 'closing' as const, label: `Closing soon (≤${CLOSING_WINDOW_DAYS}d)` },
            { id: 'coming'  as const, label: 'Coming soon (annual)' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => { setStatus(v => v === id ? '' : id); resetVisible(); }}
              className={cn(
                'inline-flex items-baseline gap-1 text-xs px-3 py-1.5 font-mono border transition-colors',
                statusFilter === id
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card text-muted-foreground border-border hover:border-foreground/20',
              )}
            >
              {label}
            </button>
          ))}
          {archivedCount > 0 && (
            <button
              onClick={() => { setArchive(v => !v); resetVisible(); }}
              className={cn(
                'inline-flex items-baseline gap-1 text-xs px-3 py-1.5 font-mono border transition-colors',
                showArchive
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card text-muted-foreground border-dashed border-border hover:border-foreground/20',
              )}
            >
              {showArchive ? 'Hide archive' : `Show archive (${archivedCount})`}
            </button>
          )}
        </div>

        {/* Results count — animated */}
        <ResultsCount count={filtered.length} />

        {/* Card grid */}
        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.slice(0, visibleCount).map(entry => (
                <OpenCallCard key={entry.id} entry={entry} />
              ))}
            </div>
            {visibleCount < filtered.length && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setVisible(v => v + 12)}
                  className="text-sm px-5 py-2 border border-border font-mono text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
                >
                  Load more · {filtered.length - visibleCount} remaining
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-sm">No calls match the current filters.</div>
            <button
              onClick={() => { setRegion('all'); setCat('all'); setStatus(''); resetVisible(); }}
              className="mt-3 text-xs underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-border text-xs text-muted-foreground space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              Grants, fellowships, and funding calls tracked by{' '}
              <a href="/about" className="underline underline-offset-2 hover:text-foreground">HealthAI Atlas</a>.
              Deadlines verified against issuer pages — confirm before applying.
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
