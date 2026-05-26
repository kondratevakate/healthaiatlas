// Founder Toolkit → DevRel Signal Hub
//
// 29 named Developer Advocates across 14 AI vendors — vendor positioning map
// for founders who need to read where technical momentum is being manufactured.
//
// Three tabs mirror the original editorial structure:
//   Atlas     — cluster cards (what skills each vendor is building demand for)
//   Timeline  — chronological events 2021–2026 (talent moves are leading indicators)
//   People    — sortable roster with signal rating
//
// Data: frontend/src/data/devrelSignal.ts  (static, manually curated May 2026)

import { useState, useMemo } from 'react';
import { ExternalLink, ArrowUpDown } from 'lucide-react';

import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/shared/PageHeader';
import { FounderToolkitNav } from '@/components/shared/FounderToolkitNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

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

  const visible = (cos: string[]) =>
    vendorFilter === 'all' || cos.includes(vendorFilter);

  return (
    <div>
      {/* legend */}
      <div className="flex flex-wrap gap-4 mb-5 text-xs font-mono text-muted-foreground">
        <span>Intensity ●●● strong &nbsp;●●○ moderate &nbsp;●○○ weak</span>
        <span className="text-red-400/70">Gap = significant investment, no named DevRel yet</span>
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

// ─── Page ────────────────────────────────────────────────────────────────────

const FoundersDevRel = () => (
  <Layout>
    <div className="container py-12 md:py-16">
      <FounderToolkitNav />

      <PageHeader
        eyebrow="Founder Toolkit · DevRel Signal"
        title="Where AI vendors are manufacturing developer demand"
        subtitle="29 named Developer Advocates · 14 vendors · 12–18 months of hands-on content surveyed. Vendor positioning map — not a labor-scarcity prediction."
      />

      <Tabs defaultValue="atlas" className="mt-8">
        <TabsList className="mb-6">
          <TabsTrigger value="atlas">Atlas · 10 clusters</TabsTrigger>
          <TabsTrigger value="timeline">Timeline · 2021–2026</TabsTrigger>
          <TabsTrigger value="people">People · 29</TabsTrigger>
        </TabsList>

        <TabsContent value="atlas"><AtlasTab /></TabsContent>
        <TabsContent value="timeline"><TimelineTab /></TabsContent>
        <TabsContent value="people"><PeopleTab /></TabsContent>
      </Tabs>

      <div className="mt-12 border-t border-border pt-6 font-mono text-[10px] text-muted-foreground/40 leading-relaxed space-y-1">
        <p><span className="text-muted-foreground/60">Methodology</span> — 29 named DevRel advocates across 14 vendors, 12–18 months of hands-on content. Down-weighted: quickstarts, keynotes. Up-weighted: architecture deep-dives, kernel-level posts, production deployment guides.</p>
        <p><span className="text-muted-foreground/60">Gaps</span> — Databricks Mosaic AI and Meta Llama have no named advocate despite strong investment.</p>
        <p><span className="text-muted-foreground/60">Structural gap</span> — Vertex AI MLOps: Priyanka Vergadia (former lead) departed Google for Microsoft Azure 2024, no replacement identified.</p>
      </div>
    </div>
  </Layout>
);

export default FoundersDevRel;
