import { Customer, CustomerEvent } from './types';

export function getDemoCustomers(): Customer[] {
  const now = new Date();
  const customers: Customer[] = [
    {
      id: 'customer-1',
      type: 'company',
      displayName: 'Tech Solutions GmbH',
      companyName: 'Tech Solutions GmbH',
      email: 'info@techsolutions.de',
      phone: '+49 123 456789',
      tags: ['stammkunde'],
      lastActivityAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      lastActivitySummary: 'E-Mail: Anfrage zu Produktpreisen',
      counters: { openItems: 2 },
    },
    {
      id: 'customer-2',
      type: 'contact',
      displayName: 'Max Mustermann',
      email: 'max@example.com',
      phone: '+49 987 654321',
      tags: ['lead'],
      lastActivityAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      lastActivitySummary: 'Telegram: Frage zu Lieferzeit',
      counters: { openItems: 1 },
    },
    {
      id: 'customer-3',
      type: 'company',
      displayName: 'Premium Services AG',
      companyName: 'Premium Services AG',
      email: 'contact@premiumservices.de',
      tags: ['vip', 'stammkunde'],
      lastActivityAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivitySummary: 'Review: 5 Sterne Bewertung',
      counters: { openItems: 0 },
    },
    {
      id: 'customer-4',
      type: 'contact',
      displayName: 'Anna Schmidt',
      email: 'anna@example.com',
      tags: ['stammkunde'],
      lastActivityAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      lastActivitySummary: 'E-Mail: Bestätigung der Bestellung',
      counters: { openItems: 0 },
    },
    {
      id: 'customer-5',
      type: 'company',
      displayName: 'Startup Innovations',
      companyName: 'Startup Innovations',
      email: 'hello@startupinnovations.com',
      tags: ['lead'],
      lastActivityAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      lastActivitySummary: 'Website: Neuer Lead - Kontaktformular',
      counters: { openItems: 1 },
    },
    {
      id: 'customer-6',
      type: 'contact',
      displayName: 'Dr. Martin Fischer',
      email: 'martin.fischer@example.com',
      phone: '+49 555 123456',
      tags: ['vip'],
      lastActivityAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
      lastActivitySummary: 'Anruf: Verpasster Anruf',
      counters: { openItems: 1 },
    },
    {
      id: 'customer-7',
      type: 'company',
      displayName: 'Global Trading Ltd.',
      companyName: 'Global Trading Ltd.',
      email: 'info@globaltrading.com',
      tags: ['stammkunde'],
      lastActivityAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivitySummary: 'Dokument: Vertrag hochgeladen',
      counters: { openItems: 0 },
    },
    {
      id: 'customer-8',
      type: 'contact',
      displayName: 'Sarah Becker',
      email: 'sarah@example.com',
      tags: ['stammkunde'],
      lastActivityAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      lastActivitySummary: 'Review: Positive Bewertung - 5 Sterne',
      counters: { openItems: 0 },
    },
    {
      id: 'customer-9',
      type: 'company',
      displayName: 'Digital Solutions Inc.',
      companyName: 'Digital Solutions Inc.',
      email: 'contact@digitalsolutions.com',
      tags: ['lead'],
      lastActivityAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      lastActivitySummary: 'E-Mail: Newsletter-Anmeldung',
      counters: { openItems: 0 },
    },
    {
      id: 'customer-10',
      type: 'contact',
      displayName: 'Tom Weber',
      email: 'tom@example.com',
      phone: '+49 111 222333',
      tags: ['lead'],
      lastActivityAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      lastActivitySummary: 'Telegram: Rückfrage zu Rechnung',
      counters: { openItems: 1 },
    },
  ];

  return customers;
}

export function getDemoCustomerEvents(customerId: string): CustomerEvent[] {
  const now = new Date();
  const events: CustomerEvent[] = [];

  // Generate events for specific customers
  if (customerId === 'customer-1') {
    events.push(
      {
        id: 'event-1-1',
        customerId: 'customer-1',
        channel: 'email',
        type: 'message',
        title: 'Anfrage zu Produktpreisen',
        preview: 'Hallo, ich interessiere mich für Ihre Produkte und würde gerne mehr über die Preise erfahren...',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'event-1-2',
        customerId: 'customer-1',
        channel: 'email',
        type: 'message',
        title: 'Bestätigung der Bestellung',
        preview: 'Vielen Dank für Ihre Bestellung. Ihre Bestellung #12345 wurde erfolgreich aufgenommen...',
        timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'event-1-3',
        customerId: 'customer-1',
        channel: 'reviews',
        type: 'review',
        title: 'Positive Bewertung - 5 Sterne',
        preview: 'Ausgezeichnetes Produkt! Sehr zufrieden mit dem Service und der Qualität.',
        timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        meta: { rating: 5, platform: 'Google' },
      },
      {
        id: 'event-1-4',
        customerId: 'customer-1',
        channel: 'docs',
        type: 'doc',
        title: 'Vertrag hochgeladen',
        preview: 'Vertrag_2024.pdf',
        timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      }
    );
  } else if (customerId === 'customer-2') {
    events.push(
      {
        id: 'event-2-1',
        customerId: 'customer-2',
        channel: 'telegram',
        type: 'message',
        title: 'Frage zu Lieferzeit',
        preview: 'Hallo, wann kann ich mit der Lieferung rechnen?',
        timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'event-2-2',
        customerId: 'customer-2',
        channel: 'telegram',
        type: 'message',
        title: 'Rückfrage zu Rechnung',
        preview: 'Können Sie mir bitte die Rechnung noch einmal zusenden?',
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'event-2-3',
        customerId: 'customer-2',
        channel: 'reviews',
        type: 'review',
        title: 'Kritische Bewertung - 2 Sterne',
        preview: 'Das Produkt hat meine Erwartungen nicht erfüllt. Die Qualität war enttäuschend...',
        timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        meta: { rating: 2, platform: 'Trustpilot' },
      }
    );
  } else if (customerId === 'customer-3') {
    events.push(
      {
        id: 'event-3-1',
        customerId: 'customer-3',
        channel: 'reviews',
        type: 'review',
        title: 'Positive Bewertung - 5 Sterne',
        preview: 'Ausgezeichnetes Produkt! Sehr zufrieden mit dem Service und der Qualität.',
        timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        meta: { rating: 5, platform: 'Google' },
      },
      {
        id: 'event-3-2',
        customerId: 'customer-3',
        channel: 'email',
        type: 'message',
        title: 'Anfrage zu Premium-Paket',
        preview: 'Interesse an Premium-Paket. Budget: 5000€/Monat',
        timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'event-3-3',
        customerId: 'customer-3',
        channel: 'phone',
        type: 'call',
        title: 'Anruf - Beratung',
        preview: 'Anruf von +49 123 456789 - Dauer: 12:34',
        timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        meta: { duration: 754, missed: false },
      }
    );
  } else {
    // Default events for other customers
    events.push(
      {
        id: `event-${customerId}-1`,
        customerId,
        channel: 'email',
        type: 'message',
        title: 'E-Mail Nachricht',
        preview: 'Standard E-Mail Nachricht...',
        timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: `event-${customerId}-2`,
        customerId,
        channel: 'reviews',
        type: 'review',
        title: 'Bewertung - 4 Sterne',
        preview: 'Gute Erfahrung mit dem Produkt.',
        timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        meta: { rating: 4 },
      }
    );
  }

  // Sort by timestamp (newest first)
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

