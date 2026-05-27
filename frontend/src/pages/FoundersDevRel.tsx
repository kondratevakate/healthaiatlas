// Founder Toolkit → Tech Signals Hub
//
// Two complementary signals:
//   DevRel    — what vendors are manufacturing developer demand for (6-12 month lead)
//   Acqui-hire — what they couldn't build fast enough (3-6 month lag confirmed)
//
// Tabs:
//   Atlas         — DevRel cluster cards
//   Timeline      — DevRel events 2021–2026
//   People        — DevRel sortable roster
//   Acqui-hires   — talent acquisitions 2023–2026 grouped by acquirer
//
// Data: devrelSignal.ts + acquihireSignal.ts (manually curated May 2026)

import { useState, useMemo } from 'react';
import { ExternalLink, ArrowUpDown } from 'lucide-react';

import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/shared/PageHeader';
import { FounderToolkitNav } from '@/components/shared/FounderToolkitNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

import {
  ACQUIHIRE_DEALS,
  ACQUIHIRE_STATS,
} from '@/data/acquihireSignal';

import {
  DEVREL_CLUSTERS,
  DEVREL_PEOPLE,
  DEVREL_TL_ROWS,
  DEVREL_PERIODS,
  DEVREL_PERIOD_LABELS,
  type SignalLevel,
  type EventType,
  type DevRelPerson,
} from '@/data/devrelSignal';

// ─── helpers ────────────────────────────────────────────────────────────────

const EVENT_STYLES: Record<EventType, string> = {
  hire:    'bg-green-950/60 text-green-400 border border-green-900/60',
  move:    'bg-purple-950/60 text-purple-400 border border-purple-900/60 font-semibold',
  launch:  'bg-amber-950/60 text-yellow-400 border border-yellow-900/60',
  content: 'bg-blue-950/60 text-blue-400 border border-blue-900/60',
  gap:     'bg-red-950/40 text-red-400 border border-dashed border-red-900/60',
};

const EVENT_DOT: Record<EventType, string> = {
  hire:    'bg-green-400',
  move:    'bg-purple-400',
  launch:  'bg-yellow-400',
  content: 'bg-blue-400',
  gap:     'bg-red-400',
};

const SIGNAL_STYLE: Record<SignalLevel, string> = {
  High:   'text-green-400',
  Medium: 'text-yellow-400',
  Low:    'text-muted-foreground',
};

// ─── Atlas tab ──────────────────────────────────────────────────────────────

const VENDORS = ['NVIDIA','Google','Anthropic','AWS','Microsoft Azure','Stripe','Cloudflare','Snowflake','Modal','Hugging Face'] as const;

function AtlasTab() {
  const [vendorFilter, setVendorFilter] = useState<string>('all');

  const main = DEVREL_CLUSTERS.filter((c) => !c.gap);
  const gaps = DEVREL_CLUSTERS.filter((c) => c.gap);
  const clusterCount = main.length;

  const visible = (cos: string[]) =>
    vendorFilter === 'all' || cos.includes(vendorFilter);

  return (
    <div>
      {/* Provenance */}
      <div className="border border-border/60 bg-secondary/20 px-4 py-3 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-muted-foreground mb-5">
        <span><span className="text-foreground/70 font-medium">Source</span> — devrel_hub.html · editorial survey, May 2026</span>
        <span><span className="text-foreground/70 font-medium">Coverage</span> — {clusterCount} active clusters · 29 named advocates · 14 vendors</span>
        <span><span className="text-foreground/70 font-medium">Not automated</span> — manual content analysis, not Zero Trust pipeline</span>
      </div>
      {/* legend */}
      <div className="flex flex-wrap gap-4 mb-5 text-xs text-muted-foreground">
        <span>Intensity ●●● strong &nbsp;●●○ moderate &nbsp;●○○ weak</span>
        <span className="text-muted-foreground/60">Red border = notable gap (investment without named advocate)</span>
      </div>

      {/* vendor filter chips */}
      <div className="flex flex-wrap gap-2 mb-7">
        {(['all', ...VENDORS] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVendorFilter(v)}
            className={cn(
              'font-mono text-[10px] tracking-wider uppercase px-3 py-1 border transition-colors',
              vendorFilter === v
                ? 'border-primary/60 bg-primary/10 text-foreground'
                : 'border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-border/80',
            )}
          >
            {v === 'all' ? 'All' : v}
          </button>
        ))}
      </div>

      {/* cluster grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2">
        {main.filter((c) => visible(c.cos)).map((c) => (
          <div
            key={c.id}
            className="bg-card border border-border p-5 flex flex-col gap-3 hover:-translate-y-px transition-transform"
          >
            <div className="flex items-center justify-between">
              <span
                className="font-mono text-[10px] font-semibold tracking-wide px-2 py-0.5 border"
                style={{ color: c.color, borderColor: `${c.color}33`, background: `${c.color}14` }}
              >
                {c.label}
              </span>
              <div className="flex gap-1">
                {[1,2,3].map((d) => (
                  <div
                    key={d}
                    className={cn('w-[5px] h-[5px] rounded-full', d > c.n && 'bg-muted/30')}
                    style={d <= c.n ? { background: c.color } : undefined}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="text-base font-semibold leading-tight mb-0.5">{c.name}</div>
              <div className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/60">{c.domain}</div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>

            <div className="flex flex-wrap gap-1">
              {c.cos.map((co) => (
                <span key={co} className="font-mono text-[9px] px-2 py-0.5 bg-secondary border border-border text-muted-foreground">{co}</span>
              ))}
            </div>

            <div className="flex flex-wrap gap-1">
              {c.stack.map((s) => (
                <span
                  key={s}
                  className="font-mono text-[9px] px-1.5 py-0.5 border"
                  style={{ color: `${c.color}aa`, borderColor: `${c.color}22`, background: `${c.color}0d` }}
                >
                  {s}
                </span>
              ))}
            </div>

            {c.follow && (
              <>
                <div className="border-t border-border pt-3">
                  <div className="font-mono text-[8px] tracking-widest uppercase text-muted-foreground/50 mb-2">Who to follow</div>
                  <div className="text-sm font-medium">{c.follow.name}</div>
                  <div className="text-xs text-muted-foreground">{c.follow.role}</div>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className="font-mono text-[9px]" style={{ color: c.color }}>{c.follow.co}</span>
                    <span className="font-mono text-[9px] text-muted-foreground/50">{c.follow.handle}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/60 mt-1.5 italic leading-relaxed">{c.follow.sig}</p>
                  <a
                    href={c.follow.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2.5 font-mono text-[9px] tracking-wide uppercase border px-2.5 py-1 transition-colors"
                    style={{ color: c.color, borderColor: `${c.color}33`, background: `${c.color}0a` }}
                  >
                    Follow <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </>
            )}
          </div>
        ))}

        {/* gap cards */}
        {gaps.filter((c) => visible(c.cos)).length > 0 && (
          <>
            <div className="col-span-full pt-6 pb-2 flex items-center gap-3">
              <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/40">
                Gaps — significant investment, no named advocate yet
              </span>
              <div className="flex-1 h-px bg-border/50" />
            </div>
            {gaps.filter((c) => visible(c.cos)).map((c) => (
              <div
                key={c.id}
                className="bg-card border border-dashed border-border/50 p-5 flex flex-col gap-3 opacity-60"
              >
                <span className="font-mono text-[9px] tracking-wide uppercase px-2 py-0.5 border w-fit border-red-900/40 bg-red-950/30 text-red-500">
                  Research gap
                </span>
                <div>
                  <div className="text-base font-semibold text-red-300/60 leading-tight mb-0.5">{c.name}</div>
                  <div className="font-mono text-[9px] tracking-widest uppercase text-red-900">{c.domain}</div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {c.cos.map((co) => (
                    <span key={co} className="font-mono text-[9px] px-2 py-0.5 bg-red-950/20 border border-red-900/30 text-red-800">{co}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {c.stack.map((s) => (
                    <span key={s} className="font-mono text-[9px] px-1.5 py-0.5 border border-red-900/20 text-red-900/60">{s}</span>
                  ))}
                </div>
                <p className="text-xs text-red-900/60 italic leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Timeline tab ────────────────────────────────────────────────────────────

function TimelineTab() {
  return (
    <div>
      {/* legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-[11px]">
        {(
          [
            ['hire',    'bg-green-400',  'Named DevRel hire'],
            ['move',    'bg-purple-400', 'Talent movement (fastest signal)'],
            ['launch',  'bg-yellow-400', 'Product launch'],
            ['content', 'bg-blue-400',   'Landmark content'],
            ['gap',     'bg-red-400',    'Gap — investment without DevRel'],
          ] as const
        ).map(([, dot, label]) => (
          <div key={label} className="flex items-center gap-1.5 text-muted-foreground">
            <div className={cn('w-2 h-2 rounded-full flex-shrink-0', dot)} />
            {label}
          </div>
        ))}
      </div>

      {/* reading guide cards */}
      <div className="grid sm:grid-cols-3 gap-2 mb-8">
        {[
          {
            n: '01',
            title: 'Talent movement',
            body: 'When a prominent DevRel moves from a smaller to a bigger company, the bigger company is buying developer credibility. Leads product push by 6–12 months.',
            ex: 'Kilpatrick OpenAI→Google (Apr 2024)\nSchmid HF→Google DeepMind (2025)\nVergadia Google→Microsoft (2024)',
          },
          {
            n: '02',
            title: 'Job postings with product names',
            body: '"Sr. Developer Advocate, [product]" = product is 3–6 months from developer push. The product name in the title is the signal.',
            ex: 'Databricks "DevAdv, AI Agentic Systems" (open)\nMeta "Director of Developer Community" (open)\nCloudflare "Models Engineer, DevRel" (open)',
          },
          {
            n: '03',
            title: 'Conference session depth',
            body: 'When a company goes from 1–2 keynotes to 5+ deep-dive technical sessions at GTC / AI Engineer / Data+AI Summit — they are ready to push.',
            ex: 'GTC 2026: code sessions vs keynotes at NVIDIA\nData+AI Summit Jun 2026: Databricks Mosaic AI depth\nAWS re:Invent 2026: AgentCore vs 2025 count',
          },
        ].map(({ n, title, body, ex }) => (
          <div key={n} className="bg-card border border-border p-4">
            <div className="font-mono text-4xl text-muted-foreground/20 leading-none mb-2">{n}</div>
            <div className="text-sm font-medium mb-2">{title}</div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{body}</p>
            <div className="font-mono text-[9px] text-muted-foreground/40 leading-relaxed bg-secondary/50 border-l-2 border-primary/30 pl-2 py-1.5 whitespace-pre-line">
              {ex}
            </div>
          </div>
        ))}
      </div>

      {/* timeline grid */}
      <div className="overflow-x-auto pb-4">
        <div style={{ minWidth: 860 }}>
          {/* period headers */}
          <div className="flex ml-36 mb-1">
            {DEVREL_PERIODS.map((p) => (
              <div
                key={p}
                className="flex-1 font-mono text-[8px] tracking-widest uppercase text-muted-foreground/30 text-center border-l border-border/30 py-1"
              >
                {DEVREL_PERIOD_LABELS[p]}
              </div>
            ))}
          </div>

          {/* rows */}
          {DEVREL_TL_ROWS.map((row) => (
            <div key={row.label} className="flex items-stretch mb-[2px] group">
              <div className="w-36 flex-shrink-0 font-mono text-[9px] tracking-wide text-muted-foreground/40 pr-3 text-right self-center py-2 group-hover:text-muted-foreground/70 transition-colors">
                {row.label}
              </div>
              <div
                className="flex flex-1 border-l border-border/30 bg-secondary/20"
              >
                {DEVREL_PERIODS.map((p) => {
                  const events = row.events[p] ?? [];
                  return (
                    <div key={p} className="flex-1 border-l border-border/20 min-h-[34px] p-0.5 flex flex-col justify-center gap-0.5">
                      {events.map((ev, i) => (
                        <div
                          key={i}
                          className={cn(
                            'relative group/ev inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-[8px] leading-tight whitespace-nowrap rounded-sm',
                            EVENT_STYLES[ev.type],
                          )}
                        >
                          <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', EVENT_DOT[ev.type])} />
                          <span className="truncate max-w-[90px]">{ev.label}</span>
                          {/* tooltip */}
                          <div className="hidden group-hover/ev:block absolute bottom-full left-0 mb-1.5 bg-popover border border-border rounded p-2.5 z-50 w-48 shadow-lg pointer-events-none">
                            <div className="font-mono text-[9px] font-semibold text-foreground mb-1">{ev.label}</div>
                            <div className="text-[10px] text-muted-foreground leading-relaxed whitespace-normal">{ev.tip}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── People tab ──────────────────────────────────────────────────────────────

type SortKey = 'name' | 'co' | 'cluster' | 'signal';
const SIGNAL_ORDER: Record<SignalLevel, number> = { High: 0, Medium: 1, Low: 2 };

function PeopleTab() {
  const [query, setQuery] = useState('');
  const [signalFilter, setSignalFilter] = useState<SignalLevel | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('signal');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(true); }
  };

  const filtered = useMemo<DevRelPerson[]>(() => {
    const q = query.toLowerCase();
    return DEVREL_PEOPLE
      .filter((p) =>
        (signalFilter === 'all' || p.signal === signalFilter) &&
        (q === '' || p.name.toLowerCase().includes(q) || p.co.toLowerCase().includes(q) || p.stack.toLowerCase().includes(q)),
      )
      .sort((a, b) => {
        let cmp = 0;
        if (sortKey === 'signal') cmp = SIGNAL_ORDER[a.signal] - SIGNAL_ORDER[b.signal];
        else cmp = a[sortKey].localeCompare(b[sortKey]);
        return sortAsc ? cmp : -cmp;
      });
  }, [query, signalFilter, sortKey, sortAsc]);

  const ThCell = ({ k, label }: { k: SortKey; label: string }) => (
    <th
      onClick={() => handleSort(k)}
      className="text-left py-2 px-3 font-mono text-[9px] tracking-widest uppercase text-muted-foreground/50 cursor-pointer hover:text-muted-foreground transition-colors select-none whitespace-nowrap"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className={cn('w-2.5 h-2.5', sortKey === k ? 'text-primary' : 'opacity-30')} />
      </span>
    </th>
  );

  return (
    <div>
      {/* controls */}
      <div className="flex flex-wrap gap-3 items-center mb-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, company, stack…"
          className="bg-secondary border border-border text-sm px-3 py-1.5 w-56 font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60"
        />
        <div className="flex gap-2">
          {(['all','High','Medium','Low'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSignalFilter(s)}
              className={cn(
                'font-mono text-[10px] tracking-wider uppercase px-3 py-1 border transition-colors',
                signalFilter === s
                  ? 'border-primary/60 bg-primary/10 text-foreground'
                  : 'border-border bg-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {s === 'all' ? 'All' : `${s} signal`}
            </button>
          ))}
        </div>
        <span className="font-mono text-[9px] text-muted-foreground/40 ml-auto">{filtered.length} of {DEVREL_PEOPLE.length}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border/50">
              <ThCell k="name" label="Name" />
              <ThCell k="co" label="Company" />
              <ThCell k="cluster" label="Cluster" />
              <th className="text-left py-2 px-3 font-mono text-[9px] tracking-widest uppercase text-muted-foreground/50">Role</th>
              <ThCell k="signal" label="Signal" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={`${p.name}-${p.co}`} className="border-b border-border/20 hover:bg-secondary/40 transition-colors">
                <td className="py-2 px-3">
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                  >
                    {p.name}
                    <ExternalLink className="w-2.5 h-2.5 opacity-30" />
                  </a>
                  <div className="font-mono text-[8px] text-muted-foreground/40 mt-0.5">{p.platform}</div>
                </td>
                <td className="py-2 px-3 text-xs text-muted-foreground">{p.co}</td>
                <td className="py-2 px-3">
                  <span className="font-mono text-[9px] text-muted-foreground/60">{p.cluster}</span>
                </td>
                <td className="py-2 px-3 text-xs text-muted-foreground/70">{p.role}</td>
                <td className="py-2 px-3">
                  <span className={cn('font-mono text-[10px] font-semibold', SIGNAL_STYLE[p.signal])}>
                    {p.signal}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Acqui-hires tab ─────────────────────────────────────────────────────────
// Accordion groups — scan all acquirers at a glance, expand what you need.
// Default: all collapsed so the list breathes.

// Talent pipelines — editorial/structural data (no src/confidence needed).
// These are the programs where acqui-hire targets are intentionally built.
// Organised by programme type; "notable acqui-hire" examples where known.
type PipelineType = 'fellowship' | 'studio' | 'residency' | 'academic' | 'accelerator';
interface TalentPipeline {
  type: PipelineType;
  name: string;
  url: string;
  oneLiner: string;
  // Why acquirers watch this programme
  signal: string;
  // Real examples where alumni ended up in an acqui-hire (editorial, not claimed as verified)
  alumni?: string;
}

const PIPELINE_TYPE_LABELS: Record<PipelineType, string> = {
  fellowship:  'Fellowship',
  studio:      'Venture Studio',
  residency:   'AI Residency',
  academic:    'Academic Lab',
  accelerator: 'Accelerator',
};

const TALENT_PIPELINES: TalentPipeline[] = [
  // ── Fellowships — pre-team, deliberately acqui-hire-shaped ──────────────
  {
    type: 'fellowship',
    name: 'Entrepreneur First',
    url:  'https://www.joinef.com',
    oneLiner: 'Pre-team fellowship: you join solo, find a co-founder, get funded.',
    signal: 'Structurally produces teams with no cap table weight — easiest acqui-hire targets. London / Singapore / Paris cohorts. Many alumni end up at Anthropic, DeepMind, Meta FAIR.',
    alumni: 'Multiple EF alumni in Anthropic/Google acqui-hires 2023–2025',
  },
  {
    type: 'fellowship',
    name: 'South Park Commons',
    url:  'https://www.southparkcommons.com',
    oneLiner: 'Community for post-exit founders and ex-frontier-lab researchers exploring their next thing.',
    signal: 'High-signal pool: ex-OpenAI, ex-Anthropic, ex-Google Brain members incubating small bets. Acquirers treat SPC as a deal-sourcing channel.',
    alumni: 'Several SPC members were acqui-hired into frontier labs 2024–2025',
  },
  {
    type: 'fellowship',
    name: 'AI Grant',
    url:  'https://aigrant.com',
    oneLiner: 'Small non-dilutive grants for independent AI researchers.',
    signal: 'Solo researchers building technically deep, publishable work. Acquirers (especially Anthropic, Google) watch grant recipients as early-stage hiring signals.',
  },
  // ── Accelerators — early batches before product-market fit ──────────────
  {
    type: 'accelerator',
    name: 'Y Combinator — AI-heavy batches',
    url:  'https://www.ycombinator.com',
    oneLiner: 'Standard accelerator, but AI-focused companies now dominate W/S batches.',
    signal: 'YC AI companies with <$5M ARR and a strong technical team are frequent acqui-hire targets — especially if stuck in a crowded layer (evals, RAG middleware, fine-tuning tooling). Deals often close 12–18 months post-batch.',
    alumni: 'Context.ai (YC W23) → Google; Moonhub (YC W23) → acquired 2025',
  },
  {
    type: 'accelerator',
    name: 'NVIDIA Inception',
    url:  'https://www.nvidia.com/en-us/startups',
    oneLiner: 'NVIDIA\'s program for AI/data-science startups — compute credits + GTM support.',
    signal: 'Inception graduates building on CUDA, Triton, or NIM inference are natural acqui-hire candidates for NVIDIA itself or for inference-layer buyers (AWS, Azure). Acts as a deal pipeline for NVIDIA M&A.',
  },
  // ── Studios — build companies internally, spin them out ─────────────────
  {
    type: 'studio',
    name: 'Betaworks',
    url:  'https://betaworks.com',
    oneLiner: 'NYC venture studio that builds and invests in early-stage AI/tech companies.',
    signal: 'Studio builds often have product-ready code + small team + no distribution — exactly what acquirers want. Betaworks AI camp alumni include companies in NLP, content-moderation, and generative tools.',
  },
  {
    type: 'studio',
    name: 'Atomic',
    url:  'https://atomic.vc',
    oneLiner: 'Operator-led SF studio co-founding companies with ex-Google/Facebook executives.',
    signal: 'High operator pedigree. Atomic co-founders often have frontier-lab network effects — deals happen via relationship, not cold sourcing.',
  },
  {
    type: 'studio',
    name: 'Expa',
    url:  'https://expa.com',
    oneLiner: 'Studio co-founded by Garrett Camp (Uber); builds 3–5 companies per year.',
    signal: 'Consumer AI + marketplace bets. Small equity structure → acqui-hire is a clean exit path. Companies in the Expa portfolio with AI product talent are watched by consumer AI acquirers.',
  },
  {
    type: 'studio',
    name: 'Founders Factory',
    url:  'https://foundersfactory.com',
    oneLiner: 'Corporate-backed studio (Bupa, L\'Oreal, Aviva) building AI companies across health, beauty, finance.',
    signal: 'Health AI ventures are particularly acqui-hire-adjacent: built inside a large corporate, with regulatory exposure and clinical data access already in place. Bupa-backed ventures have direct pathway to health AI acquirers.',
  },
  // ── AI Residencies — employees who become founders ───────────────────────
  {
    type: 'residency',
    name: 'Google Brain / DeepMind Residency (alumni network)',
    url:  'https://research.google/programs-and-events/ai-residency',
    oneLiner: 'Former residency programme; alumni now founding companies across the AI stack.',
    signal: 'Brain/DM alumni who leave to found companies carry deep research credibility. When their startups stall at Series A (common in foundation model layer), they\'re natural acqui-hires back into Anthropic, OpenAI, Google.',
  },
  {
    type: 'residency',
    name: 'Meta FAIR / Fundamental AI Research alumni',
    url:  'https://ai.meta.com/research',
    oneLiner: 'FAIR researchers who exit Meta to start companies — often in vision, NLP, or multimodal.',
    signal: 'FAIR alumni founded Crossing Minds (→ Anthropic acqui-hire), Dreamer, and several multimodal startups. Acquirers (Anthropic, OpenAI) actively recruit from this pool.',
    alumni: 'Crossing Minds founders came from FAIR → acquired by Anthropic 2025',
  },
  // ── Academic Labs — deeptech IP + PhDs ────────────────────────────────────
  {
    type: 'academic',
    name: 'Stanford HAI — spinouts',
    url:  'https://hai.stanford.edu',
    oneLiner: 'Human-Centered AI Institute; frequent source of clinical AI and foundation-model spinouts.',
    signal: 'Stanford HAI spinouts often have clinical validation data and IRB-approved datasets — extremely high-value for medical AI acquirers (Google Health, Microsoft Nuance, Epic). Acqui-hire often bundles IP + team.',
  },
  {
    type: 'academic',
    name: 'CMU AIML / LTI Lab spinouts',
    url:  'https://www.ml.cmu.edu',
    oneLiner: 'Carnegie Mellon Machine Learning Department and Language Technologies Institute.',
    signal: 'CMU is historically the richest source of NLP + speech talent. LTI alumni founded companies in ASR, clinical NLP, and coding AI — all active acqui-hire targets.',
  },
];

const CAPABILITY_CLUSTERS = [
  { id: 'coding',     label: 'Coding AI',              desc: 'Runtime, IDE assistants, AI-native OS',          companies: ['Bun', 'Alex / Alex Codes', 'Software Applications Inc. / Sky'] },
  { id: 'agents',     label: 'Agents & Computer-use',  desc: 'Models that perceive and act across interfaces', companies: ['Vercept', 'Dreamer', 'Convogo', 'Crossing Minds'] },
  { id: 'evals',      label: 'Evals & Observability',  desc: 'Prompt management, LLM analytics, monitoring',   companies: ['Humanloop', 'Context.ai'] },
  { id: 'infra',      label: 'Inference & Efficiency', desc: 'GPU optimization, distributed compute, data',    companies: ['CentML', 'Illumex', 'Runhouse'] },
  { id: 'enterprise', label: 'Enterprise Agents',      desc: 'Workflow automation, RAG, hiring agents',        companies: ['Convergence.ai', 'Contextual AI', 'Moonhub'] },
  { id: 'medical',    label: 'Medical AI',             desc: 'Health records, life-sciences talent',           companies: ['Torch', 'Coefficient Bio'] },
  { id: 'voice',      label: 'Voice & Conversation',   desc: 'Real-time generative voice',                    companies: ['PlayAI'] },
  { id: 'consumer',   label: 'Consumer AI',            desc: 'Product talent, personalization, finance',       companies: ['Roi', 'Multi / Remotion', 'Global Illumination'] },
] as const;

// Colour-code acquirers so the eye can group deals visually without reading text
const ACQUIRER_DOT: Record<string, string> = {
  'Anthropic':    'bg-orange-400',
  'Google':       'bg-blue-400',
  'Microsoft':    'bg-sky-400',
  'OpenAI':       'bg-green-400',
  'Meta':         'bg-blue-600',
  'Amazon / AWS': 'bg-amber-400',
  'Salesforce':   'bg-cyan-400',
};
function AcquirerDot({ name }: { name: string }) {
  const cls = Object.entries(ACQUIRER_DOT).find(([k]) => name.startsWith(k))?.[1] ?? 'bg-muted-foreground/40';
  return <span className={cn('inline-block w-1.5 h-1.5 rounded-full flex-shrink-0', cls)} />;
}

function AcquihiresTab() {
  const included = useMemo(
    () => ACQUIHIRE_DEALS.filter(d => d.status !== 'Excluded'),
    [],
  );
  const excluded = useMemo(
    () => ACQUIHIRE_DEALS.filter(d => d.status === 'Excluded'),
    [],
  );
  const dealsByCompany = useMemo(() => {
    const m = new Map(included.map(d => [d.company, d]));
    return m;
  }, [included]);

  return (
    <div className="max-w-3xl space-y-10">

      {/* ── Provenance banner ───────────────────────────────────────────── */}
      <div className="border border-border/60 bg-secondary/20 px-4 py-3 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-muted-foreground">
        <span><span className="text-foreground/70 font-medium">Source</span> — ai_acquihire_dataset_updated.xlsx · public announcements only</span>
        <span><span className="text-foreground/70 font-medium">Verification</span> — URLs extracted from source file; not yet uploaded to Airtable</span>
        <span><span className="text-foreground/70 font-medium">Scope</span> — team acquisitions by AI companies, {ACQUIHIRE_STATS.dateRange}</span>
        <span><span className="text-foreground/70 font-medium">Confidence</span> — shown per deal as rated in source file</span>
      </div>

      {/* ── Stat strip ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-6">
        {[
          { n: ACQUIHIRE_STATS.totalDeals,    label: 'deals in dataset' },
          { n: ACQUIHIRE_STATS.totalFounders, label: 'founders tracked' },
          { n: '8',                           label: 'capability clusters' },
        ].map(({ n, label }) => (
          <div key={label}>
            <div className="text-2xl font-bold text-foreground leading-none">{n}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Capability clusters — first two open by default ─────────────── */}
      <div>
        <div className="text-xs font-medium text-muted-foreground mb-3">By capability cluster</div>
        <Accordion type="multiple" defaultValue={['coding', 'agents']} className="space-y-1.5">
          {CAPABILITY_CLUSTERS.map(cluster => {
            const deals = cluster.companies
              .map(c => dealsByCompany.get(c))
              .filter((d): d is NonNullable<typeof d> => !!d)
              .sort((a, b) => b.date.localeCompare(a.date));

            if (deals.length === 0) return null;
            const companyNames = deals.map(d => d.company).join(', ');

            return (
              <AccordionItem
                key={cluster.id}
                value={cluster.id}
                className="border border-border rounded-none bg-card"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-secondary/40 transition-colors [&[data-state=open]]:bg-secondary/20 group">
                  <div className="flex flex-col items-start text-left gap-1 flex-1 pr-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-semibold">{cluster.label}</span>
                      <span className="text-xs text-muted-foreground/60">
                        {deals.length} deal{deals.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    {/* Company preview — visible when collapsed */}
                    <span className="text-xs text-muted-foreground/50 group-[[data-state=open]]:hidden">
                      {companyNames}
                    </span>
                    <span className="text-xs text-muted-foreground/40 hidden group-[[data-state=open]]:block">
                      {cluster.desc}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-0">
                  <div className="divide-y divide-border/30">
                    {deals.map(d => (
                      <div key={d.company} className="px-4 py-4 flex items-start gap-4">

                        {/* Left: company + meta */}
                        <div className="w-36 shrink-0 space-y-1">
                          <div className="text-sm font-semibold text-foreground leading-snug">
                            {d.company}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <AcquirerDot name={d.acquirer} />
                            <span className="text-xs text-muted-foreground">{d.acquirer}</span>
                          </div>
                          <div className="text-xs text-muted-foreground/40">{d.date.slice(0, 7)}</div>
                          {/* Confidence — shown as-is from source, not interpreted */}
                          <span className="inline-block font-mono text-[9px] tracking-wide px-1.5 py-0.5 border border-border/50 text-muted-foreground/50">
                            {d.confidence}
                          </span>
                        </div>

                        {/* Right: capability + founders */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <p className="text-sm text-foreground/90 leading-snug">
                            {d.capability}
                          </p>
                          {d.founders && (
                            <p className="text-xs text-muted-foreground/50">
                              {d.founders}
                            </p>
                          )}
                          {d.notes && (
                            <p className="text-xs text-muted-foreground/35 italic">{d.notes}</p>
                          )}
                        </div>

                        {/* Source link */}
                        {d.src && (
                          <a
                            href={d.src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground/30 hover:text-muted-foreground transition-colors shrink-0 mt-0.5"
                            title="Primary source"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* ── Excluded — dashed, collapsed ────────────────────────────────── */}
      <div>
        <Accordion type="single" collapsible>
          <AccordionItem value="excluded" className="border border-dashed border-border/40 rounded-none">
            <AccordionTrigger className="px-4 py-2.5 hover:no-underline hover:bg-secondary/20 transition-colors">
              <span className="text-xs text-muted-foreground/50">
                Large deals excluded from main set — {excluded.length} reference patterns
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3 pt-2">
                {excluded.map(d => (
                  <div key={d.company} className="flex items-start gap-3">
                    <span className="text-xs text-muted-foreground/30 shrink-0 w-16 mt-0.5">{d.date.slice(0,7)}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-muted-foreground/60">{d.company}</span>
                      <span className="text-xs text-muted-foreground/30"> → {d.acquirer}</span>
                      {d.notes && <p className="text-xs text-muted-foreground/40 mt-0.5 leading-relaxed">{d.notes}</p>}
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* ── Talent Pipelines ─────────────────────────────────────────────── */}
      <div className="border-t border-border pt-8">
        <div className="mb-1">
          <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/50">
            Talent Pipelines
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Where acqui-hire targets are built before they have a cap table problem —
          fellowships, studios, and residencies that frontier labs treat as deal-sourcing channels.
        </p>

        {(['fellowship', 'accelerator', 'studio', 'residency', 'academic'] as PipelineType[]).map(type => {
          const items = TALENT_PIPELINES.filter(p => p.type === type);
          if (items.length === 0) return null;
          return (
            <div key={type} className="mb-6">
              {/* Type header */}
              <div className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/40 mb-2">
                {PIPELINE_TYPE_LABELS[type]}
              </div>
              {/* Flat list — one row per program */}
              <div className="space-y-0 border border-border divide-y divide-border/50">
                {items.map(p => (
                  <div key={p.name} className="flex items-start gap-4 px-4 py-3 hover:bg-secondary/30 transition-colors">
                    {/* Name */}
                    <div className="w-44 shrink-0">
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                      >
                        {p.name}
                        <ExternalLink className="w-2.5 h-2.5 opacity-30" />
                      </a>
                    </div>
                    {/* Signal */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-xs text-muted-foreground leading-relaxed">{p.oneLiner}</p>
                      <p className="text-xs text-muted-foreground/60 leading-relaxed">{p.signal}</p>
                      {p.alumni && (
                        <p className="text-xs text-muted-foreground/40 italic">{p.alumni}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const FoundersDevRel = () => (
  <Layout>
    <div className="container py-12 md:py-16">
      <FounderToolkitNav />

      <PageHeader
        eyebrow="Founder Toolkit · Tech Signals"
        title="AI talent movements and developer platform signals"
        subtitle="Two datasets: team acquisitions by AI companies (public announcements, 2023–2026) and Developer Advocate activity by vendor (editorial survey, May 2026)."
      />

      <Tabs defaultValue="acquihires" className="mt-8">
        <TabsList className="mb-6">
          <TabsTrigger value="acquihires">Acqui-hires · {ACQUIHIRE_STATS.totalDeals} deals</TabsTrigger>
          <TabsTrigger value="atlas">DevRel Atlas · 9 clusters</TabsTrigger>
        </TabsList>

        <TabsContent value="acquihires"><AcquihiresTab /></TabsContent>
        <TabsContent value="atlas"><AtlasTab /></TabsContent>
      </Tabs>

      <div className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground/50 leading-relaxed space-y-1.5">
        <p><span className="text-muted-foreground/70 font-medium">Acqui-hires methodology</span> — public announcements only. Confidence level is as rated in the source spreadsheet. Deals where structure is disputed are marked "needs review". Secondary sources linked where available.</p>
        <p><span className="text-muted-foreground/70 font-medium">DevRel methodology</span> — 29 named advocates across 14 vendors surveyed over 12–18 months of published content. Editorial analysis, not automated. Down-weighted: quickstarts, keynotes. Up-weighted: architecture deep-dives, production deployment guides.</p>
        <p><span className="text-muted-foreground/70 font-medium">Gaps noted</span> — Databricks Mosaic AI and Meta Llama have no named advocate with public technical content despite strong platform investment.</p>
      </div>
    </div>
  </Layout>
);

export default FoundersDevRel;
