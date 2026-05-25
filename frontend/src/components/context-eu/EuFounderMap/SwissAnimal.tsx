import { ExternalLink, Mountain } from 'lucide-react';
import { SWISS_PROFILE, SWISS_TAGLINE, type SwissNote } from '@/data/euMarketReality';
import { cn } from '@/lib/utils';

const KIND_TONE: Record<SwissNote['kind'], string> = {
  separation: 'border-destructive/50 text-destructive',
  reset: 'border-emerald-600/50 text-emerald-700 dark:text-emerald-400',
  'pharma-gravity': 'border-blue-600/50 text-blue-700 dark:text-blue-400',
  'use-for': 'border-emerald-600/50 text-emerald-700 dark:text-emerald-400',
  'avoid-for': 'border-destructive/60 text-destructive',
};

const KIND_LABEL: Record<SwissNote['kind'], string> = {
  separation: 'Institutional separation',
  reset: 'Reset',
  'pharma-gravity': 'Pharma gravity',
  'use-for': 'Use for',
  'avoid-for': "Don't use for",
};

// Use a distinct visual treatment to make Switzerland's institutional
// separation visible at a glance: warmer accent, "outside EU" banner.
const SWISS_ACCENT = 'hsl(0 75% 45%)'; // Swiss flag red

export function SwissAnimal() {
  return (
    <div
      className="border-l-4 pl-5 pr-4 py-4 space-y-4"
      style={{
        borderColor: SWISS_ACCENT,
        background: `linear-gradient(135deg, ${SWISS_ACCENT.replace(')', ' / 0.04)')} 0%, transparent 100%)`,
      }}
    >
      <header>
        <div className="flex items-center gap-2 mb-1">
          <Mountain className="h-4 w-4" style={{ color: SWISS_ACCENT }} />
          <h3 className="font-serif text-lg font-bold text-foreground">
            Switzerland — separate institutional animal
          </h3>
        </div>
        <p
          className="text-[10px] uppercase tracking-widest font-mono"
          style={{ color: SWISS_ACCENT }}
        >
          🇨🇭 Not in EU · Not in EEA · Lost MRA 2021 · Re-associated Horizon 2025
        </p>
      </header>

      <p className="text-sm text-foreground italic font-serif border-l-2 pl-3" style={{ borderColor: SWISS_ACCENT }}>
        {SWISS_TAGLINE}
      </p>

      <div className="space-y-3">
        {SWISS_PROFILE.map((n) => (
          <article key={n.id} className="border border-border bg-background p-3 space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="heading-editorial-card-sm">{n.title}</h4>
              <span
                className={cn(
                  'text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 border shrink-0',
                  KIND_TONE[n.kind],
                )}
              >
                {KIND_LABEL[n.kind]}
              </span>
            </div>
            <p className="text-[12px] text-foreground/85 leading-relaxed">{n.body}</p>
            {n.src && (
              <a
                href={n.src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                title={n.tier === 'secondary' ? 'Secondary source' : 'Primary source'}
              >
                <ExternalLink className="h-3 w-3" />
                Source
                {n.tier === 'secondary' && <span className="text-muted-foreground/80">(2°)</span>}
              </a>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
