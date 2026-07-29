import { useState, useMemo, useCallback } from 'react';
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

// ── Piecewise time scale ────────────────────────────────────────────────────
// Event density is heavily skewed to 2019+. A linear scale wastes ~40% of the
// width on the sparse 2014–2019 span. We give the early era a fixed slim share
// and let the dense era breathe.
const SCALE_MIN = 2014;
const SCALE_BREAK = 2019;
const SCALE_MAX = 2027;
const EARLY_SHARE = 0.18; // 2014–2019 gets 18% of the plot width

function timeToFrac(d: number): number {
  const clamped = Math.max(SCALE_MIN, Math.min(SCALE_MAX, d));
  if (clamped <= SCALE_BREAK) {
    return ((clamped - SCALE_MIN) / (SCALE_BREAK - SCALE_MIN)) * EARLY_SHARE;
  }
  return (
    EARLY_SHARE +
    ((clamped - SCALE_BREAK) / (SCALE_MAX - SCALE_BREAK)) * (1 - EARLY_SHARE)
  );
}

// Ticks: sparse in the compressed era, every year in the dense era.
const YEAR_TICKS = [2014, 2016, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027];

interface TooltipState {
  bubbleIdx: number;
  x: number; // viewport coords
  y: number;
}

export function LandscapeView() {
  const [filter, setFilter] = useState<'all' | LSClusterFamily>('all');
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

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

  const rowH = 30;
  const leftW = 220;
  const axisH = 26;
  const padTop = 8;
  const chartW = Math.max(280, containerW - leftW - 24);
  const svgW = leftW + chartW + 20;
  const plotH = visibleClusters.length * rowH;
  const svgH = padTop + plotH + axisH;

  const xOf = useCallback(
    (d: number) => leftW + timeToFrac(d) * chartW,
    [leftW, chartW],
  );

  const showTooltip = (bubbleIdx: number, e: React.MouseEvent) => {
    setTooltip({ bubbleIdx, x: e.clientX, y: e.clientY });
  };

  const hoveredBubble = tooltip ? filtered[tooltip.bubbleIdx] : null;
  const hoveredCluster = hoveredBubble
    ? visibleClusters.find((c) => c.id === hoveredBubble.cluster)
    : null;

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
          {/* Year gridlines — inside plot only */}
          {YEAR_TICKS.map((yr) => {
            const x = xOf(yr);
            return (
              <line
                key={`grid-${yr}`}
                x1={x}
                y1={padTop}
                x2={x}
                y2={padTop + plotH}
                stroke="hsl(var(--border))"
                strokeWidth={0.5}
                opacity={yr <= SCALE_BREAK ? 0.35 : 0.6}
              />
            );
          })}

          {/* Cluster rows */}
          {visibleClusters.map((cluster, i) => {
            const y = padTop + i * rowH + rowH / 2;
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
                <rect x={6} y={y - 6} width={8} height={12} fill={cluster.color} />
                <text x={20} y={y + 4} className="fill-foreground text-[10px] font-medium">
                  {cluster.label.length > 30 ? cluster.label.substring(0, 28) + '…' : cluster.label}
                </text>
              </g>
            );
          })}

          {/* Year axis — below the plot */}
          <line
            x1={leftW}
            y1={padTop + plotH}
            x2={leftW + chartW}
            y2={padTop + plotH}
            stroke="hsl(var(--border))"
            strokeWidth={1}
          />
          {YEAR_TICKS.map((yr) => {
            const x = xOf(yr);
            return (
              <g key={`axis-${yr}`}>
                <line
                  x1={x}
                  y1={padTop + plotH}
                  x2={x}
                  y2={padTop + plotH + 4}
                  stroke="hsl(var(--border))"
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={padTop + plotH + 17}
                  textAnchor="middle"
                  className={cn(
                    'text-[10px] font-mono',
                    yr <= SCALE_BREAK ? 'fill-muted-foreground/60' : 'fill-muted-foreground',
                  )}
                >
                  {yr}
                </text>
              </g>
            );
          })}

          {/* Bubbles — largest first so small ones stay clickable on top */}
          {[...filtered]
            .map((b, originalIdx) => ({ b, originalIdx }))
            .sort((p, q) => q.b.a - p.b.a)
            .map(({ b, originalIdx }) => {
              const rowIdx = visibleClusters.findIndex((c) => c.id === b.cluster);
              if (rowIdx === -1) return null;
              const cluster = visibleClusters[rowIdx];
              const y = padTop + rowIdx * rowH + rowH / 2;
              const x = xOf(b.d);
              const r = b.a > 0 ? Math.max(4, Math.min(22, Math.sqrt(b.a) * 0.85)) : 3.5;
              const color = cluster.color;
              const hasSrc = !!b.src;
              const isHover = tooltip?.bubbleIdx === originalIdx;

              return (
                <g
                  key={originalIdx}
                  className="cursor-pointer"
                  onMouseEnter={(e) => showTooltip(originalIdx, e)}
                  onMouseMove={(e) => showTooltip(originalIdx, e)}
                  onMouseLeave={() => setTooltip(null)}
                  onClick={() => hasSrc && window.open(b.src, '_blank')}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill={color}
                    fillOpacity={isHover ? 0.75 : 0.45}
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
                </g>
              );
            })}
        </svg>
      </div>

      {/* Tooltip — HTML overlay OUTSIDE the SVG: always the topmost layer,
          opens to the LEFT of the cursor so it never covers the bubbles
          to the right that the user is scanning toward. */}
      {hoveredBubble && tooltip && (
        <div
          className="fixed z-[300] bg-background border border-border p-2.5 text-[10px] leading-tight shadow-lg w-[280px] pointer-events-none"
          style={{
            left: Math.max(8, tooltip.x - 292), // open leftward
            top: Math.min(tooltip.y + 12, window.innerHeight - 170),
          }}
        >
          <div className="font-bold text-foreground text-[11px]">{hoveredBubble.c}</div>
          {hoveredBubble.p && <div className="text-primary text-[9px]">{hoveredBubble.p}</div>}
          <div className="text-muted-foreground mt-0.5 line-clamp-4">{hoveredBubble.desc}</div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            <span className="text-[9px] px-1 border border-border bg-secondary">
              {LS_ET_LABELS[hoveredBubble.et] || hoveredBubble.et}
            </span>
            {hoveredBubble.a > 0 && (
              <span className="text-[9px] px-1 border border-primary/30 text-primary">
                ${hoveredBubble.a >= 1000 ? `${(hoveredBubble.a / 1000).toFixed(1)}B` : `${Math.round(hoveredBubble.a)}M`}
              </span>
            )}
            {hoveredBubble.geo && (
              <span className="text-[9px] px-1 border border-border text-muted-foreground">
                {hoveredBubble.geo}
              </span>
            )}
            {hoveredCluster && (
              <span
                className="text-[9px] px-1 border"
                style={{ borderColor: hoveredCluster.color, color: hoveredCluster.color }}
              >
                {hoveredCluster.label}
              </span>
            )}
          </div>
          {hoveredBubble.src && (
            <div className="text-primary text-[9px] mt-1 font-semibold">
              🔗 Click to open source
            </div>
          )}
        </div>
      )}
    </div>
  );
}
