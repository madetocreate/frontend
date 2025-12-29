import { CustomerAction } from './types'

export const CUSTOMER_ACTIONS: CustomerAction[] = [
  {
    id: 'customers.profileShort',
    label: 'Kundenprofil',
    description: 'Erstellt eine kurze Zusammenfassung des Profils.',
    isPrimary: true,
  },
  {
    id: 'customers.top3Open',
    label: 'Top 3 offene Punkte',
    description: 'Identifiziert die wichtigsten nächsten To-Dos.',
    isPrimary: true,
  },
  {
    id: 'customers.nextSteps',
    label: 'Nächste Schritte',
    description: 'Schlägt konkrete Handlungsempfehlungen vor.',
    isPrimary: true,
  },
  {
    id: 'customers.followupDraft',
    label: 'Follow-up Entwurf',
    description: 'Verfasst einen Entwurf für die nächste Nachricht.',
    isPrimary: true,
  },
  {
    id: 'customers.timelineSummary',
    label: 'Verlauf zusammenfassen',
    description: 'Fasst die bisherige Kommunikation zusammen.',
    isPrimary: false,
  },
  {
    id: 'customers.risksBlockers',
    label: 'Risiken & Blocker',
    description: 'Analysiert potenzielle Probleme in der Beziehung.',
    isPrimary: false,
  },
  {
    id: 'customers.suggestTags',
    label: 'Tags vorschlagen',
    description: 'Schlägt passende Kategorisierungen vor.',
    isPrimary: false,
  },
]
