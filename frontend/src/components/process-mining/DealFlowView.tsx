import { useState, useMemo } from 'react';
import { PM_EVENTS, PM_TYPE_LABELS } from '@/data/processMining';
import { cn } from '@/lib/utils';

const TYPE_OPACITY: Record<string, number> = {
  Funding: 0.8, Acquisition: 0.7, Customer_Case: 0.4, IPO: 1,
  Shutdown: 1, Layoffs: 0.9, Partnership: 0.5, Product_Launch: 0.6,
  Event: 0.35, Strategic_Investment: 0.65,
};

export function DealFlowView() {
  const [activeType, setActiveType] = useState<string>('all');
  const [hovered, setHovered] = useState<number | null>(null);

  const types = useMemo(() => [...new Set(PM_EVENTS.map(e => e.t))], []);
  const years = useMemo(() => {
    const ys = [...new Set(PM_EVENTS.map(e => e.d.substring(0, 4)))].sort();
    return ys;
  }, []);

  const vendors = useMemo(() => {
    const totals: Record<string, number> = {};
    PM_EVENTS.forEach(e => { totals[e.v] = (totals[e.v] || 0) + e.a; });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]).map(([v]) => v);
  }, []);

  const filtered = activeType === 'all' ? PM_EVENTS : PM_EVENTS.filter(e => e.t === activeType);

  // SVG dimensions
  const rowH = 28;
  const leftW = 140;
  const yearW = 90;
  const svgW = leftW + years.length * yearW + 20;
  const svgH = vendors.length * rowH + 40;

  return (
    <div>
      {/* Legend/filter */}
      <div className="flex flex-wrap gap-1 mb-4">
        <button
          onClick={() => setActiveType('all')}
          className={cn(
            'px-2 py-1 text-[11px] font-mono border transition-colors',
            activeType === 'all'
              ? 'bg-foreground text-background border-foreground'
              : 'border-border text-muted-foreground hover:text-foreground'
          )}
        >
          All
        </button>
        {types.map(t => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={cn(
              'px-2 py-1 text-[11px] font-mono border transition-colors flex items-center gap-1',
              activeType === t
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{
                background: t === 'Shutdown' || t === 'Layoffs'
                  ? 'hsl(0 70% 50%)'
                  : `hsl(var(--foreground) / ${TYPE_OPACITY[t] || 0.5})`
              }}
            />
            {PM_TYPE_LABELS[t] || t}
          </button>
        ))}
      </div>

      {/* SVG Chart */}
      <div className="overflow-x-auto border border-border">
        <svg width={svgW} height={svgH} className="block min-w-[900px]">
          {/* Year columns */}
          {years.map((yr, i) => (
            <g key={yr}>
              <line
                x1={leftW + i * yearW} y1={0}
                x2={leftW + i * yearW} y2={svgH}
                stroke="hsl(var(--border))" strokeWidth={1}
              />
              <text
                x={leftW + i * yearW + yearW / 2} y={16}
                textAnchor="middle" className="fill-primary text-[11px] font-bold"
              >
                {yr}
              </text>
            </g>
          ))}

          {/* Vendor rows */}
          {vendors.map((vendor, vi) => {
            const y = vi * rowH + 30;
            return (
              <g key={vendor}>
                {vi > 0 && (
                  <line
                    x1={0} y1={y - 4} x2={svgW} y2={y - 4}
                    stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="2,4"
                  />
                )}
                <text
                  x={4} y={y + 10}
                  className="fill-muted-foreground text-[9px]"
                >
                  {vendor.length > 18 ? vendor.substring(0, 16) + '…' : vendor}
                </text>
              </g>
            );
          })}

          {/* Bubbles */}
          {filtered.map((ev, ei) => {
            const vi = vendors.indexOf(ev.v);
            if (vi === -1) return null;
            const y = vi * rowH + 36;

            const yr = ev.d.substring(0, 4);
            const mo = parseInt(ev.d.substring(5) || '6', 10);
            const yi = years.indexOf(yr);
            if (yi === -1) return null;
            const x = leftW + yi * yearW + (mo / 12) * yearW;

            const r = ev.a > 0 ? Math.max(4, Math.min(20, Math.sqrt(ev.a) * 1.5)) : 3;

            const isDead = ev.dead || ev.t === 'Shutdown' || ev.t === 'Layoffs';
            const fill = isDead
              ? 'hsl(0 70% 50%)'
              : ev.t === 'IPO'
                ? 'hsl(var(--primary))'
                : `hsl(var(--foreground) / ${TYPE_OPACITY[ev.t] || 0.5})`;

            return (
              <g
                key={ei}
                onMouseEnter={() => setHovered(ei)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer"
              >
                <circle cx={x} cy={y} r={r} fill={fill} opacity={hovered === ei ? 1 : 0.8} />
                {ev.a > 50 && (
                  <text
                    x={x} y={y + 3}
                    textAnchor="middle"
                    className="fill-background text-[6px] font-bold pointer-events-none"
                  >
                    {ev.a >= 1000 ? `$${(ev.a / 1000).toFixed(0)}B` : `$${ev.a}M`}
                  </text>
                )}
                {hovered === ei && (
                  <foreignObject x={x + r + 4} y={y - 30} width={260} height={80}>
                    <div className="bg-background border border-border p-2 text-[10px] leading-tight shadow-lg">
                      <div className="font-bold text-foreground">{ev.v}</div>
                      <div className="text-muted-foreground">{ev.d} · {PM_TYPE_LABELS[ev.t]}</div>
                      <div className="text-foreground font-medium">{ev.h}</div>
                      <div className="text-muted-foreground">{ev.x}</div>
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
