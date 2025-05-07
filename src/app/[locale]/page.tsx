
'use client';
import { useState, useEffect } from 'react';
import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { ArrowRight, Newspaper, MapPin, Ticket as TicketIconLucide } from 'lucide-react';
import type { Event, NewsArticle, EventCategory } from '@/lib/types';
import { getEvents } from '@/services/event';
import { getNews } from '@/services/news';
import { useTranslations, useLocale } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format as formatDateFns, parseISO } from 'date-fns';
import { enUS, th } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const EVENT_CATEGORIES: EventCategory[] = ['All', 'Concert', 'Performance', 'Sport', 'Exhibition', 'Conference'];
const MAX_EVENTS_PER_TAB = 5;


export default function HomePage() {
  const t = useTranslations('HomePage');
  const locale = useLocale();
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [highlightEvent, setHighlightEvent] = useState<Event | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [selectedTab, setSelectedTab] = useState<EventCategory>('All');

  useEffect(() => {
    async function fetchData() {
      setIsLoadingEvents(true);
      try {
        const events = await getEvents();
        setAllEvents(events);
        if (events.length > 0) {
          setHighlightEvent(events[0]);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoadingEvents(false);
      }

      try {
        const news = await getNews();
        setNewsArticles(news);
      } catch (error) {
        console.error("Failed to fetch news:", error)
      }
    }
    fetchData();
  }, []);

  const getDateLocale = () => (locale === 'th' ? th : enUS);

  const formatEventCardDate = (event: Event) => {
    if (!event.dates || event.dates.length === 0) return '';
    
    const formatDate = (dateStr: string) => {
      try {
        return formatDateFns(parseISO(dateStr), 'dd.MM.yyyy', { locale: getDateLocale() });
      } catch {
        return dateStr;
      }
    };

    const sortedDates = [...event.dates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (sortedDates.length === 1) {
      return formatDate(sortedDates[0].date);
    }
    
    const firstDate = formatDate(sortedDates[0].date);
    const lastDate = formatDate(sortedDates[sortedDates.length - 1].date);

    if (firstDate === lastDate) { // Multiple times on the same day
        return firstDate;
    }
    
    return t('eventDateRange', { startDate: firstDate, endDate: lastDate });
  };

  const getCategoryKey = (category: EventCategory) => {
    switch (category) {
      case 'All': return 'allEventsTab';
      case 'Concert': return 'concertsTab';
      case 'Performance': return 'performancesTab';
      case 'Sport': return 'sportsTab';
      case 'Exhibition': return 'exhibitionsTab';
      case 'Conference': return 'performancesTab'; // Mapping conference to performance as per image
      default: return 'allEventsTab';
    }
  };

  const filteredEvents = selectedTab === 'All'
    ? allEvents
    : allEvents.filter(event => {
        if (selectedTab === 'Performance' && event.eventType === 'Conference') return true; // Map Conference to Performance tab
        return event.eventType === selectedTab;
      });

  const displayedEvents = filteredEvents.slice(0, MAX_EVENTS_PER_TAB);

  return (
    <div className="space-y-12">
      {highlightEvent && (
        <section className="relative rounded-lg overflow-hidden shadow-2xl">
          <Link href={`/events/${highlightEvent.id}`} className="block group cursor-pointer">
            <div className="relative w-full h-[400px] md:h-[500px]">
              <Image
                src={highlightEvent.bannerUrl || highlightEvent.imageUrl}
                alt={highlightEvent.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1600px"
                className="object-cover"
                priority
                data-ai-hint="event banner"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:bg-black/50 transition-colors duration-300"></div>
            <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white">
              <h1 className="text-3xl md:text-5xl font-bold mb-2 drop-shadow-lg">{highlightEvent.name}</h1>
              <p className="text-lg md:text-xl mb-4 max-w-2xl drop-shadow-md">{highlightEvent.description.substring(0,150)}...</p>
            </div>
          </Link>
        </section>
      )}

      <section>
        <div className="mb-6">
          <div className="flex items-baseline gap-4 mb-2">
            <h2 className="text-2xl font-bold text-foreground">{t('popularEvents')}</h2>
            <h3 className="text-xl font-semibold text-muted-foreground">{t('newlyAddedEvents')}</h3>
          </div>
          <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as EventCategory)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 bg-transparent p-0">
              {EVENT_CATEGORIES.filter(cat => cat !== 'Conference' && cat !== 'Other').map((category) => ( // Hide conference from tabs
                <TabsTrigger
                  key={category}
                  value={category}
                  className={cn(
                    "pb-2 text-muted-foreground data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none",
                     "text-sm md:text-base"
                  )}
                >
                  {t(getCategoryKey(category))}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={selectedTab} className="mt-6">
              {isLoadingEvents ? (
                <p className="text-muted-foreground">{t('noUpcomingEvents')}</p> // Placeholder for loading state
              ) : displayedEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {displayedEvents.map((event) => (
                    <Card key={event.id} className="overflow-hidden bg-card text-card-foreground border-none shadow-lg flex flex-col">
                       <Link href={`/events/${event.id}`} className="block group flex flex-col h-full">
                        <div className="relative w-full aspect-[4/5]">
                          <Image
                            src={event.imageUrl}
                            alt={event.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            className="object-cover rounded-t-md"
                            data-ai-hint={`${event.eventType} event`}
                          />
                          {event.soldOut && (
                            <div className="absolute top-1/2 left-0 right-0 bg-destructive/80 text-destructive-foreground text-center py-2 font-bold text-lg -rotate-12 transform -translate-y-1/2">
                              SOLD OUT
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3 flex flex-col flex-grow">
                          <p className="text-xs text-primary font-semibold mb-1">{formatEventCardDate(event)}</p>
                          <h3 className="text-sm font-semibold mb-1 leading-tight h-10 overflow-hidden group-hover:text-primary">
                            {event.name}
                          </h3>
                          <div className="flex items-start text-xs text-muted-foreground mb-3">
                            <MapPin className="h-3 w-3 mr-1 mt-0.5 shrink-0" /> 
                            <span className="line-clamp-2">{event.location.name}</span>
                          </div>
                          <div className="mt-auto">
                            {event.soldOut ? (
                              <Button variant="outline" className="w-full border-foreground/50 text-foreground/70 cursor-not-allowed" disabled>
                                {t('soldOutButton')}
                              </Button>
                            ) : (
                              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                                <TicketIconLucide className="mr-2 h-4 w-4" />
                                {t('buyTicketsButton')}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">{t('noUpcomingEvents')}</p>
              )}
            </TabsContent>
          </Tabs>
           <div className="mt-8 flex justify-center">
            <Button variant="outline" asChild>
              <Link href="/events">
                {t('viewAllEvents')} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section>
         <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold text-foreground flex items-center">
            <Newspaper className="mr-3 h-8 w-8 text-primary" />
            {t('latestNewsTitle')}
          </h2>
        </div>
        {newsArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {newsArticles.map((article) => (
            <Card key={article.id} className="flex flex-col md:flex-row overflow-hidden hover:shadow-xl transition-shadow duration-300 bg-card text-card-foreground">
              {article.imageUrl && (
                <div className="md:w-1/3 w-full h-48 md:h-auto relative">
                   <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                    data-ai-hint="news article"
                  />
                </div>
              )}
              <div className={`p-6 ${article.imageUrl ? 'md:w-2/3' : 'w-full'}`}>
                <CardTitle className="text-lg mb-2">{article.title}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mb-2">{article.date}</CardDescription>
                <p className="text-sm text-muted-foreground mb-3">{article.summary}</p>
                <Button variant="link" className="p-0 h-auto text-primary">
                  {t('readMoreButton')} <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
         ) : (
          <p className="text-muted-foreground">{t('noNews')}</p>
        )}
      </section>
    </div>
  );
}

