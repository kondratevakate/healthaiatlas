import { useLanguage } from '@/contexts/LanguageContext';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Menu, X, Mail, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { domains } from '@/data/domains';

type NavLink = { key: string; path: string; dropdown?: boolean };

const navLinks: NavLink[] = [
  { key: 'nav.home', path: '/' },
  { key: 'nav.discovery', path: '/discovery', dropdown: true },
  { key: 'nav.directory', path: '/directory', dropdown: true },
  { key: 'nav.context', path: '/context' },
  { key: 'nav.about', path: '/about' },
];

// Discovery section sub-nav — mirrors SECTION_NAV in pages/Discovery.tsx.
// Kept in sync manually; if you add a section there, add it here too.
const discoverySections: { id: string; label: string; subtitle: string; param: string }[] = [
  { id: 'newsfeed', label: 'Newsfeed', subtitle: 'Events, launches, leaders, prompts', param: '' },
  { id: 'opencalls', label: 'Open Calls', subtitle: 'Grants, programs, RFPs, sandboxes', param: 'section=opencalls' },
  { id: 'talent', label: 'Talent Hub', subtitle: 'Curated rated-people directory', param: 'section=talent' },
];

export function Header() {
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [email, setEmail] = useState('');

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Try the backend Worker if configured; always also keep a local copy.
    const url = import.meta.env.VITE_NEWSLETTER_SIGNUP_URL as string | undefined;
    if (url) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, source: 'healthaiatlas/header' }),
        });
      } catch {
        /* fall through to local-only */
      }
    }
    const saved = JSON.parse(localStorage.getItem('subscribe-emails') || '[]');
    if (!saved.includes(email)) {
      saved.push(email);
      localStorage.setItem('subscribe-emails', JSON.stringify(saved));
    }
    toast({ title: 'Thanks!', description: "We'll reach out when the newsletter launches." });
    setEmail('');
    setSubscribeOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center group">
            <span className="text-lg font-bold tracking-tight text-foreground">
              AI Health Directory
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;

              if (link.dropdown) {
                // Build the dropdown items for this nav link.
                const items: { id: string; to: string; label: string; subtitle?: string }[] =
                  link.path === '/directory'
                    ? domains
                        .filter((d) => d.id !== 'overview')
                        .map((d) => ({
                          id: d.id,
                          to: `/directory?domain=${d.id}`,
                          label: d.name[language],
                          subtitle: d.subtitle?.[language],
                        }))
                    : link.path === '/discovery'
                    ? discoverySections.map((s) => ({
                        id: s.id,
                        to: s.param ? `/discovery?${s.param}` : '/discovery',
                        label: s.label,
                        subtitle: s.subtitle,
                      }))
                    : [];

                return (
                  <div key={link.path} className="relative inline-flex items-center">
                    {/* Main label — clickable, navigates to the section's overview */}
                    <Link
                      to={link.path}
                      className={cn(
                        "text-sm font-medium transition-colors relative py-1",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t(link.key)}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                      )}
                    </Link>
                    {/* Chevron — opens sub-section dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={cn(
                          "ml-1 p-1 outline-none transition-colors",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        aria-label={`Open ${t(link.key)} sub-sections`}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" sideOffset={4} className="min-w-[240px] rounded-none">
                        {items.map((item) => (
                          <DropdownMenuItem key={item.id} asChild className="rounded-none">
                            <Link
                              to={item.to}
                              className="cursor-pointer w-full flex flex-col items-start text-left gap-0.5 py-1.5"
                            >
                              <span className="text-xs font-medium text-left">{item.label}</span>
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
                  </div>
                );
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors relative py-1",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t(link.key)}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSubscribeOpen(true)}
              className="hidden sm:flex text-muted-foreground hover:text-foreground"
            >
              <Mail className="h-4 w-4 mr-1" />
              {t('header.subscribe')}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="text-muted-foreground hover:text-foreground"
            >
              <Globe className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-border bg-background">
            <div className="container py-4 space-y-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;

                if (link.dropdown) {
                  const items: { id: string; to: string; label: string }[] =
                    link.path === '/directory'
                      ? domains
                          .filter((d) => d.id !== 'overview')
                          .map((d) => ({
                            id: d.id,
                            to: `/directory?domain=${d.id}`,
                            label: d.name[language],
                          }))
                      : link.path === '/discovery'
                      ? discoverySections.map((s) => ({
                          id: s.id,
                          to: s.param ? `/discovery?${s.param}` : '/discovery',
                          label: s.label,
                        }))
                      : [];

                  return (
                    <div key={link.path} className="space-y-0.5">
                      <Link
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "block px-4 py-3 text-sm font-medium transition-colors text-left",
                          isActive
                            ? "text-primary bg-primary/5"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {t(link.key)}
                      </Link>
                      <div className="pl-4 border-l-2 border-border ml-4 space-y-0.5">
                        {items.map((item) => (
                          <Link
                            key={item.id}
                            to={item.to}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
                          >
                            {item.label}
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
                    className={cn(
                      "block px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "text-primary bg-primary/5"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t(link.key)}
                  </Link>
                );
              })}
              <div className="px-4 pt-4 border-t border-border mt-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSubscribeOpen(true);
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {t('header.subscribe')}
                </Button>
              </div>
            </div>
          </nav>
        )}
      </header>

      <Dialog open={subscribeOpen} onOpenChange={setSubscribeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Get Notified</DialogTitle>
            <DialogDescription>
              Newsletter coming soon. We'll save your interest and reach out when it launches.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              Notify Me
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              No emails sent yet — we're building this feature.
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
