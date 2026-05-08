import { ExternalLink, GitCompare } from 'lucide-react';
import {
  COMPARE_ROWS,
  REGION_LABELS,
  REGION_FLAGS,
  REGION_ACCENTS,
  REGION_HEADLINE,
  type Region,
} from '@/data/comparativeMatrix';

const REGIONS: Region[] = ['us', 'eu', 'ch', 'uae', 'uk'];

export function ComparativeMatrix() {
  return (
    <section className="space-y-8">
      <header>
        <div
          className="text-[10px] uppercase tracking-widest font-mono italic text-muted-foreground mb-2"
        >
          ★ <span style={{ color: 'hsl(14 90% 55%)' }}>Compare all five</span> · 2026 · the founder-decision question rendered as a snapshot
        </div>

        <div className="flex items-center gap-2 mb-2">
          <GitCompare className="h-5 w-5" style={{ color: 'hsl(180 70% 40%)' }} />
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
            US · EU · Switzerland · UAE · UK
          </h2>
        </div>
        <p className="text-sm text-foreground/85 leading-relaxed max-w-3xl">
          Same questions, different answers per market. Eight rows. Each cell links to the same
          primary source the per-region tab cites in detail. Switch back to a single-region tab
          for the full argument; this view exists to make the order-of-magnitude differences
          visible at a glance.
        </p>
      </header>

      {/* Region headline diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {REGIONS.map((r) => (
          <article
            key={r}
            className="border-l-4 pl-4 py-3 bg-background"
            style={{ borderColor: REGION_ACCENTS[r] }}
          >
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-base">{REGION_FLAGS[r]}</span>
              <h3
                className="font-serif text-base font-bold"
                style={{ color: REGION_ACCENTS[r] }}
              >
                {REGION_LABELS[r]}
              </h3>
            </div>
            <p className="text-[13px] text-foreground/90 leading-relaxed italic">
              {REGION_HEADLINE[r]}
            </p>
          </article>
        ))}
      </div>

      {/* The compare table — one card per metric, vertical region rows inside.
          Avoids the 5-column-grid cramming where each cell got 1/5 width for
          long text like "$2–4 bn estimated; Q3 2025 $409m UK-only". Now each
          region gets a full-width row inside its metric card. */}
      <div className="space-y-4">
        {COMPARE_ROWS.map((row) => (
          <article key={row.id} className="border border-border bg-background p-4 md:p-5">
            <header className="mb-3 pb-3 border-b border-border">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-serif text-base md:text-lg font-bold text-foreground">
                  {row.metric}
                </h3>
                <a
                  href={row.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium shrink-0"
                  title={row.tier === 'secondary' ? 'Secondary source' : 'Primary source'}
                >
                  <ExternalLink className="h-3 w-3" />
                  Source
                  {row.tier === 'secondary' && (
                    <span className="text-muted-foreground/80">(2°)</span>
                  )}
                </a>
              </div>
              <p className="text-[12px] text-muted-foreground italic mt-1 max-w-3xl">
                {row.intent}
              </p>
            </header>

            <ul className="divide-y divide-border/60">
              {REGIONS.map((r) => {
                const cell = row.values[r];
                return (
                  <li
                    key={r}
                    className="grid grid-cols-[auto_1fr_auto] items-baseline gap-x-3 gap-y-1 py-2.5 first:pt-0 last:pb-0"
                  >
                    {/* Region label — fixed-width column so values line up across rows */}
                    <div
                      className="flex items-baseline gap-1.5 border-l-2 pl-2 min-w-[88px] md:min-w-[112px]"
                      style={{ borderColor: REGION_ACCENTS[r] }}
                    >
                      <span className="text-[12px]">{REGION_FLAGS[r]}</span>
                      <span
                        className="font-mono text-[10px] uppercase tracking-widest font-semibold"
                        style={{ color: REGION_ACCENTS[r] }}
                      >
                        {REGION_LABELS[r]}
                      </span>
                    </div>

                    {/* Value text — gets the bulk of the width */}
                    <p className="text-[13px] text-foreground/90 leading-relaxed">{cell.text}</p>

                    {/* Ratio chip — right-aligned, fixed for visual scanning */}
                    {cell.ratio ? (
                      <span className="font-mono text-[11px] text-muted-foreground tabular-nums whitespace-nowrap text-right min-w-[72px]">
                        {cell.ratio}
                      </span>
                    ) : (
                      <span className="min-w-[72px]" aria-hidden="true" />
                    )}
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground font-mono italic">
        <span className="opacity-70">(2°)</span> = secondary source. Direction consistent across
        analysts; absolute numbers can vary 2× between vendors. Switch to a region tab for the
        full primary-source breakdown.
      </p>
    </section>
  );
}
