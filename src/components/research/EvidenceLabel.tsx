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
    label: { en: 'Official', ar: 'Ø±Ø³Ù…ÙŠ' },
    icon: FileText,
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  observed: {
    label: { en: 'Observed', ar: 'Ù…Ù„Ø§Ø­Ø¸' },
    icon: Eye,
    className: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  anecdotal: {
    label: { en: 'Anecdotal', ar: 'Ù‚ØµØµÙŠ' },
    icon: MessageCircle,
    className: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  inference: {
    label: { en: 'Inference', ar: 'Ø§Ø³ØªÙ†ØªØ§Ø¬' },
    icon: Lightbulb,
    className: 'bg-purple-100 text-purple-800 border-purple-200'
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

