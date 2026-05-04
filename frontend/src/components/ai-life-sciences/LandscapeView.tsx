import { useState, useMemo, useEffect, useRef } from 'react';
import {
  LS_BUBBLES,
  LS_CLUSTERS,
  LS_FAMILY_LABELS,
  LS_ET_LABELS,
  LS_RELIABILITY,
  type LSClusterFamily,
} from '@/data/aiLifeSciences';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

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
  const [familyFilter, setFamilyFilter] = useState<LSClusterFamily | 'all'>('all');
  const [hovered, setHovered] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      LS_BUBBLES.filter((b) => {
        if (familyFilter === 'all') return true;
        const cluster = LS_CLUSTERS.find((c) => c.id === b.cluster);
        return cluster?.family === familyFilter;
      }),
    [familyFilter],
  );

  const visibleClusters = useMemo(() => {
    if (familyFilter === 'all') return ORDERED_CLUSTERS;
    return ORDERED_CLUSTERS.filter((c) => c.family === familyFilter);
  }, [familyFilter]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(900);
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerW(entry.contentRect.width);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Date range derived from data
  const minYear = 2014;
  const maxYear = 2027;
  const yearRange = maxYear - minYear;
  const rowH = 30;
  const leftW = 220;
  const chartW = Math.max(700, containerW - leftW - 24);
  const svgW = leftW + chartW + 20;
  const svgH = visibleClusters.length * rowH + 50;

  // Reliability counts for the strip below
  const reliabilityCounts = useMemo(() => {
    const c = [0, 0, 0, 0, 0, 0]; // index 0 unused; 1-5 used
    for (const b of LS_BUBBLES) {
      if (b.reliability && b.reliability >= 1 && b.reliability <= 5) {
        c[b.reliability]++;
      }
    }
    return c;
  }, []);
  const reliabilityTotal = reliabilityCounts.reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* Family filter */}
      <div className="flex flex-wrap gap-1 mb-4 items-center">
        <button
          onClick={() => setFamilyFilter('all')}
          className={cn(
            'px-2 py-1 text-[11px] font-mono border transition-colors',
            familyFilter === 'all'
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
              onClick={() => setFamilyFilter(f)}
              className={cn(
                'px-2 py-1 text-[11px] font-mono border transition-colors flex items-center gap-1.5',
                familyFilter === f
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
                {/* row background tint */}
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
                {/* Cluster swatch */}
                <rect x={6} y={y - 6} width={8} height={12} fill={cluster.color} />
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
            const isHighRisk = b.reliability && b.reliability >= 4;

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
                  stroke={isHighRisk ? 'hsl(var(--destructive))' : color}
                  strokeWidth={isHighRisk ? 2 : hasSrc ? 1.5 : 1}
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
                        {b.reliability && (
                          <span
                            className={cn(
                              'text-[9px] px-1 border',
                              b.reliability >= 4
                                ? 'border-destructive/40 text-destructive'
                                : 'border-border text-muted-foreground',
                            )}
                          >
                            risk {b.reliability}/5
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

      {/* Reliability strip — quantitative */}
      {reliabilityTotal > 0 && (
        <div className="mb-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
            Reliability risk distribution ({reliabilityTotal} entries scored, 1 = FDA + high evidence · 5 = known reliability gap)
          </div>
          <div className="flex h-4 border border-border">
            {[1, 2, 3, 4, 5].map((lvl) => {
              const n = reliabilityCounts[lvl];
              if (n === 0) return null;
              const pct = (n / reliabilityTotal) * 100;
              const colors = [
                '',
                'hsl(150 60% 35%)',
                'hsl(90 50% 40%)',
                'hsl(45 70% 45%)',
                'hsl(20 70% 45%)',
                'hsl(0 70% 40%)',
              ];
              return (
                <div
                  key={lvl}
                  className="text-[9px] font-mono text-white text-center leading-4"
                  style={{ width: `${pct}%`, background: colors[lvl] }}
                  title={`Risk ${lvl}/5 — ${n} entries (${pct.toFixed(0)}%)`}
                >
                  {pct >= 6 ? `${lvl}: ${n}` : ''}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reliability alerts */}
      <div className="mb-4">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-foreground mb-3 pb-2 border-b border-border">
          ⚡ Reliability Alerts (editorial)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {LS_RELIABILITY.map((r, i) => (
            <div key={i} className="border border-destructive/20 bg-destructive/5 p-3">
              <h4 className="text-xs font-semibold text-destructive mb-1">{r.c}</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">{r.d}</p>
              {r.src && (
                <a
                  href={r.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3" /> View source
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
