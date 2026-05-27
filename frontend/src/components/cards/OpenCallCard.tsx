// OpenCallCard — Product-Hunt-style card in the project's editorial dialect
// (square corners, hard borders, no soft drop-shadows). Each card renders one
// OpenCallEntry with a brand favicon, a countdown chip, region + category
// metadata, and an "Apply" CTA.
//
// The favicon is fetched from DuckDuckGo's icon service. That sends one HTTPS
// hit per card to a third party — acceptable for a public editorial directory
// but documented here so it is visible during privacy review.

import { useMemo, useState } from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  OpenCallEntry,
  categoryLabel,
  categoryGlyph,
} from '@/data/openCallEntries';
import { useCountdown, CountdownTone } from '@/lib/countdown';

const toneClass: Record<CountdownTone, string> = {
  urgent: 'border-foreground bg-foreground text-background',
  soon: 'border-foreground text-foreground',
  distant: 'border-border text-muted-foreground',
  rolling: 'border-border text-muted-foreground',
  annual: 'border-border text-muted-foreground',
  closed: 'border-border text-muted-foreground/60 line-through',
  past: 'border-border text-muted-foreground/60 line-through',
};

interface OpenCallCardProps {
  entry: OpenCallEntry;
  className?: string;
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function OpenCallCard({ entry, className }: OpenCallCardProps) {
  const countdown = useCountdown(entry.countdown);
  const [logoFailed, setLogoFailed] = useState(false);
  const host = useMemo(() => hostnameOf(entry.url), [entry.url]);
  const faviconUrl = host ? `https://icons.duckduckgo.com/ip3/${host}.ico` : '';

  return (
    <article
      className={cn(
        'group relative flex flex-col border border-border bg-card rounded-lg p-4 transition-colors',
        'hover:border-foreground/20',
        className,
      )}
    >
      {/* Top row: logo + countdown chip */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-10 h-10 shrink-0 border border-border bg-background flex items-center justify-center overflow-hidden">
          {faviconUrl && !logoFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={faviconUrl}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-6 h-6 object-contain"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span className="font-mono text-base font-semibold text-muted-foreground">
              {categoryGlyph[entry.category]}
            </span>
          )}
        </div>

        <span
          className={cn(
            'shrink-0 inline-flex items-center px-2 py-1 text-[10px] font-mono uppercase tracking-widest border whitespace-nowrap',
            toneClass[countdown.tone],
          )}
          aria-label={`Countdown: ${countdown.label}`}
        >
          {countdown.label}
        </span>
      </div>

      {/* Title + organizer */}
      <h3 className="font-semibold text-foreground leading-snug line-clamp-2 mb-1">
        {entry.title}
      </h3>
      <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
        {entry.organizer}
      </p>

      {/* Meta row: region, category, amount */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <Badge variant="outline" className="rounded-none text-[10px] uppercase">
          {entry.region}
        </Badge>
        <Badge variant="secondary" className="rounded-none text-[10px] capitalize">
          {categoryLabel[entry.category]}
        </Badge>
        {entry.amount && (
          <span className="text-[10px] font-mono text-muted-foreground line-clamp-1">
            {entry.amount}
          </span>
        )}
      </div>

      {/* Notes / audience excerpt */}
      {(entry.notes || entry.audience) && (
        <p className="text-xs text-foreground/70 line-clamp-3 mb-4">
          {entry.notes ?? entry.audience}
        </p>
      )}

      {/* Spacer pushes footer to bottom in equal-height grid rows */}
      <div className="flex-1" />

      {/* Footer: primary CTA + source link */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
        <Button
          asChild
          size="sm"
          variant="outline"
          className="rounded-none gap-1 font-mono text-xs h-8"
        >
          <a href={entry.url} target="_blank" rel="noopener noreferrer">
            Apply
            <ArrowRight className="w-3 h-3" />
          </a>
        </Button>
        <a
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground"
          aria-label={`Source: ${host}`}
        >
          {host}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {entry.verifiedAt && (
        <p className="absolute bottom-1 right-2 text-[9px] font-mono text-muted-foreground/40">
          ✓ {entry.verifiedAt}
        </p>
      )}
    </article>
  );
}
