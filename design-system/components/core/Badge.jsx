import React from 'react';

const fills = {
  default: { background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' },
  secondary: { background: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' },
  outline: { background: 'transparent', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--foreground))' },
  destructive: { background: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' },
};

/** Badge — small status/count pill. Square corners, 1px border for outline variant. */
export function Badge({ variant = 'default', children, style }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 999, ...fills[variant], ...style }}>
      {children}
    </span>
  );
}

/** Tag — the site's uppercase mono-tracked label, square corners, used for category chips and filters. */
export function Tag({ filled = false, children, style }) {
  return (
    <span style={{
      fontFamily: 'var(--font-sans)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600,
      padding: '6px 12px', borderRadius: 0,
      background: filled ? 'hsl(var(--foreground))' : 'transparent',
      color: filled ? 'hsl(var(--background))' : 'hsl(var(--foreground))',
      border: filled ? 'none' : '1px solid hsl(var(--foreground))',
      ...style,
    }}>
      {children}
    </span>
  );
}
