/**
 * Website Card Service
 * Erstellt Detailkarten für Website-Conversations
 */

import type { EntityCardPayload } from '@/components/chat/cards/types'
import { dispatchCardToChat } from './dashboardCardService'

export interface WebsiteConversation {
  id: string
  user: string
  topic: string
  time: string
  status: 'active' | 'closed' | 'handoff'
  msgs: number
}

/**
 * Erstellt eine Entity-Card für eine Website-Conversation
 */
export function createWebsiteConversationCard(conversation: WebsiteConversation): EntityCardPayload {
  return {
    type: 'entity',
    id: `website-conversation-${conversation.id}`,
    title: `Gespräch mit ${conversation.user}`,
    subtitle: conversation.topic,
    status: conversation.status === 'active' ? 'active' : conversation.status === 'handoff' ? 'pending' : 'error',
    createdAt: Date.now(),
    source: {
      moduleToken: 'website',
      entityType: 'website_conversation',
      entityId: conversation.id,
    },
    data: {
      'Benutzer': conversation.user,
      'Thema': conversation.topic,
      'Zeit': conversation.time,
      'Status': conversation.status === 'active' ? 'Aktiv' : conversation.status === 'handoff' ? 'Mensch benötigt' : 'Beendet',
      'Nachrichten': `${conversation.msgs} Msgs`,
    },
    actions: [
      {
        id: 'summarize_conversation',
        label: 'Zusammenfassen',
        variant: 'primary',
      },
      {
        id: 'extract_lead',
        label: 'Lead extrahieren',
        variant: 'secondary',
      },
      {
        id: 'assign_customer',
        label: 'Als Kunde zuordnen',
        variant: 'secondary',
      },
    ],
    explanation: `Website-Chat-Details: Gespräch mit ${conversation.user} zum Thema "${conversation.topic}" mit ${conversation.msgs} Nachrichten.`,
  }
}

/**
 * Dispatched eine Website-Conversation-Card in den Chat
 */
export function dispatchWebsiteConversationCard(conversation: WebsiteConversation) {
  const card = createWebsiteConversationCard(conversation)
  dispatchCardToChat(card)
}

