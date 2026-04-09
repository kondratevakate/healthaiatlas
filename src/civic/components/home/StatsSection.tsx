import { useLanguage } from '@/civic/contexts/LanguageContext';
import { players } from '@/civic/data/players';
import { timelineEvents } from '@/civic/data/timeline';
import { analysisTools } from '@/civic/data/tools';

export function StatsSection() {
  const { t } = useLanguage();

  const stats = [
    { key: 'stats.players', value: players.length },
    { key: 'stats.countries', value: [...new Set(players.map(p => p.country))].length },
    { key: 'stats.tools', value: analysisTools.length },
    { key: 'stats.events', value: timelineEvents.length },
  ];

  return (
    <section className="py-16 md:py-20 border-t border-border">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat) => (
            <div key={stat.key} className="text-center md:text-left">
              <div className="font-serif text-5xl md:text-6xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
                {t(stat.key)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

