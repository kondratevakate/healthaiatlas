/* @ds-bundle: {"format":4,"namespace":"HealthAIAtlasDesignSystem_f13808","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Tag","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"CardContent","sourcePath":"components/core/Card.jsx"},{"name":"CardHeader","sourcePath":"components/core/Card.jsx"},{"name":"ConfidenceBadge","sourcePath":"components/feedback/ConfidenceBadge.jsx"},{"name":"EvidenceLabel","sourcePath":"components/feedback/EvidenceLabel.jsx"},{"name":"PersonaCard","sourcePath":"components/navigation/PersonaCard.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"27c667c61d67","components/core/Button.jsx":"2aa13b6838c1","components/core/Card.jsx":"b0a5852764b5","components/feedback/ConfidenceBadge.jsx":"ab99a2a5dd69","components/feedback/EvidenceLabel.jsx":"6b539d3d5447","components/navigation/PersonaCard.jsx":"eb53852cc3bc"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.HealthAIAtlasDesignSystem_f13808 = window.HealthAIAtlasDesignSystem_f13808 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
const fills = {
  default: {
    background: 'hsl(var(--primary))',
    color: 'hsl(var(--primary-foreground))'
  },
  secondary: {
    background: 'hsl(var(--secondary))',
    color: 'hsl(var(--secondary-foreground))'
  },
  outline: {
    background: 'transparent',
    color: 'hsl(var(--foreground))',
    border: '1px solid hsl(var(--foreground))'
  },
  destructive: {
    background: 'hsl(var(--destructive))',
    color: 'hsl(var(--destructive-foreground))'
  }
};

/** Badge — small status/count pill. Square corners, 1px border for outline variant. */
function Badge({
  variant = 'default',
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      fontWeight: 600,
      padding: '2px 10px',
      borderRadius: 999,
      ...fills[variant],
      ...style
    }
  }, children);
}

/** Tag — the site's uppercase mono-tracked label, square corners, used for category chips and filters. */
function Tag({
  filled = false,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      fontWeight: 600,
      padding: '6px 12px',
      borderRadius: 0,
      background: filled ? 'hsl(var(--foreground))' : 'transparent',
      color: filled ? 'hsl(var(--background))' : 'hsl(var(--foreground))',
      border: filled ? 'none' : '1px solid hsl(var(--foreground))',
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Badge, Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** @type {React.CSSProperties} */
const base = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  fontFamily: 'var(--font-sans)',
  fontWeight: 500,
  whiteSpace: 'nowrap',
  border: '1px solid transparent',
  cursor: 'pointer',
  transition: 'background-color .15s, color .15s, opacity .15s',
  borderRadius: 0
};
const sizes = {
  default: {
    height: 40,
    padding: '0 16px',
    fontSize: 14
  },
  sm: {
    height: 36,
    padding: '0 12px',
    fontSize: 13
  },
  lg: {
    height: 44,
    padding: '0 32px',
    fontSize: 15
  },
  icon: {
    height: 40,
    width: 40,
    padding: 0
  }
};
function variantStyle(variant) {
  switch (variant) {
    case 'outline':
      return {
        background: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
        borderColor: 'hsl(var(--foreground))'
      };
    case 'secondary':
      return {
        background: 'hsl(var(--secondary))',
        color: 'hsl(var(--secondary-foreground))'
      };
    case 'ghost':
      return {
        background: 'transparent',
        color: 'hsl(var(--foreground))'
      };
    case 'destructive':
      return {
        background: 'hsl(var(--destructive))',
        color: 'hsl(var(--destructive-foreground))'
      };
    case 'link':
      return {
        background: 'transparent',
        color: 'hsl(var(--primary))',
        textDecoration: 'underline',
        textUnderlineOffset: 4,
        height: 'auto',
        padding: 0
      };
    default:
      return {
        background: 'hsl(var(--primary))',
        color: 'hsl(var(--primary-foreground))'
      };
  }
}

/**
 * Button — the system's single interactive-primitive shape. Square corners
 * (radius 0 always), 1px borders, no shadow. Hover = darken/lighten by
 * opacity blend, never a color swap.
 */
function Button({
  variant = 'default',
  size = 'default',
  disabled,
  children,
  style,
  onClick,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const v = variantStyle(variant);
  const hoverStyle = (() => {
    if (disabled) return {};
    if (variant === 'default') return hover ? {
      opacity: 0.9
    } : {};
    if (variant === 'secondary') return hover ? {
      opacity: 0.8
    } : {};
    if (variant === 'outline' || variant === 'ghost') return hover ? {
      background: 'hsl(var(--accent))',
      color: 'hsl(var(--accent-foreground))'
    } : {};
    if (variant === 'destructive') return hover ? {
      opacity: 0.9
    } : {};
    return {};
  })();
  return /*#__PURE__*/React.createElement("button", _extends({
    onClick: onClick,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      ...base,
      ...sizes[size],
      ...v,
      ...hoverStyle,
      opacity: disabled ? 0.5 : hoverStyle.opacity ?? 1,
      pointerEvents: disabled ? 'none' : 'auto',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
/** Card — flat surface, 1px border, no shadow by default. Hover (when interactive) adds a subtle shadow, never a scale/lift beyond 1px translate. */
function Card({
  children,
  interactive = false,
  style
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: 'hsl(var(--card))',
      color: 'hsl(var(--card-foreground))',
      border: '1px solid hsl(var(--border))',
      borderRadius: 0,
      boxShadow: interactive && hover ? 'var(--shadow-sm)' : 'none',
      transform: interactive && hover ? 'translateY(-2px)' : 'none',
      transition: 'box-shadow .25s, transform .25s, border-color .25s',
      borderColor: interactive && hover ? 'hsl(var(--foreground) / 0.5)' : 'hsl(var(--border))',
      ...style
    }
  }, children);
}
function CardContent({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      ...style
    }
  }, children);
}
function CardHeader({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px 24px 0',
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Card, CardContent, CardHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ConfidenceBadge.jsx
try { (() => {
const conf = {
  high: {
    label: 'High',
    color: 'success',
    filled: 3
  },
  medium: {
    label: 'Medium',
    color: 'warning',
    filled: 2
  },
  low: {
    label: 'Low',
    color: 'muted',
    filled: 1
  }
};

/** ConfidenceBadge — computed-confidence chip (high/medium/low) derived from source count + official-source presence. Rendered as a 3-segment meter + label so it reads as an ordinal computed measure, distinct from the categorical EvidenceLabel stamp. */
function ConfidenceBadge({
  level = 'medium'
}) {
  const cfg = conf[level];
  const isMuted = cfg.color === 'muted';
  const hue = isMuted ? 'muted-foreground' : cfg.color;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: 'var(--font-sans)',
      fontWeight: 500,
      fontSize: 12,
      borderRadius: 0,
      border: '1px solid hsl(var(--border))',
      background: 'hsl(var(--background))',
      color: 'hsl(var(--foreground))',
      padding: '4px 10px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      gap: 2
    }
  }, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 5,
      height: 12,
      borderRadius: 0,
      border: `1px solid hsl(var(--${hue}))`,
      background: i < cfg.filled ? `hsl(var(--${hue}))` : 'transparent'
    }
  }))), cfg.label, " confidence");
}
Object.assign(__ds_scope, { ConfidenceBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ConfidenceBadge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EvidenceLabel.jsx
try { (() => {
const levels = {
  official: {
    label: 'Official',
    color: 'success'
  },
  observed: {
    label: 'Observed',
    color: 'info'
  },
  anecdotal: {
    label: 'Anecdotal',
    color: 'warning'
  },
  inference: {
    label: 'Inference',
    color: 'muted'
  }
};

/** EvidenceLabel — the ladder-of-evidence chip: Official > Observed > Anecdotal > Inference. Colors are semantic (success/info/warning), never brand hue. */
function EvidenceLabel({
  level = 'inference',
  size = 'sm'
}) {
  const cfg = levels[level];
  const isMuted = cfg.color === 'muted';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'var(--font-mono)',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      borderRadius: 0,
      border: `1px solid hsl(var(--${isMuted ? 'muted-foreground' : cfg.color}))`,
      background: isMuted ? 'hsl(var(--muted-foreground))' : `hsl(var(--${cfg.color}))`,
      color: 'hsl(var(--primary-foreground))',
      padding: size === 'sm' ? '2px 8px' : '4px 12px',
      fontSize: size === 'sm' ? 11 : 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      background: 'hsl(var(--primary-foreground))',
      borderRadius: 0
    }
  }), cfg.label);
}
Object.assign(__ds_scope, { EvidenceLabel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EvidenceLabel.jsx", error: String((e && e.message) || e) }); }

// components/navigation/PersonaCard.jsx
try { (() => {
const icons = {
  patient: '●',
  doctor: '⚕',
  business: '■',
  startup: '▲',
  leader: '◆'
};

/** PersonaCard — homepage segment picker. Border-only card, icon differentiates persona (no per-persona color), arrow nudges right on hover. */
function PersonaCard({
  title,
  description,
  persona = 'patient'
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      flexDirection: 'column',
      padding: 24,
      border: '1px solid hsl(var(--border))',
      borderColor: hover ? 'hsl(var(--foreground) / 0.5)' : 'hsl(var(--border))',
      textDecoration: 'none',
      color: 'hsl(var(--foreground))',
      cursor: 'pointer',
      transition: 'border-color .3s',
      fontFamily: 'var(--font-sans)',
      minHeight: 180
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      color: hover ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
      marginBottom: 16,
      transition: 'color .2s'
    }
  }, icons[persona]), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontWeight: 600,
      marginBottom: 8,
      fontSize: 15
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'hsl(var(--muted-foreground))',
      flex: 1,
      lineHeight: 1.5
    }
  }, description), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 13,
      fontWeight: 500,
      color: hover ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
      gap: hover ? 8 : 4,
      transition: 'gap .2s, color .2s'
    }
  }, "Explore ", /*#__PURE__*/React.createElement("span", null, "→")));
}
Object.assign(__ds_scope, { PersonaCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/PersonaCard.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CardContent = __ds_scope.CardContent;

__ds_ns.CardHeader = __ds_scope.CardHeader;

__ds_ns.ConfidenceBadge = __ds_scope.ConfidenceBadge;

__ds_ns.EvidenceLabel = __ds_scope.EvidenceLabel;

__ds_ns.PersonaCard = __ds_scope.PersonaCard;

})();
