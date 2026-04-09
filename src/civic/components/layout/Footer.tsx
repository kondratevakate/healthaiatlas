import { useLanguage } from '@/civic/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { siteName } from '@/config/site-content';

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[hsl(var(--footer))] py-16 text-[hsl(var(--footer-foreground))]">
      <div className="container">
        <div className="mb-12 grid gap-12 md:grid-cols-2">
          <div>
            <Link to="/" className="block">
              <span className="text-4xl font-bold leading-none tracking-tight md:text-5xl lg:text-6xl">
                AI Health
                <br />
                Directory
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
                <li>
                  <Link
                    to="/"
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 transition-colors hover:text-[hsl(var(--footer-foreground))]"
                  >
                    {t('nav.home')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 transition-colors hover:text-[hsl(var(--footer-foreground))]"
                  >
                    {t('nav.about')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/directory"
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 transition-colors hover:text-[hsl(var(--footer-foreground))]"
                  >
                    {t('nav.directory')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/maps"
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 transition-colors hover:text-[hsl(var(--footer-foreground))]"
                  >
                    {t('nav.systemMaps')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--footer-foreground))]/50">
                Explore
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/discovery"
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 transition-colors hover:text-[hsl(var(--footer-foreground))]"
                  >
                    Discovery
                  </Link>
                </li>
                <li>
                  <Link
                    to="/newsfeed"
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 transition-colors hover:text-[hsl(var(--footer-foreground))]"
                  >
                    Newsfeed
                  </Link>
                </li>
                <li>
                  <Link
                    to="/context"
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 transition-colors hover:text-[hsl(var(--footer-foreground))]"
                  >
                    Context
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tools"
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 transition-colors hover:text-[hsl(var(--footer-foreground))]"
                  >
                    {t('nav.tools')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[hsl(var(--footer-foreground))]/20 pt-8 text-sm text-[hsl(var(--footer-foreground))]/60 md:flex-row">
          <p>Copyright {currentYear} {siteName}. {t('footer.rights')}.</p>
          <div className="flex gap-6">
            <span>
              {t('footer.privacy')}
            </span>
            <span>
              {t('footer.terms')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
