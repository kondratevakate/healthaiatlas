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
import { squarifiedTreemap } from '@/lib/squarifiedTreemap';
import { cn } from '@/lib/utils';

type SignalKey =
  | 'revenue_usd_m'
  | 'vc_disclosed_usd_m'
  | 'ma_value_usd_m'
  | 'fda_clearances'
  | 'pharma_deal_value_usd_m'
  | 'event_count';

interface SignalDef {
  key: SignalKey;
  label: string;
  short: string;
  unit: 'usd_m' | 'count';
  caption: string;
}

const SIGNALS: SignalDef[] = [
  {
    key: 'revenue_usd_m',
    label: 'Commercial scale (revenue 2025)',
    short: 'Revenue',
    unit: 'usd_m',
    caption:
      'Diagnostics dominates revenue because ~75% of FDA-cleared AI medical devices live there. Drug discovery has very little revenue today — its signal lives on the VC tab.',
  },
  {
    key: 'vc_disclosed_usd_m',
    label: 'VC raised 2022–26',
    short: 'VC raised',
    unit: 'usd_m',
    caption:
      'Where VC is going right now. Drug discovery, hospital ops/scribes and clinical AI agents pull the largest disclosed checks; mature segments (diagnostics, surgical robotics) raise far less per year despite owning most of today’s revenue.',
  },
  {
    key: 'ma_value_usd_m',
    label: 'M&A deal value',
    short: 'M&A',
    unit: 'usd_m',
    caption:
      'Where strategic buyers are placing bets early. Recursion–Exscientia and BioNTech–InstaDeep dominate the AI drug-discovery row.',
  },
  {
    key: 'fda_clearances',
    label: 'FDA clearances (count)',
    short: 'FDA',
    unit: 'count',
    caption:
      'Regulatory throughput. Diagnostics & imaging is the established beachhead; drug discovery clearances are still a 2025–26 story (Isomorphic ISM8969).',
  },
  {
    key: 'pharma_deal_value_usd_m',
    label: 'Pharma partnership value',
    short: 'Pharma deals',
    unit: 'usd_m',
    caption:
      'Headline upfront + milestone value disclosed in pharma partnerships. Concentrates almost entirely in AI drug discovery — every other cluster underprices its bio-touch.',
  },
  {
    key: 'event_count',
    label: 'Events tracked',
    short: 'Activity',
    unit: 'count',
    caption:
      'Volume of milestones tracked in the dataset (sanity baseline). Larger box = more activity, regardless of dollars.',
  },
];

function formatValue(v: number, unit: 'usd_m' | 'count'): string {
  if (unit === 'count') return v.toLocaleString();
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}B`;
  if (v >= 1) return `$${v.toFixed(0)}M`;
  return v > 0 ? `<$1M` : '—';
}

function getSignal(c: LSCluster, key: SignalKey): number | null {
  const v = c.signals[key];
  return v === null ? null : v;
}

const FAMILY_ORDER: LSClusterFamily[] = ['care_delivery', 'discovery_rd', 'therapeutic', 'ai_infra', 'meta'];

export function ClusterTreemapView() {
  const [signal, setSignal] = useState<SignalKey>('event_count');
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

  // Top entries by signal-of-the-day per cluster
  const topEntries = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const c of LS_CLUSTERS) {
      const entries = LS_BUBBLES.filter((b) => b.cluster === c.id);
      let scored: { c: string; score: number }[];
      if (signal === 'event_count') {
        const counts = new Map<string, number>();
        for (const e of entries) counts.set(e.c, (counts.get(e.c) ?? 0) + 1);
        scored = [...counts.entries()].map(([c, n]) => ({ c, score: n }));
      } else if (signal === 'fda_clearances') {
        const counts = new Map<string, number>();
        for (const e of entries) {
          if (e.et === 'FDA_Clearance' || /FDA_cleared|FDAcleared/.test(e.desc || '')) {
            counts.set(e.c, (counts.get(e.c) ?? 0) + 1);
          }
        }
        scored = [...counts.entries()].map(([c, n]) => ({ c, score: n }));
      } else {
        const sums = new Map<string, number>();
        for (const e of entries) {
          const matches =
            (signal === 'vc_disclosed_usd_m' && e.et === 'Funding_Round') ||
            (signal === 'ma_value_usd_m' && e.et === 'Acquisition') ||
            (signal === 'pharma_deal_value_usd_m' && e.et === 'Pharma_Deal') ||
            signal === 'revenue_usd_m';
          if (matches) sums.set(e.c, (sums.get(e.c) ?? 0) + (e.a ?? 0));
        }
        scored = [...sums.entries()].map(([c, n]) => ({ c, score: n }));
      }
      const top = scored.sort((a, b) => b.score - a.score).slice(0, 5).map((x) => x.c);
      map.set(c.id, top);
    }
    return map;
  }, [signal]);

  const inFrame = useMemo(() => LS_CLUSTERS.filter((c) => !c.offFrame), []);
  const offFrame = useMemo(() => LS_CLUSTERS.filter((c) => c.offFrame), []);

  // Treemap weights with a hard minimum so every cluster stays clickable.
  // Floors:
  //   - null signal (e.g. revenue for pre-revenue clusters): 18% of largest
  //   - zero signal (no data of this type tracked): 8% of largest
  //   - positive signal: floor at 5% of largest so the smallest is still legible
  const sized = useMemo(() => {
    const raw = inFrame.map((c) => ({ id: c.id, raw: getSignal(c, signal) }));
    const largest = Math.max(1, ...raw.map((r) => r.raw ?? 0));
    return raw.map(({ id, raw }) => {
      let value: number;
      let isPlaceholder = false;
      if (raw === null) {
        value = largest * 0.18;
        isPlaceholder = true;
      } else if (raw === 0) {
        value = largest * 0.08;
        isPlaceholder = true;
      } else {
        value = Math.max(raw, largest * 0.05);
      }
      return { id, value, raw, isPlaceholder };
    });
  }, [signal, inFrame]);

  const layout = useMemo(
    () => squarifiedTreemap(sized.map((s) => ({ id: s.id, value: s.value })), size.w, size.h),
    [sized, size.w, size.h],
  );

  const placeholderById = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const s of sized) m.set(s.id, s.isPlaceholder);
    return m;
  }, [sized]);

  // Off-frame as a horizontal strip (proportional widths)
  const offTotal = offFrame.reduce((s, c) => s + Math.max(getSignal(c, signal) ?? 0, 5), 0);

  // Esc closes the detail modal
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
        {SIGNALS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSignal(s.key)}
            className={cn(
              'px-2 py-1 text-[11px] font-mono border transition-colors',
              signal === s.key
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {s.short}
          </button>
        ))}
      </div>

      {/* Caption */}
      <p className="text-[11px] text-muted-foreground leading-relaxed mb-3 italic">
        {sigDef.caption} <span className="not-italic">Click any cluster to read every entry inside.</span>
      </p>

      {/* In-frame treemap */}
      <div
        ref={containerRef}
        className="relative border border-border bg-background overflow-hidden"
        style={{ width: '100%', height: size.h }}
      >
        {layout.map((rect) => {
          const cluster = inFrame.find((c) => c.id === rect.id)!;
          const raw = getSignal(cluster, signal);
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
                    {isPlaceholder ? 'no signal in this dataset' : formatValue(raw!, sigDef.unit)}
                  </div>
                )}
                {!compact && top.length > 0 && (
                  <ul className="text-[11px] mt-2 space-y-0.5 leading-tight opacity-95">
                    {top.slice(0, 4).map((c) => (
                      <li key={c} className="truncate">{c}</li>
                    ))}
                  </ul>
                )}
                {!compact && cluster.highlights.length > 0 && (
                  <ul className="text-[10px] mt-2 space-y-0.5 leading-tight opacity-70 border-t border-white/20 pt-1.5 mt-auto">
                    {cluster.highlights.slice(0, 3).map((h, i) => (
                      <li key={i} className="truncate">· {h}</li>
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
            const raw = getSignal(c, signal);
            const w = offTotal > 0 ? Math.max(12, (Math.max(raw ?? 0, 5) / offTotal) * 100) : 25;
            const isPlaceholder = raw === null || raw === 0;
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
                  {isPlaceholder ? '—' : formatValue(raw!, sigDef.unit)}
                </div>
                <ul className="text-[10px] mt-1 space-y-0.5 leading-tight opacity-90">
                  {c.highlights.slice(0, 2).map((h, i) => (
                    <li key={i} className="truncate">· {h}</li>
                  ))}
                </ul>
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

      {/* Cluster detail modal */}
      {opened && <ClusterDetail clusterId={opened} signal={signal} onClose={() => setOpened(null)} />}
    </div>
  );
}

function ClusterDetail({
  clusterId,
  signal,
  onClose,
}: {
  clusterId: string;
  signal: SignalKey;
  onClose: () => void;
}) {
  const cluster = LS_CLUSTERS.find((c) => c.id === clusterId);
  const sigDef = SIGNALS.find((s) => s.key === signal)!;
  if (!cluster) return null;

  // Sort entries by signal-relevant value (most informative first), then date desc.
  const entries = [...LS_BUBBLES.filter((b) => b.cluster === clusterId)].sort((a, b) => {
    const score = (e: LSBubble) => {
      if (signal === 'vc_disclosed_usd_m' && e.et === 'Funding_Round') return e.a ?? 0;
      if (signal === 'ma_value_usd_m' && e.et === 'Acquisition') return e.a ?? 0;
      if (signal === 'pharma_deal_value_usd_m' && e.et === 'Pharma_Deal') return e.a ?? 0;
      if (signal === 'fda_clearances' && e.et === 'FDA_Clearance') return 1;
      return 0;
    };
    const sa = score(a);
    const sb = score(b);
    if (sa !== sb) return sb - sa;
    return (b.d ?? 0) - (a.d ?? 0);
  });

  const sigVal = cluster.signals[signal];
  const formatted =
    sigVal === null
      ? 'no signal'
      : sigDef.unit === 'count'
      ? sigVal.toLocaleString()
      : sigVal >= 1000
      ? `$${(sigVal / 1000).toFixed(1)}B`
      : `$${sigVal.toFixed(0)}M`;

  return (
    <div
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-4 border-b border-border" style={{ background: cluster.color }}>
          <div className="flex-1 text-white">
            <div className="text-[10px] font-mono uppercase tracking-widest opacity-80">
              {LS_FAMILY_LABELS[cluster.family]}
              {cluster.offFrame && ' · off-frame'}
            </div>
            <h3 className="text-lg font-semibold leading-tight mt-0.5">{cluster.label}</h3>
            <div className="text-[11px] opacity-90 mt-1 font-mono">
              {sigDef.short}: <span className="font-bold">{formatted}</span>
              <span className="mx-2 opacity-60">·</span>
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} · {cluster.companyCount} companies
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

        {/* Highlights */}
        {cluster.highlights.length > 0 && (
          <div className="px-4 pt-3 pb-2 border-b border-border bg-muted/30">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
              Editor’s notes
            </div>
            <ul className="text-[12px] text-foreground space-y-0.5 leading-snug">
              {cluster.highlights.map((h, i) => (
                <li key={i}>· {h}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Entry list */}
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
                    {e.reliability && (
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 border',
                          e.reliability >= 4
                            ? 'border-destructive/40 text-destructive'
                            : 'border-border text-muted-foreground',
                        )}
                      >
                        risk {e.reliability}/5
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
