import React from 'react';

/** @type {React.CSSProperties} */
const base = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  fontFamily: 'var(--font-sans)', fontWeight: 500, whiteSpace: 'nowrap',
  border: '1px solid transparent', cursor: 'pointer', transition: 'background-color .15s, color .15s, opacity .15s',
  borderRadius: 0,
};

const sizes = {
  default: { height: 40, padding: '0 16px', fontSize: 14 },
  sm: { height: 36, padding: '0 12px', fontSize: 13 },
  lg: { height: 44, padding: '0 32px', fontSize: 15 },
  icon: { height: 40, width: 40, padding: 0 },
};

function variantStyle(variant) {
  switch (variant) {
    case 'outline': return { background: 'hsl(var(--background))', color: 'hsl(var(--foreground))', borderColor: 'hsl(var(--foreground))' };
    case 'secondary': return { background: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' };
    case 'ghost': return { background: 'transparent', color: 'hsl(var(--foreground))' };
    case 'destructive': return { background: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' };
    case 'link': return { background: 'transparent', color: 'hsl(var(--primary))', textDecoration: 'underline', textUnderlineOffset: 4, height: 'auto', padding: 0 };
    default: return { background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' };
  }
}

/**
 * Button — the system's single interactive-primitive shape. Square corners
 * (radius 0 always), 1px borders, no shadow. Hover = darken/lighten by
 * opacity blend, never a color swap.
 */
export function Button({ variant = 'default', size = 'default', disabled, children, style, onClick, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const v = variantStyle(variant);
  const hoverStyle = (() => {
    if (disabled) return {};
    if (variant === 'default') return hover ? { opacity: 0.9 } : {};
    if (variant === 'secondary') return hover ? { opacity: 0.8 } : {};
    if (variant === 'outline' || variant === 'ghost') return hover ? { background: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' } : {};
    if (variant === 'destructive') return hover ? { opacity: 0.9 } : {};
    return {};
  })();
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...sizes[size], ...v, ...hoverStyle, opacity: disabled ? 0.5 : (hoverStyle.opacity ?? 1), pointerEvents: disabled ? 'none' : 'auto', ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}
