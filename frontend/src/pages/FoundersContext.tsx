// Founder Toolkit → Context. Two-axis structure:
//
//   side:    'ai' | 'healthcare'   — the conceptual domain split
//   region:  'compare' | 'uae' | 'eu' | 'uk' | 'us'  — only on Healthcare
//
// URL state lives in searchParams (`?side=...&region=...`), so any
// combination is independently shareable. Default opens Healthcare →
// Compare so the founder sees the cross-region matrix first and picks a
// country to drill into, rather than landing in a single (currently UAE)
// country and wondering "why UAE?".
//
// Healthcare side re-uses pre-built founder-frame components:
//   compare  → ComparativeMatrix (5-region snapshot)
//   uae/eu/uk/us → MarketReality / EuFounderMap / UkFounderMap / FounderMatrix
// AI side is pointer-layered onto medRxiv + arXiv — no duplicate content.

import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Cpu, Stethoscope, ExternalLink, GitCompare, Database } from 'lucide-react';

import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/shared/PageHeader';
import { SuggestActions } from '@/components/shared/SuggestActions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LastUpdated } from '@/components/shared/LastUpdated';
import { AIRTABLE_PROVENANCE_URL } from '@/data/constants';

import { FounderMatrix, UsTimeline, UsSidebar } from '@/components/context-us';
import { MarketReality } from '@/components/context-uae';
import { EuFounderMap, SwissAnimal } from '@/components/context-eu';
import { UkFounderMap } from '@/components/context-uk';
import { ComparativeMatrix } from '@/components/context-compare';
import { PM_GEO } from '@/data/processMining';

type Side = 'ai' | 'healthcare';
type RegionId = 'compare' | 'uae' | 'eu' | 'ch' | 'uk' | 'us' | 'cn';

const SIDES: { id: Side; label: string; icon: typeof Cpu; oneLiner: string }[] = [
  {
    id: 'healthcare',
    label: 'Healthcare',
    icon: Stethoscope,
    oneLiner:
      'Country histories, regulators, procurement patterns, market reality. The world the AI is going into.',
  },
  {
    id: 'ai',
    label: 'AI',
    icon: Cpu,
    oneLiner:
      'The raw research stream — preprints and papers where the methods get developed before they hit clinical deployment.',
  },
];

const REGIONS: { id: RegionId; label: string; oneLiner: string }[] = [
  { id: 'compare', label: 'Compare', oneLiner: 'Five regions on one frame — TAM, regulator stack, exit ramp, founder reality. Read across before drilling into any single country.' },
  { id: 'us', label: 'US', oneLiner: 'Largest TAM, four-spoke decision matrix decides which one kills you. Timeline + horizons + decision matrix on one tab.' },
  { id: 'eu', label: 'EU', oneLiner: 'CEE is cheaper evidence; Switzerland is expensive credibility.' },
  { id: 'ch', label: 'Switzerland', oneLiner: 'Institutionally outside the EU. Expensive credibility, not cheap evidence — use for regulatory-passport plays, not for scaling.' },
  { id: 'uk', label: 'UK', oneLiner: 'NHS gravity well — one payer, slow procurement, brutal exit ramp (Babylon).' },
  { id: 'uae', label: 'UAE', oneLiner: 'The floor is too low for any spoke to matter at venture scale.' },
  { id: 'cn', label: 'China', oneLiner: 'NMPA pathway + JD/Alibaba/iFLYTEK gravity + Yiducloud as the cautionary IPO. Strong tailwinds, restricted access for non-resident founders.' },
];

// China data lives on the PM_GEO row today — extracted here for the
// stub China tab. When a full chinaMarketReality.ts is written this
// can be removed and replaced with a dedicated component.
const CHINA_GEO = PM_GEO.find((g) => g.n === 'China');

// China stub — first-pass coverage using the data already in
// processMining.ts (PM_GEO row for China). When a dedicated
// chinaMarketReality.ts is written, replace this with that
// component, the structure should mirror UAE / EU / UK.
function ChinaStub() {
  if (!CHINA_GEO) {
    return (
      <div className="border border-dashed border-border p-12 text-center text-muted-foreground text-sm">
        China data not yet available.
      </div>
    );
  }
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="border border-border p-5">
          <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1">
            HC AI market
          </div>
          <div className="text-3xl font-bold">{CHINA_GEO.mkt}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {CHINA_GEO.sh}% global share · {CHINA_GEO.buy} buyers
          </div>
        </div>
        <div className="border border-border p-5">
          <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1">
            Active vendors
          </div>
          <div className="text-sm space-y-1 font-medium">
            {CHINA_GEO.v.map((v) => (
              <div key={v}>{v}</div>
            ))}
          </div>
        </div>
        <div className="border border-destructive/40 p-5 bg-destructive/5">
          <div className="text-[10px] uppercase tracking-widest font-mono text-destructive mb-1">
            Cautionary tales
          </div>
          <div className="text-sm space-y-1">
            {CHINA_GEO.dv.map((v) => (
              <div key={v} className="text-muted-foreground">{v}</div>
            ))}
          </div>
        </div>
      </div>

      {CHINA_GEO.dl && (
        <div className="border border-border p-5">
          <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-2">
            Recent deal flow
          </div>
          <p className="text-sm">{CHINA_GEO.dl}</p>
        </div>
      )}

      {CHINA_GEO.cu && (
        <div className="border border-border p-5">
          <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-2">
            Customer signal
          </div>
          <p className="text-sm">{CHINA_GEO.cu}</p>
        </div>
      )}

      <div className="border border-border/60 bg-secondary/30 p-5">
        <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-2">
          In preparation
        </div>
        <h3 className="text-base font-semibold mb-2">Full China founder reality — coming next</h3>
        <p className="text-sm text-muted-foreground">
          NMPA approval pathway, BAT players (Baidu / Alibaba / Tencent) gravity, healthcare-AI
          regulation specifics for non-Chinese founders, IPO landscape post-Yiducloud. The view
          above is extracted from the process-mining geo dataset and lacks the depth UAE / EU /
          UK have. Reach out via Suggest entry if you want to contribute.
        </p>
      </div>
    </div>
  );
}

const FoundersContext = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const side: Side = (searchParams.get('side') as Side | null) === 'ai' ? 'ai' : 'healthcare';
  const region: RegionId = ((): RegionId => {
    const r = searchParams.get('region') as RegionId | null;
    return r && REGIONS.some((x) => x.id === r) ? r : 'compare';
  })();

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set(key, value);
    setSearchParams(next, { replace: false });
  };

  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <Link
          to="/founders"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group border border-border bg-background px-3 py-1.5 hover:border-foreground/40"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="font-medium">Back to Founder Toolkit</span>
        </Link>

        <PageHeader
          eyebrow="Founder Toolkit · Context"
          title="The world your AI is going into"
          subtitle="Two sides — the AI you're building, and the healthcare system that receives it. Pick the side you need to understand right now."
        />

        {/* Outer split: AI / Healthcare. This is the conceptual axis the
            founder picks first — "am I learning my technology stack, or am
            I learning the market that's going to buy/regulate it?". */}
        <Tabs value={side} onValueChange={(v) => updateParam('side', v)} className="mb-8">
          <TabsList className="rounded-none border border-border bg-background p-0 h-auto">
            {SIDES.map((s) => {
              const Icon = s.icon;
              return (
                <TabsTrigger
                  key={s.id}
                  value={s.id}
                  className="rounded-none px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none text-sm font-medium inline-flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {s.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="healthcare" className="mt-8">
            <div className="max-w-3xl mb-8 border-l-4 border-primary/60 pl-4">
              <p className="text-base italic text-foreground/80">
                {SIDES.find((s) => s.id === 'healthcare')!.oneLiner}
              </p>
            </div>

            {/* Inner axis: region. Compare is the default landing — five
                regions on one frame — so the founder reads across before
                picking a single country to drill into. UAE/EU/UK/US tabs
                are deep dives; the `compare` tab uses the existing
                cross-region ComparativeMatrix component. */}
            <Tabs value={region} onValueChange={(v) => updateParam('region', v)}>
              <TabsList className="rounded-none border border-border bg-background p-0 h-auto flex-wrap">
                {REGIONS.map((r) => (
                  <TabsTrigger
                    key={r.id}
                    value={r.id}
                    className="rounded-none px-5 py-3 data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary text-sm font-medium inline-flex items-center gap-2"
                  >
                    {r.id === 'compare' && <GitCompare className="w-3.5 h-3.5" />}
                    {r.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {REGIONS.map((r) => (
                <TabsContent key={r.id} value={r.id} className="mt-6">
                  <div className="max-w-3xl mb-6 text-sm text-muted-foreground border-l-2 border-border pl-3 italic">
                    {r.oneLiner}
                  </div>
                  {r.id === 'compare' && <ComparativeMatrix />}
                  {r.id === 'uae' && <MarketReality />}
                  {r.id === 'eu' && <EuFounderMap />}
                  {r.id === 'ch' && <SwissAnimal />}
                  {r.id === 'uk' && <UkFounderMap />}
                  {r.id === 'us' && (
                    <div className="space-y-12">
                      {/* US tab beefed up to parity with EU/UK/UAE:
                          decision matrix (FounderMatrix) → timeline
                          (UsTimeline) → policy horizons sidebar
                          (UsSidebar). The three pieces give a founder
                          the static decision, the moving history, and
                          the active policy front in one view. */}
                      <FounderMatrix />
                      <UsTimeline />
                      <UsSidebar />
                    </div>
                  )}
                  {r.id === 'cn' && <ChinaStub />}
                </TabsContent>
              ))}
            </Tabs>

            {/* Provenance footer — Airtable canonical store. Every row
                on the country tabs above is derived from this base via
                scripts/zerotrust/from_airtable.py. Sources are linked
                inline on each row's `src` URL; this is the primary
                channel for readers who want the raw verified dataset. */}
            <div className="mt-12 border border-border/60 bg-secondary/30 p-5 max-w-3xl">
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1">
                    Primary sources
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Every country row above is held in a Zero-Trust Airtable base — each entry
                    carries a primary <code className="text-xs font-mono">src</code> URL on the
                    issuer's domain plus a <code className="text-xs font-mono">verifiedAt</code> stamp.
                    The frontend data is regenerated from the base; the base is canonical.
                  </p>
                  <a
                    href={AIRTABLE_PROVENANCE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    Open the canonical Airtable base
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="mt-8">
            <div className="max-w-3xl mb-8 border-l-4 border-primary/60 pl-4">
              <p className="text-base italic text-foreground/80">
                {SIDES.find((s) => s.id === 'ai')!.oneLiner}
              </p>
            </div>

            {/* AI side — pointer layer to academic literature. medRxiv is
                where new clinical-AI methods land before peer review;
                arXiv is where the foundation-model and ML-method papers
                develop. The Atlas doesn't duplicate paper feeds — it
                frames where to look. A curated papers atlas (key
                healthcare-AI papers indexed by clinical task) is in
                preparation and will live directly on this tab. */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <a
                href="https://www.medrxiv.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="group border border-border bg-background p-6 hover:border-primary hover:shadow-md transition-all flex flex-col"
              >
                <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-2">
                  Health preprints
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  medRxiv
                </h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  The preprint server for the health sciences. Where new methods, validation studies
                  and clinical deployment papers land before peer review. The freshest signal in
                  healthcare AI — read for what's being attempted right now.
                </p>
                <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform">
                  Browse medRxiv
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </div>
              </a>

              <a
                href="https://arxiv.org/list/cs.LG/recent"
                target="_blank"
                rel="noopener noreferrer"
                className="group border border-border bg-background p-6 hover:border-primary hover:shadow-md transition-all flex flex-col"
              >
                <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-2">
                  ML method papers
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  arXiv (cs.LG · q-bio)
                </h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  Foundation-model architectures, transformer variants, quantitative-biology methods.
                  Read for what's technically possible; medRxiv for what's clinically validated. Most
                  healthcare-AI methods originate here months before they appear on medRxiv.
                </p>
                <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform">
                  Browse arXiv
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </div>
              </a>
            </div>

            <div className="border border-border/60 bg-secondary/30 p-6 max-w-3xl">
              <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-2">
                In preparation
              </div>
              <h3 className="text-base font-semibold mb-2">A curated papers atlas — coming next</h3>
              <p className="text-sm text-muted-foreground">
                The seminal papers a healthcare-AI founder should know — foundation models in
                clinical use, the imaging classics, LLM-in-medicine benchmarks, the failure-mode
                papers. Indexed by clinical task and method, every entry sourced to its original
                publication. Will live directly on this tab.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <LastUpdated section="context" />

        <div className="mt-10">
          <SuggestActions />
        </div>
      </div>
    </Layout>
  );
};

export default FoundersContext;
