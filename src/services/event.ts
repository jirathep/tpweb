import type { Event, SeatingLayout, Zone, Seat, Location, EventCategory } from '@/lib/types';

const mockEvents: Event[] = [
  {
    id: 'concert-123',
    name: 'Rock Legends Live',
    description: 'Experience the greatest hits from rock legends in an unforgettable night of music and spectacle. Featuring pyrotechnics and special guest appearances.',
    dates: [
      { date: '2024-09-15', time: '19:00' },
      { date: '2024-09-16', time: '20:00', rounds: ['Early Bird Show', 'Main Show'] }
    ],
    location: { lat: 34.0522, lng: -118.2437, name: 'Crypto.com Arena, LA' },
    eventType: 'Concert',
    imageUrl: 'https://picsum.photos/seed/concert1/400/500', // Adjusted aspect ratio
    bannerUrl: 'https://picsum.photos/seed/concert1banner/1600/600',
    tags: ['Rock', 'Live Music', 'Stadium'],
    organizer: 'LiveNation',
    soldOut: false,
  },
  {
    id: 'sports-456',
    name: 'Championship Finals: Lakers vs Celtics',
    description: 'The ultimate showdown! Witness basketball history as the Lakers take on the Celtics in the Championship Finals. Expect intense action and a star-studded crowd.',
    dates: [{ date: '2024-10-05', time: '18:30' }],
    location: { lat: 34.0430, lng: -118.2673, name: 'Staples Center, LA' },
    eventType: 'Sport',
    imageUrl: 'https://picsum.photos/seed/sports1/400/500', // Adjusted aspect ratio
    bannerUrl: 'https://picsum.photos/seed/sports1banner/1600/600',
    tags: ['Basketball', 'NBA', 'Finals'],
    organizer: 'NBA Commisioner Office',
    soldOut: true,
  },
  {
    id: 'conference-789',
    name: 'Tech Innovators Summit 2024',
    description: 'Join industry leaders, innovators, and visionaries at the Tech Innovators Summit. Discover the latest trends in AI, Web3, and sustainable tech.',
    dates: [
      { date: '2024-11-20', time: '09:00', rounds: ['Day 1 Keynotes', 'Day 1 Workshops'] },
      { date: '2024-11-21', time: '09:30', rounds: ['Day 2 Panels', 'Day 2 Networking'] }
    ],
    location: { lat: 37.7749, lng: -122.4194, name: 'Moscone Center, SF' },
    eventType: 'Conference', // Could be 'Exhibition' or 'Performance' based on new categories
    imageUrl: 'https://picsum.photos/seed/conference1/400/500', // Adjusted aspect ratio
    bannerUrl: 'https://picsum.photos/seed/conference1banner/1600/600',
    tags: ['Technology', 'AI', 'Networking'],
    organizer: 'TechCon Group',
    soldOut: false,
  },
   {
    id: 'concert-124',
    name: 'Pop Sensations Tour',
    description: 'Dance the night away with the biggest pop stars of today! A high-energy show with dazzling choreography and chart-topping hits.',
    dates: [
      { date: '2024-09-22', time: '19:30' }
    ],
    location: { lat: 40.7505, lng: -73.9934, name: 'Madison Square Garden, NYC' },
    eventType: 'Concert',
    imageUrl: 'https://picsum.photos/seed/concert2/400/500', // Adjusted aspect ratio
    bannerUrl: 'https://picsum.photos/seed/concert2banner/1600/600',
    tags: ['Pop', 'Live Music', 'Arena'],
    organizer: 'PopStar Productions',
    soldOut: false,
  },
  {
    id: 'sports-457',
    name: 'Grand Slam Tennis Finals',
    description: 'Witness world-class tennis as top players battle for the Grand Slam title. An event of tradition and excitement.',
    dates: [{ date: '2024-07-10', time: '14:00' }],
    location: { lat: 51.4340, lng: -0.2109, name: 'Wimbledon, London' },
    eventType: 'Sport',
    imageUrl: 'https://picsum.photos/seed/sports2/400/500', // Adjusted aspect ratio
    bannerUrl: 'https://picsum.photos/seed/sports2banner/1600/600',
    tags: ['Tennis', 'Grand Slam', 'Championship'],
    organizer: 'All England Club',
    soldOut: true,
  },
  {
    id: 'exhibition-101',
    name: 'Ancient Artifacts Revealed',
    description: 'Explore a stunning collection of recently unearthed ancient artifacts, offering a glimpse into long-lost civilizations. A journey through time.',
    dates: [{ date: '2024-12-01', time: '10:00' }, { date: '2024-12-31', time: '17:00' }], // Example of a date range
    location: { lat: 48.8606, lng: 2.3376, name: 'Louvre Museum, Paris' },
    eventType: 'Exhibition',
    imageUrl: 'https://picsum.photos/seed/exhibit1/400/500',
    bannerUrl: 'https://picsum.photos/seed/exhibit1banner/1600/600',
    tags: ['History', 'Art', 'Museum'],
    organizer: 'National Heritage Board',
    soldOut: false,
  },
   {
    id: 'performance-202',
    name: 'The Magical Mystery Show',
    description: 'A breathtaking theatrical performance filled with illusions, captivating storytelling, and spectacular stage effects. Fun for the whole family!',
    dates: [{ date: '2024-10-25', time: '19:00' }, { date: '2024-10-26', time: '14:00' }, { date: '2024-10-26', time: '19:00' }],
    location: { lat: 51.5099, lng: -0.1180, name: 'West End Theatre, London' },
    eventType: 'Performance',
    imageUrl: 'https://picsum.photos/seed/performance1/400/500',
    bannerUrl: 'https://picsum.photos/seed/performance1banner/1600/600',
    tags: ['Theatre', 'Magic', 'Family Show'],
    organizer: 'Mysteria Productions',
    soldOut: false,
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
        price: basePrice + (priceTier === 'premium' ? 50 : priceTier === 'economy' ? -20 : 0) + Math.floor(Math.random() * 10), // Add slight price variation
        priceTier: priceTier,
      });
    }
    seats.push(row);
  }
  return seats;
};

const mockSeatingLayouts: SeatingLayout[] = [
  {
    eventId: 'concert-123',
    stagePosition: { top: '5%', left: '50%', width: '40%', height: '10%'},
    zones: [
      { id: 'floor-a', name: 'Floor A', seats: generateSeats(5, 15, 150, 'premium'), mapPosition: { top: '20%', left: '35%', width: '30%', height: '20%' } },
      { id: 'sec-101', name: 'Section 101', seats: generateSeats(10, 20, 100, 'standard'), mapPosition: { top: '45%', left: '10%', width: '25%', height: '30%' } },
      { id: 'sec-102', name: 'Section 102', seats: generateSeats(10, 20, 100, 'standard'), mapPosition: { top: '45%', left: '65%', width: '25%', height: '30%' } },
      { id: 'balcony-201', name: 'Balcony 201', seats: generateSeats(8, 25, 60, 'economy'), mapPosition: { top: '80%', left: '20%', width: '60%', height: '15%' } },
    ],
  },
  {
    eventId: 'sports-456', // Basketball court layout
    stagePosition: { top: '45%', left: '50%', width: '40%', height: '10%'}, // Center court representation
    zones: [
      { id: 'courtside', name: 'Courtside', seats: generateSeats(3, 20, 500, 'premium'), mapPosition: { top: '35%', left: '20%', width: '60%', height: '10%' } },
      { id: 'lower-100s', name: 'Lower 100s', seats: generateSeats(15, 25, 250, 'standard'), mapPosition: { top: '20%', left: '10%', width: '80%', height: '30%' } }, // Wraparound style
      { id: 'upper-300s', name: 'Upper 300s', seats: generateSeats(20, 30, 100, 'economy'), mapPosition: { top: '60%', left: '5%', width: '90%', height: '35%' } },
    ],
  },
   {
    eventId: 'conference-789', // Conference hall layout
    stagePosition: { top: '5%', left: '50%', width: '50%', height: '10%'},
    zones: [
      { id: 'vip-front', name: 'VIP Front Rows', seats: generateSeats(5, 10, 200, 'premium'), mapPosition: { top: '20%', left: '30%', width: '40%', height: '15%' } },
      { id: 'general-main', name: 'General Main', seats: generateSeats(20, 20, 120, 'standard'), mapPosition: { top: '40%', left: '10%', width: '80%', height: '40%' } },
      { id: 'side-sections', name: 'Side Sections', seats: generateSeats(15, 8, 80, 'economy'), mapPosition: { top: '30%', left: '5%', width: '15%', height: '30%' } },
      { id: 'side-sections-2', name: 'Side Sections B', seats: generateSeats(15, 8, 80, 'economy'), mapPosition: { top: '30%', left: '80%', width: '15%', height: '30%' } },
    ],
  },
  // Add default layouts for events without specific ones
];
mockEvents.forEach(event => {
  if (!mockSeatingLayouts.find(layout => layout.eventId === event.id)) {
    mockSeatingLayouts.push({
      eventId: event.id,
      stagePosition: { top: '5%', left: '50%', width: '40%', height: '10%'},
      zones: [
        { id: 'default-zone-a', name: 'Zone A', seats: generateSeats(10, 15, 80, 'standard'), mapPosition: { top: '20%', left: '15%', width: '70%', height: '30%' } },
        { id: 'default-zone-b', name: 'Zone B', seats: generateSeats(8, 20, 50, 'economy'), mapPosition: { top: '55%', left: '10%', width: '80%', height: '25%' } },
      ],
    });
  }
});


export async function getEvents(
  searchTerm?: string,
  date?: string,
  locationName?: string, // Changed from Location object to name string for simplicity in mock
  eventType?: EventCategory
): Promise<Event[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

  let events = mockEvents;

  if (searchTerm) {
    events = events.filter(event =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  if (date) {
    events = events.filter(event => event.dates.some(d => d.date === date));
  }
  if (locationName) {
    events = events.filter(event => event.location.name === locationName);
  }
  if (eventType && eventType !== 'All') {
    events = events.filter(event => event.eventType === eventType);
  }

  return events;
}

export async function getEventById(eventId: string): Promise<Event | null> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  const event = mockEvents.find(e => e.id === eventId);
  return event || null;
}

export async function getSeatingLayoutByEventId(eventId: string): Promise<SeatingLayout | null> {
  await new Promise(resolve => setTimeout(resolve, 400)); // Simulate API delay
  const layout = mockSeatingLayouts.find(l => l.eventId === eventId);
  return layout || null;
}

