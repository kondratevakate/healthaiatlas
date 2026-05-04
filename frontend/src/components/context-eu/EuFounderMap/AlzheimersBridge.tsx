import { ExternalLink } from 'lucide-react';
import { EU_ALZHEIMERS_BRIDGE, type BridgeOutcome } from '@/data/euMarketReality';
import { cn } from '@/lib/utils';

const OUTCOME_TONE: Record<BridgeOutcome['outcome'], string> = {
  approved: 'border-emerald-600/50 text-emerald-700 dark:text-emerald-400',
  narrowed: 'border-amber-600/50 text-amber-700 dark:text-amber-400',
  refused: 'border-destructive/60 text-destructive',
  restricted: 'border-destructive/60 text-destructive',
  withdrawn: 'border-destructive/80 text-destructive',
};

export function AlzheimersBridge() {
  return (
    <div className="space-y-4">
      <p className="text-[12px] text-muted-foreground italic max-w-3xl">
        Three drugs, three pathways. The cleanest comparative case across FDA / CMS / EMA / EC /
        national-HTA action situations in the last five years. Same drug class, different outcomes
        per regulator.
      </p>

      <div className="space-y-5">
        {EU_ALZHEIMERS_BRIDGE.map((c) => (
          <article key={c.id} className="border border-border bg-background p-4">
            <header className="mb-3 pb-3 border-b border-border">
              <h3 className="font-serif text-base font-bold text-foreground">{c.drug}</h3>
              <div className="text-[11px] text-muted-foreground">{c.manufacturer}</div>
              <p className="text-[12px] text-foreground/85 italic mt-2 leading-relaxed">
                {c.finalState}
              </p>
            </header>

            <div className="space-y-2">
              {c.outcomes.map((o, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[120px_1fr_auto] gap-3 items-baseline text-[12px]"
                >
                  <div className="font-mono text-foreground font-semibold">{o.agency}</div>
                  <div className="text-foreground/85 leading-relaxed">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span
                        className={cn(
                          'text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 border',
                          OUTCOME_TONE[o.outcome],
                        )}
                      >
                        {o.outcome}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">{o.date}</span>
                    </div>
                    <div>{o.detail}</div>
                  </div>
                  <a
                    href={o.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium shrink-0"
                    title={o.tier === 'secondary' ? 'Secondary source' : 'Primary source'}
                  >
                    <ExternalLink className="h-3 w-3" />
                    {o.tier === 'secondary' && (
                      <span className="text-muted-foreground/80">(2°)</span>
                    )}
                  </a>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
