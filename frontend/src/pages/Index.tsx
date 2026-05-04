// New Research Navigator Homepage
// Role selector + Find Yourself Test

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { QuickRealityTest } from '@/components/research';
import { EcosystemCard } from '@/components/research/EcosystemCard';
import { HeroDiagram } from '@/components/home/HeroDiagram';
import { RiskAssessment } from '@/types/research';
import { Button } from '@/components/ui/button';
import { ArrowRight, Compass, Calendar, FileText } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const [showTest, setShowTest] = useState(false);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);

  const handleTestComplete = (result: RiskAssessment) => {
    setAssessment(result);
    const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
    assessments[result.shareId] = result;
    localStorage.setItem('assessments', JSON.stringify(assessments));
  };

  const handleShare = async () => {
    if (assessment) {
      const url = `${window.location.origin}/share/${assessment.shareId}`;
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero with System Diagram */}
        <section className="py-16 md:py-24 border-b border-border">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left: Title */}
              <div>
                <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
                  AI Health
                  <br />
                  Navigator
                </h1>
                <div className="h-1 w-16 bg-primary mb-6" />
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-lg">
                  A research-based guide to navigating the healthcare AI ecosystem.
                </p>
              </div>

              {/* Right: Animated System Diagram */}
              <div className="flex justify-center lg:justify-end">
                <HeroDiagram />
              </div>
            </div>
          </div>
        </section>

        {/* Find Yourself Test or Results */}
        <section className="py-12 md:py-16 border-b border-border bg-secondary/30">
          <div className="container">
            {assessment ? (
              <div className="flex flex-col items-center">
                <EcosystemCard
                  assessment={assessment}
                  onShare={handleShare}
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
              <div>
                <QuickRealityTest onComplete={handleTestComplete} />
              </div>
            ) : (
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Compass className="h-5 w-5 text-primary" />
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Find Yourself
                  </p>
                </div>
                <div className="h-0.5 w-12 bg-primary mb-4" />
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                  Answer 5 questions to find your place in the ecosystem
                </h2>
                <p className="text-muted-foreground mb-6">
                  Discover who you are, who's around you, and your best connections.
                </p>
                <Button size="lg" onClick={() => setShowTest(true)}>
                  Find My Place
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" onClick={() => navigate('/discovery')}>
                <Compass className="h-4 w-4 mr-2" />
                Discovery
              </Button>
              <Button variant="outline" onClick={() => navigate('/context')}>
                <Calendar className="h-4 w-4 mr-2" />
                Context
              </Button>
              <Button variant="outline" onClick={() => navigate('/discovery?tab=launches')}>
                <FileText className="h-4 w-4 mr-2" />
                Launches
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
