import { useState, useMemo } from 'react';
import { PM_EVENTS, PM_TYPE_LABELS } from '@/data/processMining';
import { cn } from '@/lib/utils';

export function TimelineView() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const types = useMemo(() => [...new Set(PM_EVENTS.map(e => e.t))], []);

  const filtered = activeFilter === 'all'
    ? PM_EVENTS
    : PM_EVENTS.filter(e => e.t === activeFilter);

  const byYear = useMemo(() => {
    const groups: Record<string, typeof PM_EVENTS> = {};
    filtered.forEach(e => {
      const yr = e.d.substring(0, 4);
      (groups[yr] = groups[yr] || []).push(e);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const toggle = (idx: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  let globalIdx = 0;

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-1 mb-4">
        <button
          onClick={() => setActiveFilter('all')}
          className={cn(
            'px-2 py-1 text-[11px] font-mono border transition-colors',
            activeFilter === 'all'
              ? 'bg-foreground text-background border-foreground'
              : 'border-border text-muted-foreground hover:text-foreground'
          )}
        >
          All
        </button>
        {types.map(t => (
          <button
            key={t}
            onClick={() => setActiveFilter(t)}
            className={cn(
              'px-2 py-1 text-[11px] font-mono border transition-colors',
              activeFilter === t
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {PM_TYPE_LABELS[t] || t}
          </button>
        ))}
      </div>

      <div className="sm:hidden text-[10px] text-muted-foreground font-mono mb-2 flex items-center gap-1">
        <span aria-hidden>←</span>
        <span>Swipe through years</span>
        <span aria-hidden>→</span>
      </div>

      {/* Year columns — flex-1 on desktop fills width; horizontal scroll if narrower than min */}
      <div className="overflow-x-auto">
        <div className="flex items-start gap-0">
          {byYear.map(([yr, events]) => (
            <div key={yr} className="flex-1 min-w-[120px] border-l border-border px-1">
              <div className="text-sm font-bold text-primary px-1.5 py-1 sticky top-[50px] bg-background z-[5]">
                {yr}
              </div>
              {events.map(ev => {
                const idx = globalIdx++;
                const isExpanded = expanded.has(idx);
                const isDead = ev.dead || ev.t === 'Shutdown' || ev.t === 'Layoffs';

                return (
                  <div
                    key={idx}
                    onClick={() => toggle(idx)}
                    className={cn(
                      'px-2 py-1.5 cursor-pointer border border-transparent hover:bg-secondary hover:border-border my-0.5 transition-colors',
                      isExpanded && 'bg-secondary border-border',
                      isDead && 'opacity-80'
                    )}
                  >
                    <div className="text-[9px] text-muted-foreground">{ev.d.substring(5) || ''}</div>
                    <div className="flex items-center gap-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full inline-block shrink-0"
                        style={{
                          background: isDead ? 'hsl(0 70% 50%)' : 'hsl(var(--foreground) / 0.5)',
                        }}
                      />
                      <span className={cn('text-[11px] font-bold', isDead && 'text-destructive')}>
                        {ev.v}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">{ev.h}</div>
                    {isExpanded && ev.x && (
                      <div className="text-[10px] text-muted-foreground mt-1 pt-1 border-t border-border leading-relaxed">
                        {ev.x}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
