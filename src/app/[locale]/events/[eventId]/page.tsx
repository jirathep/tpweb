
'use client';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter, Link } from '@/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CalendarDays,
  Clock,
  MapPin,
  Tag,
  Loader2,
  ArrowLeft,
  ChevronRight,
  Ticket,
  Heart,
  Share2,
  DollarSign,
  Info,
  CalendarClock
} from 'lucide-react';
import type { Event, EventDate, EventDateType } from '@/lib/types';
import { getEventById } from '@/services/event';
import { useBooking } from '@/context/BookingContext';
import { useTranslations, useLocale } from 'next-intl';
import { format as formatDateFns, parseISO, isSameDay } from 'date-fns';
import { enUS, th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";


interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  iconProps?: ComponentProps<typeof MapPin>; // Allows passing props like className
}

const InfoRow: React.FC<InfoRowProps> = ({ icon: Icon, label, value, iconProps }) => (
  <div className="flex items-start space-x-3">
    <Icon className={cn("h-5 w-5 text-primary mt-1", iconProps?.className)} {...iconProps} />
    <div>
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <div className="text-base text-foreground">{value}</div>
    </div>
  </div>
);


export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('EventDetailPage');
  const tHome = useTranslations('HomePage');
  const locale = useLocale();

  const eventId = params.eventId as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedShowDate, setSelectedShowDate] = useState<string>(''); // Store as "date|time"
  const [selectedRound, setSelectedRound] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { setBookingDetails } = useBooking();

  useEffect(() => {
    if (eventId) {
      getEventById(eventId)
        .then(data => {
          setEvent(data);
          if (data) {
            const firstShowDate = data.dates.find(d => d.type === 'show');
            if (firstShowDate) {
              setSelectedShowDate(`${firstShowDate.date}|${firstShowDate.time}`);
              if (firstShowDate.rounds && firstShowDate.rounds.length > 0) {
                setSelectedRound(firstShowDate.rounds[0]);
              }
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

  const handleShowDateChange = (value: string) => {
    setSelectedShowDate(value);
    const [date, time] = value.split('|');
    const newSelectedEventDateDetails = event?.dates.find(d => d.date === date && d.time === time && d.type === 'show');
    if (newSelectedEventDateDetails?.rounds && newSelectedEventDateDetails.rounds.length > 0) {
      setSelectedRound(newSelectedEventDateDetails.rounds[0]);
    } else {
      setSelectedRound(undefined);
    }
  };
  
  const handleProceedToSeats = () => {
    if (!event || !selectedShowDate) return;

    const [date, time] = selectedShowDate.split('|');
    const currentShowEventDateDetails = event.dates.find(d => d.date === date && d.time === time && d.type === 'show');

    if (!currentShowEventDateDetails) return;

    setBookingDetails(prev => ({
      ...prev,
      event: event,
      selectedEventDate: currentShowEventDateDetails, // This is the 'show' date
      selectedRound: selectedRound,
      selectedSeats: [],
      totalPrice: 0,
    }));
    router.push(`/events/${eventId}/select-seats`);
  };

  const getDateLocale = () => (locale === 'th' ? th : enUS);

  const formatEventDisplayDate = (dateStr: string, timeStr?: string, type?: EventDateType, endDateStr?: string, endTimeStr?: string) => {
    try {
      const dateObj = parseISO(dateStr);
      let formattedDate = formatDateFns(dateObj, 'PPPP', { locale: getDateLocale() });

      if (endDateStr && !isSameDay(dateObj, parseISO(endDateStr))) {
        const endDateObj = parseISO(endDateStr);
        formattedDate += ` - ${formatDateFns(endDateObj, 'PPPP', { locale: getDateLocale() })}`;
      }
      
      let fullDisplay = formattedDate;
      if (timeStr) {
         fullDisplay += ` ${t('atTime', { time: timeStr })}`;
      }
      if (endTimeStr && endDateStr && isSameDay(dateObj, parseISO(endDateStr))) {
         fullDisplay += ` - ${endTimeStr}`;
      }


      return fullDisplay;
    } catch (e) {
      console.error("Error formatting display date:", dateStr, e);
      let fallback = dateStr;
      if (timeStr) fallback += ` ${t('atTime', { time: timeStr })}`;
      return fallback;
    }
  };
  
  const getTicketStatusText = (status?: Event['ticketStatus']) => {
    if (!status) return t('ticketStatusUnavailable');
    switch (status) {
      case 'coming_soon': return t('ticketStatusComingSoon');
      case 'on_sale': return t('ticketStatusOnSale');
      case 'sold_out': return t('ticketStatusSoldOut');
      case 'off_sale': return t('ticketStatusOffSale');
      default: return t('ticketStatusUnavailable');
    }
  };

  const getTicketStatusColor = (status?: Event['ticketStatus']) => {
    if (!status) return 'text-muted-foreground';
    switch (status) {
      case 'coming_soon': return 'text-yellow-500';
      case 'on_sale': return 'text-green-500';
      case 'sold_out': return 'text-red-500';
      case 'off_sale': return 'text-gray-500';
      default: return 'text-muted-foreground';
    }
  };
  
  const getBreadcrumbCategoryName = (category: Event['eventType']) => {
    switch(category){
      case "Concert": return t('breadcrumbConcerts');
      case "Performance": return t('breadcrumbPerformances');
      case "Sport": return t('breadcrumbSports');
      case "Exhibition": return t('breadcrumbExhibitions');
      case "Conference": return t('breadcrumbConferences');
      default: return t('breadcrumbOther');
    }
  }

  const bookableShowDates = event?.dates.filter(d => d.type === 'show') || [];
  const presaleDates = event?.dates.filter(d => d.type === 'presale_general' || d.type === 'presale_nightrain') || [];
  const onsaleDates = event?.dates.filter(d => d.type === 'onsale_public') || [];
  const currentSelectedShowDateDetails = bookableShowDates.find(d => `${d.date}|${d.time}` === selectedShowDate);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-300px)]">
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
    <div className="max-w-6xl mx-auto">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">{t('breadcrumbHome')}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/events">{t('breadcrumbEvents')}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
             <BreadcrumbPage>{getBreadcrumbCategoryName(event.eventType)}</BreadcrumbPage>
          </BreadcrumbItem>
           <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="truncate max-w-[200px] md:max-w-none">{event.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="overflow-hidden bg-card text-card-foreground shadow-xl border-none">
        <CardContent className="p-0 md:p-6 flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Left Column: Image */}
          <div className="w-full md:w-1/3 flex-shrink-0">
            <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-lg">
              <Image
                src={event.imageUrl} // Poster-like image
                alt={event.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
                priority
                data-ai-hint={`${event.eventType} poster`}
              />
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="w-full md:w-2/3 p-6 md:p-0 space-y-6">
            <p className="text-sm text-primary font-semibold">{tHome(getCategoryKeyForTranslation(event.eventType) as any)}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">{event.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {bookableShowDates.length > 0 && (
                 <InfoRow icon={CalendarDays} label={t('showDatesTitle')} value={
                  <ul className="space-y-1">
                    {bookableShowDates.map(d => (
                      <li key={`${d.date}|${d.time}`}>{formatEventDisplayDate(d.date, d.time, d.type)}
                        {d.gateOpenTime && <span className="text-xs text-muted-foreground ml-1">({t('gateOpenTitle')} {d.gateOpenTime})</span>}
                      </li>
                    ))}
                  </ul>
                 }/>
              )}
               <InfoRow icon={MapPin} label={t('locationTitle')} value={event.location.name} />
            </div>

            {presaleDates.length > 0 && (
               <InfoRow icon={CalendarClock} label={t('presaleDatesTitle')} value={
                <ul className="space-y-1">
                  {presaleDates.map((d, idx) => (
                    <li key={`presale-${idx}`}>{d.label ? `${d.label}: ` : ''}{formatEventDisplayDate(d.date, d.time, d.type, d.endDate, d.endTime)}</li>
                  ))}
                </ul>
               }/>
            )}

            {onsaleDates.length > 0 && (
              <InfoRow icon={Ticket} label={t('onsaleDatesTitle')} value={
                <ul className="space-y-1">
                  {onsaleDates.map((d, idx) => (
                     <li key={`onsale-${idx}`}>{d.label ? `${d.label}: ` : ''}{formatEventDisplayDate(d.date, d.time, d.type, d.endDate, d.endTime)}</li>
                  ))}
                </ul>
              }/>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {event.priceRangeDisplay && event.priceRangeDisplay.length > 0 ? (
                <InfoRow icon={DollarSign} label={t('priceTiersTitle')} value={
                  <ul className="space-y-0.5">
                    {event.priceRangeDisplay.map((tier, idx) => <li key={idx}>{tier}</li>)}
                  </ul>
                }/>
              ) : (
                 <InfoRow icon={DollarSign} label={t('priceTiersTitle')} value={t('noPriceInfo')}/>
              )}
              {event.ticketStatus && (
                <InfoRow icon={Info} label={t('ticketStatusTitle')} value={
                  <span className={cn("font-semibold", getTicketStatusColor(event.ticketStatus))}>
                    {getTicketStatusText(event.ticketStatus)}
                  </span>
                }/>
              )}
            </div>
            
            {bookableShowDates.length > 0 && (
            <div className="space-y-3 pt-4">
              <h3 className="text-lg font-semibold flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary" /> {t('selectDateTimeTitle')}</h3>
              <Select value={selectedShowDate} onValueChange={handleShowDateChange}>
                <SelectTrigger className="w-full md:w-2/3 bg-background text-foreground">
                  <SelectValue placeholder={t('selectDateTimePlaceholder')} />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground">
                  {bookableShowDates.map((d) => (
                    <SelectItem key={`${d.date}|${d.time}`} value={`${d.date}|${d.time}`}>
                       {d.label ? `${d.label}: ` : t('bookableShowDate')}: {formatEventDisplayDate(d.date, d.time, d.type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {currentSelectedShowDateDetails?.rounds && currentSelectedShowDateDetails.rounds.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold flex items-center mt-2"><Clock className="mr-2 h-5 w-5 text-primary" /> {t('selectRoundTitle')}</h3>
                  <Select value={selectedRound} onValueChange={setSelectedRound}>
                    <SelectTrigger className="w-full md:w-2/3 bg-background text-foreground">
                      <SelectValue placeholder={t('selectRoundPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground">
                      {currentSelectedShowDateDetails.rounds.map((round) => (
                        <SelectItem key={round} value={round}>
                          {round}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
            )}


            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                size="lg"
                className="w-full sm:w-auto flex-grow bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleProceedToSeats}
                disabled={
                  !selectedShowDate || 
                  (!!currentSelectedShowDateDetails?.rounds?.length && !selectedRound) || 
                  event.ticketStatus === 'sold_out' || 
                  event.ticketStatus === 'coming_soon' ||
                  event.ticketStatus === 'off_sale' ||
                  event.ticketStatus === 'unavailable'
                }
              >
                <Ticket className="mr-2 h-5 w-5" /> 
                {event.ticketStatus === 'sold_out' ? tHome('soldOutButton') : t('proceedToSeatsButton')}
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Heart className="mr-2 h-5 w-5" /> {t('addToWishlistButton')}
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Share2 className="mr-2 h-5 w-5" /> {t('shareButton')}
              </Button>
            </div>

            {event.description && (
              <div className="pt-4">
                <h2 className="text-xl font-semibold mb-2 text-primary">{t('eventDetailsTitle')}</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{event.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper for HomePage translations, move to a shared place if used elsewhere
const getCategoryKeyForTranslation = (category: EventCategory) => {
    switch (category) {
      case 'All': return 'allEventsTab';
      case 'Concert': return 'concertsTab';
      case 'Performance': return 'performancesTab';
      case 'Sport': return 'sportsTab';
      case 'Exhibition': return 'exhibitionsTab';
      case 'Conference': return 'performancesTab'; // Assuming Conference maps to performances for now
      case 'Other': return 'uncategorized'; 
      default: return 'allEventsTab';
    }
};
