import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { UserPersona } from '@/types';
import { User, Stethoscope, Building2, Rocket, Lightbulb, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonaCardProps {
  persona: UserPersona;
  className?: string;
}

const personaConfig: Record<UserPersona, {
  icon: React.ElementType;
  colorClass: string;
  path: string;
}> = {
  patient: {
    icon: User,
    colorClass: 'hover:border-pink group-hover:text-pink',
    path: '/patient'
  },
  doctor: {
    icon: Stethoscope,
    colorClass: 'hover:border-primary group-hover:text-primary',
    path: '/doctor'
  },
  business: {
    icon: Building2,
    colorClass: 'hover:border-yellow group-hover:text-yellow',
    path: '/business'
  },
  startup: {
    icon: Rocket,
    colorClass: 'hover:border-orange group-hover:text-orange',
    path: '/startup'
  },
  leader: {
    icon: Lightbulb,
    colorClass: 'hover:border-blue group-hover:text-blue',
    path: '/leader'
  }
};

export function PersonaCard({ persona, className }: PersonaCardProps) {
  const { t, isRTL } = useLanguage();
  const config = personaConfig[persona];
  const Icon = config.icon;
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <Link
      to={config.path}
      className={cn(
        "group flex flex-col p-6 border border-border transition-all duration-300",
        config.colorClass,
        className
      )}
    >
      <Icon className="w-8 h-8 text-muted-foreground group-hover:text-foreground mb-4 transition-colors" />
      
      <h3 className="font-semibold text-foreground mb-2">
        {t(`persona.${persona}.title`)}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-4 flex-1">
        {t(`persona.${persona}.description`)}
      </p>

      <div className="flex items-center text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        <span>{t('action.explore')}</span>
        <ArrowIcon className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
