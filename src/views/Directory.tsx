'use client';

import { useEffect, useState, type ElementType } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Building2,
  Briefcase,
  Calendar,
  ExternalLink,
  FlaskConical,
  Landmark,
  MapPin,
  Plus,
  Rocket,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { sections, type DirectorySection as MaterialSection } from '@/config/sections';
import { normalizeDomainId } from '@/lib/directory';
import { EmbeddedMapFrame } from '@/components/EmbeddedMapFrame';
import { ClaimCard } from '@/components/claims';
import { SystemDiagram } from '@/components/home/SystemDiagram';
import { CorridorMap } from '@/components/research/CorridorMap';
import { LastUpdated } from '@/components/shared/LastUpdated';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { claims } from '@/data/claims';
import { SUGGEST_ENTRY_URL } from '@/data/constants';
import { domains } from '@/data/domains';
import { players } from '@/data/players';
import { cn } from '@/lib/utils';
import { Player } from '@/types';

type DomainMaterialId = 'oncology' | 'process-mining' | 'medical-tourism';

const typeIcons: Record<string, ElementType> = {
  startup: Rocket,
  hospital: Building2,
  government: Landmark,
  research: FlaskConical,
  enterprise: Briefcase,
};

const typeColors: Record<string, string> = {
  startup: 'bg-[hsl(0,0%,45%)] text-white group-hover:bg-primary',
  hospital: 'bg-[hsl(0,0%,50%)] text-white group-hover:bg-primary',
  government: 'bg-[hsl(0,0%,55%)] text-white group-hover:bg-primary',
  research: 'bg-[hsl(0,0%,60%)] text-white group-hover:bg-primary',
  enterprise: 'bg-[hsl(0,0%,65%)] text-white group-hover:bg-primary',
};

const roleColors: Record<string, string> = {
  purpose: 'bg-secondary text-foreground border-border',
  impacts: 'bg-secondary text-foreground border-border',
  activities: 'bg-secondary text-foreground border-border',
  components: 'bg-secondary text-foreground border-border',
};

const domainMaterials: Record<DomainMaterialId, MaterialSection> = {
  oncology: sections.oncology,
  'process-mining': sections.processMining,
  'medical-tourism': sections.medicalTourism,
};

function getMaterialSection(domainId: string) {
  return domainMaterials[domainId as DomainMaterialId] ?? null;
}

function activateOnKeyDown(event: React.KeyboardEvent<HTMLDivElement>, onActivate: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onActivate();
  }
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-background p-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="heading-md">{value}</p>
    </div>
  );
}

function OverviewMaterialSection({
  onOpenDomain,
}: {
  onOpenDomain: (domainId: string) => void;
}) {
  return (
    <section className="mt-20 border-t border-border pt-16">
      <div className="mb-10 max-w-2xl">
        <p className="tag-label mb-4">Research Materials</p>
        <h2 className="heading-lg mb-4">
          Pick a vertical and the full material opens below the directory.
        </h2>
        <p className="text-body-sm text-muted-foreground">
          The civic directory stays as the top layer. Each domain then expands into the
          underlying map or corridor material inside the same page.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {Object.entries(domainMaterials).map(([domainId, section]) => (
          <button
            key={domainId}
            type="button"
            onClick={() => onOpenDomain(domainId)}
            className="card-hover border border-border bg-secondary/30 p-6 text-left"
          >
            <p className="tag-label mb-5">{section.label}</p>
            <h3 className="heading-md mb-3">{section.title}</h3>
            <p className="mb-6 text-body-sm text-muted-foreground">
              {section.landingDescription}
            </p>

            <div className="mb-6 flex flex-wrap gap-2">
              {section.stats.map((stat) => (
                <Badge key={stat.label} variant="outline" className="rounded-none text-xs">
                  {stat.label}: {stat.value}
                </Badge>
              ))}
            </div>

            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              Open material
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function DomainMaterialSection({
  claimCount,
  onOpenOverview,
  playerCount,
  section,
}: {
  claimCount: number;
  onOpenOverview: () => void;
  playerCount: number;
  section: MaterialSection;
}) {
  const embeddedMapPath =
    section.artifactType === 'embedded-map' ? section.embedPath : undefined;

  return (
    <section className="mt-20 border-t border-border pt-16" id="material">
      <div className="mb-10 max-w-3xl">
        <p className="tag-label mb-4">Material</p>
        <h2 className="heading-lg mb-4">{section.title}</h2>
        <p className="text-body text-muted-foreground">{section.landingDescription}</p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <MetricCard label="Organizations" value={`${playerCount}`} />
            <MetricCard label="Verified claims" value={`${claimCount}`} />
          </div>

          <div className="border border-border bg-secondary/30 p-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              What opens here
            </p>
            <p className="mb-4 text-body-sm text-muted-foreground">{section.description}</p>
            <p className="text-body-sm text-muted-foreground">{section.subtitle}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-none"
              onClick={onOpenOverview}
            >
              Back to overview
            </Button>

            {section.embedPath ? (
              <Button asChild className="rounded-none">
                <a href={section.embedPath} target="_blank" rel="noopener noreferrer">
                  Open source material
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="border border-border bg-secondary/20 p-4 md:p-6">
          {embeddedMapPath ? (
            <>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Embedded research map
                </p>
                <a
                  href={embeddedMapPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  Open full map
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <EmbeddedMapFrame
                src={embeddedMapPath}
                title={`${section.title} material`}
              />
            </>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Corridor material
                </p>
                <Badge variant="outline" className="rounded-none text-xs">
                  Civic-native rendering
                </Badge>
              </div>

              <div className="border border-border bg-background p-6">
                <CorridorMap />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {section.stats.map((stat) => (
                  <div key={stat.label} className="border border-border bg-background p-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="heading-md">{stat.value}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function EntityDetail({
  player,
  claims: playerClaims,
  language,
  t,
}: {
  player: Player;
  claims: typeof claims;
  language: 'en' | 'ar';
  t: (key: string) => string;
}) {
  const TypeIcon = typeIcons[player.type] || Building2;

  return (
    <>
      <SheetHeader className="mb-6 text-left">
        <div className="mb-2 flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center',
              typeColors[player.type],
            )}
          >
            <TypeIcon className="h-5 w-5" />
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

      <div className="mb-6 space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>
            {player.city}, {player.country}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>Founded {player.founded}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 shrink-0" />
          <span>{player.employees}</span>
        </div>
        {player.website ? (
          <a
            href={player.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Visit website
          </a>
        ) : null}
      </div>

      {player.aiAreas.length > 0 ? (
        <div className="mb-6">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            AI areas
          </h4>
          <div className="flex flex-wrap gap-2">
            {player.aiAreas.map((area) => (
              <Badge key={area} variant="outline" className="rounded-none text-xs">
                {area}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      <div className="my-6 border-t border-border" />

      <div>
        <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <ShieldCheck className="h-4 w-4" />
          Verified claims ({playerClaims.length})
        </h4>

        {playerClaims.length > 0 ? (
          <div className="space-y-3">
            {playerClaims.map((claim) => (
              <ClaimCard key={claim.claim_id} claim={claim} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border p-6 text-center">
            <p className="mb-2 text-sm text-muted-foreground">No verified claims yet.</p>
            <a
              href={SUGGEST_ENTRY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
            >
              Suggest a claim {'->'}
            </a>
          </div>
        )}
      </div>
    </>
  );
}

interface DirectoryProps {
  domainId: string;
}

const Directory = ({ domainId }: DirectoryProps) => {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [activeDomainId, setActiveDomainId] = useState<string>(() => normalizeDomainId(domainId));
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    setActiveDomainId(normalizeDomainId(domainId));
  }, [domainId]);

  const activeDomain = domains.find((domain) => domain.id === activeDomainId);
  const activeMaterial = getMaterialSection(activeDomainId);
  const isOverview = activeDomainId === 'overview';

  const filteredPlayers = isOverview
    ? players
    : players.filter((player) => activeDomain?.playerIds.includes(player.id));

  const domainClaimCount = isOverview
    ? claims.length
    : claims.filter((claim) => activeDomain?.playerIds.includes(claim.subject_id)).length;

  const getPlayerClaims = (playerId: string) =>
    claims.filter((claim) => claim.subject_id === playerId);

  const handleDomainChange = (domainId: string) => {
    setActiveDomainId(domainId);
    router.push(domainId === 'overview' ? '/directory' : `/directory/${domainId}`);
  };

  const renderDomainDiagram = () => {
    if (activeDomainId === 'medical-tourism') {
      return <CorridorMap />;
    }

    return (
      <SystemDiagram
        domains={domains}
        activeDomainId={activeDomainId}
        onDomainClick={handleDomainChange}
      />
    );
  };

  return (
    <>
      <div className="container py-16 md:py-24">
        <Tabs value={activeDomainId} onValueChange={handleDomainChange} className="mb-10">
          <TabsList className="h-auto flex-wrap gap-1 border border-border bg-secondary/50 p-1.5">
            {domains.map((domain) => (
              <TabsTrigger
                key={domain.id}
                value={domain.id}
                className="rounded-none px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {domain.name[language]}
              </TabsTrigger>
            ))}
            <a
              href={SUGGEST_ENTRY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              Suggest
            </a>
          </TabsList>
        </Tabs>

        <div className="mb-16 grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="max-w-xl">
            <h1 className="heading-display section-marker mb-4">
              {isOverview ? t('nav.directory') : activeDomain?.name[language]}
            </h1>
            <p className="mb-2 text-body text-muted-foreground">
              {isOverview ? t('entry.directory.desc') : activeDomain?.subtitle[language]}
            </p>

            <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>{filteredPlayers.length} organizations</span>
              <span>|</span>
              <span>{domainClaimCount} verified claims</span>
              {!isOverview &&
                activeDomain?.stats?.map((stat) => (
                  <span key={stat.label}>| {stat.value}</span>
                ))}
            </div>

            <LastUpdated section="directory" />
          </div>

          <div className="hidden justify-end lg:flex">{renderDomainDiagram()}</div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlayers.map((player) => {
            const TypeIcon = typeIcons[player.type] || Building2;
            const playerClaimCount = getPlayerClaims(player.id).length;

            return (
              <div
                key={player.id}
                role="button"
                tabIndex={0}
                aria-haspopup="dialog"
                aria-label={`Open details for ${player.name[language]}`}
                className="group cursor-pointer border border-border bg-background p-6 transition-[border-color,box-shadow] hover:border-primary hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={() => setSelectedPlayer(player)}
                onKeyDown={(event) => activateOnKeyDown(event, () => setSelectedPlayer(player))}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center transition-colors',
                      typeColors[player.type],
                    )}
                  >
                    <TypeIcon className="h-5 w-5" />
                  </div>

                  <div className="flex items-center gap-2">
                    {playerClaimCount > 0 ? (
                      <Badge variant="outline" className="gap-1 rounded-none text-xs">
                        <ShieldCheck className="h-3 w-3" />
                        {playerClaimCount}
                      </Badge>
                    ) : null}

                    <Badge
                      variant="outline"
                      className={cn('rounded-none text-xs', roleColors[player.systemRole])}
                    >
                      {t(`role.${player.systemRole}`)}
                    </Badge>
                  </div>
                </div>

                <h3 className="mb-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                  {player.name[language]}
                </h3>

                <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                  {player.description[language]}
                </p>

                <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>
                      {player.city}, {player.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>Founded {player.founded}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 shrink-0" />
                    <span>{player.employees}</span>
                  </div>
                </div>

                {player.aiAreas.length > 0 ? (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {player.aiAreas.slice(0, 3).map((area) => (
                      <Badge key={area} variant="outline" className="rounded-none text-xs">
                        {area}
                      </Badge>
                    ))}
                    {player.aiAreas.length > 3 ? (
                      <Badge variant="outline" className="rounded-none text-xs">
                        +{player.aiAreas.length - 3}
                      </Badge>
                    ) : null}
                  </div>
                ) : null}

                {player.website ? (
                  <a
                    href={player.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit website
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>

        {!isOverview && filteredPlayers.length === 0 ? (
          <div className="mt-8 border border-dashed border-border p-12 text-center">
            <p className="mb-2 text-muted-foreground">
              No organizations are mapped to this domain yet.
            </p>
            <a
              href={SUGGEST_ENTRY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
            >
              Suggest an organization {'->'}
            </a>
          </div>
        ) : null}

        {isOverview ? (
          <OverviewMaterialSection onOpenDomain={handleDomainChange} />
        ) : activeMaterial ? (
          <DomainMaterialSection
            claimCount={domainClaimCount}
            onOpenOverview={() => handleDomainChange('overview')}
            playerCount={filteredPlayers.length}
            section={activeMaterial}
          />
        ) : null}
      </div>

      <Sheet open={!!selectedPlayer} onOpenChange={(open) => !open && setSelectedPlayer(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selectedPlayer ? (
            <EntityDetail
              player={selectedPlayer}
              claims={getPlayerClaims(selectedPlayer.id)}
              t={t}
              language={language}
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Directory;
