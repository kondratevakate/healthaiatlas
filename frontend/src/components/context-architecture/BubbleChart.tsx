import { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
} from 'recharts';
import {
  AI_ARCHITECTURES,
  FAMILY_COLORS,
  familyKey,
  type AIArchitecture,
  type ArchFamily,
  type ProductDomain,
} from '@/data/aiArchitectureRevenue';
import { cn } from '@/lib/utils';

export type XMode = 'papers' | 'year';

interface BubbleChartProps {
  xMode: XMode;
  familyFilter: Set<ArchFamily>;
  domainFilter: ProductDomain | 'all';
  selectedArchId: string | null;
  onSelect: (archId: string | null) => void;
}

interface BubbleDatum {
  x: number;
  y: number;
  z: number;            // bubble size
  arch: AIArchitecture;
  isSelected: boolean;
  isDimmed: boolean;
}

const PAPERS_TICKS = [1, 3, 10, 30, 100, 300];
const REVENUE_TICKS = [10, 100, 1000, 10000, 100000, 1000000];

function fmtRevenue(v: number): string {
  if (v >= 1000) return `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}B`;
  if (v >= 1) return `$${v.toFixed(0)}M`;
  return v > 0 ? '<$1M' : '$0';
}

function fmtPapers(v: number): string {
  return `${v}K`;
}

function isVisible(
  a: AIArchitecture,
  familyFilter: Set<ArchFamily>,
  domainFilter: ProductDomain | 'all',
): boolean {
  if (!familyFilter.has(familyKey(a.family))) return false;
  if (domainFilter !== 'all' && !a.domains.includes(domainFilter)) return false;
  return true;
}

function CustomBubble(props: {
  cx?: number;
  cy?: number;
  payload?: BubbleDatum;
  onSelect: (archId: string) => void;
}) {
  const { cx, cy, payload, onSelect } = props;
  if (cx == null || cy == null || !payload) return null;
  const { arch, isSelected, isDimmed } = payload;
  // Bubble radius — sqrt scaling so area encodes revenue
  const minR = 5;
  const maxR = 32;
  const v = arch.attributableRevenueM;
  const r = v <= 0
    ? minR
    : Math.max(minR, Math.min(maxR, Math.sqrt(v) * 0.55));
  const color = FAMILY_COLORS[arch.family];
  return (
    <g
      style={{ cursor: 'pointer', opacity: isDimmed ? 0.25 : 1 }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(arch.archId);
      }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={color}
        fillOpacity={isSelected ? 0.85 : 0.55}
        stroke={isSelected ? '#1a1a1a' : color}
        strokeWidth={isSelected ? 2 : 1}
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="ui-monospace, monospace"
        fontSize={r >= 14 ? 10 : 9}
        fill="#fff"
        pointerEvents="none"
      >
        {arch.archId}
      </text>
    </g>
  );
}

function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const datum = payload[0].payload as BubbleDatum;
  const a = datum.arch;
  return (
    <div className="rounded-sm border bg-background/95 backdrop-blur-sm px-3 py-2 shadow-md text-xs">
      <div className="font-mono text-[10px] text-muted-foreground">
        {a.archId} · {a.family} · {a.paperYear}
      </div>
      <div className="font-semibold text-foreground mt-0.5 max-w-[260px]">
        {a.name}
      </div>
      <div className="mt-1.5 flex gap-3 font-mono text-[10px] text-muted-foreground">
        <span>
          Revenue:{' '}
          <span className="text-foreground">{fmtRevenue(a.attributableRevenueM)}</span>
        </span>
        <span>
          Papers: <span className="text-foreground">{fmtPapers(a.paperCountK)}</span>
        </span>
      </div>
    </div>
  );
}

export function BubbleChart({
  xMode,
  familyFilter,
  domainFilter,
  selectedArchId,
  onSelect,
}: BubbleChartProps) {
  const data: BubbleDatum[] = useMemo(() => {
    return AI_ARCHITECTURES
      .filter((a) => isVisible(a, familyFilter, domainFilter))
      // Skip $0 revenue from the log chart — surface in sidebar instead
      .filter((a) => a.attributableRevenueM > 0)
      .map((a) => {
        const isSelected = selectedArchId === a.archId;
        const isDimmed = selectedArchId !== null && !isSelected;
        return {
          x: xMode === 'papers' ? Math.max(a.paperCountK, 0.5) : a.paperYear,
          y: a.attributableRevenueM,
          z: a.attributableRevenueM,
          arch: a,
          isSelected,
          isDimmed,
        };
      });
  }, [xMode, familyFilter, domainFilter, selectedArchId]);

  const xAxisProps =
    xMode === 'papers'
      ? {
          type: 'number' as const,
          scale: 'log' as const,
          domain: [0.5, 300],
          ticks: PAPERS_TICKS,
          tickFormatter: fmtPapers,
          label: {
            value: 'Papers (cumulative, thousands, log)',
            position: 'insideBottom' as const,
            offset: -5,
            fontSize: 10,
            fill: 'hsl(var(--muted-foreground))',
          },
        }
      : {
          type: 'number' as const,
          domain: [1995, 2026],
          ticks: [1997, 2005, 2010, 2015, 2020, 2025],
          tickFormatter: (v: number) => String(v),
          label: {
            value: 'Publication year',
            position: 'insideBottom' as const,
            offset: -5,
            fontSize: 10,
            fill: 'hsl(var(--muted-foreground))',
          },
        };

  return (
    <div className="w-full">
      <div
        className={cn(
          'w-full',
          'h-[500px] md:h-[560px]',
          'rounded-md border bg-secondary/10 p-2',
        )}
        onClick={() => onSelect(null)}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 16, right: 24, bottom: 32, left: 12 }}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              {...xAxisProps}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontFamily: 'ui-monospace, monospace' }}
              stroke="hsl(var(--border))"
            />
            <YAxis
              dataKey="y"
              type="number"
              scale="log"
              domain={[10, 1_000_000]}
              ticks={REVENUE_TICKS}
              tickFormatter={fmtRevenue}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontFamily: 'ui-monospace, monospace' }}
              stroke="hsl(var(--border))"
              label={{
                value: 'Est. attributable revenue (log)',
                angle: -90,
                position: 'insideLeft',
                offset: 18,
                style: { textAnchor: 'middle', fontSize: 10, fill: 'hsl(var(--muted-foreground))' },
              }}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: 'hsl(var(--border))', strokeDasharray: '3 3' }}
            />
            <Scatter
              data={data}
              shape={(p: unknown) => <CustomBubble {...(p as { cx?: number; cy?: number; payload?: BubbleDatum })} onSelect={onSelect} />}
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
        Click any bubble to see the products behind the estimate · click outside to deselect
      </p>
    </div>
  );
}
