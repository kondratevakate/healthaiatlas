import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import {
  SUGGEST_ENTRY_URL,
  SUGGEST_CORRECTION_URL,
  ATLAS_NOTES_SUBSCRIBE_URL,
} from '@/data/constants';

export function Footer() {
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[hsl(var(--footer))] text-[hsl(var(--footer-foreground))] py-16">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Left: Big typographic logo */}
          <div>
            <Link to="/" className="block">
              <span className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-none">
                HealthAI
                <br />
                Atlas
              </span>
            </Link>
            <p className="text-sm text-[hsl(var(--footer-foreground))]/70 mt-6 max-w-sm">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Right: Links in three columns mirroring the primary nav clusters.
              Browse = the directory's main inventory surfaces.
              Learn  = the editorial / contextual layer.
              Contribute = correction / extension surface (aisafety.com pattern). */}
          <div className="grid grid-cols-3 gap-8 md:justify-end">
            {/* Browse — the primary inventory surfaces */}
            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold mb-4 text-[hsl(var(--footer-foreground))]/50">
                {language === 'en' ? 'Browse' : 'تصفح'}
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/discovery?section=opencalls"
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 hover:text-[hsl(var(--footer-foreground))] transition-colors"
                  >
                    {t('nav.opencalls')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/directory"
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 hover:text-[hsl(var(--footer-foreground))] transition-colors"
                  >
                    {t('nav.domains')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 hover:text-[hsl(var(--footer-foreground))] transition-colors"
                  >
                    {t('nav.home')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Learn — editorial + founder-vertical content */}
            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold mb-4 text-[hsl(var(--footer-foreground))]/50">
                {language === 'en' ? 'Learn' : 'تعلم'}
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/founders"
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 hover:text-[hsl(var(--footer-foreground))] transition-colors"
                  >
                    {t('nav.founders')}
                  </Link>
                </li>
                <li>
                  <a
                    href={ATLAS_NOTES_SUBSCRIBE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 hover:text-[hsl(var(--footer-foreground))] transition-colors"
                  >
                    {t('nav.atlasnotes')} ↗
                  </a>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 hover:text-[hsl(var(--footer-foreground))] transition-colors"
                  >
                    {t('nav.about')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contribute — every page has this surface (aisafety.com pattern) */}
            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold mb-4 text-[hsl(var(--footer-foreground))]/50">
                {language === 'en' ? 'Contribute' : 'ساهم'}
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href={SUGGEST_ENTRY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 hover:text-[hsl(var(--footer-foreground))] transition-colors"
                  >
                    {language === 'en' ? 'Suggest entry' : 'اقترح إدراجاً'}
                  </a>
                </li>
                <li>
                  <a
                    href={SUGGEST_CORRECTION_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 hover:text-[hsl(var(--footer-foreground))] transition-colors"
                  >
                    {language === 'en' ? 'Suggest correction' : 'اقترح تصحيحاً'}
                  </a>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 hover:text-[hsl(var(--footer-foreground))] transition-colors"
                  >
                    {language === 'en' ? 'Co-found with me' : 'شاركني التأسيس'}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 hover:text-[hsl(var(--footer-foreground))] transition-colors"
                  >
                    {language === 'en' ? 'Contact' : 'تواصل'}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-[hsl(var(--footer-foreground))]/20 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[hsl(var(--footer-foreground))]/60">
          <p>© {currentYear} HealthAI Atlas. {t('footer.rights')}.</p>
          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="hover:text-[hsl(var(--footer-foreground))] transition-colors"
            >
              {t('footer.privacy')}
            </Link>
            <Link
              to="/contact"
              className="hover:text-[hsl(var(--footer-foreground))] transition-colors"
            >
              {language === 'en' ? 'Contact' : 'تواصل'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
