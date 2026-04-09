import { useLanguage } from '@/civic/contexts/LanguageContext';
import { Button } from '@/civic/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HeroSection() {
  const { t, isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="relative py-16 md:py-24 lg:py-32">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left: Title with coral marker */}
          <div>
            <h1 className="heading-display-xl section-marker mb-8">
              AI Health<br />Directory
            </h1>
          </div>

          {/* Right: Description + CTA */}
          <div className="lg:pt-8">
            <p className="text-body text-muted-foreground mb-8 max-w-lg">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-none font-medium">
                <Link to="/directory">
                  {t('hero.exploreDirectory')}
                  <ArrowIcon className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-none font-medium">
                <Link to="/maps">
                  {t('hero.viewMaps')}
                  <ArrowIcon className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

