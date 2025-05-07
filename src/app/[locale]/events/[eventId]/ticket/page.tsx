
'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/navigation'; // Use from '@/navigation' for locale-aware routing
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Printer, TicketIcon, QrCodeIcon, Loader2, ArrowLeft } from 'lucide-react';
import { useBooking } from '@/context/BookingContext';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { format as formatDateFns, parseISO } from 'date-fns';
import { enUS, th } from 'date-fns/locale';

export default function TicketPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('TicketPage');
  const locale = useLocale();
  const eventId = params.eventId as string;
  const { bookingDetails } = useBooking();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bookingDetails || !bookingDetails.event || !bookingDetails.userInformation || !bookingDetails.paymentMethod) {
      router.replace(`/events/${eventId}/summary`);
      return;
    }

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
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticketData}`);

  }, [bookingDetails, eventId, router]);


  const handlePrintTicket = () => {
    window.print();
  };
  
  const handleDownloadTicket = async () => {
     alert(t('downloadDemoMessage'));
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

  if (!bookingDetails || !bookingDetails.event || !bookingDetails.userInformation) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">{t('loadingTicketDetails')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
       <Button onClick={() => router.push('/')} variant="outline" className="mb-6 print:hidden">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('backToHomeButton')}
      </Button>
      <Card ref={ticketRef} className="bg-card text-card-foreground shadow-2xl overflow-hidden print:shadow-none print:border-none">
        <CardHeader className="bg-primary text-primary-foreground p-6 print:bg-black print:text-white">
          <div className="flex items-center space-x-3">
            <TicketIcon className="h-10 w-10" />
            <div>
              <CardTitle className="text-3xl">{t('pageTitle')}</CardTitle>
              <CardDescription className="text-primary-foreground/80 print:text-gray-300">{t('pageDescription')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <section className="text-center">
            <h2 className="text-2xl font-bold text-primary">{bookingDetails.event.name}</h2>
            <p className="text-muted-foreground">
              {formatDisplayDate(bookingDetails.selectedEventDate.date)} {locale === 'th' ? 'เวลา' : 'at'} {bookingDetails.selectedEventDate.time}
            </p>
            {bookingDetails.selectedRound && <p className="text-muted-foreground">{t('roundLabel')} {bookingDetails.selectedRound}</p>}
            <p className="text-muted-foreground">{t('locationLabel')} {bookingDetails.event.location.name}</p>
          </section>
          
          <hr className="border-border" />

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('attendeeTitle')}</h3>
              <p className="text-foreground">{bookingDetails.userInformation.firstName} {bookingDetails.userInformation.lastName}</p>
              <p className="text-sm text-muted-foreground">{bookingDetails.userInformation.email}</p>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">{t('selectedSeatsTitle')}</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {bookingDetails.selectedSeats.map(seat => (
                  <li key={seat.seatId}>
                    Zone {seat.zoneName}, Seat {seat.seatNumber}
                  </li>
                ))}
              </ul>
              <p className="font-semibold mt-2 text-foreground">{t('totalPriceLabel', {price: bookingDetails.totalPrice.toFixed(2)})}</p>
               <p className="text-sm text-muted-foreground">{t('paymentMethodLabel')} {bookingDetails.paymentMethod}</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              {qrCodeUrl ? (
                <Image src={qrCodeUrl} alt={t('qrCodeAlt')} width={200} height={200} className="rounded-lg shadow-md border border-border" data-ai-hint="QR code ticket" />
              ) : (
                <div className="w-[200px] h-[200px] bg-muted rounded-lg flex items-center justify-center">
                  <QrCodeIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2 text-center">{t('scanQrCodeInstruction')}</p>
            </div>
          </section>
          
          <hr className="border-border" />

          <section className="text-xs text-muted-foreground text-center">
            <p>{t('thankYouMessage')}</p>
            <p>{t('ticketSafetyMessage')}</p>
            <p>{t('termsAndConditionsMessage')}</p>
          </section>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
        <Button onClick={handlePrintTicket} variant="outline" size="lg">
          <Printer className="mr-2 h-5 w-5" /> {t('printTicketButton')}
        </Button>
        <Button onClick={handleDownloadTicket} variant="outline" size="lg">
          <Download className="mr-2 h-5 w-5" /> {t('downloadTicketButton')}
        </Button>
      </div>
    </div>
  );
}

