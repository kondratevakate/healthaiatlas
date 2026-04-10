'use client';

// Discovery Page
// Research hub with scrollable tabs + sidebar for Red Flags

import Link from 'next/link';
import { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  MessageSquare,
  Search,
  UserPlus,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompactRedFlagItem } from '@/components/research/CompactRedFlagItem';
import { LastUpdated } from '@/components/shared/LastUpdated';
import { ConferenceCard } from '@/components/cards';
import { MentorCard } from '@/components/cards/MentorCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { conferences } from '@/data/conferences';
import { SUGGEST_ENTRY_URL } from '@/data/constants';
import { mentors } from '@/data/mentors';
import { redFlags } from '@/data/redflags';
import type { RedFlag } from '@/types/research';

const verificationPrompts = [
  {
    id: 'verify-entity',
    title: 'Verify Company Entity',
    prompt:
      'Search for [COMPANY NAME] UAE trade license, Dubai DED registration, or Abu Dhabi DED. Check if they have a valid commercial license in Emirates.',
  },
  {
    id: 'verify-hospital',
    title: 'Verify Hospital Partnership',
    prompt:
      "Find official press releases or news from [HOSPITAL NAME] website confirming partnership with [COMPANY]. Check hospital's official innovation partners page.",
  },
  {
    id: 'verify-accelerator',
    title: 'Verify Accelerator Batch',
    prompt:
      "Search [ACCELERATOR NAME] portfolio or cohort [YEAR] for [COMPANY NAME]. Check the accelerator's official website alumni/portfolio page.",
  },
  {
    id: 'verify-funding',
    title: 'Verify Funding Round',
    prompt:
      'Search Crunchbase, MAGNiTT, or official press releases for [COMPANY NAME] funding announcement. Verify investor names and round size.',
  },
  {
    id: 'verify-regulation',
    title: 'Check Regulatory Status',
    prompt:
      'Search [PRODUCT TYPE] registration requirements on DHA, MOHAP, or DOH Abu Dhabi websites. Check if medical device classification is required.',
  },
] as const;

function SidebarContent({
  filteredFlags,
  searchQuery,
  setSearchQuery,
}: {
  filteredFlags: RedFlag[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Red Flags
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search flags..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-9 pl-9 text-sm"
            />
          </div>
          <ScrollArea className="h-[400px]">
            {filteredFlags.length > 0 ? (
              filteredFlags.map((flag) => <CompactRedFlagItem key={flag.id} flag={flag} />)
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No red flags match your search.
              </p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Discovery() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('calendar');
  const [leaderCategory, setLeaderCategory] = useState('all');
  const [eventType, setEventType] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const filteredFlags = redFlags.filter((flag) => {
    const query = searchQuery.toLowerCase();
    return (
      flag.title.en.toLowerCase().includes(query) ||
      flag.pattern.en.toLowerCase().includes(query) ||
      flag.reality.en.toLowerCase().includes(query)
    );
  });

  const filteredLeaders = mentors.filter(
    (leader) => leaderCategory === 'all' || leader.category === leaderCategory,
  );

  const filteredEvents = conferences
    .filter((event) => eventType === 'all' || event.type === eventType)
    .filter((event) => {
      if (!selectedDate) {
        return true;
      }

      const eventDate = new Date(event.date);
      return eventDate.toDateString() === selectedDate.toDateString();
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const eventDates = conferences.map((conference) => new Date(conference.date));
  const hasLeaders = mentors.length > 0;

  const copyPrompt = async (prompt: string) => {
    await navigator.clipboard.writeText(prompt);
  };

  return (
    <div className="min-h-screen">
      <section className="border-b border-border py-12 md:py-16">
        <div className="container">
          <Button asChild variant="ghost" className="mb-6 -ml-2">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Navigator
            </Link>
          </Button>

          <div className="max-w-2xl">
            <h1 className="mb-4 font-serif text-4xl font-bold tracking-tight leading-[1.1] md:text-5xl">
              Discovery
            </h1>
            <div className="mb-6 h-1 w-16 bg-primary" />
            <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
              Explore events, connect with leaders, and verify claims in the UAE healthcare AI ecosystem.
            </p>
            <LastUpdated section="discovery" />
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          <div className="mb-6 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Red Flags
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader className="mb-4">
                  <SheetTitle>Red Flags</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100%-60px)]">
                  <SidebarContent
                    filteredFlags={filteredFlags}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                  />
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
            <div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <ScrollArea className="mb-8 w-full">
                  <TabsList className="w-max">
                    <TabsTrigger value="calendar" className="gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Events
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

                <TabsContent value="calendar">
                  <div className="mb-6">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Events Calendar
                    </p>
                    <div className="mb-4 h-0.5 w-12 bg-primary" />
                    <p className="text-muted-foreground">
                      Conferences, meetups, and workshops in the UAE healthcare AI space.
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                    <div className="space-y-4">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="pointer-events-auto rounded-none border"
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

                      {selectedDate ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDate(undefined)}
                          className="text-xs"
                        >
                          Clear date filter
                        </Button>
                      ) : null}
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">
                        {selectedDate ? `Events on ${selectedDate.toLocaleDateString()}` : 'Upcoming Events'}
                      </h3>

                      {filteredEvents.length > 0 ? (
                        filteredEvents.map((event) => <ConferenceCard key={event.id} conference={event} />)
                      ) : (
                        <div className="border border-dashed py-12 text-center">
                          <p className="text-muted-foreground">No events match your filters.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="leaders">
                  <div className="mb-6">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Thought Leaders
                    </p>
                    <div className="mb-4 h-0.5 w-12 bg-primary" />
                    <p className="mb-6 text-muted-foreground">
                      Connect with key voices shaping UAE healthcare AI.
                    </p>

                    {hasLeaders ? (
                      <div className="flex flex-wrap gap-2">
                        {['all', 'clinical', 'investment', 'policy', 'tech', 'research'].map((category) => (
                          <Badge
                            key={category}
                            variant={leaderCategory === category ? 'default' : 'outline'}
                            onClick={() => setLeaderCategory(category)}
                            className="cursor-pointer rounded-none"
                          >
                            {category === 'all'
                              ? 'All'
                              : category.charAt(0).toUpperCase() + category.slice(1)}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {hasLeaders ? (
                    <>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {filteredLeaders.map((leader) => (
                          <MentorCard key={leader.id} mentor={leader} />
                        ))}
                      </div>
                      {filteredLeaders.length === 0 ? (
                        <div className="py-12 text-center">
                          <p className="text-muted-foreground">No leaders in this category.</p>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <Card className="border-2 border-dashed">
                      <CardContent className="p-8 text-center">
                        <UserPlus className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-semibold">Coming Soon</h3>
                        <p className="mx-auto mb-4 max-w-md text-muted-foreground">
                          We&apos;re verifying real thought leaders before listing them.
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
                  )}
                </TabsContent>

                <TabsContent value="prompts">
                  <div className="max-w-3xl">
                    <div className="mb-6">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        LLM Verification Prompts
                      </p>
                      <div className="mb-4 h-0.5 w-12 bg-primary" />
                      <p className="text-muted-foreground">
                        Copy these prompts to verify claims using AI assistants like Claude, ChatGPT, or Perplexity.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {verificationPrompts.map((item) => (
                        <Card key={item.id} className="border-2 transition-colors hover:border-primary/30">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="mb-2 font-semibold">{item.title}</h3>
                                <p className="rounded bg-secondary/50 p-3 font-mono text-sm text-muted-foreground">
                                  {item.prompt}
                                </p>
                              </div>
                              <Button variant="outline" size="sm" onClick={() => copyPrompt(item.prompt)}>
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

            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <SidebarContent
                  filteredFlags={filteredFlags}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-12">
        <div className="container">
          <div className="max-w-xl">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Have a tip?
            </p>
            <div className="mb-4 h-0.5 w-8 bg-primary" />
            <p className="mb-4 text-muted-foreground">
              If you&apos;ve encountered a pattern not listed here, we&apos;d like to hear about it.
              All submissions are verified before publishing.
            </p>
            <a href={SUGGEST_ENTRY_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">Submit a Red Flag</Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
