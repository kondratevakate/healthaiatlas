import { useMemo, useState, useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import {
  RECENT_SIGNALS,
  RS_ACTION_LABELS,
  type RecentSignal,
} from '@/data/aiLifeSciencesRecentSignals';
import { cn } from '@/lib/utils';

// Bar color encoded by action — keeps visual link with existing hub palette.
const ACTION_COLOR: Record<string, string> = {
  acquisition: 'hsl(0 65% 45%)',
  pharma_deal: 'hsl(180 70% 38%)',
  partnership: 'hsl(180 35% 50%)',
  investment: 'hsl(265 45% 50%)',
  mega_raise: 'hsl(215 55% 45%)',
  ipo: 'hsl(45 75% 45%)',
  stealth_launch: 'hsl(200 40% 50%)',
  product_launch: 'hsl(200 40% 50%)',
  clinical_validation: 'hsl(150 50% 38%)',
  pre_seed: 'hsl(0 0% 55%)',
  open_source: 'hsl(0 0% 40%)',
  strategic_hire: 'hsl(30 60% 45%)',
  cohort: 'hsl(0 0% 55%)',
};

const formatUsd = (m: number | null): string => {
  if (m == null || m === 0) return '—';
  if (m >= 1000) return `$${(m / 1000).toFixed(1)}B`;
  if (m >= 1) return `$${Math.round(m)}M`;
  return `$${m.toFixed(1)}M`;
};

const formatDate = (iso: string): string => {
  const [y, mo] = iso.split('-');
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthLabels[Number(mo) - 1] || ''} ${y}`;
};

function LensCard({
  title,
  caption,
  signals,
}: {
  title: string;
  caption: string;
  signals: RecentSignal[];
}) {
  const totalDisclosed = signals.reduce((sum, s) => sum + (s.dealSizeUsdM || 0), 0);

  return (
    <div className="border border-border bg-background flex flex-col">
      <div className="border-b border-border px-3 py-2 flex items-baseline justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">{title}</h4>
        <span className="text-[10px] font-mono text-muted-foreground">
          {signals.length} · {formatUsd(totalDisclosed)}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground px-3 pt-2 pb-1 leading-snug">{caption}</p>
      <ul className="flex flex-col">
        {signals.map((s) => (
          <li key={s.id} className="border-t border-border px-3 py-2.5">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                  {formatDate(s.date)}
                </span>
                <span className="text-xs font-semibold text-foreground truncate">{s.target}</span>
                {!s.isBio && (
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground border border-border px-1 shrink-0">
                    non-bio
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-primary shrink-0">
                {formatUsd(s.dealSizeUsdM)}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground leading-snug mb-1.5">
              <span className="text-foreground/80">{s.actor}</span> · {s.dealSizeLabel}
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug line-clamp-3 mb-1.5">
              {s.qualitySignal}
            </p>
            <a
              href={s.src}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" /> Source
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RecentSignalsView() {
  const [hovered, setHovered] = useState<string | null>(null);

  // Sort for bar chart: by deal size desc, undisclosed at the bottom by date desc
  const barRows = useMemo(() => {
    const sized = RECENT_SIGNALS.filter((s) => s.dealSizeUsdM != null && s.dealSizeUsdM > 0);
    const unsized = RECENT_SIGNALS.filter((s) => !s.dealSizeUsdM);
    sized.sort((a, b) => (b.dealSizeUsdM || 0) - (a.dealSizeUsdM || 0));
    unsized.sort((a, b) => b.date.localeCompare(a.date));
    return [...sized, ...unsized];
  }, []);

  // Lens-card groupings — five orthogonal narrative slices of the same dataset.
  const anthropicSignals = useMemo(
    () => RECENT_SIGNALS.filter((s) => s.lens.includes('anthropic'))
                       .sort((a, b) => b.date.localeCompare(a.date)),
    [],
  );
  const openaiSignals = useMemo(
    () => RECENT_SIGNALS.filter((s) => s.lens.includes('openai'))
                       .sort((a, b) => b.date.localeCompare(a.date)),
    [],
  );
  const pharmaSignals = useMemo(
    () => RECENT_SIGNALS.filter((s) => s.lens.includes('pharma'))
                       .sort((a, b) => b.date.localeCompare(a.date)),
    [],
  );
  const publicResearchSignals = useMemo(
    () => RECENT_SIGNALS.filter((s) => s.lens.includes('public-research'))
                       .sort((a, b) => b.date.localeCompare(a.date)),
    [],
  );
  const frontierLabSignals = useMemo(
    () => RECENT_SIGNALS.filter((s) => s.lens.includes('frontier-lab'))
                       .sort((a, b) => b.date.localeCompare(a.date)),
    [],
  );

  // Headline metrics across all signals
  const totals = useMemo(() => {
    const all = RECENT_SIGNALS;
    const disclosedSum = all.reduce((sum, s) => sum + (s.dealSizeUsdM || 0), 0);
    const acquisitions = all.filter((s) => s.action === 'acquisition').length;
    const pharmaDeals = all.filter((s) => s.lens.includes('pharma')).length;
    return { count: all.length, disclosedSum, acquisitions, pharmaDeals };
  }, []);

  // Bar chart sizing
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(900);
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerW(entry.contentRect.width);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Log scale: max disclosed amount maps to 95% of bar area; null/zero = small hatched stub
  const maxUsdM = useMemo(
    () => Math.max(...RECENT_SIGNALS.map((s) => s.dealSizeUsdM || 0), 1),
    [],
  );
  const labelW = 220;
  const valueW = 80;
  const chartW = Math.max(360, containerW - labelW - valueW - 24);
  const rowH = 22;
  const svgH = barRows.length * rowH + 16;

  // log10(1+x) so $1M and $2.5B both fit nicely
  const widthFor = (m: number | null): number => {
    if (!m || m <= 0) return 14;
    const t = Math.log10(1 + m) / Math.log10(1 + maxUsdM);
    return Math.max(2, t * chartW * 0.95);
  };

  return (
    <div>
      {/* Headline metric strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <Metric label="Signals" value={String(totals.count)} sub="last ~12 months" />
        <Metric label="Disclosed value" value={formatUsd(totals.disclosedSum)} sub="sum of priced deals" />
        <Metric label="Acquisitions" value={String(totals.acquisitions)} sub="Anthropic ×2 · OpenAI ×1" />
        <Metric label="Pharma × AI" value={String(totals.pharmaDeals)} sub="Sanofi · Lilly · Amgen · J&J" />
      </div>

      {/* Block 1 — deal-scale bar chart */}
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
        Scale of deals (log scale · click bar for source)
      </div>
      <div ref={containerRef} className="border border-border mb-6 overflow-x-auto">
        <svg width={labelW + chartW + valueW + 16} height={svgH} className="block">
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
              <g
                key={s.id}
                className="cursor-pointer"
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => window.open(s.src, '_blank')}
              >
                <rect
                  x={0}
                  y={y - rowH / 2 + 4}
                  width={labelW + chartW + valueW + 16}
                  height={rowH - 6}
                  fill={isHover ? 'hsl(var(--muted))' : 'transparent'}
                />
                {/* Left label: actor → target · date */}
                <text
                  x={labelW - 6}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-foreground text-[10px]"
                >
                  <tspan className="font-semibold">{s.actor}</tspan>
                  <tspan className="fill-muted-foreground"> → {s.target.length > 22 ? s.target.slice(0, 20) + '…' : s.target}</tspan>
                </text>
                {/* Bar */}
                <rect
                  x={labelW}
                  y={y - 7}
                  width={w}
                  height={14}
                  fill={undisclosed ? 'url(#hatch-undisclosed)' : color}
                  fillOpacity={isHover ? 0.95 : 0.78}
                  stroke={color}
                  strokeWidth={undisclosed ? 1 : 0}
                />
                {/* Right label: amount + date */}
                <text
                  x={labelW + chartW + 6}
                  y={y - 1}
                  className="fill-foreground text-[10px] font-mono font-semibold"
                >
                  {formatUsd(s.dealSizeUsdM)}
                </text>
                <text
                  x={labelW + chartW + 6}
                  y={y + 9}
                  className="fill-muted-foreground text-[9px] font-mono"
                >
                  {formatDate(s.date)} · {RS_ACTION_LABELS[s.action]}
                </text>
                {/* Hover tooltip */}
                {isHover && (
                  <foreignObject
                    x={labelW + Math.min(w + 6, chartW - 280)}
                    y={Math.max(0, y - 60)}
                    width={300}
                    height={170}
                  >
                    <div className="bg-background border border-border p-2 text-[10px] leading-tight shadow-lg">
                      <div className="font-bold text-foreground">{s.actor} → {s.target}</div>
                      <div className="text-primary text-[9px] mt-0.5">{s.dealSizeLabel}</div>
                      <div className="text-muted-foreground mt-1 line-clamp-5">{s.qualitySignal}</div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        <span className="text-[9px] px-1 border border-border bg-secondary">
                          {RS_ACTION_LABELS[s.action]}
                        </span>
                        {s.geo && (
                          <span className="text-[9px] px-1 border border-border text-muted-foreground">
                            {s.geo}
                          </span>
                        )}
                        {!s.isBio && (
                          <span className="text-[9px] px-1 border border-border text-muted-foreground">
                            non-bio
                          </span>
                        )}
                      </div>
                      <div className="text-primary text-[9px] mt-1 font-semibold">
                        🔗 Click bar to open source
                      </div>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
          {barRows.length === 0 && (
            <text x={20} y={28} className="fill-muted-foreground text-[11px]">
              No signals match the current filter.
            </text>
          )}
        </svg>
      </div>

      {/* Block 2 — five narrative lens cards on the same 12-month dataset */}
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
        Five lenses on the last twelve months
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-2">
        <LensCard
          title="Anthropic acquires"
          caption="Two acquisitions in 6 weeks (Vercept Feb · Coefficient Bio Apr). Frontier-lab → biotech specialist talent buy. ~$40M per-head valuation on Coefficient — strategic IP play, not aqui-hire."
          signals={anthropicSignals}
        />
        <LensCard
          title="OpenAI plays"
          caption="One health-records consumer acquisition (Torch) + one BCI investment (Merge Labs). Sam Altman personal stake + corporate OpenAI overlap = governance optics worth tracking."
          signals={openaiSignals}
        />
        <LensCard
          title="Pharma × AI"
          caption="Big pharma standardising compute infra (NVIDIA × Lilly $1B) and paying twice for the same AI biotech (Sanofi × Earendil $2.5B total). Generate IPOs with Amgen + Novartis already as paying partners."
          signals={pharmaSignals}
        />
        <LensCard
          title="Public research"
          caption="Clinical validation + open preprints — where AI-in-life-science methodology becomes legible without VC framing. Mayo REDMOD pancreatic detection, Pheiron aging clocks, FutureHouse Fellowship cohort, ALP Bio anti-pure-AI thesis."
          signals={publicResearchSignals}
        />
        <LensCard
          title="Frontier-lab pattern"
          caption="Frontier-AI labs spinning out / acqui-hiring biotech specialist teams (and the non-bio precedents). Latent Labs stealth, Edison Scientific spinout, Mira Murati Thinking Machines, plus Anthropic Vercept (non-bio multi-agent)."
          signals={frontierLabSignals}
        />
      </div>
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border border-border p-2.5">
      <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="text-lg font-bold text-foreground tabular-nums leading-tight mt-0.5">
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground leading-snug mt-0.5">{sub}</div>
    </div>
  );
}
