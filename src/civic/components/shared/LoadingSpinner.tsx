/**
 * Rotating-disk loading spinner matching the HeroDiagram aesthetic.
 * Pure CSS animation — no framer-motion dependency for fast first paint.
 */

const layers = [
  { r: 16, opacity: 0.08, dash: '3 8', width: 1.5, speed: 3, dir: 1 },
  { r: 24, opacity: 0.12, dash: '5 6', width: 1, speed: 4.5, dir: -1 },
  { r: 32, opacity: 0.16, dash: '8 4', width: 0.7, speed: 6, dir: 1 },
  { r: 38, opacity: 0.06, dash: '2 10', width: 0.5, speed: 8, dir: -1 },
];

const CX = 50;
const CY = 50;

export function LoadingSpinner({ text = 'Loading…' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="w-32 h-32 md:w-40 md:h-40">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <style>{`
            ${layers.map((l, i) => `
              @keyframes load-spin-${i} {
                from { transform: rotate(0deg); }
                to { transform: rotate(${l.dir * 360}deg); }
              }
              .load-ring-${i} {
                animation: load-spin-${i} ${l.speed}s linear infinite;
                transform-origin: ${CX}px ${CY}px;
              }
            `).join('')}
          `}</style>

          {layers.map((layer, i) => (
            <circle
              key={i}
              className={`load-ring-${i}`}
              cx={CX} cy={CY} r={layer.r}
              fill="none"
              stroke={`hsl(var(--foreground) / ${layer.opacity})`}
              strokeWidth={layer.width}
              strokeDasharray={layer.dash}
              strokeLinecap="round"
            />
          ))}

          {/* Center dot */}
          <circle
            cx={CX} cy={CY} r={5}
            fill="hsl(var(--foreground) / 0.05)"
            stroke="hsl(var(--foreground) / 0.15)"
            strokeWidth="0.8"
          />
        </svg>
      </div>
      <p className="text-sm text-muted-foreground tracking-wide">{text}</p>
    </div>
  );
}
