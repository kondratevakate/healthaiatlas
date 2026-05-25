import { ExternalLink } from 'lucide-react';
import { EU_PHARMA_GRAVITY, EU_IMAGING_CONSOLIDATION, type PharmaCase } from '@/data/euMarketReality';
import { cn } from '@/lib/utils';

const TYPE_LABEL: Record<PharmaCase['type'], string> = {
  funding: 'Funding',
  acquisition: 'Acquisition',
  spinout: 'Spinout',
};

const TYPE_TONE: Record<PharmaCase['type'], string> = {
  funding: 'border-emerald-600/50 text-emerald-700 dark:text-emerald-400',
  acquisition: 'border-blue-600/50 text-blue-700 dark:text-blue-400',
  spinout: 'border-amber-600/50 text-amber-700 dark:text-amber-400',
};

export function PharmaGravity() {
  return (
    <div className="space-y-6">
      <p className="text-[12px] text-muted-foreground italic max-w-3xl">
        Europe's strongest AI-health lane is AI attached to biology, drug discovery, and pharma
        evidence — not generic hospital workflow apps. The exit pattern is strategic acquisition
        by pharma + medtech, not IPO.
      </p>

      {/* Named pharma-AI cases */}
      <div className="space-y-3">
        <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
          Named cases
        </div>
        {EU_PHARMA_GRAVITY.map((c) => (
          <article key={c.id} className="border border-border bg-background p-3 space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <h4 className="heading-editorial-card-sm">{c.name}</h4>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={cn(
                    'text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 border',
                    TYPE_TONE[c.type],
                  )}
                >
                  {TYPE_LABEL[c.type]}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">{c.date}</span>
              </div>
            </div>
            <div className="font-mono text-base text-primary font-bold">{c.amount}</div>
            <p className="text-[12px] text-foreground/85 leading-relaxed">{c.detail}</p>
            <a
              href={c.src}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
              title={c.tier === 'secondary' ? 'Secondary source' : 'Primary source'}
            >
              <ExternalLink className="h-3 w-3" />
              Source
              {c.tier === 'secondary' && <span className="text-muted-foreground/80">(2°)</span>}
            </a>
          </article>
        ))}
      </div>

      {/* RadNet imaging consolidation table */}
      <div className="space-y-2">
        <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
          European imaging-AI exit pattern — RadNet / DeepHealth consolidation
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-2 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Target
                </th>
                <th className="text-left px-2 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Country
                </th>
                <th className="text-left px-2 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Specialty
                </th>
                <th className="text-left px-2 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Date
                </th>
                <th className="text-left px-2 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Value
                </th>
                <th className="text-right px-2 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground w-[60px]">
                  Source
                </th>
              </tr>
            </thead>
            <tbody>
              {EU_IMAGING_CONSOLIDATION.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-border last:border-b-0 hover:bg-secondary/40 transition-colors"
                >
                  <td className="px-2 py-2 text-foreground font-medium">{a.target}</td>
                  <td className="px-2 py-2 text-foreground/85">{a.country}</td>
                  <td className="px-2 py-2 text-foreground/85">{a.specialty}</td>
                  <td className="px-2 py-2 font-mono text-muted-foreground">{a.date}</td>
                  <td className="px-2 py-2 font-mono text-foreground/85">{a.value}</td>
                  <td className="px-2 py-2 text-right">
                    <a
                      href={a.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                      title={a.tier === 'secondary' ? 'Secondary source' : 'Primary source'}
                    >
                      <ExternalLink className="h-3 w-3" />
                      {a.tier === 'secondary' && (
                        <span className="text-muted-foreground/80">(2°)</span>
                      )}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-muted-foreground/80 italic">
          Four European imaging-AI startups consolidated into one US-listed acquirer in ~24 months.
          The marketplace thesis (Bayer Calantic, Blackford) is in retreat globally; integrated
          workflow platforms with single-vendor accountability won.
        </p>
      </div>
    </div>
  );
}