export type InboxActionId =
  | 'inbox.summarize'
  | 'inbox.draft_reply'
  | 'inbox.ask_missing_info'
  | 'inbox.next_steps'
  | 'inbox.prioritize'
  | 'crm.link_to_customer'

export type InboxTabId = 'original' | 'summary' | 'draft' | 'tasks' | 'history'

export interface InboxAction {
  id: InboxActionId
  label: string
  description: string
  targetTab: InboxTabId
  icon?: string
}

export const INBOX_ACTIONS: Record<InboxActionId, InboxAction> = {
  'inbox.summarize': {
    id: 'inbox.summarize',
    label: 'Zusammenfassen',
    description: 'Fasse die Nachricht kurz und bündig zusammen.',
    targetTab: 'summary',
  },
  'inbox.draft_reply': {
    id: 'inbox.draft_reply',
    label: 'Antwortentwurf',
    description: 'Erstelle einen kurzen, lockeren Antwortentwurf.',
    targetTab: 'draft',
  },
  'inbox.ask_missing_info': {
    id: 'inbox.ask_missing_info',
    label: 'Rückfragen',
    description: 'Stelle gezielte Rückfragen zu fehlenden Informationen.',
    targetTab: 'draft',
  },
  'inbox.next_steps': {
    id: 'inbox.next_steps',
    label: 'Nächste Schritte',
    description: 'Extrahiere Aufgaben und nächste Schritte.',
    targetTab: 'tasks',
  },
  'inbox.prioritize': {
    id: 'inbox.prioritize',
    label: 'Priorisieren',
    description: 'Erhalte die wichtigsten Punkte priorisiert.',
    targetTab: 'tasks',
  },
  'crm.link_to_customer': {
    id: 'crm.link_to_customer',
    label: 'Zu Kunde zuordnen',
    description: 'Ordne die Nachricht einem Kunden zu.',
    targetTab: 'history',
  },
}

export const getActionsForChannel = (channel: string): InboxActionId[] => {
  const base: InboxActionId[] = ['inbox.summarize', 'inbox.draft_reply', 'inbox.ask_missing_info', 'inbox.next_steps', 'inbox.prioritize']
  const extra: InboxActionId[] = ['crm.link_to_customer']
  return channel === 'reviews' ? base : [...base, ...extra]
}
