'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Armchair, Loader2, Users, Info } from 'lucide-react';
import type { SeatingLayout, Zone, Seat, SelectedSeatInfo } from '@/lib/types';
import { getSeatingLayoutByEventId } from '@/services/event';
import { useBooking } from '@/context/BookingContext';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MAX_SEATS_SELECTABLE = 10;

export default function SelectSeatsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { bookingDetails, setBookingDetails } = useBooking();
  
  const [seatingLayout, setSeatingLayout] = useState<SeatingLayout | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [localSelectedSeats, setLocalSelectedSeats] = useState<SelectedSeatInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if bookingDetails are not available (e.g., direct navigation)
    if (!bookingDetails || !bookingDetails.event || !bookingDetails.selectedEventDate) {
      router.replace(`/events/${eventId}`);
      return;
    }

    getSeatingLayoutByEventId(eventId)
      .then(layout => {
        setSeatingLayout(layout);
        // Auto-select first zone if available
        if (layout && layout.zones.length > 0) {
          //setSelectedZone(layout.zones[0]);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch seating layout:", err);
        setError("Could not load seating information. Please try again.");
        setIsLoading(false);
      });
    
    // Initialize localSelectedSeats from context if any
    setLocalSelectedSeats(bookingDetails.selectedSeats || []);

  }, [eventId, bookingDetails, router]);

  const handleZoneClick = (zone: Zone) => {
    setSelectedZone(zone);
  };

  const handleSeatClick = (seat: Seat, zone: Zone) => {
    if (seat.status === 'unavailable' || seat.status === 'locked') return;

    const seatIdentifier = `${zone.id}-${seat.id}`;
    const existingSeatIndex = localSelectedSeats.findIndex(s => `${s.zoneId}-${s.seatId}` === seatIdentifier);

    if (existingSeatIndex > -1) {
      // Deselect seat
      setLocalSelectedSeats(prev => prev.filter((_, index) => index !== existingSeatIndex));
    } else {
      // Select seat
      if (localSelectedSeats.length >= MAX_SEATS_SELECTABLE) {
        alert(`You can select a maximum of ${MAX_SEATS_SELECTABLE} seats.`);
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
    if (isSelected) return 'bg-primary text-primary-foreground'; // Selected seat - Red
    if (seat.status === 'unavailable' || seat.status === 'locked') return 'bg-muted text-muted-foreground cursor-not-allowed';
    
    switch (seat.priceTier) {
      case 'premium': return 'bg-yellow-400 hover:bg-yellow-500 text-black'; // Premium
      case 'standard': return 'bg-green-500 hover:bg-green-600 text-white'; // Standard
      case 'economy': return 'bg-blue-500 hover:bg-blue-600 text-white'; // Economy
      default: return 'bg-accent hover:bg-accent/80 text-accent-foreground';
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
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  if (!seatingLayout || !bookingDetails || !bookingDetails.event) {
     return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">Seating information not available.</h2>
         <Button onClick={() => router.back()} variant="outline" className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }
  
  const stagePosition = seatingLayout.stagePosition || { top: "0%", left: "50%", width: "30%", height:"10%" };


  return (
    <TooltipProvider>
    <div className="max-w-6xl mx-auto space-y-6">
      <Button onClick={() => router.back()} variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Event Details
      </Button>

      <Card className="bg-card text-card-foreground shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Select Your Seats for {bookingDetails.event.name}</CardTitle>
          <CardDescription>
            Event Date: {new Date(bookingDetails.selectedEventDate.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {bookingDetails.selectedEventDate.time}
            {bookingDetails.selectedRound && `, Round: ${bookingDetails.selectedRound}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Hall Map */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold">Zone Map</h3>
             <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Instructions</AlertTitle>
              <AlertDescription>
                Click on a zone in the map below to view available seats in that section.
              </AlertDescription>
            </Alert>
            <div className="relative bg-muted/30 p-4 rounded-lg aspect-square w-full overflow-hidden border border-border">
              {/* Stage */}
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
                STAGE
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
                <h4 className="text-md font-semibold">Legend:</h4>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-yellow-400"></div><span>Premium</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-500"></div><span>Standard</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-500"></div><span>Economy</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-primary"></div><span>Selected</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-muted"></div><span>Unavailable</span></div>
              </div>
          </div>

          {/* Seat Map */}
          <div className="md:col-span-2">
            {selectedZone ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Seats in {selectedZone.name}</h3>
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
                                seat.aisle ? "opacity-0 pointer-events-none" : "" // Hide aisle spacers
                              )}
                              disabled={seat.status === 'unavailable' || seat.status === 'locked' || (localSelectedSeats.length >= MAX_SEATS_SELECTABLE && !localSelectedSeats.some(s => s.zoneId === selectedZone?.id && s.seatId === seat.id))}
                              aria-label={`Seat ${seat.seatNumber}, Price ${seat.price}, Status ${localSelectedSeats.some(s => s.zoneId === selectedZone?.id && s.seatId === seat.id) ? 'selected' : seat.status}`}
                            >
                              <Armchair className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          {!seat.aisle && (
                            <TooltipContent className="bg-popover text-popover-foreground">
                              <p>Seat: {seat.seatNumber}</p>
                              <p>Price: ${seat.price.toFixed(2)}</p>
                              <p>Status: {localSelectedSeats.some(s => s.zoneId === selectedZone?.id && s.seatId === seat.id) ? 'Selected' : seat.status}</p>
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
                <p className="text-lg font-medium text-foreground">Please select a zone from the map.</p>
                <p className="text-sm text-muted-foreground">Click on a zone to view and select seats.</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-6 bg-muted/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-left">
             <p className="text-lg font-semibold text-card-foreground">Selected Seats: {localSelectedSeats.length}</p>
             <p className="text-xl font-bold text-primary">Total Price: ${calculateTotalPrice().toFixed(2)}</p>
          </div>
          <Button 
            size="lg" 
            onClick={handleProceedToSummary} 
            disabled={localSelectedSeats.length === 0}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Proceed to Summary
          </Button>
        </CardFooter>
      </Card>
    </div>
    </TooltipProvider>
  );
}
