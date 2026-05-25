import { ExternalLink } from 'lucide-react';
import { UK_AIRLOCK_COHORT } from '@/data/ukMarketReality';

export function AirlockCohort() {
  return (
    <div className="space-y-4">
      <p className="text-[12px] text-muted-foreground italic max-w-3xl">
        AI Airlock pilot ran April 2024 – March 2025; report published October 2025. ~40
        applications received; 44% from micro-SMEs (&lt;10 employees). Final cohort of four case
        studies surfaced the unaddressed regulatory gaps: synthetic data, explainability, LLM
        hallucination risk, post-market continuous monitoring.
      </p>

      <div className="grid md:grid-cols-2 gap-3">
        {UK_AIRLOCK_COHORT.map((p) => (
          <article key={p.id} className="border border-border bg-background p-4 space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <h4 className="heading-editorial-card">{p.organisation}</h4>
                <div className="text-[11px] text-muted-foreground italic">{p.name}</div>
              </div>
              <a
                href={p.src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium shrink-0"
                title={p.tier === 'secondary' ? 'Secondary source' : 'Primary source'}
              >
                <ExternalLink className="h-3 w-3" />
                {p.tier === 'secondary' && (
                  <span className="text-muted-foreground/80">(2°)</span>
                )}
              </a>
            </div>

            <p className="text-[12px] text-foreground/85 leading-relaxed">{p.product}</p>

            <div className="border-l-2 border-primary/40 pl-2 py-0.5">
              <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-0.5">
                Regulatory challenge
              </div>
              <p className="text-[12px] text-foreground/85 italic leading-relaxed">{p.challenge}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
