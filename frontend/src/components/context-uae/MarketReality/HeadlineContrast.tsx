import { ExternalLink } from 'lucide-react';
import { UAE_CONTRAST } from '@/data/uaeMarketReality';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export function HeadlineContrast() {
  const isMobile = useIsMobile();
  const ratioClass = (ratio: string) =>
    ratio === '0%' || ratio === 'binary' ? 'text-destructive' : 'text-primary';

  if (isMobile) {
    return (
      <div className="space-y-2">
        {UAE_CONTRAST.map((row) => (
          <article
            key={row.id}
            className="border border-border bg-background p-3"
          >
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <h4 className="text-sm font-medium text-foreground leading-snug">
                {row.metric}
              </h4>
              <a
                href={row.src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium shrink-0"
                title={row.tier === 'secondary' ? 'Secondary source' : 'Primary source'}
              >
                <ExternalLink className="h-3 w-3" />
                {row.tier === 'secondary' && (
                  <span className="text-muted-foreground/80">(2°)</span>
                )}
              </a>
            </div>
            {row.note && (
              <p className="text-[11px] text-muted-foreground/85 italic leading-relaxed mb-2">
                {row.note}
              </p>
            )}
            <dl className="grid grid-cols-3 gap-2 text-[12px] font-mono">
              <div>
                <dt className="uppercase text-[9px] text-muted-foreground tracking-widest mb-0.5">
                  US
                </dt>
                <dd className="text-foreground/90">{row.us}</dd>
              </div>
              <div>
                <dt className="uppercase text-[9px] text-muted-foreground tracking-widest mb-0.5">
                  UAE
                </dt>
                <dd className="text-foreground/90">{row.uae}</dd>
              </div>
              <div>
                <dt className="uppercase text-[9px] text-muted-foreground tracking-widest mb-0.5">
                  Ratio
                </dt>
                <dd className={cn('font-bold', ratioClass(row.ratio))}>
                  {row.ratio}
                </dd>
              </div>
            </dl>
          </article>
        ))}
        <p className="text-[10px] text-muted-foreground font-mono mt-3">
          <span className="opacity-70">(2°)</span> = secondary source (consultant analysis,
          regional VC tracker). Direction consistent across vendors; absolute numbers vary.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground min-w-[180px]">
              Metric
            </th>
            <th className="text-left px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              US
            </th>
            <th className="text-left px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              UAE
            </th>
            <th className="text-right px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground min-w-[80px]">
              Ratio
            </th>
            <th className="text-right px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground w-[80px]">
              Source
            </th>
          </tr>
        </thead>
        <tbody>
          {UAE_CONTRAST.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border last:border-b-0 align-top hover:bg-secondary/40 transition-colors"
            >
              <td className="px-3 py-3 text-foreground font-medium">
                {row.metric}
                {row.note && (
                  <div className="text-[11px] text-muted-foreground/85 mt-1 leading-relaxed font-normal italic">
                    {row.note}
                  </div>
                )}
              </td>
              <td className="px-3 py-3 text-foreground/90 font-mono text-[12px]">
                {row.us}
              </td>
              <td className="px-3 py-3 text-foreground/90 font-mono text-[12px]">
                {row.uae}
              </td>
              <td
                className={cn(
                  'px-3 py-3 text-right font-mono font-bold text-[12px]',
                  ratioClass(row.ratio),
                )}
              >
                {row.ratio}
              </td>
              <td className="px-3 py-3 text-right">
                <a
                  href={row.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                  title={row.tier === 'secondary' ? 'Secondary source' : 'Primary source'}
                >
                  <ExternalLink className="h-3 w-3" />
                  {row.tier === 'secondary' && (
                    <span className="text-muted-foreground/80">(2°)</span>
                  )}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[10px] text-muted-foreground font-mono mt-3">
        <span className="opacity-70">(2°)</span> = secondary source (consultant analysis,
        regional VC tracker). Direction consistent across vendors; absolute numbers vary.
      </p>
    </div>
  );
}
