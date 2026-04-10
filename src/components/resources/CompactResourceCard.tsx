import Image from 'next/image';
import Link from "next/link";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Resource, getCategoryLabel } from '@/data/resources';
import { formatResourceDate } from '@/lib/format';

interface CompactResourceCardProps {
  resource: Resource;
}

export function CompactResourceCard({ resource }: CompactResourceCardProps) {
  const { language } = useLanguage();

  return (
    <Link href={`/resources/${resource.id}`}>
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
            <span>{formatResourceDate(resource.date, language)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
