import React from 'react';

const icons = {
  patient: '●', doctor: '⚕', business: '■', startup: '▲', leader: '◆',
};

/** PersonaCard — homepage segment picker. Border-only card, icon differentiates persona (no per-persona color), arrow nudges right on hover. */
export function PersonaCard({ title, description, persona = 'patient' }) {
  const [hover, setHover] = React.useState(false);
  return (
    <a
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column', padding: 24, border: '1px solid hsl(var(--border))',
        borderColor: hover ? 'hsl(var(--foreground) / 0.5)' : 'hsl(var(--border))',
        textDecoration: 'none', color: 'hsl(var(--foreground))', cursor: 'pointer', transition: 'border-color .3s',
        fontFamily: 'var(--font-sans)', minHeight: 180,
      }}
    >
      <div style={{ fontSize: 22, color: hover ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))', marginBottom: 16, transition: 'color .2s' }}>{icons[persona]}</div>
      <h3 style={{ fontWeight: 600, marginBottom: 8, fontSize: 15 }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', flex: 1, lineHeight: 1.5 }}>{description}</p>
      <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 500, color: hover ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))', gap: hover ? 8 : 4, transition: 'gap .2s, color .2s' }}>
        Explore <span>&rarr;</span>
      </div>
    </a>
  );
}
