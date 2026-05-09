import { ExternalLink } from 'lucide-react';
import { UK_FUNDING_ROUNDS, type UkFundingRound } from '@/data/ukMarketReality';
import { cn } from '@/lib/utils';

const TYPE_LABEL: Record<UkFundingRound['type'], string> = {
  funding: 'Funding',
  acquisition: 'Acquisition',
  delisting: 'Delisting',
  merger: 'Merger',
};

const TYPE_TONE: Record<UkFundingRound['type'], string> = {
  funding: 'border-emerald-600/50 text-emerald-700 dark:text-emerald-400',
  acquisition: 'border-blue-600/50 text-blue-700 dark:text-blue-400',
  delisting: 'border-destructive/60 text-destructive',
  merger: 'border-amber-600/50 text-amber-700 dark:text-amber-400',
};

export function FundingRounds() {
  return (
    <div className="space-y-4">
      <p className="text-[12px] text-muted-foreground italic max-w-3xl">
        Five named cases between Nov 2024 and Mar 2025. Two large-scale funding successes
        (Isomorphic, Cera) — both with operator-clinician founders. Three exit failures
        (BenevolentAI delist, Exscientia merger, Babylon collapse — see next block) frame
        the IPO closure for UK healthcare AI in the post-SPAC reset.
      </p>

      <div className="space-y-3">
        {UK_FUNDING_ROUNDS.map((c) => (
          <article key={c.id} className="border border-border bg-background p-4 space-y-2">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <h4 className="font-serif text-base font-bold text-foreground">{c.company}</h4>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={cn(
                    'text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 border',
                    TYPE_TONE[c.type],
                  )}
                >
                  {TYPE_LABEL[c.type]}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">{c.date}</span>
              </div>
            </div>
            <div className="font-mono text-base text-primary font-bold">{c.amount}</div>
            <p className="text-[12px] text-foreground/85 leading-relaxed">{c.detail}</p>
            <div className="border-l-2 border-primary/40 pl-2 py-0.5">
              <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-0.5">
                Founder
              </div>
              <p className="text-[12px] text-foreground/80 italic leading-relaxed">{c.founder}</p>
            </div>
            <a
              href={c.src}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
              title={c.tier === 'secondary' ? 'Secondary source' : 'Primary source'}
            >
              <ExternalLink className="h-3 w-3" />
              Source
              {c.tier === 'secondary' && <span className="text-muted-foreground/80">(2°)</span>}
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
