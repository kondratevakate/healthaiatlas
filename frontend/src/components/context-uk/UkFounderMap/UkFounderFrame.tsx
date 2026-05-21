import { UK_FOUNDER_FRAME } from '@/data/ukMarketReality';

export function UkFounderFrame() {
  return (
    <div className="space-y-3">
      {UK_FOUNDER_FRAME.map((t, i) => (
        <div key={t.id} className="border-l-2 border-primary pl-3 py-1">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h4 className="font-serif text-base font-semibold text-foreground leading-tight">
              {t.title}
            </h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.body}</p>
        </div>
      ))}
    </div>
  );
}
