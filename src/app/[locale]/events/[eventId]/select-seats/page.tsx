
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/navigation'; // Use from '@/navigation' for locale-aware routing
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Armchair, Loader2, Users, Info } from 'lucide-react';
import type { SeatingLayout, Zone, Seat, SelectedSeatInfo } from '@/lib/types';
import { getSeatingLayoutByEventId } from '@/services/event';
import { useBooking } from '@/context/BookingContext';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslations, useLocale } from 'next-intl';
import { format as formatDateFns, parseISO } from 'date-fns';
import { enUS, th } from 'date-fns/locale';

const MAX_SEATS_SELECTABLE = 10;

export default function SelectSeatsPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('SelectSeatsPage');
  const locale = useLocale();
  const eventId = params.eventId as string;
  const { bookingDetails, setBookingDetails } = useBooking();
  
  const [seatingLayout, setSeatingLayout] = useState<SeatingLayout | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [localSelectedSeats, setLocalSelectedSeats] = useState<SelectedSeatInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingDetails || !bookingDetails.event || !bookingDetails.selectedEventDate) {
      router.replace(`/events/${eventId}`);
      return;
    }

    getSeatingLayoutByEventId(eventId)
      .then(layout => {
        setSeatingLayout(layout);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch seating layout:", err);
        setError(t('couldNotLoadSeatingError'));
        setIsLoading(false);
      });
    
    setLocalSelectedSeats(bookingDetails.selectedSeats || []);

  }, [eventId, bookingDetails, router, t]);

  const handleZoneClick = (zone: Zone) => {
    setSelectedZone(zone);
  };

  const handleSeatClick = (seat: Seat, zone: Zone) => {
    if (seat.status === 'unavailable' || seat.status === 'locked') return;

    const seatIdentifier = `${zone.id}-${seat.id}`;
    const existingSeatIndex = localSelectedSeats.findIndex(s => `${s.zoneId}-${s.seatId}` === seatIdentifier);

    if (existingSeatIndex > -1) {
      setLocalSelectedSeats(prev => prev.filter((_, index) => index !== existingSeatIndex));
    } else {
      if (localSelectedSeats.length >= MAX_SEATS_SELECTABLE) {
        alert(t('maxSeatsAlert', {maxSeats: MAX_SEATS_SELECTABLE}));
        return;
      }
      setLocalSelectedSeats(prev => [
        ...prev,
        {
          zoneId: zone.id,
          zoneName: zone.name,
          seatId: seat.id,
          seatNumber: seat.seatNumber,
          price: seat.price,
        },
      ]);
    }
  };

  const calculateTotalPrice = () => {
    return localSelectedSeats.reduce((total, seat) => total + seat.price, 0);
  };

  const handleProceedToSummary = () => {
    if (!bookingDetails) return;
    setBookingDetails({
      ...bookingDetails,
      selectedSeats: localSelectedSeats,
      totalPrice: calculateTotalPrice(),
    });
    router.push(`/events/${eventId}/summary`);
  };

  const getSeatColor = (seat: Seat) => {
    const isSelected = localSelectedSeats.some(s => s.zoneId === selectedZone?.id && s.seatId === seat.id);
    if (isSelected) return 'bg-primary text-primary-foreground';
    if (seat.status === 'unavailable' || seat.status === 'locked') return 'bg-muted text-muted-foreground cursor-not-allowed';
    
    switch (seat.priceTier) {
      case 'premium': return 'bg-yellow-400 hover:bg-yellow-500 text-black';
      case 'standard': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'economy': return 'bg-blue-500 hover:bg-blue-600 text-white';
      default: return 'bg-accent hover:bg-accent/80 text-accent-foreground';
    }
  };

  const getDateLocale = () => {
    return locale === 'th' ? th : enUS;
  };

  const formatDisplayDate = (dateStr: string) => {
    try {
      return formatDateFns(parseISO(dateStr), 'PPPP', { locale: getDateLocale() });
    } catch (e) {
      return dateStr;
    }
  };

  const getSeatStatusText = (status: Seat['status']) => {
    switch (status) {
      case 'available': return t('statusAvailable');
      case 'unavailable': return t('statusUnavailable');
      case 'selected': return t('statusSelected');
      case 'locked': return t('statusLocked');
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-xl text-destructive">{error}</p>
        <Button onClick={() => router.back()} variant="outline" className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('goBackButton')}
        </Button>
      </div>
    );
  }

  if (!seatingLayout || !bookingDetails || !bookingDetails.event) {
     return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">{t('seatingInfoNotAvailable')}</h2>
         <Button onClick={() => router.back()} variant="outline" className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('goBackButton')}
        </Button>
      </div>
    );
  }
  
  const stagePosition = seatingLayout.stagePosition || { top: "0%", left: "50%", width: "30%", height:"10%" };


  return (
    <TooltipProvider>
    <div className="max-w-6xl mx-auto space-y-6">
      <Button onClick={() => router.back()} variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('backButton')}
      </Button>

      <Card className="bg-card text-card-foreground shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">{t('pageTitle', {eventName: bookingDetails.event.name})}</CardTitle>
          <CardDescription>
            {t('eventDatePrefix')} {formatDisplayDate(bookingDetails.selectedEventDate.date)} {locale === 'th' ? 'เวลา' : 'at'} {bookingDetails.selectedEventDate.time}
            {bookingDetails.selectedRound && `, ${t('roundPrefix')} ${bookingDetails.selectedRound}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold">{t('zoneMapTitle')}</h3>
             <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>{t('instructionsTitle')}</AlertTitle>
              <AlertDescription>
                {t('instructionsDescription')}
              </AlertDescription>
            </Alert>
            <div className="relative bg-muted/30 p-4 rounded-lg aspect-square w-full overflow-hidden border border-border">
              <div 
                className="absolute bg-foreground text-background text-xs flex items-center justify-center rounded shadow-md"
                style={{
                    top: stagePosition.top || 'auto',
                    bottom: stagePosition.bottom || 'auto',
                    left: stagePosition.left ? `calc(${stagePosition.left} - (${stagePosition.width}/2))` : 'auto',
                    right: stagePosition.right || 'auto',
                    width: stagePosition.width || '30%',
                    height: stagePosition.height || '10%',
                    transform: stagePosition.left && !stagePosition.right ? 'translateX(-50%)' : 'none'
                }}
                 data-ai-hint="event stage"
              >
                {t('stageLabel')}
              </div>
              {seatingLayout.zones.map(zone => (
                <button
                  key={zone.id}
                  onClick={() => handleZoneClick(zone)}
                  className={cn(
                    "absolute border-2 text-xs flex items-center justify-center rounded hover:ring-2 hover:ring-primary focus:ring-2 focus:ring-primary transition-all duration-150 ease-in-out",
                    selectedZone?.id === zone.id ? 'bg-primary/80 border-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-card' : 'bg-accent/50 border-accent text-accent-foreground hover:bg-primary/60',
                    "shadow-md" 
                  )}
                  style={{ 
                    top: zone.mapPosition?.top, 
                    left: zone.mapPosition?.left,
                    width: zone.mapPosition?.width,
                    height: zone.mapPosition?.height,
                  }}
                  aria-label={`Select zone ${zone.name}`}
                  data-ai-hint="seating zone"
                >
                  {zone.name}
                </button>
              ))}
            </div>
              <div className="mt-4 space-y-2">
                <h4 className="text-md font-semibold">{t('legendTitle')}</h4>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-yellow-400"></div><span>{t('legendPremium')}</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-500"></div><span>{t('legendStandard')}</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-500"></div><span>{t('legendEconomy')}</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-primary"></div><span>{t('legendSelected')}</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-muted"></div><span>{t('legendUnavailable')}</span></div>
              </div>
          </div>

          <div className="md:col-span-2">
            {selectedZone ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('seatsInZoneTitle', {zoneName: selectedZone.name})}</h3>
                <div className="bg-muted/30 p-4 rounded-lg overflow-x-auto">
                  <div className="inline-block min-w-full">
                  {selectedZone.seats.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center mb-1 space-x-1">
                      {row.map(seat => (
                        <Tooltip key={seat.id} delayDuration={100}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleSeatClick(seat, selectedZone)}
                              className={cn(
                                "w-8 h-8 flex items-center justify-center rounded text-xs font-medium transition-colors",
                                getSeatColor(seat),
                                seat.aisle ? "opacity-0 pointer-events-none" : ""
                              )}
                              disabled={seat.status === 'unavailable' || seat.status === 'locked' || (localSelectedSeats.length >= MAX_SEATS_SELECTABLE && !localSelectedSeats.some(s => s.zoneId === selectedZone?.id && s.seatId === seat.id))}
                              aria-label={t('seatTooltipSeat', {seatNumber: seat.seatNumber}) + `, ` + t('seatTooltipPrice', {price: seat.price.toFixed(2)}) + `, ` + t('seatTooltipStatus', {status: getSeatStatusText(localSelectedSeats.some(s => s.zoneId === selectedZone?.id && s.seatId === seat.id) ? 'selected' : seat.status)})}
                            >
                              <Armchair className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          {!seat.aisle && (
                            <TooltipContent className="bg-popover text-popover-foreground">
                              <p>{t('seatTooltipSeat', {seatNumber: seat.seatNumber})}</p>
                              <p>{t('seatTooltipPrice', {price: seat.price.toFixed(2)})}</p>
                              <p>{t('seatTooltipStatus', {status: getSeatStatusText(localSelectedSeats.some(s => s.zoneId === selectedZone?.id && s.seatId === seat.id) ? 'selected' : seat.status)})}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      ))}
                    </div>
                  ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-muted/30 p-4 rounded-lg text-center">
                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground">{t('selectZonePromptTitle')}</p>
                <p className="text-sm text-muted-foreground">{t('selectZonePromptDescription')}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-6 bg-muted/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-left">
             <p className="text-lg font-semibold text-card-foreground">{t('selectedSeatsLabel', {count: localSelectedSeats.length})}</p>
             <p className="text-xl font-bold text-primary">{t('totalPriceLabel', {price: calculateTotalPrice().toFixed(2)})}</p>
          </div>
          <Button 
            size="lg" 
            onClick={handleProceedToSummary} 
            disabled={localSelectedSeats.length === 0}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {t('proceedToSummaryButton')}
          </Button>
        </CardFooter>
      </Card>
    </div>
    </TooltipProvider>
  );
}

