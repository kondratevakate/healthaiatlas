import { useMemo, useState, useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import {
  RECENT_SIGNALS,
  RS_ACTION_LABELS,
  type RecentSignal,
  type RSAction,
} from '@/data/aiLifeSciencesRecentSignals';
import rawJobs from '@/data/jobsData.json';
import { cn } from '@/lib/utils';

// ── Hiring board data ────────────────────────────────────────────────────────
interface JobEntry {
  company: string; category: string; count: number | null;
  count_raw: string; roles: string; location: string;
  remote: string; url: string; status: string; active: boolean;
}
const ALL_JOBS = rawJobs as JobEntry[];

// Life-sciences-relevant categories shown in the hub
const LS_CATS = new Set([
  'AI Research', 'AI Drug Discovery', 'AI Lab Automation', 'Pharma AI',
  'AI Biotech', 'Genomic AI', 'Brain-Computer Interface', 'Pathology AI',
  'Radiology AI', 'Surgical Robotics', 'Cardiovascular AI',
]);

// Companies active in the life sciences landscape that are hiring
const LS_HIRING = ALL_JOBS.filter(j =>
  j.active && (LS_CATS.has(j.category) || j.category === 'Other'),
).sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

// Category markers — monochrome (kate-ui-taste: no color for category
// differentiation). Signal status/risk uses traffic-light tokens elsewhere.
const CAT_DOT = 'bg-muted-foreground/40';

function CatDot() {
  return <span className={cn('inline-block w-1.5 h-1.5 rounded-full flex-shrink-0', CAT_DOT)} aria-hidden="true" />;
}

// ── Signal type taxonomy ────────────────────────────────────────────────────
type SignalType = 'all' | 'capital' | 'research' | 'talent' | 'clinical' | 'hiring';

interface SignalTypeDef {
  key: SignalType;
  label: string;
  icon: string;
  actions: RSAction[];
}

const SIGNAL_TYPES: SignalTypeDef[] = [
  { key: 'all',        label: 'All',        icon: '', actions: [] },
  { key: 'capital',   label: 'Capital',    icon: '', actions: ['acquisition', 'investment', 'pharma_deal', 'partnership', 'ipo', 'mega_raise', 'pre_seed'] },
  { key: 'research',  label: 'Research',   icon: '', actions: ['open_source', 'product_launch', 'stealth_launch'] },
  { key: 'talent',    label: 'Talent',     icon: '', actions: ['strategic_hire', 'cohort'] },
  { key: 'clinical',  label: 'Clinical',   icon: '', actions: ['clinical_validation'] },
  { key: 'hiring',   label: 'Hiring',     icon: '', actions: [] },
];

function getSignalType(s: RecentSignal): SignalType {
  for (const t of SIGNAL_TYPES) {
    if (t.key === 'all') continue;
    if ((t.actions as string[]).includes(s.action)) return t.key;
  }
  return 'capital';
}

// ── Colors ──────────────────────────────────────────────────────────────────
const ACTION_COLOR: Record<string, string> = {
  acquisition:        'hsl(0 65% 45%)',
  pharma_deal:        'hsl(180 70% 38%)',
  partnership:        'hsl(180 35% 50%)',
  investment:         'hsl(265 45% 50%)',
  mega_raise:         'hsl(215 55% 45%)',
  ipo:                'hsl(45 75% 45%)',
  stealth_launch:     'hsl(200 40% 50%)',
  product_launch:     'hsl(200 40% 50%)',
  clinical_validation:'hsl(150 50% 38%)',
  pre_seed:           'hsl(0 0% 55%)',
  open_source:        'hsl(0 0% 40%)',
  strategic_hire:     'hsl(30 60% 45%)',
  cohort:             'hsl(0 0% 55%)',
};

// ── Formatters ──────────────────────────────────────────────────────────────
const formatUsd = (m: number | null): string => {
  if (m == null || m === 0) return '—';
  if (m >= 1000) return `$${(m / 1000).toFixed(1)}B`;
  if (m >= 1) return `$${Math.round(m)}M`;
  return `$${m.toFixed(1)}M`;
};

const formatDate = (iso: string): string => {
  const [y, mo] = iso.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[Number(mo) - 1] || ''} ${y}`;
};

// ── LensCard (Capital sub-lenses) ────────────────────────────────────────────
function LensCard({ title, caption, signals }: {
  title: string; caption: string; signals: RecentSignal[];
}) {
  const total = signals.reduce((s, r) => s + (r.dealSizeUsdM || 0), 0);
  return (
    <div className="border border-border bg-background flex flex-col">
      <div className="border-b border-border px-3 py-2 flex items-baseline justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">{title}</h4>
        <span className="text-[10px] font-mono text-muted-foreground">
          {signals.length} · {formatUsd(total)}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground px-3 pt-2 pb-1 leading-snug">{caption}</p>
      <ul className="flex flex-col">
        {signals.map((s) => (
          <li key={s.id} className="border-t border-border px-3 py-2.5">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">{formatDate(s.date)}</span>
                <span className="text-xs font-semibold text-foreground truncate">{s.target}</span>
                {!s.isBio && (
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground border border-border px-1 shrink-0">
                    non-bio
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-primary shrink-0">{formatUsd(s.dealSizeUsdM)}</span>
            </div>
            <div className="text-[11px] text-muted-foreground leading-snug mb-1.5">
              <span className="text-foreground/80">{s.actor}</span> · {s.dealSizeLabel}
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug line-clamp-3 mb-1.5">{s.qualitySignal}</p>
            <a href={s.src} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
              <ExternalLink className="w-3 h-3" /> Source
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Simple signal list (Research / Talent / Regulatory / Clinical) ───────────
function SignalList({ signals }: { signals: RecentSignal[] }) {
  if (signals.length === 0) {
    return (
      <p className="text-[11px] text-muted-foreground py-6 text-center border border-border">
        No signals of this type in the current dataset.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-border border border-border">
      {signals.map((s) => (
        <li key={s.id} className="px-3 py-2.5 hover:bg-muted/30">
          <div className="flex items-baseline justify-between gap-2 mb-0.5">
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-[10px] font-mono text-muted-foreground shrink-0">{formatDate(s.date)}</span>
              <span className="text-xs font-semibold text-foreground truncate">{s.target}</span>
            </div>
            <span className="text-[9px] font-mono border border-border px-1 text-muted-foreground shrink-0">
              {RS_ACTION_LABELS[s.action]}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground leading-snug mb-1">
            <span className="text-foreground/80">{s.actor}</span> · {s.qualitySignal}
          </div>
          <a href={s.src} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
            <ExternalLink className="w-3 h-3" /> Source
          </a>
        </li>
      ))}
    </ul>
  );
}

// ── Hiring board ─────────────────────────────────────────────────────────────
function HiringBoard() {
  const total = LS_HIRING.length;
  const knownRoles = LS_HIRING.filter(j => j.count).reduce((s, j) => s + (j.count ?? 0), 0);

  return (
    <div>
      {/* Summary row */}
      <div className="flex gap-4 mb-4 text-[11px] font-mono text-muted-foreground">
        <span><span className="text-foreground font-semibold">{total}</span> companies hiring</span>
        <span><span className="text-foreground font-semibold">{knownRoles}+</span> verified open roles</span>
      </div>

      {/* Board */}
      <div className="border border-border divide-y divide-border">
        {LS_HIRING.map(j => {
          const roles = j.roles
            ? j.roles.split(/[;,]/).map(r => r.trim()).filter(Boolean).slice(0, 3)
            : [];
          return (
            <div key={j.company}
              className="flex items-start gap-3 px-3 py-2.5 hover:bg-muted/30 transition-colors"
            >
              {/* Category marker (monochrome) */}
              <CatDot />

              {/* Main content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-foreground">{j.company}</span>
                  <span className="text-[10px] text-muted-foreground">{j.category}</span>
                  {j.count !== null && (
                    <span className="text-[10px] font-mono text-primary">
                      {j.count} roles
                    </span>
                  )}
                </div>
                {roles.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {roles.map(r => (
                      <span key={r}
                        className="text-[9px] px-1 py-0.5 border border-border text-muted-foreground bg-secondary">
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Link */}
              {j.url && (
                <a href={j.url} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
                  aria-label={`${j.company} careers`}>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-[10px] text-muted-foreground/60">
        Snapshot May 2026 · <a href="/jobs" className="underline underline-offset-2 hover:text-foreground">Full jobs board →</a>
      </div>
    </div>
  );
}

// ── Main view ────────────────────────────────────────────────────────────────
export function RecentSignalsView() {
  const [type, setType] = useState<SignalType>('all');
  const [hovered, setHovered] = useState<string | null>(null);

  const filtered = useMemo(
    () => type === 'all' ? RECENT_SIGNALS : RECENT_SIGNALS.filter((s) => getSignalType(s) === type),
    [type],
  );

  const barRows = useMemo(() => {
    const sized = filtered.filter((s) => s.dealSizeUsdM != null && s.dealSizeUsdM > 0);
    const unsized = filtered.filter((s) => !s.dealSizeUsdM);
    sized.sort((a, b) => (b.dealSizeUsdM || 0) - (a.dealSizeUsdM || 0));
    unsized.sort((a, b) => b.date.localeCompare(a.date));
    return [...sized, ...unsized];
  }, [filtered]);

  // Counts per type for badge
  const typeCounts = useMemo(() => {
    const m: Partial<Record<SignalType, number>> = {};
    for (const s of RECENT_SIGNALS) {
      const t = getSignalType(s);
      m[t] = (m[t] ?? 0) + 1;
    }
    return m;
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(900);
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) setContainerW(e.contentRect.width);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const maxUsdM = useMemo(
    () => Math.max(...barRows.map((s) => s.dealSizeUsdM || 0), 1),
    [barRows],
  );
  const labelW = 220;
  const valueW = 80;
  const chartW = Math.max(360, containerW - labelW - valueW - 24);
  const rowH = 22;
  const svgH = barRows.length * rowH + 16;
  const widthFor = (m: number | null): number => {
    if (!m || m <= 0) return 14;
    return Math.max(2, (Math.log10(1 + m) / Math.log10(1 + maxUsdM)) * chartW * 0.95);
  };

  return (
    <div>
      {/* Type filter */}
      <div className="flex flex-wrap gap-1 mb-4 items-center">
        {SIGNAL_TYPES.map((t) => {
          const count = t.key === 'hiring'
            ? LS_HIRING.length
            : t.key === 'all' ? RECENT_SIGNALS.length : (typeCounts[t.key] ?? 0);
          return (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              className={cn(
                'px-2 py-1 text-[11px] font-mono border transition-colors',
                type === t.key
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
              <span className={cn('text-[9px] ml-1', type === t.key ? 'opacity-60' : 'opacity-40')}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hiring board — replaces bar chart when hiring tab is active */}
      {type === 'hiring' && <HiringBoard />}

      {/* Bar chart */}
      {type !== 'hiring' && (
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
          Scale of deals (log scale · click bar for source)
        </div>
      )}
      {type !== 'hiring' && (
        <div ref={containerRef} className="border border-border mb-6 overflow-x-auto">
          <svg width={labelW + chartW + valueW + 16} height={Math.max(svgH, 40)} className="block">
            <defs>
              <pattern id="hatch-undisclosed" patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
                <line x1={0} y1={0} x2={0} y2={6} stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeOpacity={0.4} />
              </pattern>
            </defs>
            {barRows.map((s, i) => {
              const y = i * rowH + 8;
              const w = widthFor(s.dealSizeUsdM);
              const color = ACTION_COLOR[s.action] || 'hsl(var(--muted-foreground))';
              const undisclosed = !s.dealSizeUsdM;
              const isHover = hovered === s.id;
              return (
                <g key={s.id} className="cursor-pointer"
                  onMouseEnter={() => setHovered(s.id)} onMouseLeave={() => setHovered(null)}
                  onClick={() => window.open(s.src, '_blank')}>
                  <rect x={0} y={y - rowH/2 + 4} width={labelW + chartW + valueW + 16} height={rowH - 6}
                    fill={isHover ? 'hsl(var(--muted))' : 'transparent'} />
                  <text x={labelW - 6} y={y + 4} textAnchor="end" className="fill-foreground text-[10px]">
                    <tspan className="font-semibold">{s.actor}</tspan>
                    <tspan className="fill-muted-foreground"> → {s.target.length > 22 ? s.target.slice(0,20)+'…' : s.target}</tspan>
                  </text>
                  <rect x={labelW} y={y - 7} width={w} height={14}
                    fill={undisclosed ? 'url(#hatch-undisclosed)' : color}
                    fillOpacity={isHover ? 0.95 : 0.78}
                    stroke={color} strokeWidth={undisclosed ? 1 : 0} />
                  <text x={labelW + chartW + 6} y={y - 1} className="fill-foreground text-[10px] font-mono font-semibold">
                    {formatUsd(s.dealSizeUsdM)}
                  </text>
                  <text x={labelW + chartW + 6} y={y + 9} className="fill-muted-foreground text-[9px] font-mono">
                    {formatDate(s.date)} · {RS_ACTION_LABELS[s.action]}
                  </text>
                  {isHover && (
                    <foreignObject x={labelW + Math.min(w + 6, chartW - 280)} y={Math.max(0, y - 60)} width={300} height={170}>
                      <div className="bg-background border border-border p-2 text-[10px] leading-tight shadow-lg">
                        <div className="font-bold text-foreground">{s.actor} → {s.target}</div>
                        <div className="text-primary text-[9px] mt-0.5">{s.dealSizeLabel}</div>
                        <div className="text-muted-foreground mt-1 line-clamp-5">{s.qualitySignal}</div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          <span className="text-[9px] px-1 border border-border bg-secondary">{RS_ACTION_LABELS[s.action]}</span>
                          {s.geo && <span className="text-[9px] px-1 border border-border text-muted-foreground">{s.geo}</span>}
                          {!s.isBio && <span className="text-[9px] px-1 border border-border text-muted-foreground">non-bio</span>}
                        </div>
                        <div className="text-primary text-[9px] mt-1 font-semibold">🔗 Click bar to open source</div>
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
            {barRows.length === 0 && (
              <text x={20} y={28} className="fill-muted-foreground text-[11px]">No signals match this filter.</text>
            )}
          </svg>
        </div>
      )}

      {/* Newsfeed */}
      {type !== 'hiring' && <SignalList signals={filtered} />}
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border border-border p-2.5">
      <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-lg font-bold text-foreground tabular-nums leading-tight mt-0.5">{value}</div>
      <div className="text-[10px] text-muted-foreground leading-snug mt-0.5">{sub}</div>
    </div>
  );
}
