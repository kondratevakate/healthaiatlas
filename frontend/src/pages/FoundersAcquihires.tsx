// Founder Toolkit → Acqui-hire Signal
//
// Reading frame: acqui-hire = what big AI couldn't build fast enough.
// Two signals per deal: (1) what capability was missing, (2) how fast
// it appeared in product after close.
//
// Data: frontend/src/data/acquihireSignal.ts
//   21 included deals · 22 named founders · 5 acquirers · 2023–2026
//   All source URLs extracted directly from xlsx — no constructed URLs.
//
// Talent Pipelines section (fellowship/fund factories that grow acquirable teams)
// is a placeholder — data going through Zero Trust pipeline per AGENTS.md §3.

import { useState, useMemo } from 'react';
import { ExternalLink } from 'lucide-react';

import { Layout } from '@/components/layout';
import { FounderToolkitNav } from '@/components/shared/FounderToolkitNav';
import { cn } from '@/lib/utils';
import {
  ACQUIHIRE_DEALS,
  ACQUIHIRE_STATS,
  type AcquihireDeal,
} from '@/data/acquihireSignal';

// ── Capability clusters ──────────────────────────────────────────────────────
// Editorial grouping of what was bought. More founder-useful than by-acquirer
// because it answers "what is still missing from each player's stack?"

type CapabilityCluster = {
  id: string;
  label: string;
  description: string;
  companies: string[]; // matches AcquihireDeal.company
};

const CAPABILITY_CLUSTERS: CapabilityCluster[] = [
  {
    id: 'coding',
    label: 'Coding AI',
    description: 'Runtime infra, IDE assistants, AI-native OS interfaces',
    companies: ['Bun', 'Alex / Alex Codes', 'Software Applications Inc. / Sky'],
  },
  {
    id: 'agents',
    label: 'Agents & Computer-use',
    description: 'Models that perceive and act across interfaces',
    companies: ['Vercept', 'Dreamer', 'Convogo', 'Crossing Minds'],
  },
  {
    id: 'evals',
    label: 'Evals & Observability',
    description: 'Prompt management, LLM analytics, production monitoring',
    companies: ['Humanloop', 'Context.ai'],
  },
  {
    id: 'infra',
    label: 'Inference & Efficiency',
    description: 'GPU optimization, distributed compute, semantic data',
    companies: ['CentML', 'Illumex', 'Runhouse'],
  },
  {
    id: 'enterprise',
    label: 'Enterprise Agents',
    description: 'Autonomous workflow automation, RAG, hiring agents',
    companies: ['Convergence.ai', 'Contextual AI', 'Moonhub'],
  },
  {
    id: 'medical',
    label: 'Medical AI',
    description: 'Health records, life-sciences talent',
    companies: ['Torch', 'Coefficient Bio'],
  },
  {
    id: 'voice',
    label: 'Voice & Conversation',
    description: 'Real-time generative voice, conversational AI',
    companies: ['PlayAI'],
  },
  {
    id: 'consumer',
    label: 'Consumer AI',
    description: 'Product design talent, personalization, finance companions',
    companies: ['Roi', 'Multi / Remotion', 'Global Illumination'],
  },
];

const CONF_LABEL: Record<string, string> = {
  'High':        'High',
  'Medium-High': 'Med–High',
  'Medium':      'Medium',
  'Low':         'Low',
};

const CONF_STYLE: Record<string, string> = {
  'High':        'bg-foreground/10 text-foreground/80',
  'Medium-High': 'bg-foreground/8 text-foreground/60',
  'Medium':      'bg-secondary text-muted-foreground',
  'Low':         'bg-secondary text-muted-foreground/40',
};

// ── Deal card ─────────────────────────────────────────────────────────────────

function DealCard({ d }: { d: AcquihireDeal }) {
  return (
    <div className="border border-border bg-card p-5 flex flex-col gap-3 hover:border-foreground/20 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold leading-tight">{d.company}</div>
          <div className="font-mono text-[9px] text-muted-foreground/40 mt-0.5 uppercase tracking-widest">
            {d.date.slice(0, 7)} · {d.acquirer}
          </div>
        </div>
        <span className={cn('font-mono text-[9px] px-2 py-0.5 shrink-0', CONF_STYLE[d.confidence])}>
          {CONF_LABEL[d.confidence] ?? d.confidence}
        </span>
      </div>

      <p className="text-sm text-foreground/80 leading-relaxed">{d.capability}</p>

      {d.founders && (
        <p className="font-mono text-[9px] text-muted-foreground/40 leading-relaxed">
          {d.founders}
        </p>
      )}

      {(d.src || d.src2) && (
        <div className="flex gap-3 pt-1">
          {d.src && (
            <a href={d.src} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[9px] text-muted-foreground/40 hover:text-muted-foreground transition-colors">
              <ExternalLink className="w-2.5 h-2.5" /> source
            </a>
          )}
          {d.src2 && (
            <a href={d.src2} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[9px] text-muted-foreground/40 hover:text-muted-foreground transition-colors">
              <ExternalLink className="w-2.5 h-2.5" /> source 2
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ── By capability view ────────────────────────────────────────────────────────

function ByCapabilityView({ deals }: { deals: AcquihireDeal[] }) {
  const dealsByCompany = useMemo(() => {
    const m = new Map<string, AcquihireDeal>();
    for (const d of deals) m.set(d.company, d);
    return m;
  }, [deals]);

  return (
    <div className="space-y-10">
      {CAPABILITY_CLUSTERS.map(cluster => {
        const clusterDeals = cluster.companies
          .map(c => dealsByCompany.get(c))
          .filter((d): d is AcquihireDeal => !!d);
        if (clusterDeals.length === 0) return null;
        return (
          <div key={cluster.id}>
            <div className="flex items-baseline gap-3 mb-4">
              <h2 className="heading-lg">{cluster.label}</h2>
              <span className="font-mono text-[9px] text-muted-foreground/40 tracking-widest uppercase">
                {clusterDeals.length} deal{clusterDeals.length > 1 ? 's' : ''}
              </span>
              <div className="flex-1 h-px bg-border/40" />
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-lg">{cluster.description}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {clusterDeals
                .sort((a, b) => b.date.localeCompare(a.date))
                .map(d => <DealCard key={d.company} d={d} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── By acquirer view ──────────────────────────────────────────────────────────

function ByAcquirerView({ deals }: { deals: AcquihireDeal[] }) {
  const byAcquirer = useMemo(() => {
    const map = new Map<string, AcquihireDeal[]>();
    for (const d of deals) {
      if (!map.has(d.acquirer)) map.set(d.acquirer, []);
      map.get(d.acquirer)!.push(d);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [deals]);

  return (
    <div className="space-y-10">
      {byAcquirer.map(([acquirer, acquirerDeals]) => (
        <div key={acquirer}>
          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="heading-lg">{acquirer}</h2>
            <span className="font-mono text-[9px] text-muted-foreground/40 tracking-widest uppercase">
              {acquirerDeals.length} deal{acquirerDeals.length > 1 ? 's' : ''}
            </span>
            <div className="flex-1 h-px bg-border/40" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {acquirerDeals
              .sort((a, b) => b.date.localeCompare(a.date))
              .map(d => <DealCard key={d.company} d={d} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type View = 'capability' | 'acquirer';

const FoundersAcquihires = () => {
  const [view, setView] = useState<View>('capability');
  const included = useMemo(
    () => ACQUIHIRE_DEALS.filter(d => d.status !== 'Excluded'),
    [],
  );
  const excluded = useMemo(
    () => ACQUIHIRE_DEALS.filter(d => d.status === 'Excluded'),
    [],
  );

  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <FounderToolkitNav />

        {/* Masthead */}
        <div className="mb-10 max-w-2xl">
          <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/50 mb-3">
            Founder Toolkit · Acqui-hire Signal
          </p>
          <h1 className="heading-section mb-4">
            {ACQUIHIRE_STATS.totalDeals} deals.{' '}
            {ACQUIHIRE_STATS.topAcquirers.length} acquirers.{' '}
            What big AI couldn't build fast enough.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Each deal is a confession: the acquirer needed this capability and
            couldn't build it at the speed the market demanded.
            Anthropic bought Vercept (computer-use) and Bun (JS runtime) —
            both appeared in Claude within three months of close.
          </p>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-10">
          {[
            { n: ACQUIHIRE_STATS.totalDeals,    label: 'deals tracked' },
            { n: ACQUIHIRE_STATS.totalFounders, label: 'founders moved' },
            { n: ACQUIHIRE_STATS.topAcquirers.length, label: 'acquirers' },
            { n: CAPABILITY_CLUSTERS.length,    label: 'capability clusters' },
          ].map(({ n, label }) => (
            <div key={label} className="border border-border bg-card px-5 py-4">
              <div className="text-3xl md:text-4xl font-bold leading-none mb-1">{n}</div>
              <div className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/50">{label}</div>
            </div>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex gap-1 mb-8">
          {(['capability', 'acquirer'] as View[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'font-mono text-[10px] tracking-widest uppercase px-4 py-2 border transition-colors',
                view === v
                  ? 'border-primary/60 bg-primary/10 text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {v === 'capability' ? 'By what was bought' : 'By acquirer'}
            </button>
          ))}
        </div>

        {/* Main view */}
        {view === 'capability'
          ? <ByCapabilityView deals={included} />
          : <ByAcquirerView deals={included} />
        }

        {/* Talent Pipelines — placeholder, data via Zero Trust pipeline */}
        <section className="mt-16 pt-10 border-t border-border/40">
          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="heading-lg">Talent Pipelines</h2>
            <span className="font-mono text-[9px] text-muted-foreground/40 tracking-widest uppercase">
              coming · 13 pipeline orgs
            </span>
            <div className="flex-1 h-px bg-border/40" />
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed mb-6">
            Fellowships, funds, and studio programs that deliberately produce
            the kind of teams that get acqui-hired. Entrepreneur First,
            South Park Commons, AI Grant, YC, MATS, Atomic, Expa —
            and 6 more. Data going through Zero Trust pipeline.
          </p>
          <div className="border border-dashed border-border/50 bg-secondary/20 p-8 text-center max-w-2xl">
            <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/30 mb-2">
              Data sourcing in progress
            </p>
            <p className="text-sm text-muted-foreground/50">
              13 pipeline organisations · 12 fields each · verification pending
            </p>
          </div>
        </section>

        {/* Excluded large deals */}
        <section className="mt-14 pt-8 border-t border-border/30">
          <div className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/30 mb-5">
            Excluded — large deals · reference patterns only
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {excluded.map(d => (
              <div key={d.company} className="border border-border/30 bg-secondary/10 px-4 py-3 flex items-start gap-4 opacity-60">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm font-medium">{d.company}</span>
                    <span className="font-mono text-[9px] text-muted-foreground/40">→ {d.acquirer}</span>
                    <span className="font-mono text-[9px] text-muted-foreground/30">{d.date.slice(0, 7)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground/50 mt-0.5">{d.notes}</p>
                </div>
                {d.src && (
                  <a href={d.src} target="_blank" rel="noopener noreferrer"
                    className="text-muted-foreground/20 hover:text-muted-foreground/50 transition-colors shrink-0">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>
    </Layout>
  );
};

export default FoundersAcquihires;
