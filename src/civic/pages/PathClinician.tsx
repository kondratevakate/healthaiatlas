// Path: Clinician
// 4-panel page with gatekeeper flow, failures, alternatives, evidence

import { Layout } from '@/civic/components/layout';
import { ActionBar, EvidenceLabel } from '@/civic/components/research';
import { Button } from '@/civic/components/ui/button';
import { Card, CardContent, CardHeader } from '@/civic/components/ui/card';
import { ArrowLeft, ArrowRight, Clock, DollarSign, AlertTriangle, CheckCircle2, Stethoscope, Award, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PathClinician() {
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
                Clinician
              </h1>
              <div className="h-1 w-16 bg-primary mb-6" />
              <p className="text-lg text-muted-foreground leading-relaxed">
                Healthcare professionals seeking to practice, innovate with AI, 
                or lead digital health initiatives in UAE.
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
                Licensing and credentialing pathway for healthcare professionals.
              </p>
            </div>

            {/* Gatekeeper Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl">
              <Card className="border-2">
                <CardContent className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Entry</p>
                  <p className="font-medium">Credential Check</p>
                  <p className="text-sm text-muted-foreground mt-2">Degree verification, DataFlow</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/30">
                <CardContent className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Filter 1</p>
                  <p className="font-medium">Exam/Assessment</p>
                  <p className="text-sm text-muted-foreground mt-2">DHA/HAAD/MOHAP licensing exam</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/30">
                <CardContent className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Filter 2</p>
                  <p className="font-medium">Employer Sponsor</p>
                  <p className="text-sm text-muted-foreground mt-2">Job offer + visa sponsorship</p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Decision</p>
                  <p className="font-medium">Practice License</p>
                  <p className="text-sm text-muted-foreground mt-2">Full or limited scope</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 p-4 bg-secondary/50 border border-border rounded-sm max-w-2xl">
              <p className="text-sm">
                <strong>Key signal:</strong> AI/digital health expertise is increasingly valued, 
                but clinical license remains the foundation. Roles like Chief Medical Information Officer 
                or Digital Health Lead still require practicing physician credentials in most institutions.
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
                Common obstacles in the clinician licensing journey.
              </p>
            </div>

            {/* Funnel */}
            <div className="mb-8">
              <p className="text-sm font-medium mb-4">International Physician Licensing Funnel (Observed, n=20 physicians)</p>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="px-4 py-2 bg-background border border-border text-center min-w-[100px]">
                  <p className="text-2xl font-bold">100%</p>
                  <p className="text-xs text-muted-foreground">Applied</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-4 py-2 bg-background border border-border text-center min-w-[100px]">
                  <p className="text-2xl font-bold">85%</p>
                  <p className="text-xs text-muted-foreground">DataFlow OK</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-4 py-2 bg-background border border-border text-center min-w-[100px]">
                  <p className="text-2xl font-bold">60%</p>
                  <p className="text-xs text-muted-foreground">Exam Pass</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-4 py-2 bg-background border border-border text-center min-w-[100px]">
                  <p className="text-2xl font-bold">45%</p>
                  <p className="text-xs text-muted-foreground">Job Offer</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-4 py-2 bg-background border border-border text-center min-w-[100px]">
                  <p className="text-2xl font-bold">40%</p>
                  <p className="text-xs text-muted-foreground">Licensed</p>
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
                  <p className="font-medium mb-3">"Board certification from top country = automatic license"</p>
                  <div className="h-px bg-border my-3" />
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Reality</p>
                  <p className="text-sm text-muted-foreground">
                    Even US/UK board-certified physicians must pass local exams (DHA, HAAD, or MOHAP) 
                    unless from specific exempt categories. DataFlow verification required regardless.
                  </p>
                  <EvidenceLabel level="official" className="mt-3" />
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="pb-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Myth</p>
                </CardHeader>
                <CardContent>
                  <p className="font-medium mb-3">"AI expertise replaces clinical credentials"</p>
                  <div className="h-px bg-border my-3" />
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Reality</p>
                  <p className="text-sm text-muted-foreground">
                    Healthcare AI leadership roles in hospitals typically require 
                    MD + license + AI knowledge. Pure AI background without clinical 
                    credentials limits to vendor/tech company roles.
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
                Pathways for clinicians entering UAE healthcare AI space.
              </p>
            </div>

            {/* Cost of Attempt Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Academic Hospital Route</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>6-12 months process</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Exam fees ~$500-1,500</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span>Risk: Low</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Provides: Cleveland Clinic, SKMC, or Mubadala health positions 
                      with full sponsorship, research opportunities, AI initiative access.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Digital Health Fellowship</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>1-2 year programs</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Funded positions available</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span>Risk: Low</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Provides: Clinical informatics training, AI project leadership, 
                      pathway to CMIO/CDO roles, network with health system leadership.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Advisory/Consulting Role</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Project-based engagement</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>$500-2,000/day rates</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span>Risk: Medium</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Provides: Flexibility, no full license needed for advisory, 
                      exposure to multiple institutions, pathway to full-time offers.
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
                    <span className="text-sm font-medium">DHA Licensing Requirements</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Source: dha.gov.ae/health-professionals, accessed Feb 2026
                  </p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <EvidenceLabel level="observed" />
                    <span className="text-sm font-medium">Physician Licensing Success Rates</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Source: Survey of 20 international physicians, 2024-2025
                  </p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <EvidenceLabel level="official" />
                    <span className="text-sm font-medium">DataFlow Verification</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Source: dataflowgroup.com, accessed Feb 2026
                  </p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <EvidenceLabel level="observed" />
                    <span className="text-sm font-medium">CMIO Role Requirements</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Source: Job postings analysis, 15 positions, 2025
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
                    Trigger for update: DHA/HAAD exam changes, new digital health fellowship programs, licensing reciprocity updates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Action Bar */}
        <section className="py-8">
          <div className="container">
            <ActionBar role="clinician" />
          </div>
        </section>
      </div>
    </Layout>
  );
}

