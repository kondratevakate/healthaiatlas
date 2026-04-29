import { useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TIMELINE, EVENT_TYPE_LABELS, EventType } from '@/data/medicalTourism';

interface Props {
  specialty: string;
}

const TYPE_OPACITY: Record<EventType, string> = {
  stat: 'bg-foreground/10 border-foreground/30',
  platform: 'bg-foreground/15 border-foreground/40',
  provider: 'bg-foreground/8 border-foreground/25',
  regulatory: 'bg-foreground/20 border-foreground/50',
  standard: 'bg-foreground/5 border-foreground/20',
};

export function TimelineView({ specialty }: Props) {
  const events = useMemo(
    () => specialty === 'all' ? TIMELINE : TIMELINE.filter(e => e.stream === specialty),
    [specialty]
  );

  const years = useMemo(() => {
    if (events.length === 0) return [];
    const min = Math.min(...events.map(e => e.y));
    const max = Math.max(...events.map(e => e.y));
    const result: number[] = [];
    for (let y = min; y <= max; y++) result.push(y);
    return result;
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="border border-dashed border-border p-12 text-center">
        <p className="text-sm text-muted-foreground mb-2">
          No timeline events for this specialty yet.
        </p>
        <p className="text-xs text-muted-foreground/70">
          Pick another specialty in the sidebar, or contribute one — see CONTRIBUTING.md.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 text-[10px] font-mono text-muted-foreground mb-4">
        {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map(t => (
          <span key={t} className="flex items-center gap-1.5">
            <span className={cn('w-3 h-3 border', TYPE_OPACITY[t])} />
            {EVENT_TYPE_LABELS[t]}
          </span>
        ))}
      </div>

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${Math.min(years.length, 5)}, minmax(0, 1fr))` }}
      >
        {years.map(y => {
          const yearEvents = events.filter(e => e.y === y).sort((a, b) => a.q - b.q);
          return (
            <div key={y} className="space-y-2">
              <div className="text-xs font-mono text-muted-foreground border-b border-border pb-1 mb-2">
                {y} <span className="text-foreground/50">· {yearEvents.length}</span>
              </div>
              {yearEvents.length === 0 && (
                <div className="text-[10px] text-muted-foreground/50 italic">no events</div>
              )}
              {yearEvents.map((e, i) => (
                <a
                  key={i}
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn('block border p-2 hover:border-foreground transition-colors group', TYPE_OPACITY[e.type])}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
                      Q{e.q} · {EVENT_TYPE_LABELS[e.type]}
                    </span>
                    <ExternalLink className="w-2.5 h-2.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </div>
                  <div className="text-xs font-medium text-foreground mb-1 leading-tight">
                    {e.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-snug line-clamp-3">
                    {e.desc}
                  </div>
                </a>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
