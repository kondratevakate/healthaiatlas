import { ExternalLink } from 'lucide-react';
import { UK_REGULATORY_LAYERS } from '@/data/ukMarketReality';

export function RegulatoryGrammar() {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {UK_REGULATORY_LAYERS.map((l) => (
        <article key={l.id} className="border border-border bg-background p-4 space-y-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="heading-editorial-card">{l.name}</h3>
            <span className="text-[10px] font-mono text-muted-foreground shrink-0 text-right">
              {l.enteredForce}
            </span>
          </div>
          <div className="text-[10px] font-mono text-muted-foreground/80">{l.regulationName}</div>

          <p className="text-sm text-foreground/85 leading-relaxed italic">{l.oneLiner}</p>

          <div>
            <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1">
              Phased application
            </div>
            <ul className="space-y-0.5 text-[11px]">
              {l.phased.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-foreground/80 leading-relaxed">
                  <span className="font-mono text-muted-foreground tabular-nums shrink-0 min-w-[88px]">
                    {p.date}
                  </span>
                  <span>{p.what}</span>
                </li>
              ))}
            </ul>
          </div>

          <details className="group">
            <summary className="cursor-pointer text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground list-none">
              <span className="group-open:hidden">Scope + penalties →</span>
              <span className="hidden group-open:inline">Hide ↑</span>
            </summary>
            <div className="mt-2 space-y-1.5 text-[11px] text-muted-foreground leading-relaxed">
              <p>{l.scope}</p>
              {l.penalties && (
                <p className="border-l-2 border-destructive/40 pl-2 italic">{l.penalties}</p>
              )}
            </div>
          </details>

          <a
            href={l.src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
            title={l.tier === 'secondary' ? 'Secondary source' : 'Primary source'}
          >
            <ExternalLink className="h-3 w-3" />
            Source
            {l.tier === 'secondary' && <span className="text-muted-foreground/80">(2°)</span>}
          </a>
        </article>
      ))}
    </div>
  );
}
