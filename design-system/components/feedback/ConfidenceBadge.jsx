import React from 'react';

const conf = {
  high: { label: 'High', color: 'success', filled: 3 },
  medium: { label: 'Medium', color: 'warning', filled: 2 },
  low: { label: 'Low', color: 'muted', filled: 1 },
};

/** ConfidenceBadge — computed-confidence chip (high/medium/low) derived from source count + official-source presence. Rendered as a 3-segment meter + label so it reads as an ordinal computed measure, distinct from the categorical EvidenceLabel stamp. */
export function ConfidenceBadge({ level = 'medium' }) {
  const cfg = conf[level];
  const isMuted = cfg.color === 'muted';
  const hue = isMuted ? 'muted-foreground' : cfg.color;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 12,
      borderRadius: 0, border: '1px solid hsl(var(--border))',
      background: 'hsl(var(--background))', color: 'hsl(var(--foreground))',
      padding: '4px 10px',
    }}>
      <span style={{ display: 'inline-flex', gap: 2 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{
            width: 5, height: 12, borderRadius: 0,
            border: `1px solid hsl(var(--${hue}))`,
            background: i < cfg.filled ? `hsl(var(--${hue}))` : 'transparent',
          }} />
        ))}
      </span>
      {cfg.label} confidence
    </span>
  );
}
