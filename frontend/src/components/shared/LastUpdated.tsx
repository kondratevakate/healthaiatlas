import { format, parseISO } from 'date-fns';
import { LAST_UPDATED } from '@/data/constants';

interface LastUpdatedProps {
  section: string;
  className?: string;
}

export function LastUpdated({ section, className }: LastUpdatedProps) {
  const dateStr = LAST_UPDATED[section] || LAST_UPDATED.directory;
  const formatted = format(parseISO(dateStr), 'MMM d, yyyy');

  return (
    <span className={`text-xs text-muted-foreground ${className || ''}`}>
      Last updated: {formatted}
    </span>
  );
}
