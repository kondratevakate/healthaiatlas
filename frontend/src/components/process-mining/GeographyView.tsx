import { PM_GEO } from '@/data/processMining';

export function GeographyView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">
      {PM_GEO.map(g => (
        <div key={g.n} className="border border-border bg-background p-4 hover:border-primary/50 transition-colors">
          <h3 className="flex items-center gap-2 text-sm font-bold mb-2">
            <span className="text-xl">{g.f}</span>
            {g.n}
          </h3>

          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-lg font-bold text-primary">{g.mkt}</span>
            <span className="text-sm font-semibold text-foreground/70">{g.buy} buyers</span>
          </div>

          {/* Share bar */}
          <div className="mb-3">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>HC IT spend share</span>
              <span>{g.sh}%</span>
            </div>
            <div className="h-1.5 bg-secondary overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${Math.min(g.sh, 100)}%` }}
              />
            </div>
          </div>

          {g.dl && (
            <div className="text-[11px] text-muted-foreground mb-2">
              <strong className="text-foreground">Key deals:</strong> {g.dl}
            </div>
          )}

          {g.cu && (
            <div className="text-[11px] text-muted-foreground mb-2">
              <strong className="text-foreground">Customers:</strong> {g.cu}
            </div>
          )}

          {g.dv.length > 0 && (
            <div className="text-[11px] text-destructive mb-2">
              <strong>☠ Failures:</strong> {g.dv.join(' · ')}
            </div>
          )}

          {g.pm && (
            <div className="text-[11px] text-muted-foreground mb-2">
              <strong className="text-primary">PM Status:</strong> {g.pm}
            </div>
          )}

          <div className="flex flex-wrap gap-1 mt-2">
            {g.v.map(v => (
              <span key={v} className="text-[9px] px-1.5 py-0.5 border border-border bg-secondary text-muted-foreground">
                {v}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
