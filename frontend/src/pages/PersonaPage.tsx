import { Link, useLocation, Navigate } from 'react-router-dom';
import { ArrowRight, Map, Users, Lightbulb, Target } from 'lucide-react';

import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/shared/PageHeader';
import { EvidenceLabel } from '@/components/research/EvidenceLabel';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPersonaById } from '@/data/personas';
import { getPlayerById } from '@/data/players';
import { domains } from '@/data/domains';
import { UserPersona } from '@/types';

const VALID_IDS: UserPersona[] = ['patient', 'doctor', 'business', 'startup', 'leader'];

function isValidPersonaId(value: string): value is UserPersona {
  return (VALID_IDS as string[]).includes(value);
}

export default function PersonaPage() {
  const { language } = useLanguage();
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\//, '').toLowerCase();

  if (!isValidPersonaId(slug)) {
    return <Navigate to="/" replace />;
  }

  const persona = getPersonaById(slug);
  if (!persona) {
    return <Navigate to="/" replace />;
  }

  const relevantDomains = persona.relevantDomainIds
    .map((domainId) => domains.find((d) => d.id === domainId))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  const relevantPlayers = persona.relevantPlayerIds
    .map((playerId) => getPlayerById(playerId))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <Layout>
      <div className="container py-12 md:py-16 [&>*]:max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group border border-border bg-background px-3 py-1.5 hover:border-foreground/40"
        >
          <span className="text-base transition-transform group-hover:-translate-x-0.5">←</span>
          <span className="font-medium">{language === 'en' ? 'Back to Home' : 'العودة إلى الرئيسية'}</span>
        </Link>

        <PageHeader
          eyebrow={language === 'en' ? 'Persona' : 'شخصية'}
          title={persona.title[language]}
          subtitle={persona.archetype[language]}
        />

        <div className="mb-4">
          <EvidenceLabel level={persona.evidenceLevel} />
        </div>

        <section className="mb-12">
          <p className="text-body text-foreground">{persona.context[language]}</p>
        </section>

        <section className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              <Target className="w-4 h-4" />
              {language === 'en' ? 'Pain points' : 'نقاط الألم'}
            </h2>
            <ul className="space-y-2 text-body">
              {persona.pains[language].map((pain, i) => (
                <li key={i} className="text-muted-foreground">
                  — {pain}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              <Lightbulb className="w-4 h-4" />
              {language === 'en' ? 'Goals' : 'الأهداف'}
            </h2>
            <ul className="space-y-2 text-body">
              {persona.goals[language].map((goal, i) => (
                <li key={i} className="text-muted-foreground">
                  — {goal}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mb-12 border border-border p-6 bg-secondary/30">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            <Map className="w-4 h-4" />
            {language === 'en' ? 'A path through the site' : 'مسار خلال الموقع'}
          </h2>
          <ol className="space-y-3">
            {persona.journey[language].map((step, i) => (
              <li key={i} className="flex gap-3 text-body">
                <span className="font-mono text-xs text-muted-foreground mt-1 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {relevantDomains.length > 0 && (
          <section className="mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              {language === 'en' ? 'Start with these hubs' : 'ابدأ من هذه المراكز'}
            </h2>
            <div className="flex flex-wrap gap-2">
              {relevantDomains.map((d) => (
                <Link
                  key={d.id}
                  to={`/directory?domain=${d.id}`}
                  className="inline-flex items-center gap-2 border border-border bg-background hover:border-primary hover:bg-primary/5 px-3 py-2 transition-all"
                >
                  <span className="text-sm font-medium text-foreground">{d.name[language]}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {relevantPlayers.length > 0 && (
          <section className="mb-12">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              <Users className="w-4 h-4" />
              {language === 'en' ? 'Example actors' : 'لاعبون نموذجيون'}
            </h2>
            <ul className="space-y-3">
              {relevantPlayers.map((p) => (
                <li key={p.id} className="border-l-2 border-border pl-4">
                  <div className="font-semibold text-foreground">{p.name[language]}</div>
                  <p className="text-sm text-muted-foreground">{p.description[language]}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-16 pt-8 border-t border-border">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
            {language === 'en' ? 'Composite — not a real individual' : 'نموذج مركّب — ليس فرداً حقيقياً'}
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl">{persona.basis[language]}</p>
        </section>
      </div>
    </Layout>
  );
}
