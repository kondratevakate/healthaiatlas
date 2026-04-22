import { Layout } from '@/components/layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { timelineEvents, stageConfig } from '@/data/timeline';
import { visionTargets, budgetAllocations, strategicPillars, visionStats } from '@/data/vision2030';
import { cn } from '@/lib/utils';
import { LastUpdated } from '@/components/shared/LastUpdated';
import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, useScroll } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  ChevronRight
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

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  
  return (
    <motion.div 
      className="fixed left-0 top-0 h-1 bg-primary z-50 origin-left"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

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
            <div 
              className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: CORAL_ACCENT }}
            >
              {event.hotspotNumber}
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

type ContextRegion = 'uae' | 'us' | 'eu';

const REGION_OPTIONS: { id: ContextRegion; label: string; available: boolean }[] = [
  { id: 'uae', label: 'UAE', available: true },
  { id: 'us', label: 'US', available: false },
  { id: 'eu', label: 'EU', available: false },
];

export default function Context() {
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const region = (searchParams.get('region') as ContextRegion) ?? 'uae';
  const setRegion = (r: ContextRegion) => {
    if (r === 'uae') setSearchParams({});
    else setSearchParams({ region: r });
  };

  const sortedEvents = useMemo(() =>
    [...timelineEvents].sort((a, b) => a.year - b.year),
    []
  );

  return (
    <Layout>
      <ScrollProgress />
      
      <div className="min-h-screen">
        {/* Header */}
        <section className="py-12 md:py-16 border-b border-border">
          <div className="container">
            <div className="max-w-3xl">
              <div className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
                Problem Space · Region
              </div>
              <h1 className="heading-display section-marker mb-6">
                {language === 'en' ? 'Context' : 'السياق'}
              </h1>

              {/* Region selector */}
              <div className="flex flex-wrap gap-1 mb-5">
                {REGION_OPTIONS.map((opt) => {
                  const isActive = region === opt.id;
                  const disabled = !opt.available;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => opt.available && setRegion(opt.id)}
                      disabled={disabled}
                      className={cn(
                        'inline-flex items-center px-3 py-1.5 text-xs font-mono border transition-colors',
                        isActive
                          ? 'bg-foreground text-background border-foreground'
                          : disabled
                          ? 'border-border text-muted-foreground/50 cursor-not-allowed'
                          : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
                      )}
                    >
                      {opt.label}
                      {disabled && <span className="ml-2 text-[9px] uppercase tracking-widest">soon</span>}
                    </button>
                  );
                })}
              </div>

              <p className="text-body text-muted-foreground max-w-2xl mb-4">
                {region === 'uae'
                  ? language === 'en'
                    ? 'Explore the UAE healthcare AI journey alongside Vision 2030 targets, investment data, and strategic priorities.'
                    : 'استكشف رحلة الذكاء الاصطناعي الصحي في الإمارات إلى جانب أهداف رؤية 2030 وبيانات الاستثمار والأولويات الاستراتيجية.'
                  : `The ${region.toUpperCase()} context is not yet available. Coverage starts with the UAE; other regions land as the data is curated.`}
              </p>
              <LastUpdated section="context" />
            </div>
          </div>
        </section>

        {/* Non-UAE placeholder */}
        {region !== 'uae' && (
          <section className="py-16">
            <div className="container max-w-3xl">
              <div className="border border-dashed border-border p-10 text-center">
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-3">
                  Coming soon
                </div>
                <h2 className="heading-lg mb-3">{region.toUpperCase()} healthcare AI context</h2>
                <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                  We are scoping what a {region === 'us' ? 'US (CMS · FDA · ONC)' : 'EU (EHDS · MDR · AI Act)'} view
                  of the ecosystem looks like. If you want to help shape it, open an issue on{' '}
                  <a
                    href="https://github.com/kondratevakate"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    github.com/kondratevakate
                  </a>
                  .
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Main Content with Sidebar — UAE only for now */}
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
      </div>
    </Layout>
  );
}
