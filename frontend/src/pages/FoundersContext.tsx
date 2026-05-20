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
import { ArrowLeft, ArrowRight, Cpu, Stethoscope, ExternalLink } from 'lucide-react';

import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/shared/PageHeader';
import { SuggestActions } from '@/components/shared/SuggestActions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LastUpdated } from '@/components/shared/LastUpdated';
import { ATLAS_NOTES_SUBSCRIBE_URL } from '@/data/constants';

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
      'Methods, models, technologies and editorial coverage of AI applied to medicine and life sciences.',
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

            {/* AI side — pointer layer. Structured technology coverage lives
                in the AI Life Sciences hub; long-form analysis lives in
                Atlas Notes. We don't duplicate that content here, just
                frame where to look. Future iterations can add a curated
                methods atlas (foundation models in clinical use, ML
                architectures by task, etc.) directly on this page. */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Link
                to="/directory?domain=ai-life-sciences"
                className="group border border-border bg-background p-6 hover:border-primary hover:shadow-md transition-all flex flex-col"
              >
                <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-2">
                  Methods · Technologies
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  AI Life Sciences hub
                </h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  Structured taxonomy: drug discovery, structural biology, generative biology, omics.
                  Players, methods, recent signals. The deepest AI-side data the Atlas carries today.
                </p>
                <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform">
                  Open the hub
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </div>
              </Link>

              <a
                href={ATLAS_NOTES_SUBSCRIBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group border border-border bg-background p-6 hover:border-primary hover:shadow-md transition-all flex flex-col"
              >
                <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-2">
                  Editorial · Long-form
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  Atlas Notes
                </h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  Long-form analysis of where AI is moving in healthcare — methods, model behaviour,
                  clinical-deployment realities. Author voice, with named takes you can argue with.
                </p>
                <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform">
                  Read on LinkedIn
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </div>
              </a>
            </div>

            <div className="border border-border/60 bg-secondary/30 p-6 max-w-3xl">
              <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-2">
                In preparation
              </div>
              <h3 className="text-base font-semibold mb-2">A curated methods atlas — coming next</h3>
              <p className="text-sm text-muted-foreground">
                Foundation models in clinical use; ML architectures by clinical task (imaging /
                language / genomics / signals); limitations and failure modes of AI in medicine.
                Will live directly on this tab. Until then, the AI Life Sciences hub and Atlas Notes
                cover the same ground from two different angles.
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
