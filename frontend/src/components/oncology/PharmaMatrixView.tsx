import { useState, useMemo } from 'react';
import {
  ONCO_PHARMA, ONCO_PHARMA_COS, ONCO_BV_ORDER, ONCO_BV_LABELS,
  ONCO_BV_GROUPS, ONCO_GRP_COLORS, ONCO_OPP_COLS
} from '@/data/oncology';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

// Deterministic vendor color from foreground with opacity variants
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

export function PharmaMatrixView() {
  const [search, setSearch] = useState('');
  const [hoveredChip, setHoveredChip] = useState<{ v: string; p: string; d: string; src?: string; x: number; y: number } | null>(null);

  // Build group headers
  const groups = useMemo(() => {
    const result: { name: string; span: number }[] = [];
    let prev = '';
    ONCO_BV_ORDER.forEach(b => {
      const g = ONCO_BV_GROUPS[b];
      if (g !== prev) { result.push({ name: g, span: 1 }); prev = g; }
      else { result[result.length - 1].span++; }
    });
    return result;
  }, []);

  const filteredCos = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return ONCO_PHARMA_COS;
    return ONCO_PHARMA_COS.filter(co => {
      if (co.toLowerCase().includes(q)) return true;
      return ONCO_BV_ORDER.some(bv => {
        const items = ONCO_PHARMA[`${co}|${bv}`] || [];
        return items.some(it => (it.v + ' ' + it.p + ' ' + it.d).toLowerCase().includes(q));
      });
    });
  }, [search]);

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-3 items-center">
        {Object.entries(ONCO_GRP_COLORS).map(([g, c]) => (
          <div key={g} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: c }}>
            <span className="w-4 h-1 rounded-sm" style={{ background: c }} />
            {g}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground ml-3">
          <span className="w-3.5 h-3.5 inline-block border border-dashed border-muted-foreground/30" style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, hsl(var(--foreground) / 0.04) 3px, hsl(var(--foreground) / 0.04) 6px)'
          }} />
          = opportunity (no vendor)
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter by pharma, vendor, product…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-secondary border border-border px-3 py-1.5 text-xs w-64 max-w-full focus:outline-none focus:border-primary"
        />
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <table className="border-collapse w-full min-w-[780px]">
          <thead>
            <tr>
              <td className="p-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-background sticky left-0 z-10" />
              {groups.map((g, i) => (
                <td
                  key={i}
                  colSpan={g.span}
                  className="p-1.5 text-center text-[10px] font-bold uppercase tracking-wider bg-background"
                  style={{
                    color: ONCO_GRP_COLORS[g.name] || 'hsl(var(--foreground))',
                    borderBottom: `2px solid ${ONCO_GRP_COLORS[g.name] || 'hsl(var(--border))'}`,
                  }}
                >
                  {g.name}
                </td>
              ))}
            </tr>
            <tr>
              <th className="text-left text-xs font-bold p-1.5 text-foreground bg-background sticky left-0 z-10 min-w-[100px]">Pharma</th>
              {ONCO_BV_ORDER.map(bv => (
                <th key={bv} className="text-center text-[10px] font-medium text-muted-foreground p-1 max-w-[80px] break-words">
                  {ONCO_BV_LABELS[bv] || bv}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCos.map(co => {
              const isAmgen = co === 'Amgen';
              return (
                <tr key={co} className={isAmgen ? 'border-b-2 border-primary' : ''}>
                  <th className={cn(
                    'text-left text-xs font-bold p-1.5 bg-background sticky left-0 z-10',
                    isAmgen ? 'text-primary' : 'text-foreground'
                  )}>
                    {co}
                  </th>
                  {ONCO_BV_ORDER.map(bv => {
                    const key = `${co}|${bv}`;
                    const items = ONCO_PHARMA[key] || [];
                    const isOpp = ONCO_OPP_COLS.includes(bv);

                    if (!items.length) {
                      return (
                        <td
                          key={bv}
                          className={cn(
                            'p-1 border border-border/50',
                            isOpp
                              ? 'border-dashed border-muted-foreground/20'
                              : 'bg-secondary/30'
                          )}
                          style={isOpp ? {
                            background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, hsl(var(--foreground) / 0.02) 3px, hsl(var(--foreground) / 0.02) 6px)',
                          } : undefined}
                          title={isOpp ? 'No known AI vendor — potential opportunity' : undefined}
                        />
                      );
                    }

                    return (
                      <td key={bv} className="p-1 border border-border/50 bg-primary/5">
                        <div className="flex flex-wrap gap-0.5">
                          {items.map((it, idx) => {
                            const op = getVendorOpacity(it.v);
                            return (
                              <span
                                key={idx}
                                className="text-[10px] font-semibold px-1.5 py-0.5 cursor-pointer border border-foreground/10 hover:border-primary/40 transition-colors max-w-[90px] truncate"
                                style={{ background: `hsl(var(--foreground) / ${op * 0.1})`, color: `hsl(var(--foreground) / ${op})` }}
                                onMouseEnter={e => setHoveredChip({ v: it.v, p: it.p, d: it.d, src: it.src, x: e.clientX, y: e.clientY })}
                                onMouseLeave={() => setHoveredChip(null)}
                                onClick={() => it.src && window.open(it.src, '_blank')}
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

      {/* Tooltip */}
      {hoveredChip && (
        <div
          className="fixed z-[300] bg-background border border-border p-3 shadow-lg max-w-[300px] pointer-events-none"
          style={{ left: Math.min(hoveredChip.x + 14, window.innerWidth - 320), top: hoveredChip.y + 14 }}
        >
          <div className="font-bold text-sm text-foreground">{hoveredChip.v}</div>
          {hoveredChip.p && <div className="text-xs text-primary mt-0.5">{hoveredChip.p}</div>}
          {hoveredChip.d && <div className="text-[11px] text-muted-foreground mt-1">{hoveredChip.d}</div>}
          {hoveredChip.src ? (
            <div className="text-[10px] text-primary mt-1.5 font-semibold flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> Click to open source
            </div>
          ) : (
            <div className="text-[10px] text-muted-foreground mt-1.5 italic">No source link</div>
          )}
        </div>
      )}
    </div>
  );
}
