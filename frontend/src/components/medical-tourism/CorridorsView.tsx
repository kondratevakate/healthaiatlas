import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { SOURCES, DESTINATIONS, CORRIDORS } from '@/data/medicalTourism';
import { BubbleMap } from './BubbleMap';

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
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
        {/* Sources column — origin countries (filter on click) */}
        <div className="space-y-1 bg-secondary/30 border border-border p-3">
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-[11px] uppercase tracking-widest text-foreground font-mono font-semibold">
              ← Sources
            </div>
            <div className="text-[9px] text-muted-foreground font-mono">click to filter</div>
          </div>
          {sources.map((s) => {
            const active = selSrc === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelSrc(active ? null : s.id)}
                style={{ height: rowH }}
                title={`${s.label}: ~${s.vol},000 patients travelling abroad annually · ${s.growth} year-over-year growth · click to filter corridors`}
                className={cn(
                  'w-full flex items-center gap-2 px-2 border text-left transition-colors bg-background',
                  active ? 'border-foreground bg-foreground/10' : 'border-border hover:border-foreground/40'
                )}
              >
                <span
                  className="rounded-full bg-foreground/15 border border-foreground/30 shrink-0"
                  style={{ width: sizeFor(s.vol), height: sizeFor(s.vol) }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-foreground truncate">
                    {s.flag} {s.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {s.vol}K/yr · {s.growth} YoY
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Flow lines */}
        <div className="hidden md:block pt-9">
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

        {/* Destinations column — receiving countries (filter on click) */}
        <div className="space-y-1 bg-primary/5 border border-primary/20 p-3">
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-[11px] uppercase tracking-widest text-foreground font-mono font-semibold">
              Destinations →
            </div>
            <div className="text-[9px] text-muted-foreground font-mono">click to filter</div>
          </div>
          {dests.map((d) => {
            const active = selDst === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelDst(active ? null : d.id)}
                style={{ height: rowH }}
                title={`${d.label}: ${d.jci} JCI-accredited facilities · strengths: ${d.strength} · click to filter corridors`}
                className={cn(
                  'w-full flex items-center gap-2 px-2 border text-left transition-colors bg-background',
                  active ? 'border-foreground bg-foreground/10' : 'border-border hover:border-foreground/40'
                )}
              >
                <span
                  className="rounded-full bg-foreground/25 border border-foreground/40 shrink-0"
                  style={{ width: sizeFor(d.jci * 2), height: sizeFor(d.jci * 2) }}
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

      {/* Legend explaining what numbers mean */}
      <div className="text-[10px] text-muted-foreground font-mono flex flex-wrap gap-x-4 gap-y-1 pt-1">
        <span><strong className="text-foreground">K/yr</strong> = thousand outbound medical tourists per year</span>
        <span><strong className="text-foreground">YoY</strong> = year-over-year growth</span>
        <span><strong className="text-foreground">JCI</strong> = Joint Commission International accredited facilities</span>
      </div>

      {(selSrc || selDst) && (
        <button
          onClick={() => { setSelSrc(null); setSelDst(null); }}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          Clear filters
        </button>
      )}

      {/* Bubble map — replaces the old corridor card grid */}
      <div className="border-t border-border pt-4">
        <BubbleMap specialty={specialty} selSrc={selSrc} selDst={selDst} />
      </div>
    </div>
  );
}
