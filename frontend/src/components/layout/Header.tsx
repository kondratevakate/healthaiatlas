import { useLanguage } from '@/contexts/LanguageContext';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Menu, X, Mail } from 'lucide-react';
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

const navLinks = [
  { key: 'nav.home', path: '/' },
  { key: 'nav.discovery', path: '/discovery' },
  { key: 'nav.directory', path: '/directory' },
  { key: 'nav.context', path: '/context' },
  { key: 'nav.about', path: '/about' },
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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Save to localStorage for future use
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
