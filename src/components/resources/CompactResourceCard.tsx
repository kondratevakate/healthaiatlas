import Image from 'next/image';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Badge } from '@/civic/components/ui/badge';
import { Card, CardContent } from '@/civic/components/ui/card';
import { useLanguage } from '@/civic/contexts/LanguageContext';
import { Resource, getCategoryLabel } from '@/civic/data/resources';

interface CompactResourceCardProps {
  resource: Resource;
}

export function CompactResourceCard({ resource }: CompactResourceCardProps) {
  const { language } = useLanguage();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'MMM d, yyyy');
  };

  return (
    <Link to={`/resources/${resource.id}`}>
      <Card className="group h-full overflow-hidden transition-colors hover:border-primary/50">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <Image
            src={resource.thumbnail}
            alt={resource.title[language]}
            fill
            sizes="(min-width: 1280px) 18vw, (min-width: 768px) 32vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <CardContent className="p-3">
          <h4 className="mb-2 line-clamp-2 text-sm font-medium transition-colors group-hover:text-primary">
            {resource.title[language]}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="py-0 text-xs">
              {getCategoryLabel(resource.category, language)}
            </Badge>
            <span>{formatDate(resource.date)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
