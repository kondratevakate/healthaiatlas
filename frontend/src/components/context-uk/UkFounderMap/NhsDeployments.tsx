import { ExternalLink, AlertTriangle } from 'lucide-react';
import { UK_NHS_DEPLOYMENTS } from '@/data/ukMarketReality';

export function NhsDeployments() {
  return (
    <div className="space-y-4">
      <p className="text-[12px] text-muted-foreground italic max-w-3xl">
        NHS as buyer is real but four-nation. Verified deployments at scale (Brainomix, Annalise,
        Skin Analytics) sit alongside vendor-claim positions where NHS England primary procurement
        sources could not be located in research — flagged with{' '}
        <span className="inline-flex items-center gap-1 align-middle">
          <AlertTriangle className="h-3 w-3 inline" /> vendor claim
        </span>
        .
      </p>

      <div className="space-y-3">
        {UK_NHS_DEPLOYMENTS.map((d) => (
          <article key={d.id} className="border border-border bg-background p-4 space-y-2">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <div className="flex items-baseline gap-2">
                <h4 className="font-serif text-base font-bold text-foreground">{d.vendor}</h4>
                <span className="font-mono text-[10px] text-muted-foreground">
                  ({d.vendorHq})
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {d.tier === 'secondary' && d.note && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 border border-amber-600/50 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-2.5 w-2.5" />
                    Vendor claim
                  </span>
                )}
                <a
                  href={d.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                  title={d.tier === 'secondary' ? 'Secondary source' : 'Primary source'}
                >
                  <ExternalLink className="h-3 w-3" />
                  Source
                  {d.tier === 'secondary' && (
                    <span className="text-muted-foreground/80">(2°)</span>
                  )}
                </a>
              </div>
            </div>

            <div className="grid md:grid-cols-[140px_1fr] gap-x-3 gap-y-1 text-[12px]">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Product
              </div>
              <div className="text-foreground/90">
                <span className="font-semibold">{d.product}</span>
                <span className="text-muted-foreground"> — {d.useCase}</span>
              </div>

              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Status
              </div>
              <div className="text-foreground/85 leading-relaxed">{d.status}</div>

              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Scale
              </div>
              <div className="text-foreground/85 leading-relaxed">{d.scale}</div>
            </div>

            {d.note && (
              <p className="text-[11px] text-muted-foreground italic border-l-2 border-amber-600/40 pl-2 leading-relaxed">
                {d.note}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
