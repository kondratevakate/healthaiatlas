import { useMemo } from 'react';
import {
  AI_ARCHITECTURES,
  FAMILY_COLORS,
  familyKey,
  type AIArchitecture,
  type ArchFamily,
  type ProductDomain,
} from '@/data/aiArchitectureRevenue';
import { cn } from '@/lib/utils';

interface ArchitectureTableProps {
  familyFilter: Set<ArchFamily>;
  domainFilter: ProductDomain | 'all';
  selectedArchId: string | null;
  onSelect: (archId: string) => void;
}

function fmtMoney(v: number): string {
  if (v >= 1000) return `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}B`;
  if (v >= 1) return `$${v.toFixed(0)}M`;
  return v > 0 ? '<$1M' : '$0';
}

function isVisible(
  a: AIArchitecture,
  familyFilter: Set<ArchFamily>,
  domainFilter: ProductDomain | 'all',
): boolean {
  if (!familyFilter.has(familyKey(a.family))) return false;
  if (domainFilter !== 'all' && !a.domains.includes(domainFilter)) return false;
  return true;
}

export function ArchitectureTable({
  familyFilter,
  domainFilter,
  selectedArchId,
  onSelect,
}: ArchitectureTableProps) {
  const rows = useMemo(
    () =>
      AI_ARCHITECTURES.filter((a) => isVisible(a, familyFilter, domainFilter)).sort(
        (a, b) => b.attributableRevenueM - a.attributableRevenueM,
      ),
    [familyFilter, domainFilter],
  );

  return (
    <div className="border rounded-md">
      <div className="grid items-center border-b bg-secondary/40 font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-3 py-2" style={{ gridTemplateColumns: '36px 1fr 110px 80px 90px' }}>
        <div>ID</div>
        <div>Architecture</div>
        <div className="text-right">Est. revenue</div>
        <div className="text-right">Papers</div>
        <div>Year</div>
      </div>
      {rows.map((a) => {
        const isSel = selectedArchId === a.archId;
        const color = FAMILY_COLORS[a.family];
        return (
          <button
            key={a.archId}
            type="button"
            onClick={() => onSelect(a.archId)}
            className={cn(
              'w-full grid items-center text-left text-xs border-b last:border-b-0 px-3 py-2 transition-colors',
              isSel
                ? 'bg-foreground/5'
                : 'hover:bg-secondary/50',
            )}
            style={{ gridTemplateColumns: '36px 1fr 110px 80px 90px' }}
          >
            <div className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="font-mono text-[10px] text-muted-foreground">
                {a.archId}
              </span>
            </div>
            <div className="font-medium truncate pr-2">{a.name}</div>
            <div className="font-mono tabular-nums text-right">
              {fmtMoney(a.attributableRevenueM)}
            </div>
            <div className="font-mono tabular-nums text-right text-muted-foreground">
              {a.paperCountK}K
            </div>
            <div className="font-mono text-muted-foreground">{a.paperYear}</div>
          </button>
        );
      })}
      {rows.length === 0 && (
        <div className="px-3 py-6 text-xs text-muted-foreground text-center">
          No architectures match the current filters.
        </div>
      )}
    </div>
  );
}
