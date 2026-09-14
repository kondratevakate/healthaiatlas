import { useMemo, useState } from 'react';
import { BIO_GROUPS, BIO_ORGS } from '@/data/biosecurity';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OrgDetail } from './OrgDetail';
import { groupIcon, groupLabel, orgGroups } from './lookup';

const TYPES = Array.from(
  BIO_ORGS.reduce((acc, o) => acc.set(o.type, (acc.get(o.type) ?? 0) + 1), new Map<string, number>()),
).sort((a, b) => b[1] - a[1]);

export function DirectoryView() {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const [type, setType] = useState('all');
  const [orgId, setOrgId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return BIO_ORGS.filter((o) => {
      if (group !== 'all' && !orgGroups(o).includes(group)) return false;
      if (type !== 'all' && o.type !== type) return false;
      if (!needle) return true;
      return [o.name, o.desc, ...o.focus, ...o.activity, ...o.loc].join(' ').toLowerCase().includes(needle);
    });
  }, [query, group, type]);

  const selectedOrg = orgId ? BIO_ORGS.find((o) => o.id === orgId) ?? null : null;

  const reset = () => {
    setQuery('');
    setGroup('all');
    setType('all');
  };

  const chip = (active: boolean) =>
    cn(
      'px-2 py-1 min-h-[44px] sm:min-h-0 text-[11px] font-mono border transition-colors flex items-center gap-1.5',
      active ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:text-foreground',
    );

  return (
    <div>
      <div className="space-y-2 mb-4">
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2 items-center">
          <input
            type="search"
            aria-label="Search organisations"
            placeholder="Search name, focus, location…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-background border border-border px-3 py-1.5 min-h-[44px] sm:min-h-0 text-xs w-64 max-w-full focus:outline-none focus:ring-1 focus:ring-foreground"
          />
          <button type="button" aria-pressed={group === 'all'} onClick={() => setGroup('all')} className={chip(group === 'all')}>
            All categories
          </button>
          {BIO_GROUPS.map((g) => {
            const Icon = groupIcon(g.id);
            return (
              <button key={g.id} type="button" aria-pressed={group === g.id} onClick={() => setGroup(g.id)} className={chip(group === g.id)}>
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {g.label}
              </button>
            );
          })}
        </div>
        <div role="group" aria-label="Filter by organisation type" className="flex flex-wrap gap-1.5 items-center">
          <button type="button" aria-pressed={type === 'all'} onClick={() => setType('all')} className={chip(type === 'all')}>
            All types
          </button>
          {TYPES.map(([t, n]) => (
            <button key={t} type="button" aria-pressed={type === t} onClick={() => setType(t)} className={chip(type === t)}>
              {t} <span className="opacity-60">{n}</span>
            </button>
          ))}
        </div>
        <div className="text-[11px] text-muted-foreground font-mono" aria-live="polite">
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
              className="text-left border border-border p-3 hover:border-foreground/50 transition-colors space-y-1.5"
            >
              <div className="flex items-center gap-1 text-foreground">
                {orgGroups(o).map((g) => {
                  const Icon = groupIcon(g);
                  return <Icon key={g} className="h-3.5 w-3.5" role="img" aria-label={groupLabel(g)} />;
                })}
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
