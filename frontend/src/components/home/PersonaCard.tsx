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

// No per-persona color classes — categories differentiated by icon only.
// Hover uses a unified semantic border; icon already applies
// group-hover:text-foreground inline (see below).
// See docs/design-decisions/2026-05-palette-strategy.md.
const personaConfig: Record<UserPersona, { icon: React.ElementType }> = {
  patient:  { icon: User },
  doctor:   { icon: Stethoscope },
  business: { icon: Building2 },
  startup:  { icon: Rocket },
  leader:   { icon: Lightbulb },
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
        "group flex flex-col p-6 border border-border hover:border-foreground/50 transition-all duration-300",
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
