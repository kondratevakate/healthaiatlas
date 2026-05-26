import { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, X } from 'lucide-react';
import {
  LS_BUBBLES,
  LS_CLUSTERS,
  LS_ET_LABELS,
  LS_FAMILY_LABELS,
  type LSBubble,
  type LSCluster,
  type LSClusterFamily,
} from '@/data/aiLifeSciences';
import { LS_REVENUE } from '@/data/aiLifeSciencesRevenue';
import { squarifiedTreemap } from '@/lib/squarifiedTreemap';
import { cn } from '@/lib/utils';

// Metrics are computed from verified sources only:
// - Capital/Players/VC/M&A/Pharma/FDA: aggregated from 218 verified LS_BUBBLES
// - Revenue: from LS_REVENUE (SEC filings + ARR disclosures, 63 companies)
type SignalKey =
  | 'revenue'
  | 'capital_total'
  | 'players'
  | 'vc'
  | 'ma'
  | 'pharma_deals'
  | 'fda_clearances';

interface SignalDef {
  key: SignalKey;
  label: string;
  short: string;
  unit: 'usd_m' | 'count';
  // Predicate over a bubble — bubbles passing it contribute to this metric.
  match: (b: LSBubble) => boolean;
  // How a passing bubble adds to the cluster total.
  weigh: (b: LSBubble) => number;
}

const SIGNALS: SignalDef[] = [
  {
    key: 'revenue',
    label: 'Revenue / ARR (latest disclosed)',
    short: 'Revenue',
    unit: 'usd_m',
    // Revenue is sourced from LS_REVENUE, not LS_BUBBLES — see computeSignal.
    match: () => false,
    weigh: () => 0,
  },
  {
    key: 'capital_total',
    label: 'Total disclosed capital',
    short: 'Capital',
    unit: 'usd_m',
    match: (b) => (b.a ?? 0) > 0,
    weigh: (b) => b.a ?? 0,
  },
  {
    key: 'players',
    label: 'Players (unique companies)',
    short: 'Players',
    unit: 'count',
    // Counted via distinct b.c per cluster — see computeSignal below.
    match: () => true,
    weigh: () => 1,
  },
  {
    key: 'vc',
    label: 'VC funding rounds',
    short: 'VC',
    unit: 'usd_m',
    match: (b) => b.et === 'Funding_Round' && (b.a ?? 0) > 0,
    weigh: (b) => b.a ?? 0,
  },
  {
    key: 'ma',
    label: 'M&A deal value',
    short: 'M&A',
    unit: 'usd_m',
    match: (b) => b.et === 'Acquisition' && (b.a ?? 0) > 0,
    weigh: (b) => b.a ?? 0,
  },
  {
    key: 'pharma_deals',
    label: 'Pharma partnership value',
    short: 'Pharma deals',
    unit: 'usd_m',
    match: (b) => b.et === 'Pharma_Deal' && (b.a ?? 0) > 0,
    weigh: (b) => b.a ?? 0,
  },
  {
    key: 'fda_clearances',
    label: 'Regulatory milestones',
    short: 'Regulatory',
    unit: 'count',
    match: (b) =>
      b.et === 'FDA_Clearance' ||
      b.et === 'Regulatory_Milestone' ||
      b.et === 'Regulatory' ||
      (b.et === 'Event' && /fda|510.k|de novo|clearance|ema|nmpa|pmda|approved|approval/i.test(b.desc ?? '')),
    weigh: () => 1,
  },
];

function formatValue(v: number, unit: 'usd_m' | 'count'): string {
  if (unit === 'count') return v.toLocaleString();
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}B`;
  if (v >= 1) return `$${v.toFixed(0)}M`;
  return v > 0 ? `<$1M` : '—';
}

// Slug-normalize company name to match LS_REVENUE slugs.
function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Only AI-product revenue (scope="product"). Company-scope entries are total
// company revenue where AI is a small component (Intuitive Surgical, Epic, etc.).
const REVENUE_BY_SLUG = new Map(
  LS_REVENUE.filter((r) => r.scope === 'product').map((r) => [r.slug, r.revenue_m]),
);

// Compute a cluster's value for the given signal.
function computeSignal(cluster: LSCluster, sig: SignalDef): number {
  const inCluster = LS_BUBBLES.filter((b) => b.cluster === cluster.id);
  if (sig.key === 'players') {
    return new Set(inCluster.map((b) => b.c)).size;
  }
  if (sig.key === 'revenue') {
    // Only AI-native companies: exclude all pharma* and regulator entityTypes
    // whose revenue figures represent total company turnover, not AI product revenue.
    // pharma_transaction / pharma_infrastructure / pharma_asset etc. all excluded.
    const isExcluded = (t: string) => t === 'regulator' || t.startsWith('pharma');
    const seen = new Set<string>();
    let total = 0;
    for (const b of inCluster) {
      if (isExcluded(b.entityType ?? '')) continue;
      if (seen.has(b.c)) continue;
      seen.add(b.c);
      total += REVENUE_BY_SLUG.get(toSlug(b.c)) ?? 0;
    }
    return total;
  }
  return inCluster.filter(sig.match).reduce((s, b) => s + sig.weigh(b), 0);
}

const FAMILY_ORDER: LSClusterFamily[] = ['care_delivery', 'discovery_rd', 'therapeutic', 'ai_infra', 'meta'];

export function ClusterTreemapView() {
  const [signal, setSignal] = useState<SignalKey>('revenue');
  const [hovered, setHovered] = useState<string | null>(null);
  const [opened, setOpened] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1100, h: 560 });
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = e.contentRect.width;
        setSize({ w, h: Math.max(420, Math.min(640, w * 0.55)) });
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const sigDef = SIGNALS.find((s) => s.key === signal)!;

  // Per-cluster computed value for the active signal.
  const clusterValues = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of LS_CLUSTERS) m.set(c.id, computeSignal(c, sigDef));
    return m;
  }, [sigDef]);

  // Top entries per cluster for the active signal (most-funded / most-active first).
  const topEntries = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const c of LS_CLUSTERS) {
      const inCluster = LS_BUBBLES.filter((b) => b.cluster === c.id);
      if (signal === 'players') {
        // distinct companies, ranked by total $ across their bubbles
        const sums = new Map<string, number>();
        for (const b of inCluster) sums.set(b.c, (sums.get(b.c) ?? 0) + (b.a ?? 0));
        map.set(c.id, [...sums.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n]) => n));
        continue;
      }
      const sums = new Map<string, number>();
      for (const b of inCluster.filter(sigDef.match)) {
        sums.set(b.c, (sums.get(b.c) ?? 0) + sigDef.weigh(b));
      }
      map.set(c.id, [...sums.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n]) => n));
    }
    return map;
  }, [signal, sigDef]);

  const inFrame = useMemo(() => LS_CLUSTERS.filter((c) => !c.offFrame), []);
  const offFrame = useMemo(() => LS_CLUSTERS.filter((c) => c.offFrame), []);

  // Treemap weights with a hard minimum so every cluster stays clickable.
  // A cluster with zero signal for this metric still gets a small placeholder box.
  const sized = useMemo(() => {
    const raw = inFrame.map((c) => ({ id: c.id, raw: clusterValues.get(c.id) ?? 0 }));
    const largest = Math.max(1, ...raw.map((r) => r.raw));
    return raw.map(({ id, raw }) => {
      const isPlaceholder = raw === 0;
      const value = isPlaceholder ? largest * 0.08 : Math.max(raw, largest * 0.05);
      return { id, value, raw, isPlaceholder };
    });
  }, [clusterValues, inFrame]);

  const layout = useMemo(
    () => squarifiedTreemap(sized.map((s) => ({ id: s.id, value: s.value })), size.w, size.h),
    [sized, size.w, size.h],
  );

  const placeholderById = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const s of sized) m.set(s.id, s.isPlaceholder);
    return m;
  }, [sized]);

  const offTotal = offFrame.reduce((s, c) => s + Math.max(clusterValues.get(c.id) ?? 0, 5), 0);

  useEffect(() => {
    if (!opened) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpened(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [opened]);

  return (
    <div>
      {/* Signal toggle */}
      <div className="flex flex-wrap gap-1 mb-3 items-center">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mr-2">
          Size by:
        </span>
        {SIGNALS.map((s) => {
          const isCapitalBreakdown = ['vc', 'ma', 'pharma_deals'].includes(s.key);
          return (
            <button
              key={s.key}
              onClick={() => setSignal(s.key)}
              className={cn(
                'px-2 py-1 text-[11px] font-mono border transition-colors',
                signal === s.key
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
                // Capital breakdown buttons are visually indented under Capital
                isCapitalBreakdown && signal !== s.key && 'opacity-60 text-[10px]',
              )}
            >
              {isCapitalBreakdown && signal !== s.key ? `↳ ${s.short}` : s.short}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
        Every value is aggregated directly from the {LS_BUBBLES.length} verified bubbles —
        no editorial overlay. Click any cluster to read every entry inside.
      </p>

      {/* In-frame treemap */}
      <div
        ref={containerRef}
        className="relative border border-border bg-background overflow-hidden"
        style={{ width: '100%', height: size.h }}
      >
        {layout.map((rect) => {
          const cluster = inFrame.find((c) => c.id === rect.id)!;
          const raw = clusterValues.get(cluster.id) ?? 0;
          const isPlaceholder = placeholderById.get(cluster.id) ?? false;
          const top = topEntries.get(cluster.id) ?? [];
          const isHovered = hovered === cluster.id;
          const tiny = rect.w < 110 || rect.h < 80;
          const compact = rect.w < 200 || rect.h < 140;

          return (
            <button
              key={rect.id}
              type="button"
              onClick={() => setOpened(cluster.id)}
              className="absolute overflow-hidden text-white text-left focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary"
              style={{
                left: `${(rect.x / size.w) * 100}%`,
                top: `${(rect.y / size.h) * 100}%`,
                width: `${(rect.w / size.w) * 100}%`,
                height: `${(rect.h / size.h) * 100}%`,
                background: cluster.color,
                opacity: isPlaceholder ? 0.55 : 1,
                outline: isHovered ? '2px solid hsl(var(--primary))' : '1px solid rgba(0,0,0,0.25)',
                outlineOffset: isHovered ? '-2px' : '0',
                transition: 'all 600ms cubic-bezier(.4,0,.2,1)',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHovered(cluster.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className={cn('p-2.5 h-full flex flex-col', tiny && 'p-1.5')}>
                <div className={cn('font-semibold leading-tight', tiny ? 'text-[10px]' : 'text-sm')}>
                  {cluster.label}
                </div>
                {!tiny && (
                  <div className="text-[10px] opacity-80 font-mono mt-0.5">
                    {isPlaceholder ? 'no signal' : formatValue(raw, sigDef.unit)}
                  </div>
                )}
                {!compact && top.length > 0 && (
                  <ul className="text-[11px] mt-2 space-y-0.5 leading-tight opacity-95">
                    {top.slice(0, 4).map((c) => (
                      <li key={c} className="truncate">{c}</li>
                    ))}
                  </ul>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Off-frame strip */}
      <div className="mt-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
          Off-frame · capital not captured in the main count above
        </div>
        <div className="flex gap-2 border border-dashed border-border p-2">
          {offFrame.map((c) => {
            const raw = clusterValues.get(c.id) ?? 0;
            const w = offTotal > 0 ? Math.max(12, (Math.max(raw, 5) / offTotal) * 100) : 25;
            const isPlaceholder = raw === 0;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setOpened(c.id)}
                className="text-white text-left p-2 overflow-hidden hover:ring-2 hover:ring-primary focus:outline-none focus:ring-2 focus:ring-primary"
                style={{
                  width: `${w}%`,
                  background: c.color,
                  opacity: isPlaceholder ? 0.55 : 1,
                  transition: 'all 600ms cubic-bezier(.4,0,.2,1)',
                }}
              >
                <div className="text-[11px] font-semibold leading-tight">{c.label}</div>
                <div className="text-[10px] opacity-80 font-mono mt-0.5">
                  {isPlaceholder ? '—' : formatValue(raw, sigDef.unit)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Family legend */}
      <div className="flex flex-wrap gap-3 mt-4 text-[10px] font-mono text-muted-foreground">
        {FAMILY_ORDER.map((f) => {
          const cluster = LS_CLUSTERS.find((c) => c.family === f);
          if (!cluster) return null;
          return (
            <span key={f} className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block w-3 h-3" style={{ background: cluster.color }} />
              {LS_FAMILY_LABELS[f]}
            </span>
          );
        })}
      </div>

      {opened && (
        <ClusterDetail
          clusterId={opened}
          signal={signal}
          value={clusterValues.get(opened) ?? 0}
          onClose={() => setOpened(null)}
        />
      )}
    </div>
  );
}

function ClusterDetail({
  clusterId,
  signal,
  value,
  onClose,
}: {
  clusterId: string;
  signal: SignalKey;
  value: number;
  onClose: () => void;
}) {
  const cluster = LS_CLUSTERS.find((c) => c.id === clusterId);
  const sigDef = SIGNALS.find((s) => s.key === signal)!;
  if (!cluster) return null;

  // Sort by relevance to active signal first (highest $ / matching events), then date desc.
  const entries = [...LS_BUBBLES.filter((b) => b.cluster === clusterId)].sort((a, b) => {
    const score = (e: LSBubble) => (sigDef.match(e) ? sigDef.weigh(e) : 0);
    const diff = score(b) - score(a);
    if (diff !== 0) return diff;
    return (b.d ?? 0) - (a.d ?? 0);
  });

  const players = new Set(entries.map((e) => e.c)).size;

  return (
    <div
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-4 border-b border-border" style={{ background: cluster.color }}>
          <div className="flex-1 text-white">
            <div className="text-[10px] font-mono uppercase tracking-widest opacity-80">
              {LS_FAMILY_LABELS[cluster.family]}
              {cluster.offFrame && ' · off-frame'}
            </div>
            <h3 className="text-lg font-semibold leading-tight mt-0.5">{cluster.label}</h3>
            <div className="text-[11px] opacity-90 mt-1 font-mono">
              {sigDef.short}: <span className="font-bold">{formatValue(value, sigDef.unit)}</span>
              <span className="mx-2 opacity-60">·</span>
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} · {players} {players === 1 ? 'company' : 'companies'}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-white/80 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-border">
          {entries.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No tracked entries in this cluster yet.
            </div>
          ) : (
            entries.map((e, i) => {
              const yr = Math.floor(e.d);
              const mo = e.dateGranularity === 'year' ? '' : ` · ${e.d.toFixed(2)}`;
              const amt = e.a > 0
                ? e.a >= 1000
                  ? `$${(e.a / 1000).toFixed(1)}B`
                  : `$${Math.round(e.a)}M`
                : null;
              return (
                <div key={i} className="p-3 hover:bg-muted/40">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <div className="font-semibold text-sm text-foreground">{e.c}</div>
                    <div className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                      {yr}{mo}
                    </div>
                  </div>
                  {e.p && (
                    <div className="text-[11px] text-primary mb-1">{e.p}</div>
                  )}
                  <div className="text-[12px] text-muted-foreground leading-snug mb-1.5">
                    {e.desc}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 border border-border bg-secondary text-foreground">
                      {LS_ET_LABELS[e.et] || e.et}
                    </span>
                    {amt && (
                      <span className="text-[10px] px-1.5 py-0.5 border border-primary/30 text-primary">
                        {amt}
                      </span>
                    )}
                    {e.geo && (
                      <span className="text-[10px] px-1.5 py-0.5 border border-border text-muted-foreground">
                        {e.geo}
                      </span>
                    )}
                    {e.src && (
                      <a
                        href={e.src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> source
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
