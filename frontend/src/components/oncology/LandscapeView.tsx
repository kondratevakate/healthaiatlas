import { useState, useMemo } from 'react';
import {
  ONCO_BUBBLES,
  ONCO_TUMOR_META,
  ONCO_DP_ORDER,
  ONCO_DP_LABELS,
  ONCO_ET_LABELS,
  ONCO_RELIABILITY,
} from '@/data/oncology';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import { useResponsiveSvgWidth } from '@/hooks/use-responsive-svg-width';

// Visual contract:
//  - Filter chip swatch color == bubble fill color.
//  - Both read from ONCO_TUMOR_META (single source of truth).
//  - No emojis as color cues (font rendering varies per OS — colors drift).

export function LandscapeView() {
  const [tumorFilter, setTumorFilter] = useState('all');
  const [hovered, setHovered] = useState<number | null>(null);

  const tumors = useMemo(() => [...new Set(ONCO_BUBBLES.map((b) => b.tm))], []);

  const filtered = useMemo(
    () => ONCO_BUBBLES.filter((b) => tumorFilter === 'all' || b.tm === tumorFilter),
    [tumorFilter],
  );

  const { ref: containerRef, width: containerW } = useResponsiveSvgWidth(900);

  // Layout — years live on a separate axis row below the plot.
  const rowH = 44;
  const leftW = 168;
  const axisH = 28;
  const padTop = 16;
  const padRight = 24;
  const minYear = 2013;
  const maxYear = 2026;
  const yearRange = maxYear - minYear;
  const chartW = Math.max(320, containerW - leftW - padRight);
  const plotH = ONCO_DP_ORDER.length * rowH;
  const svgW = leftW + chartW + padRight;
  const svgH = padTop + plotH + axisH;

  // Radius: full sqrt(area) scaling, generous min/max so $5M ≠ $500M.
  // Largest deal ~$2B -> r ~ 28; tiny / unknown -> r = 4.
  const radius = (amount: number) => {
    if (!amount || amount <= 0) return 4;
    const r = Math.sqrt(amount) * 0.7;
    return Math.max(5, Math.min(34, r));
  };

  // Year-tick density: every 2 yrs on narrow widths, every year on wide.
  const yearStep = chartW < 520 ? 2 : 1;

  return (
    <div>
      {/* Tumor filter — swatch color matches bubble fill */}
      <div className="flex flex-wrap gap-1.5 mb-5 items-center">
        <button
          onClick={() => setTumorFilter('all')}
          className={cn(
            'px-2.5 py-1 text-[11px] font-mono border transition-colors',
            tumorFilter === 'all'
              ? 'bg-foreground text-background border-foreground'
              : 'border-border text-muted-foreground hover:text-foreground',
          )}
        >
          All
        </button>
        {tumors.map((tm) => {
          const meta = ONCO_TUMOR_META[tm];
          const swatch = meta?.color ?? 'hsl(var(--muted-foreground))';
          const label = meta?.label ?? tm;
          const active = tumorFilter === tm;
          return (
            <button
              key={tm}
              onClick={() => setTumorFilter(tm)}
              className={cn(
                'px-2.5 py-1 text-[11px] font-mono border transition-colors flex items-center gap-1.5',
                active
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
              aria-pressed={active}
            >
              <span
                aria-hidden="true"
                className="inline-block w-2.5 h-2.5 rounded-full border"
                style={{
                  backgroundColor: swatch,
                  borderColor: active ? 'hsl(var(--background))' : swatch,
                }}
              />
              {label}
            </button>
          );
        })}
      </div>

      {/* Chart frame */}
      <div ref={containerRef} className="border border-border mb-6 bg-background">
        <svg width={svgW} height={svgH} className="block w-full">
          {/* Row bands — subtle alternating background instead of dashed lines */}
          {ONCO_DP_ORDER.map((dp, i) => {
            const y = padTop + i * rowH;
            return (
              <g key={`row-${dp}`}>
                {i % 2 === 1 && (
                  <rect
                    x={leftW}
                    y={y}
                    width={chartW}
                    height={rowH}
                    fill="hsl(var(--muted) / 0.35)"
                  />
                )}
                <text
                  x={leftW - 10}
                  y={y + rowH / 2 + 3}
                  textAnchor="end"
                  className="fill-foreground text-[11px]"
                >
                  {ONCO_DP_LABELS[dp] || dp}
                </text>
              </g>
            );
          })}

          {/* Vertical year gridlines — light, only inside plot area */}
          {Array.from({ length: yearRange + 1 }, (_, i) => minYear + i)
            .filter((yr) => (yr - minYear) % yearStep === 0)
            .map((yr) => {
              const x = leftW + ((yr - minYear) / yearRange) * chartW;
              return (
                <line
                  key={`grid-${yr}`}
                  x1={x}
                  y1={padTop}
                  x2={x}
                  y2={padTop + plotH}
                  stroke="hsl(var(--border))"
                  strokeWidth={0.5}
                  opacity={0.5}
                />
              );
            })}

          {/* Plot border (top + bottom) */}
          <line
            x1={leftW}
            y1={padTop}
            x2={leftW + chartW}
            y2={padTop}
            stroke="hsl(var(--border))"
            strokeWidth={1}
          />
          <line
            x1={leftW}
            y1={padTop + plotH}
            x2={leftW + chartW}
            y2={padTop + plotH}
            stroke="hsl(var(--border))"
            strokeWidth={1}
          />

          {/* Year axis — below the plot, outside the data area */}
          {Array.from({ length: yearRange + 1 }, (_, i) => minYear + i)
            .filter((yr) => (yr - minYear) % yearStep === 0)
            .map((yr) => {
              const x = leftW + ((yr - minYear) / yearRange) * chartW;
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
                    y={padTop + plotH + 18}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[10px] font-mono"
                  >
                    {yr}
                  </text>
                </g>
              );
            })}

          {/* Bubbles — sorted largest-first so big ones don't hide small ones */}
          {[...filtered]
            .map((b, originalIdx) => ({ b, originalIdx }))
            .sort((a, b) => radius(b.b.a) - radius(a.b.a))
            .map(({ b, originalIdx }) => {
              const dpIdx = ONCO_DP_ORDER.indexOf(b.dp);
              if (dpIdx === -1) return null;
              const yCenter = padTop + dpIdx * rowH + rowH / 2;
              // Small deterministic jitter to de-overlap dense year/lane bins.
              // Hash on company + date so the same bubble jitters consistently.
              const seed = (b.c.charCodeAt(0) + b.d) % 7;
              const jitter = ((seed - 3) / 3) * (rowH / 4);
              const y = yCenter + jitter;
              const x = leftW + ((b.d - minYear) / yearRange) * chartW;
              const r = radius(b.a);
              const color = ONCO_TUMOR_META[b.tm]?.color ?? 'hsl(var(--muted-foreground))';
              const hasSrc = !!b.src;
              const isHover = hovered === originalIdx;

              return (
                <g
                  key={originalIdx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHovered(originalIdx)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => hasSrc && window.open(b.src, '_blank')}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill={color}
                    fillOpacity={isHover ? 0.55 : 0.32}
                    stroke={color}
                    strokeWidth={hasSrc ? 1.5 : 1}
                    strokeDasharray={hasSrc ? undefined : '3,2'}
                  />
                  {b.a >= 300 && r >= 14 && (
                    <text
                      x={x}
                      y={y + 3}
                      textAnchor="middle"
                      className="fill-foreground text-[9px] font-bold pointer-events-none"
                    >
                      {b.a >= 1000 ? `$${(b.a / 1000).toFixed(1)}B` : `$${b.a}M`}
                    </text>
                  )}
                  {isHover && (
                    <foreignObject
                      x={Math.min(x + r + 6, svgW - 280)}
                      y={Math.max(0, y - 50)}
                      width={272}
                      height={120}
                    >
                      <div className="bg-background border border-border p-2 text-[10px] leading-tight shadow-lg">
                        <div className="font-bold text-foreground">{b.c}</div>
                        <div className="text-primary text-[9px]">{b.p || b.et}</div>
                        <div className="text-muted-foreground mt-0.5">{b.desc}</div>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          <span className="text-[9px] px-1 border border-border bg-secondary">{b.e}</span>
                          <span className="text-[9px] px-1 border border-border bg-secondary">
                            {ONCO_ET_LABELS[b.et] || b.et}
                          </span>
                          {b.a > 0 && (
                            <span className="text-[9px] px-1 border border-primary/30 text-primary">
                              ${b.a}M
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

      {/* Caution alerts — amber/warning tone, not error/destructive */}
      <div className="mb-4">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-foreground mb-3 pb-2 border-b border-border">
          ⚡ Reliability Alerts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ONCO_RELIABILITY.slice(0, 6).map((r, i) => (
            <div
              key={i}
              className="border border-warning/30 bg-warning/5 p-3 flex flex-col"
            >
              <h4 className="text-xs font-semibold text-warning mb-1">{r.c}</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed flex-1">{r.d}</p>
              {/* Only render the link when a real URL exists — empty src is honest */}
              {r.src ? (
                <a
                  href={r.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-1 text-[10px] text-primary hover:underline w-full border-t border-border/40 pt-2"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" /> View source
                </a>
              ) : (
                <div className="mt-2 pt-2 border-t border-border/40 text-[10px] text-muted-foreground/50 italic">
                  No primary source on record
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
