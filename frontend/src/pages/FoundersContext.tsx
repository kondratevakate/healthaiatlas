// Founder Toolkit → Context. Two-axis structure:
//
//   side:    'ai' | 'healthcare'   — the conceptual domain split
//   region:  'uae' | 'eu' | 'uk' | 'us'  — only meaningful inside Healthcare
//
// URL state lives in searchParams (`?side=...&region=...`), so any
// combination is independently shareable. Default opens Healthcare → UAE
// because that's where the data coverage is deepest today.
//
// Healthcare side re-uses the four pre-built founder-frame components
// (FounderMatrix / MarketReality / EuFounderMap / UkFounderMap). AI side is
// pointer-layered onto the existing AI Life Sciences hub and Atlas Notes —
// no duplicate content; this page just frames where to look.

import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Cpu, Stethoscope, ExternalLink } from 'lucide-react';

import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/shared/PageHeader';
import { SuggestActions } from '@/components/shared/SuggestActions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LastUpdated } from '@/components/shared/LastUpdated';

import { FounderMatrix } from '@/components/context-us';
import { MarketReality } from '@/components/context-uae';
import { EuFounderMap } from '@/components/context-eu';
import { UkFounderMap } from '@/components/context-uk';

type Side = 'ai' | 'healthcare';
type RegionId = 'uae' | 'eu' | 'uk' | 'us';

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
  { id: 'uae', label: 'UAE', oneLiner: 'The floor is too low for any spoke to matter at venture scale.' },
  { id: 'eu', label: 'EU', oneLiner: 'CEE is cheaper evidence; Switzerland is expensive credibility.' },
  { id: 'uk', label: 'UK', oneLiner: 'NHS gravity well — one payer, slow procurement, brutal exit ramp (Babylon).' },
  { id: 'us', label: 'US', oneLiner: 'Largest TAM, four-spoke decision matrix decides which one kills you.' },
];

const FoundersContext = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const side: Side = (searchParams.get('side') as Side | null) === 'ai' ? 'ai' : 'healthcare';
  const region: RegionId = ((): RegionId => {
    const r = searchParams.get('region') as RegionId | null;
    return r && REGIONS.some((x) => x.id === r) ? r : 'uae';
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

            {/* Inner axis: region. Only meaningful on the Healthcare side —
                each region carries its own regulators, procurement
                patterns, and founder takeaways. */}
            <Tabs value={region} onValueChange={(v) => updateParam('region', v)}>
              <TabsList className="rounded-none border border-border bg-background p-0 h-auto flex-wrap">
                {REGIONS.map((r) => (
                  <TabsTrigger
                    key={r.id}
                    value={r.id}
                    className="rounded-none px-5 py-3 data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary text-sm font-medium"
                  >
                    {r.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {REGIONS.map((r) => (
                <TabsContent key={r.id} value={r.id} className="mt-6">
                  <div className="max-w-3xl mb-6 text-sm text-muted-foreground border-l-2 border-border pl-3 italic">
                    {r.oneLiner}
                  </div>
                  {r.id === 'uae' && <MarketReality />}
                  {r.id === 'eu' && <EuFounderMap />}
                  {r.id === 'uk' && <UkFounderMap />}
                  {r.id === 'us' && <FounderMatrix />}
                </TabsContent>
              ))}
            </Tabs>
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
