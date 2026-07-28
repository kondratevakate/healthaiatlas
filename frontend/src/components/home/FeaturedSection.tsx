import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Layers, Compass, Calendar } from 'lucide-react';
import { getFeaturedPlayers } from '@/data/players';
import { cn } from '@/lib/utils';

const entryPoints = [
  {
    key: 'directory',
    path: '/directory',
    icon: Layers,
    color: 'text-gold',
    bgColor: 'bg-gold/10',
  },
  {
    key: 'discovery',
    path: '/discovery',
    icon: Compass,
    color: 'text-coral',
    bgColor: 'bg-coral/10',
  },
  {
    key: 'context',
    path: '/context',
    icon: Calendar,
    color: 'text-sage',
    bgColor: 'bg-sage/10',
  },
];

export function FeaturedSection() {
  const { t, language, isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const featuredPlayers = getFeaturedPlayers().slice(0, 4);

  return (
    <section className="py-20">
      <div className="container space-y-20">
        {/* Entry Points */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="heading-section-sm">{t('section.entryPoints')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {entryPoints.map((entry) => {
              const Icon = entry.icon;
              return (
                <Link key={entry.key} to={entry.path}>
                  <Card className="card-hover h-full group cursor-pointer border-border/50 bg-card/50">
                    <CardHeader>
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-4", entry.bgColor)}>
                        <Icon className={cn("h-5 w-5", entry.color)} />
                      </div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {t(`entry.${entry.key}.title`)}
                        <ArrowIcon className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </CardTitle>
                      <CardDescription>
                        {t(`entry.${entry.key}.desc`)}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Featured Players */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="heading-section-sm">{t('section.featuredPlayers')}</h2>
            <Link 
              to="/directory" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              {t('action.viewAll')}
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredPlayers.map((player) => (
              <Link key={player.id} to={`/directory/${player.id}`}>
                <Card className="card-hover h-full group cursor-pointer border-border/50 bg-card/50">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <span className="tag-label text-muted-foreground">
                        {t(`type.${player.type}`)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {player.founded}
                      </span>
                    </div>
                    <CardTitle className="text-base">
                      {player.name[language]}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {player.description[language]}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
