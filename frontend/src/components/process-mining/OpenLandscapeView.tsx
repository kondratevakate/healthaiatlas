import { useState, useMemo } from 'react';
import { PM_OPEN_LANDSCAPE } from '@/data/processMining';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  tool: '🛠 Tool', data: '📊 Dataset', model: '🧠 Model',
  paper: '📚 Paper', roi: '🏆 Proven ROI', dead: '☠ Dead',
};

const ACCESS_LABELS: Record<string, string> = {
  free: '✅ Free', academic: '🎓 Academic', trial: '🔑 Trial', enterprise: '🏢 Enterprise',
};

export function OpenLandscapeView() {
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const types = ['all', 'tool', 'data', 'model', 'paper', 'roi', 'dead'];

  const filtered = useMemo(() => {
    return PM_OPEN_LANDSCAPE.map(sec => {
      const items = sec.items.filter(item => {
        if (typeFilter !== 'all' && typeFilter !== item.type) return false;
        return true;
      });
      if (!items.length) return null;
      return { ...sec, items };
    }).filter(Boolean) as typeof PM_OPEN_LANDSCAPE;
  }, [typeFilter]);

  return (
    <div>
      {/* Verdict */}
      <div className="border border-primary/30 bg-primary/5 p-4 mb-4">
        <div className="text-xs font-mono text-primary mb-1">OPEN LANDSCAPE VERDICT</div>
        <p className="text-sm text-foreground leading-relaxed">
          Healthcare process mining is <strong>researchable today</strong> with free tools and data.
          MIMIC-IV + PM4Py = instant prototype. But production requires Celonis/UiPath enterprise licenses.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1 mb-4 items-center">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={cn(
              'px-2.5 py-1 text-[11px] font-mono border transition-colors',
              typeFilter === t
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {t === 'all' ? 'All' : TYPE_LABELS[t] || t}
          </button>
        ))}
      </div>

      {/* Sections */}
      {filtered.map(sec => (
        <div key={sec.id} className="mb-8">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
            <span className="text-lg">{sec.icon}</span>
            <span className="text-sm font-bold">{sec.name}</span>
            <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5">
              {sec.items.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sec.items.map(item => (
              <div
                key={item.name}
                className={cn(
                  'border border-border bg-background p-4 hover:border-primary/50 transition-colors',
                  item.type === 'dead' && 'border-destructive/20'
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-bold text-foreground">{item.name}</h4>
                  <Badge variant="outline" className={cn(
                    'rounded-none text-[9px] whitespace-nowrap shrink-0',
                    item.type === 'dead' ? 'border-destructive/30 text-destructive' : ''
                  )}>
                    {TYPE_LABELS[item.type] || item.type}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">{item.desc}</p>

                {item.highlight && (
                  <p className="text-[11px] text-primary font-medium mb-2">★ {item.highlight}</p>
                )}

                <div className="flex flex-wrap gap-1 mb-2">
                  {item.meta.map(m => (
                    <span key={m} className="text-[9px] px-1.5 py-0.5 border border-border bg-secondary text-muted-foreground">
                      {m}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {ACCESS_LABELS[item.access] || item.access}
                  </span>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> Open
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
