// Evidence Level Label Component
// Shows the ladder of evidence: Official > Observed > Anecdotal > Inference

import { EvidenceLevel } from '@/types/research';
import { cn } from '@/lib/utils';
import { FileText, Eye, MessageCircle, Lightbulb } from 'lucide-react';

interface EvidenceLabelProps {
  level: EvidenceLevel;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

const levelConfig: Record<EvidenceLevel, {
  label: { en: string; ar: string };
  icon: typeof FileText;
  className: string;
}> = {
  official: {
    label: { en: 'Official', ar: 'رسمي' },
    icon: FileText,
    className: 'bg-success/10 text-success border-success/30'
  },
  observed: {
    label: { en: 'Observed', ar: 'ملاحظ' },
    icon: Eye,
    className: 'bg-info/10 text-info border-info/30'
  },
  anecdotal: {
    label: { en: 'Anecdotal', ar: 'قصصي' },
    icon: MessageCircle,
    className: 'bg-warning/10 text-warning border-warning/30'
  },
  inference: {
    label: { en: 'Inference', ar: 'استنتاج' },
    icon: Lightbulb,
    className: 'bg-muted text-muted-foreground border-border'
  }
};

export function EvidenceLabel({ 
  level, 
  className, 
  showIcon = true,
  size = 'sm' 
}: EvidenceLabelProps) {
  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border rounded-sm font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        config.className,
        className
      )}
    >
      {showIcon && <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />}
      {config.label.en}
    </span>
  );
}
