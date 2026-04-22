import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { SOURCES, DESTINATIONS, CORRIDORS } from '@/data/medicalTourism';

interface Props {
  specialty: string;
}

export function CorridorsView({ specialty }: Props) {
  const [selSrc, setSelSrc] = useState<string | null>(null);
  const [selDst, setSelDst] = useState<string | null>(null);
  const [hovCor, setHovCor] = useState<number | null>(null);

  const sources = useMemo(
    () => specialty === 'all' ? SOURCES : SOURCES.filter(s => s.specs.includes(specialty)),
    [specialty]
  );
  const dests = useMemo(
    () => specialty === 'all' ? DESTINATIONS : DESTINATIONS.filter(d => d.specs.includes(specialty)),
    [specialty]
  );
  const corridors = useMemo(() => CORRIDORS.filter(c => {
    if (specialty !== 'all' && !c.spec.includes(specialty)) return false;
    if (selSrc && c.from !== selSrc) return false;
    if (selDst && c.to !== selDst) return false;
    return true;
  }), [specialty, selSrc, selDst]);

  const maxV = Math.max(...CORRIDORS.map(c => c.vol));
  const srcIdx = (id: string) => sources.findIndex(s => s.id === id);
  const dstIdx = (id: string) => dests.findIndex(d => d.id === id);

  const rowH = 44;
  const svgH = Math.max(sources.length, dests.length) * rowH + 20;

  const sizeFor = (vol: number) => 14 + (vol / maxV) * 22;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
        {/* Sources column */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-mono">Sources</div>
          {sources.map((s, i) => {
            const active = selSrc === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelSrc(active ? null : s.id)}
                style={{ height: rowH }}
                className={cn(
                  'w-full flex items-center gap-2 px-2 border text-left transition-colors',
                  active ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/40'
                )}
              >
                <span
                  className="rounded-full bg-foreground/15 border border-foreground/30 shrink-0"
                  style={{ width: sizeFor(s.vol), height: sizeFor(s.vol) }}
                  title={`${s.vol}K patients/yr`}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-foreground truncate">
                    {s.flag} {s.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {s.vol}K · {s.growth}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Flow lines */}
        <div className="hidden md:block">
          <svg width="180" height={svgH} className="overflow-visible">
            {corridors.map((c, idx) => {
              const si = srcIdx(c.from);
              const di = dstIdx(c.to);
              if (si < 0 || di < 0) return null;
              const y1 = si * rowH + rowH / 2;
              const y2 = di * rowH + rowH / 2;
              const w = 1 + (c.vol / maxV) * 6;
              const isHov = hovCor === idx;
              return (
                <g key={idx}>
                  <path
                    d={`M0,${y1} C90,${y1} 90,${y2} 180,${y2}`}
                    fill="none"
                    stroke="hsl(var(--foreground))"
                    strokeOpacity={isHov ? 0.7 : 0.18}
                    strokeWidth={w}
                    className="transition-all cursor-pointer"
                    onMouseEnter={() => setHovCor(idx)}
                    onMouseLeave={() => setHovCor(null)}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Destinations column */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-mono">Destinations</div>
          {dests.map((d) => {
            const active = selDst === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelDst(active ? null : d.id)}
                style={{ height: rowH }}
                className={cn(
                  'w-full flex items-center gap-2 px-2 border text-left transition-colors',
                  active ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/40'
                )}
              >
                <span
                  className="rounded-full bg-foreground/25 border border-foreground/40 shrink-0"
                  style={{ width: sizeFor(d.jci * 2), height: sizeFor(d.jci * 2) }}
                  title={`${d.jci} JCI-accredited facilities`}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-foreground truncate">
                    {d.flag} {d.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono truncate">
                    JCI {d.jci} · {d.strength.split(',')[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {(selSrc || selDst) && (
        <button
          onClick={() => { setSelSrc(null); setSelDst(null); }}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          Clear filters
        </button>
      )}

      {/* Corridor detail list */}
      <div className="border-t border-border pt-4">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-mono">
          {corridors.length} corridor{corridors.length !== 1 ? 's' : ''}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {corridors.map((c, idx) => {
            const src = SOURCES.find(s => s.id === c.from);
            const dst = DESTINATIONS.find(d => d.id === c.to);
            return (
              <div
                key={idx}
                onMouseEnter={() => setHovCor(idx)}
                onMouseLeave={() => setHovCor(null)}
                className={cn(
                  'border p-3 transition-colors',
                  hovCor === idx ? 'border-foreground bg-foreground/5' : 'border-border'
                )}
              >
                <div className="flex items-center justify-between text-xs font-medium text-foreground mb-1">
                  <span>{src?.flag} {src?.label} → {dst?.flag} {dst?.label}</span>
                  <span className="font-mono text-muted-foreground">{c.vol}K</span>
                </div>
                <div className="text-[10px] text-muted-foreground mb-1 font-mono">{c.channel}</div>
                <div className="text-xs text-muted-foreground">{c.note}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
