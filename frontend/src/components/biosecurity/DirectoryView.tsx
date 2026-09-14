import { useMemo, useState } from 'react';
import { BIO_GROUPS, BIO_ORGS } from '@/data/biosecurity';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OrgDetail } from './OrgDetail';
import { groupColor, orgGroups } from './lookup';

const TYPES = Array.from(
  BIO_ORGS.reduce((acc, o) => acc.set(o.type, (acc.get(o.type) ?? 0) + 1), new Map<string, number>()),
).sort((a, b) => b[1] - a[1]);

export function DirectoryView() {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const [type, setType] = useState('all');
  const [gcbrOnly, setGcbrOnly] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return BIO_ORGS.filter((o) => {
      if (group !== 'all' && !orgGroups(o).includes(group)) return false;
      if (type !== 'all' && o.type !== type) return false;
      if (gcbrOnly && !o.gcbr) return false;
      if (!needle) return true;
      return [o.name, o.desc, ...o.focus, ...o.activity, ...o.loc].join(' ').toLowerCase().includes(needle);
    });
  }, [query, group, type, gcbrOnly]);

  const selectedOrg = orgId ? BIO_ORGS.find((o) => o.id === orgId) ?? null : null;

  const reset = () => {
    setQuery('');
    setGroup('all');
    setType('all');
    setGcbrOnly(false);
  };

  const chip = (active: boolean) =>
    cn(
      'px-2 py-1 text-[11px] font-mono border transition-colors flex items-center gap-1.5',
      active ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:text-foreground',
    );

  return (
    <div>
      <div className="space-y-2 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="search"
            placeholder="Search name, focus, location…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-secondary border border-border px-3 py-1.5 text-xs w-64 max-w-full focus:outline-none focus:border-primary"
          />
          <button type="button" onClick={() => setGroup('all')} className={chip(group === 'all')}>
            All categories
          </button>
          {BIO_GROUPS.map((g) => (
            <button key={g.id} type="button" onClick={() => setGroup(g.id)} className={chip(group === g.id)}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: g.color }} />
              {g.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          <button type="button" onClick={() => setType('all')} className={chip(type === 'all')}>
            All types
          </button>
          {TYPES.map(([t, n]) => (
            <button key={t} type="button" onClick={() => setType(t)} className={chip(type === t)}>
              {t} <span className="opacity-60">{n}</span>
            </button>
          ))}
          <label className="inline-flex items-center gap-1.5 text-[11px] cursor-pointer select-none ml-1">
            <input
              type="checkbox"
              checked={gcbrOnly}
              onChange={(e) => setGcbrOnly(e.target.checked)}
              className="accent-primary"
            />
            <span className="text-muted-foreground">GCBR-focused only</span>
          </label>
        </div>
        <div className="text-[11px] text-muted-foreground font-mono">
          {filtered.length} of {BIO_ORGS.length} organisations
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground space-y-2">
          <div>No organisations match the current filters.</div>
          <Button variant="outline" size="sm" onClick={reset}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filtered.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setOrgId(o.id)}
              className="text-left border border-border p-3 hover:border-foreground/40 transition-colors space-y-1.5"
            >
              <div className="flex items-center gap-1">
                {orgGroups(o).map((g) => (
                  <span key={g} className="w-2 h-2 rounded-full" style={{ background: groupColor(g) }} />
                ))}
                <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground ml-1 truncate">
                  {o.type}
                </span>
              </div>
              <div className="font-semibold text-sm text-foreground leading-snug">{o.name}</div>
              {o.desc && <div className="text-xs text-muted-foreground line-clamp-3">{o.desc}</div>}
            </button>
          ))}
        </div>
      )}

      <Sheet open={!!selectedOrg} onOpenChange={(open) => !open && setOrgId(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedOrg && <OrgDetail org={selectedOrg} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
