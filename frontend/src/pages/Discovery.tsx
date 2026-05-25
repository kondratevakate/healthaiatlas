// Discovery Page
// Two sections:
//  - Newsfeed: events / launches / leaders / verification prompts (sub-tabs)
//  - Open Calls: single Product-Hunt-style card grid with countdown timers

import { Layout } from '@/components/layout';
import { conferences } from '@/data/conferences';
import { launches } from '@/data/launches';
import {
  openCallEntries,
  OPEN_CALL_REGIONS,
  categoryLabel,
  type OpenCallCategory,
  type GrantRegion,
} from '@/data/openCallEntries';
import { conferenceRoles, launchRoles, matchesRole } from '@/data/roleRelevance';
import { PathRole } from '@/types/research';
import { ConferenceCard, OpenCallCard } from '@/components/cards';
import { EventInsights } from '@/components/research/EventInsights';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  ArrowLeft,
  MessageSquare,
  Users,
  CalendarDays,
  UserPlus,
  TrendingUp,
  ExternalLink,
  LinkIcon,
  Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LastUpdated } from '@/components/shared/LastUpdated';
import { SuggestActions } from '@/components/shared/SuggestActions';
import { PageHeader } from '@/components/shared/PageHeader';
import { SUGGEST_ENTRY_URL } from '@/data/constants';
import { countdownSortKey } from '@/lib/countdown';
import { cn } from '@/lib/utils';
import { isToday, isThisMonth, isThisWeek } from 'date-fns';

const COPILOT_ENABLED = import.meta.env.VITE_DISCOVERY_COPILOT === 'on';

// Verification prompts for LLM (Newsfeed → Prompts sub-tab)
const verificationPrompts = [
  {
    id: 'verify-entity',
    title: 'Verify Company Entity',
    prompt:
      'Search for [COMPANY NAME] UAE trade license, Dubai DED registration, or Abu Dhabi DED. Check if they have a valid commercial license in Emirates.',
    category: 'due-diligence',
  },
  {
    id: 'verify-hospital',
    title: 'Verify Hospital Partnership',
    prompt:
      "Find official press releases or news from [HOSPITAL NAME] website confirming partnership with [COMPANY]. Check hospital's official innovation partners page.",
    category: 'due-diligence',
  },
  {
    id: 'verify-accelerator',
    title: 'Verify Accelerator Batch',
    prompt:
      "Search [ACCELERATOR NAME] portfolio or cohort [YEAR] for [COMPANY NAME]. Check the accelerator's official website alumni/portfolio page.",
    category: 'due-diligence',
  },
  {
    id: 'verify-funding',
    title: 'Verify Funding Round',
    prompt:
      'Search Crunchbase, MAGNiTT, or official press releases for [COMPANY NAME] funding announcement. Verify investor names and round size.',
    category: 'due-diligence',
  },
  {
    id: 'verify-regulation',
    title: 'Check Regulatory Status',
    prompt:
      'Search [PRODUCT TYPE] registration requirements on DHA, MOHAP, or DOH Abu Dhabi websites. Check if medical device classification is required.',
    category: 'regulatory',
  },
];

type LaunchPeriod = 'today' | 'week' | 'month' | 'all';
type RoleFilter = PathRole | 'all';
type Section = 'newsfeed' | 'opencalls';

const ROLE_FILTER_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'All roles' },
  { value: 'founder', label: 'Founder' },
  { value: 'business', label: 'Business' },
  { value: 'student', label: 'Student / Researcher' },
  { value: 'jobseeker', label: 'Job seeker' },
];

// Default sub-tab per section. Only Newsfeed has tabs; Open Calls is a single
// grid, but a sentinel value keeps the URL handling uniform.
const DEFAULT_TAB_FOR_SECTION: Record<Section, string> = {
  newsfeed: 'calendar',
  opencalls: 'grid',
};

const NEWSFEED_TABS = ['calendar', 'launches', 'leaders', 'prompts'];

// Categories surfaced in the Open Calls UI. Sandbox is dropped from
// primary view because it's a regulatory-product niche (≈5% of calls,
// only relevant to founders building actual SaMD products); hackathon
// is dropped because the data file has zero entries today — showing
// "Hackathon · 0 calls" reads as broken product. Both categories are
// preserved in the data layer (OpenCallCategory type) and will resurface
// here automatically if/when entries land.
// All categories surface in the filter, including hackathon and research-lab
// even when they have zero entries — visitors expect to see the full taxonomy
// up front, and the empty state for a chosen filter is self-explanatory.
const VISIBLE_OPEN_CALL_CATEGORIES: OpenCallCategory[] = [
  'grant',
  'fellowship',
  'accelerator',
  'prize',
  'sandbox',
  'hackathon',
  'research-lab',
];

const MS_PER_DAY = 86_400_000;

function daysUntilUtc(deadline: Date, now: Date): number {
  const dl = Date.UTC(deadline.getUTCFullYear(), deadline.getUTCMonth(), deadline.getUTCDate());
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((dl - today) / MS_PER_DAY);
}

export default function Discovery() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Section comes from `?section=`. Anything we don't recognise (including the
  // retired `talent` value) falls through to Newsfeed.
  const sectionParam = searchParams.get('section');
  const section: Section = sectionParam === 'opencalls' ? 'opencalls' : 'newsfeed';

  // Sub-tab applies only inside Newsfeed.
  const tabParam = searchParams.get('tab');
  const activeTab =
    section === 'newsfeed' && tabParam && NEWSFEED_TABS.includes(tabParam)
      ? tabParam
      : DEFAULT_TAB_FOR_SECTION[section];
  const setActiveTab = (t: string) => {
    const next = new URLSearchParams(searchParams);
    if (t === DEFAULT_TAB_FOR_SECTION[section]) next.delete('tab');
    else next.set('tab', t);
    setSearchParams(next);
  };

  const [eventType, setEventType] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [launchPeriod, setLaunchPeriod] = useState<LaunchPeriod>('all');
  // Role filter applies to Newsfeed only (events, launches, leaders, prompts).
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
    .filter((event) => eventType === 'all' || event.type === eventType)
    .filter((event) => {
      if (!selectedDate) return true;
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === selectedDate.toDateString();
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const eventDates = conferences.map((c) => new Date(c.date));

  // Open Calls — region + category + status filters. Sort by countdown.
  // Two status filters, mutually exclusive (radio-like). Empty string =
  // no status filter applied. Window is 90 days for closing-soon because
  // the data has ~zero deadlines inside 30d at any given time (open calls
  // typically post 3-6 months ahead), so a 30d window almost always
  // returned 0 results and read as broken.
  const [openCallsRegion, setOpenCallsRegion] = useState<GrantRegion | 'all'>('all');
  const [openCallsCategory, setOpenCallsCategory] = useState<OpenCallCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'' | 'closing' | 'coming'>('');
  const CLOSING_WINDOW_DAYS = 90;

  const filteredOpenCalls = useMemo(() => {
    const now = new Date();
    return [...openCallEntries]
      .filter((e) => openCallsRegion === 'all' || e.region === openCallsRegion)
      .filter((e) => openCallsCategory === 'all' || e.category === openCallsCategory)
      .filter((e) => {
        if (statusFilter === '') return true;
        if (statusFilter === 'closing') {
          if (e.countdown.kind !== 'deadline') return false;
          const d = daysUntilUtc(e.countdown.date, now);
          return d >= 0 && d <= CLOSING_WINDOW_DAYS;
        }
        // 'coming' — recurring annual cycles you can prepare for.
        return e.countdown.kind === 'annual';
      })
      .sort((a, b) => countdownSortKey(a.countdown, now) - countdownSortKey(b.countdown, now));
  }, [openCallsRegion, openCallsCategory, statusFilter]);

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
  };

  return (
    <Layout>
      <div className="min-h-screen">
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

          {/* Title tracks the active section — the page header reflects
              what the visitor actually navigated to (Open Calls vs Events),
              not the internal route name "Discovery". */}
          <PageHeader
            title={section === 'opencalls' ? 'Open Calls' : 'Events'}
            subtitle={
              section === 'opencalls'
                ? 'Grants, fellowships, accelerators, prizes — sorted by deadline. Every entry links to the issuer\'s primary page.'
                : 'Conferences, launches, leader spotlights, and verification prompts across the healthcare AI ecosystem.'
            }
            className="mb-6"
          />

          {/* Newsfeed role filter */}
          {section === 'newsfeed' && (
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
          )}

          {/* Open Calls filter row — region + category + closing-soon toggle */}
          {section === 'opencalls' && (
            <div className="mb-8 space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-2">
                  Region
                </p>
                <div className="flex flex-wrap gap-2">
                  {(['all', ...OPEN_CALL_REGIONS] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setOpenCallsRegion(r as GrantRegion | 'all')}
                      className={cn(
                        'inline-flex items-center px-3 py-1.5 text-xs font-mono border transition-colors',
                        openCallsRegion === r
                          ? 'bg-foreground text-background border-foreground'
                          : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
                      )}
                    >
                      {r === 'all' ? 'All regions' : r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-2">
                  Category
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {(['all', ...VISIBLE_OPEN_CALL_CATEGORIES] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setOpenCallsCategory(c as OpenCallCategory | 'all')}
                      className={cn(
                        'inline-flex items-center px-3 py-1.5 text-xs font-mono border transition-colors',
                        openCallsCategory === c
                          ? 'bg-foreground text-background border-foreground'
                          : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
                      )}
                    >
                      {c === 'all' ? 'All categories' : categoryLabel[c as OpenCallCategory]}
                    </button>
                  ))}
                  <div className="h-4 w-px bg-border mx-1" />
                  <button
                    type="button"
                    onClick={() => setStatusFilter((v) => (v === 'closing' ? '' : 'closing'))}
                    className={cn(
                      'inline-flex items-center px-3 py-1.5 text-xs font-mono border transition-colors',
                      statusFilter === 'closing'
                        ? 'bg-foreground text-background border-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
                    )}
                  >
                    Closing soon (≤{CLOSING_WINDOW_DAYS}d)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter((v) => (v === 'coming' ? '' : 'coming'))}
                    className={cn(
                      'inline-flex items-center px-3 py-1.5 text-xs font-mono border transition-colors',
                      statusFilter === 'coming'
                        ? 'bg-foreground text-background border-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
                    )}
                    title="Annual cycles you can prepare for"
                  >
                    Coming soon (annual)
                  </button>
                  <span className="ml-auto text-[10px] text-muted-foreground font-mono self-center">
                    {filteredOpenCalls.length}{' '}
                    {filteredOpenCalls.length === 1 ? 'call' : 'calls'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Main content + optional copilot sidebar */}
          <div>
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
              <div>
                {section === 'newsfeed' && (
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                        <TabsTrigger value="prompts" className="gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Prompts
                        </TabsTrigger>
                      </TabsList>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>

                    {/* Events Calendar */}
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
                        <div className="space-y-4">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-none border pointer-events-auto"
                            modifiers={{ hasEvent: eventDates }}
                            modifiersStyles={{
                              hasEvent: {
                                backgroundColor: 'hsl(var(--primary))',
                                color: 'hsl(var(--primary-foreground))',
                                borderRadius: '0',
                              },
                            }}
                          />

                          <div className="space-y-2">
                            <p className="text-sm font-medium">Filter by type</p>
                            <div className="flex flex-wrap gap-2">
                              {['all', 'conference', 'meetup', 'workshop', 'demo-day'].map((type) => (
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

                        <div className="space-y-4">
                          <h3 className="font-semibold">
                            {selectedDate
                              ? `Events on ${selectedDate.toLocaleDateString()}`
                              : 'Upcoming Events'}
                          </h3>

                          {filteredEvents.length > 0 ? (
                            filteredEvents.map((event) => (
                              <ConferenceCard key={event.id} conference={event} />
                            ))
                          ) : (
                            <div className="text-center py-12 border border-dashed">
                              <p className="text-muted-foreground">No events match your filters.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Launches */}
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
                            {p === 'all'
                              ? 'All time'
                              : p === 'today'
                              ? 'Today'
                              : p === 'week'
                              ? 'This week'
                              : 'This month'}
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
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {launch.tagline}
                                </p>
                                {launch.whyItMatters && (
                                  <p className="text-xs text-foreground/70 mt-1 line-clamp-1 italic">
                                    → {launch.whyItMatters}
                                  </p>
                                )}
                                <div className="flex gap-2 mt-1.5 flex-wrap">
                                  {launch.topics.map((topic) => (
                                    <Badge
                                      key={topic}
                                      variant="secondary"
                                      className="text-xs py-0 px-1.5"
                                    >
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
                            <p className="text-muted-foreground">
                              No launches in this period yet.
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Thought Leaders */}
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
                            We're verifying real thought leaders before listing them. Only profiles
                            with confirmed activity and evidence will appear here.
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

                    {/* Verification Prompts */}
                    <TabsContent value="prompts">
                      <div className="max-w-3xl">
                        <div className="mb-6">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                            LLM Verification Prompts
                          </p>
                          <div className="h-0.5 w-12 bg-primary mb-4" />
                          <p className="text-muted-foreground">
                            Copy these prompts to verify claims using AI assistants like Claude,
                            ChatGPT, or Perplexity.
                          </p>
                        </div>

                        <div className="space-y-4">
                          {verificationPrompts.map((item) => (
                            <Card
                              key={item.id}
                              className="border-2 hover:border-primary/30 transition-colors"
                            >
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
                )}

                {section === 'opencalls' && (
                  <>
                    {filteredOpenCalls.length > 0 ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredOpenCalls.map((entry) => (
                          <OpenCallCard key={entry.id} entry={entry} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 border border-dashed border-border">
                        <p className="text-muted-foreground mb-2">
                          No calls match the current filters.
                        </p>
                        {statusFilter === 'closing' && (
                          <p className="text-sm text-muted-foreground">
                            No deadlines inside {CLOSING_WINDOW_DAYS} days right now —
                            try{' '}
                            <button
                              type="button"
                              onClick={() => setStatusFilter('coming')}
                              className="text-primary hover:underline"
                            >
                              Coming soon
                            </button>{' '}
                            for annual cycles you can prepare for.
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

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
