
'use client';

import type { ChangeEvent } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Link } from '@/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, MapPinIcon, TagIcon, SearchIcon, ArrowRight, FilterIcon, XIcon, Loader2, Ticket } from 'lucide-react';
import type { Event, EventCategory } from '@/lib/types';
import { getEvents } from '@/services/event';
import { DatePicker } from '@/components/ui/date-picker'; 
import { useTranslations, useLocale } from 'next-intl';
import { format as formatDateFns, parseISO } from 'date-fns';
import { enUS, th } from 'date-fns/locale';


const ALL_FILTER_VALUE = "All"; 
const EVENT_CATEGORIES_FOR_FILTER: EventCategory[] = ['All', 'Concert', 'Performance', 'Sport', 'Exhibition', 'Conference', 'Other'];


export default function EventListingPage() {
  const t = useTranslations('EventListingPage');
  const tHome = useTranslations('HomePage'); // For tab names
  const locale = useLocale();
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState(ALL_FILTER_VALUE);
  const [selectedEventType, setSelectedEventType] = useState<EventCategory>(ALL_FILTER_VALUE as EventCategory);
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

  // Use EVENT_CATEGORIES_FOR_FILTER for the select dropdown
  const eventTypesForFilter = useMemo(() => {
    return EVENT_CATEGORIES_FOR_FILTER;
  }, []);


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
    setSelectedEventType(ALL_FILTER_VALUE as EventCategory);
  };

  const hasActiveFilters = 
    searchTerm || 
    selectedDate || 
    (selectedLocation && selectedLocation !== ALL_FILTER_VALUE) || 
    (selectedEventType && selectedEventType !== ALL_FILTER_VALUE);

  const getDateLocale = () => {
    return locale === 'th' ? th : enUS;
  };
  
  const formatEventListDate = (event: Event) => {
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
      return `${formatDate(sortedDates[0].date)} ${t('atTime', { time: sortedDates[0].time})}`;
    }
    
    const firstDate = formatDate(sortedDates[0].date);
    const lastDate = formatDate(sortedDates[sortedDates.length - 1].date);
    
    if (firstDate === lastDate) {
        return `${firstDate} ${t('atTime', { time: sortedDates[0].time})}`; // Show first time if multiple on same day
    }

    return tHome('eventDateRange', { startDate: firstDate, endDate: lastDate });
  };
  
  const getCategoryKeyForTranslation = (category: EventCategory) => {
    switch (category) {
      case 'All': return 'allEventsTab';
      case 'Concert': return 'concertsTab';
      case 'Performance': return 'performancesTab';
      case 'Sport': return 'sportsTab';
      case 'Exhibition': return 'exhibitionsTab';
      case 'Conference': return 'performancesTab'; // Assuming Conference maps to a general performance/show tab
      case 'Other': return 'uncategorized'; // Or a specific "Other" translation if available
      default: return 'allTypes';
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
                  <SelectItem key={loc} value={loc}>
                    {loc || t('unnamedLocation')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label htmlFor="eventType" className="text-sm font-medium text-muted-foreground">{t('eventTypeLabel')}</label>
            <Select value={selectedEventType} onValueChange={(value) => setSelectedEventType(value as EventCategory)}>
              <SelectTrigger id="eventType" className="w-full bg-background text-foreground">
                <SelectValue placeholder={t('eventTypePlaceholder')} />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground">
                {eventTypesForFilter.map(type => (
                  <SelectItem key={type} value={type}>
                    {type === ALL_FILTER_VALUE ? t('allTypes') : tHome(getCategoryKeyForTranslation(type))}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-card border-none shadow-lg">
                <div className="aspect-[4/5] bg-muted rounded-t-md"></div>
                <CardContent className="p-3 space-y-2">
                  <div className="h-4 w-1/4 bg-muted rounded"></div>
                  <div className="h-5 w-3/4 bg-muted rounded"></div>
                  <div className="h-4 w-1/2 bg-muted rounded"></div>
                  <div className="h-9 w-full bg-muted rounded mt-2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden bg-card text-card-foreground border-none shadow-lg flex flex-col">
                <Link href={`/events/${event.id}`} className="block group flex flex-col h-full">
                  <div className="relative w-full aspect-[4/5]">
                    <Image
                      src={event.imageUrl}
                      alt={event.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                      className="object-cover rounded-t-md"
                       data-ai-hint={`${event.eventType} event poster`}
                    />
                     {event.soldOut && (
                        <div className="absolute top-1/2 left-0 right-0 bg-destructive/80 text-destructive-foreground text-center py-2 font-bold text-lg -rotate-12 transform -translate-y-1/2">
                          SOLD OUT
                        </div>
                      )}
                  </div>
                  <CardContent className="p-3 flex flex-col flex-grow">
                      <p className="text-xs text-primary font-semibold mb-1">{formatEventListDate(event)}</p>
                      <h3 className="text-sm font-semibold mb-1 leading-tight h-10 overflow-hidden group-hover:text-primary">
                        {event.name}
                      </h3>
                      <div className="flex items-start text-xs text-muted-foreground mb-3">
                        <MapPinIcon className="h-3 w-3 mr-1 mt-0.5 shrink-0" /> 
                        <span className="line-clamp-2">{event.location.name}</span>
                      </div>
                      <div className="mt-auto">
                        {event.soldOut ? (
                          <Button variant="outline" className="w-full border-foreground/50 text-foreground/70 cursor-not-allowed" disabled>
                            {tHome('soldOutButton')}
                          </Button>
                        ) : (
                          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                             <Ticket className="mr-2 h-4 w-4" />
                            {tHome('buyTicketsButton')}
                          </Button>
                        )}
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

