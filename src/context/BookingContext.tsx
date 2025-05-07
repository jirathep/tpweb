'use client';
import type { ReactNode } from 'react';
import { createContext, useContext, useState, Dispatch, SetStateAction } from 'react';
import type { BookingDetails } from '@/lib/types';

interface BookingContextType {
  bookingDetails: BookingDetails | null;
  setBookingDetails: Dispatch<SetStateAction<BookingDetails | null>>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  return (
    <BookingContext.Provider value={{ bookingDetails, setBookingDetails }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
