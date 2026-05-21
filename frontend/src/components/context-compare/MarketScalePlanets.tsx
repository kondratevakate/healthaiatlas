// MarketScalePlanets — two-orbit "planets" view of country markets.
//
// Upper orbit: total healthcare expenditure per region (the denominator).
// Lower orbit: medical-AI market per region (the AI slice).
//
// The chart's editorial point: AI is a *tiny* slice of healthcare in every
// country, but the slice scales roughly with the total. Country sizing
// preserved across both orbits via REGION_ACCENTS — same colour for the same
// country up and down.
//
// Sourcing notes — every figure carries an authoritative source URL:
//   Healthcare totals: WHO Global Health Expenditure / national stats agencies.
//   Medical-AI sizing: re-used from `comparativeMatrix.ts` market-size row
//   where available, with mid-point estimates for ranges. China figures from
//   Frost & Sullivan / Statista (estimate ranges noted).
//
// Power scaling `r = a × revenue^0.25` chosen so the smallest bubble (UAE AI
// ≈ $28M) is ~4 px and the biggest (US healthcare ≈ $4.9T) is ~80 px — a
// 20× radius ratio over a 175 000× revenue ratio. Sqrt would have collapsed
// the AI tier into identical dots; linear would have made US healthcare
// canvas-eating.

import { useState } from 'react';
import { REGION_ACCENTS, REGION_FLAGS, REGION_LABELS, type Region as MatrixRegion } from '@/data/comparativeMatrix';

// Region union extended with China — China is on the user-facing tab list
// but not in the cross-region MATRIX. We carry it inline here.
type Region = MatrixRegion | 'cn';

interface MarketPoint {
  region: Region;
  /** Market size in USD millions. */
  usdM: number;
  asOf: string;
  source: string;
  sourceUrl: string;
  /** Optional vertical offset from the orbit line, in SVG units. Used to
   *  separate overlapping bubbles on the log axis (e.g. EU vs China at ~$1.5T). */
  yOffset?: number;
  /** Optional textual note that appears in the hover panel. */
  note?: string;
}

// ── Data ─────────────────────────────────────────────────────────────────

const HEALTHCARE_TOTAL: MarketPoint[] = [
  {
    region: 'us',
    usdM: 4_900_000, // $4.9T (NHE 2023)
    asOf: '2023',
    source: 'CMS National Health Expenditure Data — $4.86T in 2023',
    sourceUrl: 'https://www.cms.gov/data-research/statistics-trends-and-reports/national-health-expenditure-data',
  },
  {
    region: 'cn',
    usdM: 1_600_000, // ~$1.6T
    asOf: '2023',
    source: 'WHO Global Health Expenditure — China current health expenditure',
    sourceUrl: 'https://apps.who.int/nha/database',
    note: 'CN sits on a parallel orbit (+) to avoid overlap with EU.',
    yOffset: -30,
  },
  {
    region: 'eu',
    usdM: 1_500_000, // ~€1.4T ≈ $1.5T (EU27 health spending)
    asOf: '2023',
    source: 'OECD Health at a Glance: Europe 2023',
    sourceUrl: 'https://www.oecd.org/health/health-at-a-glance-europe/',
  },
  {
    region: 'uk',
    usdM: 260_000, // ~£200B NHS + private ≈ $260B
    asOf: '2024',
    source: 'UK Health Foundation — UK total health spending',
    sourceUrl: 'https://www.health.org.uk/publications/uk-health-spending',
  },
  {
    region: 'ch',
    usdM: 100_000, // ~CHF 91B ≈ $100B
    asOf: '2023',
    source: 'Swiss Federal Statistical Office — Cost & financing of healthcare',
    sourceUrl: 'https://www.bfs.admin.ch/bfs/en/home/statistics/health/costs-financing.html',
  },
  {
    region: 'uae',
    usdM: 35_000, // ~$30–35B (2024–2025 estimates)
    asOf: '2024',
    source: 'UAE Ministry of Health & Prevention / OECD estimates',
    sourceUrl: 'https://www.mohap.gov.ae/',
  },
];

const MEDICAL_AI: MarketPoint[] = [
  {
    region: 'us',
    usdM: 17_500, // $17.5B (NA share, ~44.5% of global AI-healthcare TAM)
    asOf: '2024',
    source: 'Fortune Business Insights — AI in Healthcare, North America share',
    sourceUrl: 'https://www.fortunebusinessinsights.com/industry-reports/artificial-intelligence-in-healthcare-market-100534',
  },
  {
    region: 'eu',
    usdM: 6_500, // mid-point of $5–8B estimate
    asOf: '2024',
    source: 'Vendor estimates ($5–8B EU AI-in-healthcare TAM)',
    sourceUrl: 'https://health.ec.europa.eu/ehealth-digital-health-and-care/artificial-intelligence-healthcare_en',
  },
  {
    region: 'uk',
    usdM: 3_000, // mid-point of $2–4B
    asOf: '2024',
    source: 'UK NHS AI Lab + market analyst consensus, $2–4B range',
    sourceUrl: 'https://transform.england.nhs.uk/ai-lab/',
  },
  {
    region: 'cn',
    usdM: 2_000, // analyst estimates vary $1.5–3B
    asOf: '2024',
    source: 'Frost & Sullivan / Statista — China AI in healthcare ($1.5–3B range)',
    sourceUrl: 'https://www.statista.com/topics/8268/artificial-intelligence-in-healthcare-in-china/',
    note: 'Estimate range $1.5–3B; midpoint shown.',
  },
  {
    region: 'ch',
    usdM: 300, // mid-point of $200–400M
    asOf: '2024',
    source: 'Swissmedic + Swiss MedTech market reports',
    sourceUrl: 'https://www.swissmedic.ch/',
  },
  {
    region: 'uae',
    usdM: 28, // mid-point of $17–39M (consultant range)
    asOf: '2024',
    source: 'UAE consultant range $17–39M (M42 / DoH-AD figures)',
    sourceUrl: 'https://www.doh.gov.ae/',
  },
];

// ── Geometry ─────────────────────────────────────────────────────────────

const W = 1200;
const H = 440;
const PAD_L = 100;
const PAD_R = 100;
const AXIS_Y = 380;

const ORBIT_HEALTH_Y = 130;
const ORBIT_AI_Y = 280;

// X-axis log domain: $10M → $10T (covers UAE AI on the low end and US health on
// the high end with a tail of headroom).
const X_MIN_LOG = Math.log10(10);
const X_MAX_LOG = Math.log10(10_000_000); // $10T

const X_TICKS: { value: number; label: string }[] = [
  { value: 10, label: '$10M' },
  { value: 100, label: '$100M' },
  { value: 1_000, label: '$1B' },
  { value: 10_000, label: '$10B' },
  { value: 100_000, label: '$100B' },
  { value: 1_000_000, label: '$1T' },
  { value: 10_000_000, label: '$10T' },
];

function xAt(usdM: number): number {
  const l = Math.log10(Math.max(usdM, 10));
  const t = (l - X_MIN_LOG) / (X_MAX_LOG - X_MIN_LOG);
  return PAD_L + t * (W - PAD_L - PAD_R);
}

// Power scaling — see file header.
const RADIUS_POWER = 0.25;
const RADIUS_COEFF = 4 / Math.pow(28, RADIUS_POWER); // Anchors UAE-AI ($28M) to 4 px.

function planetRadius(usdM: number): number {
  return RADIUS_COEFF * Math.pow(usdM, RADIUS_POWER);
}

// Extended region styling — adds China to the matrix accents.
const ACCENTS: Record<Region, string> = {
  ...REGION_ACCENTS,
  cn: 'hsl(0 70% 38%)', // China red, distinct from Swiss red (which is brighter)
};
const FLAGS: Record<Region, string> = { ...REGION_FLAGS, cn: '🇨🇳' };
const LABELS: Record<Region, string> = { ...REGION_LABELS, cn: 'China' };

function formatMarket(usdM: number): string {
  if (usdM >= 1_000_000) return `$${(usdM / 1_000_000).toFixed(usdM >= 10_000_000 ? 0 : 1)}T`;
  if (usdM >= 1_000) return `$${(usdM / 1_000).toFixed(usdM >= 10_000 ? 0 : 1)}B`;
  return `$${usdM.toFixed(0)}M`;
}

// ── Component ────────────────────────────────────────────────────────────

interface HoverState {
  point: MarketPoint;
  tier: 'healthcare' | 'ai';
}

interface PlanetRowProps {
  data: MarketPoint[];
  cy: number;
  tier: 'healthcare' | 'ai';
  hovered: HoverState | null;
  onHover: (h: HoverState | null) => void;
}

function PlanetRow({ data, cy, tier, hovered, onHover }: PlanetRowProps) {
  return (
    <>
      {data.map((p) => {
        const r = planetRadius(p.usdM);
        const cx = xAt(p.usdM);
        const py = cy + (p.yOffset ?? 0);
        const isHovered = hovered?.point.region === p.region && hovered?.tier === tier;
        const color = ACCENTS[p.region];

        return (
          <g
            key={`${tier}-${p.region}`}
            onMouseEnter={() => onHover({ point: p, tier })}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover({ point: p, tier })}
            onBlur={() => onHover(null)}
            tabIndex={0}
            role="button"
            aria-label={`${LABELS[p.region]} ${tier === 'healthcare' ? 'healthcare' : 'medical AI'} market: ${formatMarket(p.usdM)} (${p.asOf})`}
            style={{ cursor: 'pointer', outline: 'none' }}
          >
            {/* Hover halo */}
            {isHovered && (
              <circle
                cx={cx}
                cy={py}
                r={r + 7}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                opacity="0.5"
              />
            )}
            {/* Planet body */}
            <circle
              cx={cx}
              cy={py}
              r={r}
              fill={color}
              fillOpacity={isHovered ? 0.9 : 0.75}
              stroke={color}
              strokeWidth="1.5"
              style={{
                transition: 'transform 200ms ease',
                transformOrigin: `${cx}px ${py}px`,
                transform: isHovered ? 'scale(1.12)' : 'scale(1)',
              }}
            />
            {/* Inner shading on big planets */}
            {r > 20 && (
              <circle
                cx={cx - r * 0.3}
                cy={py - r * 0.3}
                r={r * 0.4}
                fill="white"
                opacity="0.3"
                pointerEvents="none"
              />
            )}
            {/* Flag + label above bubble */}
            <text
              x={cx}
              y={py - r - 8}
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fill={color}
            >
              {FLAGS[p.region]} {LABELS[p.region]}
            </text>
            {/* Value below bubble */}
            <text
              x={cx}
              y={py + r + 16}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fill="hsl(0, 0%, 25%)"
            >
              {formatMarket(p.usdM)}
            </text>
          </g>
        );
      })}
    </>
  );
}

export function MarketScalePlanets() {
  const [hovered, setHovered] = useState<HoverState | null>(null);

  return (
    <section className="border border-border bg-background">
      <header className="px-5 py-4 border-b border-border">
        <div className="text-[10px] uppercase tracking-widest font-mono italic text-muted-foreground mb-1">
          ★ <span style={{ color: 'hsl(14 90% 55%)' }}>Market scale</span> · two orbits on one log axis
        </div>
        <h3 className="font-serif text-lg md:text-xl font-bold text-foreground">
          Healthcare market vs medical AI — same axis, two rows
        </h3>
        <p className="text-[13px] text-muted-foreground mt-1 max-w-3xl">
          Each country shows up twice — once on the total healthcare-spend orbit (top), once on the
          medical-AI orbit (bottom). Same colour up and down. Compare a country's two planets to see
          how thin the AI slice is.
        </p>
      </header>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full min-w-[760px] h-auto"
          fontFamily="Inter, system-ui, -apple-system, sans-serif"
        >
          {/* Tier label — healthcare orbit */}
          <text
            x={PAD_L - 10}
            y={ORBIT_HEALTH_Y - 50}
            textAnchor="start"
            fontSize="11"
            fontWeight="700"
            letterSpacing="2"
            fill="hsl(0 0% 25%)"
          >
            HEALTHCARE — total spend
          </text>
          <line
            x1={PAD_L}
            y1={ORBIT_HEALTH_Y}
            x2={W - PAD_R}
            y2={ORBIT_HEALTH_Y}
            stroke="hsl(0, 0%, 90%)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />

          {/* Tier label — medical AI orbit */}
          <text
            x={PAD_L - 10}
            y={ORBIT_AI_Y - 50}
            textAnchor="start"
            fontSize="11"
            fontWeight="700"
            letterSpacing="2"
            fill="hsl(14 90% 45%)"
          >
            MEDICAL AI — annualised market
          </text>
          <line
            x1={PAD_L}
            y1={ORBIT_AI_Y}
            x2={W - PAD_R}
            y2={ORBIT_AI_Y}
            stroke="hsl(14 90% 70%)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />

          <PlanetRow
            data={HEALTHCARE_TOTAL}
            cy={ORBIT_HEALTH_Y}
            tier="healthcare"
            hovered={hovered}
            onHover={setHovered}
          />
          <PlanetRow
            data={MEDICAL_AI}
            cy={ORBIT_AI_Y}
            tier="ai"
            hovered={hovered}
            onHover={setHovered}
          />

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
                <line x1={x} y1={AXIS_Y} x2={x} y2={AXIS_Y + 5} stroke="hsl(0, 0%, 60%)" strokeWidth="1" />
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
            MARKET SIZE · LOG SCALE
          </text>
        </svg>
      </div>

      {/* Hover detail / static fallback */}
      <div className="border-t border-border bg-secondary/30 px-5 py-4 min-h-[88px]">
        {hovered ? (
          <div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-base">{FLAGS[hovered.point.region]}</span>
              <span className="font-semibold text-foreground" style={{ color: ACCENTS[hovered.point.region] }}>
                {LABELS[hovered.point.region]}
              </span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {hovered.tier === 'healthcare' ? 'Total healthcare spend' : 'Medical AI market'}
              </span>
              <span className="text-sm font-mono">{formatMarket(hovered.point.usdM)}</span>
              <span className="text-xs text-muted-foreground">as of {hovered.point.asOf}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {hovered.point.source} ·{' '}
              <a
                href={hovered.point.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                source
              </a>
              {hovered.point.note && <span className="italic"> · {hovered.point.note}</span>}
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Hover a planet for figures, as-of date, and primary source. US healthcare ($4.9T) is
            <em> roughly 280× larger</em> than US medical-AI ($17.5B). UAE healthcare ($35B) is
            <em> 1,250× larger</em> than UAE medical-AI ($28M). The ratio narrows toward zero
            — AI as a healthcare share is microscopic everywhere.
          </p>
        )}
      </div>
    </section>
  );
}
