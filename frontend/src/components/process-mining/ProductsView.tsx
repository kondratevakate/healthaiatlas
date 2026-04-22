import { useState, useMemo } from 'react';
import { PM_CATEGORIES } from '@/data/processMining';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STR_STYLES: Record<string, { label: string; cls: string }> = {
  high: { label: 'Strong', cls: 'border-foreground/30 text-foreground' },
  med: { label: 'Medium', cls: 'border-foreground/20 text-muted-foreground' },
  low: { label: 'Weak', cls: 'border-border text-muted-foreground' },
  dead: { label: '☠ Dead', cls: 'border-destructive/30 text-destructive' },
};

export function ProductsView() {
  const [activeCat, setActiveCat] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return PM_CATEGORIES.map(cat => {
      if (activeCat !== 'all' && activeCat !== cat.id) return null;
      const items = cat.items.filter(item => {
        if (!q) return true;
        return (item.uc + ' ' + item.desc + ' ' + item.vendors.join(' ') +
          item.evidence.map(e => e.client + ' ' + e.kpi).join(' ')).toLowerCase().includes(q);
      });
      if (!items.length) return null;
      return { ...cat, items };
    }).filter(Boolean) as typeof PM_CATEGORIES;
  }, [activeCat, search]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-1 mb-4 items-center">
        <input
          type="text"
          placeholder="Search use cases…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-secondary border border-border px-3 py-1.5 text-xs w-56 max-w-full focus:outline-none focus:border-primary"
        />
        <button
          onClick={() => setActiveCat('all')}
          className={cn(
            'px-2.5 py-1.5 text-[11px] font-mono border transition-colors',
            activeCat === 'all'
              ? 'bg-foreground text-background border-foreground'
              : 'border-border text-muted-foreground hover:text-foreground'
          )}
        >
          All
        </button>
        {PM_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={cn(
              'px-2.5 py-1.5 text-[11px] font-mono border transition-colors',
              activeCat === cat.id
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Categories */}
      {filtered.map(cat => (
        <div key={cat.id} className="mb-8">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
            <span className="text-lg">{cat.icon}</span>
            <span className="text-sm font-bold text-foreground">{cat.name}</span>
            <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5">
              {cat.items.length} use case{cat.items.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cat.items.map(item => (
              <div
                key={item.uc}
                className={cn(
                  'border border-border bg-background p-4 hover:border-primary/50 transition-colors',
                  item.dead && 'border-destructive/20'
                )}
              >
                <h4 className="text-sm font-bold text-foreground mb-1">{item.uc}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{item.desc}</p>

                {/* Evidence */}
                <div className="space-y-2 mb-3">
                  {item.evidence.map((ev, i) => (
                    <div key={i} className="text-[11px] py-1.5 border-b border-border/50 last:border-0">
                      <Badge variant="outline" className={cn('rounded-none text-[9px] mr-1.5', STR_STYLES[ev.str]?.cls)}>
                        {STR_STYLES[ev.str]?.label}
                      </Badge>
                      <span className="font-semibold text-primary">{ev.client}</span>
                      <br />
                      <span className="text-foreground/80">{ev.kpi}</span>
                      {ev.note && <><br /><span className="text-muted-foreground italic">{ev.note}</span></>}
                    </div>
                  ))}
                </div>

                {/* Vendors */}
                <div className="flex flex-wrap gap-1">
                  {item.vendors.map(v => (
                    <span key={v} className="text-[10px] px-2 py-0.5 border border-border bg-secondary text-muted-foreground">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
