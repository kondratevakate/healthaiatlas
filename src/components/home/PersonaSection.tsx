import { useLanguage } from '@/contexts/LanguageContext';
import { PersonaCard } from '@/components/home/PersonaCard';
import { UserPersona } from '@/types';

const personas: UserPersona[] = ['patient', 'doctor', 'business', 'startup', 'leader'];

export function PersonaSection() {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-24 border-t border-border">
      <div className="container">
        <div className="mb-12">
          <h2 className="heading-serif section-marker mb-4">{t('persona.sectionTitle')}</h2>
          <p className="text-body text-muted-foreground max-w-2xl">
            {t('persona.sectionSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {personas.map((persona) => (
            <PersonaCard key={persona} persona={persona} />
          ))}
        </div>
      </div>
    </section>
  );
}

