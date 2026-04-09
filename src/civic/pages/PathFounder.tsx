// Path: AI Founder
// 4-panel page with gatekeeper flow, failures, alternatives, evidence

import { Layout } from '@/civic/components/layout';
import { ActionBar, EvidenceLabel } from '@/civic/components/research';
import { Button } from '@/civic/components/ui/button';
import { Card, CardContent, CardHeader } from '@/civic/components/ui/card';
import { ArrowLeft, ArrowRight, Clock, DollarSign, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PathFounder() {
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
                AI Founder
              </h1>
              <div className="h-1 w-16 bg-primary mb-6" />
              <p className="text-lg text-muted-foreground leading-relaxed">
                Building a healthcare AI startup and seeking pilots, partnerships, 
                or market entry in the UAE.
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
                Who makes decisions, what they look for, and what counts as evidence.
              </p>
            </div>

            {/* Gatekeeper Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl">
              <Card className="border-2">
                <CardContent className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Entry</p>
                  <p className="font-medium">Initial Contact</p>
                  <p className="text-sm text-muted-foreground mt-2">LinkedIn, events, accelerator intros</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/30">
                <CardContent className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Filter 1</p>
                  <p className="font-medium">Credibility Check</p>
                  <p className="text-sm text-muted-foreground mt-2">Local entity? References? Traction?</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/30">
                <CardContent className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Filter 2</p>
                  <p className="font-medium">Technical Review</p>
                  <p className="text-sm text-muted-foreground mt-2">IT security, integration, data residency</p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Decision</p>
                  <p className="font-medium">Committee/C-Level</p>
                  <p className="text-sm text-muted-foreground mt-2">Pilot approval, procurement</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 p-4 bg-secondary/50 border border-border rounded-sm max-w-2xl">
              <p className="text-sm">
                <strong>Key signal:</strong> Most hospital innovation teams receive 50+ inbound pitches per month. 
                Standing out requires warm intro + clear differentiation + regional references.
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
                Common illusions and typical failure modes.
              </p>
            </div>

            {/* Funnel */}
            <div className="mb-8">
              <p className="text-sm font-medium mb-4">Cold Outreach Funnel (Observed, n=12 interviews)</p>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="px-4 py-2 bg-background border border-border text-center min-w-[100px]">
                  <p className="text-2xl font-bold">1000</p>
                  <p className="text-xs text-muted-foreground">Sent</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-4 py-2 bg-background border border-border text-center min-w-[100px]">
                  <p className="text-2xl font-bold">80</p>
                  <p className="text-xs text-muted-foreground">Opened</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-4 py-2 bg-background border border-border text-center min-w-[100px]">
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-muted-foreground">Replied</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-4 py-2 bg-background border border-border text-center min-w-[100px]">
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-xs text-muted-foreground">Call</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-4 py-2 bg-background border border-border text-center min-w-[100px]">
                  <p className="text-2xl font-bold">0-1</p>
                  <p className="text-xs text-muted-foreground">Pilot</p>
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
                  <p className="font-medium mb-3">\"Startups can easily get hospital pilots in Dubai\"</p>
                  <div className="h-px bg-border my-3" />
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Reality</p>
                  <p className="text-sm text-muted-foreground">
                    In most cases, pilots require: local partner with reputation, 
                    2+ regional references, 6-12 months for proof of value.
                  </p>
                  <EvidenceLabel level="observed" className="mt-3" />
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="pb-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Myth</p>
                </CardHeader>
                <CardContent>
                  <p className="font-medium mb-3">\"Free zone license = full market access\"</p>
                  <div className="h-px bg-border my-3" />
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Reality</p>
                  <p className="text-sm text-muted-foreground">
                    Free zone licenses have jurisdictional limits. Medical device sales 
                    may require mainland presence or authorized distributor.
                  </p>
                  <EvidenceLabel level="official" className="mt-3" />
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
                Alternative trajectories with realistic costs and timelines.
              </p>
            </div>

            {/* Cost of Attempt Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
              <Card className="border-2">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Hub71 Program</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>4-6 weeks application</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Free (if accepted)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span>Risk: Low</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Provides: Entity setup, office, cloud credits, investor intros, 
                      hospital network access.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">DIFC Innovation Hub</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>2-4 weeks setup</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>$1,500-5,000/year</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span>Risk: Low</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Provides: Flexible license, co-working, DIFC network, 
                      regulatory clarity for fintech/healthtech.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Local Distributor</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>2-6 months to find</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>20-40% margin share</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span>Risk: Medium</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Provides: Local presence, hospital relationships, 
                      regulatory navigation, no entity needed.
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
                    <span className="text-sm font-medium">Hub71 Program Details</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Source: hub71.com, accessed Feb 2026
                  </p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <EvidenceLabel level="observed" />
                    <span className="text-sm font-medium">Cold Outreach Conversion Rates</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Source: Interviews with 12 founders, Jan 2026
                  </p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <EvidenceLabel level="official" />
                    <span className="text-sm font-medium">DIFC Innovation License</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Source: difc.ae/business/licences, accessed Feb 2026
                  </p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <EvidenceLabel level="observed" />
                    <span className="text-sm font-medium">Hospital Pilot Timelines</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Source: 8 case studies from UAE hospitals, 2024-2025
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
                    Trigger for update: Changes in Hub71/DIFC programs, new regulatory guidance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Action Bar */}
        <section className="py-8">
          <div className="container">
            <ActionBar role="founder" />
          </div>
        </section>
      </div>
    </Layout>
  );
}

