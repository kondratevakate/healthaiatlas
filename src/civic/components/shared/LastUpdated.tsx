import { ExternalLink, PenLine, Plus } from 'lucide-react';
import { SUGGEST_ENTRY_URL, SUGGEST_CORRECTION_URL, LAST_UPDATED } from '@/civic/data/constants';
import { format, parseISO } from 'date-fns';

interface LastUpdatedProps {
  section: string;
  className?: string;
}

export function LastUpdated({ section, className }: LastUpdatedProps) {
  const dateStr = LAST_UPDATED[section] || LAST_UPDATED.directory;
  const formatted = format(parseISO(dateStr), 'MMM d, yyyy');

  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground ${className || ''}`}>
      <span>Last updated: {formatted}</span>
      <span className="hidden sm:inline text-border">|</span>
      <a
        href={SUGGEST_ENTRY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-medium text-foreground/72 hover:text-foreground transition-colors"
      >
        <Plus className="h-3 w-3" />
        Suggest entry
      </a>
      <a
        href={SUGGEST_CORRECTION_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-medium text-foreground/72 hover:text-foreground transition-colors"
      >
        <PenLine className="h-3 w-3" />
        Suggest correction
      </a>
    </div>
  );
}

