import { Layout } from '@/civic/components/layout';
import { Button } from '@/civic/components/ui/button';
import { Badge } from '@/civic/components/ui/badge';
import {
  TrendingUp,
  BookOpen,
  ExternalLink,
  Eye,
  LinkIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { launches, Launch } from '@/civic/data/launches';
import { resources } from '@/civic/data/resources';
import { useLanguage } from '@/civic/contexts/LanguageContext';
import { useState, useMemo } from 'react';
import { cn } from '@/civic/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/civic/components/ui/tabs';
import { LastUpdated } from '@/civic/components/shared/LastUpdated';
import {
  isToday,
  isThisWeek,
  isThisMonth,
} from 'date-fns';

type TimePeriod = 'today' | 'week' | 'month' | 'all';

function ProductCard({ launch }: { launch: Launch }) {
  return (
    <div className="group flex items-start gap-4 border-b border-border p-5 transition-colors hover:bg-muted/30 md:p-6">
      <div className="text-3xl flex-shrink-0 w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
        {launch.logo}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {launch.name}
          </h3>
          {launch.website && (
            <a href={launch.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1">{launch.tagline}</p>
        {launch.whyItMatters && (
          <p className="text-xs text-foreground/70 mt-1 line-clamp-1 italic">
            → {launch.whyItMatters}
          </p>
        )}
        <div className="flex gap-2 mt-1.5 flex-wrap">
          {launch.topics.map(t => (
            <Badge key={t} variant="secondary" className="text-xs py-0 px-1.5">
              {t}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 self-start">
        {launch.sourceUrl && (
          <a
            href={launch.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
          >
            <LinkIcon className="h-3 w-3" />
            Source
          </a>
        )}
      </div>
    </div>
  );
}

export default function Newsfeed() {
  const { language } = useLanguage();
  const [period, setPeriod] = useState<TimePeriod>('all');

  const filteredLaunches = useMemo(() => {
    const sorted = [...launches].sort((a, b) => b.launchDate.getTime() - a.launchDate.getTime());
    switch (period) {
      case 'today':
        return sorted.filter(l => isToday(l.launchDate));
      case 'week':
        return sorted.filter(l => isThisWeek(l.launchDate));
      case 'month':
        return sorted.filter(l => isThisMonth(l.launchDate));
      default:
        return sorted;
    }
  }, [period]);

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <section className="py-10 md:py-14 border-b border-border">
          <div className="container">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary uppercase tracking-wider">Curated</span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight leading-[1.1] mb-3">
                Curated Launches
              </h1>
              <p className="text-muted-foreground mb-4">
                Editorially selected AI-powered products and platforms in the UAE healthcare ecosystem.
              </p>
              <LastUpdated section="newsfeed" />
            </div>
          </div>
        </section>

        {/* Time Filter Tabs */}
        <section className="py-4 border-b border-border sticky top-16 bg-background z-10">
          <div className="container">
            <Tabs value={period} onValueChange={(v) => setPeriod(v as TimePeriod)}>
              <TabsList className="flex-wrap">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="month">This Month</TabsTrigger>
                <TabsTrigger value="all">All Time</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="container">
            <div className="grid lg:grid-cols-[1fr_300px] gap-8">
              {/* Product Feed */}
              <div className="border border-border rounded-lg overflow-hidden bg-card">
                {filteredLaunches.length > 0 ? (
                  filteredLaunches.map((launch) => (
                    <ProductCard key={launch.id} launch={launch} />
                  ))
                ) : (
                  <div className="text-center py-16">
                    <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No launches in this period yet.</p>
                  </div>
                )}
              </div>

              {/* Trending Resources Sidebar */}
              <aside className="hidden lg:block">
                <div className="sticky top-28">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wider">Trending Resources</h3>
                  </div>
                  <div className="space-y-3">
                    {resources.slice(0, 5).map((resource) => (
                      <Link
                        key={resource.id}
                        to={`/resources/${resource.id}`}
                        className="block p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors group"
                      >
                        <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors mb-1.5">
                          {resource.title[language]}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {resource.views} views
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link to="/resources">
                    <Button variant="ghost" size="sm" className="mt-3 w-full text-foreground/72 hover:text-foreground">
                      View all resources →
                    </Button>
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

