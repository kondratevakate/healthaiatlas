import { useLanguage } from '@/contexts/LanguageContext';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Globe, Menu, X, ChevronDown, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { domains } from '@/data/domains';
import { openCallEntries } from '@/data/openCallEntries';
import { conferences } from '@/data/conferences';
import { launches } from '@/data/launches';
import { SearchModal } from '@/components/search/SearchModal';

type NavLink = {
  key: string;
  // Internal route OR external URL. External entries are routed via <a>
  // instead of react-router <Link>, and the count badge is suppressed.
  path: string;
  dropdown?: boolean;
  external?: boolean;
  // Static count displayed as a small mono-font badge next to the label.
  // Pulled at module-load from the underlying data files (see below) so the
  // navbar's scale stays honest as inventory grows.
  count?: number;
};

// Intent-clustered primary navigation. Open Calls leads because it's the
// largest inventory and the primary traffic driver. Founder Toolkit is a
// vertical for one segment (founders). About anchors authorship + Atlas
// Notes pointer (Atlas Notes is no longer a top-level item — it lives
// contextually inside About).
const navLinks: NavLink[] = [
  { key: 'nav.home', path: '/', count: conferences.length + launches.length },
  { key: 'nav.opencalls', path: '/discovery?section=opencalls', count: openCallEntries.length },
  { key: 'nav.domains', path: '/directory', dropdown: true, count: domains.filter((d) => d.id !== 'overview').length },
  { key: 'nav.founders', path: '/founders', dropdown: true },
  { key: 'nav.about', path: '/about' },
];

// Per-domain player counts for the Domains dropdown.
const domainCounts: Record<string, number> = Object.fromEntries(
  domains.filter((d) => d.id !== 'overview').map((d) => [d.id, d.playerIds.length]),
);

// Resolves whether a nav link is currently active. Open Calls and Events both
// live on /discovery and are distinguished by the `section` query param; this
// helper handles that and any future query-keyed sub-routes without needing a
// dedicated branch per link.
function matchesActive(link: NavLink, pathname: string, params: URLSearchParams): boolean {
  if (link.external) return false;
  const [linkPath, linkQuery] = link.path.split('?');
  if (pathname !== linkPath) return false;
  if (linkQuery) {
    for (const [key, value] of new URLSearchParams(linkQuery)) {
      if (params.get(key) !== value) return false;
    }
    return true;
  }
  // Bare /discovery should NOT light up when the visitor is on the opencalls
  // section — only when no section param (or a non-opencalls one) is set.
  if (linkPath === '/discovery') return params.get('section') !== 'opencalls';
  return true;
}

function CountBadge({ count }: { count?: number }) {
  if (typeof count !== 'number' || count <= 0) return null;
  return <span className="text-[10px] text-muted-foreground font-mono">{count}</span>;
}

export function Header() {
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Global ⌘K / Ctrl+K shortcut opens the SearchModal. Ignored when an
  // input/textarea/contenteditable is focused so users typing into forms
  // (e.g. the subscribe modal) keep their keystrokes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'k' || !(e.metaKey || e.ctrlKey)) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;
      e.preventDefault();
      setSearchOpen((open) => !open);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isActive = (link: NavLink) =>
    matchesActive(link, location.pathname, searchParams);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const renderLabel = (link: NavLink, active: boolean) => (
    <span className="relative inline-flex items-baseline gap-1.5">
      <span className={active ? 'text-foreground' : ''}>
        {t(link.key)}
        {active && (
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary" />
        )}
      </span>
      <CountBadge count={link.count} />
      {link.external && <span aria-hidden className="text-xs">↗</span>}
    </span>
  );

  return (
    <>
    <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center group">
          <span className="text-lg font-bold tracking-tight text-foreground">
            HealthAI Atlas
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => {
            const active = isActive(link);
            const baseClass = cn(
              'text-sm font-medium transition-colors py-1',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            );

            if (link.external) {
              return (
                <a
                  key={link.path}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={baseClass}
                >
                  {renderLabel(link, false)}
                </a>
              );
            }

            // Founder Toolkit dropdown — single trigger = label + chevron,
            // so DropdownMenuContent align="start" anchors to the left edge
            // of "Founder Toolkit", not to the chevron icon.
            if (link.dropdown && link.path === '/founders') {
              const founderItems = [
                { to: '/founders/markets',       label: 'Markets',      sub: 'Market sizes + regulatory per country' },
                { to: '/founders/architectures', label: 'SOTA',         sub: 'State of the art in revenue architectures' },
                { to: '/founders/tech',          label: 'Tech Signals', sub: '29 DevRel advocates · 14 vendors · talent moves' },
                { to: '/founders/dead-valley',   label: 'Dead Valley',  sub: '$50B+ destroyed — patterns, not nostalgia' },
              ];
              return (
                <DropdownMenu key={link.path}>
                  <DropdownMenuTrigger asChild>
                    {/* Whole label + chevron is the trigger so the popup
                        left-edge aligns with "Founder Toolkit" not the icon */}
                    <button
                      className={cn(
                        baseClass,
                        'inline-flex items-center gap-1 outline-none',
                      )}
                      aria-label="Open Founder Toolkit sub-sections"
                    >
                      {renderLabel(link, active)}
                      <ChevronDown className="h-3 w-3 opacity-60" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    sideOffset={4}
                    className="min-w-[260px] rounded-none"
                  >
                    {/* First item navigates to the home page */}
                    <DropdownMenuItem asChild className="rounded-none">
                      <Link
                        to="/founders"
                        className="cursor-pointer w-full flex items-center text-left py-1.5 text-xs text-muted-foreground"
                      >
                        All sections →
                      </Link>
                    </DropdownMenuItem>
                    <div className="h-px bg-border mx-2 my-1" />
                    {founderItems.map((item) => (
                      <DropdownMenuItem key={item.to} asChild className="rounded-none">
                        <Link
                          to={item.to}
                          className="cursor-pointer w-full flex flex-col items-start text-left gap-0.5 py-1.5"
                        >
                          <span className="text-xs font-medium">{item.label}</span>
                          <span className="text-[10px] text-muted-foreground line-clamp-1">{item.sub}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            // Domains dropdown — whole label + chevron as single trigger.
            if (link.dropdown && link.path === '/directory') {
              const items = domains
                .filter((d) => d.id !== 'overview')
                .map((d) => ({
                  id: d.id,
                  to: `/directory?domain=${d.id}`,
                  label: d.name[language],
                  subtitle: d.subtitle?.[language],
                  count: domainCounts[d.id],
                }));
              return (
                <DropdownMenu key={link.path}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(baseClass, 'inline-flex items-center gap-1 outline-none')}
                      aria-label={`Open ${t(link.key)} sub-sections`}
                    >
                      {renderLabel(link, active)}
                      <ChevronDown className="h-3 w-3 opacity-60" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    sideOffset={4}
                    className="min-w-[260px] rounded-none"
                  >
                    {items.map((item) => (
                      <DropdownMenuItem key={item.id} asChild className="rounded-none">
                        <Link
                          to={item.to}
                          className="cursor-pointer w-full flex flex-col items-start text-left gap-0.5 py-1.5"
                        >
                          <span className="text-xs font-medium text-left inline-flex items-baseline gap-1.5">
                            {item.label}
                            <CountBadge count={item.count} />
                          </span>
                          {item.subtitle && (
                            <span className="text-[10px] text-muted-foreground line-clamp-1 text-left">
                              {item.subtitle}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            return (
              <Link key={link.path} to={link.path} className={baseClass}>
                {renderLabel(link, active)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Search Atlas (⌘K)"
            title="Search (⌘K)"
          >
            <Search className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Toggle language"
          >
            <Globe className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-border bg-background">
          <div className="container py-4 space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link);
              const itemClass = cn(
                'block px-4 py-3 text-sm font-medium transition-colors text-left',
                active ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground',
              );

              if (link.external) {
                return (
                  <a
                    key={link.path}
                    href={link.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className={itemClass}
                  >
                    {t(link.key)} ↗
                  </a>
                );
              }

              if (link.dropdown && link.path === '/founders') {
                const founderItems = [
                  { to: '/founders/markets',       label: 'Markets' },
                  { to: '/founders/architectures', label: 'SOTA' },
                  { to: '/founders/tech',          label: 'Tech Signals' },
                  { to: '/founders/dead-valley',   label: 'Dead Valley' },
                ];
                return (
                  <div key={link.path} className="space-y-0.5">
                    <Link to={link.path} onClick={() => setMobileMenuOpen(false)} className={itemClass}>
                      {t(link.key)}
                    </Link>
                    <div className="pl-4 border-l-2 border-border ml-4 space-y-0.5">
                      {founderItems.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              if (link.dropdown && link.path === '/directory') {
                const items = domains
                  .filter((d) => d.id !== 'overview')
                  .map((d) => ({
                    id: d.id,
                    to: `/directory?domain=${d.id}`,
                    label: d.name[language],
                    count: domainCounts[d.id],
                  }));
                return (
                  <div key={link.path} className="space-y-0.5">
                    <Link
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={itemClass}
                    >
                      <span className="inline-flex items-baseline gap-1.5">
                        {t(link.key)}
                        <CountBadge count={link.count} />
                      </span>
                    </Link>
                    <div className="pl-4 border-l-2 border-border ml-4 space-y-0.5">
                      {items.map((item) => (
                        <Link
                          key={item.id}
                          to={item.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
                        >
                          <span className="inline-flex items-baseline gap-1.5">
                            {item.label}
                            <CountBadge count={item.count} />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={itemClass}
                >
                  <span className="inline-flex items-baseline gap-1.5">
                    {t(link.key)}
                    <CountBadge count={link.count} />
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
    </>
  );
}
