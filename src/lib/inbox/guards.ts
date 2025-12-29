import { UniversalInboxItem, InboxChannel } from './types';

/**
 * Minimaler Type-Guard für UniversalInboxItem
 */
export function isUniversalInboxItem(x: any): x is UniversalInboxItem {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof x.id === 'string' &&
    typeof x.channel === 'string' &&
    typeof x.title === 'string' &&
    typeof x.sender === 'string' &&
    typeof x.snippet === 'string' &&
    typeof x.time === 'string'
  );
}

const VALID_CHANNELS: InboxChannel[] = [
  'email', 'messenger', 'phone', 'reviews', 'website', 'documents', 'support', 'shopify', 'notifications'
];

/**
 * Normalisiert ein beliebiges Objekt zu einem UniversalInboxItem
 */
export function normalizeInboxItem(x: any): UniversalInboxItem {
  const channel = (x.channel || 'notifications').toLowerCase();
  const safeChannel: InboxChannel = VALID_CHANNELS.includes(channel) 
    ? channel as InboxChannel 
    : 'notifications';

  return {
    id: String(x.id || Math.random().toString(36).slice(2)),
    threadId: x.threadId || x.id || null,
    channel: safeChannel,
    source: String(x.source || '').trim() || undefined,
    sender: String(x.sender || 'Unbekannter Absender').trim(),
    title: String(x.title || 'Kein Titel').trim(),
    snippet: String(x.snippet || '').trim(),
    time: String(x.time || new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })),
    unread: Boolean(x.unread),
    important: Boolean(x.important),
    tags: Array.isArray(x.tags) ? x.tags.map(String) : [],
    status: String(x.status || 'new'),
    ai_state: x.ai_state ? String(x.ai_state) : undefined,
    sla: x.sla ? String(x.sla) : undefined,
    owner: x.owner ? String(x.owner) : undefined,
    kind: x.kind ? String(x.kind) : undefined,
    meta: typeof x.meta === 'object' ? x.meta : {},
    nextAction: x.nextAction && typeof x.nextAction === 'object' && x.nextAction.label
      ? {
          label: String(x.nextAction.label),
          tone: (['neutral', 'urgent', 'info'] as const).includes(x.nextAction.tone)
            ? x.nextAction.tone
            : 'neutral'
        }
      : null,
    suggestedActions: Array.isArray(x.suggestedActions) 
      ? x.suggestedActions.map((a: any) => ({
          id: String(a.id),
          label: String(a.label),
          icon: a.icon ? String(a.icon) : undefined,
          actionId: a.actionId ? String(a.actionId) : undefined,
        }))
      : undefined
  };
}

