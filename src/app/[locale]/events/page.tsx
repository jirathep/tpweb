
'use client';

import type { ChangeEvent } from 'react';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, MapPinIcon, TagIcon, SearchIcon, ArrowRight, FilterIcon, XIcon, Loader2 } from 'lucide-react';
import type { Event } from '@/lib/types';
import { getEvents } from '@/services/event';
import { DatePicker } from '@/components/ui/date-picker'; 
import { useTranslations, useLocale } from 'next-intl';
import { format as formatDateFns, parseISO } from 'date-fns';
import { enUS, th } from 'date-fns/locale';


const ALL_FILTER_VALUE = "all"; 

export default function EventListingPage() {
  const t = useTranslations('EventListingPage');
  const locale = useLocale();
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState(ALL_FILTER_VALUE);
  const [selectedEventType, setSelectedEventType] = useState(ALL_FILTER_VALUE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      try {
        const events = await getEvents();
        setAllEvents(events);
        setFilteredEvents(events);
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadEvents();
  }, []);

  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    allEvents.forEach(event => locations.add(event.location.name || t('unnamedLocation')));
    return Array.from(locations).filter(loc => loc.trim() !== '');
  }, [allEvents, t]);

  const uniqueEventTypes = useMemo(() => {
    const types = new Set<string>();
    allEvents.forEach(event => types.add(event.eventType));
    return Array.from(types).filter(type => type.trim() !== '');
  }, [allEvents]);

  useEffect(() => {
    let events = allEvents;

    if (searchTerm) {
      events = events.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      events = events.filter(event =>
        event.dates.some(d => d.date === dateString)
      );
    }

    if (selectedLocation && selectedLocation !== ALL_FILTER_VALUE) {
      events = events.filter(event => (event.location.name || t('unnamedLocation')) === selectedLocation);
    }

    if (selectedEventType && selectedEventType !== ALL_FILTER_VALUE) {
      events = events.filter(event => event.eventType === selectedEventType);
    }

    setFilteredEvents(events);
  }, [searchTerm, selectedDate, selectedLocation, selectedEventType, allEvents, t]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDate(undefined);
    setSelectedLocation(ALL_FILTER_VALUE);
    setSelectedEventType(ALL_FILTER_VALUE);
  };

  const hasActiveFilters = 
    searchTerm || 
    selectedDate || 
    (selectedLocation && selectedLocation !== ALL_FILTER_VALUE) || 
    (selectedEventType && selectedEventType !== ALL_FILTER_VALUE);

  const getDateLocale = () => {
    return locale === 'th' ? th : enUS;
  };
  
  const formatEventDate = (dateStr: string) => {
    try {
      return formatDateFns(parseISO(dateStr), 'PPP', { locale: getDateLocale() });
    } catch (e) {
      console.error("Error formatting date:", dateStr, e);
      return dateStr; // fallback to original string if parsing fails
    }
  };


  return (
    <div className="space-y-8">
      <section className="bg-card p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-card-foreground">{t('title')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label htmlFor="search" className="text-sm font-medium text-muted-foreground">{t('searchLabel')}</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="search"
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 bg-background text-foreground"
              />
            </div>
          </div>
          <div className="space-y-1">
             <label htmlFor="date" className="text-sm font-medium text-muted-foreground">{t('dateLabel')}</label>
            <DatePicker date={selectedDate} setDate={setSelectedDate} buttonClassName="w-full bg-background text-foreground" placeholder={t('DatePicker.placeholder')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="location" className="text-sm font-medium text-muted-foreground">{t('locationLabel')}</label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger id="location" className="w-full bg-background text-foreground">
                <SelectValue placeholder={t('locationPlaceholder')} />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground">
                <SelectItem value={ALL_FILTER_VALUE}>{t('allLocations')}</SelectItem>
                {uniqueLocations.map(loc => (
                  <SelectItem key={loc} value={loc || `location-${loc}`}>
                    {loc || t('unnamedLocation')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label htmlFor="eventType" className="text-sm font-medium text-muted-foreground">{t('eventTypeLabel')}</label>
            <Select value={selectedEventType} onValueChange={setSelectedEventType}>
              <SelectTrigger id="eventType" className="w-full bg-background text-foreground">
                <SelectValue placeholder={t('eventTypePlaceholder')} />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground">
                <SelectItem value={ALL_FILTER_VALUE}>{t('allTypes')}</SelectItem>
                {uniqueEventTypes.map(type => (
                  <SelectItem key={type} value={type || `type-${type}`}>
                    {type || t('uncategorized')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
                <Button variant="ghost" onClick={clearFilters} className="text-primary">
                    <XIcon className="mr-2 h-4 w-4" /> {t('clearFilters')}
                </Button>
            </div>
        )}
      </section>

      <section>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-card">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-6 w-3/4 bg-muted rounded"></div>
                  <div className="h-4 w-1/2 bg-muted rounded mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-full bg-muted rounded mb-2"></div>
                  <div className="h-4 w-5/6 bg-muted rounded"></div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="h-4 w-1/4 bg-muted rounded"></div>
                    <div className="h-8 w-1/3 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 bg-card text-card-foreground">
                <Link href={`/events/${event.id}`} className="block group">
                  <div className="relative h-56 w-full">
                    <Image
                      src={event.imageUrl}
                      alt={event.name}
                      layout="fill"
                      objectFit="cover"
                       data-ai-hint={`${event.eventType} event poster`}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{event.name}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <CalendarIcon className="h-4 w-4 mr-1.5" /> {formatEventDate(event.dates[0].date)} {t('atTime', { time: event.dates[0].time})}
                    </div>
                     <div className="flex items-center text-sm text-muted-foreground">
                      <MapPinIcon className="h-4 w-4 mr-1.5" /> {event.location.name}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 h-20 overflow-hidden">{event.description.substring(0,120)}...</p>
                    <div className="flex justify-between items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                        <TagIcon className="h-3 w-3 mr-1" /> {event.eventType}
                      </span>
                      <Button variant="link" className="p-0 h-auto text-primary group-hover:underline">
                        {t('viewDetails')} <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FilterIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground">{t('noEventsFoundTitle')}</h3>
            <p className="text-muted-foreground mt-2">{t('noEventsFoundDescription')}</p>
            {isLoading &&  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mt-4" />}
          </div>
        )}
      </section>
    </div>
  );
}

// Helper to add "at" time, could be more sophisticated based on language rules
const messages = {
  en: {
    EventListingPage: {
      atTime: "at {time}"
    }
  },
  th: {
    EventListingPage: {
      atTime: "เวลา {time}"
    }
  }
};

declare global {
  interface IntlMessages {
    EventListingPage: typeof messages.en.EventListingPage;
  }
}
