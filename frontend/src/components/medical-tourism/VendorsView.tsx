import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VENDORS, VENDOR_CATEGORY_LABELS, VendorCategory } from '@/data/medicalTourism';

const CATEGORIES: (VendorCategory | 'all')[] = ['all', 'discovery', 'crm', 'payments', 'intelligence', 'standards'];

export function VendorsView() {
  const [active, setActive] = useState<VendorCategory | 'all'>('all');

  const items = active === 'all'
    ? (Object.keys(VENDORS) as VendorCategory[]).flatMap(cat =>
        VENDORS[cat].map(v => ({ ...v, category: cat }))
      )
    : VENDORS[active].map(v => ({ ...v, category: active as VendorCategory }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={cn(
              'px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider border transition-colors',
              active === c
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
            )}
          >
            {c === 'all' ? 'All' : VENDOR_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((v, i) => (
          <a
            key={i}
            href={v.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group border border-border p-3 hover:border-foreground transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
                {VENDOR_CATEGORY_LABELS[v.category]}
              </span>
              <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
            </div>
            <div className="text-sm font-medium text-foreground mb-1">{v.name}</div>
            <div className="text-[11px] text-muted-foreground mb-2">{v.type} · {v.coverage}</div>
            <div className="text-xs text-foreground/70 font-mono">{v.signal}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
