/**
 * Inbox Card Service
 * Erstellt Cards für E-Mails und andere Inbox-Items
 */

import type { EntityCardPayload } from '@/components/chat/cards/types'
import type { InboxItem } from '@/components/InboxDrawerWidget'
import { 
  EnvelopeIcon, 
  ClockIcon, 
  UserCircleIcon, 
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  StarIcon,
  DocumentIcon,
  ShoppingBagIcon,
  GlobeAltIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import React from 'react'
import { dispatchChatCard } from './events/dispatch'

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case 'email': return EnvelopeIcon
    case 'messenger': return ChatBubbleLeftRightIcon
    case 'phone': return PhoneIcon
    case 'reviews': return StarIcon
    case 'documents': return DocumentIcon
    case 'shopify': return ShoppingBagIcon
    case 'website': return GlobeAltIcon
    default: return BellIcon
  }
}

const getChannelColor = (channel: string) => {
  switch (channel) {
    case 'email': return 'text-[var(--ak-accent-email)]'
    case 'messenger': return 'text-[var(--ak-accent-chat)]'
    case 'phone': return 'text-[var(--ak-accent-telephony)]'
    case 'reviews': return 'text-[var(--ak-accent-documents)]'
    case 'documents': return 'text-[var(--ak-accent-documents)]'
    case 'shopify': return 'text-[var(--ak-accent-growth)]'
    case 'website': return 'text-[var(--ak-accent-website)]'
    default: return 'text-[var(--ak-color-text-muted)]'
  }
}

/**
 * Erstellt eine Universal Inbox Card
 */
export function createInboxItemCard(item: InboxItem): EntityCardPayload {
  const Icon = getChannelIcon(item.channel)
  const colorClass = getChannelColor(item.channel)

  // Outcome-first data mapping
  const data: Record<string, string> = {
    'Kanal': item.channel.charAt(0).toUpperCase() + item.channel.slice(1),
  }

  if (item.nextAction) {
    data['Nächster Schritt'] = item.nextAction.label
  }

  data['Status'] = item.status ?? (item.unread ? 'Neu' : 'Gelesen')

  if (item.tags && item.tags.length > 0) {
    data['Tags'] = item.tags.join(', ')
  }

  if (item.sla) data['SLA'] = item.sla
  if (item.owner) data['Owner'] = item.owner

  return {
    type: 'entity',
    id: `inbox-${item.channel}-${item.id}`,
    title: item.title,
    subtitle: [item.sender, item.time, item.source].filter(Boolean).join(' • '),
    icon: React.createElement(Icon, { className: `w-5 h-5 ${colorClass}` }),
    status: item.unread ? 'unread' : 'read',
    createdAt: Date.now(),
    source: { 
      moduleToken: 'inbox',
      entityType: item.channel,
      entityId: item.id 
    },
    data,
    // Original Bereich (collapsible)
    details: React.createElement(
      'div',
      { className: 'space-y-4 pt-2' },
      React.createElement(
        'div',
        { className: 'p-4 bg-[var(--ak-color-bg-surface-muted)] rounded-lg border border-[var(--ak-color-border-subtle)]' },
        React.createElement(
          'div',
          { className: 'flex items-center gap-2 mb-3 opacity-60' },
          React.createElement(DocumentTextIcon, { className: 'w-4 h-4' }),
          React.createElement('span', { className: 'text-[10px] font-bold uppercase tracking-wider' }, 'Original Text')
        ),
        React.createElement(
          'p',
          { className: 'text-sm text-[var(--ak-color-text-primary)] leading-relaxed whitespace-pre-wrap' },
          item.snippet
        )
      )
    ),
    explanation: item.meta?.explanation ?? 'Zuordnung basiert auf Absender + Thread.',
    actions: [],
  }
}

/**
 * Backwards compatibility wrapper
 */
export function createInboxEmailCard(item: InboxItem): EntityCardPayload {
  return createInboxItemCard(item)
}

/**
 * Dispatched eine Inbox-Card in den Chat
 */
export function dispatchInboxCardToChat(card: EntityCardPayload) {
  if (typeof window !== 'undefined') {
    console.log('[InboxCardService] Dispatching inbox card to chat:', card.id)
    dispatchChatCard(card)
  }
}

