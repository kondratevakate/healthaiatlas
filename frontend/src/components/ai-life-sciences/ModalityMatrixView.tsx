import { useMemo } from 'react';
import {
  LS_BUBBLES,
  LS_DP_ORDER,
  LS_DP_LABELS,
  LS_MODALITY_LABELS,
  LS_MODALITY_COLORS,
  type LSBubble,
} from '@/data/aiLifeSciences';
import { cn } from '@/lib/utils';

export function ModalityMatrixView() {
  // Group bubbles by (modality, decision-point) cell.
  const grouped = useMemo(() => {
    const map = new Map<string, LSBubble[]>();
    for (const b of LS_BUBBLES) {
      const key = `${b.mod}|${b.dp}`;
      const arr = map.get(key) ?? [];
      arr.push(b);
      map.set(key, arr);
    }
    return map;
  }, []);

  const modalities = Object.keys(LS_MODALITY_LABELS);

  return (
    <div>
      <div className="sm:hidden text-[10px] text-muted-foreground font-mono mb-2 flex items-center gap-1">
        <span aria-hidden>←</span>
        <span>Swipe to see all decision points</span>
        <span aria-hidden>→</span>
      </div>
      <div className="relative overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background sm:hidden"
        />
        <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr>
            <th className="sticky left-0 bg-background border border-border text-left px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground min-w-[160px]">
              Modality
            </th>
            {LS_DP_ORDER.map((dp) => (
              <th
                key={dp}
                className="border border-border px-2 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-left align-bottom min-w-[110px]"
              >
                {LS_DP_LABELS[dp] ?? dp}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {modalities.map((mod) => (
            <tr key={mod}>
              <th
                scope="row"
                className="sticky left-0 bg-background border border-border text-left px-3 py-2 align-top min-w-[160px]"
              >
                <span
                  aria-hidden="true"
                  className="inline-block w-2 h-2 mr-2 align-middle"
                  style={{ background: LS_MODALITY_COLORS[mod] ?? '#888' }}
                />
                <span className="text-xs font-medium text-foreground">
                  {LS_MODALITY_LABELS[mod]}
                </span>
              </th>
              {LS_DP_ORDER.map((dp) => {
                const cell = grouped.get(`${mod}|${dp}`) ?? [];
                const empty = cell.length === 0;
                return (
                  <td
                    key={dp}
                    className={cn(
                      'border border-border align-top px-2 py-2',
                      empty && 'bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,hsl(var(--muted))_4px,hsl(var(--muted))_5px)]',
                    )}
                  >
                    {empty ? (
                      <span className="text-[10px] text-muted-foreground/60">—</span>
                    ) : (
                      <ul className="space-y-1">
                        {cell.map((b, i) => (
                          <li key={i} className="leading-tight">
                            {b.src ? (
                              <a
                                href={b.src}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground hover:text-primary hover:underline"
                                title={b.desc}
                              >
                                {b.c}
                                {b.p ? ` — ${b.p}` : ''}
                              </a>
                            ) : (
                              <span className="text-foreground" title={b.desc}>
                                {b.c}
                                {b.p ? ` — ${b.p}` : ''}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <p className="text-[10px] text-muted-foreground font-mono mt-3">
        Hatched cells = no entries logged yet. Send additions via the Suggest
        link below — entries require a primary-source URL.
      </p>
    </div>
  );
}
