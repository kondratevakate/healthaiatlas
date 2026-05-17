import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import {
  AI_REVENUE_PRODUCTS,
  AI_ARCHITECTURES,
  FAMILY_COLORS,
  type AIRevenueProduct,
  type ProductDomain,
} from '@/data/aiArchitectureRevenue';
import { cn } from '@/lib/utils';

interface ProductTableProps {
  domainFilter: ProductDomain | 'all';
  selectedArchId: string | null;
  onSelectArch: (archId: string) => void;
}

type SortCol = 'name' | 'revenueM' | 'primaryArchId' | 'domainTag' | 'stage';
type SortDir = 'asc' | 'desc';

function fmtMoney(v: number): string {
  if (v >= 1000) return `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}B`;
  if (v >= 1) return `$${v.toFixed(0)}M`;
  return v > 0 ? '<$1M' : '$0';
}

function compare<T extends string | number>(a: T, b: T, dir: SortDir): number {
  if (a === b) return 0;
  const cmp = a < b ? -1 : 1;
  return dir === 'asc' ? cmp : -cmp;
}

function sortProducts(
  rows: AIRevenueProduct[],
  col: SortCol,
  dir: SortDir,
): AIRevenueProduct[] {
  return [...rows].sort((a, b) => {
    switch (col) {
      case 'revenueM':
        return compare(a.revenueM, b.revenueM, dir);
      case 'name':
        return compare(a.name.toLowerCase(), b.name.toLowerCase(), dir);
      case 'primaryArchId':
        return compare(a.primaryArchId, b.primaryArchId, dir);
      case 'domainTag':
        return compare(a.domainTag, b.domainTag, dir);
      case 'stage':
        return compare(a.stage, b.stage, dir);
    }
  });
}

function SortHeader({
  label,
  col,
  current,
  onSort,
  align = 'left',
}: {
  label: string;
  col: SortCol;
  current: { col: SortCol; dir: SortDir };
  onSort: (col: SortCol) => void;
  align?: 'left' | 'right';
}) {
  const isActive = current.col === col;
  return (
    <button
      type="button"
      onClick={() => onSort(col)}
      className={cn(
        'flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest hover:text-foreground transition-colors',
        align === 'right' && 'justify-end w-full',
        isActive ? 'text-foreground' : 'text-muted-foreground',
      )}
    >
      <span>{label}</span>
      {isActive &&
        (current.dir === 'desc' ? (
          <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUp className="h-3 w-3" />
        ))}
    </button>
  );
}

export function ProductTable({
  domainFilter,
  selectedArchId,
  onSelectArch,
}: ProductTableProps) {
  const [sort, setSort] = useState<{ col: SortCol; dir: SortDir }>({
    col: 'revenueM',
    dir: 'desc',
  });

  const archMap = useMemo(() => {
    const m: Record<string, (typeof AI_ARCHITECTURES)[number]> = {};
    for (const a of AI_ARCHITECTURES) m[a.archId] = a;
    return m;
  }, []);

  const rows = useMemo(() => {
    const filtered = AI_REVENUE_PRODUCTS.filter((p) => {
      if (domainFilter !== 'all' && p.domainTag !== domainFilter) return false;
      if (selectedArchId && p.primaryArchId !== selectedArchId) return false;
      return true;
    });
    return sortProducts(filtered, sort.col, sort.dir);
  }, [domainFilter, selectedArchId, sort]);

  const handleSort = (col: SortCol) => {
    setSort((s) => {
      if (s.col === col) {
        return { col, dir: s.dir === 'desc' ? 'asc' : 'desc' };
      }
      return { col, dir: col === 'revenueM' ? 'desc' : 'asc' };
    });
  };

  return (
    <div className="border rounded-md">
      <div
        className="grid items-center border-b bg-secondary/40 px-3 py-2 gap-2"
        style={{
          gridTemplateColumns: '1fr 100px 120px 110px 80px',
        }}
      >
        <SortHeader label="Product / Company" col="name" current={sort} onSort={handleSort} />
        <SortHeader label="Revenue" col="revenueM" current={sort} onSort={handleSort} align="right" />
        <SortHeader label="Primary arch" col="primaryArchId" current={sort} onSort={handleSort} />
        <SortHeader label="Domain" col="domainTag" current={sort} onSort={handleSort} />
        <SortHeader label="Stage" col="stage" current={sort} onSort={handleSort} />
      </div>
      {rows.map((p) => {
        const arch = archMap[p.primaryArchId];
        const color = arch ? FAMILY_COLORS[arch.family] : '#999';
        return (
          <div
            key={p.productId}
            className="grid items-center text-xs border-b last:border-b-0 px-3 py-2 gap-2"
            style={{
              gridTemplateColumns: '1fr 100px 120px 110px 80px',
            }}
          >
            <div className="min-w-0">
              <div className="font-medium truncate">{p.name}</div>
              <div className="font-mono text-[10px] text-muted-foreground truncate">
                {p.company}
              </div>
            </div>
            <div className="font-mono tabular-nums text-right">
              {fmtMoney(p.revenueM)}
            </div>
            <button
              type="button"
              onClick={() => onSelectArch(p.primaryArchId)}
              className="flex items-center gap-1.5 text-left hover:text-primary transition-colors min-w-0"
            >
              <span
                aria-hidden="true"
                className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="font-mono text-[10px] truncate">
                {p.primaryArchId} {arch?.name.split(' (')[0] ?? ''}
              </span>
            </button>
            <div className="text-[11px] text-muted-foreground truncate">{p.domainTag}</div>
            <div className="font-mono text-[10px] text-muted-foreground truncate">{p.stage}</div>
          </div>
        );
      })}
      {rows.length === 0 && (
        <div className="px-3 py-6 text-xs text-muted-foreground text-center">
          No products match the current filters.
        </div>
      )}
    </div>
  );
}
