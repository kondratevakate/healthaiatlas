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

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Cpu, Stethoscope, ExternalLink, GitCompare, Database, Skull } from 'lucide-react';

import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/shared/PageHeader';
import { FounderToolkitNav } from '@/components/shared/FounderToolkitNav';
import { SuggestActions } from '@/components/shared/SuggestActions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LastUpdated } from '@/components/shared/LastUpdated';
import { AIRTABLE_PROVENANCE_URL } from '@/data/constants';

import { FounderMatrix, UsTimeline, UsSidebar } from '@/components/context-us';
import { MarketReality } from '@/components/context-uae';
import { EuFounderMap, SwissAnimal } from '@/components/context-eu';
import { UkFounderMap } from '@/components/context-uk';
import { ComparativeMatrix } from '@/components/context-compare';
import { DeadValleyView } from '@/components/dead-valley';
import {
  ArchitectureRevenueMap,
  ArchitectureSidebar,
} from '@/components/context-architecture';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { PM_GEO } from '@/data/processMining';

type Side = 'ai' | 'healthcare';
type RegionId = 'compare' | 'uae' | 'eu' | 'ch' | 'uk' | 'us' | 'cn' | 'dead-valley';

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
  { id: 'dead-valley', label: 'Dead Valley', oneLiner: 'Every shutdown, SPAC collapse and fire-sale the Atlas tracks — read for patterns, not nostalgia. $50B+ value destroyed across four classes of death.' },
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
  const [selectedArchId, setSelectedArchId] = useState<string | null>(null);
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
        <FounderToolkitNav />

        <PageHeader
          eyebrow="Founder Toolkit"
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
                    {r.id === 'dead-valley' && <Skull className="w-3.5 h-3.5" />}
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
                  {r.id === 'dead-valley' && <DeadValleyView />}
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
                AI architectures plotted against the revenue actually attributed to
                them. Bubble area = visible $ tied to the architecture; vertical
                position = research-paper visibility. Click a bubble for methodology
                notes and sources.
              </p>
            </div>

            {/* AI side now leads with the Architecture × Revenue map — the actual
                dataset the Atlas ships, not pointer cards to medRxiv/arXiv. The
                two-pane resizable layout mirrors how this view is rendered on
                /context, so the canonical UX is identical regardless of the
                entry point a founder uses. */}
            <ResizablePanelGroup
              direction="horizontal"
              className="min-h-[700px] rounded-none border border-border bg-background"
            >
              <ResizablePanel defaultSize={68} minSize={50}>
                <div className="p-6 md:p-8 overflow-y-auto h-full">
                  <ArchitectureRevenueMap
                    selectedArchId={selectedArchId}
                    onSelect={setSelectedArchId}
                  />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={32} minSize={25} maxSize={45}>
                <div className="h-full overflow-y-auto bg-secondary/20">
                  <div className="sticky top-0 bg-secondary/80 backdrop-blur-sm p-4 border-b z-10">
                    <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      {selectedArchId ? 'Architecture detail' : 'Methodology & legend'}
                    </h2>
                  </div>
                  <ArchitectureSidebar
                    selectedArchId={selectedArchId}
                    onClose={() => setSelectedArchId(null)}
                  />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>

            {/* Pointer footer — readers who want the raw research stream still
                get there in one click, but they're not the headline anymore. */}
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <span className="text-muted-foreground">Raw research streams:</span>
              <a
                href="https://www.medrxiv.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                medRxiv
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://arxiv.org/list/cs.LG/recent"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                arXiv cs.LG
                <ExternalLink className="w-3 h-3" />
              </a>
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
