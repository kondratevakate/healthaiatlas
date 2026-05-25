import { ExternalLink, ChevronDown } from 'lucide-react';
import { UK_BABYLON_CASE } from '@/data/ukMarketReality';

export function BabylonCase() {
  return (
    <div className="space-y-4">
      <div className="border-l-4 border-destructive bg-destructive/5 p-4 space-y-2">
        <p className="text-[12px] text-foreground/90 leading-relaxed max-w-3xl">
          <strong>Babylon is the bridge case to US SPAC era — not a single-cause AI-quality story.</strong>{' '}
          The compressed chain: Rwanda contract (2016) → NHS GP at Hand London launch (Nov 2017) →
          Lancet/BMJ safety dispute (2018) → Matt Hancock political endorsement → CCG financial
          destabilisation (2018–19) → US expansion → NYSE SPAC via Alkuri Global at $4.2bn (Oct
          2021) → Centene contract loss (2023) → MindMaze take-private collapse (Aug 2023) →
          Chapter 7 (9 Aug 2023) → UK administration → £500K asset sale to eMed (30/31 Aug 2023).
        </p>
        <p className="text-[11px] text-muted-foreground italic max-w-3xl">
          Treat as the UK parallel to Aduhelm in the US tab — a structural failure case, not a
          clickbait headline. Capital structure preceded clinical evidence; regulatory authority
          blocked at a different layer than expected (NHS payor + capital market, not CQC/MHRA);
          loss event was unit-economic.
        </p>
      </div>

      <div className="space-y-2">
        {UK_BABYLON_CASE.map((s, i) => (
          <details
            key={s.id}
            className="border border-border bg-background group open:border-foreground/40"
          >
            <summary className="cursor-pointer p-3 list-none">
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h4 className="heading-editorial-card-sm">{s.title}</h4>
                  <span className="font-mono text-[10px] text-muted-foreground border border-border px-1.5 py-0.5">
                    {s.period}
                  </span>
                </div>
                <ChevronDown
                  className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180 shrink-0"
                  aria-hidden="true"
                />
              </div>
            </summary>

            <div className="px-3 pb-3 pt-0 space-y-2">
              <p className="text-[12px] text-foreground/85 leading-relaxed">{s.body}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {s.keySources.map((k, j) => (
                  <a
                    key={j}
                    href={k.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                    title={k.tier === 'secondary' ? 'Secondary source' : 'Primary source'}
                  >
                    <ExternalLink className="h-3 w-3" />
                    {k.label}
                    {k.tier === 'secondary' && (
                      <span className="text-muted-foreground/80">(2°)</span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
