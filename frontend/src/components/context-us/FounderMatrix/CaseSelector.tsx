import { OUTCOME_COLORS, OUTCOME_LABELS, type StartupOutcome } from '@/data/usFounderMatrix';
import { cn } from '@/lib/utils';

export type FilterMode = 'all' | StartupOutcome;

interface Props {
  value: FilterMode;
  onChange: (next: FilterMode) => void;
  counts: Record<FilterMode, number>;
}

const MODES: FilterMode[] = ['all', 'live', 'acquired', 'shutdown', 'fraud'];

const MODE_LABEL: Record<FilterMode, string> = {
  all: 'All',
  live: OUTCOME_LABELS.live,
  acquired: OUTCOME_LABELS.acquired,
  shutdown: OUTCOME_LABELS.shutdown,
  fraud: OUTCOME_LABELS.fraud,
};

export function CaseSelector({ value, onChange, counts }: Props) {
  return (
    <div className="flex flex-wrap gap-1 mb-4 items-center">
      {MODES.map((mode) => {
        const isActive = value === mode;
        const dotColor = mode === 'all' ? 'hsl(var(--muted-foreground))' : OUTCOME_COLORS[mode];
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={cn(
              'px-2.5 py-1.5 text-[11px] font-mono border transition-colors flex items-center gap-1.5',
              isActive
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/40',
            )}
          >
            <span
              aria-hidden="true"
              className="inline-block w-2 h-2"
              style={{ background: dotColor }}
            />
            {MODE_LABEL[mode]}
            <span className="opacity-60">({counts[mode]})</span>
          </button>
        );
      })}
    </div>
  );
}
