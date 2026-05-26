// Atlas homepage. Three stacked sections, in scan-priority order:
//
//   1. Hero            — brand, one-line value prop, animated system diagram
//   2. Newsfeed        — what's happening this month (conferences + launches).
//                        Anchored as #events so the Events nav can land here.
//   3. Find Yourself   — the 5-question persona quiz (secondary entry point)
//
// Aisafety.com pattern: home is the place where category previews live, not
// a deep page. Visitor lands → sees what's fresh → drills into Open Calls /
// Domains / Founder Toolkit from there.

import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { QuickRealityTest } from '@/components/research';
import { EcosystemCard } from '@/components/research/EcosystemCard';
import { HeroDiagram } from '@/components/home/HeroDiagram';
import { RiskAssessment } from '@/types/research';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Compass, CalendarDays, Rocket, MapPin } from 'lucide-react';

import { conferences } from '@/data/conferences';
import { launches } from '@/data/launches';

// Pick a handful of the most-relevant items at module-load. Conferences
// are sorted by upcoming-date (future first); launches are sorted by
// newest curated. Trim to a small preview — the full list lives at
// /discovery. Aisafety-style "View all →" link does the rest.
const NEWSFEED_TODAY = new Date();
const UPCOMING_CONFERENCES = [...conferences]
  .filter((c) => new Date(c.date) >= NEWSFEED_TODAY)
  .sort((a, b) => a.date.localeCompare(b.date))
  .slice(0, 3);
const RECENT_LAUNCHES = [...launches]
  .sort((a, b) => (b.launchDate?.getTime() ?? 0) - (a.launchDate?.getTime() ?? 0))
  .slice(0, 3);

export default function Index() {
  const navigate = useNavigate();
  const [showTest, setShowTest] = useState(false);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);

  // If we don't have any upcoming conferences, fall back to the most
  // recent past ones — the page should never look empty.
  const eventsToShow = useMemo(() => {
    if (UPCOMING_CONFERENCES.length > 0) return UPCOMING_CONFERENCES;
    return [...conferences].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  }, []);

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
              <div>
                <h1 className="heading-display mb-6">
                  HealthAI
                  <br />
                  Atlas
                </h1>
                <div className="h-1 w-16 bg-primary mb-6" />
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-lg">
                  A research-based guide to navigating the healthcare AI ecosystem.
                </p>
              </div>

              <div className="flex justify-center lg:justify-end">
                <HeroDiagram />
              </div>
            </div>
          </div>
        </section>

        {/* Newsfeed — events + launches. Anchored as #events so the Events
            nav item can deep-link here. Future iterations can add tweets,
            market signals, leader spotlights as additional rows. */}
        <section id="events" className="py-12 md:py-16 border-b border-border scroll-mt-20">
          <div className="container">
            <div className="flex items-baseline justify-between mb-8 flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Newsfeed
                  </p>
                </div>
                <div className="h-0.5 w-12 bg-primary mb-4" />
                <h2 className="heading-xl">What's happening</h2>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                Upcoming events and recent launches in the healthcare AI ecosystem. Tweets and
                market signals coming next.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              {/* Upcoming events */}
              <div>
                <div className="flex items-baseline justify-between mb-4">
                  <h3 className="text-sm font-semibold inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Upcoming events
                  </h3>
                  <Link
                    to="/discovery"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View all
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {eventsToShow.map((c) => (
                    <Link
                      key={c.id}
                      to={`/discovery#${c.id}`}
                      className="group block border border-border bg-background p-4 hover:border-primary hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <h4 className="text-sm font-medium leading-snug group-hover:text-primary transition-colors">
                          {c.name.en}
                        </h4>
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                          {c.date.slice(0, 7)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {c.location}
                        </span>
                        <Badge variant="outline" className="rounded-none text-[10px] py-0">
                          {c.type}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent launches */}
              <div>
                <div className="flex items-baseline justify-between mb-4">
                  <h3 className="text-sm font-semibold inline-flex items-center gap-2">
                    <Rocket className="h-4 w-4" />
                    Recent launches
                  </h3>
                  <Link
                    to="/discovery?tab=launches"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View all
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {RECENT_LAUNCHES.map((l) => (
                    <Link
                      key={l.id}
                      to={`/discovery?tab=launches#${l.id}`}
                      className="group block border border-border bg-background p-4 hover:border-primary hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <h4 className="text-sm font-medium leading-snug group-hover:text-primary transition-colors inline-flex items-baseline gap-1.5">
                          <span aria-hidden>{l.logo}</span>
                          {l.name}
                        </h4>
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                          {l.launchDate?.toISOString().slice(0, 7)}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {l.tagline}
                      </p>
                    </Link>
                  ))}
                </div>
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

        {/* Quick navigation — minimal, since the primary discovery surfaces
            (events above, Open Calls / Domains / Founder Toolkit in the nav)
            already cover the main routes. */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => navigate('/discovery?section=opencalls')}>
                Open Calls
              </Button>
              <Button variant="outline" onClick={() => navigate('/directory')}>
                Domains
              </Button>
              <Button variant="outline" onClick={() => navigate('/founders')}>
                Founder Toolkit
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
