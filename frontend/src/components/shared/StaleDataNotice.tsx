import { Link } from 'react-router-dom';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import { Clock, PenLine, Users, Heart } from 'lucide-react';
import {
  LAST_UPDATED,
  MANIFUND_PROJECT_URL,
  SUGGEST_CORRECTION_URL,
} from '@/data/constants';
import { cn } from '@/lib/utils';

// Listings older than this read as "likely outdated" (warning tone); newer
// snapshots get the neutral tone. Applies to hand-curated, time-sensitive
// lists (jobs, open calls) where entries expire without anyone noticing.
const STALE_AFTER_DAYS = 60;

interface StaleDataNoticeProps {
  /** Key into LAST_UPDATED. */
  section: string;
  /** What the reader should re-check at the source, e.g. "the careers page". */
  verifyAt: string;
  className?: string;
}

export function StaleDataNotice({ section, verifyAt, className }: StaleDataNoticeProps) {
  const iso = LAST_UPDATED[section];
  if (!iso) throw new Error(`StaleDataNotice: no LAST_UPDATED entry for "${section}"`);

  const updated = parseISO(iso);
  const ageDays = differenceInCalendarDays(new Date(), updated);
  const stale = ageDays > STALE_AFTER_DAYS;

  return (
    <div
      role="note"
      className={cn(
        'border p-4 mb-8 flex flex-col md:flex-row md:items-center gap-3 md:gap-6',
        stale ? 'border-warning/40 bg-warning/5' : 'border-border bg-card',
        className,
      )}
    >
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'flex items-center gap-1.5 text-xs uppercase tracking-widest font-mono font-semibold mb-1',
            stale ? 'text-warning' : 'text-muted-foreground',
          )}
        >
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {stale ? 'May be outdated' : 'Snapshot'} · updated {format(updated, 'MMM d, yyyy')}
        </div>
        <p className="text-sm text-muted-foreground">
          This list is curated by hand and entries expire quietly — confirm on {verifyAt} before
          acting. Help keep it current and usable.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 shrink-0">
        <a
          href={SUGGEST_CORRECTION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-foreground text-background px-3 py-1.5 text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          <PenLine className="h-4 w-4" aria-hidden="true" />
          Suggest an update
        </a>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 border border-border px-3 py-1.5 text-sm font-medium hover:border-foreground/40 transition-colors"
        >
          <Users className="h-4 w-4" aria-hidden="true" />
          Join as contributor
        </Link>
        <a
          href={MANIFUND_PROJECT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-border px-3 py-1.5 text-sm font-medium hover:border-foreground/40 transition-colors"
        >
          <Heart className="h-4 w-4" aria-hidden="true" />
          Support
        </a>
      </div>
    </div>
  );
}
