import { ExternalLink } from 'lucide-react';
import { EU_CONTRAST } from '@/data/euMarketReality';

export function HeadlineContrast() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground min-w-[200px]">
              Metric
            </th>
            <th className="text-left px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              US
            </th>
            <th className="text-left px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              EU
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
          {EU_CONTRAST.map((row) => (
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
              <td className="px-3 py-3 text-foreground/90 font-mono text-[12px]">{row.us}</td>
              <td className="px-3 py-3 text-foreground/90 font-mono text-[12px]">{row.eu}</td>
              <td className="px-3 py-3 text-right font-mono font-bold text-[12px] text-primary">
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
        <span className="opacity-70">(2°)</span> = secondary source. Direction consistent across analysts.
      </p>
    </div>
  );
}