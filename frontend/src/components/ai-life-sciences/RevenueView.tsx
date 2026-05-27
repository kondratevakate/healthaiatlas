import { useEffect, useMemo, useRef, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import {
  LS_BUBBLES,
  LS_CLUSTERS,
  type LSBubble,
  type LSCluster,
} from '@/data/aiLifeSciences';
import { LS_REVENUE } from '@/data/aiLifeSciencesRevenue';
import { squarifiedTreemap } from '@/lib/squarifiedTreemap';
import { cn } from '@/lib/utils';

// Only AI-product revenue (scope=product).
const REVENUE_BY_SLUG = new Map(
  LS_REVENUE.filter((r) => r.scope === 'product').map((r) => [r.slug, r]),
);

// Revenue-proportional color: higher earnings → darker green, lower → pale mint.
// Zero revenue → neutral placeholder. Log scale spreads a 20×+ revenue range.
function revenueColor(raw: number, maxRaw: number): string {
  if (raw === 0) return 'hsl(220 8% 22%)';
  // log scale: $10M and $1B should be visibly different
  const t = Math.log(raw + 1) / Math.log(maxRaw + 1);
  const s = Math.round(35 + t * 40); // 35% → 75%
  const l = Math.round(72 - t * 50); // 72% (pale) → 22% (deep)
  return `hsl(152 ${s}% ${l}%)`;
}

// Picks readable text color over a given lightness.
function textOn(raw: number, maxRaw: number): string {
  if (raw === 0) return 'rgba(255,255,255,0.85)';
  const t = Math.log(raw + 1) / Math.log(maxRaw + 1);
  const l = 72 - t * 50;
  return l > 50 ? 'hsl(152 60% 12%)' : 'rgba(255,255,255,0.95)';
}

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

  const maxRevenue = useMemo(() =>
    Math.max(1, ...inFrame.map((c) => revenues.get(c.id) ?? 0)), [revenues, inFrame]);

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
        AI-product revenue per cluster — scope excludes total-company figures (big pharma, Intuitive Surgical, Epic).
        Bottom-up sum: <span className="font-mono text-foreground">{formatRev(totalProductRevenue)}</span> across{' '}
        {REVENUE_BY_SLUG.size} companies with disclosed revenue. Click any cluster to see company breakdown.
      </p>
      <p className="text-xs text-muted-foreground/80 mb-5 italic leading-relaxed">
        Caveat: for drug-discovery clusters (Insilico, Recursion, Generate, Formation Bio, Lila, Pathos…), most
        disclosed "revenue" is pharma research-collaboration milestones and platform contracts, not subscription
        product revenue. The numbers are real — the source of the dollars is mixed.
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
              className="absolute overflow-hidden text-left focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary"
              style={{
                left: `${(rect.x / size.w) * 100}%`,
                top: `${(rect.y / size.h) * 100}%`,
                width: `${(rect.w / size.w) * 100}%`,
                height: `${(rect.h / size.h) * 100}%`,
                background: revenueColor(raw, maxRevenue),
                color: textOn(raw, maxRevenue),
                opacity: isPlaceholder ? 0.55 : 1,
                outline: isHovered ? '2px solid hsl(var(--primary))' : '1px solid rgba(0,0,0,0.25)',
                outlineOffset: isHovered ? '-2px' : '0',
                transition: 'all 600ms cubic-bezier(.4,0,.2,1)',
              }}
              onMouseEnter={() => setHovered(cluster.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className={cn('p-3 h-full flex flex-col', tiny && 'p-2')}>
                <div className={cn('font-semibold leading-tight', tiny ? 'text-xs' : 'text-base')}>
                  {cluster.label}
                </div>
                {!tiny && (
                  <div className="text-xs opacity-80 font-mono mt-1">
                    {isPlaceholder ? 'no disclosed revenue' : formatRev(raw)}
                  </div>
                )}
                {!compact && top.length > 0 && (
                  <ul className="text-[13px] mt-2.5 space-y-1 leading-tight opacity-95">
                    {top.slice(0, 4).map((e) => (
                      <li key={e.name} className="truncate">
                        {e.name} <span className="opacity-70 font-mono text-[11px]">{formatRev(e.rev)}</span>
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
        <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
          Off-frame
        </div>
        <div className="flex gap-2 border border-dashed border-border p-2">
          {offFrame.map((c) => {
            const raw = revenues.get(c.id) ?? 0;
            const w = offTotal > 0 ? Math.max(12, (Math.max(raw, 5) / offTotal) * 100) : 25;
            return (
              <button key={c.id} type="button" onClick={() => setOpened(c.id)}
                className="text-left p-2.5 overflow-hidden hover:ring-2 hover:ring-primary"
                style={{
                  width: `${w}%`,
                  background: revenueColor(raw, maxRevenue),
                  color: textOn(raw, maxRevenue),
                  opacity: raw === 0 ? 0.55 : 1,
                }}>
                <div className="text-sm font-semibold leading-tight">{c.label}</div>
                <div className="text-xs opacity-80 font-mono mt-0.5">{raw > 0 ? formatRev(raw) : '—'}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Revenue scale legend */}
      <div className="flex items-center gap-2 mt-4 text-xs font-mono text-muted-foreground">
        <span>lower revenue</span>
        {[0.05, 0.2, 0.4, 0.65, 1].map((t) => (
          <span
            key={t}
            className="inline-block w-6 h-4"
            style={{ background: `hsl(152 ${Math.round(35 + t * 40)}% ${Math.round(72 - t * 50)}%)` }}
          />
        ))}
        <span>higher revenue</span>
        <span className="ml-4 inline-flex items-center gap-1.5">
          <span className="inline-block w-6 h-4" style={{ background: 'hsl(220 8% 22%)' }} />
          no disclosed revenue
        </span>
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
        <div className="flex items-start gap-3 p-4 border-b border-border" style={{ background: 'hsl(152 55% 28%)' }}>
          <div className="flex-1 text-white">
            <h3 className="heading-md">{cluster.label}</h3>
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
