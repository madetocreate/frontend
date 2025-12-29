/**
 * Dashboard Card Service
 * Konvertiert Dashboard-Views in ChatCards für das Chat-First Design
 */

import type { ChatCard, InsightCardPayload, ListCardPayload } from '@/components/chat/cards/types'
import type { DocumentsView } from '@/components/documents/DocumentsSidebarWidget'
import type { CustomersView } from '@/components/customers/CustomersSidebarWidget'
import type { ShieldView } from '@/components/shield/ShieldSidebarWidget'
import type { TelephonyView } from '@/components/telephony/TelephonySidebarWidget'
import type { WebsiteView } from '@/components/website/WebsiteSidebarWidget'

/**
 * REMOVED: All Growth functions have been removed as the Growth module is no longer used
 */

/**
 * Erstellt eine Card für Documents View
 */
export function createDocumentsCard(view: DocumentsView): ListCardPayload {
  const viewLabels: Record<DocumentsView, { title: string; subtitle: string }> = {
    all: { title: 'Alle Dokumente', subtitle: 'Übersicht aller Dokumente' },
    uploads: { title: 'Hochgeladen', subtitle: 'Zuletzt hochgeladene Dokumente' },
    invoices: { title: 'Rechnungen', subtitle: 'Verwaltete Rechnungen und Belege' },
    contracts: { title: 'Verträge', subtitle: 'Aktive und archivierte Verträge' },
    shared: { title: 'Geteilt', subtitle: 'Mit anderen geteilte Dokumente' },
  }

  // Mock-Daten für Dokumente - später durch API ersetzen
  const mockDocuments = process.env.NODE_ENV === 'development' ? [
    { id: '1', name: 'Projektplan Q1.pdf', type: 'PDF', size: '2.4 MB', date: 'heute', status: 'active' },
    { id: '2', name: 'Rechnung_1023.pdf', type: 'PDF', size: '145 KB', date: 'gestern', status: 'active' },
    { id: '3', name: 'Meeting Notes.docx', type: 'DOCX', size: '12 KB', date: 'vor 3 Tagen', status: 'active' },
    { id: '4', name: 'Präsentation.pptx', type: 'PPTX', size: '5.1 MB', date: 'letzte Woche', status: 'active' },
    { id: '5', name: 'Vertrag_Entwurf.pdf', type: 'PDF', size: '1.2 MB', date: '01.12.2025', status: 'draft' },
  ] : []

  const filteredDocs = view === 'all' 
    ? mockDocuments 
    : view === 'invoices'
    ? mockDocuments.filter(d => d.name.toLowerCase().includes('rechnung'))
    : view === 'contracts'
    ? mockDocuments.filter(d => d.name.toLowerCase().includes('vertrag'))
    : mockDocuments

  return {
    type: 'list',
    id: `documents-${view}`,
    title: viewLabels[view].title,
    subtitle: viewLabels[view].subtitle,
    createdAt: Date.now(),
    source: { moduleToken: 'documents' },
    columns: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'type', label: 'Typ', type: 'text', align: 'center' },
      { key: 'size', label: 'Größe', type: 'text', align: 'right' },
      { key: 'date', label: 'Datum', type: 'date', align: 'right' },
    ],
    rows: filteredDocs.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      size: doc.size,
      date: doc.date,
      status: doc.status,
    })),
    // Keine actions mehr - AISuggestionGrid wird direkt in der Card gerendert
    actions: [],
  }
}

/**
 * Erstellt eine Card für Customers View
 */
export function createCustomersCard(view: CustomersView): ListCardPayload {
  const viewLabels: Record<CustomersView, { title: string; subtitle: string }> = {
    all: { title: 'Alle Kunden', subtitle: 'Übersicht aller Kunden' },
    opportunities: { title: 'Vertriebschancen', subtitle: 'Aktive Sales-Opportunities' },
    active: { title: 'Aktive Kunden', subtitle: 'Kunden mit aktiven Verträgen' },
    archived: { title: 'Archivierte Kunden', subtitle: 'Nicht mehr aktive Kunden' },
  }

  // Mock-Daten für Kunden
  const mockCustomers = process.env.NODE_ENV === 'development' ? [
    { id: 'c1', name: 'Acme Corp', company: 'Acme Corp', status: 'active', revenue: '€12.5k', lastContact: 'Heute' },
    { id: 'c2', name: 'Globex Inc', company: 'Globex Inc', status: 'pending', revenue: '€4.2k', lastContact: 'Gestern' },
    { id: 'c3', name: 'Soylent Corp', company: 'Soylent Corp', status: 'error', revenue: '€0.0k', lastContact: 'Vor 5 Tagen' },
    { id: 'c4', name: 'Umbrella Corp', company: 'Umbrella Corp', status: 'active', revenue: '€55.2k', lastContact: 'Vor 2 Tagen' },
  ] : []

  const filteredCustomers = view === 'all'
    ? mockCustomers
    : view === 'opportunities'
    ? mockCustomers.filter(c => c.status === 'pending')
    : view === 'active'
    ? mockCustomers.filter(c => c.status === 'active')
    : mockCustomers.filter(c => c.status === 'error')

  return {
    type: 'list',
    id: `customers-${view}`,
    title: viewLabels[view].title,
    subtitle: viewLabels[view].subtitle,
    createdAt: Date.now(),
    source: { moduleToken: 'customers' },
    columns: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'status', label: 'Status', type: 'status', align: 'center' },
      { key: 'revenue', label: 'Umsatz', type: 'currency', align: 'right' },
      { key: 'lastContact', label: 'Letzter Kontakt', type: 'text', align: 'right' },
    ],
    rows: filteredCustomers.map(customer => ({
      id: customer.id,
      name: customer.name,
      status: customer.status,
      revenue: customer.revenue,
      lastContact: customer.lastContact,
    })),
    // Keine actions mehr - AISuggestionGrid wird direkt in der Card gerendert
    actions: [],
  }
}

/**
 * Erstellt eine Card für Shield View
 */
export function createShieldCard(view: ShieldView): InsightCardPayload {
  const viewData: Record<ShieldView, { title: string; content: string; metrics: any[] }> = {
    overview: {
      title: 'AI Shield Übersicht',
      content: 'Systemstatus und Sicherheits-Metriken des AI Shield Systems.',
      metrics: [
        { label: 'System Status', value: 'Operational', trend: 'up' },
        { label: 'MCP Server', value: '3', trend: 'neutral' },
        { label: 'Aktive Policies', value: 'Active', trend: 'neutral' },
      ],
    },
    registry: {
      title: 'MCP Registry',
      content: 'Registrierte MCP Server und Tool-Provider.',
      metrics: [
        { label: 'Registriert', value: '3', trend: 'neutral' },
        { label: 'Aktiv', value: '3', trend: 'up' },
        { label: 'Fehler', value: '0', trend: 'neutral' },
      ],
    },
    policies: {
      title: 'Richtlinien',
      content: 'Aktive Sicherheitsrichtlinien und Policies.',
      metrics: [
        { label: 'Aktive Policies', value: '5', trend: 'neutral' },
        { label: 'Letzte Änderung', value: 'Heute', trend: 'neutral' },
      ],
    },
    logs: {
      title: 'Audit Logs',
      content: 'Letzte Sicherheits-Events und Audit-Logs.',
      metrics: [
        { label: 'Events (24h)', value: '142', trend: 'up', change: '+12%' },
        { label: 'Warnungen', value: '2', trend: 'down', change: '-50%' },
      ],
    },
  }

  const data = viewData[view]

  return {
    type: 'insight',
    id: `shield-${view}`,
    title: data.title,
    content: data.content,
    createdAt: Date.now(),
    source: { moduleToken: 'shield' },
    metrics: data.metrics,
    // Keine actions mehr - AISuggestionGrid wird direkt in der Card gerendert
    actions: [],
  }
}

/**
 * Erstellt eine Card für Telephony View
 */
export function createTelephonyCard(view: TelephonyView): InsightCardPayload {
  const viewData: Record<TelephonyView, { title: string; content: string; metrics: any[] }> = {
    overview: {
      title: 'Telefon-Bot Übersicht',
      content: 'Status und Metriken des Telefon-Bots.',
      metrics: [
        { label: 'Anrufe (24h)', value: '24', trend: 'up', change: '+15%' },
        { label: 'Durchschnittliche Dauer', value: '3:42', trend: 'neutral' },
        { label: 'Erfolgsrate', value: '87%', trend: 'up', change: '+5%' },
      ],
    },
    logs: {
      title: 'Anruf-Logs',
      content: 'Übersicht aller Telefonanrufe und Gespräche.',
      metrics: [
        { label: 'Heute', value: '12', trend: 'neutral' },
        { label: 'Diese Woche', value: '84', trend: 'up', change: '+8%' },
      ],
    },
    numbers: {
      title: 'Rufnummern',
      content: 'Verwaltung und Status Ihrer Rufnummern (Demo).',
      metrics: [
        { label: 'Nummern', value: '1', trend: 'neutral' },
      ],
    },
    configuration: {
      title: 'Konfiguration',
      content: 'Einstellungen und Konfiguration des Telefon-Bots.',
      metrics: [
        { label: 'Sprachmodelle', value: '2', trend: 'neutral' },
      ],
    },
    settings: {
      title: 'Einstellungen',
      content: 'Zentrale Einstellungen für Telefonie (Demo).',
      metrics: [
        { label: 'Optionen', value: '—', trend: 'neutral' },
      ],
    },
  }

  const data = viewData[view]

  return {
    type: 'insight',
    id: `telephony-${view}`,
    title: data.title,
    content: data.content,
    createdAt: Date.now(),
    source: { moduleToken: 'phone' },
    metrics: data.metrics,
    // Keine actions mehr - AISuggestionGrid wird direkt in der Card gerendert
    actions: [],
  }
}

/**
 * Erstellt eine Card für Website View
 */
export function createWebsiteCard(view: WebsiteView): InsightCardPayload {
  const viewData: Record<WebsiteView, { title: string; content: string; metrics: any[] }> = {
    overview: {
      title: 'Website-Bot Übersicht',
      content: 'Status und Performance des Website-Chat-Bots.',
      metrics: [
        { label: 'Chats (24h)', value: '156', trend: 'up', change: '+22%' },
        { label: 'Conversion Rate', value: '12.5%', trend: 'up', change: '+2.1%' },
        { label: 'Durchschnittliche Antwortzeit', value: '1.2s', trend: 'down', change: '-15%' },
      ],
    },
    conversations: {
      title: 'Besucher-Chats',
      content: 'Übersicht aller Website-Chat-Gespräche.',
      metrics: [
        { label: 'Aktive Chats', value: '8', trend: 'neutral' },
        { label: 'Heute', value: '42', trend: 'up', change: '+18%' },
      ],
    },
    setup: {
      title: 'Setup',
      content: 'Setup und Konfiguration des Website-Bots.',
      metrics: [],
    },
    content: {
      title: 'Wissensbasis',
      content: 'Trainingsdaten und Content für den Website-Bot.',
      metrics: [
        { label: 'Dokumente', value: '24', trend: 'neutral' },
        { label: 'Indiziert', value: '24', trend: 'up', change: '+2' },
      ],
    },
    appearance: {
      title: 'Erscheinungsbild',
      content: 'Design und Anpassungen des Chat-Widgets.',
      metrics: [
        { label: 'Themes', value: '2', trend: 'neutral' },
      ],
    },
  }

  const data = viewData[view]

  return {
    type: 'insight',
    id: `website-${view}`,
    title: data.title,
    content: data.content,
    createdAt: Date.now(),
    source: { moduleToken: 'website' },
    metrics: data.metrics,
    // Keine actions mehr - AISuggestionGrid wird direkt in der Card gerendert
    actions: [],
  }
}

/**
 * Hauptfunktion: Erstellt eine Card basierend auf Modul und View
 */
export function createDashboardCard(
  module: 'documents' | 'customers' | 'shield' | 'phone' | 'website',
  view: string
): ChatCard | null {
  switch (module) {
    case 'documents':
      return createDocumentsCard(view as DocumentsView)
    
    case 'customers':
      return createCustomersCard(view as CustomersView)
    
    case 'shield':
      return createShieldCard(view as ShieldView)
    
    case 'phone':
      return createTelephonyCard(view as TelephonyView)
    
    case 'website':
      return createWebsiteCard(view as WebsiteView)
    
    default:
      return null
  }
}

/**
 * Dispatched eine Card in den Chat
 */
export function dispatchCardToChat(card: ChatCard) {
  if (typeof window !== 'undefined') {
    console.log('[DashboardCardService] Dispatching card to chat:', card.id, card.type)
    window.dispatchEvent(new CustomEvent('aklow-dispatch-chat-card', {
      detail: { card }
    }))
  }
}

