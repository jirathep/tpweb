
import type { Event, SeatingLayout, Zone, Seat, Location, EventCategory, EventDate } from '@/lib/types';

const mockEvents: Event[] = [
  {
    id: 'concert-123',
    name: 'Rock Legends Live',
    description: 'Experience the greatest hits from rock legends in an unforgettable night of music and spectacle. Featuring pyrotechnics and special guest appearances.',
    dates: [
      { date: '2024-09-14', time: '09:00', endDate: '2024-09-15', endTime: '18:00', label: 'Nightrain Pre-Sale', type: 'presale_nightrain' },
      { date: '2024-09-15', time: '10:00', label: 'Public On-Sale', type: 'onsale_public' },
      { date: '2024-11-15', time: '19:00', gateOpenTime: '18:00', type: 'show' },
      { date: '2024-11-16', time: '20:00', gateOpenTime: '19:00', rounds: ['Early Bird Show', 'Main Show'], type: 'show' }
    ],
    location: { lat: 34.0522, lng: -118.2437, name: 'Crypto.com Arena, LA' },
    eventType: 'Concert',
    imageUrl: 'https://picsum.photos/seed/eventposter1/400/600', // Taller poster
    bannerUrl: 'https://picsum.photos/seed/concert1banner/1600/500',
    tags: ['Rock', 'Live Music', 'Stadium'],
    organizer: 'LiveNation',
    soldOut: false,
    priceRangeDisplay: ['VIP Package: 5,000 THB - 7,500 THB', 'Regular: 2,500 THB - 4,000 THB', 'Economy: 1,500 THB'],
    ticketStatus: 'on_sale',
  },
  {
    id: 'sports-456',
    name: 'Championship Finals: Lakers vs Celtics',
    description: 'The ultimate showdown! Witness basketball history as the Lakers take on the Celtics in the Championship Finals. Expect intense action and a star-studded crowd.',
    dates: [
      { date: '2024-10-04', time: '12:00', label: 'General Sale', type: 'onsale_public' },
      { date: '2024-12-05', time: '18:30', gateOpenTime: '17:00', type: 'show' }
    ],
    location: { lat: 34.0430, lng: -118.2673, name: 'Staples Center, LA' },
    eventType: 'Sport',
    imageUrl: 'https://picsum.photos/seed/eventposter2/400/600', // Taller poster
    bannerUrl: 'https://picsum.photos/seed/sports1banner/1600/500',
    tags: ['Basketball', 'NBA', 'Finals'],
    organizer: 'NBA Commisioner Office',
    soldOut: true,
    priceRangeDisplay: ['Courtside: 15,000 THB', 'Lower Bowl: 5,000 THB - 8,000 THB', 'Upper Bowl: 2,000 THB'],
    ticketStatus: 'sold_out',
  },
  {
    id: 'conference-789',
    name: 'Tech Innovators Summit 2025',
    description: 'Join industry leaders, innovators, and visionaries at the Tech Innovators Summit. Discover the latest trends in AI, Web3, and sustainable tech.',
    dates: [
      { date: '2025-01-15', time: '09:00', label: 'Early Bird Tickets', type: 'presale_general' },
      { date: '2025-02-20', time: '09:00', gateOpenTime: '08:00', rounds: ['Day 1 Keynotes', 'Day 1 Workshops'], type: 'show', label: 'Summit Day 1' },
      { date: '2025-02-21', time: '09:30', gateOpenTime: '08:30', rounds: ['Day 2 Panels', 'Day 2 Networking'], type: 'show', label: 'Summit Day 2' }
    ],
    location: { lat: 37.7749, lng: -122.4194, name: 'Moscone Center, SF' },
    eventType: 'Conference',
    imageUrl: 'https://picsum.photos/seed/eventposter3/400/600', // Taller poster
    bannerUrl: 'https://picsum.photos/seed/conference1banner/1600/500',
    tags: ['Technology', 'AI', 'Networking'],
    organizer: 'TechCon Group',
    soldOut: false,
    priceRangeDisplay: ['All Access Pass: 12,000 THB', 'Student Pass: 4,500 THB'],
    ticketStatus: 'coming_soon',
  },
   {
    id: 'concert-124',
    name: 'Pop Sensations Tour Live in Bangkok',
    description: 'Dance the night away with the biggest pop stars of today! A high-energy show with dazzling choreography and chart-topping hits.',
    dates: [
      { date: '2025-03-10', time: '10:00', label: 'Fanclub Pre-Sale', type: 'presale_general'},
      { date: '2025-03-12', time: '10:00', label: 'Public Sale', type: 'onsale_public'},
      { date: '2025-04-22', time: '19:30', gateOpenTime: '18:00', type: 'show' }
    ],
    location: { lat: 13.7563, lng: 100.5018, name: 'Rajamangala Stadium, BKK' },
    eventType: 'Concert',
    imageUrl: 'https://picsum.photos/seed/eventposter4/400/600',
    bannerUrl: 'https://picsum.photos/seed/concert2banner/1600/500',
    tags: ['Pop', 'Live Music', 'Arena'],
    organizer: 'PopStar Productions',
    soldOut: false,
    priceRangeDisplay: ['Standing A: 4,000 THB', 'Standing B: 3,000 THB', 'Seated: 2,000 - 5,000 THB'],
    ticketStatus: 'on_sale',
  },
  {
    id: 'sports-457',
    name: 'Grand Slam Tennis Tournament Thailand Open',
    description: 'Witness world-class tennis as top players battle for the Grand Slam title. An event of tradition and excitement.',
    dates: [
      { date: '2025-06-01', time: '10:00', label: 'Ticket Sales Open', type: 'onsale_public'},
      { date: '2025-07-10', time: '14:00', gateOpenTime: '12:00', type: 'show', label: 'Finals Day' }
    ],
    location: { lat: 13.7308, lng: 100.5231, name: 'Impact Arena, Muang Thong Thani' },
    eventType: 'Sport',
    imageUrl: 'https://picsum.photos/seed/eventposter5/400/600',
    bannerUrl: 'https://picsum.photos/seed/sports2banner/1600/500',
    tags: ['Tennis', 'Grand Slam', 'Championship'],
    organizer: 'Thailand Tennis Association',
    soldOut: true,
    priceRangeDisplay: ['Premium Seats: 6,000 THB', 'Standard Seats: 1,500 - 3,500 THB'],
    ticketStatus: 'sold_out',
  },
  {
    id: 'exhibition-101',
    name: 'Ancient Artifacts of Siam Revealed',
    description: 'Explore a stunning collection of recently unearthed ancient artifacts, offering a glimpse into long-lost civilizations. A journey through time.',
    // Example of an event that is always "on-sale" like a museum exhibition
    dates: [{ date: '2024-12-01', time: '10:00', endDate: '2025-03-31', endTime: '17:00', gateOpenTime: '10:00', type: 'show', label: 'Exhibition Period' }],
    location: { lat: 13.7461, lng: 100.5039, name: 'National Museum, Bangkok' },
    eventType: 'Exhibition',
    imageUrl: 'https://picsum.photos/seed/eventposter6/400/600',
    bannerUrl: 'https://picsum.photos/seed/exhibit1banner/1600/500',
    tags: ['History', 'Art', 'Museum'],
    organizer: 'Fine Arts Department',
    soldOut: false,
    priceRangeDisplay: ['Adult: 200 THB', 'Student: 50 THB', 'Free for Children under 12'],
    ticketStatus: 'on_sale', // Museum tickets are generally always on sale
  },
   {
    id: 'performance-202',
    name: 'The Magical Mystery Show: Bangkok Edition',
    description: 'A breathtaking theatrical performance filled with illusions, captivating storytelling, and spectacular stage effects. Fun for the whole family!',
    dates: [
        { date: '2025-02-15', time: '10:00', label: 'Early Bird Sale', type: 'presale_general'},
        { date: '2025-02-20', time: '10:00', label: 'General Sale', type: 'onsale_public'},
        { date: '2025-03-25', time: '19:00', gateOpenTime: '18:30', type: 'show' }, 
        { date: '2025-03-26', time: '14:00', gateOpenTime: '13:30', type: 'show' }, 
        { date: '2025-03-26', time: '19:00', gateOpenTime: '18:30', type: 'show' }
    ],
    location: { lat: 13.7400, lng: 100.5373, name: 'Thailand Cultural Centre, Main Hall' },
    eventType: 'Performance',
    imageUrl: 'https://picsum.photos/seed/eventposter7/400/600',
    bannerUrl: 'https://picsum.photos/seed/performance1banner/1600/500',
    tags: ['Theatre', 'Magic', 'Family Show'],
    organizer: 'Mysteria Productions Asia',
    soldOut: false,
    priceRangeDisplay: ['Diamond: 3,500 THB', 'Gold: 2,500 THB', 'Silver: 1,500 THB'],
    ticketStatus: 'coming_soon',
  }
];

const generateSeats = (rows: number, seatsPerRow: number, basePrice: number, priceTier: 'premium' | 'standard' | 'economy'): Seat[][] => {
  const seats: Seat[][] = [];
  for (let i = 0; i < rows; i++) {
    const row: Seat[] = [];
    for (let j = 0; j < seatsPerRow; j++) {
      // Randomly make some seats unavailable
      const status = Math.random() > 0.8 ? 'unavailable' : 'available';
      // Add aisle spacers (e.g. every 5 seats)
      const isAisle = j > 0 && j % 5 === 0 && j < seatsPerRow -1;

      if (isAisle) {
         row.push({
          id: `aisle-${i}-${j}`,
          seatNumber: `Aisle`,
          status: 'unavailable', // Aisles are not selectable
          price: 0,
          priceTier: 'standard', // doesn't matter
          aisle: true,
        });
      }

      row.push({
        id: `${i}-${j}`,
        seatNumber: `${String.fromCharCode(65 + i)}${j + 1}`,
        status: status,
        price: basePrice + (priceTier === 'premium' ? 500 : priceTier === 'economy' ? -200 : 0) + Math.floor(Math.random() * 100), // Price in THB
        priceTier: priceTier,
      });
    }
    seats.push(row);
  }
  return seats;
};

const mockSeatingLayouts: SeatingLayout[] = [
  {
    eventId: 'concert-123', // Rock Legends Live
    stagePosition: { top: '5%', left: '50%', width: '40%', height: '10%'},
    zones: [
      { id: 'floor-a', name: 'Floor A', seats: generateSeats(5, 15, 5000, 'premium'), mapPosition: { top: '20%', left: '35%', width: '30%', height: '20%' } },
      { id: 'sec-101', name: 'Section 101', seats: generateSeats(10, 20, 3500, 'standard'), mapPosition: { top: '45%', left: '10%', width: '25%', height: '30%' } },
      { id: 'sec-102', name: 'Section 102', seats: generateSeats(10, 20, 3500, 'standard'), mapPosition: { top: '45%', left: '65%', width: '25%', height: '30%' } },
      { id: 'balcony-201', name: 'Balcony 201', seats: generateSeats(8, 25, 2000, 'economy'), mapPosition: { top: '80%', left: '20%', width: '60%', height: '15%' } },
    ],
  },
  {
    eventId: 'sports-456', // Lakers vs Celtics
    stagePosition: { top: '45%', left: '50%', width: '40%', height: '10%'}, // Center court
    zones: [
      { id: 'courtside', name: 'Courtside', seats: generateSeats(3, 20, 15000, 'premium'), mapPosition: { top: '35%', left: '20%', width: '60%', height: '10%' } },
      { id: 'lower-100s', name: 'Lower 100s', seats: generateSeats(15, 25, 6000, 'standard'), mapPosition: { top: '20%', left: '10%', width: '80%', height: '30%' } },
      { id: 'upper-300s', name: 'Upper 300s', seats: generateSeats(20, 30, 2500, 'economy'), mapPosition: { top: '60%', left: '5%', width: '90%', height: '35%' } },
    ],
  },
   {
    eventId: 'conference-789', // Tech Innovators Summit
    stagePosition: { top: '5%', left: '50%', width: '50%', height: '10%'},
    zones: [
      { id: 'vip-front', name: 'VIP Front Rows', seats: generateSeats(5, 10, 10000, 'premium'), mapPosition: { top: '20%', left: '30%', width: '40%', height: '15%' } },
      { id: 'general-main', name: 'General Main', seats: generateSeats(20, 20, 7000, 'standard'), mapPosition: { top: '40%', left: '10%', width: '80%', height: '40%' } },
      { id: 'side-sections', name: 'Side Sections', seats: generateSeats(15, 8, 4000, 'economy'), mapPosition: { top: '30%', left: '5%', width: '15%', height: '30%' } },
      { id: 'side-sections-2', name: 'Side Sections B', seats: generateSeats(15, 8, 4000, 'economy'), mapPosition: { top: '30%', left: '80%', width: '15%', height: '30%' } },
    ],
  },
];

// Add default layouts for events without specific ones, ensuring all events have a layout
mockEvents.forEach(event => {
  if (!mockSeatingLayouts.find(layout => layout.eventId === event.id)) {
    mockSeatingLayouts.push({
      eventId: event.id,
      stagePosition: { top: '5%', left: '50%', width: '40%', height: '10%'}, // Default stage position
      zones: [ // Default zones
        { id: `${event.id}-zone-a`, name: 'Zone A', seats: generateSeats(10, 15, 2500, 'standard'), mapPosition: { top: '20%', left: '15%', width: '70%', height: '30%' } },
        { id: `${event.id}-zone-b`, name: 'Zone B', seats: generateSeats(8, 20, 1500, 'economy'), mapPosition: { top: '55%', left: '10%', width: '80%', height: '25%' } },
      ],
    });
  }
});


export async function getEvents(
  searchTerm?: string,
  date?: string,
  locationName?: string, 
  eventType?: EventCategory
): Promise<Event[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); 

  let events = mockEvents;

  if (searchTerm) {
    events = events.filter(event =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  if (date) { // This checks if any of the event's dates match the selected date.
    events = events.filter(event => event.dates.some(d => d.date === date && d.type === 'show'));
  }
  if (locationName) {
    events = events.filter(event => event.location.name === locationName);
  }
  if (eventType && eventType !== 'All') {
    events = events.filter(event => event.eventType === eventType);
  }
  // Sort events so that 'on_sale' and 'coming_soon' appear before 'sold_out' or 'off_sale'
  events.sort((a, b) => {
    const statusOrder: Record<Event['ticketStatus'] & string, number> = {
        'on_sale': 1,
        'coming_soon': 2,
        'unavailable': 3,
        'off_sale': 4,
        'sold_out': 5,
    };
    return (statusOrder[a.ticketStatus || 'unavailable'] || 6) - (statusOrder[b.ticketStatus || 'unavailable'] || 6);
  });


  return events;
}

export async function getEventById(eventId: string): Promise<Event | null> {
  await new Promise(resolve => setTimeout(resolve, 300)); 
  const event = mockEvents.find(e => e.id === eventId);
  if (event && event.dates) {
    // Sort dates: presale, onsale, then show dates by date
    event.dates.sort((a, b) => {
      const typeOrder: Record<EventDateType, number> = {
        'presale_nightrain': 1,
        'presale_general': 2,
        'onsale_public': 3,
        'show': 4,
        'other': 5,
      };
      const aTypeSort = typeOrder[a.type || 'other'];
      const bTypeSort = typeOrder[b.type || 'other'];
      if (aTypeSort !== bTypeSort) {
        return aTypeSort - bTypeSort;
      }
      // If types are the same (e.g. multiple 'show' dates), sort by date
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }
  return event || null;
}

export async function getSeatingLayoutByEventId(eventId: string): Promise<SeatingLayout | null> {
  await new Promise(resolve => setTimeout(resolve, 400)); 
  const layout = mockSeatingLayouts.find(l => l.eventId === eventId);
  return layout || null;
}

