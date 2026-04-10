import Link from "next/link";
import { useLanguage } from '@/contexts/LanguageContext';
import { siteName } from "@/config/site";

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm text-[hsl(var(--footer-foreground))]/80 transition-colors hover:text-[hsl(var(--footer-foreground))]"
    >
      {children}
    </Link>
  );
}

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[hsl(var(--footer))] py-16 text-[hsl(var(--footer-foreground))]">
      <div className="container">
        <div className="mb-12 grid gap-12 md:grid-cols-2">
          <div>
            <Link href="/" className="block">
              <span className="text-4xl font-bold leading-none tracking-tight md:text-5xl lg:text-6xl">
                {siteName}
              </span>
            </Link>
            <p className="mt-6 max-w-sm text-sm text-[hsl(var(--footer-foreground))]/70">
              {t('footer.tagline')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:justify-end">
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--footer-foreground))]/50">
                Navigate
              </h3>
              <ul className="space-y-3">
                <li><FooterLink href="/">{t('nav.home')}</FooterLink></li>
                <li><FooterLink href="/about">{t('nav.about')}</FooterLink></li>
                <li><FooterLink href="/directory">{t('nav.directory')}</FooterLink></li>
                <li><FooterLink href="/maps">{t('nav.systemMaps')}</FooterLink></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--footer-foreground))]/50">
                Explore
              </h3>
              <ul className="space-y-3">
                <li><FooterLink href="/discovery">{t('nav.discovery')}</FooterLink></li>
                <li><FooterLink href="/newsfeed">{t('nav.newsfeed')}</FooterLink></li>
                <li><FooterLink href="/context">{t('nav.context')}</FooterLink></li>
                <li><FooterLink href="/tools">{t('nav.tools')}</FooterLink></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[hsl(var(--footer-foreground))]/20 pt-8 text-sm text-[hsl(var(--footer-foreground))]/60 md:flex-row">
          <p>Copyright {currentYear} {siteName}. {t('footer.rights')}.</p>
          <div className="flex gap-6">
            <span>{t('footer.privacy')}</span>
            <span>{t('footer.terms')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
