import React from 'react'
import { 
  CalendarIcon, 
  HomeIcon, 
  CurrencyEuroIcon,
  UserGroupIcon,
  SunIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export interface DashboardWidgetDef {
  id: string
  type: 'metric' | 'chart' | 'list' | 'weather' | 'actions'
  title: string
  description?: string
  size: 'small' | 'medium' | 'large'
  icon?: React.ComponentType<{ className?: string }>
  category?: string
  data?: unknown // Mock data for now (kann Objekt oder Array sein)
}

export const AVAILABLE_WIDGETS: Record<string, DashboardWidgetDef> = {
  // --- Hotel Widgets ---
  'hotel-weather': {
    id: 'hotel-weather',
    type: 'weather',
    title: 'Wetter',
    category: 'Hotel',
    description: 'Aktuelles Wetter am Standort',
    size: 'small',
    icon: SunIcon,
    data: { temp: 24, condition: 'Sonnig', location: 'Mallorca' }
  },
  'hotel-arrivals': {
    id: 'hotel-arrivals',
    type: 'metric',
    title: 'Ankünfte heute',
    category: 'Hotel',
    description: 'Anzahl der erwarteten Check-ins',
    size: 'small',
    icon: CalendarIcon,
    data: { value: 12, trend: 'normal', subValue: 'Gäste' }
  },
  'hotel-occupancy': {
    id: 'hotel-occupancy',
    type: 'metric',
    title: 'Belegung',
    category: 'Hotel',
    description: 'Aktuelle Zimmerbelegung',
    size: 'small',
    icon: HomeIcon,
    data: { value: '45/50', subValue: '90%', trend: 'up' }
  },
  'hotel-revenue': {
    id: 'hotel-revenue',
    type: 'metric',
    title: 'Revenue heute',
    category: 'Hotel',
    description: 'Tagesumsatz',
    size: 'small',
    icon: CurrencyEuroIcon,
    data: { value: '12.500€', trend: 'up' }
  },
  'hotel-occupancy-chart': {
    id: 'hotel-occupancy-chart',
    type: 'chart',
    title: 'Belegungstrend',
    category: 'Hotel',
    description: 'Verlauf der Belegung',
    size: 'medium',
    data: { current: 45, total: 50 }
  },
  'hotel-arrivals-list': {
    id: 'hotel-arrivals-list',
    type: 'list',
    title: 'Ankünfte heute',
    category: 'Hotel',
    description: 'Liste der Check-ins',
    size: 'medium',
    data: [
      { id: 1, title: 'Zimmer 101', sub: 'Gast 1 • 14:00', badge: 'Check-in', badgeColor: 'blue' },
      { id: 2, title: 'Zimmer 102', sub: 'Gast 2 • 14:30', badge: 'Check-in', badgeColor: 'blue' },
      { id: 3, title: 'Zimmer 103', sub: 'Gast 3 • 15:00', badge: 'Check-in', badgeColor: 'blue' },
    ]
  },
  'hotel-departures-list': {
    id: 'hotel-departures-list',
    type: 'list',
    title: 'Abreisen heute',
    category: 'Hotel',
    description: 'Liste der Check-outs',
    size: 'medium',
    data: [
      { id: 1, title: 'Zimmer 201', sub: 'Gast 1 • 11:00', badge: 'Check-out', badgeColor: 'green' },
      { id: 2, title: 'Zimmer 202', sub: 'Gast 2 • 11:30', badge: 'Check-out', badgeColor: 'green' },
    ]
  },
  'hotel-actions': {
    id: 'hotel-actions',
    type: 'actions',
    title: 'Schnellaktionen',
    category: 'Hotel',
    description: 'Häufige Aufgaben',
    size: 'large',
    data: [
      { id: 'new-reservation', label: 'Neue Reservierung', icon: CalendarIcon, shortcut: '⌘N' },
      { id: 'check-in', label: 'Check-in', icon: UserGroupIcon, shortcut: '⌘C' },
      { id: 'room-status', label: 'Zimmer-Status', icon: HomeIcon, shortcut: '⌘R' },
      { id: 'invoice', label: 'Rechnung', icon: CurrencyEuroIcon, shortcut: '⌘B' },
    ]
  },

  // --- Gastronomie Widgets ---
  'gastro-reservations': {
    id: 'gastro-reservations',
    type: 'metric',
    title: 'Reservierungen',
    category: 'Gastronomie',
    description: 'Offene Tischreservierungen',
    size: 'small',
    icon: CalendarIcon,
    data: { value: 24, trend: 'up', subValue: 'Tische' }
  },
  'gastro-orders': {
    id: 'gastro-orders',
    type: 'metric',
    title: 'Offene Bestellungen',
    category: 'Gastronomie',
    description: 'Bestellungen in der Küche',
    size: 'small',
    icon: ClipboardDocumentCheckIcon,
    data: { value: 8, trend: 'normal', subValue: 'In Zubereitung' }
  },

  // --- Practice Widgets ---
  'practice-patients': {
    id: 'practice-patients',
    type: 'metric',
    title: 'Patienten heute',
    category: 'Praxis',
    description: 'Termine heute',
    size: 'small',
    icon: UserGroupIcon,
    data: { value: 42, trend: 'normal', subValue: 'Termine' }
  },
  'practice-waiting': {
    id: 'practice-waiting',
    type: 'metric',
    title: 'Wartezimmer',
    category: 'Praxis',
    description: 'Patienten im Wartezimmer',
    size: 'small',
    icon: ClockIcon,
    data: { value: 5, trend: 'up', subValue: 'Wartend' }
  },

  // --- Real Estate Widgets ---
  'realestate-leads': {
    id: 'realestate-leads',
    type: 'metric',
    title: 'Neue Leads',
    category: 'Immobilien',
    description: 'Anfragen heute',
    size: 'small',
    icon: UserGroupIcon,
    data: { value: 15, trend: 'up', subValue: 'Anfragen' }
  },
}

