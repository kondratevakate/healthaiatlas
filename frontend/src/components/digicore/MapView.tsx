import { useMemo, useState } from 'react';
import { DC_ORG_GROUPS, DC_ORG_MAP, DC_TSNE, type DcOrgPoint } from '@/data/digicore';
import { useIsMobile } from '@/hooks/use-mobile';
import { Group } from './Sources';

const W = 1000;
const H = 600;
const PAD = 24;
const LABELLED = 10; // most-mentioned organisations get a direct label

const COLOR = Object.fromEntries(DC_ORG_GROUPS.map((g) => [g.id, g.color]));
const GROUP_LABEL = Object.fromEntries(DC_ORG_GROUPS.map((g) => [g.id, g.label]));

const px = (p: DcOrgPoint) => PAD + p.x * (W - 2 * PAD);
const py = (p: DcOrgPoint) => PAD + (1 - p.y) * (H - 2 * PAD);

export function MapView() {
  const isMobile = useIsMobile();
  // The SVG is scaled to the container; on a phone marks must be drawn larger to stay visible and tappable.
  const R = isMobile ? 13 : 6;
  const [active, setActive] = useState<DcOrgPoint | null>(null);
  const [pinned, setPinned] = useState<DcOrgPoint | null>(null);
  const shown = pinned ?? active;

  // Most-mentioned first; a label is skipped when it would overlap one already placed.
  const labelled = useMemo(() => {
    const placed: DcOrgPoint[] = [];
    for (const p of [...DC_ORG_MAP].sort((a, b) => b.mentions - a.mentions)) {
      if (placed.length === LABELLED) break;
      const w = p.name.length * 7.5;
      if (placed.every((q) => Math.abs(py(q) - py(p)) > 20 || Math.abs(px(q) - px(p)) > Math.max(w, q.name.length * 7.5) + 16)) {
        placed.push(p);
      }
    }
    return new Set(placed.map((p) => p.name));
  }, []);
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of DC_ORG_MAP) m[p.group] = (m[p.group] ?? 0) + 1;
    return m;
  }, []);

  return (
    <div>
      <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs" aria-label="Groups">
        {DC_ORG_GROUPS.map((g) => (
          <li key={g.id} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5" style={{ backgroundColor: g.color }} aria-hidden />
            {g.label}
            <span className="font-mono text-muted-foreground">{counts[g.id] ?? 0}</span>
          </li>
        ))}
      </ul>

      <div className="relative border border-border/40" onMouseLeave={() => setActive(null)}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full"
          role="img"
          aria-label={`t-SNE map of ${DC_ORG_MAP.length} organisations named in the workshop material`}
          onClick={() => setPinned(null)}
        >
          {DC_ORG_MAP.map((p) => {
            const on = shown?.name === p.name;
            return (
              <g key={p.name}>
                <circle
                  cx={px(p)}
                  cy={py(p)}
                  r={on ? R * 1.5 : R}
                  style={{ fill: COLOR[p.group], stroke: 'hsl(var(--background))' }}
                  strokeWidth={isMobile ? 4 : 2}
                />
                {/* hit target larger than the mark */}
                <circle
                  cx={px(p)}
                  cy={py(p)}
                  r={R * 2.3}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setActive(p)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPinned(pinned?.name === p.name ? null : p);
                  }}
                >
                  <title>{p.name}</title>
                </circle>
              </g>
            );
          })}
          {!isMobile && DC_ORG_MAP.filter((p) => labelled.has(p.name)).map((p) => (
            <text
              key={`l-${p.name}`}
              x={px(p) + (p.x > 0.8 ? -10 : 10)}
              y={py(p) + 4}
              textAnchor={p.x > 0.8 ? 'end' : 'start'}
              className="pointer-events-none select-none"
              style={{
                fill: 'hsl(var(--foreground))',
                fontSize: 13,
                stroke: 'hsl(var(--background))',
                strokeWidth: 4,
                paintOrder: 'stroke',
              }}
            >
              {p.name}
            </text>
          ))}
        </svg>

        {shown && (
          <div
            className={
              isMobile
                ? 'border-t border-border bg-background p-3 text-xs'
                : 'absolute z-10 w-64 border border-border bg-background p-3 text-xs shadow-sm'
            }
            style={
              isMobile
                ? undefined
                : px(shown) / W < 0.55
                  // Left half: box to the right of the dot; right half: box to the left, so it never leaves the frame.
                  ? { left: `${(px(shown) / W) * 100}%`, top: `${Math.min(py(shown) / H, 0.6) * 100}%`, transform: 'translate(12px, 12px)' }
                  : { right: `${(1 - px(shown) / W) * 100}%`, top: `${Math.min(py(shown) / H, 0.6) * 100}%`, transform: 'translate(-12px, 12px)' }
            }
          >
            <p className="font-semibold leading-snug">{shown.name}</p>
            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
              {shown.type} · {GROUP_LABEL[shown.group]} · {shown.mentions} mention{shown.mentions === 1 ? '' : 's'}
            </p>
            <p className="mt-1.5 leading-snug">{shown.desc}</p>
            {shown.src && (
              <a
                href={shown.src}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-block underline underline-offset-2"
              >
                Source{shown.companyClaim ? ' (company claim)' : ''}
              </a>
            )}
          </div>
        )}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Each dot is one organisation or company named in the workshop decks ({DC_ORG_MAP.length}; not included: {DC_TSNE.excluded}).
        Position: t-SNE of the {DC_TSNE.features}; perplexity {DC_TSNE.perplexity}, {DC_TSNE.metric} distance,{' '}
        {DC_TSNE.init.toUpperCase()} start, seed {DC_TSNE.seed}. Nearby dots are described in similar words; distances
        between clusters and the axes carry no meaning. Groups are a first-pass grouping of the workshop registry.
      </p>

      <div className="mt-6">
        {DC_ORG_GROUPS.map((g) => {
          const list = DC_ORG_MAP.filter((p) => p.group === g.id);
          return (
            <Group key={g.id} title={g.label} count={list.length}>
              <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {list.map((p) => (
                  <li key={p.name} className="text-xs leading-snug">
                    {p.src ? (
                      <a href={p.src} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-2">
                        {p.name}
                      </a>
                    ) : (
                      <span className="font-medium">{p.name}</span>
                    )}
                    {p.companyClaim && <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">company claim</span>}
                    <span className="block text-muted-foreground">{p.desc}</span>
                  </li>
                ))}
              </ul>
            </Group>
          );
        })}
      </div>
    </div>
  );
}
