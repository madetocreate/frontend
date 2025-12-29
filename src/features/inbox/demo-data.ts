import { InboxItem } from './types';

export const DEMO_INBOX_ITEMS: InboxItem[] = [
  {
    id: 'demo-1',
    source: 'email',
    type: 'message',
    status: 'needs_action',
    title: 'Anfrage: Angebot für Website-Relaunch',
    preview: 'Hallo Team, wir würden gerne unsere Website überarbeiten lassen. Können wir dazu telefonieren?',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    customerName: 'Max Mustermann',
    customerEmail: 'max@musterfirma.de',
    meta: {
        priority: 'high',
        sentiment: 'positive'
    },
    suggestedActions: [
        { label: 'Termin vorschlagen', type: 'reply', prompt: 'Schlage einen Termin für nächste Woche vor.' },
        { label: 'Preisliste senden', type: 'reply', prompt: 'Sende unsere aktuelle Preisliste.' }
    ]
  },
  {
    id: 'demo-2',
    source: 'reviews',
    type: 'review',
    status: 'open',
    title: '5 Sterne Bewertung auf Google',
    preview: 'Super Service, sehr schnell und kompetent. Gerne wieder!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    customerName: 'Lisa Müller',
    meta: {
        rating: 5,
        platform: 'Google'
    },
    suggestedActions: [
        { label: 'Bedanken', type: 'reply', prompt: 'Bedanke dich freundlich für die tolle Bewertung.' }
    ]
  },
  {
    id: 'demo-3',
    source: 'website',
    type: 'lead',
    status: 'open',
    title: 'Neuer Lead über Kontaktformular',
    preview: 'Interesse an Enterprise Plan. Bitte um Rückruf.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    customerName: 'TechCorp Inc.',
    suggestedActions: [
        { label: 'Qualifizieren', type: 'action', prompt: 'Recherchiere TechCorp Inc.' }
    ]
  }
];

