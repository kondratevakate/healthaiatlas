// Ecosystem Card Component
// Shows user's place in the ecosystem after completing the test

import { RiskAssessment, PathRole } from '@/types/research';
import { cn } from '@/lib/utils';
import { Users, ArrowRight, Calendar, Share2, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EcosystemCardProps {
  assessment: RiskAssessment;
  onShare?: () => void;
  onViewPath?: () => void;
  className?: string;
}

const roleLabels: Record<PathRole, { en: string; ar: string }> = {
  founder: { en: 'AI Founder', ar: 'Ù…Ø¤Ø³Ø³ Ø°ÙƒØ§Ø¡ Ø§ØµØ·Ù†Ø§Ø¹ÙŠ' },
  jobseeker: { en: 'Job Seeker', ar: 'Ø¨Ø§Ø­Ø« Ø¹Ù† Ø¹Ù…Ù„' },
  business: { en: 'Business', ar: 'Ø£Ø¹Ù…Ø§Ù„' },
  clinician: { en: 'Clinician', ar: 'Ø·Ø¨ÙŠØ¨' }
};

const roleDescriptions: Record<PathRole, string> = {
  founder: 'Building healthcare AI solutions and seeking pilots',
  jobseeker: 'Exploring opportunities in UAE healthcare AI',
  business: 'Entering or expanding in the UAE market',
  clinician: 'Integrating AI tools into clinical practice'
};

// Who you need based on role
const keyConnections: Record<PathRole, { role: string; why: string }[]> = {
  founder: [
    { role: 'Hospital Innovation Leads', why: 'For pilot partnerships' },
    { role: 'Accelerator Managers', why: 'For entity setup & intros' },
    { role: 'Regulatory Consultants', why: 'For compliance guidance' }
  ],
  jobseeker: [
    { role: 'HR at HealthTech Startups', why: 'For direct opportunities' },
    { role: 'Community Organizers', why: 'For networking events' },
    { role: 'Mentors in AI Health', why: 'For career guidance' }
  ],
  business: [
    { role: 'Free Zone Advisors', why: 'For entity setup' },
    { role: 'Regulatory Affairs Experts', why: 'For licensing' },
    { role: 'Local Distribution Partners', why: 'For market access' }
  ],
  clinician: [
    { role: 'AI Vendors', why: 'For tool evaluation' },
    { role: 'Hospital IT Leads', why: 'For integration support' },
    { role: 'Clinical AI Researchers', why: 'For evidence-based guidance' }
  ]
};

export function EcosystemCard({ 
  assessment, 
  onShare, 
  onViewPath,
  className 
}: EcosystemCardProps) {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(assessment.generatedAt);

  const connections = keyConnections[assessment.role];

  return (
    <Card className={cn('border-2 max-w-md', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Your Place in the Ecosystem
            </p>
            <div className="h-0.5 w-12 bg-primary mt-2" />
          </div>
          {onShare && (
            <Button variant="ghost" size="icon" onClick={onShare} aria-label="Share ecosystem summary">
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Role Identity */}
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Compass className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold">{roleLabels[assessment.role].en}</p>
              <p className="text-sm text-muted-foreground">
                {roleDescriptions[assessment.role]}
              </p>
            </div>
          </div>
        </div>

        {/* Key Connections */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Who You Need
            </p>
          </div>
          <div className="space-y-2">
            {connections.map((conn, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-3 bg-secondary/50 rounded-sm"
              >
                <span className="text-primary font-medium text-sm">{index + 1}.</span>
                <div>
                  <p className="font-medium text-sm">{conn.role}</p>
                  <p className="text-xs text-muted-foreground">{conn.why}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Challenges */}
        {assessment.bottlenecks.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
              Your Key Challenges
            </p>
            <div className="flex flex-wrap gap-1">
              {assessment.bottlenecks.slice(0, 3).map((bottleneck, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {bottleneck}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Best Next Step */}
        <div className="p-4 bg-secondary/50 border border-border rounded-sm">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
            Recommended Next Step
          </p>
          <p className="text-sm">{assessment.bestNextStep}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {onShare && (
            <Button variant="outline" size="sm" onClick={onShare} className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
          {onViewPath && (
            <Button size="sm" onClick={onViewPath} className="flex-1">
              View full path
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

