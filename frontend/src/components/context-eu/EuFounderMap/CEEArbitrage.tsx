import { ExternalLink } from 'lucide-react';
import { EU_CEE_ARBITRAGE } from '@/data/euMarketReality';

export function CEEArbitrage() {
  return (
    <div className="space-y-3">
      <p className="text-[12px] text-muted-foreground italic max-w-3xl">
        Operational arbitrage <strong>inside</strong> the same EMA regulatory regime — not weaker
        regulation. Cheaper evidence, identical approval bar.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-2 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Country
              </th>
              <th className="text-left px-2 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Regulator
              </th>
              <th className="text-left px-2 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Start-up
              </th>
              <th className="text-left px-2 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Cost vs Western EU
              </th>
              <th className="text-right px-2 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground w-[60px]">
                Source
              </th>
            </tr>
          </thead>
          <tbody>
            {EU_CEE_ARBITRAGE.map((c) => (
              <tr
                key={c.country}
                className="border-b border-border last:border-b-0 align-top hover:bg-secondary/40 transition-colors"
              >
                <td className="px-2 py-2 text-foreground font-semibold">
                  {c.country}
                  <div className="text-[11px] text-muted-foreground/85 font-normal mt-1 italic">
                    {c.specialty}
                  </div>
                </td>
                <td className="px-2 py-2 font-mono text-foreground/85">{c.regulator}</td>
                <td className="px-2 py-2 text-foreground/85">{c.startupTimeline}</td>
                <td className="px-2 py-2 font-mono text-primary font-bold">{c.costVsWestern}</td>
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

      <p className="text-[11px] text-muted-foreground/80 italic">
        Caveat: cheaper evidence ≠ easier reimbursement. A startup that validates in CEE and
        targets Germany still faces G-BA / IQWiG evaluation against German clinical practice.
      </p>
    </div>
  );
}
