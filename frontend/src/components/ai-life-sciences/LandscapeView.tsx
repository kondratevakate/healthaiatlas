import { useState, useMemo } from 'react';
import { useResponsiveSvgWidth } from '@/hooks/use-responsive-svg-width';
import {
  LS_BUBBLES,
  LS_CLUSTERS,
  LS_FAMILY_LABELS,
  LS_ET_LABELS,
  type LSClusterFamily,
} from '@/data/aiLifeSciences';
import { cn } from '@/lib/utils';

const FAMILY_ORDER: LSClusterFamily[] = ['care_delivery', 'discovery_rd', 'therapeutic', 'ai_infra', 'meta'];

// In-frame clusters first, off-frame at the bottom; sort within family by id.
const ORDERED_CLUSTERS = [...LS_CLUSTERS].sort((a, b) => {
  if (a.offFrame !== b.offFrame) return a.offFrame ? 1 : -1;
  const fa = FAMILY_ORDER.indexOf(a.family);
  const fb = FAMILY_ORDER.indexOf(b.family);
  if (fa !== fb) return fa - fb;
  return a.id.localeCompare(b.id);
});

export function LandscapeView() {
  const [filter, setFilter] = useState<'all' | LSClusterFamily>('all');
  const [hovered, setHovered] = useState<number | null>(null);

  const matchesFilter = (clusterId: string): boolean => {
    if (filter === 'all') return true;
    const cluster = LS_CLUSTERS.find((c) => c.id === clusterId);
    return !!cluster && cluster.family === filter;
  };

  const filtered = useMemo(
    () => LS_BUBBLES.filter((b) => matchesFilter(b.cluster)),
    [filter],
  );

  const visibleClusters = useMemo(() => {
    if (filter === 'all') return ORDERED_CLUSTERS;
    return ORDERED_CLUSTERS.filter((c) => c.family === filter);
  }, [filter]);

  const { ref: containerRef, width: containerW } = useResponsiveSvgWidth(900);

  const minYear = 2014;
  const maxYear = 2027;
  const yearRange = maxYear - minYear;
  const rowH = 30;
  const leftW = 220;
  const chartW = Math.max(280, containerW - leftW - 24);
  const svgW = leftW + chartW + 20;
  const svgH = visibleClusters.length * rowH + 50;

  return (
    <div>
      {/* Family filter chips */}
      <div className="flex flex-wrap gap-1 mb-4 items-center">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-2 py-1 text-[11px] font-mono border transition-colors',
            filter === 'all'
              ? 'bg-foreground text-background border-foreground'
              : 'border-border text-muted-foreground hover:text-foreground',
          )}
        >
          All families
        </button>
        {FAMILY_ORDER.map((f) => {
          const sample = LS_CLUSTERS.find((c) => c.family === f);
          if (!sample) return null;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-2 py-1 text-[11px] font-mono border transition-colors flex items-center gap-1.5',
                filter === f
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              <span aria-hidden="true" className="inline-block w-2 h-2" style={{ background: sample.color }} />
              {LS_FAMILY_LABELS[f]}
            </button>
          );
        })}
      </div>

      {/* Swimlane chart */}
      <div ref={containerRef} className="border border-border mb-6 overflow-x-auto">
        <svg width={svgW} height={svgH} className="block">
          {/* Year grid */}
          {Array.from({ length: yearRange + 1 }, (_, i) => minYear + i).map((yr) => {
            const x = leftW + ((yr - minYear) / yearRange) * chartW;
            return (
              <g key={yr}>
                <line x1={x} y1={20} x2={x} y2={svgH} stroke="hsl(var(--border))" strokeWidth={0.5} />
                {(yr % 2 === 0 || yr >= 2022) && (
                  <text x={x} y={14} textAnchor="middle" className="fill-primary text-[10px] font-bold">
                    {yr}
                  </text>
                )}
              </g>
            );
          })}

          {/* Cluster rows */}
          {visibleClusters.map((cluster, i) => {
            const y = i * rowH + 36;
            return (
              <g key={cluster.id}>
                {cluster.offFrame && (
                  <rect
                    x={0}
                    y={y - rowH / 2 + 4}
                    width={svgW}
                    height={rowH - 8}
                    fill="hsl(var(--muted))"
                    fillOpacity={0.35}
                  />
                )}
                <line
                  x1={leftW}
                  y1={y}
                  x2={svgW}
                  y2={y}
                  stroke="hsl(var(--border))"
                  strokeWidth={0.5}
                  strokeDasharray={cluster.offFrame ? '1,3' : '2,4'}
                />
                <rect
                  x={6}
                  y={y - 6}
                  width={8}
                  height={12}
                  fill={cluster.color}
                />
                <text x={20} y={y + 4} className="fill-foreground text-[10px] font-medium">
                  {cluster.label.length > 30 ? cluster.label.substring(0, 28) + '…' : cluster.label}
                </text>
              </g>
            );
          })}

          {/* Bubbles */}
          {filtered.map((b, i) => {
            const rowIdx = visibleClusters.findIndex((c) => c.id === b.cluster);
            if (rowIdx === -1) return null;
            const cluster = visibleClusters[rowIdx];
            const y = rowIdx * rowH + 36;
            const x = leftW + ((b.d - minYear) / yearRange) * chartW;
            if (x < leftW || x > svgW) return null;
            const r = b.a > 0 ? Math.max(4, Math.min(22, Math.sqrt(b.a) * 0.85)) : 3.5;
            const color = cluster.color;
            const hasSrc = !!b.src;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => hasSrc && window.open(b.src, '_blank')}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={color}
                  fillOpacity={hovered === i ? 0.75 : 0.45}
                  stroke={color}
                  strokeWidth={hasSrc ? 1.5 : 1}
                  strokeDasharray={hasSrc ? undefined : '3,2'}
                />
                {b.a >= 250 && (
                  <text
                    x={x}
                    y={y + 3}
                    textAnchor="middle"
                    className="fill-white text-[7px] font-bold pointer-events-none"
                  >
                    ${b.a >= 1000 ? `${(b.a / 1000).toFixed(1)}B` : `${Math.round(b.a)}M`}
                  </text>
                )}
                {hovered === i && (
                  <foreignObject
                    x={Math.min(x + r + 4, svgW - 290)}
                    y={Math.max(0, y - 60)}
                    width={280}
                    height={150}
                  >
                    <div className="bg-background border border-border p-2 text-[10px] leading-tight shadow-lg">
                      <div className="font-bold text-foreground">{b.c}</div>
                      {b.p && <div className="text-primary text-[9px]">{b.p}</div>}
                      <div className="text-muted-foreground mt-0.5 line-clamp-4">{b.desc}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-[9px] px-1 border border-border bg-secondary">
                          {LS_ET_LABELS[b.et] || b.et}
                        </span>
                        {b.a > 0 && (
                          <span className="text-[9px] px-1 border border-primary/30 text-primary">
                            ${b.a >= 1000 ? `${(b.a / 1000).toFixed(1)}B` : `${Math.round(b.a)}M`}
                          </span>
                        )}
                        {b.geo && (
                          <span className="text-[9px] px-1 border border-border text-muted-foreground">
                            {b.geo}
                          </span>
                        )}
                      </div>
                      {hasSrc && (
                        <div className="text-primary text-[9px] mt-1 font-semibold">
                          🔗 Click to open source
                        </div>
                      )}
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
