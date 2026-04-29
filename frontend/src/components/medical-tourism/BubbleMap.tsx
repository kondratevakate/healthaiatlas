import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { SOURCES, DESTINATIONS, CORRIDORS } from '@/data/medicalTourism';

interface Props {
  specialty: string;
  selSrc: string | null;
  selDst: string | null;
}

// `in_o` (India outbound) and `in` (India inbound) are the same country.
const CANONICAL_ID: Record<string, string> = { in_o: 'in' };
const canon = (id: string) => CANONICAL_ID[id] ?? id;

const LABELS: Record<string, { label: string; flag: string }> = {};
SOURCES.forEach((s) => {
  LABELS[canon(s.id)] = { label: s.label.replace(' (out)', ''), flag: s.flag };
});
DESTINATIONS.forEach((d) => {
  LABELS[canon(d.id)] = { label: d.label, flag: d.flag };
});

const parseGrowth = (g: string): number => {
  const n = parseFloat(g.replace(/[+%\s]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

interface SrcPoint {
  id: string;
  label: string;
  flag: string;
  vol: number;       // outbound volume filtered by specialty (K/yr)
  growth: number;    // growth rate %
  topOutbound: { to: string; vol: number }[];
}

interface DstPoint {
  id: string;
  label: string;
  flag: string;
  inbound: number;   // inbound volume filtered by specialty (K/yr)
  topInbound: { from: string; vol: number }[];
}

export function BubbleMap({ specialty, selSrc, selDst }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const { sources, destinations } = useMemo(() => {
    const srcVol = new Map<string, number>();
    const dstVol = new Map<string, number>();
    const srcOut = new Map<string, { to: string; vol: number }[]>();
    const dstIn = new Map<string, { from: string; vol: number }[]>();

    CORRIDORS.forEach((c) => {
      if (specialty !== 'all' && !c.spec.includes(specialty)) return;
      const fromId = canon(c.from);
      const toId = canon(c.to);
      srcVol.set(fromId, (srcVol.get(fromId) ?? 0) + c.vol);
      dstVol.set(toId, (dstVol.get(toId) ?? 0) + c.vol);
      const outArr = srcOut.get(fromId) ?? [];
      outArr.push({ to: toId, vol: c.vol });
      srcOut.set(fromId, outArr);
      const inArr = dstIn.get(toId) ?? [];
      inArr.push({ from: fromId, vol: c.vol });
      dstIn.set(toId, inArr);
    });

    const srcs: SrcPoint[] = SOURCES.map((s) => {
      const cid = canon(s.id);
      const meta = LABELS[cid] ?? { label: s.label, flag: s.flag };
      const out = (srcOut.get(cid) ?? []).slice().sort((a, b) => b.vol - a.vol);
      return {
        id: cid,
        label: meta.label,
        flag: meta.flag,
        vol: srcVol.get(cid) ?? 0,
        growth: parseGrowth(s.growth),
        topOutbound: out,
      };
    }).filter((p) => p.vol > 0);

    const dsts: DstPoint[] = DESTINATIONS.map((d) => {
      const cid = canon(d.id);
      const meta = LABELS[cid] ?? { label: d.label, flag: d.flag };
      const inb = (dstIn.get(cid) ?? []).slice().sort((a, b) => b.vol - a.vol);
      return {
        id: cid,
        label: meta.label,
        flag: meta.flag,
        inbound: dstVol.get(cid) ?? 0,
        topInbound: inb,
      };
    })
      .filter((p) => p.inbound > 0)
      .sort((a, b) => b.inbound - a.inbound);

    return { sources: srcs, destinations: dsts };
  }, [specialty]);

  if (sources.length === 0 && destinations.length === 0) {
    return (
      <div className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No corridors match the current filters.
      </div>
    );
  }

  // Cross-highlight: when hovering a country, only it and its connected counterparts stay full opacity.
  const isRelevant = (id: string): boolean => {
    if (!hoverId) return true;
    if (id === hoverId) return true;
    const hoveredSrc = sources.find((s) => s.id === hoverId);
    if (hoveredSrc?.topOutbound.some((c) => c.to === id)) return true;
    const hoveredDst = destinations.find((d) => d.id === hoverId);
    if (hoveredDst?.topInbound.some((c) => c.from === id)) return true;
    return false;
  };

  const matchesUpperFilter = (id: string) => {
    if (!selSrc && !selDst) return true;
    const cid = canon(id);
    if (selSrc && cid === canon(selSrc)) return true;
    if (selDst && cid === canon(selDst)) return true;
    if (selSrc) {
      const src = sources.find((s) => s.id === canon(selSrc));
      if (src?.topOutbound.some((c) => c.to === cid)) return true;
    }
    if (selDst) {
      const dst = destinations.find((d) => d.id === canon(selDst));
      if (dst?.topInbound.some((c) => c.from === cid)) return true;
    }
    return false;
  };

  const dimFor = (id: string) => !matchesUpperFilter(id) || !isRelevant(id);

  // ── DEMAND scatter chart geometry ────────────────────────────────────
  const W = 760;
  const H = 380;
  const padL = 56;
  const padR = 24;
  const padT = 28;
  const padB = 56;       // extra room for axis title + label below bubble
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const maxVol = Math.max(50, ...sources.map((s) => s.vol));
  const xScale = (vol: number) => padL + Math.sqrt(vol / maxVol) * innerW;

  const minG = Math.min(0, ...sources.map((s) => s.growth));
  const maxG = Math.max(40, ...sources.map((s) => s.growth));
  const yScale = (g: number) => padT + (1 - (g - minG) / (maxG - minG)) * innerH;

  const sizeFor = (vol: number) => 14 + Math.sqrt(vol / maxVol) * 24;

  const sourceColor = (growth: number) => {
    if (growth >= 25) return 'hsl(215 75% 45%)';
    if (growth >= 15) return 'hsl(212 60% 55%)';
    return 'hsl(210 40% 65%)';
  };

  const xTicks = (() => {
    const candidates = [50, 100, 200, 400];
    const within = candidates.filter((v) => v <= maxVol);
    if (!within.includes(maxVol)) within.push(Math.round(maxVol));
    return within;
  })();

  const yTicks = (() => {
    const result: number[] = [];
    const step = maxG - minG > 30 ? 10 : 5;
    for (let g = Math.ceil(minG / step) * step; g <= maxG; g += step) result.push(g);
    return result;
  })();

  // ── SUPPLY bar strip geometry ────────────────────────────────────────
  const SBW = 580;          // supply bar SVG width
  const SBH = 180;
  const sbPad = 12;
  const usableSBW = SBW - 2 * sbPad;
  const dstBarWidth =
    destinations.length > 0
      ? Math.min(80, (usableSBW - 6 * (destinations.length - 1)) / destinations.length)
      : 0;
  const dstGap =
    destinations.length > 1
      ? Math.max(6, (usableSBW - dstBarWidth * destinations.length) / (destinations.length - 1))
      : 0;
  const dstBarX = (idx: number) => sbPad + idx * (dstBarWidth + dstGap);
  const maxInbound = Math.max(1, ...destinations.map((d) => d.inbound));
  const barAreaH = SBH - 56;

  const hoveredSrc = sources.find((s) => s.id === hoverId);
  const hoveredDst = destinations.find((d) => d.id === hoverId);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-tight">
          Demand × Growth · Supply by inbound volume
        </h3>
        <div className="text-[10px] text-muted-foreground font-mono">
          top: outbound vs growth · bottom: inbound supply · hover any country to cross-highlight
        </div>
      </div>

      {/* ── DEMAND scatter ──────────────────────────────────────────── */}
      <div className="border border-border bg-secondary/20">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          {/* Y gridlines + tick labels */}
          {yTicks.map((g) => {
            const y = yScale(g);
            return (
              <g key={`yt-${g}`}>
                <line
                  x1={padL}
                  x2={W - padR}
                  y1={y}
                  y2={y}
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.4}
                  strokeDasharray={g === 0 ? undefined : '2,3'}
                />
                <text
                  x={padL - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fontFamily="monospace"
                  className="fill-muted-foreground"
                >
                  {g >= 0 ? `+${g}%` : `${g}%`}
                </text>
              </g>
            );
          })}

          {/* X gridlines + tick labels */}
          {xTicks.map((v) => {
            const x = xScale(v);
            return (
              <g key={`xt-${v}`}>
                <line
                  x1={x}
                  x2={x}
                  y1={padT}
                  y2={H - padB}
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.3}
                  strokeDasharray="2,3"
                />
                <text
                  x={x}
                  y={H - padB + 14}
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="monospace"
                  className="fill-muted-foreground"
                >
                  {v}K
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <line x1={padL} x2={padL} y1={padT} y2={H - padB} stroke="hsl(var(--border))" />
          <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke="hsl(var(--border))" />

          {/* Axis titles */}
          <text
            x={padL + innerW / 2}
            y={H - 12}
            textAnchor="middle"
            fontSize="10"
            fontFamily="monospace"
            className="fill-muted-foreground"
          >
            Outbound volume (K patients/yr) →
          </text>
          <text
            x={12}
            y={padT + innerH / 2}
            textAnchor="middle"
            fontSize="10"
            fontFamily="monospace"
            className="fill-muted-foreground"
            transform={`rotate(-90 12 ${padT + innerH / 2})`}
          >
            ↑ Growth (% YoY)
          </text>

          {/* Source bubbles — flag inside, label outside below in dark text */}
          {sources.map((s) => {
            const cx = xScale(s.vol);
            const cy = yScale(s.growth);
            const r = sizeFor(s.vol) / 2;
            const fill = sourceColor(s.growth);
            const dim = dimFor(s.id);
            return (
              <g
                key={`src-${s.id}`}
                style={{
                  transform: `translate(${cx}px, ${cy}px)`,
                  transition:
                    'transform 600ms cubic-bezier(0.4, 0, 0.2, 1), opacity 350ms',
                  cursor: 'pointer',
                  opacity: dim ? 0.18 : 1,
                }}
                onMouseEnter={() => setHoverId(s.id)}
                onMouseLeave={() => setHoverId(null)}
              >
                <circle
                  r={r}
                  fill={fill}
                  stroke={hoverId === s.id ? 'hsl(var(--foreground))' : 'transparent'}
                  strokeWidth={2}
                  style={{ transition: 'r 600ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
                <text textAnchor="middle" dy={3} fontSize={r > 20 ? 16 : 12}>
                  {s.flag}
                </text>
                {/* Label OUTSIDE bubble — always dark text on chart background */}
                <text
                  textAnchor="middle"
                  y={r + 12}
                  fontSize="10"
                  fontFamily="monospace"
                  className="fill-foreground"
                  style={{ pointerEvents: 'none' }}
                >
                  {s.label}
                </text>
                <text
                  textAnchor="middle"
                  y={r + 23}
                  fontSize="9"
                  fontFamily="monospace"
                  className="fill-muted-foreground"
                  style={{ pointerEvents: 'none' }}
                >
                  {s.vol}K · +{s.growth}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── SUPPLY section ──────────────────────────────────────────── */}
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
          <div className="text-xs font-semibold tracking-tight">
            Supply — inbound volume {specialty === 'all' ? '(all specialties)' : `(${specialty})`}
          </div>
          <div className="text-[10px] text-muted-foreground font-mono">
            ← hover a bar for details
          </div>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-3">
          {/* Left column — hover details panel */}
          <div className="border border-border bg-background p-3 min-h-[180px]">
            {hoveredSrc ? (
              <DemandDetail src={hoveredSrc} />
            ) : hoveredDst ? (
              <SupplyDetail dst={hoveredDst} />
            ) : (
              <PlaceholderHint />
            )}
          </div>

          {/* Right column — supply bars */}
          <div className="border border-border bg-secondary/20">
            <svg viewBox={`0 0 ${SBW} ${SBH}`} className="w-full h-auto block">
              {destinations.map((d, idx) => {
                const x = dstBarX(idx);
                const w = dstBarWidth;
                const ratio = d.inbound / maxInbound;
                const barH = ratio * barAreaH;
                const barY = sbPad + barAreaH - barH;
                const dim = dimFor(d.id);
                return (
                  <g
                    key={`dst-${d.id}`}
                    onMouseEnter={() => setHoverId(d.id)}
                    onMouseLeave={() => setHoverId(null)}
                    style={{
                      cursor: 'pointer',
                      opacity: dim ? 0.25 : 1,
                      transition: 'opacity 350ms',
                    }}
                  >
                    <rect
                      x={x}
                      y={barY}
                      width={w}
                      height={barH}
                      fill="hsl(28 80% 50%)"
                      stroke={hoverId === d.id ? 'hsl(var(--foreground))' : 'transparent'}
                      strokeWidth={2}
                      style={{ transition: 'y 500ms ease-out, height 500ms ease-out' }}
                    />
                    {/* Inbound volume above bar (always readable) */}
                    <text
                      x={x + w / 2}
                      y={barY - 4}
                      textAnchor="middle"
                      fontSize="9"
                      fontFamily="monospace"
                      className="fill-foreground"
                      style={{ pointerEvents: 'none' }}
                    >
                      {d.inbound}K
                    </text>
                    {/* Flag inside bar bottom (visible against orange) */}
                    <text
                      x={x + w / 2}
                      y={sbPad + barAreaH + 14}
                      textAnchor="middle"
                      fontSize="14"
                      style={{ pointerEvents: 'none' }}
                    >
                      {d.flag}
                    </text>
                    {/* Label below bar */}
                    <text
                      x={x + w / 2}
                      y={sbPad + barAreaH + 28}
                      textAnchor="middle"
                      fontSize="9"
                      fontFamily="monospace"
                      className="fill-foreground"
                      style={{ pointerEvents: 'none' }}
                    >
                      {d.label.length > 9 ? d.label.slice(0, 8) + '…' : d.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Compact ranked corridor list */}
      <details className="text-xs border border-border bg-background">
        <summary className="cursor-pointer px-3 py-2 hover:bg-secondary/40 select-none font-mono uppercase tracking-widest text-[10px] text-muted-foreground">
          See all corridors as a list
        </summary>
        <div className="px-3 pb-3 max-h-[260px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
              <tr className="border-b border-border">
                <th className="text-left py-1 font-normal">Route</th>
                <th className="text-right py-1 font-normal">Vol</th>
                <th className="text-left py-1 pl-3 font-normal hidden sm:table-cell">Note</th>
              </tr>
            </thead>
            <tbody>
              {[...CORRIDORS]
                .filter((c) => specialty === 'all' || c.spec.includes(specialty))
                .filter((c) => !selSrc || c.from === selSrc)
                .filter((c) => !selDst || c.to === selDst)
                .sort((a, b) => b.vol - a.vol)
                .map((c, i) => {
                  const src = LABELS[canon(c.from)];
                  const dst = LABELS[canon(c.to)];
                  return (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-1.5">
                        <span className="font-medium">
                          {src?.flag} {src?.label ?? c.from}
                        </span>
                        <span className="text-muted-foreground mx-1">→</span>
                        <span className="font-medium">
                          {dst?.flag} {dst?.label ?? c.to}
                        </span>
                      </td>
                      <td className="text-right font-mono py-1.5 whitespace-nowrap">{c.vol}K</td>
                      <td className={cn('py-1.5 pl-3 text-muted-foreground hidden sm:table-cell', i > 0 && 'pl-3')}>
                        {c.note}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function DemandDetail({ src }: { src: SrcPoint }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xl">{src.flag}</span>
        <span className="text-sm font-semibold leading-tight">{src.label}</span>
      </div>
      <div
        className="text-[10px] px-2 py-1 font-mono inline-block"
        style={{ backgroundColor: 'hsl(215 70% 48%)', color: 'white' }}
      >
        DEMAND · +{src.growth}% YoY · {src.vol}K outbound
      </div>
      {src.topOutbound.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mt-2 mb-1">
            Top destinations
          </div>
          <ul className="space-y-0.5 text-xs">
            {src.topOutbound.slice(0, 5).map((c) => {
              const lab = LABELS[c.to];
              return (
                <li key={c.to} className="flex justify-between gap-2">
                  <span className="truncate">
                    {lab?.flag} {lab?.label ?? c.to}
                  </span>
                  <span className="font-mono text-muted-foreground shrink-0">{c.vol}K</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function SupplyDetail({ dst }: { dst: DstPoint }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xl">{dst.flag}</span>
        <span className="text-sm font-semibold leading-tight">{dst.label}</span>
      </div>
      <div
        className="text-[10px] px-2 py-1 font-mono inline-block"
        style={{ backgroundColor: 'hsl(28 80% 50%)', color: 'white' }}
      >
        SUPPLY · {dst.inbound}K inbound
      </div>
      {dst.topInbound.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mt-2 mb-1">
            Top inbound sources
          </div>
          <ul className="space-y-0.5 text-xs">
            {dst.topInbound.slice(0, 5).map((c) => {
              const lab = LABELS[c.from];
              return (
                <li key={c.from} className="flex justify-between gap-2">
                  <span className="truncate">
                    {lab?.flag} {lab?.label ?? c.from}
                  </span>
                  <span className="font-mono text-muted-foreground shrink-0">{c.vol}K</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function PlaceholderHint() {
  return (
    <div className="text-xs text-muted-foreground space-y-2">
      <p>
        Hover any bubble (demand) or bar (supply) to see country details and which corridors connect to it.
      </p>
      <div className="pt-2 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3" style={{ backgroundColor: 'hsl(215 70% 48%)' }} />
          <span>Demand bubble</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3" style={{ backgroundColor: 'hsl(28 80% 50%)' }} />
          <span>Supply bar</span>
        </div>
      </div>
    </div>
  );
}
