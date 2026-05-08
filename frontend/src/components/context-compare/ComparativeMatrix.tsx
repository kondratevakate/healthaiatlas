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
          ★ <span style={{ color: 'hsl(14 90% 55%)' }}>Compare all four</span> · 2026 · the founder-decision question rendered as a snapshot
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
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
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
            <p className="text-[12px] text-foreground/85 leading-relaxed italic">
              {REGION_HEADLINE[r]}
            </p>
          </article>
        ))}
      </div>

      {/* The compare table — one row per metric */}
      <div className="space-y-4">
        {COMPARE_ROWS.map((row) => (
          <article key={row.id} className="border border-border bg-background p-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {REGIONS.map((r) => {
                const cell = row.values[r];
                return (
                  <div
                    key={r}
                    className="border-l-2 pl-3 py-1"
                    style={{ borderColor: REGION_ACCENTS[r] }}
                  >
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[10px]">{REGION_FLAGS[r]}</span>
                        <span
                          className="font-mono text-[10px] uppercase tracking-widest font-semibold"
                          style={{ color: REGION_ACCENTS[r] }}
                        >
                          {REGION_LABELS[r]}
                        </span>
                      </div>
                      {cell.ratio && (
                        <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                          {cell.ratio}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-foreground/90 leading-relaxed">{cell.text}</p>
                  </div>
                );
              })}
            </div>
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
