import { Layout } from '@/components/layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { players } from '@/data/players';
import { claims } from '@/data/claims';
import { domains } from '@/data/domains';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MapPin, Users, Calendar, ExternalLink, Building2, Rocket, FlaskConical, Landmark, Briefcase, ShieldCheck, Network, Database } from 'lucide-react';
import { SystemDiagram } from '@/components/home/SystemDiagram';
import { SystemMapOverview, type DomainPin } from '@/components/home/SystemMapOverview';
import { HealthcareAIMarketComparison } from '@/components/home/HealthcareAIMarketComparison';
import { MedicalTourismHub } from '@/components/medical-tourism';
import { ProcessMiningHub } from '@/components/process-mining';
import { OncologyHub } from '@/components/oncology';
import { AiLifeSciencesHub } from '@/components/ai-life-sciences';
import { BiosecurityHub } from '@/components/biosecurity';
import { SuggestActions } from '@/components/shared/SuggestActions';
import { PageHeader } from '@/components/shared/PageHeader';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ClaimCard } from '@/components/claims';
import { SUGGEST_ENTRY_URL, HUB_DOMAIN_IDS } from '@/data/constants';
import { Player } from '@/types';

const typeIcons: Record<string, React.ElementType> = {
  startup: Rocket,
  hospital: Building2,
  government: Landmark,
  research: FlaskConical,
  enterprise: Briefcase,
};

// Monochrome scale, all dark enough for white text to pass WCAG 2.1 AA (4.5:1).
// Lightness range 20–43% — anything ≥46% with white text fails AA.
const typeColors: Record<string, string> = {
  startup: 'bg-[hsl(0,0%,20%)] text-white group-hover:bg-primary',
  hospital: 'bg-[hsl(0,0%,28%)] text-white group-hover:bg-primary',
  government: 'bg-[hsl(0,0%,33%)] text-white group-hover:bg-primary',
  research: 'bg-[hsl(0,0%,38%)] text-white group-hover:bg-primary',
  enterprise: 'bg-[hsl(0,0%,43%)] text-white group-hover:bg-primary',
};

const roleColors: Record<string, string> = {
  purpose: 'bg-secondary text-foreground border-border',
  impacts: 'bg-secondary text-foreground border-border',
  activities: 'bg-secondary text-foreground border-border',
  components: 'bg-secondary text-foreground border-border',
};

// Clickable entry points overlaid on the System Map. Angles measured from top,
// clockwise, chosen to sit on the ACTIVITIES band near a semantic neighbour
// (oncology↔imaging, ai-life-sciences↔drug-discovery, process-mining↔records,
// medical-tourism↔partnerships).
const DOMAIN_PINS: DomainPin[] = [
  { id: 'oncology',         label: 'Oncology',          angle: 18 },
  { id: 'ai-life-sciences', label: 'AI Life Sciences',  angle: 54 },
  { id: 'process-mining',   label: 'Process Mining',    angle: 270 },
  { id: 'medical-tourism',  label: 'Medical Tourism',   angle: 342 },
];

const Directory = () => {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeDomainId = searchParams.get('domain') ?? 'overview';
  const setActiveDomainId = (id: string) => {
    if (id === 'overview') setSearchParams({}, { replace: false });
    else setSearchParams({ domain: id }, { replace: false });
  };
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const activeDomain = domains.find(d => d.id === activeDomainId);
  const isOverview = activeDomainId === 'overview';

  const filteredPlayers = isOverview
    ? players
    : players.filter(p => activeDomain?.playerIds.includes(p.id));

  const getPlayerClaims = (playerId: string) =>
    claims.filter(c => c.subject_id === playerId);

  const hasCustomHub = HUB_DOMAIN_IDS.includes(activeDomainId as (typeof HUB_DOMAIN_IDS)[number]);

  // Per-domain diagram component (for non-medical-tourism domains)
  const renderDomainDiagram = () => (
    <SystemDiagram
      domains={domains}
      activeDomainId={activeDomainId}
      onDomainClick={(domainId) => setActiveDomainId(domainId)}
    />
  );

  return (
    <Layout>
      <div className="container py-12 md:py-16">
        {/* On a domain page the back control sits on the title row rather than
            on its own line above it — that line cost ~54px above the data. */}
        <div className="flex flex-col-reverse items-start gap-2 sm:flex-row sm:justify-between sm:gap-4">
          <PageHeader
            title={isOverview ? t('nav.domains') : activeDomain?.name[language]}
            subtitle={isOverview ? t('entry.directory.desc') : activeDomain?.subtitle[language]}
            className={isOverview ? undefined : 'mb-6'}
          />
          {!isOverview && (
            <button
              type="button"
              onClick={() => setActiveDomainId('overview')}
              className="shrink-0 self-start mb-2 sm:mb-0 sm:mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group border border-border bg-background px-3 py-1.5 hover:border-foreground/40"
            >
              <span className="text-base transition-transform group-hover:-translate-x-0.5">←</span>
              <span className="font-medium">{t('action.back')} {t('nav.domains')}</span>
            </button>
          )}
        </div>

        {/* Domain entry chips — primary navigation, sits right under PageHeader */}
        {isOverview && (
          <div className="mb-8 flex flex-wrap gap-2">
            {domains
              .filter((d) => d.id !== 'overview')
              .map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setActiveDomainId(d.id)}
                  className="group inline-flex items-baseline gap-2 border border-border bg-background hover:border-primary hover:bg-primary/5 px-3 py-2 transition-all"
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {d.name[language]}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    →
                  </span>
                </button>
              ))}
          </div>
        )}

        {/* Overview: market scale first, then system map.
            The market chart anchors expectations — healthcare AI revenue sits
            two-to-four orders of magnitude below frontier AI / GPU compute. */}
        {isOverview && (
          <section className="mb-16">
            <div className="max-w-2xl mb-10">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                Market scale
              </p>
              <div className="h-0.5 w-12 bg-primary mb-4" />
              <h2 className="heading-xl mb-3">
                Healthcare AI market comparison
              </h2>
              <p className="text-muted-foreground">
                Annualized revenue across AI sectors, plotted as planets on a log axis.
                Healthcare leaders are in the tens-to-low-hundreds of millions; coding,
                frontier, and GPU compute are 1–3 orders of magnitude larger.
              </p>
            </div>
            <HealthcareAIMarketComparison />
          </section>
        )}

        {/* Overview: cross-context system map with clickable domain pins */}
        {isOverview && (
          <section className="mb-16">
            <div className="max-w-2xl mb-10">
              <div className="flex items-center gap-2 mb-2">
                <Network className="h-5 w-5 text-primary" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  System Map
                </p>
              </div>
              <div className="h-0.5 w-12 bg-primary mb-4" />
              <h2 className="heading-xl mb-3">
                Healthcare AI as a system, not a list
              </h2>
              <p className="text-muted-foreground">
                A four-layer view of the global healthcare AI ecosystem — purpose, impacts,
                activities, components. Methodologically grounded in the{' '}
                <a
                  href="https://www.rethinkingsystems.design/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-0.5"
                >
                  ReThinking Systems
                  <ExternalLink className="w-3 h-3" />
                </a>{' '}
                tradition from IIT Institute of Design — actors, affordances, and feedback
                loops, mapped with evidence rather than vibes. Coral pins are research
                domains: click to open the dedicated hub.
              </p>
            </div>
            <SystemMapOverview
              domainPins={DOMAIN_PINS}
              onDomainClick={(id) => setActiveDomainId(id)}
            />
          </section>
        )}

        {/* Per-domain diagram for non-hub, non-overview tabs (placeholder domains) */}
        {!isOverview && !hasCustomHub && (
          <div className="mb-16 flex justify-center">
            {renderDomainDiagram()}
          </div>
        )}

        {activeDomainId === 'medical-tourism' && (
          <div className="mb-16"><MedicalTourismHub /></div>
        )}
        {activeDomainId === 'process-mining' && (
          <div className="mb-16"><ProcessMiningHub /></div>
        )}
        {activeDomainId === 'oncology' && (
          <div className="mb-16"><OncologyHub /></div>
        )}
        {activeDomainId === 'ai-life-sciences' && (
          <div className="mb-16"><AiLifeSciencesHub /></div>
        )}
        {activeDomainId === 'biosecurity' && (
          <div className="mb-16"><BiosecurityHub /></div>
        )}

        {/* Players Grid — hidden on overview (replaced by System Map) and on custom hub tabs */}
        {!hasCustomHub && !isOverview && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredPlayers.map((player) => {
            const TypeIcon = typeIcons[player.type] || Building2;
            const playerClaimCount = getPlayerClaims(player.id).length;
            return (
              <div 
                key={player.id} 
                className="group border border-border bg-background p-6 hover:shadow-lg hover:border-primary transition-all cursor-pointer"
                onClick={() => setSelectedPlayer(player)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("w-10 h-10 flex items-center justify-center shrink-0 transition-colors", typeColors[player.type])}>
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    {playerClaimCount > 0 && (
                      <Badge variant="outline" className="rounded-none text-xs gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        {playerClaimCount}
                      </Badge>
                    )}
                    <Badge 
                      variant="outline" 
                      className={cn("rounded-none text-xs", roleColors[player.systemRole])}
                    >
                      {t(`role.${player.systemRole}`)}
                    </Badge>
                  </div>
                </div>
                
                <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                  {player.name[language]}
                </h3>
                
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {player.description[language]}
                </p>

                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{player.city}, {player.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>{language === 'en' ? 'Founded' : 'تأسست'} {player.founded}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 shrink-0" />
                    <span>{player.employees}</span>
                  </div>
                </div>

                {player.aiAreas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {player.aiAreas.slice(0, 3).map((area) => (
                      <Badge key={area} variant="outline" className="text-xs rounded-none">
                        {area}
                      </Badge>
                    ))}
                    {player.aiAreas.length > 3 && (
                      <Badge variant="outline" className="text-xs rounded-none">
                        +{player.aiAreas.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {player.website && (
                  <a
                    href={player.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4" />
                    {language === 'en' ? 'Visit Website' : 'زيارة الموقع'}
                  </a>
                )}
              </div>
            );
          })}
        </div>
        )}

        {/* Empty state for domain tabs */}
        {!isOverview && !hasCustomHub && filteredPlayers.length === 0 && (
          <div className="border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground mb-2">
              {language === 'en' ? 'No organizations mapped to this domain yet.' : 'لم يتم ربط أي منظمات بهذا المجال بعد.'}
            </p>
            <a
              href={SUGGEST_ENTRY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline font-medium"
            >
              {language === 'en' ? 'Suggest an organization →' : 'اقترح منظمة →'}
            </a>
          </div>
        )}

        {/* Provenance footer — every player / claim above is held in the
            Zero-Trust database (db/atlas.sqlite). Frontend TS data is
            generated from it; the database is canonical. Same footer appears under Founders → Context. */}
        <div className="mt-16 border border-border/60 bg-secondary/30 p-5">
          <div className="flex items-start gap-3 max-w-3xl">
            <Database className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1">
                Primary sources
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'en'
                  ? 'Every domain and player row is held in a Zero-Trust database — each entry carries a primary src URL on the issuer\'s domain plus a verifiedAt stamp. The frontend data is regenerated from the base; the base is canonical.'
                  : 'كل صف للمجالات واللاعبين محفوظ في قاعدة بيانات Zero-Trust — كل إدخال يحمل عنوان URL أساسي على نطاق الجهة المُصدِرة مع طابع verifiedAt. بيانات الواجهة الأمامية يتم توليدها من القاعدة؛ القاعدة هي المصدر الرسمي.'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <SuggestActions />
        </div>
      </div>

      {/* Entity Detail Sheet */}
      <Sheet open={!!selectedPlayer} onOpenChange={(open) => !open && setSelectedPlayer(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedPlayer && (
            <EntityDetail 
              player={selectedPlayer} 
              claims={getPlayerClaims(selectedPlayer.id)} 
              language={language} 
              t={t}
            />
          )}
        </SheetContent>
      </Sheet>
    </Layout>
  );
};

function EntityDetail({ player, claims: playerClaims, language, t }: {
  player: Player;
  claims: typeof claims;
  language: string;
  t: (key: string) => string;
}) {
  const TypeIcon = typeIcons[player.type] || Building2;

  return (
    <>
      <SheetHeader className="text-left mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className={cn("w-10 h-10 flex items-center justify-center shrink-0", typeColors[player.type])}>
            <TypeIcon className="w-5 h-5" />
          </div>
          <Badge variant="outline" className="rounded-none text-xs">
            {t(`type.${player.type}`)}
          </Badge>
        </div>
        <SheetTitle className="text-xl font-semibold">{player.name[language]}</SheetTitle>
        <SheetDescription className="text-sm text-muted-foreground">
          {player.description[language]}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-2 text-sm text-muted-foreground mb-6">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>{player.city}, {player.country}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>{language === 'en' ? 'Founded' : 'تأسست'} {player.founded}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 shrink-0" />
          <span>{player.employees}</span>
        </div>
        {player.website && (
          <a
            href={player.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            <ExternalLink className="h-4 w-4" />
            {language === 'en' ? 'Visit Website' : 'زيارة الموقع'}
          </a>
        )}
      </div>

      {player.aiAreas.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
            AI Areas
          </h4>
          <div className="flex flex-wrap gap-2">
            {player.aiAreas.map((area) => (
              <Badge key={area} variant="outline" className="text-xs rounded-none">
                {area}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border my-6" />

      <div>
        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
          <ShieldCheck className="w-4 h-4" />
          {language === 'en' ? 'Verified Claims' : 'ادعاءات موثقة'} ({playerClaims.length})
        </h4>

        {playerClaims.length > 0 ? (
          <div className="space-y-3">
            {playerClaims.map(claim => (
              <ClaimCard key={claim.claim_id} claim={claim} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {language === 'en' ? 'No verified claims yet.' : 'لا توجد ادعاءات موثقة بعد.'}
            </p>
            <a
              href={SUGGEST_ENTRY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline font-medium"
            >
              {language === 'en' ? 'Suggest a claim →' : 'اقترح ادعاء →'}
            </a>
          </div>
        )}
      </div>
    </>
  );
}

export default Directory;
