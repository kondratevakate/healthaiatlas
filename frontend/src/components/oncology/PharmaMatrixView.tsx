import { useState, useMemo } from 'react';
import {
  ONCO_PHARMA, ONCO_PHARMA_COS, ONCO_BV_ORDER, ONCO_BV_LABELS,
  ONCO_BV_GROUPS, ONCO_GRP_COLORS, ONCO_OPP_COLS,
} from '@/data/oncology';
import { cn } from '@/lib/utils';
import { ExternalLink, X, Info } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { LAST_UPDATED } from '@/data/constants';
import { useIsMobile } from '@/hooks/use-mobile';

interface PharmaCellItem {
  v: string; // vendor
  p: string; // product
  d: string; // description
  src?: string;
}

const VENDOR_OPACITIES = [0.9, 0.75, 0.6, 0.45, 0.8, 0.65, 0.55, 0.7, 0.5, 0.85];
const vendorColorMap: Record<string, number> = {};
let vIdx = 0;
function getVendorOpacity(v: string): number {
  const key = v.split(' ')[0];
  if (!(key in vendorColorMap)) {
    vendorColorMap[key] = VENDOR_OPACITIES[vIdx % VENDOR_OPACITIES.length];
    vIdx++;
  }
  return vendorColorMap[key];
}

// All distinct categories in display order.
const CATEGORIES = Array.from(new Set(ONCO_BV_ORDER.map((b) => ONCO_BV_GROUPS[b])));

export function PharmaMatrixView() {
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const [onlyGaps, setOnlyGaps] = useState(false);
  const isMobile = useIsMobile();
  const [hoveredChip, setHoveredChip] = useState<{
    v: string; p: string; d: string; src?: string; x: number; y: number;
  } | null>(null);
  const [cellSelection, setCellSelection] = useState<{
    co: string; bv: string; items: PharmaCellItem[]; isGap: boolean;
  } | null>(null);
  const [vendorSelection, setVendorSelection] = useState<string | null>(null);

  // Visible columns after category filter.
  const visibleBv = useMemo(() => {
    if (activeCategories.size === 0) return ONCO_BV_ORDER;
    return ONCO_BV_ORDER.filter((b) => activeCategories.has(ONCO_BV_GROUPS[b]));
  }, [activeCategories]);

  // Group headers built only from visible columns.
  const groups = useMemo(() => {
    const result: { name: string; span: number }[] = [];
    let prev = '';
    visibleBv.forEach((b) => {
      const g = ONCO_BV_GROUPS[b];
      if (g !== prev) {
        result.push({ name: g, span: 1 });
        prev = g;
      } else {
        result[result.length - 1].span++;
      }
    });
    return result;
  }, [visibleBv]);

  const filteredCos = useMemo(() => {
    return ONCO_PHARMA_COS.filter((co) => {
      // "Show only gaps" filter — pharma must have at least one empty opportunity cell
      if (onlyGaps) {
        const hasGap = visibleBv.some((bv) => {
          const items = (ONCO_PHARMA[`${co}|${bv}`] ?? []) as PharmaCellItem[];
          return ONCO_OPP_COLS.includes(bv) && items.length === 0;
        });
        if (!hasGap) return false;
      }
      return true;
    });
  }, [visibleBv, onlyGaps]);

  // Aggregate vendor → which pharmas use them, and across how many use cases.
  const vendorPenetration = useMemo(() => {
    const map = new Map<string, { pharmas: Set<string>; useCases: Set<string>; totalMentions: number }>();
    ONCO_PHARMA_COS.forEach((co) => {
      ONCO_BV_ORDER.forEach((bv) => {
        const items = (ONCO_PHARMA[`${co}|${bv}`] ?? []) as PharmaCellItem[];
        items.forEach((it) => {
          const key = it.v;
          if (!map.has(key)) {
            map.set(key, { pharmas: new Set(), useCases: new Set(), totalMentions: 0 });
          }
          const e = map.get(key)!;
          e.pharmas.add(co);
          e.useCases.add(bv);
          e.totalMentions++;
        });
      });
    });
    return Array.from(map.entries())
      .map(([v, e]) => ({
        v,
        pharmaCount: e.pharmas.size,
        useCaseCount: e.useCases.size,
        totalMentions: e.totalMentions,
        pharmas: Array.from(e.pharmas),
      }))
      .sort((a, b) => b.pharmaCount - a.pharmaCount || b.totalMentions - a.totalMentions);
  }, []);

  const totalPharmas = ONCO_PHARMA_COS.length;
  const filtersActive = activeCategories.size > 0 || onlyGaps;

  const toggleCategory = (g: string) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  };

  const resetFilters = () => {
    setActiveCategories(new Set());
    setOnlyGaps(false);
  };

  // For a given (pharma × use case) cell, find candidate vendors that already
  // serve the same use case at OTHER pharmas — useful for "fill the gap" prompts.
  const suggestForGap = (bv: string, excludeCo: string): { vendor: string; otherPharmas: string[] }[] => {
    const result = new Map<string, Set<string>>();
    ONCO_PHARMA_COS.forEach((co) => {
      if (co === excludeCo) return;
      const items = (ONCO_PHARMA[`${co}|${bv}`] ?? []) as PharmaCellItem[];
      items.forEach((it) => {
        if (!result.has(it.v)) result.set(it.v, new Set());
        result.get(it.v)!.add(co);
      });
    });
    return Array.from(result.entries())
      .map(([vendor, pharmas]) => ({ vendor, otherPharmas: Array.from(pharmas) }))
      .sort((a, b) => b.otherPharmas.length - a.otherPharmas.length);
  };

  return (
    <div>
      {/* ── Toolbar: category filter + only-gaps + last updated ── */}
      <div className="space-y-3 mb-4">
        <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-3 flex-wrap">
          <span>{filteredCos.length} of {totalPharmas} pharmas</span>
          <span className="opacity-60">·</span>
          <span title="Last data refresh">Updated {LAST_UPDATED.oncology ?? '—'}</span>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
            Category filter:
          </span>
          {CATEGORIES.map((g) => {
            const active = activeCategories.has(g);
            const color = ONCO_GRP_COLORS[g];
            return (
              <button
                key={g}
                onClick={() => toggleCategory(g)}
                className={cn(
                  'px-2 py-1 text-[11px] font-mono border transition-colors flex items-center gap-1.5',
                  active
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                {g}
              </button>
            );
          })}
          <span className="opacity-30 mx-1">|</span>
          <label className="inline-flex items-center gap-1.5 text-[11px] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyGaps}
              onChange={(e) => setOnlyGaps(e.target.checked)}
              className="accent-primary"
            />
            <span className="text-muted-foreground">Show only pharmas with market gaps</span>
          </label>
          {filtersActive && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto text-[11px] text-primary hover:underline inline-flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-3 mb-3 items-center text-xs">
        {Object.entries(ONCO_GRP_COLORS).map(([g, c]) => (
          <div key={g} className="flex items-center gap-1.5 font-semibold" style={{ color: c }}>
            <span className="w-4 h-1 rounded-sm" style={{ background: c }} />
            {g}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground ml-3">
          <span
            className="w-3.5 h-3.5 inline-block border border-dashed border-muted-foreground/30"
            style={{
              background:
                'repeating-linear-gradient(45deg, transparent, transparent 3px, hsl(var(--foreground) / 0.04) 3px, hsl(var(--foreground) / 0.04) 6px)',
            }}
          />
          Market gap (no AI vendor yet)
          <span className="text-muted-foreground/70 ml-1" title="Empty cells in opportunity columns mean no AI vendor was found for this pharma × use case — useful as an investment / partnership signal.">
            <Info className="h-3 w-3 inline-block" />
          </span>
        </div>
      </div>

      {/* ── Matrix (desktop) / Card list (mobile) ── */}
      {isMobile ? (
        <PharmaCardList
          pharmas={filteredCos}
          visibleBv={visibleBv}
          onCellClick={(co, bv, items, isGap) => setCellSelection({ co, bv, items, isGap })}
          onVendorClick={setVendorSelection}
        />
      ) : (
      <div className="overflow-x-auto">
        <table className="border-collapse w-full">
          <thead>
            <tr>
              <td className="p-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-background sticky left-0 z-10" />
              {groups.map((g, i) => (
                <td
                  key={i}
                  colSpan={g.span}
                  className="p-1.5 text-center text-[10px] font-bold uppercase tracking-wider bg-background"
                  style={{
                    color: ONCO_GRP_COLORS[g.name] ?? 'hsl(var(--foreground))',
                    borderBottom: `2px solid ${ONCO_GRP_COLORS[g.name] ?? 'hsl(var(--border))'}`,
                  }}
                >
                  {g.name}
                </td>
              ))}
            </tr>
            <tr>
              <th className="text-left text-xs font-bold p-1.5 text-foreground bg-background sticky left-0 z-10 min-w-[100px]">Pharma</th>
              {visibleBv.map((bv) => (
                <th
                  key={bv}
                  className="text-center text-[10px] font-medium text-muted-foreground p-1 max-w-[80px] break-words"
                >
                  {ONCO_BV_LABELS[bv] ?? bv}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCos.map((co) => {
              const isAmgen = co === 'Amgen';
              return (
                <tr key={co} className={isAmgen ? 'border-b-2 border-primary' : ''}>
                  <th
                    className={cn(
                      'text-left text-xs font-bold p-1.5 bg-background sticky left-0 z-10',
                      isAmgen ? 'text-primary' : 'text-foreground',
                    )}
                  >
                    {co}
                  </th>
                  {visibleBv.map((bv) => {
                    const key = `${co}|${bv}`;
                    const items = (ONCO_PHARMA[key] ?? []) as PharmaCellItem[];
                    const isOpp = ONCO_OPP_COLS.includes(bv);

                    if (!items.length) {
                      return (
                        <td
                          key={bv}
                          onClick={() =>
                            isOpp && setCellSelection({ co, bv, items: [], isGap: true })
                          }
                          className={cn(
                            'p-1 border border-border/50',
                            isOpp
                              ? 'border-dashed border-muted-foreground/20 cursor-pointer hover:border-primary/40'
                              : 'bg-secondary/30',
                          )}
                          style={
                            isOpp
                              ? {
                                  background:
                                    'repeating-linear-gradient(45deg, transparent, transparent 3px, hsl(var(--foreground) / 0.02) 3px, hsl(var(--foreground) / 0.02) 6px)',
                                }
                              : undefined
                          }
                          title={isOpp ? 'Market gap — click to see candidate vendors' : undefined}
                        />
                      );
                    }

                    return (
                      <td
                        key={bv}
                        className="p-1 border border-border/50 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => setCellSelection({ co, bv, items, isGap: false })}
                      >
                        <div className="flex flex-wrap gap-0.5">
                          {items.map((it, idx) => {
                            const op = getVendorOpacity(it.v);
                            return (
                              <span
                                key={idx}
                                className="text-[10px] font-semibold px-1.5 py-0.5 cursor-pointer border border-foreground/10 hover:border-primary/40 transition-colors leading-tight"
                                style={{
                                  background: `hsl(var(--foreground) / ${op * 0.1})`,
                                  color: `hsl(var(--foreground) / ${op})`,
                                  wordBreak: 'break-word',
                                }}
                                onMouseEnter={(e) =>
                                  setHoveredChip({
                                    v: it.v,
                                    p: it.p,
                                    d: it.d,
                                    src: it.src,
                                    x: e.clientX,
                                    y: e.clientY,
                                  })
                                }
                                onMouseLeave={() => setHoveredChip(null)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setVendorSelection(it.v);
                                }}
                              >
                                {it.v}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      {filteredCos.length === 0 && (
        <div className="border border-dashed border-border p-8 mt-3 text-center text-sm text-muted-foreground space-y-2">
          <div>No pharmas match the current filters.</div>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Clear filters
          </Button>
        </div>
      )}

      {/* ── Vendor penetration summary ── */}
      <VendorSummary penetration={vendorPenetration} totalPharmas={totalPharmas} onSelectVendor={setVendorSelection} />

      {/* Tooltip on hover (vendor chip) */}
      {hoveredChip && (
        <div
          className="fixed z-[300] bg-background border border-border p-3 shadow-lg max-w-[300px] pointer-events-none"
          style={{
            left: Math.min(hoveredChip.x + 14, window.innerWidth - 320),
            top: hoveredChip.y + 14,
          }}
        >
          <div className="font-bold text-sm text-foreground">{hoveredChip.v}</div>
          {hoveredChip.p && <div className="text-xs text-primary mt-0.5">{hoveredChip.p}</div>}
          {hoveredChip.d && <div className="text-[11px] text-muted-foreground mt-1">{hoveredChip.d}</div>}
          <div className="text-[10px] text-muted-foreground mt-1.5 italic">
            Click for full vendor profile
          </div>
        </div>
      )}

      {/* Cell-detail Sheet */}
      <Sheet open={!!cellSelection} onOpenChange={(open) => !open && setCellSelection(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {cellSelection && (
            <CellDetail
              co={cellSelection.co}
              bv={cellSelection.bv}
              items={cellSelection.items}
              isGap={cellSelection.isGap}
              suggestForGap={suggestForGap}
              onSelectVendor={(v) => {
                setCellSelection(null);
                setVendorSelection(v);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Vendor-profile Sheet */}
      <Sheet open={!!vendorSelection} onOpenChange={(open) => !open && setVendorSelection(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {vendorSelection && (
            <VendorDetail vendor={vendorSelection} totalPharmas={totalPharmas} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ── Vendor penetration summary block ──
interface VendorSummaryProps {
  penetration: { v: string; pharmaCount: number; useCaseCount: number; totalMentions: number; pharmas: string[] }[];
  totalPharmas: number;
  onSelectVendor: (v: string) => void;
}

function VendorSummary({ penetration, totalPharmas, onSelectVendor }: VendorSummaryProps) {
  const top = penetration.slice(0, 12);
  if (top.length === 0) return null;
  const maxCount = top[0].pharmaCount;

  return (
    <div className="mt-6 border border-border bg-background p-4">
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <div>
          <div className="text-sm font-semibold text-foreground">Vendor penetration</div>
          <div className="text-[11px] text-muted-foreground">
            How many of the {totalPharmas} pharmas list each vendor at least once · sorted by reach · click any row for the vendor's full footprint
          </div>
        </div>
      </div>
      <ul className="space-y-1">
        {top.map((row) => {
          const pct = row.pharmaCount / totalPharmas;
          const barW = (row.pharmaCount / maxCount) * 100;
          return (
            <li key={row.v}>
              <button
                type="button"
                onClick={() => onSelectVendor(row.v)}
                className="w-full text-left grid grid-cols-[140px_1fr_auto] items-center gap-3 py-1.5 px-2 hover:bg-secondary/30 transition-colors text-xs"
              >
                <span className="font-medium text-foreground truncate">{row.v}</span>
                <span className="relative h-2 bg-secondary/50">
                  <span
                    className="absolute inset-y-0 left-0 bg-foreground/60"
                    style={{ width: `${barW}%` }}
                  />
                </span>
                <span className="font-mono text-muted-foreground tabular-nums whitespace-nowrap">
                  {row.pharmaCount}/{totalPharmas} pharmas · {Math.round(pct * 100)}%
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Cell-detail Sheet content ──
interface CellDetailProps {
  co: string;
  bv: string;
  items: PharmaCellItem[];
  isGap: boolean;
  suggestForGap: (bv: string, excludeCo: string) => { vendor: string; otherPharmas: string[] }[];
  onSelectVendor: (v: string) => void;
}

function CellDetail({ co, bv, items, isGap, suggestForGap, onSelectVendor }: CellDetailProps) {
  const groupName = ONCO_BV_GROUPS[bv];
  const groupColor = ONCO_GRP_COLORS[groupName];
  const useCaseLabel = ONCO_BV_LABELS[bv] ?? bv;

  return (
    <>
      <SheetHeader className="text-left mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: groupColor }} />
          <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
            {groupName} · {useCaseLabel}
          </span>
        </div>
        <SheetTitle className="text-xl font-semibold">{co}</SheetTitle>
        <SheetDescription className="text-sm text-muted-foreground">
          {isGap
            ? 'Market gap — no AI vendor is currently listed for this pharma in this use case.'
            : `${items.length} AI vendor${items.length === 1 ? '' : 's'} listed for ${co} in ${useCaseLabel}.`}
        </SheetDescription>
      </SheetHeader>

      {!isGap && (
        <div className="space-y-3 mb-6">
          <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
            Vendors
          </div>
          {items.map((it, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectVendor(it.v)}
              className="w-full text-left border border-border p-3 hover:border-foreground/40 transition-colors space-y-1"
            >
              <div className="font-semibold text-sm text-foreground">{it.v}</div>
              {it.p && <div className="text-xs text-primary">{it.p}</div>}
              {it.d && <div className="text-xs text-muted-foreground">{it.d}</div>}
              {it.src && (
                <a
                  href={it.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Source
                </a>
              )}
            </button>
          ))}
        </div>
      )}

      {isGap && (
        <GapSuggestions bv={bv} co={co} suggestForGap={suggestForGap} onSelectVendor={onSelectVendor} />
      )}
    </>
  );
}

function GapSuggestions({
  bv,
  co,
  suggestForGap,
  onSelectVendor,
}: {
  bv: string;
  co: string;
  suggestForGap: (bv: string, excludeCo: string) => { vendor: string; otherPharmas: string[] }[];
  onSelectVendor: (v: string) => void;
}) {
  const candidates = suggestForGap(bv, co).slice(0, 8);

  if (candidates.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic">
        No vendors are listed for this use case at any other pharma either — this is a category-wide gap, not just a {co}-specific one.
      </div>
    );
  }

  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-2">
        Candidate vendors (already serve other pharmas in {ONCO_BV_LABELS[bv] ?? bv})
      </div>
      <div className="space-y-1.5">
        {candidates.map((c) => (
          <button
            key={c.vendor}
            type="button"
            onClick={() => onSelectVendor(c.vendor)}
            className="w-full text-left flex items-center justify-between gap-2 p-2 border border-border hover:border-foreground/40 hover:bg-secondary/30 text-xs transition-colors"
          >
            <span className="font-medium text-foreground">{c.vendor}</span>
            <span className="text-muted-foreground font-mono shrink-0">
              already at {c.otherPharmas.length} pharma{c.otherPharmas.length === 1 ? '' : 's'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Vendor-profile Sheet content ──
function VendorDetail({ vendor, totalPharmas }: { vendor: string; totalPharmas: number }) {
  // Build vendor footprint: which (pharma, use case) cells contain this vendor.
  const footprint = useMemo(() => {
    const result: { co: string; bv: string; product: string; description: string; src?: string }[] = [];
    ONCO_PHARMA_COS.forEach((co) => {
      ONCO_BV_ORDER.forEach((bv) => {
        const items = (ONCO_PHARMA[`${co}|${bv}`] ?? []) as PharmaCellItem[];
        items.forEach((it) => {
          if (it.v === vendor) {
            result.push({ co, bv, product: it.p, description: it.d, src: it.src });
          }
        });
      });
    });
    return result;
  }, [vendor]);

  const pharmas = Array.from(new Set(footprint.map((f) => f.co)));
  const useCases = Array.from(new Set(footprint.map((f) => f.bv)));
  const groups = Array.from(new Set(useCases.map((bv) => ONCO_BV_GROUPS[bv])));

  return (
    <>
      <SheetHeader className="text-left mb-4">
        <SheetTitle className="text-xl font-semibold">{vendor}</SheetTitle>
        <SheetDescription className="text-sm text-muted-foreground">
          Listed at {pharmas.length} of {totalPharmas} pharmas across {useCases.length} use case
          {useCases.length === 1 ? '' : 's'}.
        </SheetDescription>
      </SheetHeader>

      {groups.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1">
            Categories covered
          </div>
          <div className="flex flex-wrap gap-1.5">
            {groups.map((g) => (
              <span
                key={g}
                className="text-[11px] px-2 py-0.5 border"
                style={{ borderColor: ONCO_GRP_COLORS[g], color: ONCO_GRP_COLORS[g] }}
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
          Footprint
        </div>
        {footprint.map((f, i) => (
          <div key={i} className="border border-border p-2 text-xs space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-semibold text-foreground">{f.co}</span>
              <span
                className="text-[10px] uppercase tracking-widest font-mono"
                style={{ color: ONCO_GRP_COLORS[ONCO_BV_GROUPS[f.bv]] }}
              >
                {ONCO_BV_LABELS[f.bv] ?? f.bv}
              </span>
            </div>
            {f.product && <div className="text-primary">{f.product}</div>}
            {f.description && <div className="text-muted-foreground">{f.description}</div>}
            {f.src && (
              <a
                href={f.src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline mt-1"
              >
                <ExternalLink className="h-3 w-3" />
                Source
              </a>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// ── Mobile fallback: one card per pharma, value chain stacked vertically ──
interface PharmaCardListProps {
  pharmas: string[];
  visibleBv: readonly string[];
  onCellClick: (co: string, bv: string, items: PharmaCellItem[], isGap: boolean) => void;
  onVendorClick: (v: string) => void;
}

function PharmaCardList({ pharmas, visibleBv, onCellClick, onVendorClick }: PharmaCardListProps) {
  return (
    <div className="space-y-3">
      {pharmas.map((co) => {
        // Group use cases by category for clean stacking inside the card.
        const groupedBv = new Map<string, string[]>();
        visibleBv.forEach((bv) => {
          const g = ONCO_BV_GROUPS[bv];
          if (!groupedBv.has(g)) groupedBv.set(g, []);
          groupedBv.get(g)!.push(bv);
        });

        const isAmgen = co === 'Amgen';

        return (
          <div
            key={co}
            className={cn(
              'border bg-background',
              isAmgen ? 'border-primary' : 'border-border',
            )}
          >
            <div
              className={cn(
                'p-3 border-b border-border',
                isAmgen ? 'text-primary' : 'text-foreground',
              )}
            >
              <div className="text-base font-semibold">{co}</div>
            </div>
            <div className="divide-y divide-border">
              {Array.from(groupedBv.entries()).map(([groupName, bvs]) => {
                const groupColor = ONCO_GRP_COLORS[groupName];
                return (
                  <div key={groupName} className="p-3">
                    <div
                      className="text-[10px] uppercase tracking-widest font-mono mb-2 flex items-center gap-1.5"
                      style={{ color: groupColor }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ background: groupColor }} />
                      {groupName}
                    </div>
                    <div className="space-y-2">
                      {bvs.map((bv) => {
                        const items = (ONCO_PHARMA[`${co}|${bv}`] ?? []) as PharmaCellItem[];
                        const isOpp = ONCO_OPP_COLS.includes(bv);
                        const isEmpty = items.length === 0;

                        return (
                          <button
                            key={bv}
                            type="button"
                            onClick={() =>
                              (!isEmpty || isOpp) && onCellClick(co, bv, items, isEmpty && isOpp)
                            }
                            disabled={isEmpty && !isOpp}
                            className={cn(
                              'w-full text-left grid grid-cols-[1fr_auto] gap-2 items-center py-1.5 px-2 transition-colors text-xs',
                              !isEmpty && 'border border-border/60 bg-primary/5 hover:bg-primary/10',
                              isEmpty && isOpp && 'border border-dashed border-muted-foreground/30 hover:border-primary/40',
                              isEmpty && !isOpp && 'opacity-40',
                            )}
                          >
                            <div className="min-w-0">
                              <div className="font-medium text-foreground">
                                {ONCO_BV_LABELS[bv] ?? bv}
                              </div>
                              {!isEmpty && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {items.map((it, idx) => (
                                    <span
                                      key={idx}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onVendorClick(it.v);
                                      }}
                                      className="text-[10px] px-1.5 py-0.5 border border-foreground/10 bg-foreground/5"
                                    >
                                      {it.v}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {isEmpty && isOpp && (
                                <div className="text-[10px] text-muted-foreground italic mt-1">
                                  Market gap — tap to see candidate vendors
                                </div>
                              )}
                              {isEmpty && !isOpp && (
                                <div className="text-[10px] text-muted-foreground/70 italic mt-1">
                                  No data
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
