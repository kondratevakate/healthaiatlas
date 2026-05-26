import { useEffect, useMemo, useRef, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import {
  LS_BUBBLES,
  LS_CLUSTERS,
  LS_FAMILY_LABELS,
  type LSBubble,
  type LSCluster,
  type LSClusterFamily,
} from '@/data/aiLifeSciences';
import { LS_REVENUE } from '@/data/aiLifeSciencesRevenue';
import { squarifiedTreemap } from '@/lib/squarifiedTreemap';
import { cn } from '@/lib/utils';

// Only AI-product revenue (scope=product).
const REVENUE_BY_SLUG = new Map(
  LS_REVENUE.filter((r) => r.scope === 'product').map((r) => [r.slug, r]),
);

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const isExcluded = (t: string) => t === 'regulator' || t.startsWith('pharma');

function clusterRevenue(cluster: LSCluster): number {
  const seen = new Set<string>();
  let total = 0;
  for (const b of LS_BUBBLES.filter((b) => b.cluster === cluster.id)) {
    if (isExcluded(b.entityType ?? '')) continue;
    if (seen.has(b.c)) continue;
    seen.add(b.c);
    total += REVENUE_BY_SLUG.get(toSlug(b.c))?.revenue_m ?? 0;
  }
  return total;
}

function formatRev(v: number): string {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}B`;
  if (v >= 1) return `$${v.toFixed(0)}M`;
  return v > 0 ? '<$1M' : '—';
}

const FAMILY_ORDER: LSClusterFamily[] = ['care_delivery', 'discovery_rd', 'therapeutic', 'ai_infra', 'meta'];

export function RevenueView() {
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

  const inFrame  = useMemo(() => LS_CLUSTERS.filter((c) => !c.offFrame), []);
  const offFrame = useMemo(() => LS_CLUSTERS.filter((c) => c.offFrame), []);

  const revenues = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of LS_CLUSTERS) m.set(c.id, clusterRevenue(c));
    return m;
  }, []);

  const sized = useMemo(() => {
    const raw = inFrame.map((c) => ({ id: c.id, raw: revenues.get(c.id) ?? 0 }));
    const largest = Math.max(1, ...raw.map((r) => r.raw));
    return raw.map(({ id, raw }) => ({
      id, raw,
      value: raw === 0 ? largest * 0.06 : Math.max(raw, largest * 0.04),
      isPlaceholder: raw === 0,
    }));
  }, [revenues, inFrame]);

  const layout = useMemo(
    () => squarifiedTreemap(sized.map((s) => ({ id: s.id, value: s.value })), size.w, size.h),
    [sized, size.w, size.h],
  );

  // Top revenue companies per cluster
  const topByRevenue = useMemo(() => {
    const m = new Map<string, { name: string; rev: number }[]>();
    for (const c of LS_CLUSTERS) {
      const seen = new Set<string>();
      const entries: { name: string; rev: number }[] = [];
      for (const b of LS_BUBBLES.filter((b) => b.cluster === c.id)) {
        if (isExcluded(b.entityType ?? '') || seen.has(b.c)) continue;
        seen.add(b.c);
        const r = REVENUE_BY_SLUG.get(toSlug(b.c));
        if (r) entries.push({ name: b.c, rev: r.revenue_m });
      }
      m.set(c.id, entries.sort((a, b) => b.rev - a.rev).slice(0, 5));
    }
    return m;
  }, []);

  const offTotal = offFrame.reduce((s, c) => s + Math.max(revenues.get(c.id) ?? 0, 5), 0);

  useEffect(() => {
    if (!opened) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpened(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [opened]);

  const totalProductRevenue = useMemo(() =>
    [...revenues.values()].reduce((a, b) => a + b, 0), [revenues]);

  return (
    <div>
      <p className="text-[11px] text-muted-foreground mb-3">
        AI-product revenue per cluster — scope excludes total-company figures (big pharma, Intuitive Surgical, Epic).
        Bottom-up sum: <span className="font-mono text-foreground">{formatRev(totalProductRevenue)}</span> across{' '}
        {REVENUE_BY_SLUG.size} companies with disclosed revenue.
        Click any cluster to see company breakdown.
      </p>

      {/* Treemap */}
      <div
        ref={containerRef}
        className="relative border border-border bg-background overflow-hidden"
        style={{ width: '100%', height: size.h }}
      >
        {layout.map((rect) => {
          const cluster = inFrame.find((c) => c.id === rect.id)!;
          const raw = revenues.get(cluster.id) ?? 0;
          const isPlaceholder = raw === 0;
          const top = topByRevenue.get(cluster.id) ?? [];
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
                opacity: isPlaceholder ? 0.45 : 1,
                outline: isHovered ? '2px solid hsl(var(--primary))' : '1px solid rgba(0,0,0,0.25)',
                outlineOffset: isHovered ? '-2px' : '0',
                transition: 'all 600ms cubic-bezier(.4,0,.2,1)',
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
                    {isPlaceholder ? 'no disclosed revenue' : formatRev(raw)}
                  </div>
                )}
                {!compact && top.length > 0 && (
                  <ul className="text-[11px] mt-2 space-y-0.5 leading-tight opacity-95">
                    {top.slice(0, 4).map((e) => (
                      <li key={e.name} className="truncate">
                        {e.name} <span className="opacity-70 font-mono text-[10px]">{formatRev(e.rev)}</span>
                      </li>
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
          Off-frame
        </div>
        <div className="flex gap-2 border border-dashed border-border p-2">
          {offFrame.map((c) => {
            const raw = revenues.get(c.id) ?? 0;
            const w = offTotal > 0 ? Math.max(12, (Math.max(raw, 5) / offTotal) * 100) : 25;
            return (
              <button key={c.id} type="button" onClick={() => setOpened(c.id)}
                className="text-white text-left p-2 overflow-hidden hover:ring-2 hover:ring-primary"
                style={{ width: `${w}%`, background: c.color, opacity: raw === 0 ? 0.45 : 1 }}>
                <div className="text-[11px] font-semibold">{c.label}</div>
                <div className="text-[10px] opacity-80 font-mono">{raw > 0 ? formatRev(raw) : '—'}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Family legend */}
      <div className="flex flex-wrap gap-3 mt-4 text-[10px] font-mono text-muted-foreground">
        {FAMILY_ORDER.map((f) => {
          const c = LS_CLUSTERS.find((c) => c.family === f);
          if (!c) return null;
          return (
            <span key={f} className="inline-flex items-center gap-1.5">
              <span className="inline-block w-3 h-3" style={{ background: c.color }} />
              {LS_FAMILY_LABELS[f]}
            </span>
          );
        })}
      </div>

      {opened && <RevenueDetail clusterId={opened} onClose={() => setOpened(null)} />}
    </div>
  );
}

function RevenueDetail({ clusterId, onClose }: { clusterId: string; onClose: () => void }) {
  const cluster = LS_CLUSTERS.find((c) => c.id === clusterId);
  if (!cluster) return null;

  const companies: { name: string; rev: number; unit: string; year: number; conf: string; src: string }[] = [];
  const seen = new Set<string>();
  for (const b of LS_BUBBLES.filter((b) => b.cluster === clusterId)) {
    if (isExcluded(b.entityType ?? '') || seen.has(b.c)) continue;
    seen.add(b.c);
    const r = REVENUE_BY_SLUG.get(toSlug(b.c));
    if (r) companies.push({ name: b.c, rev: r.revenue_m, unit: r.unit, year: r.year, conf: r.confidence, src: '' });
  }
  companies.sort((a, b) => b.rev - a.rev);

  const total = companies.reduce((s, c) => s + c.rev, 0);

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background border border-border max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3 p-4 border-b border-border" style={{ background: cluster.color }}>
          <div className="flex-1 text-white">
            <h3 className="text-lg font-semibold">{cluster.label}</h3>
            <div className="text-[11px] opacity-90 font-mono mt-0.5">
              {formatRev(total)} disclosed · {companies.length} companies with revenue data
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 divide-y divide-border">
          {companies.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">No disclosed revenue data for this cluster.</p>
          ) : companies.map((c) => (
            <div key={c.name} className="px-4 py-2.5 flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <span className="text-sm font-medium text-foreground">{c.name}</span>
                <span className="ml-2 text-[10px] text-muted-foreground font-mono">
                  {c.year} · {c.unit === 'arr_usd_m' ? 'ARR' : 'Revenue'} · {c.conf}
                </span>
              </div>
              <span className="text-sm font-mono text-primary shrink-0">{formatRev(c.rev)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
