import { useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import { UAE_PROCUREMENT } from '@/data/uaeMarketReality';
import { useIsMobile } from '@/hooks/use-mobile';

export function ProcurementTable() {
  const isMobile = useIsMobile();
  const sorted = useMemo(
    () => [...UAE_PROCUREMENT].sort((a, b) => b.year - a.year),
    [],
  );

  const uaeFoundedCount = sorted.filter((c) => c.vendorHq === 'UAE').length;

  return (
    <div className="space-y-3">
      {isMobile ? (
        <div className="space-y-2">
          {sorted.map((c) => (
            <article
              key={c.id}
              className="border border-border bg-background p-3"
            >
              <div className="flex items-baseline justify-between text-[10px] font-mono text-muted-foreground mb-2">
                <span className="tabular-nums text-foreground">{c.year}</span>
                <span className="inline-block px-1.5 py-0.5 border border-border uppercase tracking-widest">
                  {c.vendorHq}
                </span>
              </div>
              <dl className="space-y-1.5 text-[12px]">
                <div>
                  <dt className="text-[9px] uppercase tracking-widest font-mono text-muted-foreground">
                    Customer
                  </dt>
                  <dd className="text-foreground/90">{c.customer}</dd>
                </div>
                <div>
                  <dt className="text-[9px] uppercase tracking-widest font-mono text-muted-foreground">
                    Product
                  </dt>
                  <dd className="text-foreground/85">{c.product}</dd>
                </div>
                <div>
                  <dt className="text-[9px] uppercase tracking-widest font-mono text-muted-foreground">
                    Vendor
                  </dt>
                  <dd className="text-foreground font-medium">{c.vendor}</dd>
                </div>
              </dl>
              <a
                href={c.src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium mt-2"
                title={c.tier === 'secondary' ? 'Secondary source' : 'Primary source'}
              >
                <ExternalLink className="h-3 w-3" />
                Source
                {c.tier === 'secondary' && (
                  <span className="text-muted-foreground/80">(2°)</span>
                )}
              </a>
            </article>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-2 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground w-[60px]">
                  Year
                </th>
                <th className="text-left px-2 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Customer
                </th>
                <th className="text-left px-2 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Product
                </th>
                <th className="text-left px-2 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Vendor
                </th>
                <th className="text-left px-2 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground w-[100px]">
                  HQ
                </th>
                <th className="text-right px-2 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground w-[60px]">
                  Source
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border last:border-b-0 hover:bg-secondary/40 transition-colors"
                >
                  <td className="px-2 py-2 font-mono text-foreground tabular-nums">{c.year}</td>
                  <td className="px-2 py-2 text-foreground/90">{c.customer}</td>
                  <td className="px-2 py-2 text-foreground/85">{c.product}</td>
                  <td className="px-2 py-2 text-foreground font-medium">{c.vendor}</td>
                  <td className="px-2 py-2">
                    <span className="inline-block text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 border border-border text-muted-foreground">
                      {c.vendorHq}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right">
                    <a
                      href={c.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                      title={c.tier === 'secondary' ? 'Secondary source' : 'Primary source'}
                    >
                      <ExternalLink className="h-3 w-3" />
                      {c.tier === 'secondary' && (
                        <span className="text-muted-foreground/80">(2°)</span>
                      )}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 text-[11px] font-mono text-muted-foreground pt-2 border-t border-border">
        <span>
          UAE-founded vendors winning these contracts:{' '}
          <span className="text-destructive font-bold">{uaeFoundedCount} of {sorted.length}</span>
        </span>
        <span className="text-muted-foreground/70">
          Pilots happen at AED 200k–1m. Production contracts go elsewhere.
        </span>
      </div>
    </div>
  );
}
