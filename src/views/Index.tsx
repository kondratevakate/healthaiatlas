'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, Calendar, FileText } from 'lucide-react';
import { EcosystemCard, QuickRealityTest } from '@/components/research';
import { HeroDiagram } from '@/components/home/HeroDiagram';
import { Button } from '@/components/ui/button';
import { PathRole, RiskAssessment } from '@/types/research';

function RoleCard({ title, description, onClick }: { title: string; description: string; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className="group rounded-lg border-2 bg-card p-6 text-left text-card-foreground shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <h3 className="mb-2 text-lg font-semibold transition-colors group-hover:text-primary">
        {title}
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      <span className="inline-flex items-center text-sm font-medium text-primary">
        View path
        <ArrowRight className="ml-1 h-4 w-4" />
      </span>
    </motion.button>
  );
}

const roleCards: { role: PathRole; title: string; description: string }[] = [
  {
    role: 'founder',
    title: 'AI Founder',
    description: 'Building a healthcare AI startup, seeking pilots and partnerships',
  },
  {
    role: 'jobseeker',
    title: 'Job Seeker',
    description: 'Student or professional seeking opportunities in UAE healthcare AI',
  },
  {
    role: 'business',
    title: 'Business',
    description: 'Company seeking licensing, market entry, or expansion in UAE',
  },
  {
    role: 'clinician',
    title: 'Clinician',
    description: 'Healthcare professional exploring AI tools for practice',
  },
];

export default function Index() {
  const router = useRouter();
  const [showTest, setShowTest] = useState(false);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);

  const handleTestComplete = (result: RiskAssessment) => {
    setAssessment(result);
    const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
    assessments[result.shareId] = result;
    localStorage.setItem('assessments', JSON.stringify(assessments));
  };

  const handleViewPath = () => {
    if (assessment) {
      router.push(`/path/${assessment.role}`);
    }
  };

  const handleShare = async () => {
    if (assessment) {
      const url = `${window.location.origin}/share/${assessment.shareId}`;
      await navigator.clipboard.writeText(url);
    }
  };

  const handleRoleClick = (role: PathRole) => {
    router.push(`/path/${role}`);
  };

  return (
    <div className="min-h-screen">
      <section className="border-b border-border py-16 md:py-24">
        <div className="container">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="max-w-[36rem]">
              <motion.h1
                className="mb-6 font-serif text-5xl font-bold tracking-tight leading-[1.05] md:text-7xl"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                AI Health
                <br />
                Navigator
              </motion.h1>
              <motion.div
                className="mb-6 h-1 w-16 bg-primary"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                style={{ originX: 0 }}
              />
              <motion.p
                className="max-w-lg text-xl leading-relaxed text-muted-foreground md:text-2xl"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              >
                A research-based guide to entering the UAE healthcare AI ecosystem.
              </motion.p>
            </div>

            <div className="flex justify-center lg:justify-end">
              <HeroDiagram />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-secondary/30 py-12 md:py-16">
        <div className="container">
          {assessment ? (
            <div className="flex flex-col items-center">
              <EcosystemCard
                assessment={assessment}
                onShare={handleShare}
                onViewPath={handleViewPath}
              />
              <Button
                variant="ghost"
                className="mt-4"
                onClick={() => {
                  setAssessment(null);
                  setShowTest(true);
                }}
              >
                Take the test again
              </Button>
            </div>
          ) : showTest ? (
            <div className="flex justify-center">
              <QuickRealityTest onComplete={handleTestComplete} />
            </div>
          ) : (
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-2 flex items-center justify-center gap-2">
                <Compass className="h-5 w-5 text-primary" />
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Find Yourself
                </p>
              </div>
              <div className="mx-auto mb-4 h-0.5 w-12 bg-primary" />
              <h2 className="mb-4 text-2xl font-semibold md:text-3xl">
                Answer 5 questions to find your place in the ecosystem
              </h2>
              <p className="mb-6 text-muted-foreground">
                Discover who you are, who&apos;s around you, and your best connections.
              </p>
              <Button size="lg" onClick={() => setShowTest(true)}>
                Find My Place
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="border-b border-border py-12 md:py-16">
        <div className="container">
          <div className="mb-8">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Choose Your Path
            </p>
            <div className="mb-4 h-0.5 w-12 bg-primary" />
            <p className="text-muted-foreground">
              Or dive directly into the path that matches your situation.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {roleCards.map((card) => (
              <RoleCard
                key={card.role}
                title={card.title}
                description={card.description}
                onClick={() => handleRoleClick(card.role)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container">
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={() => router.push('/discovery')}>
              <Compass className="mr-2 h-4 w-4" />
              Discovery
            </Button>
            <Button variant="outline" onClick={() => router.push('/context')}>
              <Calendar className="mr-2 h-4 w-4" />
              Context & Vision 2030
            </Button>
            <Button variant="outline" onClick={() => router.push('/newsfeed')}>
              <FileText className="mr-2 h-4 w-4" />
              Newsfeed
            </Button>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              Last updated: February 2, 2026{' '}
              <Button
                variant="link"
                className="h-auto px-1"
                onClick={() => router.push('/newsfeed')}
              >
                View updates
              </Button>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
