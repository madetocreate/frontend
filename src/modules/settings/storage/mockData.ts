import { MemoryItem, ChatSource, FileItem } from './types';

export const MOCK_MEMORIES: MemoryItem[] = [
  {
    id: 'm1',
    title: 'Präferenz: Fensterplatz',
    summary: 'Kunde bevorzugt bei Reservierungen immer einen Platz am Fenster.',
    fullText: 'Der Kunde Max Mustermann hat in mehreren Chats (z.B. vom 12.01. und 05.02.) explizit nach einem Fensterplatz gefragt. Er schätzt die Aussicht und die Ruhe in diesem Bereich.',
    tags: ['Präferenz', 'Service'],
    source: 'chat',
    confidence: 'confirmed',
    timestamp: 'vor 2 Tagen'
  },
  {
    id: 'm2',
    title: 'Allergie: Erdnüsse',
    summary: 'Schwere Erdnussallergie bei allen Begleitpersonen beachten.',
    fullText: 'Bei der letzten Buchung über Telegram wurde eine schwere Erdnussallergie für die gesamte Gruppe gemeldet. Dies muss im CRM und bei jeder Bestellung hinterlegt sein.',
    tags: ['Wichtig', 'Gesundheit'],
    source: 'chat',
    confidence: 'confirmed',
    timestamp: 'Gestern'
  },
  {
    id: 'm3',
    title: 'Projekt: Cloud Migration',
    summary: 'Kunde plant Migration der internen Server in die Cloud ab Q3.',
    fullText: 'Aus dem Strategie-Dokument "IT-Roadmap_2025.pdf" geht hervor, dass ab dem dritten Quartal eine Migration der On-Premise Server zu AWS geplant ist.',
    tags: ['Projekt', 'IT'],
    source: 'document',
    confidence: 'unconfirmed',
    timestamp: 'vor 1 Woche'
  }
];

export const MOCK_CHATS: ChatSource[] = [
  {
    id: 'c1',
    title: 'Chat vom 12.01.',
    snippet: 'Können wir den Tisch für 19:00 Uhr am Fenster reservieren?',
    channel: 'website',
    date: '12.01.2025',
    summary: 'Anfrage für eine Tischreservierung mit Fokus auf Platzierung am Fenster.'
  },
  {
    id: 'c2',
    title: 'Chat vom 15.01.',
    snippet: 'Vielen Dank für den tollen Service am Wochenende!',
    channel: 'telegram',
    date: '15.01.2025',
    summary: 'Positives Feedback zum Service-Erlebnis am vergangenen Wochenende.'
  }
];

export const MOCK_FILES: FileItem[] = [
  {
    id: 'f1',
    filename: 'Rechnung_Januar.pdf',
    type: 'pdf',
    date: '31.01.2025',
    size: '1.2 MB',
    summary: 'Monatsabrechnung für Januar 2025. Alle Posten korrekt.'
  },
  {
    id: 'f2',
    filename: 'IT-Roadmap_2025.pdf',
    type: 'pdf',
    date: '10.01.2025',
    size: '4.5 MB',
    summary: 'Strategisches Dokument zur IT-Infrastruktur Planung für das Jahr 2025.'
  }
];

