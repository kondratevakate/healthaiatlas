import { ExternalLink, ScrollText, ChevronDown } from 'lucide-react';
import { UK_REGULATORY_LAYERS } from '@/data/ukMarketReality';

const DEFAULT_OPEN_LAYERS = new Set(['mhra', 'nice-esf-dtac']);

function SectionHeader({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-primary">{icon}</span>
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono font-medium">
          {title}
        </h3>
      </div>
      {hint && <p className="text-[11px] text-muted-foreground/80 leading-snug mb-3">{hint}</p>}
    </div>
  );
}

export function UkSidebar() {
  return (
    <div className="space-y-8 p-4">
      <section>
        <SectionHeader
          icon={<ScrollText className="h-4 w-4" />}
          title="Regulatory pillars"
          hint="The four UK regulatory layers a healthcare-AI startup must navigate. Post-Brexit three-layer architecture (MHRA / NICE / NHS) — each on a different timeline and decision logic."
        />
        <div className="space-y-2">
          {UK_REGULATORY_LAYERS.map((l) => {
            const open = DEFAULT_OPEN_LAYERS.has(l.id);
            return (
              <details
                key={l.id}
                open={open}
                className="border border-border bg-background group open:border-foreground/40"
              >
                <summary className="cursor-pointer p-3 list-none space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold text-foreground">{l.name}</div>
                    <div className="flex items-center gap-2 shrink-0">
                      <ChevronDown
                        className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground/80 line-clamp-2">
                    {l.regulationName}
                  </div>
                  <p className="text-[11px] text-foreground/85 leading-relaxed italic">
                    {l.oneLiner}
                  </p>
                </summary>

                <div className="px-3 pb-3 pt-0 space-y-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1">
                      Phased application
                    </div>
                    <ul className="space-y-0.5 text-[11px]">
                      {l.phased.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-foreground/85 leading-relaxed">
                          <span className="font-mono text-muted-foreground tabular-nums shrink-0 min-w-[80px]">
                            {p.date}
                          </span>
                          <span>{p.what}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {l.penalties && (
                    <p className="text-[11px] text-muted-foreground italic border-l-2 border-destructive/40 pl-2 leading-relaxed">
                      {l.penalties}
                    </p>
                  )}

                  <a
                    href={l.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                    title={l.tier === 'secondary' ? 'Secondary source' : 'Primary source'}
                  >
                    <ExternalLink className="h-3 w-3" /> Source
                    {l.tier === 'secondary' && (
                      <span className="text-muted-foreground/80">(2°)</span>
                    )}
                  </a>
                </div>
              </details>
            );
          })}
        </div>
      </section>
    </div>
  );
}
