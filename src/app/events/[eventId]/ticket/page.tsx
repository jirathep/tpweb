'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Download, Printer, TicketIcon, QrCodeIcon, Loader2, ArrowLeft } from 'lucide-react';
import { useBooking } from '@/context/BookingContext';
import Image from 'next/image'; // For QR code image

export default function TicketPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { bookingDetails } = useBooking();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Redirect if bookingDetails are not sufficient (e.g., direct navigation or payment failed)
    if (!bookingDetails || !bookingDetails.event || !bookingDetails.userInformation || !bookingDetails.paymentMethod) {
      router.replace(`/events/${eventId}/summary`); // Or some error page
      return;
    }

    // Generate a mock QR code URL (replace with actual QR generation logic or API call)
    // For demonstration, using a placeholder QR code service.
    const ticketData = encodeURIComponent(JSON.stringify({
      eventId: bookingDetails.event.id,
      eventName: bookingDetails.event.name,
      date: bookingDetails.selectedEventDate.date,
      time: bookingDetails.selectedEventDate.time,
      seats: bookingDetails.selectedSeats.map(s => `${s.zoneName} - ${s.seatNumber}`).join(', '),
      name: `${bookingDetails.userInformation.firstName} ${bookingDetails.userInformation.lastName}`,
      email: bookingDetails.userInformation.email,
      total: bookingDetails.totalPrice
    }));
    // Using a simple QR code API for placeholder
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticketData}`);

  }, [bookingDetails, eventId, router]);


  const handlePrintTicket = () => {
    window.print();
  };
  
  // Note: Actual download functionality for a div like this is complex and
  // usually involves libraries like html2canvas + jsPDF or server-side generation.
  // This is a placeholder.
  const handleDownloadTicket = async () => {
     alert("Download functionality is for demonstration. In a real app, this would generate a PDF.");
     // Example with html2canvas if installed:
     /*
     if (ticketRef.current) {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(ticketRef.current);
        const link = document.createElement('a');
        link.download = `Prompt_eTicket_${bookingDetails?.event?.name.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
     }
     */
  };

  if (!bookingDetails || !bookingDetails.event || !bookingDetails.userInformation) {
    // This check is mainly for type safety and should be caught by useEffect redirect
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading ticket details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
       <Button onClick={() => router.push('/')} variant="outline" className="mb-6 print:hidden">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
      </Button>
      <Card ref={ticketRef} className="bg-card text-card-foreground shadow-2xl overflow-hidden print:shadow-none print:border-none">
        <CardHeader className="bg-primary text-primary-foreground p-6 print:bg-black print:text-white">
          <div className="flex items-center space-x-3">
            <TicketIcon className="h-10 w-10" />
            <div>
              <CardTitle className="text-3xl">Your Event Ticket</CardTitle>
              <CardDescription className="text-primary-foreground/80 print:text-gray-300">This is your official entry pass.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <section className="text-center">
            <h2 className="text-2xl font-bold text-primary">{bookingDetails.event.name}</h2>
            <p className="text-muted-foreground">
              {new Date(bookingDetails.selectedEventDate.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {bookingDetails.selectedEventDate.time}
            </p>
            {bookingDetails.selectedRound && <p className="text-muted-foreground">Round: {bookingDetails.selectedRound}</p>}
            <p className="text-muted-foreground">Location: {bookingDetails.event.location.name}</p>
          </section>
          
          <hr className="border-border" />

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-lg font-semibold mb-2">Attendee:</h3>
              <p className="text-foreground">{bookingDetails.userInformation.firstName} {bookingDetails.userInformation.lastName}</p>
              <p className="text-sm text-muted-foreground">{bookingDetails.userInformation.email}</p>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">Selected Seats:</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {bookingDetails.selectedSeats.map(seat => (
                  <li key={seat.seatId}>
                    Zone {seat.zoneName}, Seat {seat.seatNumber}
                  </li>
                ))}
              </ul>
              <p className="font-semibold mt-2 text-foreground">Total Price: ${bookingDetails.totalPrice.toFixed(2)}</p>
               <p className="text-sm text-muted-foreground">Payment Method: {bookingDetails.paymentMethod}</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              {qrCodeUrl ? (
                <Image src={qrCodeUrl} alt="QR Code Ticket" width={200} height={200} className="rounded-lg shadow-md border border-border" data-ai-hint="QR code ticket" />
              ) : (
                <div className="w-[200px] h-[200px] bg-muted rounded-lg flex items-center justify-center">
                  <QrCodeIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2 text-center">Scan this QR code at the event entrance.</p>
            </div>
          </section>
          
          <hr className="border-border" />

          <section className="text-xs text-muted-foreground text-center">
            <p>Thank you for booking with Prompt eTicket!</p>
            <p>Please keep this ticket safe. Entry will be granted upon successful scan of the QR code.</p>
            <p>Terms and conditions apply. Visit our website for more details.</p>
          </section>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
        <Button onClick={handlePrintTicket} variant="outline" size="lg">
          <Printer className="mr-2 h-5 w-5" /> Print Ticket
        </Button>
        <Button onClick={handleDownloadTicket} variant="outline" size="lg">
          <Download className="mr-2 h-5 w-5" /> Download Ticket
        </Button>
      </div>
    </div>
  );
}
