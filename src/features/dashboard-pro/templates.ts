import { IndustryTemplate, DashboardProConfig, DashboardIndustry } from './types'
import { enableGastro } from '../../lib/featureFlags'

export const INDUSTRY_TEMPLATES: Record<string, IndustryTemplate> = {
  hotel: {
    id: 'hotel',
    name: 'Hotel & Hospitality',
    defaultViews: ['overview', 'reservations', 'rooms', 'guests'],
    availableViews: [
      { id: 'overview', label: 'Übersicht' },
      { id: 'reservations', label: 'Reservierungen' },
      { id: 'rooms', label: 'Zimmer' },
      { id: 'restaurant', label: 'Restaurant & Bar' },
      { id: 'events', label: 'Events' },
      { id: 'guests', label: 'Gäste' },
      { id: 'revenue', label: 'Revenue' },
      { id: 'marketing', label: 'Marketing' },
      { id: 'reports', label: 'Berichte' },
      { id: 'settings', label: 'Einstellungen' }
    ]
  },
  gastronomie: {
    id: 'gastronomie',
    name: 'Gastronomie & Restaurant',
    defaultViews: ['overview', 'reservations', 'menu', 'orders'],
    availableViews: [
      { id: 'overview', label: 'Übersicht' },
      { id: 'reservations', label: 'Reservierungen' },
      { id: 'menu', label: 'Speisekarte' },
      { id: 'orders', label: 'Bestellungen' },
      { id: 'inventory', label: 'Inventar' },
      { id: 'staff', label: 'Personal' },
      { id: 'bar', label: 'Bar' },
      { id: 'analytics', label: 'Analytics' },
      { id: 'marketing', label: 'Marketing' },
      { id: 'settings', label: 'Einstellungen' }
    ]
  },
  practice: {
    id: 'practice',
    name: 'Praxis & Medizin',
    defaultViews: ['overview', 'appointments', 'patients', 'documents'],
    availableViews: [
      { id: 'overview', label: 'Übersicht' },
      { id: 'patients', label: 'Patienten' },
      { id: 'appointments', label: 'Termine' },
      { id: 'documents', label: 'Dokumente' },
      { id: 'statistics', label: 'Statistiken' },
      { id: 'phone', label: 'Telefon' },
      { id: 'forms', label: 'Formulare' },
      { id: 'billing', label: 'Abrechnung' },
      { id: 'compliance', label: 'Compliance' },
      { id: 'settings', label: 'Einstellungen' }
    ]
  },
  realestate: {
    id: 'realestate',
    name: 'Immobilien & Real Estate',
    defaultViews: ['overview', 'objects', 'exposes', 'contacts'],
    availableViews: [
      { id: 'overview', label: 'Übersicht' },
      { id: 'objects', label: 'Objekte' },
      { id: 'exposes', label: 'Exposés' },
      { id: 'contacts', label: 'Kontakte' },
      { id: 'leads', label: 'Anfragen' },
      { id: 'calendar', label: 'Kalender' },
      { id: 'tasks', label: 'Aufgaben' },
      { id: 'marketing', label: 'Marketing' },
      { id: 'analytics', label: 'Analytics' },
      { id: 'settings', label: 'Einstellungen' }
    ]
  }
}

export function createDefaultConfig(industry: string): DashboardProConfig {
  if (industry === "gastronomie" && !enableGastro) {
    throw new Error("Gastro is disabled")
  }
  const template = INDUSTRY_TEMPLATES[industry]
  if (!template) throw new Error(`Unknown industry: ${industry}`)
  
  return {
    version: 1,
    industry: industry as DashboardIndustry,
    enabledApps: [],
    enabledViews: [...template.defaultViews],
    updatedAt: Date.now()
  }
}

