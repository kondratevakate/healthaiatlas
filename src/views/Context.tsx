'use client';

import Image from 'next/image';
import { useMemo, useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import {
  Brain,
  Building2,
  Dna,
  DollarSign,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { LastUpdated } from '@/components/shared/LastUpdated';
import { useLanguage } from '@/contexts/LanguageContext';
import { stageConfig, timelineEvents } from '@/data/timeline';
import {
  budgetAllocations,
  strategicPillars,
  visionStats,
  visionTargets,
} from '@/data/vision2030';
import { cn } from '@/lib/utils';
import aiInvestmentImg from '@/assets/timeline/ai-investment.jpg';
import aiStrategyImg from '@/assets/timeline/ai-strategy.jpg';
import clevelandClinicImg from '@/assets/timeline/cleveland-clinic.jpg';
import covidResponseImg from '@/assets/timeline/covid-response.jpg';
import g42HealthcareImg from '@/assets/timeline/g42-healthcare.jpg';
import genomeProjectImg from '@/assets/timeline/genome-project.jpg';
import mbzuaiImg from '@/assets/timeline/mbzuai.jpg';
import ministryHealthImg from '@/assets/timeline/ministry-health.jpg';
import nabidhPlatformImg from '@/assets/timeline/nabidh-platform.jpg';
import sehaHospitalImg from '@/assets/timeline/seha-hospital.jpg';
import telemedicineAppImg from '@/assets/timeline/telemedicine-app.jpg';

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
  monitor: <Building2 className="h-5 w-5" />,
  brain: <Brain className="h-5 w-5" />,
  dna: <Dna className="h-5 w-5" />,
  users: <Users className="h-5 w-5" />,
};

function ScrollProgress({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { scrollYProgress } = useScroll({ container: containerRef });

  return (
    <motion.div
      className="fixed left-0 top-0 z-50 h-1 origin-left bg-primary"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

function TimelineEventCard({
  event,
  index,
}: {
  event: (typeof timelineEvents)[0];
  index: number;
}) {
  const { language } = useLanguage();
  const image = eventImages[event.id];
  const isEven = index % 2 === 0;
  const stageLabel = stageConfig[event.stage || 'foundation'].label[language];

  return (
    <motion.div
      className="relative grid items-center gap-6 md:grid-cols-2"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <div className="absolute left-1/2 top-1/2 hidden h-0.5 w-8 -translate-x-1/2 bg-border md:block" />

      <div className={cn('relative overflow-hidden', isEven ? 'md:order-1' : 'md:order-2')}>
        {image ? (
          <motion.div className="relative aspect-[4/3] overflow-hidden" whileHover={{ scale: 1.02 }}>
            <Image
              src={image}
              alt={event.title[language]}
              fill
              sizes="(min-width: 768px) 28rem, 100vw"
              className="object-cover"
            />
            <div className="absolute left-3 top-3 bg-background/90 px-2 py-1 backdrop-blur-sm">
              <span className="font-mono text-xs font-semibold">{event.year}</span>
            </div>
            <div
              className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: CORAL_ACCENT }}
            >
              {event.hotspotNumber}
            </div>
          </motion.div>
        ) : null}
      </div>

      <div className={cn('space-y-3', isEven ? 'md:order-2 md:pl-6' : 'md:order-1 md:pr-6 md:text-right')}>
        <div className={cn('inline-flex items-center gap-2', !isEven && 'md:flex-row-reverse')}>
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CORAL_ACCENT }} />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">{stageLabel}</span>
        </div>

        <h3 className="font-serif text-lg font-semibold leading-tight text-foreground">
          {event.title[language]}
        </h3>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {event.description[language]}
        </p>

        <div className={cn('flex flex-wrap gap-1', !isEven && 'md:justify-end')}>
          <span className="bg-secondary px-2 py-0.5 text-xs uppercase tracking-wider">
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
      <Card className="border-2 bg-primary/5">
        <CardContent className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Investment
            </span>
          </div>
          <p className="text-3xl font-bold text-primary">{visionStats.totalInvestment.amount}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {visionStats.totalInvestment.label[language]}
          </p>
        </CardContent>
      </Card>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Vision 2030 Targets
          </h3>
        </div>
        <div className="space-y-3">
          {visionTargets.slice(0, 4).map((target) => {
            const current = parseInt(target.current || '0', 10);
            const goal = parseInt(target.target, 10);
            const progress = (current / goal) * 100;

            return (
              <div key={target.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate pr-2 text-muted-foreground">
                    {target.label[language]}
                  </span>
                  <span className="flex-shrink-0 font-medium text-foreground">{target.target}</span>
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

      <div>
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Budget Allocation
          </h3>
        </div>
        <div className="space-y-2">
          {budgetAllocations.map((budget) => (
            <div key={budget.year} className="flex items-center justify-between rounded-sm bg-secondary/50 p-2">
              <div>
                <p className="text-sm font-medium">{budget.year}</p>
                <p className="text-xs text-muted-foreground">{budget.focus[language]}</p>
              </div>
              <Badge variant="outline" className="font-mono">
                {budget.amount}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Strategic Pillars
          </h3>
        </div>
        <div className="space-y-2">
          {strategicPillars.map((pillar) => (
            <Card key={pillar.id} className="border">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 text-primary">{pillarIcons[pillar.icon]}</div>
                  <div>
                    <p className="text-sm font-medium">{pillar.title[language]}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {pillar.description[language]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
  const sortedEvents = useMemo(() => [...timelineEvents].sort((a, b) => a.year - b.year), []);

  return (
    <>
      <ScrollProgress containerRef={timelineRef} />

      <div className="min-h-screen">
        <section className="border-b border-border py-12 md:py-16">
          <div className="container">
            <div className="max-w-3xl">
              <div className="mb-4 text-sm uppercase tracking-wider text-muted-foreground">
                Problem Space
              </div>
              <h1 className="heading-display section-marker mb-6">
                {language === 'en' ? 'Context' : 'Ø§Ù„Ø³ÙŠØ§Ù‚'}
              </h1>
              <p className="mb-4 max-w-2xl text-body text-muted-foreground">
                {language === 'en'
                  ? 'Explore the UAE healthcare AI journey alongside Vision 2030 targets, investment data, and strategic priorities.'
                  : 'Ø§Ø³ØªÙƒØ´Ù Ø±Ø­Ù„Ø© Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ Ø§Ù„ØµØ­ÙŠ ÙÙŠ Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª Ø¥Ù„Ù‰ Ø¬Ø§Ù†Ø¨ Ø£Ù‡Ø¯Ø§Ù Ø±Ø¤ÙŠØ© 2030 ÙˆØ¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø§Ø³ØªØ«Ù…Ø§Ø± ÙˆØ§Ù„Ø£ÙˆÙ„ÙˆÙŠØ§Øª Ø§Ù„Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠØ©.'}
              </p>
              <LastUpdated section="context" />
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container">
            <ResizablePanelGroup direction="horizontal" className="min-h-[800px] rounded-lg border">
              <ResizablePanel defaultSize={65} minSize={50}>
                <div ref={timelineRef} className="h-full overflow-y-auto p-6 md:p-8">
                  <div className="relative">
                    <div className="absolute bottom-0 top-0 left-1/2 hidden w-px -translate-x-1/2 bg-border md:block" />

                    <div className="space-y-12 md:space-y-16">
                      {sortedEvents.map((event, index) => (
                        <TimelineEventCard key={event.id} event={event} index={index} />
                      ))}
                    </div>

                    <div className="mt-12 flex justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: CORAL_ACCENT }} />
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">
                          {language === 'en' ? 'The Journey Continues' : 'Ø§Ù„Ø±Ø­Ù„Ø© Ù…Ø³ØªÙ…Ø±Ø©'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={35} minSize={25} maxSize={45}>
                <div className="h-full overflow-y-auto bg-secondary/20">
                  <div className="sticky top-0 border-b bg-secondary/80 p-4 backdrop-blur-sm">
                    <h2 className="flex items-center gap-2 font-semibold">
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
    </>
  );
}
