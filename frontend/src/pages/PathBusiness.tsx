// Path: Business (Market Entry / Licensing)
// 4-panel page with gatekeeper flow, failures, alternatives, evidence

import { Layout } from '@/components/layout';
import { ActionBar, EvidenceLabel } from '@/components/research';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Clock, DollarSign, AlertTriangle, CheckCircle2, Building, FileCheck, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PathBusiness() {
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
                Business Entry
              </h1>
              <div className="h-1 w-16 bg-primary mb-6" />
              <p className="text-lg text-muted-foreground leading-relaxed">
                Established companies seeking to enter UAE healthcare market 
                through licensing, distribution, or local entity setup.
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
                Regulatory pathways for healthcare AI products in UAE.
              </p>
            </div>

            {/* Gatekeeper Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl">
              <Card className="border-2">
                <CardContent className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Entry</p>
                  <p className="font-medium">Classification</p>
                  <p className="text-sm text-muted-foreground mt-2">SaMD vs non-medical software</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/30">
                <CardContent className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Filter 1</p>
                  <p className="font-medium">Regulatory Body</p>
                  <p className="text-sm text-muted-foreground mt-2">MOHAP, DHA, HAAD selection</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/30">
                <CardContent className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Filter 2</p>
                  <p className="font-medium">Documentation</p>
                  <p className="text-sm text-muted-foreground mt-2">Technical file, clinical evidence</p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Decision</p>
                  <p className="font-medium">Registration</p>
                  <p className="text-sm text-muted-foreground mt-2">Marketing authorization</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 p-4 bg-secondary/50 border border-border rounded-sm max-w-2xl">
              <p className="text-sm">
                <strong>Key signal:</strong> UAE recognizes CE marking and FDA clearance as pathways 
                to expedited review. Products without international certifications face 
                longer timelines and additional clinical evidence requirements.
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
                Common regulatory pitfalls and timeline miscalculations.
              </p>
            </div>

            {/* Funnel */}
            <div className="mb-8">
              <p className="text-sm font-medium mb-4">Medical Device Registration Funnel (Observed, n=8 companies)</p>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="px-4 py-2 bg-background border border-border text-center min-w-[100px]">
                  <p className="text-2xl font-bold">100%</p>
                  <p className="text-xs text-muted-foreground">Started</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-4 py-2 bg-background border border-border text-center min-w-[100px]">
                  <p className="text-2xl font-bold">70%</p>
                  <p className="text-xs text-muted-foreground">Docs Ready</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-4 py-2 bg-background border border-border text-center min-w-[100px]">
                  <p className="text-2xl font-bold">45%</p>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-4 py-2 bg-background border border-border text-center min-w-[100px]">
                  <p className="text-2xl font-bold">30%</p>
                  <p className="text-xs text-muted-foreground">Year 1</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-4 py-2 bg-background border border-border text-center min-w-[100px]">
                  <p className="text-2xl font-bold">60%</p>
                  <p className="text-xs text-muted-foreground">Year 2+</p>
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
                  <p className="font-medium mb-3">"FDA/CE approval = automatic UAE approval"</p>
                  <div className="h-px bg-border my-3" />
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Reality</p>
                  <p className="text-sm text-muted-foreground">
                    International approvals expedite review but don't bypass it. 
                    UAE requires local authorized representative, Arabic labeling, 
                    and may request additional clinical data for local population.
                  </p>
                  <EvidenceLabel level="official" className="mt-3" />
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="pb-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Myth</p>
                </CardHeader>
                <CardContent>
                  <p className="font-medium mb-3">"Free zone = no regulatory requirements"</p>
                  <div className="h-px bg-border my-3" />
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Reality</p>
                  <p className="text-sm text-muted-foreground">
                    Free zones simplify business licensing but healthcare products 
                    still need MOHAP/DHA approval for patient use. Free zone is for 
                    entity, not product registration.
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
                Proven pathways for healthcare AI market entry.
              </p>
            </div>

            {/* Cost of Attempt Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Building className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">DHCC Free Zone</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>4-8 weeks setup</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>$15,000-50,000/year</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span>Risk: Low</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Provides: Healthcare-focused free zone, proximity to Cleveland Clinic, 
                      streamlined DHA interactions, healthcare ecosystem.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileCheck className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Local Distributor First</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>2-4 months to find partner</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>25-40% margin share</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span>Risk: Medium</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Provides: Regulatory expertise, existing hospital relationships, 
                      local authorized representative, faster market access.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Scale className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Regulatory Sandbox</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>6-12 months program</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Application fees only</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span>Risk: Low-Medium</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Provides: Regulatory guidance, controlled testing environment, 
                      pathway clarity, regulator relationship.
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
                    <span className="text-sm font-medium">MOHAP Medical Device Guidance</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Source: mohap.gov.ae/medical-devices, accessed Feb 2026
                  </p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <EvidenceLabel level="observed" />
                    <span className="text-sm font-medium">Registration Timeline Data</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Source: 8 company case studies, 2024-2025
                  </p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <EvidenceLabel level="official" />
                    <span className="text-sm font-medium">DHCC Licensing</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Source: dhcc.ae/business-setup, accessed Feb 2026
                  </p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <EvidenceLabel level="official" />
                    <span className="text-sm font-medium">DHA Regulatory Framework</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Source: dha.gov.ae/health-regulation, accessed Feb 2026
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
                    Trigger for update: New MOHAP guidance, regulatory framework changes, free zone policy updates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Action Bar */}
        <section className="py-8">
          <div className="container">
            <ActionBar role="business" />
          </div>
        </section>
      </div>
    </Layout>
  );
}
