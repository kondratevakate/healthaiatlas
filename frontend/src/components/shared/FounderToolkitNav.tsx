// Horizontal section switcher shown on Founder Toolkit deep pages.
// Simple flat links — the dropdown lives in the main Header nav.

import { NavLink } from 'react-router-dom';
import { Home, Building2, Activity, Cpu, Skull, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

// Context is a toolkit module (P1a) — canonical page at /founders/context, so
// it is listed here alongside the other modules.
const SECTIONS: { to: string; icon: typeof Home; label: string; end?: boolean }[] = [
  { to: '/founders',               icon: Home,      label: 'Home',        end: true },
  { to: '/founders/markets',       icon: Building2, label: 'Markets' },
  { to: '/founders/architectures', icon: Activity,  label: 'SOTA' },
  { to: '/founders/tech',          icon: Cpu,       label: 'Tech Signals' },
  { to: '/founders/dead-valley',   icon: Skull,     label: 'Dead Valley' },
  { to: '/founders/context',       icon: Globe,     label: 'Context' },
];

export function FounderToolkitNav() {
  return (
    <nav className="flex flex-wrap gap-1 mb-6">
      {SECTIONS.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 border transition-colors',
              isActive
                ? 'border-primary/60 bg-primary/10 text-foreground'
                : 'border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-border/80',
            )
          }
        >
          <Icon className="w-3 h-3" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
