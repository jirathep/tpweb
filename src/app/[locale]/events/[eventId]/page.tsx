
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Use from next/navigation for client components
import { useRouter } from '@/navigation'; // Use from '@/navigation' for locale-aware routing
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Clock, MapPin, Users, Tag, Loader2, ArrowLeft } from 'lucide-react';
import type { Event } from '@/lib/types';
import { getEventById } from '@/services/event';
import { useBooking } from '@/context/BookingContext';
import { useTranslations, useLocale } from 'next-intl';
import { format as formatDateFns, parseISO } from 'date-fns';
import { enUS, th } from 'date-fns/locale';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('EventDetailPage');
  const locale = useLocale();

  const eventId = params.eventId as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedEventDate, setSelectedEventDate] = useState<string>(''); // Store as "date|time"
  const [selectedRound, setSelectedRound] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { setBookingDetails } = useBooking();

  useEffect(() => {
    if (eventId) {
      getEventById(eventId)
        .then(data => {
          setEvent(data);
          if (data && data.dates.length > 0) {
            const firstDate = data.dates[0];
            setSelectedEventDate(`${firstDate.date}|${firstDate.time}`);
            if (firstDate.rounds && firstDate.rounds.length > 0) {
              setSelectedRound(firstDate.rounds[0]);
            }
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch event details:", err);
          setIsLoading(false);
        });
    }
  }, [eventId]);

  const handleDateChange = (value: string) => {
    setSelectedEventDate(value);
    const [date, time] = value.split('|');
    const newSelectedEventDateDetails = event?.dates.find(d => d.date === date && d.time === time);
    if (newSelectedEventDateDetails?.rounds && newSelectedEventDateDetails.rounds.length > 0) {
      setSelectedRound(newSelectedEventDateDetails.rounds[0]);
    } else {
      setSelectedRound(undefined);
    }
  };

  const handleProceedToSeats = () => {
    if (!event || !selectedEventDate) return;

    const [date, time] = selectedEventDate.split('|');
    const currentEventDateDetails = event.dates.find(d => d.date === date && d.time === time);

    if (!currentEventDateDetails) return;

    setBookingDetails(prev => ({
      ...prev,
      event: event,
      selectedEventDate: currentEventDateDetails,
      selectedRound: selectedRound,
      selectedSeats: [], 
      totalPrice: 0, 
    }));
    router.push(`/events/${eventId}/select-seats`);
  };
  
  const currentSelectedDateDetails = event?.dates.find(d => `${d.date}|${d.time}` === selectedEventDate);

  const getDateLocale = () => {
    return locale === 'th' ? th : enUS;
  };
  
  const formatEventDisplayDate = (dateStr: string, timeStr: string) => {
     try {
      const dateObj = parseISO(dateStr);
      // Using PPPP for full date with weekday, LL for month, dd for day, yyyy for year
      // Adjust format string as needed per locale if PPPP is not desired
      const formattedDate = formatDateFns(dateObj, 'PPPP', { locale: getDateLocale() });
      return `${formattedDate} ${t('atTime', { time: timeStr })}`;
    } catch (e) {
      console.error("Error formatting display date:", dateStr, e);
      return `${dateStr} ${t('atTime', { time: timeStr })}`;
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-destructive">{t('eventNotFoundTitle')}</h2>
        <p className="text-muted-foreground mt-2">{t('eventNotFoundDescription')}</p>
        <Button onClick={() => router.push('/events')} variant="outline" className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('backToEventsButton')}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button onClick={() => router.back()} variant="outline" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('backButton')}
      </Button>
      <Card className="overflow-hidden bg-card text-card-foreground shadow-xl">
        <div className="relative h-64 md:h-96 w-full">
          <Image
            src={event.imageUrl}
            alt={event.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority
            data-ai-hint={`${event.eventType} banner`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{event.name}</h1>
          </div>
        </div>
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-primary">{t('eventDetailsTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center"><MapPin className="mr-2 h-5 w-5 text-primary" /> {t('locationTitle')}</h3>
              <p className="text-muted-foreground">{event.location.name}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center"><Tag className="mr-2 h-5 w-5 text-primary" /> {t('eventTypeTitle')}</h3>
              <p className="text-muted-foreground">{event.eventType}</p>
            </div>
            {event.organizer && (
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center"><Users className="mr-2 h-5 w-5 text-primary" /> {t('organizerTitle')}</h3>
                <p className="text-muted-foreground">{event.organizer}</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary" /> {t('selectDateTimeTitle')}</h3>
            <Select value={selectedEventDate} onValueChange={handleDateChange}>
              <SelectTrigger className="w-full md:w-1/2 bg-background text-foreground">
                <SelectValue placeholder={t('selectDateTimePlaceholder')} />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground">
                {event.dates.map((d) => (
                  <SelectItem key={`${d.date}|${d.time}`} value={`${d.date}|${d.time}`}>
                    {formatEventDisplayDate(d.date, d.time)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentSelectedDateDetails?.rounds && currentSelectedDateDetails.rounds.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center"><Clock className="mr-2 h-5 w-5 text-primary" /> {t('selectRoundTitle')}</h3>
              <Select value={selectedRound} onValueChange={setSelectedRound}>
                <SelectTrigger className="w-full md:w-1/2 bg-background text-foreground">
                  <SelectValue placeholder={t('selectRoundPlaceholder')} />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground">
                  {currentSelectedDateDetails.rounds.map((round) => (
                    <SelectItem key={round} value={round}>
                      {round}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-6 bg-muted/30">
          <Button 
            size="lg" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleProceedToSeats}
            disabled={!selectedEventDate || (!!currentSelectedDateDetails?.rounds?.length && !selectedRound)}
          >
            {t('proceedToSeatsButton')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

