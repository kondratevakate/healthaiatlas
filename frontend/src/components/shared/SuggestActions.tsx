import { Plus, PenLine } from 'lucide-react';
import { SUGGEST_ENTRY_URL, SUGGEST_CORRECTION_URL } from '@/data/constants';
import { cn } from '@/lib/utils';

interface SuggestActionsProps {
  className?: string;
}

export function SuggestActions({ className }: SuggestActionsProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground',
        className,
      )}
    >
      <span className="uppercase tracking-widest font-mono text-[10px]">Contribute</span>
      <a
        href={SUGGEST_ENTRY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
      >
        <Plus className="h-3 w-3" />
        Suggest entry
      </a>
      <a
        href={SUGGEST_CORRECTION_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
      >
        <PenLine className="h-3 w-3" />
        Suggest correction
      </a>
    </div>
  );
}
