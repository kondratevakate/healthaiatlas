'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { isThisMonth, isThisWeek, isToday } from 'date-fns';
import { TrendingUp, BookOpen, ExternalLink, Eye, LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LastUpdated } from '@/components/shared/LastUpdated';
import { useLanguage } from '@/contexts/LanguageContext';
import { launches, Launch } from '@/data/launches';
import { resources } from '@/data/resources';

type TimePeriod = 'today' | 'week' | 'month' | 'all';

function ProductCard({ launch }: { launch: Launch }) {
  return (
    <div className="group flex items-start gap-4 border-b border-border p-5 transition-colors hover:bg-muted/30 md:p-6">
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-3xl">
        {launch.logo}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
            {launch.name}
          </h3>
          {launch.website ? (
            <a
              href={launch.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </div>
        <p className="line-clamp-1 text-sm text-muted-foreground">{launch.tagline}</p>
        {launch.whyItMatters ? (
          <p className="mt-1 line-clamp-1 text-xs italic text-foreground/70">
            → {launch.whyItMatters}
          </p>
        ) : null}
        <div className="mt-1.5 flex flex-wrap gap-2">
          {launch.topics.map((topic) => (
            <Badge key={topic} variant="secondary" className="px-1.5 py-0 text-xs">
              {topic}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2 self-start">
        {launch.sourceUrl ? (
          <a
            href={launch.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
          >
            <LinkIcon className="h-3 w-3" />
            Source
          </a>
        ) : null}
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
        return sorted.filter((launch) => isToday(launch.launchDate));
      case 'week':
        return sorted.filter((launch) => isThisWeek(launch.launchDate));
      case 'month':
        return sorted.filter((launch) => isThisMonth(launch.launchDate));
      default:
        return sorted;
    }
  }, [period]);

  return (
    <div className="min-h-screen">
      <section className="border-b border-border py-10 md:py-14">
        <div className="container">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium uppercase tracking-wider text-primary">
                Curated
              </span>
            </div>
            <h1 className="mb-3 font-serif text-3xl font-bold tracking-tight leading-[1.1] md:text-4xl">
              Curated Launches
            </h1>
            <p className="mb-4 text-muted-foreground">
              Editorially selected AI-powered products and platforms in the UAE healthcare ecosystem.
            </p>
            <LastUpdated section="newsfeed" />
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-10 border-b border-border bg-background py-4">
        <div className="container">
          <Tabs value={period} onValueChange={(value) => setPeriod(value as TimePeriod)}>
            <TabsList className="flex-wrap">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              {filteredLaunches.length > 0 ? (
                filteredLaunches.map((launch) => <ProductCard key={launch.id} launch={launch} />)
              ) : (
                <div className="py-16 text-center">
                  <TrendingUp className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-muted-foreground">No launches in this period yet.</p>
                </div>
              )}
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <div className="mb-4 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider">
                    Trending Resources
                  </h3>
                </div>
                <div className="space-y-3">
                  {resources.slice(0, 5).map((resource) => (
                    <Link
                      key={resource.id}
                      href={`/resources/${resource.id}`}
                      className="group block rounded-lg border border-border p-3 transition-colors hover:border-primary/50 hover:bg-muted/30"
                    >
                      <h4 className="mb-1.5 line-clamp-2 text-sm font-medium transition-colors group-hover:text-primary">
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
                <Button asChild variant="ghost" size="sm" className="mt-3 w-full text-foreground/72 hover:text-foreground">
                  <Link href="/resources">View all resources →</Link>
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
