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
        'border border-primary/30 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6',
        className,
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="text-xs uppercase tracking-widest font-mono text-primary font-semibold mb-1">
          Contribute
        </div>
        <p className="text-sm text-muted-foreground">
          Spotted a gap or a wrong entry? Help keep the Atlas accurate.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 shrink-0">
        <a
          href={SUGGEST_ENTRY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Suggest entry
        </a>
        <a
          href={SUGGEST_CORRECTION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-primary/50 text-foreground px-4 py-2 text-sm font-medium hover:bg-primary/5 transition-colors"
        >
          <PenLine className="h-4 w-4" />
          Suggest correction
        </a>
      </div>
    </div>
  );
}
