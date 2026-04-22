import { useLanguage } from '@/contexts/LanguageContext';
import { Resource, getCategoryLabel, getTagLabel } from '@/data/resources';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  featured?: boolean;
}

export function ResourceCard({ resource, featured = false }: ResourceCardProps) {
  const { language, t } = useLanguage();

  return (
    <Link to={`/resources/${resource.id}`}>
      <Card className={`group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        featured ? 'md:flex md:flex-row' : ''
      }`}>
        {/* Thumbnail */}
        <div className={`relative bg-muted overflow-hidden ${
          featured ? 'md:w-1/2 aspect-video md:aspect-auto' : 'aspect-video'
        }`}>
          <img
            src={resource.thumbnail}
            alt={resource.title[language]}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Category Badge */}
          <Badge className="absolute top-4 left-4 rtl:left-auto rtl:right-4 bg-background/90 text-foreground hover:bg-background">
            {getCategoryLabel(resource.category, language)}
          </Badge>

          {/* Featured Badge */}
          {resource.featured && (
            <Badge className="absolute top-4 right-4 rtl:right-auto rtl:left-4 bg-accent text-accent-foreground">
              {t('featured.new')}
            </Badge>
          )}
        </div>

        {/* Content */}
        <CardContent className={`p-6 ${featured ? 'md:w-1/2 md:flex md:flex-col md:justify-center' : ''}`}>
          <h3 className={`font-bold mb-2 group-hover:text-primary transition-colors ${
            featured ? 'heading-md' : 'text-lg'
          }`}>
            {resource.title[language]}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {resource.description[language]}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {resource.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {getTagLabel(tag, language)}
              </Badge>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{new Date(resource.date).toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US')}</span>
            <span className="flex items-center gap-1 text-primary font-medium group-hover:gap-2 transition-all">
              {t('library.viewMore')}
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
