export type InboxActionId =
  | 'inbox.summarize'
  | 'inbox.top3'
  | 'inbox.draftReply'
  | 'inbox.nextSteps'
  | 'inbox.assignCase'
  | 'inbox.setNotifications'

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
  'inbox.top3': {
    id: 'inbox.top3',
    label: 'Top 3 / Wichtigste',
    description: 'Extrahiere die 3 wichtigsten Punkte.',
    targetTab: 'summary',
  },
  'inbox.draftReply': {
    id: 'inbox.draftReply',
    label: 'Antwortentwurf',
    description: 'Erstelle einen kurzen, lockeren Antwortentwurf.',
    targetTab: 'draft',
  },
  'inbox.nextSteps': {
    id: 'inbox.nextSteps',
    label: 'Aufgaben vorschlagen',
    description: 'Extrahiere Aufgaben und nächste Schritte.',
    targetTab: 'tasks',
  },
  'inbox.assignCase': {
    id: 'inbox.assignCase',
    label: 'Als Vorgang markieren',
    description: 'Nachricht einem neuen oder bestehenden Vorgang zuordnen.',
    targetTab: 'history',
  },
  'inbox.setNotifications': {
    id: 'inbox.setNotifications',
    label: 'Benachrichtigungen',
    description: 'Erinnere mich später an diese Nachricht.',
    targetTab: 'history',
  },
}

export const getActionsForChannel = (channel: string): InboxActionId[] => {
  const common: InboxActionId[] = ['inbox.summarize', 'inbox.top3', 'inbox.draftReply', 'inbox.nextSteps', 'inbox.assignCase']
  return channel === 'reviews' ? common : [...common, 'inbox.setNotifications']
}
