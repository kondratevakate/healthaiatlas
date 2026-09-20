import { Fragment, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { BIO_COLUMNS, BIO_FOCUS_ORDER, BIO_GROUPS, BIO_ORGS, type BioOrg } from '@/data/biosecurity';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { OrgDetail } from './OrgDetail';
import { COLUMN_BY_ID, columnLabel, groupIcon, groupLabel, shortName } from './lookup';

// Organisations with only governance/technical approach tags and no concrete
// intervention focus still belong on the map — they get their own row.
const NO_FOCUS = '__none__';
const NO_FOCUS_LABEL = 'No specific focus';
const MAX_CHIPS = 3;

// Empty-cell hatching — same gap device as the oncology pharma matrix.
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
  /** Overrides the column label when one cell aggregates a whole group (mobile). */
  title?: string;
}

export function MatrixView() {
  const isMobile = useIsMobile();
  const [activeGroups, setActiveGroups] = useState<Set<string>>(new Set());
  const [cell, setCell] = useState<CellSelection | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);

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
          BIO_ORGS.filter(
            (o) => o.cols.includes(col.id) && (row === NO_FOCUS ? o.focus.length === 0 : o.focus.includes(row)),
          ),
        );
      }
    }
    return map;
  }, [columns]);

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

  // First column of each group gets a heavier left rule so groups read as blocks.
  const groupStarts = useMemo(
    () => new Set(columns.filter((c, i) => i === 0 || columns[i - 1].group !== c.group).map((c) => c.id)),
    [columns],
  );

  const selectedOrg = orgId ? BIO_ORGS.find((o) => o.id === orgId) ?? null : null;

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
          <span>{BIO_ORGS.length} organisations</span>
          <span aria-hidden>·</span>
          <span>{columns.length} categories × {BIO_FOCUS_ORDER.length} focus areas</span>
          <span aria-hidden>·</span>
          <span>{emptyCells} empty cells</span>
        </div>

        <div role="group" aria-label="Filter by category" className="flex gap-2 items-center overflow-x-auto sm:flex-wrap">
          {BIO_GROUPS.map((g) => {
            const active = activeGroups.has(g.id);
            const Icon = groupIcon(g.id);
            return (
              <button
                key={g.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggleGroup(g.id)}
                className={cn(
                  'px-2 py-1 min-h-[44px] sm:min-h-0 shrink-0 text-[11px] font-mono border transition-colors flex items-center gap-1.5',
                  active
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {g.label}
              </button>
            );
          })}
          {activeGroups.size > 0 && (
            <button
              type="button"
              onClick={() => setActiveGroups(new Set())}
              className="ml-auto min-h-[44px] sm:min-h-0 text-[11px] text-foreground underline underline-offset-2 hover:opacity-70 inline-flex items-center gap-1"
            >
              <X className="h-3 w-3" aria-hidden />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {isMobile ? (
        <MobileList grid={grid} columns={columns} onCell={setCell} />
      ) : (
        // Height fits the viewport below the sticky site header (4rem) and hub tabs
        // (~3rem), so the whole table scroll box is visible once pinned.
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-8rem)] border border-border">
          <table className="border-collapse w-full">
            <thead className="sticky top-0 z-20">
              <tr>
                <td className="p-1.5 bg-background sticky left-0 z-30 min-w-[168px]" />
                {headerGroups.map((g, i) => {
                  const Icon = groupIcon(g.id);
                  return (
                    <th
                      key={`${g.id}-${i}`}
                      scope="colgroup"
                      colSpan={g.span}
                      className="p-1.5 text-center text-[10px] font-bold uppercase tracking-wider bg-background text-foreground border-b-2 border-b-foreground border-l-2 border-l-foreground"
                    >
                      <span className="inline-flex items-center gap-1">
                        <Icon className="h-3 w-3" aria-hidden />
                        {groupLabel(g.id)}
                      </span>
                    </th>
                  );
                })}
              </tr>
              <tr>
                <th
                  scope="col"
                  className="text-left text-xs font-bold p-1.5 text-foreground bg-background sticky left-0 z-30 align-bottom"
                >
                  Intervention focus
                </th>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    scope="col"
                    className={cn(
                      'bg-background p-2 text-[10px] font-medium text-foreground',
                      groupStarts.has(col.id) && 'border-l-2 border-l-foreground',
                    )}
                    style={{
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                      height: '9rem',
                      whiteSpace: 'nowrap',
                      verticalAlign: 'bottom',
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
                    scope="row"
                    className={cn(
                      'text-left text-xs p-1.5 bg-background sticky left-0 z-10 align-top',
                      row === NO_FOCUS ? 'font-normal italic text-muted-foreground' : 'font-semibold text-foreground',
                    )}
                  >
                    {rowLabel(row)}
                  </th>
                  {columns.map((col) => {
                    const items = grid.get(`${row}|${col.id}`) ?? [];
                    const edge = groupStarts.has(col.id) && 'border-l-2 border-l-foreground';
                    if (items.length === 0) {
                      return (
                        <td
                          key={col.id}
                          className={cn('p-1 border border-border/50', edge)}
                          style={{ background: HATCH }}
                          aria-label={`No organisation listed for ${rowLabel(row)} in ${columnLabel(col.id)}`}
                        />
                      );
                    }
                    return (
                      <td
                        key={col.id}
                        onClick={() => setCell({ row, col: col.id, orgs: items })}
                        className={cn(
                          'p-1 border border-border/50 align-top cursor-pointer hover:outline hover:outline-1 hover:outline-foreground',
                          edge,
                        )}
                        style={{ background: `hsl(var(--foreground) / ${(0.03 + (0.12 * items.length) / maxCount).toFixed(3)})` }}
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
                              className="text-[10px] font-semibold px-1.5 py-0.5 border border-foreground/20 bg-background text-foreground hover:border-foreground leading-tight max-w-[120px] truncate"
                              title={o.name}
                              aria-label={o.name}
                            >
                              {shortName(o.name)}
                            </button>
                          ))}
                          {items.length > MAX_CHIPS && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCell({ row, col: col.id, orgs: items });
                              }}
                              className="text-[10px] font-mono text-foreground px-1 py-0.5 underline underline-offset-2 hover:opacity-70"
                              aria-label={`Show all ${items.length} organisations for ${rowLabel(row)} in ${columnLabel(col.id)}`}
                            >
                              +{items.length - MAX_CHIPS}
                            </button>
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

      <Sheet open={!!cell} onOpenChange={(open) => !open && setCell(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {cell && (
            <CellDetail cell={cell} onOrg={openOrg} />
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

function CellDetail({ cell, onOrg }: { cell: CellSelection; onOrg: (id: string) => void }) {
  const Icon = groupIcon(COLUMN_BY_ID.get(cell.col)?.group ?? '');
  const label = cell.title ?? columnLabel(cell.col);
  return (
    <>
      <SheetHeader className="text-left mb-4">
        <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
          <Icon className="h-3 w-3" aria-hidden />
          {label}
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
            onClick={() => onOrg(o.id)}
            className="w-full text-left border border-border p-3 hover:border-foreground/50 transition-colors space-y-1"
          >
            <div className="font-semibold text-sm text-foreground">{o.name}</div>
            <div className="text-[11px] text-muted-foreground">{o.type}</div>
          </button>
        ))}
      </div>
    </>
  );
}

interface MobileListProps {
  grid: Map<string, BioOrg[]>;
  columns: typeof BIO_COLUMNS;
  onCell: (sel: CellSelection) => void;
}

function MobileList({ grid, columns, onCell }: MobileListProps) {
  // One row per focus area, one column per top-level group: 21 x 4 counts fit a
  // 375px screen, where the per-category card list ran to ~11k px of scrolling.
  const groups = BIO_GROUPS.filter((g) => columns.some((c) => c.group === g.id));

  const cellFor = (row: string, groupId: string) => {
    const cols = columns.filter((c) => c.group === groupId);
    const orgs = cols.flatMap((c) => grid.get(row + '|' + c.id) ?? []);
    return { cols, orgs: Array.from(new Map(orgs.map((o) => [o.id, o])).values()) };
  };

  return (
    <div className="border border-border">
      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1fr) repeat(' + groups.length + ', 3rem)' }}>
        <div className="border-b border-border px-2 py-2 text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
          Focus
        </div>
        {groups.map((g) => {
          const Icon = groupIcon(g.id);
          return (
            <div
              key={g.id}
              className="border-b border-l border-border flex items-center justify-center py-2"
              title={g.label}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span className="sr-only">{g.label}</span>
            </div>
          );
        })}

        {ROWS.map((row) => (
          <Fragment key={row}>
            <div
              className={cn(
                'border-b border-border px-2 py-2 text-xs flex items-center',
                row === NO_FOCUS ? 'italic text-muted-foreground' : 'text-foreground',
              )}
            >
              {rowLabel(row)}
            </div>
            {groups.map((g) => {
              const { cols, orgs } = cellFor(row, g.id);
              const empty = orgs.length === 0;
              return (
                <button
                  key={g.id}
                  type="button"
                  disabled={empty}
                  onClick={() => onCell({ row, col: cols[0].id, orgs, title: g.label })}
                  aria-label={orgs.length + ' organisations for ' + rowLabel(row) + ' in ' + g.label}
                  className={cn(
                    'border-b border-l border-border min-h-[44px] text-xs font-mono flex items-center justify-center',
                    empty ? 'text-muted-foreground/40' : 'text-foreground',
                  )}
                  style={
                    empty
                      ? undefined
                      : { background: 'hsl(var(--foreground) / ' + (0.04 + (0.12 * Math.min(orgs.length, 20)) / 20).toFixed(3) + ')' }
                  }
                >
                  {empty ? '·' : orgs.length}
                </button>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
