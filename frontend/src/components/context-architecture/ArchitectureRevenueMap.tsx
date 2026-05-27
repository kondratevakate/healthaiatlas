import { useMemo, useState } from 'react';
import {
  AI_ARCHITECTURES,
  AI_REVENUE_PRODUCTS,
  ALL_DOMAINS,
  ALL_FAMILIES,
  FAMILY_COLORS,
  type ArchFamily,
  type ProductDomain,
} from '@/data/aiArchitectureRevenue';
import { BubbleChart, type XMode } from './BubbleChart';
import { ArchitectureTable } from './ArchitectureTable';
import { ProductTable } from './ProductTable';
import { cn } from '@/lib/utils';

function fmtMoney(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}T`;
  if (v >= 1000) return `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}B`;
  if (v >= 1) return `$${v.toFixed(0)}M`;
  return v > 0 ? '<$1M' : '$0';
}

interface ArchitectureRevenueMapProps {
  selectedArchId: string | null;
  onSelect: (archId: string | null) => void;
}

export function ArchitectureRevenueMap({
  selectedArchId,
  onSelect,
}: ArchitectureRevenueMapProps) {
  const [xMode, setXMode] = useState<XMode>('papers');
  const [familyFilter, setFamilyFilter] = useState<Set<ArchFamily>>(
    () => new Set(ALL_FAMILIES),
  );
  const [domainFilter, setDomainFilter] = useState<ProductDomain | 'all'>('all');

  const totalRevenue = useMemo(
    () => AI_ARCHITECTURES.reduce((s, a) => s + a.attributableRevenueM, 0),
    [],
  );

  const toggleFamily = (f: ArchFamily) => {
    setFamilyFilter((prev) => {
      const next = new Set(prev);
      if (next.has(f)) {
        next.delete(f);
        // Don't allow empty set — re-add if user clicks the last one
        if (next.size === 0) next.add(f);
      } else {
        next.add(f);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Headline + stats */}
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          AI Architecture × Revenue Map · 2026·05
        </div>
        <h2 className="heading-editorial max-w-3xl">
          What got written vs what got attributed
        </h2>
        <p className="text-sm text-muted-foreground mt-3 max-w-3xl leading-relaxed">
          Each architecture is one dot. Y is <em>estimated attributable revenue</em> —
          not a measured fact. Toggle X between <em>papers</em> (research volume)
          and <em>publication year</em>. Companies almost never disclose which
          architecture drives their revenue — these are Bayesian estimates against
          the canonical SOTA paper for each product class. Click any bubble to
          see the products behind the estimate.
        </p>
        <div className="flex flex-wrap gap-6 mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <div>
            <span className="block font-serif text-2xl font-medium text-foreground normal-case tracking-normal">
              {AI_ARCHITECTURES.length}
            </span>
            architectures
          </div>
          <div>
            <span className="block font-serif text-2xl font-medium text-foreground normal-case tracking-normal">
              {AI_REVENUE_PRODUCTS.length}
            </span>
            products
          </div>
          <div>
            <span className="block font-serif text-2xl font-medium text-foreground normal-case tracking-normal">
              {fmtMoney(totalRevenue)}
            </span>
            est. attributed revenue
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="flex flex-wrap gap-x-6 gap-y-3 items-start border-y py-3">
        <div className="min-w-[160px]">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
            X axis
          </div>
          <div className="inline-flex border">
            {(['papers', 'year'] as XMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setXMode(m)}
                className={cn(
                  'px-3 py-1 text-xs font-mono uppercase tracking-wider border-r last:border-r-0 transition-colors',
                  xMode === m
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {m === 'papers' ? 'Papers' : 'Year'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-[280px]">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
            Family
          </div>
          <div className="flex flex-wrap gap-1">
            {ALL_FAMILIES.map((f) => {
              const active = familyFilter.has(f);
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFamily(f)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono border transition-colors',
                    active
                      ? 'border-foreground text-foreground'
                      : 'border-border text-muted-foreground opacity-60 hover:opacity-100',
                  )}
                  style={
                    active
                      ? { borderLeftColor: FAMILY_COLORS[f], borderLeftWidth: 3 }
                      : undefined
                  }
                >
                  <span
                    aria-hidden="true"
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: FAMILY_COLORS[f] }}
                  />
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 min-w-[280px]">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
            Domain
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setDomainFilter('all')}
              className={cn(
                'px-2 py-1 text-[11px] font-mono border transition-colors',
                domainFilter === 'all'
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              All
            </button>
            {ALL_DOMAINS.map((d) => {
              const active = domainFilter === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDomainFilter(active ? 'all' : d)}
                  className={cn(
                    'px-2 py-1 text-[11px] font-mono border transition-colors',
                    active
                      ? 'bg-foreground text-background border-foreground'
                      : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bubble chart */}
      <BubbleChart
        xMode={xMode}
        familyFilter={familyFilter}
        domainFilter={domainFilter}
        selectedArchId={selectedArchId}
        onSelect={onSelect}
      />

      {/* Architectures table */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          Architectures · sorted by revenue
        </div>
        <ArchitectureTable
          familyFilter={familyFilter}
          domainFilter={domainFilter}
          selectedArchId={selectedArchId}
          onSelect={onSelect}
        />
      </div>

      {/* Products table */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Products
            {selectedArchId && (
              <span className="ml-2 normal-case tracking-normal">
                · filtered by {selectedArchId}
              </span>
            )}
          </div>
          {selectedArchId && (
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              Clear filter
            </button>
          )}
        </div>
        <ProductTable
          domainFilter={domainFilter}
          selectedArchId={selectedArchId}
          onSelectArch={onSelect}
        />
      </div>
    </div>
  );
}
