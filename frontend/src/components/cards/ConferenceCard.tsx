import { useLanguage } from '@/contexts/LanguageContext';
import { Conference } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConferenceCardProps {
  conference: Conference;
  className?: string;
}

// Monochrome badge styles — categories are differentiated by label text,
// not color (see docs/design-decisions/2026-05-palette-strategy.md).
const typeBadgeClass: Record<Conference['type'], string> = {
  'conference': 'bg-primary text-primary-foreground',
  'meetup':     'bg-muted text-foreground',
  'workshop':   'bg-muted text-muted-foreground',
  'demo-day':   'bg-foreground text-background',
};

export function ConferenceCard({ conference, className }: ConferenceCardProps) {
  const { language } = useLanguage();

  const formatDate = (dateStr: string, endDateStr?: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    
    if (endDateStr) {
      const endDate = new Date(endDateStr);
      return `${date.toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US', options)}`;
    }
    
    return date.toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US', options);
  };

  return (
    <div className={cn("card-lift border border-border p-5 hover:border-foreground transition-colors", className)}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-foreground leading-tight">
          {conference.name[language]}
        </h3>
        <Badge className={cn("shrink-0 capitalize rounded-none text-xs", typeBadgeClass[conference.type])}>
          {conference.type.replace('-', ' ')}
        </Badge>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(conference.date, conference.endDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{conference.location}</span>
        </div>
      </div>
      
      {conference.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {conference.description[language]}
        </p>
      )}

      <div className="flex flex-wrap gap-1 mb-4">
        {conference.topics.slice(0, 3).map((topic) => (
          <Badge key={topic} variant="outline" className="text-xs rounded-none">
            {topic}
          </Badge>
        ))}
      </div>

      {(conference.website || conference.registrationUrl) && (
        <div className="flex gap-2">
          {conference.registrationUrl ? (
            <Button size="sm" asChild className="flex-1 rounded-none">
              <a href={conference.registrationUrl} target="_blank" rel="noopener noreferrer">
                Register
                <ArrowRight className="w-3 h-3 ml-1" />
              </a>
            </Button>
          ) : conference.website && (
            <Button variant="outline" size="sm" asChild className="flex-1 rounded-none">
              <a href={conference.website} target="_blank" rel="noopener noreferrer">
                Website
                <ArrowRight className="w-3 h-3 ml-1" />
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
