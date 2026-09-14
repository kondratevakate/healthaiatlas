import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { BIO_COLUMNS, BIO_FOCUS_ORDER, BIO_GROUPS, BIO_ORGS, type BioOrg } from '@/data/biosecurity';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { OrgDetail } from './OrgDetail';
import { COLUMN_BY_ID, columnLabel, groupColor, shortName } from './lookup';

// Organisations with only governance/technical approach tags and no concrete
// intervention focus still belong on the map — they get their own row.
const NO_FOCUS = '__none__';
const NO_FOCUS_LABEL = 'No specific focus';
const MAX_CHIPS = 3;

const HATCH =
  'repeating-linear-gradient(45deg, transparent, transparent 3px, hsl(var(--foreground) / 0.035) 3px, hsl(var(--foreground) / 0.035) 6px)';

const ROWS = [...BIO_FOCUS_ORDER, NO_FOCUS];

function rowLabel(row: string) {
  return row === NO_FOCUS ? NO_FOCUS_LABEL : row;
}

interface CellSelection {
  row: string;
  col: string;
  orgs: BioOrg[];
}

export function MatrixView() {
  const isMobile = useIsMobile();
  const [activeGroups, setActiveGroups] = useState<Set<string>>(new Set());
  const [gcbrOnly, setGcbrOnly] = useState(false);
  const [cell, setCell] = useState<CellSelection | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);

  const orgs = useMemo(() => (gcbrOnly ? BIO_ORGS.filter((o) => o.gcbr) : BIO_ORGS), [gcbrOnly]);
  const columns = useMemo(
    () => (activeGroups.size ? BIO_COLUMNS.filter((c) => activeGroups.has(c.group)) : BIO_COLUMNS),
    [activeGroups],
  );

  const grid = useMemo(() => {
    const map = new Map<string, BioOrg[]>();
    for (const row of ROWS) {
      for (const col of columns) {
        map.set(
          `${row}|${col.id}`,
          orgs.filter(
            (o) => o.cols.includes(col.id) && (row === NO_FOCUS ? o.focus.length === 0 : o.focus.includes(row)),
          ),
        );
      }
    }
    return map;
  }, [orgs, columns]);

  const counts = [...grid.values()].map((v) => v.length);
  const maxCount = Math.max(1, ...counts);
  const emptyCells = counts.filter((n) => n === 0).length;

  const headerGroups = useMemo(() => {
    const out: { id: string; span: number }[] = [];
    for (const col of columns) {
      const last = out[out.length - 1];
      if (last && last.id === col.group) last.span++;
      else out.push({ id: col.group, span: 1 });
    }
    return out;
  }, [columns]);

  const selectedOrg = orgId ? BIO_ORGS.find((o) => o.id === orgId) ?? null : null;
  const filtersActive = activeGroups.size > 0 || gcbrOnly;

  const toggleGroup = (id: string) =>
    setActiveGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const openOrg = (id: string) => {
    setCell(null);
    setOrgId(id);
  };

  return (
    <div>
      <div className="space-y-3 mb-4">
        <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-3 flex-wrap">
          <span>{orgs.length} organisations</span>
          <span className="opacity-60">·</span>
          <span>{columns.length} categories × {BIO_FOCUS_ORDER.length} focus areas</span>
          <span className="opacity-60">·</span>
          <span>{emptyCells} empty cells</span>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {BIO_GROUPS.map((g) => {
            const active = activeGroups.has(g.id);
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleGroup(g.id)}
                className={cn(
                  'px-2 py-1 text-[11px] font-mono border transition-colors flex items-center gap-1.5',
                  active
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: g.color }} />
                {g.label}
              </button>
            );
          })}
          <span className="opacity-30 mx-1">|</span>
          <label className="inline-flex items-center gap-1.5 text-[11px] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={gcbrOnly}
              onChange={(e) => setGcbrOnly(e.target.checked)}
              className="accent-primary"
            />
            <span className="text-muted-foreground">GCBR-focused only</span>
          </label>
          {filtersActive && (
            <button
              type="button"
              onClick={() => {
                setActiveGroups(new Set());
                setGcbrOnly(false);
              }}
              className="ml-auto text-[11px] text-primary hover:underline inline-flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {isMobile ? (
        <MobileList grid={grid} columns={columns} onCell={setCell} />
      ) : (
        <div className="overflow-x-auto overflow-y-auto max-h-[72vh] border border-border">
          <table className="border-collapse w-full">
            <thead className="sticky top-0 z-20">
              <tr>
                <td className="p-1.5 bg-background sticky left-0 z-30 min-w-[168px]" />
                {headerGroups.map((g, i) => (
                  <td
                    key={`${g.id}-${i}`}
                    colSpan={g.span}
                    className="p-1.5 text-center text-[10px] font-bold uppercase tracking-wider bg-background"
                    style={{ color: groupColor(g.id), borderBottom: `2px solid ${groupColor(g.id)}` }}
                  >
                    {BIO_GROUPS.find((x) => x.id === g.id)?.label ?? g.id}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="text-left text-xs font-bold p-1.5 text-foreground bg-background sticky left-0 z-30 align-bottom">
                  Intervention focus
                </th>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    className="bg-background p-2 text-[10px] font-medium"
                    style={{
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                      height: '9rem',
                      whiteSpace: 'nowrap',
                      verticalAlign: 'bottom',
                      color: groupColor(col.group),
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row}>
                  <th
                    className={cn(
                      'text-left text-xs p-1.5 bg-background sticky left-0 z-10 align-top',
                      row === NO_FOCUS ? 'font-normal italic text-muted-foreground' : 'font-semibold text-foreground',
                    )}
                  >
                    {rowLabel(row)}
                  </th>
                  {columns.map((col) => {
                    const items = grid.get(`${row}|${col.id}`) ?? [];
                    if (items.length === 0) {
                      return (
                        <td
                          key={col.id}
                          className="p-1 border border-border/50"
                          style={{ background: HATCH }}
                          title={`No organisation listed for ${rowLabel(row)} in ${columnLabel(col.id)}`}
                        />
                      );
                    }
                    return (
                      <td
                        key={col.id}
                        onClick={() => setCell({ row, col: col.id, orgs: items })}
                        className="p-1 border border-border/50 align-top cursor-pointer hover:outline hover:outline-1 hover:outline-primary/50"
                        style={{ background: `hsl(var(--foreground) / ${(0.03 + (0.12 * items.length) / maxCount).toFixed(3)})` }}
                        title={`${items.length} organisation${items.length === 1 ? '' : 's'} — click for the list`}
                      >
                        <div className="flex flex-wrap gap-0.5 min-w-[96px]">
                          {items.slice(0, MAX_CHIPS).map((o) => (
                            <button
                              key={o.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openOrg(o.id);
                              }}
                              className="text-[10px] font-semibold px-1.5 py-0.5 border border-foreground/10 bg-background/70 text-foreground hover:border-primary/50 leading-tight max-w-[120px] truncate"
                              title={o.name}
                            >
                              {shortName(o.name)}
                            </button>
                          ))}
                          {items.length > MAX_CHIPS && (
                            <span className="text-[10px] font-mono text-muted-foreground px-1 py-0.5">
                              +{items.length - MAX_CHIPS}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {columns.length > 0 && orgs.length === 0 && (
        <div className="border border-dashed border-border p-8 mt-3 text-center text-sm text-muted-foreground">
          No organisations match the current filters.
        </div>
      )}

      <Sheet open={!!cell} onOpenChange={(open) => !open && setCell(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {cell && (
            <>
              <SheetHeader className="text-left mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: groupColor(COLUMN_BY_ID.get(cell.col)?.group ?? '') }}
                  />
                  <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                    {columnLabel(cell.col)}
                  </span>
                </div>
                <SheetTitle className="text-xl font-semibold">{rowLabel(cell.row)}</SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">
                  {cell.orgs.length} organisation{cell.orgs.length === 1 ? '' : 's'}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-2">
                {cell.orgs.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => openOrg(o.id)}
                    className="w-full text-left border border-border p-3 hover:border-foreground/40 transition-colors space-y-1"
                  >
                    <div className="font-semibold text-sm text-foreground">{o.name}</div>
                    <div className="text-[11px] text-muted-foreground">{o.type}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={!!selectedOrg} onOpenChange={(open) => !open && setOrgId(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedOrg && <OrgDetail org={selectedOrg} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

interface MobileListProps {
  grid: Map<string, BioOrg[]>;
  columns: typeof BIO_COLUMNS;
  onCell: (sel: CellSelection) => void;
}

function MobileList({ grid, columns, onCell }: MobileListProps) {
  return (
    <div className="space-y-3">
      {ROWS.map((row) => {
        const filled = columns
          .map((col) => ({ col, orgs: grid.get(`${row}|${col.id}`) ?? [] }))
          .filter((x) => x.orgs.length > 0);
        return (
          <div key={row} className="border border-border">
            <div className="p-3 border-b border-border flex items-baseline justify-between gap-2">
              <span className={cn('text-sm', row === NO_FOCUS ? 'italic text-muted-foreground' : 'font-semibold text-foreground')}>
                {rowLabel(row)}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {filled.length}/{columns.length} categories
              </span>
            </div>
            <div className="divide-y divide-border">
              {filled.map(({ col, orgs }) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => onCell({ row, col: col.id, orgs })}
                  className="w-full text-left flex items-center justify-between gap-2 px-3 py-2 text-xs hover:bg-secondary/30"
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: groupColor(col.group) }} />
                    <span className="truncate text-foreground">{columnLabel(col.id)}</span>
                  </span>
                  <span className="font-mono text-muted-foreground shrink-0">{orgs.length}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
