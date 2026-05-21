import { ExternalLink } from 'lucide-react';
import { UK_NICE_REJECTION, type NiceRejectionEvent } from '@/data/ukMarketReality';
import { cn } from '@/lib/utils';

const OUTCOME_TONE: Record<NiceRejectionEvent['outcome'], string> = {
  approved: 'border-emerald-600/50 text-emerald-700 dark:text-emerald-400',
  rejected: 'border-destructive/60 text-destructive',
  narrowed: 'border-amber-600/50 text-amber-700 dark:text-amber-400',
  consultation: 'border-blue-600/50 text-blue-700 dark:text-blue-400',
};

const DRUG_TONE: Record<NiceRejectionEvent['drug'], string> = {
  'donanemab (Kisunla)': 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200',
  'lecanemab (Leqembi)': 'bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200',
};

export function NiceRejection() {
  return (
    <div className="space-y-4">
      <p className="text-[12px] text-muted-foreground italic max-w-3xl">
        The cleanest 2024–2026 case of NICE acting as a <em>de facto</em> global HTA benchmark.
        NICE concluded the drugs delay progression by 4–6 months but at unjustifiable cost +
        ARIA-monitoring burden. G-BA (Germany), HAS (France) and SMC reached substantively similar
        conclusions — the decision logic, not just the decision, has become an export.
      </p>

      <div className="border border-border bg-background">
        <div className="hidden sm:grid sm:grid-cols-[110px_90px_1fr_auto] gap-3 items-baseline px-4 py-2 border-b border-border bg-secondary/30 text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
          <span>Date</span>
          <span>Agency</span>
          <span>Detail</span>
          <span>Source</span>
        </div>
        <div className="divide-y divide-border">
          {UK_NICE_REJECTION.map((e) => (
            <div
              key={e.id}
              className="grid grid-cols-1 sm:grid-cols-[110px_90px_1fr_auto] gap-x-3 gap-y-2 items-baseline px-4 py-3 text-[12px] hover:bg-secondary/40 transition-colors"
            >
              <div className="flex items-baseline gap-2 sm:contents">
                <div className="font-mono text-muted-foreground tabular-nums">{e.date}</div>
                <div className="font-mono text-foreground font-semibold">{e.agency}</div>
              </div>
              <div className="text-foreground/85 leading-relaxed">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className={cn(
                      'text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 border',
                      OUTCOME_TONE[e.outcome],
                    )}
                  >
                    {e.outcome}
                  </span>
                  <span
                    className={cn(
                      'text-[9px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded-sm',
                      DRUG_TONE[e.drug],
                    )}
                  >
                    {e.drug}
                  </span>
                </div>
                <div>{e.detail}</div>
              </div>
              <a
                href={e.src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium shrink-0 justify-self-start sm:justify-self-auto"
                title={e.tier === 'secondary' ? 'Secondary source' : 'Primary source'}
              >
                <ExternalLink className="h-3 w-3" />
                {e.tier === 'secondary' && (
                  <span className="text-muted-foreground/80">(2°)</span>
                )}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
