import { useState, useMemo, useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import {
  AXIS_ORDER,
  AXIS_LABELS,
  OUTCOME_COLORS,
  OUTCOME_LABELS,
  type FounderCase,
  type DecisionScore,
} from '@/data/usFounderMatrix';
import { cn } from '@/lib/utils';

interface Props {
  cases: FounderCase[];
  highlightId?: string | null;
  onHover?: (id: string | null) => void;
  height?: number;
}

const TWO_PI = Math.PI * 2;

function polarPoint(cx: number, cy: number, r: number, angle: number): [number, number] {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

function polygonPoints(
  cx: number,
  cy: number,
  r: number,
  scores: DecisionScore,
  startAngle: number,
): string {
  return AXIS_ORDER.map((axis, i) => {
    const angle = startAngle + (i / AXIS_ORDER.length) * TWO_PI;
    const v = Math.max(0, Math.min(1, scores[axis] ?? 0));
    const [x, y] = polarPoint(cx, cy, r * v, angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

export function RadarChart({ cases, highlightId, onHover, height = 520 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(640);
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) setW(Math.max(360, entry.contentRect.width));
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const cx = w / 2;
  const cy = height / 2;
  const r = Math.min(w, height) * 0.36;
  const startAngle = -Math.PI / 2; // first spoke (FDA) points up

  const rings = [0.33, 0.66, 1.0];

  const axisEnds = useMemo(
    () =>
      AXIS_ORDER.map((axis, i) => {
        const angle = startAngle + (i / AXIS_ORDER.length) * TWO_PI;
        const [x, y] = polarPoint(cx, cy, r, angle);
        const [lx, ly] = polarPoint(cx, cy, r + 22, angle);
        return { axis, x, y, lx, ly, angle };
      }),
    [cx, cy, r, startAngle],
  );

  const [internalHover, setInternalHover] = useState<string | null>(null);
  const activeId = highlightId ?? internalHover;

  return (
    <div ref={containerRef} className="w-full">
      <svg
        width={w}
        height={height}
        className="block w-full"
        role="img"
        aria-label="Founder's Decision Matrix — 7-axis radar of healthcare AI startup cases"
      >
        {/* Reference rings */}
        {rings.map((rr, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r * rr}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={0.6}
            strokeDasharray={i === rings.length - 1 ? undefined : '2,3'}
          />
        ))}

        {/* Spokes */}
        {axisEnds.map(({ axis, x, y }) => (
          <line
            key={axis}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="hsl(var(--border))"
            strokeWidth={0.6}
          />
        ))}

        {/* Axis labels */}
        {axisEnds.map(({ axis, lx, ly, angle }) => {
          // anchor labels by quadrant for readability
          const cosA = Math.cos(angle);
          const anchor: 'start' | 'middle' | 'end' =
            Math.abs(cosA) < 0.2 ? 'middle' : cosA > 0 ? 'start' : 'end';
          return (
            <text
              key={axis}
              x={lx}
              y={ly + 4}
              textAnchor={anchor}
              className="fill-foreground text-[11px] font-mono font-semibold uppercase tracking-widest"
            >
              {AXIS_LABELS[axis]}
            </text>
          );
        })}

        {/* Polygons — non-active first (lower opacity), active last (on top) */}
        {cases
          .filter((c) => c.id !== activeId)
          .map((c) => {
            const color = OUTCOME_COLORS[c.outcome];
            const isDimmed = activeId !== null;
            const isFraud = c.outcome === 'fraud';
            return (
              <polygon
                key={c.id}
                points={polygonPoints(cx, cy, r, c.scores, startAngle)}
                fill={color}
                fillOpacity={isDimmed ? 0.03 : 0.06}
                stroke={color}
                strokeWidth={1.2}
                strokeOpacity={isDimmed ? 0.22 : 0.55}
                strokeDasharray={isFraud ? '4,3' : undefined}
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => {
                  setInternalHover(c.id);
                  onHover?.(c.id);
                }}
                onMouseLeave={() => {
                  setInternalHover(null);
                  onHover?.(null);
                }}
              />
            );
          })}

        {/* Active polygon on top */}
        {activeId &&
          (() => {
            const c = cases.find((x) => x.id === activeId);
            if (!c) return null;
            const color = OUTCOME_COLORS[c.outcome];
            const isFraud = c.outcome === 'fraud';
            return (
              <g>
                <polygon
                  points={polygonPoints(cx, cy, r, c.scores, startAngle)}
                  fill={color}
                  fillOpacity={0.18}
                  stroke={color}
                  strokeWidth={2.2}
                  strokeOpacity={1}
                  strokeDasharray={isFraud ? '5,3' : undefined}
                  className="cursor-pointer"
                  onMouseEnter={() => {
                    setInternalHover(c.id);
                    onHover?.(c.id);
                  }}
                  onMouseLeave={() => {
                    setInternalHover(null);
                    onHover?.(null);
                  }}
                />
                {/* score dots at each axis */}
                {AXIS_ORDER.map((axis, i) => {
                  const angle = startAngle + (i / AXIS_ORDER.length) * TWO_PI;
                  const v = Math.max(0, Math.min(1, c.scores[axis] ?? 0));
                  const [px, py] = polarPoint(cx, cy, r * v, angle);
                  return (
                    <circle
                      key={axis}
                      cx={px}
                      cy={py}
                      r={3.5}
                      fill={color}
                      stroke="hsl(var(--background))"
                      strokeWidth={1}
                    />
                  );
                })}
              </g>
            );
          })()}
      </svg>

      {/* Active case detail panel */}
      {activeId &&
        (() => {
          const c = cases.find((x) => x.id === activeId);
          if (!c) return null;
          const color = OUTCOME_COLORS[c.outcome];
          return (
            <div
              className="border bg-background p-4 mt-4 transition-opacity"
              style={{ borderColor: color }}
            >
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <div>
                  <div className="text-sm font-semibold text-foreground">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground">{c.niche}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border"
                    style={{ color, borderColor: color }}
                  >
                    {OUTCOME_LABELS[c.outcome]}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {c.outcomeDate}
                  </span>
                </div>
              </div>

              <p className="text-xs text-foreground/85 leading-relaxed mb-2">{c.oneLiner}</p>

              {c.cmsPathway && (
                <p className="text-[11px] text-muted-foreground mb-1">
                  <span className="font-mono uppercase tracking-widest text-[9px]">CMS pathway: </span>
                  <span
                    className="font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 border ml-1"
                    style={{
                      borderColor:
                        c.cmsPathway === 'NCD-CED'
                          ? 'hsl(0 65% 50%)'
                          : c.cmsPathway === 'none' || c.cmsPathway === 'n/a'
                          ? 'hsl(var(--muted-foreground))'
                          : 'hsl(155 60% 38%)',
                      color:
                        c.cmsPathway === 'NCD-CED'
                          ? 'hsl(0 65% 50%)'
                          : c.cmsPathway === 'none' || c.cmsPathway === 'n/a'
                          ? 'hsl(var(--muted-foreground))'
                          : 'hsl(155 60% 38%)',
                    }}
                  >
                    {c.cmsPathway}
                  </span>
                </p>
              )}

              {c.policyAnchor && (
                <p className="text-[11px] text-muted-foreground mb-2">
                  <span className="font-mono uppercase tracking-widest text-[9px]">Policy anchor: </span>
                  {c.policyAnchor}
                </p>
              )}

              <a
                href={c.src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
              >
                <ExternalLink className="h-3 w-3" />
                Primary source
              </a>
            </div>
          );
        })()}

      {/* Hover hint when nothing active */}
      {!activeId && (
        <p className={cn('text-[11px] text-muted-foreground italic mt-3 text-center')}>
          Hover any polygon to see the case detail.
        </p>
      )}
    </div>
  );
}
