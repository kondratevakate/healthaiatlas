// Path: Job Seeker / Student
// 4-panel page with gatekeeper flow, failures, alternatives, evidence

import { Layout } from '@/civic/components/layout';
import { ActionBar, EvidenceLabel } from '@/civic/components/research';
import { Button } from '@/civic/components/ui/button';
import { Card, CardContent, CardHeader } from '@/civic/components/ui/card';
import { ArrowLeft, ArrowRight, Clock, DollarSign, AlertTriangle, CheckCircle2, GraduationCap, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PathJobSeeker() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <section className="py-12 md:py-16 border-b border-border">
          <div className="container">
            <Button 
              variant="ghost" 
              className="mb-6 -ml-2"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Navigator
            </Button>

            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                Path Guide
              </p>
              <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
                Job Seeker
              </h1>
              <div className="h-1 w-16 bg-primary mb-6" />
              <p className="text-lg text-muted-foreground leading-relaxed">
                Students, recent graduates, or professionals seeking employment 
                in UAE healthcare AI sector.
              </p>
            </div>
          </div>
        </section>

        {/* Panel 1: How the Gate Works */}
        <section className="py-12 border-b border-border">
          <div className="container">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                1. How the Gate Works
              </p>
              <div className="h-0.5 w-12 bg-primary mb-4" />
              <p className="text-muted-foreground max-w-2xl">
                Understanding the hiring pipeline for healthcare AI roles in UAE.
              </p>
            </div>

            {/* Gatekeeper Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl">
              <Card className="border-2">
                <CardContent className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Entry</p>
                  <p className="font-medium">Application</p>
                  <p className="text-sm text-muted-foreground mt-2">LinkedIn, company sites, referrals</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/30">
                <CardContent className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Filter 1</p>
                  <p className="font-medium">HR Screening</p>
                  <p className="text-sm text-muted-foreground mt-2">Visa status, experience, keywords</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/30">
                <CardContent className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Filter 2</p>
                  <p className="font-medium">Technical Interview</p>
                  <p className="text-sm text-muted-foreground mt-2">Skills assessment, portfolio review</p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Decision</p>
                  <p className="font-medium">Hiring Manager</p>
                  <p className="text-sm text-muted-foreground mt-2">Offer, visa sponsorship</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 p-4 bg-secondary/50 border border-border rounded-sm max-w-2xl">
              <p className="text-sm">
                <strong>Key signal:</strong> Most UAE employers prefer candidates already in-country 
                or with transferable visa status. Remote hiring for healthcare roles is rare due 
                to data sensitivity requirements.
              </p>
            </div>
          </div>
        </section>

        {/* Panel 2: What Usually Fails */}
        <section className="py-12 border-b border-border bg-secondary/20">
          <div className="container">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                2. What Usually Fails
              </p>
              <div className="h-0.5 w-12 bg-primary mb-4" />
              <p className="text-muted-foreground max-w-2xl">
                Common misconceptions and typical rejection patterns.
              </p>
            </div>

            {/* Funnel */}
            <div className="mb-8">
              <p className="text-sm font-medium mb-4">Remote Application Funnel (Observed, n=15 job seekers)</p>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="px-4 py-2 bg-background border border-border text-center min-w-[100px]">
                  <p className="text-2xl font-bold">100</p>
                  <p className="text-xs text-muted-foreground">Applied</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-4 py-2 bg-background border border-border text-center min-w-[100px]">
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-xs text-muted-foreground">Response</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-4 py-2 bg-background border border-border text-center min-w-[100px]">
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-xs text-muted-foreground">Interview</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-4 py-2 bg-background border border-border text-center min-w-[100px]">
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-xs text-muted-foreground">Offer</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-4 py-2 bg-background border border-border text-center min-w-[100px]">
                  <p className="text-2xl font-bold">0.5</p>
                  <p className="text-xs text-muted-foreground">Visa OK</p>
                </div>
              </div>
              <EvidenceLabel level="observed" className="mt-4" />
            </div>

            {/* Myths */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              <Card className="border-2">
                <CardHeader className="pb-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Myth</p>
                </CardHeader>
                <CardContent>
                  <p className="font-medium mb-3">"Golden Visa guarantees employment"</p>
                  <div className="h-px bg-border my-3" />
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Reality</p>
                  <p className="text-sm text-muted-foreground">
                    Golden Visa provides residency, not work authorization for specific employers. 
                    Employment still requires company sponsorship or freelance permit.
                  </p>
                  <EvidenceLabel level="official" className="mt-3" />
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="pb-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Myth</p>
                </CardHeader>
                <CardContent>
                  <p className="font-medium mb-3">"AI skills alone open doors"</p>
                  <div className="h-px bg-border my-3" />
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Reality</p>
                  <p className="text-sm text-muted-foreground">
                    Healthcare AI roles typically require: healthcare domain knowledge, 
                    local regulatory awareness, and often Arabic language skills for patient-facing work.
                  </p>
                  <EvidenceLabel level="observed" className="mt-3" />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Panel 3: What Works Instead */}
        <section className="py-12 border-b border-border">
          <div className="container">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                3. What Works Instead
              </p>
              <div className="h-0.5 w-12 bg-primary mb-4" />
              <p className="text-muted-foreground max-w-2xl">
                Effective pathways into UAE healthcare AI employment.
              </p>
            </div>

            {/* Cost of Attempt Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">MBZUAI / NYU Abu Dhabi</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>1-2 year programs</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Scholarships available</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span>Risk: Low</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Provides: Student visa, local network, research opportunities, 
                      pathway to employment visa.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Accelerator Internship</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>3-6 months</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Stipend varies</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span>Risk: Low-Medium</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Provides: Visa sponsorship, startup exposure, potential 
                      conversion to full-time, network building.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">In-Country Job Search</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>30-day visit visa + 1-3 months search</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>$3,000-8,000 living costs</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span>Risk: Medium-High</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Provides: Face-to-face networking, faster interview cycles, 
                      demonstration of commitment.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Panel 4: Evidence */}
        <section className="py-12 border-b border-border bg-secondary/20">
          <div className="container">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                4. Evidence
              </p>
              <div className="h-0.5 w-12 bg-primary mb-4" />
              <p className="text-muted-foreground max-w-2xl">
                Sources and methodology for claims on this page.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <EvidenceLabel level="official" />
                    <span className="text-sm font-medium">Golden Visa Requirements</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Source: u.ae/golden-visa, accessed Feb 2026
                  </p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <EvidenceLabel level="observed" />
                    <span className="text-sm font-medium">Remote Application Success Rates</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Source: Interviews with 15 job seekers, Jan 2026
                  </p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <EvidenceLabel level="official" />
                    <span className="text-sm font-medium">MBZUAI Programs</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Source: mbzuai.ac.ae, accessed Feb 2026
                  </p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <EvidenceLabel level="observed" />
                    <span className="text-sm font-medium">In-Country Job Search Duration</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Source: 10 successful hires survey, 2024-2025
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 p-4 bg-background border border-border rounded-sm max-w-2xl">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Last verified: February 2, 2026</p>
                  <p className="text-sm text-muted-foreground">
                    Trigger for update: Visa policy changes, new university programs, accelerator cohort openings
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Action Bar */}
        <section className="py-8">
          <div className="container">
            <ActionBar role="jobseeker" />
          </div>
        </section>
      </div>
    </Layout>
  );
}

