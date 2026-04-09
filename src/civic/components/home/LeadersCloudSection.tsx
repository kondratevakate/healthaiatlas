import { useLanguage } from '@/civic/contexts/LanguageContext';
import { Button } from '@/civic/components/ui/button';
import { ArrowRight, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { mentors } from '@/civic/data/mentors';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/civic/components/ui/tooltip';

// Generate initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

// Color based on category
const getCategoryColor = (category?: string) => {
  switch (category) {
    case 'clinical': return 'bg-gray-200 border-gray-300';
    case 'investment': return 'bg-gray-300 border-gray-400';
    case 'policy': return 'bg-gray-100 border-gray-200';
    case 'tech': return 'bg-gray-200 border-gray-300';
    case 'research': return 'bg-gray-100 border-gray-200';
    default: return 'bg-muted border-border';
  }
};

// Size based on influence
const getSizeClass = (influence?: string) => {
  switch (influence) {
    case 'high': return 'w-16 h-16 text-lg';
    case 'medium': return 'w-12 h-12 text-sm';
    default: return 'w-10 h-10 text-xs';
  }
};

export function LeadersCloudSection() {
  const { t, language } = useLanguage();

  return (
    <section className="py-20">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="section-marker" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t('leaders.badge')}
            </span>
          </div>
          
          <h2 className="heading-display text-3xl md:text-4xl mb-4">
            {t('leaders.title')}
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('leaders.subtitle')}
          </p>
        </div>

        {/* Leaders Cloud */}
        <TooltipProvider>
          <div className="relative h-[400px] md:h-[500px] max-w-4xl mx-auto mb-12">
            {mentors.map((leader, index) => {
              const position = leader.cloudPosition || {
                x: 20 + (index % 4) * 20 + Math.random() * 10,
                y: 15 + Math.floor(index / 4) * 25 + Math.random() * 10
              };
              
              return (
                <Tooltip key={leader.id}>
                  <TooltipTrigger asChild>
                    <motion.a
                      href={leader.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`absolute cursor-pointer rounded-full flex items-center justify-center font-medium border-2 transition-all hover:border-primary hover:scale-110 ${getCategoryColor(leader.category)} ${getSizeClass(leader.influence)}`}
                      style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        y: [0, -6, 0],
                      }}
                      transition={{
                        opacity: { delay: index * 0.08, duration: 0.3 },
                        scale: { delay: index * 0.08, duration: 0.3 },
                        y: { 
                          delay: index * 0.08 + 0.5,
                          duration: 3 + Math.random() * 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }
                      }}
                      whileHover={{ 
                        y: 0,
                        transition: { duration: 0.2 }
                      }}
                    >
                      {leader.avatarUrl ? (
                        <img 
                          src={leader.avatarUrl} 
                          alt={leader.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-muted-foreground">
                          {getInitials(leader.name)}
                        </span>
                      )}
                    </motion.a>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-medium">{leader.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {leader.expertise.slice(0, 2).join(' â€¢ ')}
                      </p>
                      {leader.openForMentorship && (
                        <p className="text-xs text-primary font-medium">
                          {t('leaders.openForMentorship')}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
            
            {/* Central focal point */}
            <motion.div
              className="absolute left-1/2 top-1/2 w-4 h-4 rounded-full bg-primary"
              style={{ transform: 'translate(-50%, -50%)' }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </TooltipProvider>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="outline" className="group">
            {t('leaders.findMentor')}
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button variant="outline" className="group">
            <Link2 className="h-4 w-4 mr-2" />
            {t('leaders.becomeMentor')}
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
}

