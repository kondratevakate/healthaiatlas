// Discovery Page
// Research hub with scrollable tabs + sidebar with AI Discovery copilot

import { Layout } from '@/components/layout';
import { conferences } from '@/data/conferences';
import { launches } from '@/data/launches';
import { grants } from '@/data/grants';
import { programs } from '@/data/programs';
import { openCalls } from '@/data/openCalls';
import { talentProfiles, tierConfig, availabilityConfig, ProfileTier } from '@/data/talentProfiles';
import { conferenceRoles, launchRoles, matchesRole } from '@/data/roleRelevance';
import { PathRole } from '@/types/research';
import { ConferenceCard } from '@/components/cards';
import { EventInsights } from '@/components/research/EventInsights';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ArrowLeft, MessageSquare, Users, CalendarDays, UserPlus, TrendingUp, ExternalLink, LinkIcon, Sparkles, Award, GraduationCap, FileText, Briefcase, Lock, Star, Shield } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LastUpdated } from '@/components/shared/LastUpdated';
import { SuggestActions } from '@/components/shared/SuggestActions';
import { PageHeader } from '@/components/shared/PageHeader';
import { SUGGEST_ENTRY_URL } from '@/data/constants';
import { cn } from '@/lib/utils';
import { isToday, isThisMonth, isThisWeek } from 'date-fns';

const COPILOT_ENABLED = import.meta.env.VITE_DISCOVERY_COPILOT === 'on';

// Verification prompts for LLM
const verificationPrompts = [
  {
    id: 'verify-entity',
    title: 'Verify Company Entity',
    prompt: 'Search for [COMPANY NAME] UAE trade license, Dubai DED registration, or Abu Dhabi DED. Check if they have a valid commercial license in Emirates.',
    category: 'due-diligence'
  },
  {
    id: 'verify-hospital',
    title: 'Verify Hospital Partnership',
    prompt: 'Find official press releases or news from [HOSPITAL NAME] website confirming partnership with [COMPANY]. Check hospital\'s official innovation partners page.',
    category: 'due-diligence'
  },
  {
    id: 'verify-accelerator',
    title: 'Verify Accelerator Batch',
    prompt: 'Search [ACCELERATOR NAME] portfolio or cohort [YEAR] for [COMPANY NAME]. Check the accelerator\'s official website alumni/portfolio page.',
    category: 'due-diligence'
  },
  {
    id: 'verify-funding',
    title: 'Verify Funding Round',
    prompt: 'Search Crunchbase, MAGNiTT, or official press releases for [COMPANY NAME] funding announcement. Verify investor names and round size.',
    category: 'due-diligence'
  },
  {
    id: 'verify-regulation',
    title: 'Check Regulatory Status',
    prompt: 'Search [PRODUCT TYPE] registration requirements on DHA, MOHAP, or DOH Abu Dhabi websites. Check if medical device classification is required.',
    category: 'regulatory'
  }
];

type LaunchPeriod = 'today' | 'week' | 'month' | 'all';
type RoleFilter = PathRole | 'all';

const ROLE_FILTER_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'All roles' },
  { value: 'founder', label: 'Founder' },
  { value: 'business', label: 'Business' },
  { value: 'student', label: 'Student / Researcher' },
  { value: 'jobseeker', label: 'Job seeker' },
];

export default function Discovery() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') ?? 'calendar';
  const setActiveTab = (t: string) => {
    const next = new URLSearchParams(searchParams);
    if (t === 'calendar') next.delete('tab');
    else next.set('tab', t);
    setSearchParams(next);
  };
  const [eventType, setEventType] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [launchPeriod, setLaunchPeriod] = useState<LaunchPeriod>('all');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  const filteredLaunches = useMemo(() => {
    const sorted = [...launches].sort((a, b) => b.launchDate.getTime() - a.launchDate.getTime());
    const byRole = sorted.filter((l) => matchesRole(l.id, launchRoles, roleFilter));
    switch (launchPeriod) {
      case 'today':
        return byRole.filter((l) => isToday(l.launchDate));
      case 'week':
        return byRole.filter((l) => isThisWeek(l.launchDate));
      case 'month':
        return byRole.filter((l) => isThisMonth(l.launchDate));
      default:
        return byRole;
    }
  }, [launchPeriod, roleFilter]);

  const filteredEvents = conferences
    .filter((event) => matchesRole(event.id, conferenceRoles, roleFilter))
    .filter(event => eventType === 'all' || event.type === eventType)
    .filter(event => {
      if (!selectedDate) return true;
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === selectedDate.toDateString();
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const eventDates = conferences.map(c => new Date(c.date));

  const filteredGrants = useMemo(
    () => grants.filter((g) => roleFilter === 'all' || g.roles.includes(roleFilter)),
    [roleFilter],
  );
  const filteredPrograms = useMemo(
    () => programs.filter((p) => roleFilter === 'all' || p.roles.includes(roleFilter)),
    [roleFilter],
  );
  const filteredOpenCalls = useMemo(
    () => openCalls.filter((c) => roleFilter === 'all' || c.roles.includes(roleFilter)),
    [roleFilter],
  );
  const [tierFilter, setTierFilter] = useState<ProfileTier | 'all'>('all');
  const [availabilityOnly, setAvailabilityOnly] = useState<boolean>(false);

  const filteredProfiles = useMemo(() => {
    return talentProfiles
      .filter((p) => roleFilter === 'all' || p.forRoles.includes(roleFilter))
      .filter((p) => tierFilter === 'all' || p.tier === tierFilter)
      .filter((p) => !availabilityOnly || p.availability === 'open-to-offers' || p.availability === 'open-to-collab')
      .sort((a, b) => b.rating - a.rating);
  }, [roleFilter, tierFilter, availabilityOnly]);

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header + content in one container — minimal gap */}
        <div className="container pt-8 md:pt-10 pb-12">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden mb-3 -ml-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <PageHeader
            title="Discovery"
            subtitle="Events, launches, grants, programs, open calls, and talent — across the global healthcare AI ecosystem."
            className="mb-6"
          />

          {/* Role filter — chip row, filters every tab below */}
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-2">
              Show me content for
            </p>
            <div className="flex flex-wrap gap-2">
              {ROLE_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRoleFilter(opt.value)}
                  className={cn(
                    'inline-flex items-center px-3 py-1.5 text-xs font-mono border transition-colors',
                    roleFilter === opt.value
                      ? 'bg-foreground text-background border-foreground'
                      : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main content with sidebar */}
          <div>
            {/* Mobile: Sheet trigger for AI copilot — gated by VITE_DISCOVERY_COPILOT */}
            {COPILOT_ENABLED && (
              <div className="lg:hidden mb-6">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Discovery copilot
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[85vh] flex flex-col">
                    <SheetHeader className="mb-3 shrink-0">
                      <SheetTitle className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Discovery copilot
                      </SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 min-h-0 overflow-y-auto">
                      <EventInsights variant="flat" />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            )}

            <div className={COPILOT_ENABLED ? 'grid lg:grid-cols-[1fr_350px] gap-8' : ''}>
              {/* Main content - Tabs */}
              <div>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  {/* Scrollable tabs */}
                  <ScrollArea className="w-full mb-8">
                    <TabsList className="w-max">
                      <TabsTrigger value="calendar" className="gap-2">
                        <CalendarDays className="h-4 w-4" />
                        Events
                      </TabsTrigger>
                      <TabsTrigger value="launches" className="gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Launches
                      </TabsTrigger>
                      <TabsTrigger value="leaders" className="gap-2">
                        <Users className="h-4 w-4" />
                        Leaders
                      </TabsTrigger>
                      <TabsTrigger value="grants" className="gap-2">
                        <Award className="h-4 w-4" />
                        Grants
                      </TabsTrigger>
                      <TabsTrigger value="programs" className="gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Programs
                      </TabsTrigger>
                      <TabsTrigger value="open-calls" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Open calls
                      </TabsTrigger>
                      <TabsTrigger value="talent" className="gap-2">
                        <Briefcase className="h-4 w-4" />
                        Talent hub
                      </TabsTrigger>
                      <TabsTrigger value="prompts" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Prompts
                      </TabsTrigger>
                    </TabsList>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>

                  {/* Events Calendar Tab */}
                  <TabsContent value="calendar">
                    <div className="mb-6">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                        Events Calendar
                      </p>
                      <div className="h-0.5 w-12 bg-primary mb-4" />
                      <p className="text-muted-foreground">
                        Conferences, meetups, and workshops across the global healthcare AI space.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-[300px_1fr] gap-6">
                      {/* Calendar widget */}
                      <div className="space-y-4">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="rounded-none border pointer-events-auto"
                          modifiers={{
                            hasEvent: eventDates
                          }}
                          modifiersStyles={{
                            hasEvent: { 
                              backgroundColor: 'hsl(var(--primary))', 
                              color: 'hsl(var(--primary-foreground))',
                              borderRadius: '0'
                            }
                          }}
                        />
                        
                        {/* Type filter */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Filter by type</p>
                          <div className="flex flex-wrap gap-2">
                            {['all', 'conference', 'meetup', 'workshop', 'demo-day'].map(type => (
                              <Badge 
                                key={type}
                                variant={eventType === type ? 'default' : 'outline'}
                                onClick={() => setEventType(type)}
                                className="cursor-pointer rounded-none capitalize"
                              >
                                {type === 'all' ? 'All' : type.replace('-', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {selectedDate && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSelectedDate(undefined)}
                            className="text-xs"
                          >
                            Clear date filter
                          </Button>
                        )}
                      </div>
                      
                      {/* Events list */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">
                          {selectedDate 
                            ? `Events on ${selectedDate.toLocaleDateString()}` 
                            : 'Upcoming Events'
                          }
                        </h3>
                        
                        {filteredEvents.length > 0 ? (
                          filteredEvents.map(event => (
                            <ConferenceCard key={event.id} conference={event} />
                          ))
                        ) : (
                          <div className="text-center py-12 border border-dashed">
                            <p className="text-muted-foreground">
                              No events match your filters.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Launches Tab */}
                  <TabsContent value="launches">
                    <div className="mb-6">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                        Curated Launches
                      </p>
                      <div className="h-0.5 w-12 bg-primary mb-4" />
                      <p className="text-muted-foreground">
                        Editorially selected AI-powered products and platforms.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {(['today', 'week', 'month', 'all'] as LaunchPeriod[]).map((p) => (
                        <Badge
                          key={p}
                          variant={launchPeriod === p ? 'default' : 'outline'}
                          onClick={() => setLaunchPeriod(p)}
                          className="cursor-pointer rounded-none capitalize"
                        >
                          {p === 'all' ? 'All time' : p === 'today' ? 'Today' : p === 'week' ? 'This week' : 'This month'}
                        </Badge>
                      ))}
                    </div>

                    <div className="border border-border rounded-none overflow-hidden bg-card">
                      {filteredLaunches.length > 0 ? (
                        filteredLaunches.map((launch) => (
                          <div
                            key={launch.id}
                            className="flex items-center gap-4 p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors group"
                          >
                            <div className="text-3xl flex-shrink-0 w-14 h-14 rounded-none bg-muted flex items-center justify-center">
                              {launch.logo}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {launch.name}
                                </h3>
                                {launch.website && (
                                  <a
                                    href={launch.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-foreground"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1">{launch.tagline}</p>
                              {launch.whyItMatters && (
                                <p className="text-xs text-foreground/70 mt-1 line-clamp-1 italic">
                                  → {launch.whyItMatters}
                                </p>
                              )}
                              <div className="flex gap-2 mt-1.5 flex-wrap">
                                {launch.topics.map((topic) => (
                                  <Badge key={topic} variant="secondary" className="text-xs py-0 px-1.5">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            {launch.sourceUrl && (
                              <a
                                href={launch.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden sm:flex items-center gap-1 px-3 py-2 border border-border hover:bg-muted transition-colors text-xs text-muted-foreground hover:text-foreground"
                              >
                                <LinkIcon className="h-3 w-3" />
                                Source
                              </a>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-16">
                          <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No launches in this period yet.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Thought Leaders Tab — placeholder until verified profiles ship */}
                  <TabsContent value="leaders">
                    <div className="mb-6">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                        Thought Leaders
                      </p>
                      <div className="h-0.5 w-12 bg-primary mb-4" />
                      <p className="text-muted-foreground mb-6">
                        Connect with key voices shaping healthcare AI worldwide.
                      </p>
                    </div>

                    <Card className="border-2 border-dashed">
                      <CardContent className="p-8 text-center">
                        <UserPlus className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold text-lg mb-2">Coming Soon</h3>
                        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                          We're verifying real thought leaders before listing them.
                          Only profiles with confirmed activity and evidence will appear here.
                        </p>
                        <a href={SUGGEST_ENTRY_URL} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            Know someone who should be here?
                          </Button>
                        </a>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Grants Tab */}
                  <TabsContent value="grants">
                    <div className="mb-6">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                        Grants
                      </p>
                      <div className="h-0.5 w-12 bg-primary mb-4" />
                      <p className="text-muted-foreground">
                        Open public-funding calls in healthcare AI. Every entry links to the funder's primary source.
                      </p>
                    </div>

                    <div className="border border-border bg-card divide-y divide-border">
                      {filteredGrants.length > 0 ? (
                        filteredGrants.map((g) => (
                          <div key={g.id} className="p-4 flex items-start gap-4">
                            <div className="w-10 h-10 flex items-center justify-center bg-muted shrink-0">
                              <Award className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-baseline gap-2 mb-1">
                                <h3 className="font-semibold">{g.title}</h3>
                                <Badge variant="outline" className="text-[10px] rounded-none">{g.region}</Badge>
                                {g.amount && <span className="text-xs text-muted-foreground font-mono">{g.amount}</span>}
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">{g.funder}</p>
                              <p className="text-sm mb-2">{g.eligibility}</p>
                              {g.notes && <p className="text-xs text-foreground/70 italic mb-2">→ {g.notes}</p>}
                              <div className="flex flex-wrap items-center gap-3 text-xs">
                                {g.deadline && (
                                  <span className="text-muted-foreground font-mono">
                                    Deadline: {g.deadline}
                                  </span>
                                )}
                                <a
                                  href={g.src}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-primary hover:underline"
                                >
                                  <LinkIcon className="h-3 w-3" /> Source
                                </a>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">No grants for this role yet.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Programs Tab */}
                  <TabsContent value="programs">
                    <div className="mb-6">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                        Programs
                      </p>
                      <div className="h-0.5 w-12 bg-primary mb-4" />
                      <p className="text-muted-foreground">
                        Accelerators, fellowships, and structured cohort programs for healthcare AI work.
                      </p>
                    </div>

                    <div className="border border-border bg-card divide-y divide-border">
                      {filteredPrograms.length > 0 ? (
                        filteredPrograms.map((p) => (
                          <div key={p.id} className="p-4 flex items-start gap-4">
                            <div className="w-10 h-10 flex items-center justify-center bg-muted shrink-0">
                              <GraduationCap className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-baseline gap-2 mb-1">
                                <h3 className="font-semibold">{p.title}</h3>
                                <Badge variant="outline" className="text-[10px] rounded-none">{p.region}</Badge>
                                <Badge variant="secondary" className="text-[10px] rounded-none capitalize">{p.type}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">{p.organizer} · {p.duration}</p>
                              <p className="text-sm mb-2">{p.audience}</p>
                              {p.notes && <p className="text-xs text-foreground/70 italic mb-2">→ {p.notes}</p>}
                              <div className="flex flex-wrap items-center gap-3 text-xs">
                                {p.cohortDates && (
                                  <span className="text-muted-foreground font-mono">{p.cohortDates}</span>
                                )}
                                <a
                                  href={p.src}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-primary hover:underline"
                                >
                                  <LinkIcon className="h-3 w-3" /> Source
                                </a>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">No programs for this role yet.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Open Calls Tab — заявки / RFPs / sandboxes */}
                  <TabsContent value="open-calls">
                    <div className="mb-6">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                        Open calls
                      </p>
                      <div className="h-0.5 w-12 bg-primary mb-4" />
                      <p className="text-muted-foreground">
                        RFPs, regulatory sandboxes, and pilot calls. Faster cycle than grants — months, not years.
                      </p>
                    </div>

                    <div className="border border-border bg-card divide-y divide-border">
                      {filteredOpenCalls.length > 0 ? (
                        filteredOpenCalls.map((c) => (
                          <div key={c.id} className="p-4 flex items-start gap-4">
                            <div className="w-10 h-10 flex items-center justify-center bg-muted shrink-0">
                              <FileText className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-baseline gap-2 mb-1">
                                <h3 className="font-semibold">{c.title}</h3>
                                <Badge variant="outline" className="text-[10px] rounded-none">{c.region}</Badge>
                                <Badge variant="secondary" className="text-[10px] rounded-none uppercase">{c.type}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">{c.issuer}</p>
                              <p className="text-sm mb-2">{c.audience}</p>
                              {c.notes && <p className="text-xs text-foreground/70 italic mb-2">→ {c.notes}</p>}
                              <div className="flex flex-wrap items-center gap-3 text-xs">
                                {c.deadline && (
                                  <span className="text-muted-foreground font-mono">
                                    Deadline: {c.deadline}
                                  </span>
                                )}
                                <a
                                  href={c.src}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-primary hover:underline"
                                >
                                  <LinkIcon className="h-3 w-3" /> Source
                                </a>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">No open calls for this role yet.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Talent Hub — hirer-facing rated-people directory.
                      Public fields visible by default; gated fields visibly locked behind a
                      "Request access" CTA. */}
                  <TabsContent value="talent">
                    {/* Hero strip — frames the hub for hirers */}
                    <div className="border border-border bg-secondary/40 p-6 md:p-8 mb-6">
                      <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Briefcase className="h-5 w-5 text-primary" />
                            <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
                              Talent hub
                            </p>
                          </div>
                          <div className="h-0.5 w-12 bg-primary mb-3" />
                          <h2 className="text-xl md:text-2xl font-semibold mb-2">
                            A curated directory of healthcare-AI talent — for hirers
                          </h2>
                          <p className="text-sm text-muted-foreground max-w-2xl">
                            Profiles ranked by verifiable public signals — Kaggle medals, Grand
                            Challenge wins, MICCAI / NeurIPS papers, peer-reviewed deployments,
                            named fellowships. Public fields are visible to everyone; full
                            identities, contacts, and references are gated until access is granted.
                          </p>
                        </div>
                        <div className="shrink-0 flex flex-col gap-2">
                          <a href={SUGGEST_ENTRY_URL} target="_blank" rel="noopener noreferrer">
                            <Button size="lg" className="gap-2 w-full">
                              <Shield className="h-4 w-4" />
                              Request hirer access
                            </Button>
                          </a>
                          <a href={SUGGEST_ENTRY_URL} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="gap-2 w-full">
                              <UserPlus className="h-4 w-4" />
                              Submit your profile
                            </Button>
                          </a>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-4 font-mono">
                        Today the gate is GitHub-PR-based; full auth-gated reveal lands when
                        the intake form ships. Placeholder profiles are clearly marked.
                      </p>
                    </div>

                    {/* Hub-local filter row: tier + availability */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                        Tier
                      </span>
                      {(['all', 'core', 'strong', 'emerging'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTierFilter(t)}
                          className={cn(
                            'inline-flex items-center px-3 py-1 text-xs font-mono border transition-colors',
                            tierFilter === t
                              ? 'bg-foreground text-background border-foreground'
                              : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
                          )}
                        >
                          {t === 'all' ? 'All tiers' : tierConfig[t].label}
                        </button>
                      ))}
                      <div className="h-4 w-px bg-border mx-1" />
                      <button
                        type="button"
                        onClick={() => setAvailabilityOnly((v) => !v)}
                        className={cn(
                          'inline-flex items-center px-3 py-1 text-xs font-mono border transition-colors',
                          availabilityOnly
                            ? 'bg-foreground text-background border-foreground'
                            : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
                        )}
                      >
                        Open to work only
                      </button>
                      <span className="ml-auto text-[10px] text-muted-foreground font-mono">
                        {filteredProfiles.length} {filteredProfiles.length === 1 ? 'profile' : 'profiles'}
                      </span>
                    </div>

                    {/* Profile grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {filteredProfiles.length > 0 ? (
                        filteredProfiles.map((p) => {
                          const tier = tierConfig[p.tier];
                          const avail = availabilityConfig[p.availability];
                          return (
                            <Card key={p.id} className="border-2 hover:border-foreground/40 transition-colors">
                              <CardContent className="p-5">
                                {/* Header: name + tier + rating */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-semibold text-base leading-tight truncate">
                                        {p.publicName}
                                      </h3>
                                      {p.isPlaceholder && (
                                        <Badge variant="outline" className="text-[9px] rounded-none">
                                          PLACEHOLDER
                                        </Badge>
                                      )}
                                    </div>
                                    {p.handle && (
                                      <p className="text-xs text-muted-foreground font-mono">@{p.handle}</p>
                                    )}
                                  </div>
                                  <div className="text-right shrink-0">
                                    <div className={cn('inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] uppercase tracking-widest font-mono', tier.accent)}>
                                      <Star className="h-3 w-3" />
                                      {tier.label}
                                    </div>
                                    <div className="text-xl font-semibold font-mono mt-1">{p.rating}</div>
                                  </div>
                                </div>

                                {/* Specialization + region + availability */}
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  <Badge variant="outline" className="text-[10px] rounded-none">{p.region}</Badge>
                                  {p.specialization.slice(0, 3).map((s) => (
                                    <Badge key={s} variant="secondary" className="text-[10px] rounded-none">{s}</Badge>
                                  ))}
                                  <Badge
                                    variant={avail.tone === 'positive' ? 'default' : 'outline'}
                                    className="text-[10px] rounded-none"
                                  >
                                    {avail.label}
                                  </Badge>
                                </div>

                                {/* Public signals — verifiable */}
                                <div className="space-y-2 mb-4">
                                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                                    Public signals
                                  </p>
                                  {p.publicSignals.map((sig, i) => (
                                    <div key={i} className="text-sm border-l-2 border-primary/40 pl-3">
                                      <div className="font-medium">
                                        {sig.label}
                                        {sig.src && (
                                          <a
                                            href={sig.src}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 inline-flex items-center text-primary hover:underline text-[11px]"
                                          >
                                            <ExternalLink className="h-3 w-3" />
                                          </a>
                                        )}
                                      </div>
                                      <div className="text-xs text-muted-foreground">{sig.detail}</div>
                                    </div>
                                  ))}
                                </div>

                                {/* Gated section — visibly locked */}
                                <div className="border border-dashed border-border bg-muted/30 p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                                      Gated for verified hirers
                                    </p>
                                  </div>
                                  <ul className="space-y-1 text-xs text-muted-foreground">
                                    <li className={cn('flex items-center gap-2', !p.gated.fullProfileAvailable && 'opacity-50')}>
                                      <span className={cn('inline-block h-1.5 w-1.5 rounded-full', p.gated.fullProfileAvailable ? 'bg-primary' : 'bg-muted-foreground/30')} />
                                      Full identity & detailed track record
                                    </li>
                                    <li className={cn('flex items-center gap-2', !p.gated.contactsAvailable && 'opacity-50')}>
                                      <span className={cn('inline-block h-1.5 w-1.5 rounded-full', p.gated.contactsAvailable ? 'bg-primary' : 'bg-muted-foreground/30')} />
                                      Direct contact channel
                                    </li>
                                    <li className={cn('flex items-center gap-2', p.gated.referencesCount === 0 && 'opacity-50')}>
                                      <span className={cn('inline-block h-1.5 w-1.5 rounded-full', p.gated.referencesCount > 0 ? 'bg-primary' : 'bg-muted-foreground/30')} />
                                      {p.gated.referencesCount > 0 ? `${p.gated.referencesCount} reference${p.gated.referencesCount > 1 ? 's' : ''}` : 'No references on file'}
                                    </li>
                                    <li className={cn('flex items-center gap-2', !p.gated.resumeAvailable && 'opacity-50')}>
                                      <span className={cn('inline-block h-1.5 w-1.5 rounded-full', p.gated.resumeAvailable ? 'bg-primary' : 'bg-muted-foreground/30')} />
                                      Resume / CV on file
                                    </li>
                                  </ul>
                                  <a href={SUGGEST_ENTRY_URL} target="_blank" rel="noopener noreferrer" className="block mt-3">
                                    <Button size="sm" variant="outline" className="w-full gap-2">
                                      <Lock className="h-3 w-3" />
                                      Request access
                                    </Button>
                                  </a>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })
                      ) : (
                        <div className="md:col-span-2 border border-dashed border-border p-12 text-center">
                          <p className="text-muted-foreground">
                            No profiles match the current filters. Try widening the role or tier.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Methodology footer — sets expectations */}
                    <div className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground space-y-1.5">
                      <p>
                        <strong className="text-foreground">How ratings work:</strong> calibrated, not crowdsourced.
                        Tier is determined by editorial review of verifiable public signals
                        (peer-reviewed publications, ranked competitions, named fellowships,
                        deployed-product evidence). No self-reported metric counts toward tier.
                      </p>
                      <p>
                        <strong className="text-foreground">Consent:</strong> only profiles with explicit consent
                        to be listed are included. Placeholder profiles are anonymized composites
                        for layout demonstration; they are clearly marked and replaced as real
                        consented profiles arrive via PR.
                      </p>
                    </div>
                  </TabsContent>

                  {/* Verification Prompts Tab */}
                  <TabsContent value="prompts">
                    <div className="max-w-3xl">
                      <div className="mb-6">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                          LLM Verification Prompts
                        </p>
                        <div className="h-0.5 w-12 bg-primary mb-4" />
                        <p className="text-muted-foreground">
                          Copy these prompts to verify claims using AI assistants like Claude, ChatGPT, or Perplexity.
                        </p>
                      </div>

                      <div className="space-y-4">
                        {verificationPrompts.map((item) => (
                          <Card key={item.id} className="border-2 hover:border-primary/30 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold mb-2">{item.title}</h3>
                                  <p className="text-sm text-muted-foreground font-mono bg-secondary/50 p-3 rounded">
                                    {item.prompt}
                                  </p>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => copyPrompt(item.prompt)}
                                >
                                  Copy
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Desktop: Sidebar — AI Discovery copilot, gated by VITE_DISCOVERY_COPILOT */}
              {COPILOT_ENABLED && (
                <aside className="hidden lg:block">
                  <div className="sticky top-24">
                    <EventInsights />
                  </div>
                </aside>
              )}
            </div>
          </div>
        </div>

        {/* Page-bottom meta + contribute strip */}
        <section className="py-10 border-t border-border">
          <div className="container flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <LastUpdated section="discovery" />
            <SuggestActions />
          </div>
        </section>
      </div>
    </Layout>
  );
}
