import React from 'react';

const levels = {
  official: { label: 'Official', color: 'success' },
  observed: { label: 'Observed', color: 'info' },
  anecdotal: { label: 'Anecdotal', color: 'warning' },
  inference: { label: 'Inference', color: 'muted' },
};

/** EvidenceLabel — the ladder-of-evidence chip: Official > Observed > Anecdotal > Inference. Colors are semantic (success/info/warning), never brand hue. */
export function EvidenceLabel({ level = 'inference', size = 'sm' }) {
  const cfg = levels[level];
  const isMuted = cfg.color === 'muted';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontWeight: 500,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      borderRadius: 0, border: `1px solid hsl(var(--${isMuted ? 'muted-foreground' : cfg.color}))`,
      background: isMuted ? 'hsl(var(--muted-foreground))' : `hsl(var(--${cfg.color}))`,
      color: 'hsl(var(--primary-foreground))',
      padding: size === 'sm' ? '2px 8px' : '4px 12px', fontSize: size === 'sm' ? 11 : 13,
    }}>
      <span style={{ width: 6, height: 6, background: 'hsl(var(--primary-foreground))', borderRadius: 0 }} />
      {cfg.label}
    </span>
  );
}
