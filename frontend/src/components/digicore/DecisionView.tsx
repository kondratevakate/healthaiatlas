import { Check, Minus, X } from 'lucide-react';
import { DC_CANDIDATES, DC_FILTERS, type DcCell } from '@/data/digicore';
import { cn } from '@/lib/utils';

const HATCH =
  'repeating-linear-gradient(45deg, transparent, transparent 3px, hsl(var(--foreground) / 0.06) 3px, hsl(var(--foreground) / 0.06) 6px)';

const LABEL: Record<DcCell['verdict'], string> = {
  pass: 'passes',
  fail: 'fails',
  unknown: 'not known yet',
  unconfirmed: 'verdict not confirmed by a checked source',
};

function Cell({ cell, filter }: { cell: DcCell; filter: string }) {
  const Icon = cell.verdict === 'pass' ? Check : cell.verdict === 'fail' ? X : Minus;
  const title = `${filter}: ${LABEL[cell.verdict]}${cell.status === 'company claim' ? ' (company claim)' : ''}`;
  const mark =
    cell.verdict === 'unconfirmed' ? (
      <span className="sr-only">{LABEL[cell.verdict]}</span>
    ) : (
      <Icon
        aria-label={LABEL[cell.verdict]}
        className={cn('h-4 w-4', cell.verdict === 'pass' ? 'text-foreground' : 'text-muted-foreground')}
        strokeWidth={cell.verdict === 'pass' ? 2.5 : 1.75}
      />
    );
  return (
    <td
      title={title}
      className="border-l border-border/30 p-0 text-center align-middle"
      style={cell.verdict === 'unconfirmed' ? { backgroundImage: HATCH } : undefined}
    >
      {cell.src[0] ? (
        <a
          href={cell.src[0]}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 items-center justify-center hover:bg-muted"
        >
          {mark}
        </a>
      ) : (
        <span className="flex h-10 items-center justify-center">{mark}</span>
      )}
    </td>
  );
}

export function DecisionView() {
  const passes = (cells: DcCell[]) => cells.filter((c) => c.verdict === 'pass').length;
  const rows = [...DC_CANDIDATES].sort((a, b) => passes(b.cells) - passes(a.cells) || a.id.localeCompare(b.id));

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse sm:min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border align-bottom">
              <th className="py-2 pr-3 text-left text-[11px] font-mono font-normal uppercase tracking-wider text-muted-foreground">
                Clinical setting · cohort
              </th>
              {DC_FILTERS.map((f) => (
                <th
                  key={f.id}
                  title={f.meaning}
                  className="w-9 px-1 py-2 text-center sm:w-[13%] sm:px-1.5 sm:text-left text-[11px] font-medium leading-tight"
                >
                  <span className="block font-mono text-muted-foreground">{f.id}</span>
                  <span className="hidden sm:inline">{f.label}</span>
                </th>
              ))}
              <th className="w-10 py-2 pl-2 text-right text-[11px] font-mono font-normal text-muted-foreground">pass</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const n = passes(c.cells);
              const all = n === DC_FILTERS.length;
              return (
                <tr key={c.id} className="border-b border-border/30">
                  <td className="py-2 pr-3">
                    <span className={cn('block leading-snug', all && 'font-semibold')}>{c.setting}</span>
                    <span className="block text-xs text-muted-foreground">{c.cohort}</span>
                  </td>
                  {c.cells.map((cell, i) => (
                    <Cell key={DC_FILTERS[i].id} cell={cell} filter={DC_FILTERS[i].label} />
                  ))}
                  <td className={cn('py-2 pl-2 text-right font-mono text-xs', all ? 'font-semibold' : 'text-muted-foreground')}>
                    {n}/{DC_FILTERS.length}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <dl className="mt-4 grid gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
        {DC_FILTERS.map((f) => (
          <div key={f.id} className="flex gap-2">
            <dt className="font-mono">{f.id}</dt>
            <dd>{f.meaning}</dd>
          </div>
        ))}
        <div className="flex gap-2">
          <dt className="w-5 shrink-0" style={{ backgroundImage: HATCH }} aria-hidden />
          <dd>Hatched: the verdict has no checked source yet.</dd>
        </div>
      </dl>
    </div>
  );
}
