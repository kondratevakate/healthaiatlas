import { useLanguage } from '@/civic/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { Card, CardDescription, CardHeader, CardTitle } from '@/civic/components/ui/card';
import { ArrowLeft, ArrowRight, Clock, Layers, Map, Wrench } from 'lucide-react';
import { domains } from '@/civic/data/domains';
import { getFeaturedPlayers } from '@/civic/data/players';
import { cn } from '@/civic/lib/utils';

const entryPoints = [
  {
    title: 'Directory',
    description: 'Explore organizations in the AI health ecosystem',
    path: '/directory',
    icon: Layers,
    color: 'text-gold',
    bgColor: 'bg-gold/10',
  },
  {
    title: 'System Maps',
    description: 'Browse the supporting system-level visual maps',
    path: '/maps',
    icon: Map,
    color: 'text-coral',
    bgColor: 'bg-coral/10',
  },
  {
    title: 'Context',
    description: 'Read the timeline, policy context, and ecosystem backdrop',
    path: '/context',
    icon: Clock,
    color: 'text-sage',
    bgColor: 'bg-sage/10',
  },
  {
    title: 'Tools',
    description: 'Open frameworks and methods for ecosystem analysis',
    path: '/tools',
    icon: Wrench,
    color: 'text-sky',
    bgColor: 'bg-sky/10',
  },
] as const;

export function FeaturedSection() {
  const { t, language, isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const featuredPlayers = getFeaturedPlayers().slice(0, 4);

  const getPlayerDirectoryPath = (playerId: string) => {
    const domain = domains.find(
      (domainItem) => domainItem.id !== 'overview' && domainItem.playerIds.includes(playerId),
    );

    return domain ? `/directory/${domain.id}` : '/directory';
  };

  return (
    <section className="py-20">
      <div className="container space-y-20">
        <div>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="heading-serif-sm">{t('section.entryPoints')}</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {entryPoints.map((entry) => {
              const Icon = entry.icon;
              return (
                <Link key={entry.path} to={entry.path}>
                  <Card className="card-hover h-full cursor-pointer border-border/50 bg-card/50 group">
                    <CardHeader>
                      <div
                        className={cn(
                          'mb-4 flex h-10 w-10 items-center justify-center rounded-lg',
                          entry.bgColor,
                        )}
                      >
                        <Icon className={cn('h-5 w-5', entry.color)} />
                      </div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {entry.title}
                        <ArrowIcon className="h-4 w-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                      </CardTitle>
                      <CardDescription>{entry.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="heading-serif-sm">{t('section.featuredPlayers')}</h2>
            <Link
              to="/directory"
              className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {t('action.viewAll')}
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredPlayers.map((player) => (
              <Link key={player.id} to={getPlayerDirectoryPath(player.id)}>
                <Card className="card-hover h-full cursor-pointer border-border/50 bg-card/50 group">
                  <CardHeader>
                    <div className="mb-2 flex items-start justify-between">
                      <span className="tag-label text-muted-foreground">
                        {t(`type.${player.type}`)}
                      </span>
                      <span className="text-xs text-muted-foreground">{player.founded}</span>
                    </div>
                    <CardTitle className="text-base">{player.name[language]}</CardTitle>
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
