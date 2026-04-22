import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Resource, getCategoryLabel } from '@/data/resources';
import { format } from 'date-fns';

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
      <Card className="group overflow-hidden hover:border-primary/50 transition-colors h-full">
        {/* Compact thumbnail */}
        <div className="aspect-[16/10] bg-muted overflow-hidden">
          <img
            src={resource.thumbnail}
            alt={resource.title[language]}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <CardContent className="p-3">
          <h4 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {resource.title[language]}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs py-0">
              {getCategoryLabel(resource.category, language)}
            </Badge>
            <span>{formatDate(resource.date)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
