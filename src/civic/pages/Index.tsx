// New Research Navigator Homepage
// Role selector + Find Yourself Test

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/civic/components/layout';
import { QuickRealityTest } from '@/civic/components/research';
import { EcosystemCard } from '@/civic/components/research/EcosystemCard';
import { HeroDiagram } from '@/civic/components/home/HeroDiagram';
import { RiskAssessment, PathRole } from '@/civic/types/research';
import { Button } from '@/civic/components/ui/button';
import { ArrowRight, Compass, Calendar, FileText } from 'lucide-react';

const roleCards: { role: PathRole; title: string; description: string }[] = [
  {
    role: 'founder',
    title: 'AI Founder',
    description: 'Building a healthcare AI startup, seeking pilots and partnerships'
  },
  {
    role: 'jobseeker',
    title: 'Job Seeker',
    description: 'Student or professional seeking opportunities in UAE healthcare AI'
  },
  {
    role: 'business',
    title: 'Business',
    description: 'Company seeking licensing, market entry, or expansion in UAE'
  },
  {
    role: 'clinician',
    title: 'Clinician',
    description: 'Healthcare professional exploring AI tools for practice'
  }
];

export default function Index() {
  const navigate = useNavigate();
  const [showTest, setShowTest] = useState(false);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);

  const handleTestComplete = (result: RiskAssessment) => {
    setAssessment(result);
    // Store assessment in localStorage
    const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
    assessments[result.shareId] = result;
    localStorage.setItem('assessments', JSON.stringify(assessments));
  };

  const handleViewPath = () => {
    if (assessment) {
      navigate(`/path/${assessment.role}`);
    }
  };

  const handleShare = async () => {
    if (assessment) {
      const url = `${window.location.origin}/share/${assessment.shareId}`;
      await navigator.clipboard.writeText(url);
    }
  };

  const handleRoleClick = (role: PathRole) => {
    navigate(`/path/${role}`);
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero with System Diagram */}
        <section className="py-16 md:py-24 border-b border-border">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left: Title */}
              <div className="max-w-[36rem]">
                <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
                  AI Health
                  <br />
                  Navigator
                </h1>
                <div className="h-1 w-16 bg-primary mb-6" />
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-lg">
                  A research-based guide to entering the UAE healthcare AI ecosystem.
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
              <div className="max-w-2xl mx-auto text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Compass className="h-5 w-5 text-primary" />
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Find Yourself
                  </p>
                </div>
                <div className="h-0.5 w-12 bg-primary mx-auto mb-4" />
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

        {/* Role Cards */}
        <section className="py-12 md:py-16 border-b border-border">
          <div className="container">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                Choose Your Path
              </p>
              <div className="h-0.5 w-12 bg-primary mb-4" />
              <p className="text-muted-foreground">
                Or dive directly into the path that matches your situation.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {roleCards.map((card) => (
                <button
                  key={card.role}
                  type="button"
                  onClick={() => handleRoleClick(card.role)}
                  className="group rounded-lg border-2 bg-card p-6 text-left text-card-foreground shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <h3 className="mb-2 text-lg font-semibold transition-colors group-hover:text-primary">
                    {card.title}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {card.description}
                  </p>
                  <span className="inline-flex items-center text-sm font-medium text-primary">
                    View path
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </button>
              ))}
            </div>
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
                Context & Vision 2030
              </Button>
              <Button variant="outline" onClick={() => navigate('/newsfeed')}>
                <FileText className="h-4 w-4 mr-2" />
                Newsfeed
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Last updated: February 2, 2026 ·{" "}
                <Button variant="link" className="px-1 h-auto" onClick={() => navigate('/newsfeed')}>
                  View updates
                </Button>
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

