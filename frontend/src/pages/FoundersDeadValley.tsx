// Dead Valley — founder-targeted view onto every shutdown / layoff / SPAC
// collapse the Atlas tracks. All data is sourced from existing files:
//
//   processMining.ts  → PM_EVENTS (chronology),
//                       PM_CATEGORIES['failures'] (4 failure-mode buckets),
//                       PM_OPEN_LANDSCAPE['failures_landscape'] (rich cards),
//                       PM_STATS ("$50B+ value destroyed")
//   ukMarketReality.ts → UK_BABYLON_CASE (deep dive, linked but not embedded)
//
// No new data files. This page is a derived view that re-frames atlas-wide
// failure data as "what kills you, by class", not "here is a list".

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ExternalLink, ArrowRight } from 'lucide-react';

import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/shared/PageHeader';
import { FounderToolkitNav } from '@/components/shared/FounderToolkitNav';
import { SuggestActions } from '@/components/shared/SuggestActions';
import { LastUpdated } from '@/components/shared/LastUpdated';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import {
  PM_EVENTS,
  PM_CATEGORIES,
  PM_OPEN_LANDSCAPE,
  PM_STATS,
} from '@/data/processMining';

// Pull the failure-mode bucket and the dead-resources bucket once at module
// scope so we don't traverse the whole atlas on every render.
const FAILURE_BUCKETS = PM_CATEGORIES.find((c) => c.id === 'failures')?.items ?? [];
const DEAD_RESOURCES =
  PM_OPEN_LANDSCAPE.find((s) => s.id === 'failures_landscape')?.items.filter((i) => i.type === 'dead') ?? [];

const DEAD_EVENTS = PM_EVENTS.filter((e) => e.dead === true).sort((a, b) => b.d.localeCompare(a.d));

const VALUE_DESTROYED = PM_STATS.find((s) => s.l.toLowerCase().includes('destroyed'))?.n ?? '$50B+';

const FoundersDeadValley = () => {
  // `activeBucket` lets a click on a failure-mode card highlight that mode.
  // The visual diff today is the active card's border colour; future work
  // can use this state to filter the chronology / roster sections below.
  const [activeBucket, setActiveBucket] = useState<string | null>(null);

  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <FounderToolkitNav />

        <PageHeader
          eyebrow="Founder Toolkit · Dead Valley"
          title="What kills you, by class"
          subtitle="Every healthcare-AI venture the Atlas has tracked through shutdown, Chapter 7, SPAC collapse, or fire-sale acquisition. Read for patterns, not nostalgia — founders learn more from postmortems than from launches."
        />

        {/* Hero metric — pulled from PM_STATS so the number stays honest as
            new entries are added to the timeline. */}
        <section className="border border-border bg-secondary/30 p-6 md:p-8 mb-12">
          <div className="grid md:grid-cols-3 gap-6 items-baseline">
            <div>
              <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-2">
                Aggregate damage
              </div>
              <div className="text-4xl md:text-5xl font-bold text-foreground">{VALUE_DESTROYED}</div>
              <div className="text-sm text-muted-foreground mt-1">value destroyed, 2022–2026</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-2">
                Documented
              </div>
              <div className="text-4xl md:text-5xl font-bold text-foreground">{DEAD_EVENTS.length}</div>
              <div className="text-sm text-muted-foreground mt-1">shutdowns / SPAC collapses / mass layoffs</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-2">
                Patterns
              </div>
              <div className="text-4xl md:text-5xl font-bold text-foreground">{FAILURE_BUCKETS.length}</div>
              <div className="text-sm text-muted-foreground mt-1">failure-mode classes, below</div>
            </div>
          </div>
        </section>

        {/* The 4 failure-mode buckets — the core of Dead Valley. Click a
            bucket to highlight the cases inside it. */}
        <section className="mb-16">
          <h2 className="heading-lg mb-2">Failure modes</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
            Four classes of death, drawn from the documented record. The question for any
            founder is not "could this happen to me?" — it's "which of these am I closest to?"
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {FAILURE_BUCKETS.map((bucket) => {
              const isActive = activeBucket === bucket.uc;
              return (
                <button
                  type="button"
                  key={bucket.uc}
                  onClick={() => setActiveBucket(isActive ? null : bucket.uc)}
                  className={cn(
                    'group text-left border bg-background p-5 transition-all',
                    isActive
                      ? 'border-primary shadow-md'
                      : 'border-border hover:border-foreground/40',
                  )}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <h3 className="text-base font-semibold">{bucket.uc}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{bucket.desc}</p>
                  <div className="space-y-2">
                    {bucket.evidence.map((ev) => (
                      <div key={ev.client} className="border-l-2 border-border pl-3 py-1">
                        <div className="text-sm font-medium">{ev.client}</div>
                        <div className="text-xs text-muted-foreground">{ev.kpi}</div>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Rich resource cards — pulled from PM_OPEN_LANDSCAPE.failures_landscape.
            These carry valuation deltas, dates, and one-line indictments. */}
        <section className="mb-16">
          <h2 className="heading-lg mb-2">The roster</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
            Each card carries the headline valuation collapse and the one-line indictment from
            the Atlas's own evidence. Cards link out to primary sources where available.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEAD_RESOURCES.map((r) => (
              <div
                key={r.name}
                className="border border-border bg-background p-5 flex flex-col"
              >
                <div className="text-[10px] uppercase tracking-widest font-mono text-primary mb-2">
                  {r.cats.join(' · ')}
                </div>
                <h3 className="text-base font-semibold mb-2">{r.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 flex-1">{r.desc}</p>
                {r.highlight && (
                  <div className="text-xs italic text-foreground/80 border-l-2 border-primary/60 pl-2 mb-3">
                    {r.highlight}
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {r.meta.map((m) => (
                    <Badge key={m} variant="outline" className="text-[10px] rounded-none font-mono">
                      {m}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Chronology — what shut down when. Pulled from PM_EVENTS where
            `dead === true`. Includes layoffs, SPAC collapses, Chapter
            filings, fire-sale exits — anything that signals end-of-arc. */}
        <section className="mb-16">
          <h2 className="heading-lg mb-2">Chronology</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
            Every dated end-of-arc event the Atlas tracks. Sorted newest first — the cluster
            in 2023–2025 is the cohort that defines the current downturn.
          </p>

          <div className="border border-border divide-y divide-border">
            {DEAD_EVENTS.map((event) => (
              <div
                key={`${event.d}-${event.v}`}
                className="grid grid-cols-[100px_1fr_auto] md:grid-cols-[110px_180px_1fr_auto] gap-3 md:gap-4 items-baseline px-4 py-3"
              >
                <div className="text-xs font-mono text-muted-foreground">{event.d}</div>
                <div className="text-sm font-medium">{event.v}</div>
                <div className="text-sm text-muted-foreground hidden md:block">{event.h}</div>
                {event.src ? (
                  <a
                    href={event.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Source for ${event.v}`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">
                    no src
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Deep dive callout — Babylon case study lives in ukMarketReality
            (Founder Toolkit > Context > Healthcare > UK). We link there rather
            than duplicate. */}
        <section className="mb-16">
          <Link
            to="/founders/context?region=uk"
            className="block border border-primary/30 bg-primary/5 p-6 hover:border-primary hover:shadow-md transition-all group"
          >
            <div className="text-[10px] uppercase tracking-widest font-mono text-primary mb-2">
              Deep dive · 6 sections
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
              The Babylon case study →
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              $4.2B SPAC → £500K Chapter 7. Six sections covering the IPO frame, the Lancet
              evidence problem, the NHS contract structure, the GP-at-Hand cherry-picking
              allegations, the bankruptcy mechanics, and the read-across for any UK AI
              founder. Lives inside Context → UK so the regulatory frame is in context.
            </p>
            <div className="flex items-center text-sm text-primary">
              Read the full case study
              <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </section>

        {/* Editorial framing — what readers should take away. Brand voice. */}
        <section className="mb-16 max-w-3xl border-l-4 border-primary/60 pl-4">
          <h2 className="heading-lg mb-3">Read this for patterns, not nostalgia</h2>
          <p className="text-body text-foreground/90 mb-4">
            The temptation with a graveyard like this is to read it for individual stories:
            "Olive was overpromised", "Forward was hardware-first", "Babylon was UK-political".
            The more useful reading is structural — what class of failure are you closest to,
            and what would you have to change about your plan to leave that class?
          </p>
          <p className="text-body text-muted-foreground">
            None of these companies were obviously doomed in their Series B deck. They were
            doomed by structural mismatches between their model and healthcare's
            reimbursement / procurement / regulatory architecture — mismatches that were
            visible at the time, to readers who knew what to look for.
          </p>
        </section>

        <LastUpdated section="directory" />

        <div className="mt-10">
          <SuggestActions />
        </div>
      </div>
    </Layout>
  );
};

export default FoundersDeadValley;
