"use client";

import { Fragment } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ActionBar } from '@/components/research/ActionBar';
import { EvidenceLabel } from '@/components/research/EvidenceLabel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Clock, DollarSign, AlertTriangle, CheckCircle2, Stethoscope, Award, Users, Building, FileCheck, Scale, GraduationCap, Briefcase, type LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = { Stethoscope, Award, Users, Building, FileCheck, Scale, GraduationCap, Briefcase };
import { cn } from '@/lib/utils';
import { PathRole, EvidenceLevel } from '@/types/research';

export interface GateCard {
  label: string;
  title: string;
  description: string;
  highlight?: boolean;
}

export interface FunnelStep {
  value: string;
  label: string;
}

export interface MythCard {
  myth: string;
  reality: string;
  evidenceLevel: EvidenceLevel;
}

export interface AlternativeCard {
  icon?: string;
  title: string;
  time: string;
  cost: string;
  risk: string;
  description: string;
}

export interface EvidenceSource {
  level: EvidenceLevel;
  title: string;
  source: string;
}

export interface PathData {
  role: PathRole;
  title: string;
  subtitle: string;
  gateDescription: string;
  gateCards: [GateCard, GateCard, GateCard, GateCard];
  gateKeySignal: string;
  funnelLabel: string;
  funnelSteps: FunnelStep[];
  failuresDescription: string;
  myths: [MythCard, MythCard];
  alternativesDescription: string;
  alternatives: [AlternativeCard, AlternativeCard, AlternativeCard];
  evidenceSources: [EvidenceSource, EvidenceSource, EvidenceSource, EvidenceSource];
  lastVerified: string;
  updateTrigger: string;
}

function SectionHeader({ label, description }: { label: string; description: string }) {
  return (
    <div className="mb-8">
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
        {label}
      </p>
      <div className="h-0.5 w-12 bg-primary mb-4" />
      <p className="text-muted-foreground max-w-2xl">{description}</p>
    </div>
  );
}

export function PathTemplate({ data }: { data: PathData }) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-12 md:py-16 border-b border-border">
        <div className="container">
          <Button asChild variant="ghost" className="mb-6 -ml-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Navigator
            </Link>
          </Button>
          <div className="max-w-2xl">
            <motion.p
              className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              Path Guide
            </motion.p>
            <motion.h1
              className="font-serif text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
            >
              {data.title}
            </motion.h1>
            <motion.div
              className="h-1 w-16 bg-primary mb-6"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.3, delay: 0.18 }}
              style={{ originX: 0 }}
            />
            <motion.p
              className="text-lg text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              {data.subtitle}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Panel 1: How the Gate Works */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <SectionHeader label="1. How the Gate Works" description={data.gateDescription} />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl">
            {data.gateCards.map((card) => (
              <Card key={card.label} className={cn('border-2', card.highlight && 'border-primary/30')}>
                <CardContent className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    {card.label}
                  </p>
                  <p className="font-medium">{card.title}</p>
                  <p className="text-sm text-muted-foreground mt-2">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 p-4 bg-secondary/50 border border-border rounded-sm max-w-2xl">
            <p className="text-sm">
              <strong>Key signal:</strong> {data.gateKeySignal}
            </p>
          </div>
        </div>
      </section>

      {/* Panel 2: What Usually Fails */}
      <section className="py-12 border-b border-border bg-secondary/20">
        <div className="container">
          <SectionHeader label="2. What Usually Fails" description={data.failuresDescription} />

          <div className="mb-8">
            <p className="text-sm font-medium mb-4">{data.funnelLabel}</p>
            <div className="flex flex-wrap gap-2 items-center">
              {data.funnelSteps.map((step, i) => (
                <Fragment key={step.label}>
                  {i > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                  <div className="px-4 py-2 bg-background border border-border text-center min-w-[100px]">
                    <p className="text-2xl font-bold">{step.value}</p>
                    <p className="text-xs text-muted-foreground">{step.label}</p>
                  </div>
                </Fragment>
              ))}
            </div>
            <EvidenceLabel level="observed" className="mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {data.myths.map((myth) => (
              <Card key={myth.myth} className="border-2">
                <CardHeader className="pb-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Myth</p>
                </CardHeader>
                <CardContent>
                  <p className="font-medium mb-3">&ldquo;{myth.myth}&rdquo;</p>
                  <div className="h-px bg-border my-3" />
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Reality</p>
                  <p className="text-sm text-muted-foreground">{myth.reality}</p>
                  <EvidenceLabel level={myth.evidenceLevel} className="mt-3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Panel 3: What Works Instead */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <SectionHeader label="3. What Works Instead" description={data.alternativesDescription} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
            {data.alternatives.map((alt) => {
              const Icon = alt.icon ? iconMap[alt.icon] : undefined;
              return (
                <Card key={alt.title} className="border-2">
                  <CardContent className="p-6">
                    <div className={cn('mb-4', Icon && 'flex items-center gap-2')}>
                      {Icon && <Icon className="h-5 w-5 text-primary" />}
                      <h3 className="font-semibold">{alt.title}</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{alt.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{alt.cost}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        <span>Risk: {alt.risk}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">{alt.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Panel 4: Evidence */}
      <section className="py-12 border-b border-border bg-secondary/20">
        <div className="container">
          <SectionHeader label="4. Evidence" description="Sources and methodology for claims on this page." />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {data.evidenceSources.map((src) => (
              <Card key={src.title} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <EvidenceLabel level={src.level} />
                    <span className="text-sm font-medium">{src.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Source: {src.source}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 p-4 bg-background border border-border rounded-sm max-w-2xl">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium mb-1">Last verified: {data.lastVerified}</p>
                <p className="text-sm text-muted-foreground">
                  Trigger for update: {data.updateTrigger}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Bar */}
      <section className="py-8">
        <div className="container">
          <ActionBar role={data.role} />
        </div>
      </section>
    </div>
  );
}
