
import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { ArrowRight, CalendarDays, Newspaper } from 'lucide-react';
import type { Event, NewsArticle } from '@/lib/types';
import { getEvents } from '@/services/event'; 
import { getNews } from '@/services/news';
import { getTranslations } from 'next-intl/server';

async function getFeaturedEvents(): Promise<Event[]> {
  const allEvents = await getEvents();
  return allEvents.slice(0, 3);
}

export default async function HomePage() {
  const t = await getTranslations('HomePage');
  const featuredEvents = await getFeaturedEvents();
  const newsArticles = await getNews();
  const highlightEvent = featuredEvents.length > 0 ? featuredEvents[0] : null;

  return (
    <div className="space-y-12">
      {highlightEvent && (
        <section className="relative rounded-lg overflow-hidden shadow-2xl">
          <Link href={`/events/${highlightEvent.id}`} className="block group cursor-pointer">
            <Image
              src={highlightEvent.bannerUrl || highlightEvent.imageUrl}
              alt={highlightEvent.name}
              width={1600}
              height={600}
              className="w-full h-[400px] md:h-[500px] object-cover"
              priority
              data-ai-hint="event banner"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:bg-black/50 transition-colors duration-300"></div>
            <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white">
              <h1 className="text-3xl md:text-5xl font-bold mb-2 drop-shadow-lg">{highlightEvent.name}</h1>
              <p className="text-lg md:text-xl mb-4 max-w-2xl drop-shadow-md">{highlightEvent.description.substring(0,150)}...</p>
              {/* The "Book Now" button has been removed as per user request. The entire banner is clickable. */}
            </div>
          </Link>
        </section>
      )}

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold text-foreground flex items-center">
            <CalendarDays className="mr-3 h-8 w-8 text-primary" />
            {t('upcomingEventsTitle')}
          </h2>
          <Button variant="outline" asChild>
            <Link href="/events">
              {t('viewAllEvents')} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {featuredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 bg-card text-card-foreground">
                <Link href={`/events/${event.id}`} className="block group">
                  <div className="relative h-48 w-full">
                    <Image
                      src={event.imageUrl}
                      alt={event.name}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint={`${event.eventType} event`}
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl group-hover:text-primary">{event.name}</CardTitle>
                    <CardDescription>{event.dates[0].date} - {event.location.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 h-16 overflow-hidden">{event.description.substring(0, 100)}...</p>
                    <div className="flex justify-between items-center">
                       <span className="text-sm font-semibold text-primary">{event.eventType}</span>
                       <Button variant="link" className="p-0 h-auto text-primary group-hover:underline">
                          {t('detailsButton')} <ArrowRight className="ml-1 h-4 w-4" />
                       </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">{t('noUpcomingEvents')}</p>
        )}
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
                    layout="fill"
                    objectFit="cover"
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
