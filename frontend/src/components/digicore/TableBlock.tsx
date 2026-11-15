import type { ReactNode } from 'react';
import type { Sourced } from '@/data/digicore';
import { Sources } from './Sources';

export interface Column<T> {
  key: keyof T & string;
  label: string;
  wide?: boolean;
}

/** Plain bordered table; under sm each row becomes a stacked card so nothing scrolls sideways. */
export function TableBlock<T extends Sourced>({
  rows,
  columns,
  rowKey,
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (r: T, i: number) => string;
}) {
  const cell = (r: T, c: Column<T>): ReactNode => String(r[c.key] ?? '');
  return (
    <>
      <table className="hidden w-full border-collapse text-xs sm:table">
        <thead>
          <tr className="border-b border-border">
            {columns.map((c) => (
              <th
                key={c.key}
                className={`py-2 pr-3 text-left font-mono text-[10px] font-normal uppercase tracking-wider text-muted-foreground ${c.wide ? 'w-2/5' : ''}`}
              >
                {c.label}
              </th>
            ))}
            <th className="py-2 text-left font-mono text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
              Source
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={rowKey(r, i)} className="border-b border-border/30 align-top">
              {columns.map((c, j) => (
                <td key={c.key} className={`py-2 pr-3 leading-snug ${j === 0 ? 'font-medium' : ''}`}>
                  {cell(r, c)}
                </td>
              ))}
              <td className="py-2">
                <Sources row={r} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="sm:hidden">
        {rows.map((r, i) => (
          <li key={rowKey(r, i)} className="border-b border-border/30 py-2.5 text-xs">
            <p className="font-medium">{cell(r, columns[0])}</p>
            <dl className="mt-1 space-y-0.5">
              {columns.slice(1).map((c) =>
                cell(r, c) ? (
                  <div key={c.key}>
                    <dt className="inline font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{c.label} </dt>
                    <dd className="inline leading-snug">{cell(r, c)}</dd>
                  </div>
                ) : null,
              )}
            </dl>
            <div className="mt-1">
              <Sources row={r} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
