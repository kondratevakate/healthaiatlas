// Risk Score Card Component
// Shareable summary card showing risk assessment result

import { RiskAssessment, PathRole } from '@/types/research';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, AlertCircle, Calendar, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface RiskScoreCardProps {
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

const riskConfig = {
  low: {
    label: { en: 'LOW', ar: 'Ù…Ù†Ø®ÙØ¶' },
    icon: CheckCircle,
    className: 'text-emerald-600 bg-emerald-50 border-emerald-200'
  },
  medium: {
    label: { en: 'MEDIUM', ar: 'Ù…ØªÙˆØ³Ø·' },
    icon: AlertCircle,
    className: 'text-amber-600 bg-amber-50 border-amber-200'
  },
  high: {
    label: { en: 'HIGH', ar: 'Ù…Ø±ØªÙØ¹' },
    icon: AlertTriangle,
    className: 'text-red-600 bg-red-50 border-red-200'
  }
};

export function RiskScoreCard({ 
  assessment, 
  onShare, 
  onViewPath,
  className 
}: RiskScoreCardProps) {
  const risk = riskConfig[assessment.riskLevel];
  const RiskIcon = risk.icon;
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(assessment.generatedAt);

  return (
    <Card className={cn('border-2 max-w-md', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Your Reality Check
            </p>
            <div className="h-0.5 w-12 bg-primary mt-2" />
          </div>
          {onShare && (
            <Button variant="ghost" size="icon" onClick={onShare} aria-label="Share reality check">
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Role */}
        <div>
          <p className="text-sm text-muted-foreground">Role</p>
          <p className="text-lg font-semibold">{roleLabels[assessment.role].en}</p>
        </div>

        {/* Risk Level */}
        <div className={cn('p-4 border rounded-sm', risk.className)}>
          <div className="flex items-center gap-2">
            <RiskIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Risk Level:</span>
            <span className="font-bold">{risk.label.en}</span>
          </div>
        </div>

        {/* Bottlenecks */}
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
            Top Bottlenecks
          </p>
          <div className="h-0.5 w-8 bg-border mb-3" />
          <ul className="space-y-2">
            {assessment.bottlenecks.slice(0, 3).map((bottleneck, index) => (
              <li key={index} className="flex gap-2 text-sm">
                <span className="text-primary font-medium">{index + 1}.</span>
                <span>{bottleneck}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Best Next Step */}
        <div className="p-4 bg-secondary/50 border border-border rounded-sm">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
            Best Next Step
          </p>
          <p className="text-sm">{assessment.bestNextStep}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Updated: {formattedDate}
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
              View full path →
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

