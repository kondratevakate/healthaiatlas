import { useEffect, useMemo, useRef, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import {
  LS_BUBBLES,
  LS_CLUSTERS,
  LS_FAMILY_LABELS,
  type LSCluster,
  type LSClusterFamily,
} from '@/data/aiLifeSciences';
import { LS_CPT_CODES } from '@/data/aiLifeSciencesCPT';
import { LS_FDA_TOTAL, LS_FDA_CPT_COVERED, LS_FDA_UPDATED, LS_FDA_BY_SPECIALTY } from '@/data/aiLifeSciencesFDA';
import { squarifiedTreemap } from '@/lib/squarifiedTreemap';
import { cn } from '@/lib/utils';

function clusterRegulatoryCount(cluster: LSCluster): number {
  return LS_BUBBLES.filter((b) =>
    b.cluster === cluster.id && (
      b.et === 'FDA_Clearance' ||
      b.et === 'Regulatory_Milestone' ||
      b.et === 'Regulatory' ||
      (b.et === 'Event' && /fda|510.k|de novo|clearance|ema|nmpa|pmda|approved|approval/i.test(b.desc ?? ''))
    )
  ).length;
}

function formatCount(v: number): string {
  return v === 0 ? '—' : `${v} milestone${v === 1 ? '' : 's'}`;
}

const FAMILY_ORDER: LSClusterFamily[] = ['care_delivery', 'discovery_rd', 'therapeutic', 'ai_infra', 'meta'];

export function RegulatoryView() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [opened, setOpened] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1100, h: 480 });
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = e.contentRect.width;
        setSize({ w, h: Math.max(360, Math.min(560, w * 0.48)) });
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const inFrame  = useMemo(() => LS_CLUSTERS.filter((c) => !c.offFrame), []);
  const offFrame = useMemo(() => LS_CLUSTERS.filter((c) => c.offFrame), []);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of LS_CLUSTERS) m.set(c.id, clusterRegulatoryCount(c));
    return m;
  }, []);

  const sized = useMemo(() => {
    const raw = inFrame.map((c) => ({ id: c.id, raw: counts.get(c.id) ?? 0 }));
    const largest = Math.max(1, ...raw.map((r) => r.raw));
    return raw.map(({ id, raw }) => ({
      id, raw,
      value: raw === 0 ? largest * 0.06 : Math.max(raw, largest * 0.04),
      isPlaceholder: raw === 0,
    }));
  }, [counts, inFrame]);

  const layout = useMemo(
    () => squarifiedTreemap(sized.map((s) => ({ id: s.id, value: s.value })), size.w, size.h),
    [sized, size.w, size.h],
  );

  const offTotal = offFrame.reduce((s, c) => s + Math.max(counts.get(c.id) ?? 0, 1), 0);

  useEffect(() => {
    if (!opened) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpened(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [opened]);

  const activeCpts = LS_CPT_CODES.filter((c) => !c.deleted).length;
  const cptWithRate = LS_CPT_CODES.filter((c) => !c.deleted && c.rateUsd).length;

  return (
    <div>
      {/* FDA × CPT coverage banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <div className="border border-border p-3">
          <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">FDA AI devices</div>
          <div className="text-xl font-bold font-mono text-foreground mt-0.5">{LS_FDA_TOTAL.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">cleared · as of {LS_FDA_UPDATED}</div>
        </div>
        <div className="border border-border p-3">
          <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">With CPT billing code</div>
          <div className="text-xl font-bold font-mono text-foreground mt-0.5">{LS_FDA_CPT_COVERED.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{Math.round(LS_FDA_CPT_COVERED / LS_FDA_TOTAL * 100)}% of cleared devices</div>
        </div>
        <div className="border border-border p-3">
          <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Active CPT codes</div>
          <div className="text-xl font-bold font-mono text-foreground mt-0.5">{activeCpts}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">AI-specific billing codes 2026</div>
        </div>
        <div className="border border-border p-3">
          <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">With Medicare rate</div>
          <div className="text-xl font-bold font-mono text-foreground mt-0.5">{cptWithRate}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">published CMS 2026 rates</div>
        </div>
      </div>

      {/* Specialty breakdown */}
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
        FDA clearances by specialty
      </div>
      <div className="flex flex-wrap gap-1.5 mb-5">
        {LS_FDA_BY_SPECIALTY.map((s) => (
          <div key={s.specialty}
            className={cn(
              'border px-2 py-1 text-[10px] font-mono',
              s.hasCptCoverage
                ? 'border-border text-foreground'
                : 'border-border/50 text-muted-foreground/60',
            )}>
            {s.specialty} <span className="font-bold">{s.count}</span>
            {s.hasCptCoverage && <span className="ml-1 text-primary opacity-80">CPT</span>}
          </div>
        ))}
      </div>

      {/* Treemap sized by regulatory milestones */}
      <div
        ref={containerRef}
        className="relative border border-border bg-background overflow-hidden mb-4"
        style={{ width: '100%', height: size.h }}
      >
        {layout.map((rect) => {
          const cluster = inFrame.find((c) => c.id === rect.id)!;
          const raw = counts.get(cluster.id) ?? 0;
          const isPlaceholder = raw === 0;
          const isHovered = hovered === cluster.id;
          const tiny = rect.w < 90 || rect.h < 60;
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
                opacity: isPlaceholder ? 0.4 : 1,
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
                  <div className="text-[10px] opacity-80 font-mono mt-0.5">{formatCount(raw)}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Off-frame */}
      <div className="flex gap-2 border border-dashed border-border p-2 mb-6">
        {offFrame.map((c) => {
          const raw = counts.get(c.id) ?? 0;
          const w = offTotal > 0 ? Math.max(12, (Math.max(raw, 1) / offTotal) * 100) : 25;
          return (
            <button key={c.id} type="button" onClick={() => setOpened(c.id)}
              className="text-white text-left p-2 overflow-hidden hover:ring-2 hover:ring-primary"
              style={{ width: `${w}%`, background: c.color, opacity: raw === 0 ? 0.4 : 1 }}>
              <div className="text-[11px] font-semibold">{c.label}</div>
              <div className="text-[10px] opacity-80 font-mono">{formatCount(raw)}</div>
            </button>
          );
        })}
      </div>

      {/* CPT codes table */}
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
        Insurance billing codes (CPT · CMS Medicare 2026)
      </div>
      <div className="border border-border overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-3 py-2 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Code</th>
              <th className="text-left px-3 py-2 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Description</th>
              <th className="text-left px-3 py-2 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Specialty</th>
              <th className="text-right px-3 py-2 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Medicare rate</th>
              <th className="px-3 py-2 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Cat.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {LS_CPT_CODES.filter((c) => !c.deleted).map((c) => (
              <tr key={c.code} className={cn('hover:bg-muted/20', c.rateUsd && 'font-medium')}>
                <td className="px-3 py-2 font-mono text-foreground whitespace-nowrap">
                  <a href={c.src} target="_blank" rel="noopener noreferrer"
                    className="hover:text-primary hover:underline inline-flex items-center gap-1">
                    {c.code} <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                  </a>
                </td>
                <td className="px-3 py-2 text-muted-foreground max-w-xs">{c.short}</td>
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{c.specialty}</td>
                <td className="px-3 py-2 font-mono text-right whitespace-nowrap">
                  {c.rateUsd ? (
                    <span className="text-primary">${c.rateUsd.toLocaleString()}</span>
                  ) : (
                    <span className="text-muted-foreground/50">TBD</span>
                  )}
                </td>
                <td className="px-3 py-2 text-muted-foreground text-center">{c.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
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

      {opened && <RegulatoryDetail clusterId={opened} onClose={() => setOpened(null)} />}
    </div>
  );
}

function RegulatoryDetail({ clusterId, onClose }: { clusterId: string; onClose: () => void }) {
  const cluster = LS_CLUSTERS.find((c) => c.id === clusterId);
  if (!cluster) return null;

  const entries = LS_BUBBLES.filter((b) =>
    b.cluster === clusterId && (
      b.et === 'FDA_Clearance' || b.et === 'Regulatory_Milestone' || b.et === 'Regulatory' ||
      (b.et === 'Event' && /fda|510.k|de novo|clearance|ema|nmpa|pmda|approved|approval/i.test(b.desc ?? ''))
    )
  ).sort((a, b) => (b.d ?? 0) - (a.d ?? 0));

  const clusterCpts = LS_CPT_CODES.filter((c) => c.cluster === clusterId && !c.deleted);

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background border border-border max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3 p-4 border-b border-border" style={{ background: cluster.color }}>
          <div className="flex-1 text-white">
            <h3 className="text-lg font-semibold">{cluster.label}</h3>
            <div className="text-[11px] opacity-90 font-mono mt-0.5">
              {entries.length} regulatory milestones · {clusterCpts.length} CPT codes
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {clusterCpts.length > 0 && (
          <div className="px-4 py-3 border-b border-border bg-muted/20">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">CPT billing codes</div>
            <div className="flex flex-wrap gap-2">
              {clusterCpts.map((c) => (
                <a key={c.code} href={c.src} target="_blank" rel="noopener noreferrer"
                  className="inline-flex flex-col border border-border bg-background px-2 py-1 hover:border-primary transition-colors">
                  <span className="text-[11px] font-mono font-bold text-foreground">{c.code}</span>
                  <span className="text-[10px] text-muted-foreground max-w-[160px] truncate">{c.short}</span>
                  {c.rateUsd && <span className="text-[10px] font-mono text-primary">${c.rateUsd.toLocaleString()}</span>}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-y-auto flex-1 divide-y divide-border">
          {entries.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">No regulatory milestones tracked for this cluster.</p>
          ) : entries.map((e, i) => (
            <div key={i} className="p-3 hover:bg-muted/30">
              <div className="flex items-baseline justify-between gap-2 mb-0.5">
                <span className="text-sm font-medium text-foreground">{e.c}</span>
                <span className="text-[10px] font-mono text-muted-foreground">{Math.floor(e.d)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug mb-1">{e.desc}</p>
              {e.src && (
                <a href={e.src} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                  <ExternalLink className="w-3 h-3" /> source
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
