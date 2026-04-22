import { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { PM_EVENTS, PM_TYPE_LABELS, PMEvent } from '@/data/processMining';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const TYPE_OPACITY: Record<string, number> = {
  Funding: 0.8, Acquisition: 0.7, Customer_Case: 0.4, IPO: 1,
  Shutdown: 1, Layoffs: 0.9, Partnership: 0.5, Product_Launch: 0.6,
  Event: 0.35, Strategic_Investment: 0.65,
};

// Log10-based radius so $1M -> ~5px and $10B -> ~23px remain distinguishable.
function blobRadius(a: number): number {
  if (!a || a <= 0) return 3;
  return Math.max(4, Math.min(28, 3 + Math.log10(a + 1) * 5));
}

function formatAmount(a: number): string {
  if (a >= 1000) return `$${(a / 1000).toFixed(1).replace(/\.0$/, '')}B`;
  if (a >= 1) return `$${a}M`;
  return `$${(a * 1000).toFixed(0)}K`;
}

function eventColor(ev: PMEvent): string {
  if (ev.dead || ev.t === 'Shutdown' || ev.t === 'Layoffs') return 'hsl(0 70% 50%)';
  if (ev.t === 'IPO') return 'hsl(var(--primary))';
  return `hsl(var(--foreground) / ${TYPE_OPACITY[ev.t] || 0.5})`;
}

interface FilterBarProps {
  types: string[];
  activeType: string;
  setActiveType: (t: string) => void;
}

function FilterBar({ types, activeType, setActiveType }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-1 mb-4">
      <button
        onClick={() => setActiveType('all')}
        className={cn(
          'px-2 py-1 text-[11px] font-mono border transition-colors',
          activeType === 'all'
            ? 'bg-foreground text-background border-foreground'
            : 'border-border text-muted-foreground hover:text-foreground',
        )}
      >
        All
      </button>
      {types.map((t) => (
        <button
          key={t}
          onClick={() => setActiveType(t)}
          className={cn(
            'px-2 py-1 text-[11px] font-mono border transition-colors flex items-center gap-1',
            activeType === t
              ? 'bg-foreground text-background border-foreground'
              : 'border-border text-muted-foreground hover:text-foreground',
          )}
        >
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{
              background: t === 'Shutdown' || t === 'Layoffs'
                ? 'hsl(0 70% 50%)'
                : `hsl(var(--foreground) / ${TYPE_OPACITY[t] || 0.5})`,
            }}
          />
          {PM_TYPE_LABELS[t] || t}
        </button>
      ))}
    </div>
  );
}

function SizeLegend() {
  const samples: { a: number; label: string }[] = [
    { a: 10, label: '$10M' },
    { a: 100, label: '$100M' },
    { a: 1000, label: '$1B' },
    { a: 10000, label: '$10B' },
  ];
  return (
    <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-mono">
      <span className="uppercase tracking-widest text-[10px]">Size ≈ deal value</span>
      {samples.map((s) => (
        <span key={s.a} className="inline-flex items-center gap-1.5">
          <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden="true">
            <circle cx={12} cy={12} r={blobRadius(s.a)} fill="hsl(var(--foreground) / 0.6)" />
          </svg>
          {s.label}
        </span>
      ))}
    </div>
  );
}

interface MobileListProps {
  events: PMEvent[];
}

function MobileDealList({ events }: MobileListProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const sorted = useMemo(
    () => [...events].sort((a, b) => (a.d < b.d ? 1 : -1)),
    [events],
  );

  return (
    <div className="border border-border divide-y divide-border">
      {sorted.map((ev, i) => {
        const isOpen = openIdx === i;
        return (
          <button
            key={`${ev.d}-${ev.v}-${i}`}
            onClick={() => setOpenIdx(isOpen ? null : i)}
            className="w-full text-left p-3 hover:bg-secondary/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: eventColor(ev) }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-foreground truncate">{ev.v}</span>
                  <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                    {ev.a > 0 ? formatAmount(ev.a) : PM_TYPE_LABELS[ev.t] || ev.t}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {ev.d} · {PM_TYPE_LABELS[ev.t] || ev.t}
                </div>
              </div>
            </div>
            {isOpen && (
              <div className="mt-2 pl-5 text-xs text-foreground/80 space-y-1">
                <div className="font-medium">{ev.h}</div>
                <div className="text-muted-foreground">{ev.x}</div>
                {ev.src && (
                  <a
                    href={ev.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    source
                  </a>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function DealFlowView() {
  const [activeType, setActiveType] = useState<string>('all');
  const [hovered, setHovered] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const types = useMemo(() => [...new Set(PM_EVENTS.map((e) => e.t))], []);
  const years = useMemo(() => {
    return [...new Set(PM_EVENTS.map((e) => e.d.substring(0, 4)))].sort();
  }, []);

  const vendors = useMemo(() => {
    const totals: Record<string, number> = {};
    PM_EVENTS.forEach((e) => {
      totals[e.v] = (totals[e.v] || 0) + e.a;
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]).map(([v]) => v);
  }, []);

  const filtered = activeType === 'all' ? PM_EVENTS : PM_EVENTS.filter((e) => e.t === activeType);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(1200);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerW(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const rowH = 28;
  const leftW = 140;
  const yearW = Math.max(60, (containerW - leftW - 20) / Math.max(years.length, 1));
  const svgW = leftW + years.length * yearW + 20;
  const svgH = vendors.length * rowH + 40;

  if (isMobile) {
    return (
      <div>
        <FilterBar types={types} activeType={activeType} setActiveType={setActiveType} />
        <MobileDealList events={filtered} />
      </div>
    );
  }

  return (
    <div>
      <FilterBar types={types} activeType={activeType} setActiveType={setActiveType} />

      <div ref={containerRef} className="border border-border bg-background">
        <svg width={svgW} height={svgH} className="block w-full">
          {years.map((yr, i) => (
            <g key={yr}>
              <line
                x1={leftW + i * yearW}
                y1={0}
                x2={leftW + i * yearW}
                y2={svgH}
                stroke="hsl(var(--border))"
                strokeWidth={1}
              />
              <text
                x={leftW + i * yearW + yearW / 2}
                y={16}
                textAnchor="middle"
                className="fill-primary"
                fontSize={11}
                fontWeight={700}
              >
                {yr}
              </text>
            </g>
          ))}

          {vendors.map((vendor, vi) => {
            const y = vi * rowH + 30;
            return (
              <g key={vendor}>
                {vi > 0 && (
                  <line
                    x1={0}
                    y1={y - 4}
                    x2={svgW}
                    y2={y - 4}
                    stroke="hsl(var(--border))"
                    strokeWidth={0.5}
                    strokeDasharray="2,4"
                  />
                )}
                <text x={4} y={y + 10} className="fill-muted-foreground" fontSize={9}>
                  {vendor.length > 18 ? vendor.substring(0, 16) + '…' : vendor}
                </text>
              </g>
            );
          })}

          {filtered.map((ev, ei) => {
            const vi = vendors.indexOf(ev.v);
            if (vi === -1) return null;
            const y = vi * rowH + 36;

            const yr = ev.d.substring(0, 4);
            const mo = parseInt(ev.d.substring(5) || '6', 10);
            const yi = years.indexOf(yr);
            if (yi === -1) return null;
            const x = leftW + yi * yearW + (mo / 12) * yearW;

            const r = blobRadius(ev.a);
            const fill = eventColor(ev);

            const tooltipAnchor = x + r + 4;
            const tooltipW = 260;
            const tooltipX =
              tooltipAnchor + tooltipW > svgW ? x - r - tooltipW - 4 : tooltipAnchor;
            const tooltipY = Math.max(0, y - 30);

            return (
              <g
                key={ei}
                onMouseEnter={() => setHovered(ei)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer"
              >
                <circle cx={x} cy={y} r={r} fill={fill} opacity={hovered === ei ? 1 : 0.8} />
                {ev.a > 20 && (
                  <text
                    x={x}
                    y={y + 3}
                    textAnchor="middle"
                    className="fill-background pointer-events-none"
                    fontSize={Math.max(6, r - 4)}
                    fontWeight={700}
                  >
                    {formatAmount(ev.a)}
                  </text>
                )}
                {hovered === ei && (
                  <foreignObject x={tooltipX} y={tooltipY} width={tooltipW} height={90}>
                    <div className="bg-background border border-border p-2 text-[10px] leading-tight shadow-lg">
                      <div className="font-bold text-foreground">{ev.v}</div>
                      <div className="text-muted-foreground">
                        {ev.d} · {PM_TYPE_LABELS[ev.t]}
                      </div>
                      <div className="text-foreground font-medium">{ev.h}</div>
                      <div className="text-muted-foreground">{ev.x}</div>
                      {ev.src && (
                        <a
                          href={ev.src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-1 text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          source
                        </a>
                      )}
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3">
        <SizeLegend />
      </div>
    </div>
  );
}
