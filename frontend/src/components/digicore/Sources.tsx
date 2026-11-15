import type { Sourced } from '@/data/digicore';

/** Numbered source links for one row, plus the two provenance markers the data carries. */
export function Sources({ row }: { row: Pick<Sourced, 'src' | 'slides' | 'status'> }) {
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1.5 font-mono text-[10px] text-muted-foreground">
      {row.src.map((u, i) => (
        <a
          key={u}
          href={u}
          target="_blank"
          rel="noopener noreferrer"
          title={u}
          className="underline underline-offset-2 hover:text-foreground"
        >
          [{i + 1}]
        </a>
      ))}
      {row.slides && <span title="Also shown on a workshop slide (not public)">slides</span>}
      {row.status === 'company claim' && <span title="The company says this about itself">company claim</span>}
    </span>
  );
}

/** Collapsible group used for every long list on this hub. */
export function Group({
  title,
  count,
  open,
  children,
}: {
  title: string;
  count: number;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={open} className="group border-t border-border">
      <summary className="flex cursor-pointer list-none items-baseline justify-between gap-3 py-2.5 text-sm font-medium">
        <span>
          <span className="mr-2 inline-block w-3 font-mono text-muted-foreground group-open:rotate-90 transition-transform">›</span>
          {title}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">{count}</span>
      </summary>
      <div className="pb-4">{children}</div>
    </details>
  );
}
