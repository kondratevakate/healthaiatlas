// Discovery Page
// Research hub with scrollable tabs + sidebar for Red Flags

import { Layout } from '@/civic/components/layout';
import { CompactRedFlagItem } from '@/civic/components/research/CompactRedFlagItem';
import { RedFlag } from '@/civic/types/research';
import { redFlags } from '@/civic/data/redflags';
import { mentors, ExtendedLeaderProfile } from '@/civic/data/mentors';
import { conferences } from '@/civic/data/conferences';
import { MentorCard } from '@/civic/components/cards/MentorCard';
import { ConferenceCard } from '@/civic/components/cards';
import { Button } from '@/civic/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/civic/components/ui/card';
import { Badge } from '@/civic/components/ui/badge';
import { Calendar } from '@/civic/components/ui/calendar';
import { ScrollArea, ScrollBar } from '@/civic/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/civic/components/ui/sheet';
import { ArrowLeft, Search, MessageSquare, Users, CalendarDays, AlertTriangle, UserPlus } from 'lucide-react';
import { Input } from '@/civic/components/ui/input';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/civic/components/ui/tabs';
import { useLanguage } from '@/civic/contexts/LanguageContext';
import { LastUpdated } from '@/civic/components/shared/LastUpdated';
import { SUGGEST_ENTRY_URL } from '@/civic/data/constants';

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

// Sidebar content component â€” Red Flags only
function SidebarContent({ searchQuery, setSearchQuery, filteredFlags }: {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filteredFlags: RedFlag[];
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search flags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <ScrollArea className="h-[400px]">
            {filteredFlags.length > 0 ? (
              filteredFlags.map((flag) => (
                <CompactRedFlagItem key={flag.id} flag={flag} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
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
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('calendar');
  const [leaderCategory, setLeaderCategory] = useState<string>('all');
  const [eventType, setEventType] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const filteredFlags = redFlags.filter(flag => 
    flag.title.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flag.pattern.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flag.reality.en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLeaders = mentors.filter((leader: ExtendedLeaderProfile) => 
    leaderCategory === 'all' || leader.category === leaderCategory
  );

  const filteredEvents = conferences
    .filter(event => eventType === 'all' || event.type === eventType)
    .filter(event => {
      if (!selectedDate) return true;
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === selectedDate.toDateString();
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const eventDates = conferences.map(c => new Date(c.date));

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
  };

  const hasLeaders = mentors.length > 0;

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <section className="py-12 md:py-16 border-b border-border">
          <div className="container">
            <Button 
              variant="ghost" 
              className="mb-6 -ml-2"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Navigator
            </Button>

            <div className="max-w-2xl">
              <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
                Discovery
              </h1>
              <div className="h-1 w-16 bg-primary mb-6" />
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Explore events, connect with leaders, and verify claims in the UAE healthcare AI ecosystem.
              </p>
              <LastUpdated section="discovery" />
            </div>
          </div>
        </section>

        {/* Main content with sidebar */}
        <section className="py-8">
          <div className="container">
            {/* Mobile: Sheet trigger for sidebar */}
            <div className="lg:hidden mb-6">
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
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      filteredFlags={filteredFlags}
                    />
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>

            <div className="grid lg:grid-cols-[1fr_350px] gap-8">
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

                  {/* Events Calendar Tab */}
                  <TabsContent value="calendar">
                    <div className="mb-6">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                        Events Calendar
                      </p>
                      <div className="h-0.5 w-12 bg-primary mb-4" />
                      <p className="text-muted-foreground">
                        Conferences, meetups, and workshops in the UAE healthcare AI space.
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

                  {/* Thought Leaders Tab */}
                  <TabsContent value="leaders">
                    <div className="mb-6">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                        Thought Leaders
                      </p>
                      <div className="h-0.5 w-12 bg-primary mb-4" />
                      <p className="text-muted-foreground mb-6">
                        Connect with key voices shaping UAE healthcare AI.
                      </p>

                      {hasLeaders && (
                        <div className="flex flex-wrap gap-2">
                          {['all', 'clinical', 'investment', 'policy', 'tech', 'research'].map(cat => (
                            <Badge 
                              key={cat}
                              variant={leaderCategory === cat ? 'default' : 'outline'}
                              onClick={() => setLeaderCategory(cat)}
                              className="cursor-pointer rounded-none"
                            >
                              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {hasLeaders ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredLeaders.map((leader) => (
                            <MentorCard key={leader.id} mentor={leader} />
                          ))}
                        </div>
                        {filteredLeaders.length === 0 && (
                          <div className="text-center py-12">
                            <p className="text-muted-foreground">
                              No leaders in this category.
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
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
                    )}
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

              {/* Desktop: Sidebar */}
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <SidebarContent 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filteredFlags={filteredFlags}
                  />
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-12 border-t border-border">
          <div className="container">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                Have a tip?
              </p>
              <div className="h-0.5 w-8 bg-primary mb-4" />
              <p className="text-muted-foreground mb-4">
                If you've encountered a pattern not listed here, we'd like to hear about it.
                All submissions are verified before publishing.
              </p>
              <Button variant="outline">
                Submit a Red Flag
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

