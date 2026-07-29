import React from 'react';

/** Card — flat surface, 1px border, no shadow by default. Hover (when interactive) adds a subtle shadow, never a scale/lift beyond 1px translate. */
export function Card({ children, interactive = false, style }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))',
        border: '1px solid hsl(var(--border))', borderRadius: 0,
        boxShadow: interactive && hover ? 'var(--shadow-sm)' : 'none',
        transform: interactive && hover ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow .25s, transform .25s, border-color .25s',
        borderColor: interactive && hover ? 'hsl(var(--foreground) / 0.5)' : 'hsl(var(--border))',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
export function CardContent({ children, style }) { return <div style={{ padding: 24, ...style }}>{children}</div>; }
export function CardHeader({ children, style }) { return <div style={{ padding: '24px 24px 0', ...style }}>{children}</div>; }
