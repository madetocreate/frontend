import { Customer } from './types';

export const MOCK_CUSTOMERS: Customer[] = process.env.NODE_ENV === 'development' ? [
  {
    id: 'cust-1',
    name: 'Maximilian Muster',
    company: 'Muster GmbH',
    email: 'm.muster@example.com',
    phone: '+49 123 456789',
    contextLine: '2 offene Vorgänge · letzter Kontakt vor 3 Tagen',
    status: 'active',
    tags: ['VIP', 'Bestandskunde'],
    important: true,
    openCases: 2,
    lastContactDays: 3
  },
  {
    id: 'cust-2',
    name: 'Sarah Schmidt',
    company: 'Design Studio',
    email: 'sarah@design-studio.io',
    contextLine: '0 offene Vorgänge · letzter Kontakt vor 1 Tag',
    status: 'neutral',
    tags: ['Neukunde'],
    important: false,
    openCases: 0,
    lastContactDays: 1
  },
  {
    id: 'cust-3',
    name: 'Julian Weber',
    company: 'Tech Solutions',
    email: 'j.weber@tech-sol.de',
    phone: '+49 151 987654',
    contextLine: '5 offene Vorgänge · letzter Kontakt vor 5 Tagen',
    status: 'active',
    tags: ['Wichtig', 'Projekt A'],
    important: true,
    openCases: 5,
    lastContactDays: 5
  },
  {
    id: 'cust-4',
    name: 'Elena Garcia',
    company: 'Global Export',
    email: 'garcia@global-ex.com',
    contextLine: '1 offener Vorgang · letzter Kontakt vor 12 Tagen',
    status: 'neutral',
    tags: ['International'],
    important: false,
    openCases: 1,
    lastContactDays: 12
  },
  {
    id: 'cust-5',
    name: 'Thomas Müller',
    company: 'Hausverwaltung Müller',
    email: 'mueller@hv-mueller.de',
    contextLine: '0 offene Vorgänge · letzter Kontakt vor 2 Stunden',
    status: 'active',
    tags: ['Lokal'],
    important: false,
    openCases: 0,
    lastContactDays: 0
  }
] : [];
