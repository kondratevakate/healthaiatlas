import { ExternalLink } from 'lucide-react';
import { UAE_ACCELERATORS, type AcceleratorProgram } from '@/data/uaeMarketReality';

const PATTERN_LABEL: Record<AcceleratorProgram['pattern'], string> = {
  'soft-landing': 'Soft-landing',
  launchpad: 'Launchpad',
  research: 'Research',
  'sovereign-grant': 'Sovereign grant',
  sandbox: 'Sandbox',
};

const PATTERN_COLOR: Record<AcceleratorProgram['pattern'], string> = {
  'soft-landing': 'hsl(30 75% 50%)',
  launchpad: 'hsl(155 60% 38%)',
  research: 'hsl(215 80% 55%)',
  'sovereign-grant': 'hsl(280 50% 50%)',
  sandbox: 'hsl(0 0% 50%)',
};

export function AcceleratorGrid() {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {UAE_ACCELERATORS.map((p) => {
        const accent = PATTERN_COLOR[p.pattern];
        return (
          <article
            key={p.id}
            className="border border-border bg-background p-4 space-y-2"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-serif text-base font-bold text-foreground">{p.name}</h3>
              <span
                className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 border shrink-0"
                style={{ borderColor: accent, color: accent }}
              >
                {PATTERN_LABEL[p.pattern]}
              </span>
            </div>

            <div className="text-[11px] font-mono text-muted-foreground">
              {p.owner} · since {p.since}
            </div>

            <p className="text-sm text-foreground/85 leading-relaxed">{p.oneLiner}</p>

            {p.graduates && (
              <details className="group">
                <summary className="cursor-pointer text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors list-none">
                  <span className="group-open:hidden">Cohort detail →</span>
                  <span className="hidden group-open:inline">Hide ↑</span>
                </summary>
                <p className="text-[12px] text-muted-foreground leading-relaxed mt-1.5 italic">
                  {p.graduates}
                </p>
              </details>
            )}

            <a
              href={p.src}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
              title={p.tier === 'secondary' ? 'Secondary source' : 'Primary source'}
            >
              <ExternalLink className="h-3 w-3" />
              Source
              {p.tier === 'secondary' && (
                <span className="text-muted-foreground/80">(2°)</span>
              )}
            </a>
          </article>
        );
      })}
    </div>
  );
}
