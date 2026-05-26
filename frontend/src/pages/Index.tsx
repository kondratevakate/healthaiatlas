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
import { ArrowRight, Compass, MapPin } from 'lucide-react';

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

        {/* Newsfeed — terminal/code style. Events + launches as log lines. */}
        <section id="events" className="py-12 md:py-16 border-b border-border scroll-mt-20">
          <div className="container">

            <div className="flex items-baseline justify-between mb-6 flex-wrap gap-3">
              <h2 className="heading-xl">What's happening</h2>
              <p className="text-sm text-muted-foreground">
                Upcoming events and recent launches in the healthcare AI ecosystem.
              </p>
            </div>

            {/* Terminal window */}
            <div className="border border-border bg-card font-mono text-sm overflow-hidden">

              {/* Chrome bar */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/40">
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
                <span className="ml-3 text-[10px] tracking-widest uppercase text-muted-foreground/40">
                  healthai.log
                </span>
                <div className="ml-auto flex gap-4">
                  <Link to="/discovery" className="text-[10px] text-muted-foreground/40 hover:text-primary transition-colors">
                    events →
                  </Link>
                  <Link to="/discovery?tab=launches" className="text-[10px] text-muted-foreground/40 hover:text-primary transition-colors">
                    launches →
                  </Link>
                </div>
              </div>

              {/* Log body */}
              <div className="grid md:grid-cols-2 divide-x divide-border">

                {/* Events column */}
                <div className="p-4 space-y-0">
                  <div className="text-[10px] tracking-widest uppercase text-muted-foreground/30 mb-3 pb-2 border-b border-border/40">
                    // upcoming_events
                  </div>
                  {eventsToShow.map((c) => (
                    <Link
                      key={c.id}
                      to={`/discovery#${c.id}`}
                      className="group block py-2.5 border-b border-border/20 last:border-0 hover:bg-secondary/30 transition-colors px-1 -mx-1"
                    >
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-muted-foreground/40 text-xs shrink-0">
                          {c.date.slice(0, 7)}
                        </span>
                        <span className="text-primary/70 text-[10px] uppercase tracking-wider shrink-0 w-20 truncate">
                          {c.type}
                        </span>
                        <span className="text-foreground/80 text-xs group-hover:text-foreground transition-colors truncate">
                          {c.name.en}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground/40 pl-[4.5rem] mt-0.5 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                        {c.location}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Launches column */}
                <div className="p-4 space-y-0">
                  <div className="text-[10px] tracking-widest uppercase text-muted-foreground/30 mb-3 pb-2 border-b border-border/40">
                    // recent_launches
                  </div>
                  {RECENT_LAUNCHES.map((l) => (
                    <Link
                      key={l.id}
                      to={`/discovery?tab=launches#${l.id}`}
                      className="group block py-2.5 border-b border-border/20 last:border-0 hover:bg-secondary/30 transition-colors px-1 -mx-1"
                    >
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-muted-foreground/40 text-xs shrink-0">
                          {l.launchDate?.toISOString().slice(0, 7)}
                        </span>
                        <span className="text-muted-foreground/50 text-xs shrink-0" aria-hidden>
                          {l.logo}
                        </span>
                        <span className="text-foreground/80 text-xs group-hover:text-foreground transition-colors truncate">
                          {l.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground/40 pl-[4.5rem] mt-0.5 truncate">
                        {l.tagline}
                      </div>
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
