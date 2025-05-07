'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertCircle, ArrowLeft, CreditCard, Smartphone, Info, CheckCircle, Loader2 } from 'lucide-react';
import { useBooking } from '@/context/BookingContext';
import type { UserInformation } from '@/lib/types';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


const UserInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits").regex(/^\+?[0-9\s-]{10,}$/, "Invalid mobile number format"),
});

export default function SummaryPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { bookingDetails, setBookingDetails } = useBooking();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'Prompt Pay' | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);

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
    // Redirect if bookingDetails are not sufficient
    if (!bookingDetails || !bookingDetails.event || !bookingDetails.selectedEventDate || bookingDetails.selectedSeats.length === 0) {
      router.replace(`/events/${eventId}`);
    }
  }, [bookingDetails, eventId, router]);

  const onSubmitUserInfo: SubmitHandler<UserInformation> = (data) => {
    if (!paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setBookingDetails(prev => ({
        ...prev!,
        userInformation: data,
        paymentMethod: paymentMethod,
      }));
      console.log("Simulating payment success for:", data, "with method:", paymentMethod);
      toast({
        title: "Payment Successful!",
        description: "Your booking is confirmed. Redirecting to your ticket...",
        variant: "default",
        className: "bg-green-500 text-white"
      });
      router.push(`/events/${eventId}/ticket`);
      setIsProcessing(false);
    }, 2000); // Simulate 2 second delay
  };

  if (!bookingDetails || !bookingDetails.event || bookingDetails.selectedSeats.length === 0) {
    // This check is mainly for type safety and should be caught by useEffect redirect
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading booking details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button onClick={() => router.back()} variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Seat Selection
      </Button>

      <Card className="bg-card text-card-foreground shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Booking Summary</CardTitle>
          <CardDescription>Review your selections and provide your information to complete the booking.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmitUserInfo)}>
          <CardContent className="space-y-8">
            {/* Event and Seat Details */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-primary">{bookingDetails.event.name}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Date:</strong> {new Date(bookingDetails.selectedEventDate.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {bookingDetails.selectedEventDate.time}</p>
                {bookingDetails.selectedRound && <p><strong>Round:</strong> {bookingDetails.selectedRound}</p>}
                <p><strong>Location:</strong> {bookingDetails.event.location.name}</p>
              </div>
              <div className="mt-4">
                <h4 className="text-md font-semibold mb-2">Selected Seats ({bookingDetails.selectedSeats.length}):</h4>
                <ul className="list-disc list-inside space-y-1 text-sm bg-muted/20 p-3 rounded-md">
                  {bookingDetails.selectedSeats.map(seat => (
                    <li key={seat.seatId}>
                      Zone {seat.zoneName}, Seat {seat.seatNumber} - ${seat.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
                <p className="text-right text-lg font-bold mt-3 text-primary">
                  Total Price: ${bookingDetails.totalPrice.toFixed(2)}
                </p>
              </div>
            </section>

            <hr className="border-border" />

            {/* User Information */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Your Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" {...register("firstName")} className="bg-background text-foreground" />
                  {errors.firstName && <p className="text-destructive text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" {...register("lastName")} className="bg-background text-foreground" />
                  {errors.lastName && <p className="text-destructive text-xs mt-1">{errors.lastName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email")} className="bg-background text-foreground" />
                  {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="mobileNumber">Mobile Number</Label>
                  <Input id="mobileNumber" type="tel" {...register("mobileNumber")} className="bg-background text-foreground" />
                  {errors.mobileNumber && <p className="text-destructive text-xs mt-1">{errors.mobileNumber.message}</p>}
                </div>
              </div>
            </section>

            <hr className="border-border" />

            {/* Payment Method */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
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
                    <span>Credit Card</span>
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
                    <span>Prompt Pay</span>
                  </Label>
                </div>
              </RadioGroup>
              {!paymentMethod && Object.keys(errors).length === 0 && (
                <p className="text-destructive text-xs mt-2">Please select a payment method.</p>
              )}
            </section>
             <Alert variant="default" className="bg-accent/10 border-accent/50">
              <Info className="h-4 w-4 text-accent-foreground" />
              <AlertTitle className="text-accent-foreground">Test Mode</AlertTitle>
              <AlertDescription className="text-accent-foreground/80">
                This is a simulated payment process. No real charges will be made.
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
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing Payment...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" /> Confirm & Pay ${bookingDetails.totalPrice.toFixed(2)}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

