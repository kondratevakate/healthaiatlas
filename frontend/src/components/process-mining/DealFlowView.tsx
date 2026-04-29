import { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { PM_EVENTS, PM_TYPE_COLORS, PM_TYPE_LABELS, PMEvent } from '@/data/processMining';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

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
  if (ev.dead) return 'hsl(0 70% 50%)';
  return PM_TYPE_COLORS[ev.t] ?? 'hsl(var(--foreground) / 0.5)';
}

interface FilterBarProps {
  types: string[];
  activeTypes: Set<string>;
  toggleType: (t: string) => void;
  resetFilters: () => void;
  filtersActive: boolean;
}

function FilterBar({ types, activeTypes, toggleType, resetFilters, filtersActive }: FilterBarProps) {
  const allActive = activeTypes.size === 0;
  return (
    <div className="space-y-1.5 mb-4">
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
          Event-type filters · click to toggle
        </div>
        {filtersActive && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        <button
          onClick={resetFilters}
          className={cn(
            'px-2 py-1 text-[11px] font-mono border transition-colors',
            allActive
              ? 'bg-foreground text-background border-foreground'
              : 'border-border text-muted-foreground hover:text-foreground',
          )}
        >
          All
        </button>
        {types.map((t) => {
          const active = activeTypes.has(t);
          return (
            <button
              key={t}
              onClick={() => toggleType(t)}
              className={cn(
                'px-2 py-1 text-[11px] font-mono border transition-colors flex items-center gap-1.5',
                active
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ background: PM_TYPE_COLORS[t] ?? 'hsl(var(--foreground) / 0.5)' }}
              />
              {PM_TYPE_LABELS[t] ?? t}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CombinedLegend() {
  const sizes: { a: number; label: string }[] = [
    { a: 10, label: '$10M' },
    { a: 100, label: '$100M' },
    { a: 1000, label: '$1B' },
    { a: 10000, label: '$10B' },
  ];
  return (
    <div className="grid sm:grid-cols-[1fr_auto] gap-3 text-[11px] text-muted-foreground font-mono pt-2 border-t border-border mt-3">
      <div>
        <div className="uppercase tracking-widest text-[10px] mb-1.5">Event type → colour</div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {Object.entries(PM_TYPE_LABELS).map(([t, label]) => (
            <span key={t} className="inline-flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: PM_TYPE_COLORS[t] ?? 'hsl(var(--foreground) / 0.5)' }}
              />
              {label}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'hsl(0 70% 50%)' }} />
            Dead / shutdown
          </span>
        </div>
      </div>
      <div>
        <div className="uppercase tracking-widest text-[10px] mb-1.5">Bubble size = deal value</div>
        <div className="flex items-center gap-3">
          {sizes.map((s) => (
            <span key={s.a} className="inline-flex items-center gap-1">
              <svg width={20} height={20} viewBox="0 0 20 20" aria-hidden="true">
                <circle cx={10} cy={10} r={blobRadius(s.a)} fill="hsl(var(--foreground) / 0.6)" />
              </svg>
              {s.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface MobileListProps {
  events: PMEvent[];
  onSelect: (ev: PMEvent) => void;
}

function MobileDealList({ events, onSelect }: MobileListProps) {
  const sorted = useMemo(() => [...events].sort((a, b) => (a.d < b.d ? 1 : -1)), [events]);
  return (
    <div className="border border-border divide-y divide-border">
      {sorted.map((ev, i) => (
        <button
          key={`${ev.d}-${ev.v}-${i}`}
          onClick={() => onSelect(ev)}
          className="w-full text-left p-3 hover:bg-secondary/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: eventColor(ev) }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-foreground truncate">{ev.v}</span>
                <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                  {ev.a > 0 ? formatAmount(ev.a) : PM_TYPE_LABELS[ev.t] ?? ev.t}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                {ev.d} · {PM_TYPE_LABELS[ev.t] ?? ev.t}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

interface DealDetailProps {
  ev: PMEvent;
  allCompanyEvents: PMEvent[];
  onSelectOther: (ev: PMEvent) => void;
}

function DealDetail({ ev, allCompanyEvents, onSelectOther }: DealDetailProps) {
  const sorted = [...allCompanyEvents].sort((a, b) => (a.d < b.d ? 1 : -1));
  const totalFunding = allCompanyEvents
    .filter((e) => e.t === 'Funding' && e.a > 0)
    .reduce((s, e) => s + e.a, 0);

  return (
    <>
      <SheetHeader className="text-left mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-3 h-3 rounded-full" style={{ background: eventColor(ev) }} />
          <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
            {PM_TYPE_LABELS[ev.t] ?? ev.t}
          </span>
        </div>
        <SheetTitle className="text-xl font-semibold">{ev.v}</SheetTitle>
        <SheetDescription className="text-sm text-muted-foreground">
          {ev.h}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
              Date
            </div>
            <div className="text-foreground">{ev.d}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
              Deal value
            </div>
            <div className="text-foreground">
              {ev.a > 0 ? formatAmount(ev.a) : 'Not disclosed / N/A'}
            </div>
          </div>
          {totalFunding > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                Total funding (this company)
              </div>
              <div className="text-foreground">{formatAmount(totalFunding)}</div>
            </div>
          )}
          <div>
            <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
              Status
            </div>
            <div className={ev.dead ? 'text-destructive' : 'text-foreground'}>
              {ev.dead ? 'Dead / shutdown' : 'Active'}
            </div>
          </div>
        </div>

        {ev.x && (
          <div>
            <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1">
              Detail
            </div>
            <p className="text-sm text-foreground/90">{ev.x}</p>
          </div>
        )}

        {ev.src && (
          <a
            href={ev.src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Source
          </a>
        )}

        {sorted.length > 1 && (
          <div className="border-t border-border pt-4">
            <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-2">
              All events for {ev.v} ({sorted.length})
            </div>
            <div className="space-y-1">
              {sorted.map((other, i) => {
                const isCurrent = other === ev;
                return (
                  <button
                    key={`${other.d}-${i}`}
                    onClick={() => !isCurrent && onSelectOther(other)}
                    disabled={isCurrent}
                    className={cn(
                      'w-full text-left flex items-center gap-2 p-2 border text-xs transition-colors',
                      isCurrent
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border hover:border-foreground/40 hover:bg-secondary/30',
                    )}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: eventColor(other) }}
                    />
                    <span className="text-muted-foreground font-mono shrink-0 w-16">{other.d}</span>
                    <span className="text-foreground/90 truncate flex-1">{other.h}</span>
                    {other.a > 0 && (
                      <span className="font-mono text-muted-foreground shrink-0">
                        {formatAmount(other.a)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function DealFlowView() {
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set());
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<PMEvent | null>(null);
  const isMobile = useIsMobile();

  const types = useMemo(() => [...new Set(PM_EVENTS.map((e) => e.t))], []);
  const years = useMemo(
    () => [...new Set(PM_EVENTS.map((e) => e.d.substring(0, 4)))].sort(),
    [],
  );

  // Y-axis vendors: sorted by total funding desc (largest first).
  const vendors = useMemo(() => {
    const totals: Record<string, number> = {};
    PM_EVENTS.forEach((e) => {
      totals[e.v] = (totals[e.v] ?? 0) + e.a;
    });
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([v]) => v);
  }, []);

  const matchesTypeFilter = (t: string) => activeTypes.size === 0 || activeTypes.has(t);

  const filtered = useMemo(
    () => PM_EVENTS.filter((e) => matchesTypeFilter(e.t)),
    [activeTypes],
  );

  const visibleVendors = useMemo(
    () => vendors.filter((v) => filtered.some((e) => e.v === v)),
    [vendors, filtered],
  );

  // Pre-compute a vertical-offset index for each event so bubbles stacked
  // on the same (vendor, year) cell don't fully overlap. Within each bucket
  // we sort by month then by amount desc so larger deals end up at the
  // visual centre, smaller ones jitter outwards.
  const eventOffset = useMemo(() => {
    const offset = new Map<PMEvent, number>();
    const buckets = new Map<string, PMEvent[]>();
    filtered.forEach((ev) => {
      const yr = ev.d.substring(0, 4);
      const key = `${ev.v}|${yr}`;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(ev);
    });
    buckets.forEach((arr) => {
      const sorted = arr
        .slice()
        .sort((a, b) => {
          const ma = parseInt(a.d.substring(5) ?? '6', 10);
          const mb = parseInt(b.d.substring(5) ?? '6', 10);
          if (ma !== mb) return ma - mb;
          return b.a - a.a;
        });
      // Centre the largest one, alternate the rest above and below.
      const n = sorted.length;
      sorted.forEach((ev, i) => {
        if (n === 1) {
          offset.set(ev, 0);
          return;
        }
        const dir = i % 2 === 0 ? 1 : -1;
        const step = Math.ceil((i + 1) / 2);
        offset.set(ev, dir * step * 5);
      });
    });
    return offset;
  }, [filtered]);

  const filtersActive = activeTypes.size > 0;

  const toggleType = (t: string) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const resetFilters = () => {
    setActiveTypes(new Set());
  };

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
  const svgH = visibleVendors.length * rowH + 40;

  // ── Toolbar (event count + filter) ──
  const Toolbar = (
    <div className="space-y-3">
      <div className="text-[11px] text-muted-foreground font-mono">
        {filtered.length} of {PM_EVENTS.length} events · {visibleVendors.length} companies
      </div>
      <FilterBar
        types={types}
        activeTypes={activeTypes}
        toggleType={toggleType}
        resetFilters={resetFilters}
        filtersActive={filtersActive}
      />
    </div>
  );

  if (isMobile) {
    return (
      <div>
        {Toolbar}
        {filtered.length > 0 ? (
          <MobileDealList events={filtered} onSelect={setSelected} />
        ) : (
          <EmptyState onReset={resetFilters} />
        )}
        <CombinedLegend />
        <DetailSheet selected={selected} setSelected={setSelected} />
      </div>
    );
  }

  return (
    <div>
      {Toolbar}

      <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1.5">
        Y-axis: companies sorted by total funding (largest first) · click any bubble for details
      </div>

      <div ref={containerRef} className="border border-border bg-background overflow-x-auto">
        {visibleVendors.length === 0 ? (
          <EmptyState onReset={resetFilters} />
        ) : (
          <svg width={svgW} height={svgH} className="block">
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

            {visibleVendors.map((vendor, vi) => {
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
              const vi = visibleVendors.indexOf(ev.v);
              if (vi === -1) return null;
              const yJitter = eventOffset.get(ev) ?? 0;
              const y = vi * rowH + 36 + yJitter;

              const yr = ev.d.substring(0, 4);
              const mo = parseInt(ev.d.substring(5) ?? '6', 10);
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
                  onClick={() => setSelected(ev)}
                  className="cursor-pointer"
                >
                  <circle cx={x} cy={y} r={r} fill={fill} opacity={hovered === ei ? 1 : 0.85} />
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
                          {ev.d} · {PM_TYPE_LABELS[ev.t] ?? ev.t}
                          {ev.a > 0 && ` · ${formatAmount(ev.a)}`}
                        </div>
                        <div className="text-foreground font-medium line-clamp-2">{ev.h}</div>
                        <div className="text-muted-foreground text-[9px] mt-0.5">
                          Click for full details
                        </div>
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>

      <CombinedLegend />

      <DetailSheet selected={selected} setSelected={setSelected} />
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground space-y-2">
      <div>No events match the current filters.</div>
      <Button variant="outline" size="sm" onClick={onReset}>
        Clear filters
      </Button>
    </div>
  );
}

function DetailSheet({
  selected,
  setSelected,
}: {
  selected: PMEvent | null;
  setSelected: (e: PMEvent | null) => void;
}) {
  const companyEvents = useMemo(() => {
    if (!selected) return [];
    return PM_EVENTS.filter((e) => e.v === selected.v);
  }, [selected]);

  return (
    <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {selected && (
          <DealDetail
            ev={selected}
            allCompanyEvents={companyEvents}
            onSelectOther={(ev) => setSelected(ev)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
