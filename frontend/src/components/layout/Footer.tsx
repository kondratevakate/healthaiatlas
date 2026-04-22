import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

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
                AI Health
                <br />
                Directory
              </span>
            </Link>
            <p className="text-sm text-[hsl(var(--footer-foreground))]/70 mt-6 max-w-sm">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Right: Links in columns */}
          <div className="grid grid-cols-2 gap-8 md:justify-end">
            {/* Navigation */}
            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold mb-4 text-[hsl(var(--footer-foreground))]/50">
                {language === 'en' ? 'Navigate' : 'تصفح'}
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/" 
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 hover:text-[hsl(var(--footer-foreground))] transition-colors"
                  >
                    {t('nav.home')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 hover:text-[hsl(var(--footer-foreground))] transition-colors"
                  >
                    {t('nav.about')}
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
                <li>
                  <Link 
                    to="/directory" 
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 hover:text-[hsl(var(--footer-foreground))] transition-colors"
                  >
                    {t('nav.directory')}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/maps" 
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 hover:text-[hsl(var(--footer-foreground))] transition-colors"
                  >
                    {t('nav.systemMaps')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Explore */}
            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold mb-4 text-[hsl(var(--footer-foreground))]/50">
                {language === 'en' ? 'Explore' : 'استكشف'}
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/discovery" 
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 hover:text-[hsl(var(--footer-foreground))] transition-colors"
                  >
                    {language === 'en' ? 'Discovery' : 'الاستكشاف'}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/discovery?tab=launches"
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 hover:text-[hsl(var(--footer-foreground))] transition-colors"
                  >
                    {language === 'en' ? 'Launches' : 'إطلاقات'}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/context" 
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 hover:text-[hsl(var(--footer-foreground))] transition-colors"
                  >
                    {language === 'en' ? 'Context' : 'السياق'}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/tools" 
                    className="text-sm text-[hsl(var(--footer-foreground))]/80 hover:text-[hsl(var(--footer-foreground))] transition-colors"
                  >
                    {t('nav.tools')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-[hsl(var(--footer-foreground))]/20 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[hsl(var(--footer-foreground))]/60">
          <p>© {currentYear} AI Health Directory. {t('footer.rights')}.</p>
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
