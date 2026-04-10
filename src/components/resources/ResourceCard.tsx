import Image from 'next/image';
import Link from "next/link";
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Resource, getCategoryLabel, getTagLabel } from '@/data/resources';
import { cn } from '@/lib/utils';
import { formatResourceDate } from '@/lib/format';

interface ResourceCardProps {
  resource: Resource;
  featured?: boolean;
}

export function ResourceCard({ resource, featured = false }: ResourceCardProps) {
  const { language, t } = useLanguage();

  return (
    <Link href={`/resources/${resource.id}`}>
      <Card
        className={cn(
          'group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
          featured && 'md:flex md:flex-row',
        )}
      >
        <div
          className={cn(
            'relative overflow-hidden bg-muted aspect-video',
            featured && 'md:w-1/2 md:aspect-auto',
          )}
        >
          <Image
            src={resource.thumbnail}
            alt={resource.title[language]}
            fill
            sizes={
              featured
                ? '(min-width: 768px) 50vw, 100vw'
                : '(min-width: 1280px) 22vw, (min-width: 768px) 45vw, 100vw'
            }
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <Badge className="absolute top-4 left-4 bg-background/90 text-foreground hover:bg-background rtl:left-auto rtl:right-4">
            {getCategoryLabel(resource.category, language)}
          </Badge>

          {resource.featured ? (
            <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground rtl:right-auto rtl:left-4">
              {t('featured.new')}
            </Badge>
          ) : null}
        </div>

        <CardContent
          className={cn('p-6', featured && 'md:flex md:w-1/2 md:flex-col md:justify-center')}
        >
          <h3
            className={cn(
              'mb-2 font-bold transition-colors group-hover:text-primary',
              featured ? 'heading-md' : 'text-lg',
            )}
          >
            {resource.title[language]}
          </h3>

          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {resource.description[language]}
          </p>

          <div className="mb-4 flex flex-wrap gap-2">
            {resource.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {getTagLabel(tag, language)}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {formatResourceDate(resource.date, language)}
            </span>
            <span className="flex items-center gap-1 font-medium text-primary transition-all group-hover:gap-2">
              {t('library.viewMore')}
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
