import { useLanguage } from '@/civic/contexts/LanguageContext';
import { ThoughtLeaderProfile } from '@/civic/types';
import { Badge } from '@/civic/components/ui/badge';
import { Button } from '@/civic/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/civic/components/ui/avatar';
import { Link2, MessageCircle } from 'lucide-react';
import { cn } from '@/civic/lib/utils';

interface MentorCardProps {
  mentor: ThoughtLeaderProfile;
  className?: string;
}

export function MentorCard({ mentor, className }: MentorCardProps) {
  const { language, t } = useLanguage();

  const initials = mentor.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn("border border-border p-5 hover:border-foreground transition-colors", className)}>
      <div className="flex items-start gap-4 mb-4">
        <Avatar className="w-14 h-14 rounded-none">
          <AvatarImage 
            src={mentor.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(mentor.name)}&backgroundColor=ff6b35`} 
            alt={mentor.name} 
          />
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold rounded-none">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate mb-1">
            {mentor.name}
          </h3>
          {mentor.openForMentorship && (
            <Badge className="bg-primary text-primary-foreground rounded-none text-xs">
              {t('mentor.openForMentorship')}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-4">
        {mentor.expertise.map((exp) => (
          <Badge key={exp} variant="outline" className="text-xs rounded-none">
            {exp}
          </Badge>
        ))}
      </div>

      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
        {mentor.bio[language]}
      </p>

      <div className="flex gap-2">
        {mentor.linkedinUrl && (
          <Button variant="outline" size="sm" asChild className="flex-1 rounded-none">
            <a href={mentor.linkedinUrl} target="_blank" rel="noopener noreferrer">
              <Link2 className="w-3 h-3 mr-1" />
              LinkedIn
            </a>
          </Button>
        )}
        {mentor.openForMentorship && (
          <Button size="sm" className="flex-1 rounded-none">
            <MessageCircle className="w-3 h-3 mr-1" />
            {t('mentor.contact')}
          </Button>
        )}
      </div>
    </div>
  );
}

