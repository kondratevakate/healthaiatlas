import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { UserPersona } from '@/types';
import { User, Stethoscope, Building2, Rocket, Lightbulb, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPersonaById } from '@/data/personas';

interface PersonaCardProps {
  persona: UserPersona;
  className?: string;
}

const personaConfig: Record<UserPersona, {
  icon: React.ElementType;
  colorClass: string;
}> = {
  patient: { icon: User, colorClass: 'hover:border-pink group-hover:text-pink' },
  doctor: { icon: Stethoscope, colorClass: 'hover:border-primary group-hover:text-primary' },
  business: { icon: Building2, colorClass: 'hover:border-yellow group-hover:text-yellow' },
  startup: { icon: Rocket, colorClass: 'hover:border-orange group-hover:text-orange' },
  leader: { icon: Lightbulb, colorClass: 'hover:border-blue group-hover:text-blue' },
};

export function PersonaCard({ persona, className }: PersonaCardProps) {
  const { t, isRTL, language } = useLanguage();
  const config = personaConfig[persona];
  const data = getPersonaById(persona);
  const Icon = config.icon;
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  if (!data) return null;

  return (
    <Link
      to={`/${persona}`}
      className={cn(
        "group flex flex-col p-6 border border-border transition-all duration-300",
        config.colorClass,
        className
      )}
    >
      <Icon className="w-8 h-8 text-muted-foreground group-hover:text-foreground mb-4 transition-colors" />

      <h3 className="font-semibold text-foreground mb-2">
        {data.title[language]}
      </h3>

      <p className="text-sm text-muted-foreground mb-4 flex-1">
        {data.cardDescription[language]}
      </p>

      <div className="flex items-center text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        <span>{t('action.explore')}</span>
        <ArrowIcon className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
