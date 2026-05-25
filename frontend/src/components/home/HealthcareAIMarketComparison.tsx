// HealthcareAIMarketComparison — "planets in a row" view of recent annualized
// revenue across AI sectors plus a big-pharma reference point.
//
// The chart's job is *visceral scale*: healthcare-AI leaders (Lunit, Abridge,
// HeartFlow) read as tiny dots compared to Cursor/OpenAI/NVIDIA and even to
// Novo Nordisk's pharma revenue. The exact ratios matter less than the gut
// reaction: "oh — health-AI revenue is microscopic next to everything else".
//
// Design choices:
//
// 1. POWER radius scaling (`r = a × revenue^0.34`). Sqrt collapsed differences
//    at the small end (Lunit ≈ Abridge ≈ HeartFlow ≈ same pixel); pure log
//    compressed the *whole* range. Power 0.34 is calibrated so Lunit lands at
//    ~4 px (literally a tiny dot) and NVIDIA at ~56 px (still readable, not
//    canvas-eating). The healthcare cluster ends up 4–6 px — that's the
//    point.
//
// 2. THREE categorical colours, not two:
//    - Coral  → healthcare AI (the subject of this Atlas)
//    - Teal   → big pharma (healthcare but not AI — Novo Nordisk)
//    - Grey   → other AI (coding/frontier/compute)
//    This makes "healthcare AI ≪ even pharma" legible without reading any
//    label, which is exactly the editorial claim the chart is making.
//
// 3. VERTICAL STAGGER for overlapping bubbles. OpenAI ($25B) and Novo ($42B)
//    sit close enough on the log axis that their radii overlap at any
//    reasonable scaling. Solution: Novo gets a non-zero `yOffset` so it sits
//    on a parallel orbit below.
//
// 4. ELEVATED LABEL ROW + LEADER LINES for the healthcare cluster. The three
//    healthcare bubbles are too small and too close for in-place labels. All
//    three names sit at a unified `HEALTHCARE_NAME_Y` near the top of the
//    healthcare band, with thin coral lines connecting label → tiny bubble.
//    Lollipop-style, common in tightly-clustered point viz.
//
// Every revenue carries a primary source URL + as-of date — this file is the
// single source of truth for the chart.

import { useState } from 'react';
import { cn } from '@/lib/utils';

type Category = 'healthcare-ai' | 'pharma' | 'other-ai';

interface Company {
  id: string;
  name: string;
  sector: string;
  revenueUsdM: number;
  asOf: string;
  metric: 'revenue' | 'annualized' | 'ARR' | 'FY';
  source: string;
  sourceUrl: string;
  category: Category;
  /** Vertical offset from the main orbit, in SVG units. Use to avoid bubble
   *  overlap when two values are close on the log x-axis (e.g. OpenAI / Novo). */
  yOffset?: number;
}

const COMPANIES: Company[] = [
  {
    id: 'lunit',
    name: 'Lunit',
    sector: 'Medical imaging AI',
    revenueUsdM: 60,
    asOf: '2025',
    metric: 'revenue',
    source: 'Lunit 2025 results (KRW 83.1B ≈ $60M USD)',
    sourceUrl: 'https://www.lunit.io/en/investor-information',
    category: 'healthcare-ai',
  },
  {
    id: 'abridge',
    name: 'Abridge',
    sector: 'AI scribes',
    revenueUsdM: 100,
    asOf: 'May 2025',
    metric: 'ARR',
    source: 'Sacra estimate, May 2025',
    sourceUrl: 'https://sacra.com/c/abridge/',
    category: 'healthcare-ai',
  },
  {
    id: 'heartflow',
    name: 'HeartFlow',
    sector: 'Medical imaging AI',
    revenueUsdM: 173,
    asOf: '2025 guidance',
    metric: 'revenue',
    source: 'HeartFlow 2025 guidance ($173M+; $125.8M actual 2024)',
    sourceUrl: 'https://www.heartflow.com/newsroom/',
    category: 'healthcare-ai',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    sector: 'Coding AI',
    revenueUsdM: 2_000,
    asOf: 'Feb 2026',
    metric: 'annualized',
    source: 'Reported $2B annualized revenue, early 2026',
    sourceUrl: 'https://www.theinformation.com/',
    category: 'other-ai',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    sector: 'Frontier AI',
    revenueUsdM: 25_000,
    asOf: 'Feb 2026',
    metric: 'annualized',
    source: 'Reported $25B+ annualized revenue, Feb 2026',
    sourceUrl: 'https://openai.com/',
    category: 'other-ai',
  },
  {
    id: 'novo-nordisk',
    name: 'Novo Nordisk',
    sector: 'Big pharma',
    revenueUsdM: 42_000,
    asOf: 'FY2024',
    metric: 'FY',
    // Novo Nordisk FY2024 revenue: DKK 290.4B ≈ $42B USD at year-end 2024 FX.
    source: 'Novo Nordisk FY2024 annual report (DKK 290.4B ≈ $42B USD)',
    sourceUrl: 'https://www.novonordisk.com/investors/financial-information.html',
    category: 'pharma',
    // Parallel orbit to dodge OpenAI overlap — see design note 3.
    yOffset: 50,
  },
  {
    id: 'nvidia',
    name: 'NVIDIA',
    sector: 'GPU / Compute',
    revenueUsdM: 215_900,
    asOf: 'FY2026',
    metric: 'FY',
    source: 'NVIDIA FY2026 annual revenue: $215.9B',
    sourceUrl: 'https://investor.nvidia.com/financial-info/financial-reports/',
    category: 'other-ai',
  },
];

// ── Palette ──────────────────────────────────────────────────────────────
const CORAL = 'hsl(14, 90%, 55%)';
const CORAL_HALO = 'hsl(14, 90%, 55%, 0.12)';

const TEAL_FILL = 'hsl(190, 55%, 78%)';
const TEAL_STROKE = 'hsl(190, 60%, 38%)';
const TEAL_TEXT = 'hsl(190, 65%, 28%)';

const NEUTRAL_FILL = 'hsl(0, 0%, 88%)';
const NEUTRAL_STROKE = 'hsl(0, 0%, 35%)';

const colorByCategory: Record<
  Category,
  { fill: string; stroke: string; nameText: string; isAccent: boolean }
> = {
  'healthcare-ai': { fill: CORAL,        stroke: CORAL,        nameText: CORAL,    isAccent: true  },
  pharma:          { fill: TEAL_FILL,    stroke: TEAL_STROKE,  nameText: TEAL_TEXT, isAccent: true  },
  'other-ai':      { fill: NEUTRAL_FILL, stroke: NEUTRAL_STROKE, nameText: 'hsl(0, 0%, 20%)', isAccent: false },
};

// ── SVG geometry ─────────────────────────────────────────────────────────
const W = 1200;
const H = 420;
const PAD_L = 90;
const PAD_R = 90;
const PAD_T = 90;
const PAD_B = 90;
const AXIS_Y = H - PAD_B + 20;
const ORBIT_Y = 200;
// Healthcare names sit at a unified elevated y, with leader lines down to
// their (very small) bubbles on the orbit.
const HEALTHCARE_NAME_Y = ORBIT_Y - 70;

// X-axis log domain: $10M → $1T
const X_MIN_LOG = Math.log10(10);
const X_MAX_LOG = Math.log10(1_000_000);

const X_TICKS: { value: number; label: string }[] = [
  { value: 10, label: '$10M' },
  { value: 100, label: '$100M' },
  { value: 1_000, label: '$1B' },
  { value: 10_000, label: '$10B' },
  { value: 100_000, label: '$100B' },
  { value: 1_000_000, label: '$1T' },
];

function xAt(usdM: number): number {
  const l = Math.log10(Math.max(usdM, 10));
  const t = (l - X_MIN_LOG) / (X_MAX_LOG - X_MIN_LOG);
  return PAD_L + t * (W - PAD_L - PAD_R);
}

// POWER scaling — see design note 1.
const RADIUS_POWER = 0.34;
const RADIUS_COEFF = 4 / Math.pow(60, RADIUS_POWER); // Anchors Lunit ($60M) to 4 px.

function planetRadius(usdM: number): number {
  return RADIUS_COEFF * Math.pow(usdM, RADIUS_POWER);
}

function formatRevenue(usdM: number): string {
  if (usdM >= 1_000_000) return `$${(usdM / 1_000_000).toFixed(1)}T`;
  if (usdM >= 1_000) return `$${(usdM / 1_000).toFixed(usdM >= 10_000 ? 0 : 1)}B`;
  return `$${usdM.toFixed(0)}M`;
}

const metricLabel: Record<Company['metric'], string> = {
  revenue: 'revenue',
  annualized: 'annualized',
  ARR: 'ARR',
  FY: 'FY revenue',
};

const sectorLabel: Record<Category, string> = {
  'healthcare-ai': 'Healthcare AI',
  pharma: 'Big pharma',
  'other-ai': 'AI / compute',
};

// Healthcare band geometry — coral wash behind the healthcare-AI cluster.
const healthcareCompanies = COMPANIES.filter((c) => c.category === 'healthcare-ai');
const healthcareMin = Math.min(...healthcareCompanies.map((c) => c.revenueUsdM));
const healthcareMax = Math.max(...healthcareCompanies.map((c) => c.revenueUsdM));
const HEALTHCARE_BAND_LEFT = xAt(healthcareMin) - planetRadius(healthcareMin) - 30;
const HEALTHCARE_BAND_RIGHT = xAt(healthcareMax) + planetRadius(healthcareMax) + 30;

export function HealthcareAIMarketComparison() {
  const [hovered, setHovered] = useState<Company | null>(null);

  return (
    <div className="border border-border bg-background">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full min-w-[760px] h-auto"
          fontFamily="Inter, system-ui, -apple-system, sans-serif"
        >
          {/* Healthcare AI zone band */}
          <rect
            x={HEALTHCARE_BAND_LEFT}
            y={PAD_T - 30}
            width={HEALTHCARE_BAND_RIGHT - HEALTHCARE_BAND_LEFT}
            height={H - PAD_T - PAD_B + 40}
            fill={CORAL_HALO}
          />
          <text
            x={(HEALTHCARE_BAND_LEFT + HEALTHCARE_BAND_RIGHT) / 2}
            y={PAD_T - 42}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            letterSpacing="2"
            fill={CORAL}
          >
            HEALTHCARE AI
          </text>

          {/* Main orbit */}
          <line
            x1={PAD_L}
            y1={ORBIT_Y}
            x2={W - PAD_R}
            y2={ORBIT_Y}
            stroke="hsl(0, 0%, 90%)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />

          {/* Planets */}
          {COMPANIES.map((c) => {
            const r = planetRadius(c.revenueUsdM);
            const cx = xAt(c.revenueUsdM);
            const cy = ORBIT_Y + (c.yOffset ?? 0);
            const isHovered = hovered?.id === c.id;
            const palette = colorByCategory[c.category];
            const isHealthcareAi = c.category === 'healthcare-ai';

            // Healthcare cluster: name elevated, leader line down to bubble.
            // Everyone else: name directly above bubble.
            const nameY = isHealthcareAi ? HEALTHCARE_NAME_Y : cy - r - 10;
            const showLeader = isHealthcareAi;

            return (
              <g
                key={c.id}
                onMouseEnter={() => setHovered(c)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(c)}
                onBlur={() => setHovered(null)}
                tabIndex={0}
                role="button"
                aria-label={`${c.name}: ${formatRevenue(c.revenueUsdM)} ${metricLabel[c.metric]} (${c.asOf})`}
                style={{ cursor: 'pointer', outline: 'none' }}
              >
                {/* Leader line — only for the staggered healthcare cluster. */}
                {showLeader && (
                  <line
                    x1={cx}
                    y1={nameY + 6}
                    x2={cx}
                    y2={cy - r - 2}
                    stroke={palette.stroke}
                    strokeWidth="1"
                    opacity={isHovered ? 1 : 0.5}
                  />
                )}

                {/* Hover halo */}
                {isHovered && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r + 8}
                    fill="none"
                    stroke={palette.stroke}
                    strokeWidth="1.5"
                    opacity="0.5"
                  />
                )}

                {/* The planet */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={palette.fill}
                  stroke={palette.stroke}
                  strokeWidth={palette.isAccent ? 2 : 1.5}
                  style={{
                    transition: 'transform 200ms ease',
                    transformOrigin: `${cx}px ${cy}px`,
                    transform: isHovered ? 'scale(1.12)' : 'scale(1)',
                  }}
                />
                {/* Inner shading on big planets for depth */}
                {r > 20 && (
                  <circle
                    cx={cx - r * 0.3}
                    cy={cy - r * 0.3}
                    r={r * 0.42}
                    fill="white"
                    opacity={palette.isAccent ? 0.25 : 0.35}
                    pointerEvents="none"
                  />
                )}

                {/* Name */}
                <text
                  x={cx}
                  y={nameY}
                  textAnchor="middle"
                  fontSize={c.revenueUsdM >= 10_000 ? '14' : '12'}
                  fontWeight={palette.isAccent ? 700 : 600}
                  fill={palette.nameText}
                >
                  {c.name}
                </text>

                {/* Revenue below bubble (sector caption dropped — lives in
                    hover panel and the band label). */}
                <text
                  x={cx}
                  y={cy + r + 16}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  fill="hsl(0, 0%, 25%)"
                >
                  {formatRevenue(c.revenueUsdM)}
                </text>
              </g>
            );
          })}

          {/* X-axis */}
          <line
            x1={PAD_L}
            y1={AXIS_Y}
            x2={W - PAD_R}
            y2={AXIS_Y}
            stroke="hsl(0, 0%, 75%)"
            strokeWidth="1"
          />
          {X_TICKS.map((t) => {
            const x = xAt(t.value);
            return (
              <g key={t.value}>
                <line
                  x1={x}
                  y1={AXIS_Y}
                  x2={x}
                  y2={AXIS_Y + 5}
                  stroke="hsl(0, 0%, 60%)"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={AXIS_Y + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  fill="hsl(0, 0%, 45%)"
                >
                  {t.label}
                </text>
              </g>
            );
          })}
          <text
            x={W - PAD_R}
            y={AXIS_Y + 36}
            textAnchor="end"
            fontSize="9"
            letterSpacing="1.5"
            fill="hsl(0, 0%, 55%)"
          >
            ANNUALIZED REVENUE · LOG SCALE
          </text>
        </svg>
      </div>

      {/* Legend + hover detail */}
      <div className="border-t border-border bg-secondary/30 px-6 md:px-8 py-4 min-h-[110px]">
        {/* Three-colour legend — always visible so the categorical encoding
            (coral/teal/grey) is unambiguous. */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-2 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full border-2"
              style={{ backgroundColor: CORAL, borderColor: CORAL }}
            />
            <span className="text-foreground font-medium">Healthcare AI</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full border-2"
              style={{ backgroundColor: TEAL_FILL, borderColor: TEAL_STROKE }}
            />
            <span className="text-foreground font-medium">Big pharma</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full border-2"
              style={{ backgroundColor: NEUTRAL_FILL, borderColor: NEUTRAL_STROKE }}
            />
            <span className="text-foreground font-medium">AI / compute</span>
          </span>
        </div>

        {hovered ? (
          <div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-semibold text-foreground">{hovered.name}</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {hovered.sector} · {sectorLabel[hovered.category]}
              </span>
              <span className="text-sm font-mono">
                {formatRevenue(hovered.revenueUsdM)} {metricLabel[hovered.metric]}
              </span>
              <span className="text-xs text-muted-foreground">as of {hovered.asOf}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {hovered.source} ·{' '}
              <a
                href={hovered.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                source
              </a>
            </p>
          </div>
        ) : (
          <p className={cn('text-xs text-muted-foreground')}>
            Hover a planet for figures, as-of date, and primary source. Lunit, Abridge, HeartFlow
            sit inside the coral band — collectively they are smaller than Cursor alone, and 50–500×
            below Novo Nordisk's pharma revenue.
          </p>
        )}
      </div>
    </div>
  );
}
