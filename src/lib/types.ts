
export interface Location {
  lat: number;
  lng: number;
  name?: string; // e.g., "Crypto.com Arena"
}

export interface EventDate {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  rounds?: string[]; // Optional: e.g., ["Round 1", "Round 2"]
}

export interface Event {
  id: string;
  name: string;
  description: string;
  dates: EventDate[];
  location: Location;
  eventType: string; // e.g., "Concert", "Sports", "Conference"
  imageUrl: string;
  bannerUrl?: string; // Optional for hero banner
  tags?: string[];
  organizer?: string;
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
  selectedEventDate: EventDate;
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
