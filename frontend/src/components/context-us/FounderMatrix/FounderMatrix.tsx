import { useMemo, useState } from 'react';
import { Compass } from 'lucide-react';
import { FOUNDER_CASES, OUTCOME_COLORS } from '@/data/usFounderMatrix';
import { RadarChart } from './RadarChart';
import { CaseSelector, type FilterMode } from './CaseSelector';
import { cn } from '@/lib/utils';

export function FounderMatrix() {
  const [filter, setFilter] = useState<FilterMode>('live');
  const [hoverId, setHoverId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<FilterMode, number> = {
      all: FOUNDER_CASES.length,
      live: 0,
      acquired: 0,
      shutdown: 0,
      fraud: 0,
    };
    for (const f of FOUNDER_CASES) c[f.outcome]++;
    return c;
  }, []);

  const visible = useMemo(
    () => (filter === 'all' ? FOUNDER_CASES : FOUNDER_CASES.filter((f) => f.outcome === filter)),
    [filter],
  );

  return (
    <section>
      <header className="mb-6">
        <div
          className="text-[10px] uppercase tracking-widest font-mono italic text-muted-foreground mb-2"
        >
          ★ <span style={{ color: 'hsl(14 90% 55%)' }}>We are here</span> · 2026 · why founders need this map
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Compass className="h-5 w-5" style={{ color: 'hsl(180 70% 40%)' }} />
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
            Founder's Decision Matrix
          </h2>
        </div>
        <p className="text-sm text-foreground/85 leading-relaxed max-w-3xl">
          Seven axes. Twelve cases. Survival means filling all seven spokes — the graveyard ones
          collapse to capital and almost nothing else.
        </p>
      </header>

      <CaseSelector value={filter} onChange={setFilter} counts={counts} />

      <RadarChart cases={visible} highlightId={hoverId} onHover={setHoverId} />

      {/* Quick navigation list — alternative entry point to hovering */}
      <div className="mt-6">
        <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-2">
          Click a case for detail →
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
          {visible.map((c) => {
            const isActive = hoverId === c.id;
            const color = OUTCOME_COLORS[c.outcome];
            return (
              <button
                key={c.id}
                type="button"
                onMouseEnter={() => setHoverId(c.id)}
                onMouseLeave={() => setHoverId(null)}
                onFocus={() => setHoverId(c.id)}
                onBlur={() => setHoverId(null)}
                className={cn(
                  'text-left text-[11px] font-mono border px-2 py-1.5 transition-colors flex items-center gap-1.5',
                  isActive
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/40',
                )}
              >
                <span
                  aria-hidden="true"
                  className="inline-block w-2 h-2 shrink-0"
                  style={{ background: color }}
                />
                <span className="truncate">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
