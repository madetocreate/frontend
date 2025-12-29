import { Notification } from './types';

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'inbox',
    title: 'Neue E-Mail von Max Mustermann',
    subline: 'Tischreservierung für morgen Abend...',
    timestamp: 'vor 5 Min.',
    unread: true,
    done: false,
    targetId: 'thread-1'
  },
  {
    id: '2',
    type: 'customer',
    title: 'Sarah Schmidt hat das Profil aktualisiert',
    subline: 'Neue Telefonnummer hinterlegt.',
    timestamp: 'vor 1 Std.',
    unread: true,
    done: false,
    targetId: 'cust-2'
  },
  {
    id: '3',
    type: 'document',
    title: 'Analyse abgeschlossen: IT-Roadmap_2025.pdf',
    subline: 'KI hat 3 kritische Risiken gefunden.',
    timestamp: 'vor 3 Std.',
    unread: false,
    done: false,
    targetId: 'doc-1'
  },
  {
    id: '4',
    type: 'review',
    title: 'Neue 5-Sterne Bewertung auf Google',
    subline: '"Fantastischer Service, gerne wieder!"',
    timestamp: 'Gestern',
    unread: false,
    done: true,
    targetId: 'rev-4'
  },
  {
    id: '5',
    type: 'growth',
    title: 'Newsletter Kampagne "Winter Sale" bereit',
    subline: 'Vorschau der Betreffzeilen generiert.',
    timestamp: 'vor 2 Tagen',
    unread: false,
    done: false,
    targetId: 'growth-5'
  }
];

