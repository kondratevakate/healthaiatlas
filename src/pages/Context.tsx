import { Layout } from '@/civic/components/layout';
import { useLanguage } from '@/civic/contexts/LanguageContext';
import { timelineEvents, stageConfig } from '@/civic/data/timeline';
import { visionTargets, budgetAllocations, strategicPillars, visionStats } from '@/civic/data/vision2030';
import { cn } from '@/civic/lib/utils';
import { LastUpdated } from '@/civic/components/shared/LastUpdated';
import Image from 'next/image';
import { useMemo, useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/civic/components/ui/card';
import { Badge } from '@/civic/components/ui/badge';
import { Progress } from '@/civic/components/ui/progress';
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from '@/civic/components/ui/resizable';
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
import ministryHealthImg from '@/civic/assets/timeline/ministry-health.jpg';
import sehaHospitalImg from '@/civic/assets/timeline/seha-hospital.jpg';
import clevelandClinicImg from '@/civic/assets/timeline/cleveland-clinic.jpg';
import nabidhPlatformImg from '@/civic/assets/timeline/nabidh-platform.jpg';
import aiStrategyImg from '@/civic/assets/timeline/ai-strategy.jpg';
import g42HealthcareImg from '@/civic/assets/timeline/g42-healthcare.jpg';
import mbzuaiImg from '@/civic/assets/timeline/mbzuai.jpg';
import covidResponseImg from '@/civic/assets/timeline/covid-response.jpg';
import genomeProjectImg from '@/civic/assets/timeline/genome-project.jpg';
import telemedicineAppImg from '@/civic/assets/timeline/telemedicine-app.jpg';
import aiInvestmentImg from '@/civic/assets/timeline/ai-investment.jpg';

const CORAL_ACCENT = 'hsl(14, 90%, 55%)';

const eventImages: Record<string, string> = {
  'mohap-founded': ministryHealthImg.src,
  'seha-founded': sehaHospitalImg.src,
  'cleveland-clinic-opens': clevelandClinicImg.src,
  'nabidh-launch': nabidhPlatformImg.src,
  'doh-ai-strategy': aiStrategyImg.src,
  'g42-healthcare-founded': g42HealthcareImg.src,
  'mbzuai-founded': mbzuaiImg.src,
  'covid-ai-response': covidResponseImg.src,
  'g42-genome-project': genomeProjectImg.src,
  'astra-tech-launch': telemedicineAppImg.src,
  'uae-ai-health-investment': aiInvestmentImg.src,
};

const pillarIcons: Record<string, React.ReactNode> = {
  'monitor': <Monitor className="h-5 w-5" />,
  'brain': <Brain className="h-5 w-5" />,
  'dna': <Dna className="h-5 w-5" />,
  'users': <Users className="h-5 w-5" />,
};

function ScrollProgress({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { scrollYProgress } = useScroll({ container: containerRef });

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
            <Image
              src={image}
              alt={event.title[language]}
              fill
              sizes="(min-width: 768px) 28rem, 100vw"
              className="object-cover"
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

export default function Context() {
  const { language } = useLanguage();
  const timelineRef = useRef<HTMLDivElement>(null);

  const sortedEvents = useMemo(() => 
    [...timelineEvents].sort((a, b) => a.year - b.year),
    []
  );

  return (
    <Layout>
      <ScrollProgress containerRef={timelineRef} />
      
      <div className="min-h-screen">
        {/* Header */}
        <section className="py-12 md:py-16 border-b border-border">
          <div className="container">
            <div className="max-w-3xl">
              <div className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
                Problem Space
              </div>
              <h1 className="heading-display section-marker mb-6">
                {language === 'en' ? 'Context' : 'Ø§Ù„Ø³ÙŠØ§Ù‚'}
              </h1>
              <p className="text-body text-muted-foreground max-w-2xl mb-4">
                {language === 'en'
                  ? 'Explore the UAE healthcare AI journey alongside Vision 2030 targets, investment data, and strategic priorities.'
                  : 'Ø§Ø³ØªÙƒØ´Ù Ø±Ø­Ù„Ø© Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ Ø§Ù„ØµØ­ÙŠ ÙÙŠ Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª Ø¥Ù„Ù‰ Ø¬Ø§Ù†Ø¨ Ø£Ù‡Ø¯Ø§Ù Ø±Ø¤ÙŠØ© 2030 ÙˆØ¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø§Ø³ØªØ«Ù…Ø§Ø± ÙˆØ§Ù„Ø£ÙˆÙ„ÙˆÙŠØ§Øª Ø§Ù„Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠØ©.'}
              </p>
              <LastUpdated section="context" />
            </div>
          </div>
        </section>

        {/* Main Content with Sidebar */}
        <section className="py-8">
          <div className="container">
            <ResizablePanelGroup 
              direction="horizontal" 
              className="min-h-[800px] rounded-lg border"
            >
              {/* Timeline Panel */}
              <ResizablePanel defaultSize={65} minSize={50}>
                <div ref={timelineRef} className="h-full overflow-y-auto p-6 md:p-8">
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
                          {language === 'en' ? 'The Journey Continues' : 'Ø§Ù„Ø±Ø­Ù„Ø© Ù…Ø³ØªÙ…Ø±Ø©'}
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
      </div>
    </Layout>
  );
}

