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

import { useMemo } from 'react';
import { ExternalLink } from 'lucide-react';

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

import { DEVREL_CLUSTERS, DEVREL_PEOPLE } from '@/data/devrelSignal';
import { SuggestActions } from '@/components/shared/SuggestActions';
import { AIRTABLE_PROVENANCE_URL } from '@/data/constants';


// ─── Atlas tab ──────────────────────────────────────────────────────────────

function AtlasTab() {
  const main = DEVREL_CLUSTERS.filter((c) => !c.gap);
  const gaps = DEVREL_CLUSTERS.filter((c) => c.gap);

  return (
    <div>
      {/* cluster grid */}
      <div className="grid sm:grid-cols-2 gap-2">
        {main.map((c) => (
          <div
            key={c.id}
            className="bg-card border border-border p-4 flex flex-col gap-2.5 hover:-translate-y-px transition-transform"
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
              <div className="text-sm font-semibold leading-snug mb-0.5">{c.name}</div>
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
        {gaps.length > 0 && (
          <>
            <div className="col-span-full pt-6 pb-2 flex items-center gap-3">
              <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/40">
                Gaps — no named advocate identified in this survey
              </span>
              <div className="flex-1 h-px bg-border/50" />
            </div>
            {gaps.map((c) => (
              <div
                key={c.id}
                className="bg-card border border-dashed border-border/50 p-4 flex flex-col gap-2.5 opacity-60"
              >
                <span className="font-mono text-[9px] tracking-wide uppercase px-2 py-0.5 border w-fit border-red-900/40 bg-red-950/30 text-red-500">
                  Research gap
                </span>
                <div>
                  <div className="text-sm font-semibold text-red-300/60 leading-snug mb-0.5">{c.name}</div>
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

      {/* ── People — flat list, no filters ───────────────────────────────── */}
      <div className="mt-10 border-t border-border pt-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/50">
            Named advocates
          </span>
          <div className="flex-1 h-px bg-border/40" />
          <span className="font-mono text-[9px] text-muted-foreground/30">{DEVREL_PEOPLE.length} people</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/50">
                {['Name', 'Company', 'Role', 'Cluster'].map(h => (
                  <th key={h} className="text-left py-2 px-3 font-mono text-[9px] tracking-widest uppercase text-muted-foreground/40">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEVREL_PEOPLE.map((p) => (
                <tr key={`${p.name}-${p.co}`} className="border-b border-border/20 hover:bg-secondary/30 transition-colors">
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
                  </td>
                  <td className="py-2 px-3 text-xs text-muted-foreground">{p.co}</td>
                  <td className="py-2 px-3 text-xs text-muted-foreground/70">{p.role}</td>
                  <td className="py-2 px-3 text-xs text-muted-foreground/50">{p.cluster}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    <div className="space-y-10">

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
                <AccordionContent className="px-4 pb-4 pt-2">
                  <div className="grid sm:grid-cols-2 gap-2">
                    {deals.map(d => (
                      <div key={d.company} className="bg-card border border-border p-4 flex flex-col gap-2.5">
                        {/* Header: company + acquirer + date */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="text-sm font-semibold text-foreground leading-snug">{d.company}</div>
                            <div className="flex items-center gap-1.5">
                              <AcquirerDot name={d.acquirer} />
                              <span className="text-xs text-muted-foreground">{d.acquirer}</span>
                              <span className="text-xs text-muted-foreground/40">· {d.date.slice(0, 7)}</span>
                            </div>
                          </div>
                          {d.src && (
                            <a href={d.src} target="_blank" rel="noopener noreferrer"
                              className="text-muted-foreground/30 hover:text-muted-foreground transition-colors shrink-0"
                              title="Primary source">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        {/* Capability */}
                        <p className="text-xs text-muted-foreground leading-relaxed">{d.capability}</p>
                        {/* Founders */}
                        {d.founders && (
                          <p className="text-xs text-muted-foreground/50">{d.founders}</p>
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
        eyebrow="Founder Toolkit · Tech"
        title="AI talent movements and Developer Advocate activity"
      />

      <Tabs defaultValue="acquihires" className="mt-8">
        <TabsList className="w-max mb-8">
          <TabsTrigger value="acquihires">Acqui-hires · {ACQUIHIRE_STATS.totalDeals} deals</TabsTrigger>
          <TabsTrigger value="atlas">DevRel Atlas · {DEVREL_PEOPLE.length} advocates</TabsTrigger>
        </TabsList>

        <TabsContent value="acquihires"><AcquihiresTab /></TabsContent>
        <TabsContent value="atlas"><AtlasTab /></TabsContent>
      </Tabs>

      <SuggestActions className="mt-12" />

      {/* Data source link — small, unobtrusive, at the very bottom */}
      <div className="mt-6 text-xs text-muted-foreground/50">
        <a
          href={AIRTABLE_PROVENANCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-muted-foreground transition-colors"
        >
          Source data in Airtable
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  </Layout>
);

export default FoundersDevRel;
