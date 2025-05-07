
'use client';
import { useState, useEffect } from 'react';
import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
const MAX_OTHER_NEWS_ARTICLES = 3;


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
          // Find first non-sold out event for highlight, or default to first if all are sold out
          const availableEvent = events.find(e => !e.soldOut) || events[0];
          setHighlightEvent(availableEvent);
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
  
  const formatNewsDate = (dateString: string) => {
    try {
      // Assuming news date might just be YYYY-MM-DD, add a default time if needed for consistent parsing
      // Or if it includes time, parseISO should handle it.
      // For the target format DD/MM/YYYY, HH:MM
      const dateObj = parseISO(dateString); // Assuming dateString is ISO or easily parsable
      return formatDateFns(dateObj, 'dd/MM/yyyy, HH:mm', { locale: getDateLocale() });
    } catch (e) {
      console.error("Error formatting news date:", dateString, e);
      return dateString; // fallback
    }
  };


  const getCategoryKey = (category: EventCategory) => {
    switch (category) {
      case 'All': return 'allEventsTab';
      case 'Concert': return 'concertsTab';
      case 'Performance': return 'performancesTab';
      case 'Sport': return 'sportsTab';
      case 'Exhibition': return 'exhibitionsTab';
      case 'Conference': return 'performancesTab'; 
      case 'Other': return 'uncategorized';
      default: return 'allEventsTab';
    }
  };

  const filteredEvents = selectedTab === 'All'
    ? allEvents
    : allEvents.filter(event => {
        if (selectedTab === 'Performance' && event.eventType === 'Conference') return true;
        return event.eventType === selectedTab;
      });

  const displayedEvents = filteredEvents.slice(0, MAX_EVENTS_PER_TAB);

  const featuredNewsArticle = newsArticles.length > 0 ? newsArticles[0] : null;
  const otherNewsArticles = newsArticles.slice(1, MAX_OTHER_NEWS_ARTICLES + 1);

  return (
    <div className="space-y-12">
      {highlightEvent && (
        <section className="relative rounded-lg overflow-hidden shadow-2xl">
          <Link href={`/events/${highlightEvent.id}`} className="block group cursor-pointer">
            <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px]">
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
            <div className="absolute bottom-0 left-0 p-4 md:p-8 text-white">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 md:mb-2 drop-shadow-lg">{highlightEvent.name}</h1>
              <p className="text-sm sm:text-base md:text-lg mb-2 md:mb-3 max-w-xl drop-shadow-md line-clamp-2 sm:line-clamp-3">{highlightEvent.description}</p>
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
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-5 bg-transparent p-0">
              {EVENT_CATEGORIES.filter(cat => cat !== 'Conference' && cat !== 'Other').map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className={cn(
                    "pb-2 text-muted-foreground data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none",
                     "text-xs sm:text-sm md:text-base"
                  )}
                >
                  {t(getCategoryKey(category))}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={selectedTab} className="mt-6">
              {isLoadingEvents ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {[...Array(MAX_EVENTS_PER_TAB)].map((_, i) => (
                    <Card key={i} className="animate-pulse bg-card border-none shadow-lg rounded-lg">
                        <div className="aspect-[4/5] bg-muted/50 rounded-t-lg"></div>
                        <CardContent className="p-2 space-y-1.5">
                        <div className="h-3 w-1/3 bg-muted/50 rounded"></div>
                        <div className="h-3 w-3/4 bg-muted/50 rounded"></div>
                        <div className="h-3 w-1/2 bg-muted/50 rounded"></div>
                        <div className="h-3 w-2/3 bg-muted/50 rounded"></div>
                        <div className="h-8 w-full bg-muted/50 rounded mt-1.5"></div>
                        </CardContent>
                    </Card>
                    ))}
                </div>
              ) : displayedEvents.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {displayedEvents.map((event) => (
                    <Card key={event.id} className="overflow-hidden bg-card text-card-foreground border-transparent shadow-lg flex flex-col rounded-lg">
                       <Link href={`/events/${event.id}`} className="block group flex flex-col h-full">
                        <div className="relative w-full aspect-[4/5]">
                          <Image
                            src={event.imageUrl}
                            alt={event.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                            className="object-cover rounded-t-lg"
                            data-ai-hint={`${event.eventType} event`}
                          />
                           {event.soldOut && (
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[130%] bg-destructive/90 text-destructive-foreground text-center py-0.5 font-bold text-[0.6rem] -rotate-[25deg] shadow-lg">
                                SOLD OUT
                            </div>
                            )}
                        </div>
                        <CardContent className="p-2 flex flex-col flex-grow">
                            <p className="text-[0.6rem] text-primary font-semibold mb-0.5">{formatEventCardDate(event)}</p>
                            <h3 className="text-xs font-semibold text-card-foreground mb-0.5 leading-tight h-7 overflow-hidden group-hover:text-primary">
                                {event.name}
                            </h3>
                            <div className="flex items-center text-[0.6rem] text-muted-foreground mb-1.5">
                                <MapPin className="h-2.5 w-2.5 mr-0.5 shrink-0" /> 
                                <span className="line-clamp-1">{event.location.name || t('unnamedLocation')}</span>
                            </div>
                            <div className="mt-auto">
                                {event.soldOut ? (
                                <Button variant="outline" size="sm" className="w-full h-8 text-xs border-foreground/70 text-foreground/70 cursor-not-allowed hover:bg-transparent hover:border-foreground hover:text-foreground" disabled>
                                    {t('soldOutButton')}
                                </Button>
                                ) : (
                                <Button size="sm" className="w-full h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
                                    <TicketIconLucide className="mr-1 h-3 w-3" />
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
          {newsArticles.length > 0 && (
             <Button variant="link" asChild className="text-primary hover:text-primary/80">
                <Link href="#"> {/* Replace # with actual news listing page if available */}
                    {t('viewAllNews')} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
             </Button>
          )}
        </div>
        {newsArticles.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {featuredNewsArticle && (
            <Link href="#" className="lg:col-span-2 block group relative rounded-lg overflow-hidden shadow-xl cursor-pointer min-h-[300px] sm:min-h-[400px]">
              <Image
                src={featuredNewsArticle.imageUrl || `https://picsum.photos/seed/${featuredNewsArticle.id}/800/600`}
                alt={featuredNewsArticle.title}
                fill
                sizes="(max-width: 1023px) 100vw, 66vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="featured news"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-4 md:p-6 text-white">
                <h3 className="text-lg md:text-xl font-bold mb-1 drop-shadow-md line-clamp-2">{featuredNewsArticle.title}</h3>
                <p className="text-xs md:text-sm text-gray-300 drop-shadow-sm">{formatNewsDate(featuredNewsArticle.date)}</p>
              </div>
            </Link>
          )}
          
          {otherNewsArticles.length > 0 && (
            <div className="lg:col-span-1 space-y-4">
              {otherNewsArticles.map((article) => (
                <Link href="#" key={article.id} className="block group bg-card text-card-foreground rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="flex">
                    <div className="w-1/3 relative aspect-square">
                       {article.imageUrl && (
                        <Image
                            src={article.imageUrl}
                            alt={article.title}
                            fill
                            sizes="33vw"
                            className="object-cover"
                            data-ai-hint="news thumbnail"
                        />
                        )}
                    </div>
                    <div className="w-2/3 p-3 flex flex-col justify-center">
                      <h4 className="text-xs sm:text-sm font-semibold text-card-foreground mb-1 leading-tight line-clamp-3 group-hover:text-primary">{article.title}</h4>
                      <p className="text-[0.6rem] sm:text-xs text-muted-foreground">{formatNewsDate(article.date)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
         ) : (
          <p className="text-muted-foreground text-center py-8">{t('noNews')}</p>
        )}
      </section>
    </div>
  );
}
