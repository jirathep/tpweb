
'use client';
import type { ComponentPropsWithoutRef } from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/navigation'; // Use from '@/navigation' for locale-aware routing
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, CreditCard, Smartphone, Info, CheckCircle, Loader2, MapPin } from 'lucide-react';
import { useBooking } from '@/context/BookingContext';
import type { UserInformation, SeatingLayout } from '@/lib/types';
import { getSeatingLayoutByEventId } from '@/services/event';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';
import { format as formatDateFns, parseISO } from 'date-fns';
import { enUS, th } from 'date-fns/locale';
import SeatingMapPreview from '@/components/booking/SeatingMapPreview';

export default function SummaryPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('SummaryPage');
  const locale = useLocale();
  const eventId = params.eventId as string;
  const { bookingDetails, setBookingDetails } = useBooking();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'Prompt Pay' | undefined>(bookingDetails?.paymentMethod || undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [seatingLayout, setSeatingLayout] = useState<SeatingLayout | null>(null);
  const [isLoadingLayout, setIsLoadingLayout] = useState(true);


  const UserInfoSchema = z.object({
    firstName: z.string().min(1, t('errors.firstNameRequired')),
    lastName: z.string().min(1, t('errors.lastNameRequired')),
    email: z.string().email(t('errors.emailInvalid')),
    mobileNumber: z.string().min(10, t('errors.mobileNumberMin')).regex(/^\+?[0-9\s-]{10,}$/, t('errors.mobileNumberInvalid')),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<UserInformation>({
    resolver: zodResolver(UserInfoSchema),
    defaultValues: bookingDetails?.userInformation || {
      firstName: '',
      lastName: '',
      email: '',
      mobileNumber: '',
    }
  });

  useEffect(() => {
    if (!bookingDetails || !bookingDetails.event || !bookingDetails.selectedEventDate || bookingDetails.selectedSeats.length === 0) {
      router.replace(`/events/${eventId}`);
      return;
    }

    setIsLoadingLayout(true);
    getSeatingLayoutByEventId(bookingDetails.event.id)
      .then(layout => {
        setSeatingLayout(layout);
      })
      .catch(err => {
        console.error("Failed to fetch seating layout for summary:", err);
        // Optionally set an error state to display to user
      })
      .finally(() => {
        setIsLoadingLayout(false);
      });

  }, [bookingDetails, eventId, router]);

  const onSubmitUserInfo: SubmitHandler<UserInformation> = (data) => {
    if (!paymentMethod) {
      toast({
        title: t('paymentMethodRequiredTitle'),
        description: t('paymentMethodRequiredDescription'),
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setBookingDetails(prev => ({
        ...prev!,
        userInformation: data,
        paymentMethod: paymentMethod,
      }));
      console.log("Simulating payment success for:", data, "with method:", paymentMethod);
      toast({
        title: t('paymentSuccessfulTitle'),
        description: t('paymentSuccessfulDescription'),
        variant: "default",
        className: "bg-green-500 text-white"
      });
      router.push(`/events/${eventId}/ticket`);
      setIsProcessing(false);
    }, 2000); 
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


  if (!bookingDetails || !bookingDetails.event || bookingDetails.selectedSeats.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">{t('loadingBookingDetails')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button onClick={() => router.back()} variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('backButton')}
      </Button>

      <Card className="bg-card text-card-foreground shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">{t('pageTitle')}</CardTitle>
          <CardDescription>{t('pageDescription')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmitUserInfo)}>
          <CardContent className="space-y-8">
            <section>
              <h3 className="text-xl font-semibold mb-3 text-primary">{bookingDetails.event.name}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>{t('dateLabel')}</strong> {formatDisplayDate(bookingDetails.selectedEventDate.date)} {locale === 'th' ? 'เวลา' : 'at'} {bookingDetails.selectedEventDate.time}</p>
                {bookingDetails.selectedRound && <p><strong>{t('roundLabel')}</strong> {bookingDetails.selectedRound}</p>}
                <p><strong>{t('locationLabel')}</strong> {bookingDetails.event.location.name}</p>
              </div>
              <div className="mt-4">
                <h4 className="text-md font-semibold mb-2">{t('selectedSeatsTitle', { count: bookingDetails.selectedSeats.length })}:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm bg-muted/20 p-3 rounded-md">
                  {bookingDetails.selectedSeats.map(seat => (
                    <li key={seat.seatId}>
                      {t('seatDetailsItem', { zoneName: seat.zoneName, seatNumber: seat.seatNumber, price: seat.price.toFixed(2) })}
                    </li>
                  ))}
                </ul>
                <p className="text-right text-lg font-bold mt-3 text-primary">
                  {t('totalPriceLabel', { price: bookingDetails.totalPrice.toFixed(2) })}
                </p>
              </div>
            </section>

            {isLoadingLayout ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : seatingLayout && bookingDetails.selectedSeats.length > 0 && (
              <section>
                 <hr className="border-border" />
                <h3 className="text-xl font-semibold my-4 flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-primary" />
                    {t('yourSeatLocationTitle')}
                </h3>
                <SeatingMapPreview layout={seatingLayout} selectedSeats={bookingDetails.selectedSeats} />
              </section>
            )}


            <hr className="border-border" />

            <section>
              <h3 className="text-xl font-semibold mb-4">{t('yourInformationTitle')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">{t('firstNameLabel')}</Label>
                  <Input id="firstName" {...register("firstName")} className="bg-background text-foreground" />
                  {errors.firstName && <p className="text-destructive text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="lastName">{t('lastNameLabel')}</Label>
                  <Input id="lastName" {...register("lastName")} className="bg-background text-foreground" />
                  {errors.lastName && <p className="text-destructive text-xs mt-1">{errors.lastName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">{t('emailLabel')}</Label>
                  <Input id="email" type="email" {...register("email")} className="bg-background text-foreground" />
                  {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="mobileNumber">{t('mobileNumberLabel')}</Label>
                  <Input id="mobileNumber" type="tel" {...register("mobileNumber")} className="bg-background text-foreground" />
                  {errors.mobileNumber && <p className="text-destructive text-xs mt-1">{errors.mobileNumber.message}</p>}
                </div>
              </div>
            </section>

            <hr className="border-border" />

            <section>
              <h3 className="text-xl font-semibold mb-4">{t('paymentMethodTitle')}</h3>
              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'Credit Card' | 'Prompt Pay')}>
                <div className="space-y-3">
                  <Label
                    htmlFor="creditCard"
                    className={cn(
                      "flex items-center space-x-3 rounded-md border p-4 cursor-pointer transition-colors hover:bg-accent/10",
                      paymentMethod === 'Credit Card' && "bg-primary/10 border-primary ring-2 ring-primary"
                    )}
                  >
                    <RadioGroupItem value="Credit Card" id="creditCard" />
                    <CreditCard className="h-6 w-6 text-primary" />
                    <span>{t('creditCardLabel')}</span>
                  </Label>
                  <Label
                    htmlFor="promptPay"
                    className={cn(
                      "flex items-center space-x-3 rounded-md border p-4 cursor-pointer transition-colors hover:bg-accent/10",
                      paymentMethod === 'Prompt Pay' && "bg-primary/10 border-primary ring-2 ring-primary"
                    )}
                  >
                    <RadioGroupItem value="Prompt Pay" id="promptPay" />
                    <Smartphone className="h-6 w-6 text-primary" />
                    <span>{t('promptPayLabel')}</span>
                  </Label>
                </div>
              </RadioGroup>
              {!paymentMethod && Object.keys(errors).length === 0 && (
                // Check if form is submitted before showing this? current logic displays on first load
                <p className="text-destructive text-xs mt-2">{t('errors.paymentMethodRequired')}</p>
              )}
            </section>
             <Alert variant="default" className="bg-accent/10 border-accent/50">
              <Info className="h-4 w-4 text-accent-foreground" />
              <AlertTitle className="text-accent-foreground">{t('testModeTitle')}</AlertTitle>
              <AlertDescription className="text-accent-foreground/80">
                {t('testModeDescription')}
              </AlertDescription>
            </Alert>

          </CardContent>
          <CardFooter className="p-6 bg-muted/30">
            <Button 
              type="submit" 
              size="lg" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('processingPaymentButton')}
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" /> {t('confirmAndPayButton', { price: bookingDetails.totalPrice.toFixed(2)})}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

