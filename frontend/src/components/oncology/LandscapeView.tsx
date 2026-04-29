import { useState, useMemo } from 'react';
import { ONCO_BUBBLES, ONCO_TUMOR_COLORS, ONCO_DP_ORDER, ONCO_DP_LABELS, ONCO_ET_LABELS, ONCO_RELIABILITY } from '@/data/oncology';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

export function LandscapeView() {
  const [tumorFilter, setTumorFilter] = useState('all');
  const [hovered, setHovered] = useState<number | null>(null);

  const tumors = useMemo(() => [...new Set(ONCO_BUBBLES.map(b => b.tm))], []);

  const filtered = useMemo(() => {
    return ONCO_BUBBLES.filter(b => tumorFilter === 'all' || b.tm === tumorFilter);
  }, [tumorFilter]);

  // SVG layout
  const rowH = 32;
  const leftW = 130;
  const chartW = 800;
  const minYear = 2013;
  const maxYear = 2026;
  const yearRange = maxYear - minYear;
  const svgW = leftW + chartW + 20;
  const svgH = ONCO_DP_ORDER.length * rowH + 40;

  return (
    <div>
      {/* Tumor filter */}
      <div className="flex flex-wrap gap-1 mb-4 items-center">
        <button
          onClick={() => setTumorFilter('all')}
          className={cn(
            'px-2 py-1 text-[11px] font-mono border transition-colors',
            tumorFilter === 'all' ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:text-foreground'
          )}
        >
          All
        </button>
        {tumors.map(tm => (
          <button
            key={tm}
            onClick={() => setTumorFilter(tm)}
            className={cn(
              'px-2 py-1 text-[11px] font-mono border transition-colors flex items-center gap-1',
              tumorFilter === tm ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: ONCO_TUMOR_COLORS[tm] || 'hsl(var(--foreground) / 0.5)' }} />
            {tm}
          </button>
        ))}
      </div>

      {/* Swimlane chart */}
      <div className="overflow-x-auto border border-border mb-6">
        <svg width={svgW} height={svgH} className="block min-w-[900px]">
          {/* Year grid */}
          {Array.from({ length: yearRange + 1 }, (_, i) => minYear + i).map(yr => {
            const x = leftW + ((yr - minYear) / yearRange) * chartW;
            return (
              <g key={yr}>
                <line x1={x} y1={0} x2={x} y2={svgH} stroke="hsl(var(--border))" strokeWidth={0.5} />
                <text x={x} y={14} textAnchor="middle" className="fill-primary text-[10px] font-bold">{yr}</text>
              </g>
            );
          })}

          {/* Decision point rows */}
          {ONCO_DP_ORDER.map((dp, i) => {
            const y = i * rowH + 28;
            return (
              <g key={dp}>
                <line x1={0} y1={y} x2={svgW} y2={y} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="2,4" />
                <text x={4} y={y + 14} className="fill-muted-foreground text-[8px]">
                  {(ONCO_DP_LABELS[dp] || dp).substring(0, 16)}
                </text>
              </g>
            );
          })}

          {/* Bubbles */}
          {filtered.map((b, i) => {
            const dpIdx = ONCO_DP_ORDER.indexOf(b.dp);
            if (dpIdx === -1) return null;
            const y = dpIdx * rowH + 38;
            const x = leftW + ((b.d - minYear) / yearRange) * chartW;
            const r = b.a > 0 ? Math.max(4, Math.min(22, Math.sqrt(b.a) * 0.8)) : 3;
            const color = ONCO_TUMOR_COLORS[b.tm] || 'hsl(var(--foreground) / 0.5)';
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
                  cx={x} cy={y} r={r}
                  fill={color} fillOpacity={hovered === i ? 0.5 : 0.25}
                  stroke={color} strokeWidth={hasSrc ? 2 : 1}
                  strokeDasharray={hasSrc ? undefined : '3,2'}
                />
                {b.a >= 500 && (
                  <text x={x} y={y + 3} textAnchor="middle" className="fill-foreground text-[6px] font-bold pointer-events-none">
                    ${b.a >= 1000 ? `${(b.a/1000).toFixed(1)}B` : `${b.a}M`}
                  </text>
                )}
                {hovered === i && (
                  <foreignObject x={Math.min(x + r + 4, svgW - 270)} y={y - 40} width={260} height={100}>
                    <div className="bg-background border border-border p-2 text-[10px] leading-tight shadow-lg">
                      <div className="font-bold text-foreground">{b.c}</div>
                      <div className="text-primary text-[9px]">{b.p || b.et}</div>
                      <div className="text-muted-foreground mt-0.5">{b.desc}</div>
                      <div className="flex gap-1 mt-1">
                        <span className="text-[9px] px-1 border border-border bg-secondary">{b.e}</span>
                        <span className="text-[9px] px-1 border border-border bg-secondary">{ONCO_ET_LABELS[b.et] || b.et}</span>
                        {b.a > 0 && <span className="text-[9px] px-1 border border-primary/30 text-primary">${b.a}M</span>}
                      </div>
                      {hasSrc && <div className="text-primary text-[9px] mt-1 font-semibold">🔗 Click to open source</div>}
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Reliability alerts */}
      <div className="mb-4">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-foreground mb-3 pb-2 border-b border-border">
          ⚡ Reliability Alerts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ONCO_RELIABILITY.slice(0, 6).map((r, i) => (
            <div key={i} className="border border-destructive/20 bg-destructive/5 p-3">
              <h4 className="text-xs font-semibold text-destructive mb-1">{r.c}</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">{r.d}</p>
              {r.src && (
                <a href={r.src} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
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
