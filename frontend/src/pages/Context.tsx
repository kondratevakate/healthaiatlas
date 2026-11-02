// RETIRED PAGE (roadmap H, P1a) ───────────────────────────────────────────────
// Context now lives INSIDE the Founder Toolkit: the canonical page is
// FoundersContext at /founders/context (see App.tsx). The top-level /context
// route renders RedirectToFoundersContext, so this component is no longer
// routed — it is kept only as the migration source for anything not yet
// ported into FoundersContext. Do not re-route it; port from it instead.
// -----------------------------------------------------------------------------
import { Layout } from '@/components/layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { timelineEvents, stageConfig } from '@/data/timeline';
import { visionTargets, budgetAllocations, strategicPillars, visionStats } from '@/data/vision2030';
import { cn } from '@/lib/utils';
import { LastUpdated } from '@/components/shared/LastUpdated';
import { SuggestActions } from '@/components/shared/SuggestActions';
import { PageHeader } from '@/components/shared/PageHeader';
import { UsTimeline, UsSidebar, FounderMatrix } from '@/components/context-us';
import { MarketReality } from '@/components/context-uae';
import { EuFounderMap, EuSidebar } from '@/components/context-eu';
import { UkFounderMap, UkSidebar } from '@/components/context-uk';
import { ComparativeMatrix } from '@/components/context-compare';
import { ArchitectureRevenueMap, ArchitectureSidebar } from '@/components/context-architecture';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from '@/components/ui/resizable';
import {
  Target,
  TrendingUp,
  DollarSign,
  Building2,
  Brain,
  Monitor,
  Dna,
  Users,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

// Import timeline images
import ministryHealthImg from '@/assets/timeline/ministry-health.jpg';
import sehaHospitalImg from '@/assets/timeline/seha-hospital.jpg';
import clevelandClinicImg from '@/assets/timeline/cleveland-clinic.jpg';
import nabidhPlatformImg from '@/assets/timeline/nabidh-platform.jpg';
import aiStrategyImg from '@/assets/timeline/ai-strategy.jpg';
import g42HealthcareImg from '@/assets/timeline/g42-healthcare.jpg';
import mbzuaiImg from '@/assets/timeline/mbzuai.jpg';
import covidResponseImg from '@/assets/timeline/covid-response.jpg';
import genomeProjectImg from '@/assets/timeline/genome-project.jpg';
import telemedicineAppImg from '@/assets/timeline/telemedicine-app.jpg';
import aiInvestmentImg from '@/assets/timeline/ai-investment.jpg';

const CORAL_ACCENT = 'hsl(14, 90%, 55%)';

const eventImages: Record<string, string> = {
  'mohap-founded': ministryHealthImg,
  'seha-founded': sehaHospitalImg,
  'cleveland-clinic-opens': clevelandClinicImg,
  'nabidh-launch': nabidhPlatformImg,
  'doh-ai-strategy': aiStrategyImg,
  'g42-healthcare-founded': g42HealthcareImg,
  'mbzuai-founded': mbzuaiImg,
  'covid-ai-response': covidResponseImg,
  'g42-genome-project': genomeProjectImg,
  'astra-tech-launch': telemedicineAppImg,
  'uae-ai-health-investment': aiInvestmentImg,
};

const pillarIcons: Record<string, React.ReactNode> = {
  'monitor': <Monitor className="h-5 w-5" />,
  'brain': <Brain className="h-5 w-5" />,
  'dna': <Dna className="h-5 w-5" />,
  'users': <Users className="h-5 w-5" />,
};

function TimelineEventCard({
  event, 
  index,
}: { 
  event: typeof timelineEvents[0];
  index: number;
}) {
  const { language } = useLanguage();
  const image = eventImages[event.id];
  const isEven = index % 2 === 0;
  const stageLabel = stageConfig[event.stage || 'foundation'].label[language];

  return (
    <motion.div
      className={cn(
        "relative grid gap-6 items-center",
        "md:grid-cols-2"
      )}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <div className="hidden md:block absolute left-1/2 top-1/2 w-8 h-0.5 bg-border -translate-x-1/2" />
      
      <div className={cn(
        "relative overflow-hidden",
        isEven ? "md:order-1" : "md:order-2"
      )}>
        {image && (
          <motion.div
            className="relative aspect-[4/3] overflow-hidden"
            whileHover={{ scale: 1.02 }}
          >
            <img 
              src={image} 
              alt={event.title[language]}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm px-2 py-1">
              <span className="font-mono text-xs font-semibold">{event.year}</span>
            </div>
          </motion.div>
        )}
      </div>

      <div className={cn(
        "space-y-3",
        isEven ? "md:order-2 md:pl-6" : "md:order-1 md:pr-6 md:text-right"
      )}>
        <div className={cn(
          "inline-flex items-center gap-2",
          !isEven && "md:flex-row-reverse"
        )}>
          <span 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: CORAL_ACCENT }}
          />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {stageLabel}
          </span>
        </div>

        <h3 className="font-serif text-lg font-semibold text-foreground leading-tight">
          {event.title[language]}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {event.description[language]}
        </p>

        <div className={cn(
          "flex flex-wrap gap-1",
          !isEven && "md:justify-end"
        )}>
          <span className="px-2 py-0.5 text-xs bg-secondary uppercase tracking-wider">
            {event.type}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function VisionSidebar() {
  const { language } = useLanguage();

  return (
    <div className="space-y-6 p-4">
      {/* Total Investment */}
      <Card className="border-2 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Total Investment
            </span>
          </div>
          <p className="text-3xl font-bold text-primary">{visionStats.totalInvestment.amount}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {visionStats.totalInvestment.label[language]}
          </p>
        </CardContent>
      </Card>

      {/* Vision 2030 Targets */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Vision 2030 Targets
          </h3>
        </div>
        <div className="space-y-3">
          {visionTargets.slice(0, 4).map((target) => {
            const current = parseInt(target.current || '0');
            const goal = parseInt(target.target);
            const progress = (current / goal) * 100;
            
            return (
              <div key={target.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate pr-2">
                    {target.label[language]}
                  </span>
                  <span className="font-medium text-foreground flex-shrink-0">
                    {target.target}
                  </span>
                </div>
                <Progress value={Math.min(progress, 100)} className="h-1.5" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Current: {target.current}</span>
                  <span>By {target.by}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Budget Allocation */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Budget Allocation
          </h3>
        </div>
        <div className="space-y-2">
          {budgetAllocations.map((budget) => (
            <div 
              key={budget.year} 
              className="flex items-center justify-between p-2 bg-secondary/50 rounded-sm"
            >
              <div>
                <p className="font-medium text-sm">{budget.year}</p>
                <p className="text-xs text-muted-foreground">{budget.focus[language]}</p>
              </div>
              <Badge variant="outline" className="font-mono">
                {budget.amount}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Pillars */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Strategic Pillars
          </h3>
        </div>
        <div className="space-y-2">
          {strategicPillars.map((pillar) => (
            <Card key={pillar.id} className="border">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <div className="text-primary flex-shrink-0">
                    {pillarIcons[pillar.icon]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{pillar.title[language]}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {pillar.description[language]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Key Partners */}
      <div>
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
          Key Partners
        </h3>
        <div className="flex flex-wrap gap-1">
          {visionStats.keyPartners.map((partner) => (
            <Badge key={partner} variant="secondary" className="text-xs">
              {partner}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

type ContextRegion = 'us' | 'uae' | 'eu' | 'uk' | 'compare' | 'arch';

const REGION_OPTIONS: { id: ContextRegion; label: string; flag: string; available: boolean }[] = [
  { id: 'us', label: 'US', flag: '🇺🇸', available: true },
  { id: 'eu', label: 'EU + CH', flag: '🇪🇺', available: true },
  { id: 'uk', label: 'UK', flag: '🇬🇧', available: true },
  { id: 'uae', label: 'UAE', flag: '🇦🇪', available: true },
  { id: 'compare', label: 'Compare', flag: '📊', available: true },
  { id: 'arch', label: 'Architecture × Revenue', flag: '📈', available: true },
];

const REGION_SUBTITLES: Record<ContextRegion, { en: string; ar: string }> = {
  us: {
    en: 'How the FDA → AMA → CMS → payer chain decides whether a healthcare AI tool reaches a patient — and what it costs when it does. Every event in the timeline links to a primary source.',
    ar: 'كيف تحدد سلسلة FDA → AMA → CMS → شركات التأمين ما إذا كانت أداة الذكاء الاصطناعي الصحي تصل إلى المريض — وكم تكلف عندما تصل. كل حدث في الجدول الزمني مرتبط بمصدر أولي.',
  },
  uae: {
    en: 'Where a UAE healthcare-AI founder actually stands — market scale, procurement reality, accelerator outcomes — anchored in primary sources. The Vision 2030 narrative below sits underneath this floor.',
    ar: 'أين يقف مؤسس الذكاء الاصطناعي الصحي في الإمارات فعلياً — حجم السوق، واقع المشتريات، نتائج المسرّعات — مستندة إلى مصادر أولية. سرد رؤية 2030 أدناه يقع تحت هذه الأرضية.',
  },
  eu: {
    en: 'How the AI Act + EHDS + HTAR + MDR/IVDR rulebook stacks for healthcare-AI founders — and why Switzerland is a separate institutional animal even though it sits in the middle of Europe.',
    ar: 'كيف تتكدس قواعد قانون الذكاء الاصطناعي + EHDS + HTAR + MDR/IVDR لمؤسسي الذكاء الاصطناعي الصحي — ولماذا تعد سويسرا حيواناً مؤسسياً منفصلاً رغم موقعها في وسط أوروبا.',
  },
  uk: {
    en: 'Post-Brexit three-layer architecture — MHRA / NICE / NHS each on different timelines. NICE is a global HTA benchmark disproportionate to UK market size; Babylon is the bridge case to US SPAC era.',
    ar: 'بنية ثلاثية الطبقات بعد خروج بريطانيا من الاتحاد الأوروبي — MHRA / NICE / NHS، كل منها على جدول زمني مختلف. تُعد NICE معياراً عالمياً لتقييم التكنولوجيا الصحية يفوق حجم السوق البريطاني؛ وتُعد Babylon قضية جسر إلى عصر SPAC الأمريكي.',
  },
  compare: {
    en: 'Same questions, different answers per market. US · EU · Switzerland · UAE · UK side-by-side — eight rows that make the order-of-magnitude differences visible at a glance.',
    ar: 'نفس الأسئلة، إجابات مختلفة لكل سوق. الولايات المتحدة · الاتحاد الأوروبي · سويسرا · الإمارات · المملكة المتحدة جنباً إلى جنب — ثمانية صفوف تكشف الفروق بترتيب الحجم في لمحة.',
  },
  arch: {
    en: 'Global view — not regional. 22 canonical SOTA architectures plotted against 58 products that depend on them. Y is estimated attributable revenue (Bayesian, not measured). Toggle X between research volume and publication year. Click any bubble to see the products behind the estimate.',
    ar: 'عرض عالمي — لا إقليمي. ٢٢ بنية SOTA مرجعية مقابل ٥٨ منتجاً يعتمد عليها. المحور الصادي هو الإيراد المُسند المُقدَّر (بايزي، غير مُقاس). بدّل المحور السيني بين حجم الأبحاث وسنة النشر. اضغط على أي فقاعة لرؤية المنتجات وراء التقدير.',
  },
};

export default function Context() {
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  // P1a: the region-validation guard added in the P0 pass is reverted — it
  // existed only to stop ?region=cn|ch deep links from the old
  // /founders/context page blanking this page. /founders/context is canonical
  // again (FoundersContext has the China + Switzerland panels), so cn/ch are
  // valid values once more and this page is retired anyway.
  const region = (searchParams.get('region') as ContextRegion) ?? 'us';
  const setRegion = (r: ContextRegion) => {
    if (r === 'us') setSearchParams({});
    else setSearchParams({ region: r });
  };
  const [selectedArchId, setSelectedArchId] = useState<string | null>(null);

  const sortedEvents = useMemo(() =>
    [...timelineEvents].sort((a, b) => a.year - b.year),
    []
  );

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="container py-12 md:py-16">
          <PageHeader
            eyebrow="HealthAI Atlas"
            title={language === 'en' ? 'Context' : 'السياق'}
            subtitle={REGION_SUBTITLES[region][language]}
          />

          {/* Region selector (flags) */}
          <div className="flex flex-wrap gap-1">
            {REGION_OPTIONS.map((opt) => {
              const isActive = region === opt.id;
              const disabled = !opt.available;
              return (
                <button
                  key={opt.id}
                  onClick={() => opt.available && setRegion(opt.id)}
                  disabled={disabled}
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono border transition-colors',
                    isActive
                      ? 'bg-foreground text-background border-foreground'
                      : disabled
                      ? 'border-border text-muted-foreground/50 cursor-not-allowed'
                      : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
                  )}
                >
                  <span className="text-base leading-none">{opt.flag}</span>
                  {opt.label}
                  {disabled && <span className="text-[9px] uppercase tracking-widest opacity-80">soon</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* US healthcare AI decision-making — default tab */}
        {region === 'us' && (
          <section className="py-8">
            <div className="container">
              <ResizablePanelGroup
                direction="horizontal"
                className="min-h-[800px] rounded-lg border"
              >
                <ResizablePanel defaultSize={65} minSize={50}>
                  <div className="p-6 md:p-8 overflow-y-auto h-full">
                    <FounderMatrix />

                    <hr className="my-12 border-border" />

                    <UsTimeline />
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={35} minSize={25} maxSize={45}>
                  <div className="h-full overflow-y-auto bg-secondary/20">
                    <div className="sticky top-0 bg-secondary/80 backdrop-blur-sm p-4 border-b z-10">
                      <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Founder reference
                      </h2>
                    </div>
                    <UsSidebar />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </section>
        )}

        {/* Compare — 4-region side-by-side matrix */}
        {region === 'compare' && (
          <section className="py-8">
            <div className="container [&>*]:max-w-6xl">
              <ComparativeMatrix />
            </div>
          </section>
        )}

        {/* Architecture × Revenue — global view */}
        {region === 'arch' && (
          <section className="py-8">
            <div className="container">
              <ResizablePanelGroup
                direction="horizontal"
                className="min-h-[800px] rounded-lg border"
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
                      <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <ShieldAlert className="h-3.5 w-3.5" />
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
            </div>
          </section>
        )}

        {/* EU + Switzerland tab */}
        {region === 'eu' && (
          <section className="py-8">
            <div className="container">
              <ResizablePanelGroup
                direction="horizontal"
                className="min-h-[800px] rounded-lg border"
              >
                <ResizablePanel defaultSize={65} minSize={50}>
                  <div className="p-6 md:p-8 overflow-y-auto h-full">
                    <EuFounderMap />
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={35} minSize={25} maxSize={45}>
                  <div className="h-full overflow-y-auto bg-secondary/20">
                    <div className="sticky top-0 bg-secondary/80 backdrop-blur-sm p-4 border-b z-10">
                      <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        EU regulatory pillars
                      </h2>
                    </div>
                    <EuSidebar />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </section>
        )}

        {/* UK tab */}
        {region === 'uk' && (
          <section className="py-8">
            <div className="container">
              <ResizablePanelGroup
                direction="horizontal"
                className="min-h-[800px] rounded-lg border"
              >
                <ResizablePanel defaultSize={65} minSize={50}>
                  <div className="p-6 md:p-8 overflow-y-auto h-full">
                    <UkFounderMap />
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={35} minSize={25} maxSize={45}>
                  <div className="h-full overflow-y-auto bg-secondary/20">
                    <div className="sticky top-0 bg-secondary/80 backdrop-blur-sm p-4 border-b z-10">
                      <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        UK regulatory pillars
                      </h2>
                    </div>
                    <UkSidebar />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </section>
        )}

        {/* UAE — Vision 2030 tab */}
        {region === 'uae' && (
        <section className="py-8">
          <div className="container">
            <ResizablePanelGroup
              direction="horizontal"
              className="min-h-[800px] rounded-lg border"
            >
              {/* Timeline Panel */}
              <ResizablePanel defaultSize={65} minSize={50}>
                <div className="p-6 md:p-8 overflow-y-auto h-full">
                  <MarketReality />

                  <hr className="my-12 border-border" />

                  <div className="relative">
                    {/* Vertical line */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />

                    {/* Events */}
                    <div className="space-y-12 md:space-y-16">
                      {sortedEvents.map((event, index) => (
                        <TimelineEventCard
                          key={event.id}
                          event={event}
                          index={index}
                        />
                      ))}
                    </div>

                    {/* End marker */}
                    <div className="flex justify-center mt-12">
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CORAL_ACCENT }}
                        />
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                          {language === 'en' ? 'The Journey Continues' : 'الرحلة مستمرة'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Vision 2030 Sidebar */}
              <ResizablePanel defaultSize={35} minSize={25} maxSize={45}>
                <div className="h-full overflow-y-auto bg-secondary/20">
                  <div className="sticky top-0 bg-secondary/80 backdrop-blur-sm p-4 border-b">
                    <h2 className="font-semibold flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Vision 2030
                    </h2>
                  </div>
                  <VisionSidebar />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </section>
        )}

        <section className="py-10 border-t border-border">
          <div className="container flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <LastUpdated section="context" />
            <SuggestActions />
          </div>
        </section>
      </div>
    </Layout>
  );
}
