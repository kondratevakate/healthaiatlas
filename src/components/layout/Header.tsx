import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Menu, X, Mail } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { siteName } from "@/config/site";

const navLinks = [
  { key: 'nav.home', path: '/' },
  { key: 'nav.discovery', path: '/discovery' },
  { key: 'nav.newsfeed', path: '/newsfeed' },
  { key: 'nav.directory', path: '/directory' },
  { key: 'nav.context', path: '/context' },
  { key: 'nav.about', path: '/about' },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface NavLinksProps {
  mobile?: boolean;
  pathname: string;
  t: (key: string) => string;
  onNavigate?: () => void;
}

function NavLinks({ mobile, pathname, t, onNavigate }: NavLinksProps) {
  return (
    <>
      {navLinks.map((link) => {
        const isActive = isActivePath(pathname, link.path);
        return mobile ? (
          <Link
            key={link.path}
            href={link.path}
            onClick={onNavigate}
            className={cn(
              'block px-4 py-3 text-sm font-medium transition-colors',
              isActive ? 'bg-secondary/60 text-foreground' : 'text-foreground/65 hover:text-foreground',
            )}
          >
            {t(link.key)}
          </Link>
        ) : (
          <Link
            key={link.path}
            href={link.path}
            className={cn(
              'relative py-1 text-sm font-medium transition-colors',
              isActive ? 'text-foreground' : 'text-foreground/58 hover:text-foreground',
            )}
          >
            {t(link.key)}
            {isActive && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />}
          </Link>
        );
      })}
    </>
  );
}

export function Header() {
  const { t } = useLanguage();
  const pathname = usePathname() ?? '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const saved = JSON.parse(localStorage.getItem('subscribe-emails') || '[]');
    if (!saved.includes(email)) {
      saved.push(email);
      localStorage.setItem('subscribe-emails', JSON.stringify(saved));
    }

    toast({ title: t('toast.subscribeTitle'), description: t('toast.subscribeDesc') });
    setEmail('');
    setSubscribeOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-6">
          <Link href="/" className="flex items-center shrink-0">
            <span className="text-lg font-bold tracking-tight text-foreground">
              {siteName}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <NavLinks pathname={pathname} t={t} />
          </nav>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSubscribeOpen(true)}
              className="hidden sm:flex text-foreground/72 hover:bg-muted hover:text-foreground"
            >
              <Mail className="h-4 w-4 mr-1" />
              {t('header.subscribe')}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-controls="mobile-navigation"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav id="mobile-navigation" className="md:hidden border-t border-border bg-background">
            <div className="container py-4 space-y-1">
              <NavLinks mobile pathname={pathname} t={t} onNavigate={() => setMobileMenuOpen(false)} />
              <div className="mt-4 border-t border-border px-4 pt-4">
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
              Newsletter coming soon. We&apos;ll save your interest and reach out when it launches.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
            <label htmlFor="subscribe-email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="subscribe-email"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <Button type="submit" className="w-full">
              Notify Me
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              No emails are sent yet; this feature is still being wired up.
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
