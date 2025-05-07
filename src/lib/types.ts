
export interface Location {
  lat: number;
  lng: number;
  name?: string; // e.g., "Crypto.com Arena"
}

export type EventDateType = 'show' | 'presale_nightrain' | 'presale_general' | 'onsale_public' | 'other';

export interface EventDate {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  rounds?: string[]; // Optional: e.g., ["Round 1", "Round 2"]
  gateOpenTime?: string; // Optional: HH:MM
  label?: string; // Optional: e.g., "Nightrain pre-sale", "Public on-sale"
  type?: EventDateType; // To categorize dates
  endDate?: string; // Optional: YYYY-MM-DD for date ranges
  endTime?: string; // Optional: HH:MM for date ranges
}

export type EventCategory = 'All' | 'Concert' | 'Performance' | 'Sport' | 'Exhibition' | 'Conference' | 'Other';

export type TicketStatus = 'coming_soon' | 'on_sale' | 'sold_out' | 'off_sale' | 'unavailable';


export interface Event {
  id: string;
  name: string;
  description: string;
  dates: EventDate[];
  location: Location;
  eventType: EventCategory; // e.g., "Concert", "Sports", "Conference"
  imageUrl: string;
  bannerUrl?: string; // Optional for hero banner
  tags?: string[];
  organizer?: string;
  soldOut?: boolean; // This might be redundant if using ticketStatus
  priceRangeDisplay?: string[]; // For displaying price tiers/ranges, e.g. ["VIP: 5000 THB", "Regular: 2000 THB"]
  ticketStatus?: TicketStatus;
}

export interface Seat {
  id: string;
  seatNumber: string; // e.g., "A1", "B12"
  status: 'available' | 'unavailable' | 'selected' | 'locked'; // locked could be for temporarily held seats
  price: number;
  priceTier: 'premium' | 'standard' | 'economy'; // For color coding
  aisle?: boolean;
}

export interface Zone {
  id: string;
  name: string; // e.g., "Floor A", "Section 101"
  seats: Seat[][]; // 2D array representing rows and seats
  mapPosition?: { top: string; left: string; width: string; height: string }; // For visual map
}

export interface SeatingLayout {
  eventId: string;
  zones: Zone[];
  stagePosition?: { top?: string; bottom?: string; left?: string; right?: string; width?: string; height?: string };
}

export interface SelectedSeatInfo {
  zoneId: string;
  zoneName: string;
  seatId: string;
  seatNumber: string;
  price: number;
}

export interface UserInformation {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
}

export interface BookingDetails {
  event: Event;
  selectedEventDate: EventDate; // This will be the primary 'show' date for booking
  selectedRound?: string;
  selectedSeats: SelectedSeatInfo[];
  totalPrice: number;
  userInformation?: UserInformation;
  paymentMethod?: 'Credit Card' | 'Prompt Pay';
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  date: string;
  imageUrl?: string;
}

