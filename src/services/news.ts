import type { NewsArticle } from '@/lib/types';

const mockNews: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Rock Legends Live Adds Extra Date Due to Popular Demand!',
    summary: 'Fans rejoice as the highly anticipated Rock Legends Live concert adds a second show date. Tickets for the new date go on sale next Monday.',
    date: '2024-08-15',
    imageUrl: 'https://picsum.photos/seed/news1/400/300',
  },
  {
    id: 'news-2',
    title: 'Tech Innovators Summit Announces Keynote Speakers',
    summary: 'The Tech Innovators Summit has revealed its star-studded lineup of keynote speakers, including CEOs of major tech companies and pioneering researchers.',
    date: '2024-08-10',
    imageUrl: 'https://picsum.photos/seed/news2/400/300',
  },
  {
    id: 'news-3',
    title: 'Early Bird Tickets for Championship Finals Sold Out in Minutes',
    summary: 'The first batch of tickets for the Lakers vs Celtics Championship Finals were snapped up by eager fans within minutes of release.',
    date: '2024-08-05',
     imageUrl: 'https://picsum.photos/seed/news3/400/300',
  },
  {
    id: 'news-4',
    title: 'New Mobile App Features for Prompt eTicket Users',
    summary: 'Prompt eTicket rolls out an updated mobile app with enhanced seat selection view and faster checkout process. Download the update today!',
    date: '2024-07-28',
  }
];

export async function getNews(): Promise<NewsArticle[]> {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API delay
  return mockNews;
}

export async function getNewsArticleById(articleId: string): Promise<NewsArticle | null> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
  const article = mockNews.find(a => a.id === articleId);
  return article || null;
}
