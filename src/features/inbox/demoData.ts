import { InboxItem } from './types';

/**
 * Generate demo inbox items
 */
export function getDemoInboxItems(): InboxItem[] {
  const now = new Date();
  const items: InboxItem[] = [];

  // Email items
  items.push({
    id: 'email-1',
    source: 'email',
    type: 'message',
    status: 'needs_action',
    title: 'Anfrage zu Produktpreisen',
    preview: 'Hallo, ich interessiere mich für Ihre Produkte und würde gerne mehr über die Preise erfahren...',
    timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    customerName: 'Max Mustermann',
    customerEmail: 'max@example.com',
  });

  items.push({
    id: 'email-2',
    source: 'email',
    type: 'message',
    status: 'open',
    title: 'Bestätigung der Bestellung',
    preview: 'Vielen Dank für Ihre Bestellung. Ihre Bestellung #12345 wurde erfolgreich aufgenommen...',
    timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
    customerName: 'Anna Schmidt',
    customerEmail: 'anna@example.com',
  });

  // Telegram items
  items.push({
    id: 'telegram-1',
    source: 'telegram',
    type: 'message',
    status: 'needs_action',
    title: 'Frage zu Lieferzeit',
    preview: 'Hallo, wann kann ich mit der Lieferung rechnen?',
    timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
    customerName: 'Tom Weber',
  });

  items.push({
    id: 'telegram-2',
    source: 'telegram',
    type: 'message',
    status: 'open',
    title: 'Rückfrage zu Rechnung',
    preview: 'Können Sie mir bitte die Rechnung noch einmal zusenden?',
    timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
    customerName: 'Lisa Müller',
  });

  // Reviews
  items.push({
    id: 'review-1',
    source: 'reviews',
    type: 'review',
    status: 'needs_action',
    title: 'Kritische Bewertung - 2 Sterne',
    preview: 'Das Produkt hat meine Erwartungen nicht erfüllt. Die Qualität war enttäuschend...',
    timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
    customerName: 'Peter Klein',
    meta: { rating: 2, platform: 'Google' },
  });

  items.push({
    id: 'review-2',
    source: 'reviews',
    type: 'review',
    status: 'open',
    title: 'Positive Bewertung - 5 Sterne',
    preview: 'Ausgezeichnetes Produkt! Sehr zufrieden mit dem Service und der Qualität.',
    timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
    customerName: 'Sarah Becker',
    meta: { rating: 5, platform: 'Trustpilot' },
  });

  // Website leads
  items.push({
    id: 'website-1',
    source: 'website',
    type: 'lead',
    status: 'needs_action',
    title: 'Neuer Lead: Kontaktformular',
    preview: 'Interesse an Premium-Paket. Budget: 5000€/Monat',
    timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
    customerName: 'Michael Groß',
    customerEmail: 'michael@company.com',
    meta: { formType: 'contact', budget: 5000 },
  });

  items.push({
    id: 'website-2',
    source: 'website',
    type: 'lead',
    status: 'open',
    title: 'Newsletter-Anmeldung',
    preview: 'Neue Newsletter-Anmeldung mit Interesse an Produkt-Updates',
    timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
    customerEmail: 'newsletter@example.com',
    meta: { formType: 'newsletter' },
  });

  // Phone calls
  items.push({
    id: 'phone-1',
    source: 'phone',
    type: 'call',
    status: 'needs_action',
    title: 'Verpasster Anruf',
    preview: 'Anruf von +49 123 456789 - Dauer: 0:00 (nicht erreicht)',
    timestamp: new Date(now.getTime() - 45 * 60 * 1000), // 45 minutes ago
    customerName: 'Dr. Martin Fischer',
    meta: { phoneNumber: '+49 123 456789', duration: 0, missed: true },
  });

  items.push({
    id: 'phone-2',
    source: 'phone',
    type: 'call',
    status: 'open',
    title: 'Anruf - Beratung',
    preview: 'Anruf von +49 987 654321 - Dauer: 5:23',
    timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
    customerName: 'Julia Hoffmann',
    meta: { phoneNumber: '+49 987 654321', duration: 323, missed: false },
  });

  // More items for variety
  items.push({
    id: 'email-3',
    source: 'email',
    type: 'message',
    status: 'open',
    title: 'Newsletter-Abonnement',
    preview: 'Vielen Dank für Ihr Interesse an unserem Newsletter...',
    timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000), // 8 hours ago
    customerEmail: 'subscriber@example.com',
  });

  items.push({
    id: 'telegram-3',
    source: 'telegram',
    type: 'message',
    status: 'archived',
    title: 'Allgemeine Frage',
    preview: 'Gibt es eine Möglichkeit, die Bestellung zu ändern?',
    timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    customerName: 'Robert Lang',
  });

  items.push({
    id: 'review-3',
    source: 'reviews',
    type: 'review',
    status: 'open',
    title: 'Neutrale Bewertung - 3 Sterne',
    preview: 'Das Produkt ist okay, aber es gibt Raum für Verbesserungen.',
    timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    customerName: 'Daniel Koch',
    meta: { rating: 3, platform: 'Amazon' },
  });

  // Sort by timestamp (newest first)
  return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

