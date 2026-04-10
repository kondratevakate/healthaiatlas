// Red Flag Card Component
// Shows a single red flag pattern with verification steps

import { RedFlag } from '@/types/research';
import { EvidenceLabel } from './EvidenceLabel';
import { cn } from '@/lib/utils';
import { Flag, CheckCircle2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface RedFlagCardProps {
  redFlag: RedFlag;
  className?: string;
  defaultExpanded?: boolean;
}

export function RedFlagCard({ 
  redFlag, 
  className,
  defaultExpanded = false 
}: RedFlagCardProps) {
  return (
    <Card className={cn('border-2 border-border hover:border-primary/30 transition-colors', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Flag className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold leading-tight">
              {redFlag.title.en}
            </h3>
            <div className="h-0.5 w-16 bg-primary mt-2" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pattern */}
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
            Pattern
          </p>
          <p className="text-sm text-foreground">
            {redFlag.pattern.en}
          </p>
        </div>

        {/* Reality */}
        <div className="p-4 bg-secondary/50 border border-border rounded-sm">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
            Reality
          </p>
          <p className="text-sm">
            {redFlag.reality.en}
          </p>
        </div>

        {/* How to Verify */}
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
            How to Verify
          </p>
          <ul className="space-y-2">
            {redFlag.howToVerify.map((step, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{step.en}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Evidence & Sources */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <EvidenceLabel level={redFlag.evidenceLevel} />
          
          {redFlag.sources && redFlag.sources.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ExternalLink className="h-3 w-3" />
              <span>{redFlag.sources.length} source{redFlag.sources.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

