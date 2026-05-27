// Founder Toolkit → Architectures (SOTA map)
// Layout follows HubShell pattern — bordered card, tab nav, footer bar.

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/shared/PageHeader';
import { FounderToolkitNav } from '@/components/shared/FounderToolkitNav';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BubbleChart, type XMode } from '@/components/context-architecture/BubbleChart';
import { ArchitectureTable } from '@/components/context-architecture/ArchitectureTable';
import { ArchitectureSidebar } from '@/components/context-architecture/ArchitectureSidebar';
import {
  AI_ARCHITECTURES,
  AI_REVENUE_PRODUCTS,
  ALL_FAMILIES,
  ALL_DOMAINS,
  FAMILY_COLORS,
  type ArchFamily,
  type ProductDomain,
} from '@/data/aiArchitectureRevenue';
import {
  TRENDING_PAPERS,
  TRENDING_PAPERS_DATE,
  TRENDING_PAPERS_SOURCE,
  CATEGORY_LABELS,
  CATEGORY_GROUP,
} from '@/data/trendingPapers';
import { cn } from '@/lib/utils';

function fmtMoney(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}T`;
  if (v >= 1000) return `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}B`;
  if (v >= 1) return `$${v.toFixed(0)}M`;
  return v > 0 ? '<$1M' : '$0';
}

interface FiltersProps {
  xMode: XMode;
  setXMode: (m: XMode) => void;
  familyFilter: Set<ArchFamily>;
  toggleFamily: (f: ArchFamily) => void;
  domainFilter: ProductDomain | 'all';
  setDomainFilter: (d: ProductDomain | 'all') => void;
}

function ArchFilters({
  xMode, setXMode, familyFilter, toggleFamily, domainFilter, setDomainFilter,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-3 items-start">
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
                style={active ? { borderLeftColor: FAMILY_COLORS[f], borderLeftWidth: 3 } : undefined}
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
  );
}

function TrendingPapersView() {
  // Build clusters: category → papers[], sorted by count desc
  const clusters = useMemo(() => {
    const map = new Map<string, typeof TRENDING_PAPERS>();
    for (const paper of TRENDING_PAPERS) {
      const cat = paper.category;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(paper);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .map(([cat, papers]) => ({
        cat,
        label: CATEGORY_LABELS[cat] ?? cat,
        group: CATEGORY_GROUP[cat] ?? 'other',
        papers,
      }));
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {TRENDING_PAPERS.length} papers · {clusters.length} categories
        </div>
        <a
          href={TRENDING_PAPERS_SOURCE}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          emergentmind.com · {TRENDING_PAPERS_DATE} ↗
        </a>
      </div>

      {/* Cluster grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-border">
        {clusters.map(({ cat, label, papers }) => {
          const searchBase = `https://arxiv.org/search/?searchtype=all&query=`;
          return (
            <div key={cat} className="bg-background p-4 flex flex-col gap-3">
              {/* Cluster header */}
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xs font-bold text-foreground bg-foreground/8 px-1.5 py-0.5 border border-border">
                    {cat}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{label}</span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground flex-shrink-0">
                  {papers.length}
                </span>
              </div>

              {/* Paper list */}
              <ol className="space-y-1.5">
                {papers.map((paper, i) => (
                  <li key={i}>
                    <a
                      href={`${searchBase}${encodeURIComponent(paper.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] leading-snug text-foreground/80 hover:text-foreground hover:underline underline-offset-2 decoration-border transition-colors"
                    >
                      {paper.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>

      <p className="mt-4 font-mono text-[10px] text-muted-foreground/50">
        Links open arXiv search · sourced from{' '}
        <a href={TRENDING_PAPERS_SOURCE} target="_blank" rel="noopener noreferrer" className="underline">
          emergentmind.com
        </a>
        {' '}· snapshot refreshed via Airtable Zero Trust pipeline
      </p>
    </div>
  );
}

const TAB_CN = cn(
  'rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 -mb-px',
  'text-[13px] font-medium tracking-tight',
  'text-muted-foreground hover:text-foreground transition-colors',
  'data-[state=active]:border-foreground data-[state=active]:text-foreground',
  'data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none',
);

const FoundersArchitectures = () => {
  const [selectedArchId, setSelectedArchId] = useState<string | null>(null);
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
        if (next.size === 0) next.add(f);
      } else {
        next.add(f);
      }
      return next;
    });
  };

  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <FounderToolkitNav />

        <PageHeader
          eyebrow="Founder Toolkit · Architectures"
          title="What revenue-shape buys you what kind of company"
          subtitle="SaaS subscription, marketplace take-rate, deployed system, hardware-as-a-service, services + software hybrid. Each architecture forces a different sales motion, margin profile, and exit ramp."
        />

        <div className="mt-8 border border-border bg-background">
          {/* Stats strip */}
          <div className="border-b px-4 py-3 flex flex-wrap gap-x-8 gap-y-2 items-baseline">
            {([
              { value: String(AI_ARCHITECTURES.length), label: 'architectures' },
              { value: String(AI_REVENUE_PRODUCTS.length), label: 'products' },
              { value: fmtMoney(totalRevenue), label: 'est. attributed revenue' },
            ] as const).map(({ value, label }) => (
              <div key={label} className="flex items-baseline gap-2">
                <span className="font-serif text-2xl font-medium text-foreground">{value}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Shared filter controls */}
          <div className="border-b px-4 py-3">
            <ArchFilters
              xMode={xMode}
              setXMode={setXMode}
              familyFilter={familyFilter}
              toggleFamily={toggleFamily}
              domainFilter={domainFilter}
              setDomainFilter={setDomainFilter}
            />
          </div>

          {/* Tab content */}
          <Tabs defaultValue="map" className="p-3 sm:p-4">
            <TabsList className="h-auto bg-transparent border-b border-border rounded-none p-0 mb-6 w-full justify-start gap-0 flex-wrap">
              <TabsTrigger value="map" className={TAB_CN}>Map</TabsTrigger>
              <TabsTrigger value="architectures" className={TAB_CN}>Architectures</TabsTrigger>
              <TabsTrigger value="trending" className={TAB_CN}>Trending Papers</TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="mt-0">
              <BubbleChart
                xMode={xMode}
                familyFilter={familyFilter}
                domainFilter={domainFilter}
                selectedArchId={selectedArchId}
                onSelect={setSelectedArchId}
              />
              <div className="mt-6 border-t pt-4">
                {selectedArchId ? (
                  <ArchitectureSidebar
                    selectedArchId={selectedArchId}
                    onClose={() => setSelectedArchId(null)}
                  />
                ) : (
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                      Family legend
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                      {ALL_FAMILIES.map((f) => (
                        <div key={f} className="flex items-center gap-1.5 text-xs">
                          <span
                            aria-hidden="true"
                            className="inline-block w-3 h-3 rounded-full"
                            style={{ backgroundColor: FAMILY_COLORS[f] }}
                          />
                          <span className="text-foreground">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="architectures" className="mt-0 space-y-6">
              <ArchitectureTable
                familyFilter={familyFilter}
                domainFilter={domainFilter}
                selectedArchId={selectedArchId}
                onSelect={setSelectedArchId}
              />
              {selectedArchId && (
                <div className="border-t pt-6">
                  <ArchitectureSidebar
                    selectedArchId={selectedArchId}
                    onClose={() => setSelectedArchId(null)}
                  />
                </div>
              )}
            </TabsContent>


            <TabsContent value="trending" className="mt-0">
              <TrendingPapersView />
            </TabsContent>
          </Tabs>

          {/* Footer bar — mirrors HubShell */}
          <div className="border-t px-3 sm:px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="uppercase tracking-widest font-mono text-[10px]">See also</span>
              {[
                { to: '/founders/markets', label: 'Markets' },
                { to: '/founders/dead-valley', label: 'Dead Valley' },
                { to: '/founders/tech', label: 'Tech Signals' },
              ].map(({ to, label }, i) => (
                <span key={to} className="inline-flex items-center gap-3">
                  {i > 0 && <span className="text-border">·</span>}
                  <Link to={to} className="hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </span>
              ))}
            </div>
            <span className="font-mono text-[10px]">AI Architecture × Revenue Map · 2026·05</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FoundersArchitectures;
