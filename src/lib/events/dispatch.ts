import { EntityCardPayload } from '@/components/chat/cards/types';
import { dispatchActionStart as dispatchActionStartCanonical, type ActionStartDetail } from '@/lib/actions/dispatch';

/**
 * Zentraler Event-Dispatcher für AKLOW Frontend Events
 * 
 * @deprecated dispatchActionStart - Nutze stattdessen direkt @/lib/actions/dispatch
 * Diese Funktion ist ein Wrapper für Kompatibilität und wird intern die kanonische Version nutzen.
 */

/**
 * Normalisiert ActionId von Legacy-Format zu canonical Format (snake_case).
 * 
 * Mapping:
 * - inbox.draftReply -> inbox.draft_reply
 * - inbox.nextSteps -> inbox.next_steps
 * - documents.extractKeyFields -> documents.extract_key_fields
 */
function normalizeActionId(actionId: string): string {
  // Legacy CamelCase -> canonical snake_case Mappings
  const legacyMappings: Record<string, string> = {
    'inbox.draftReply': 'inbox.draft_reply',
    'inbox.nextSteps': 'inbox.next_steps',
    'documents.extractKeyFields': 'documents.extract_key_fields',
  };
  
  // Wenn Mapping existiert, verwende canonical ID
  if (actionId in legacyMappings) {
    return legacyMappings[actionId];
  }
  
  // Sonst bleibt actionId unverändert (kann bereits canonical sein)
  return actionId;
}

/**
 * @deprecated Nutze stattdessen dispatchActionStart aus @/lib/actions/dispatch
 * Wrapper für Kompatibilität - leitet an kanonische Implementierung weiter
 */
export function dispatchActionStart(actionId: string, context: unknown, source?: string) {
  // Normalisiere actionId zu canonical Format (Legacy -> Core-7)
  const normalizedActionId = normalizeActionId(actionId);
  
  // Konvertiere altes context-Format zu neuem ActionStartDetail-Format
  const canonicalContext: ActionStartDetail['context'] = typeof context === 'object' && context !== null
    ? {
        module: (context as any).module,
        target: (context as any).target,
        moduleContext: (context as any).moduleContext,
        selection: (context as any).selection,
      }
    : undefined;
  
  // Nutze kanonische Implementierung
  dispatchActionStartCanonical(normalizedActionId, canonicalContext, undefined, source || 'events/dispatch');
}

export function dispatchChatCard(card: EntityCardPayload) {
  window.dispatchEvent(new CustomEvent('aklow-dispatch-chat-card', {
    detail: { card }
  }));
}

export function dispatchOpenModule(module: string, view?: string) {
  window.dispatchEvent(new CustomEvent('aklow-open-module', { 
    detail: { module, view } 
  }));
}

export function dispatchPrefillChat(prompt: string, context?: string) {
  window.dispatchEvent(new CustomEvent('aklow-prefill-chat', {
    detail: { prompt, context }
  }));
}

export function dispatchShowContextCard(type: string, item: unknown, id: string) {
  window.dispatchEvent(new CustomEvent('aklow-show-context-card', {
    detail: { type, item, id }
  }));
}

export function dispatchFocusChat() {
  window.dispatchEvent(new CustomEvent('aklow-focus-chat'));
}

export function dispatchClearContext() {
  window.dispatchEvent(new CustomEvent('aklow-clear-context'));
}

/**
 * Zeigt eine Bot-Context-Card im Chat
 * @param module Bot-Modul (website_bot, telephony_bot, review_bot)
 * @param view Bot-View (overview, conversations, setup, etc.)
 */
export function dispatchShowBotContext(module: 'website_bot' | 'telephony_bot' | 'review_bot', view: string) {
  dispatchShowContextCard('bot', { module, view }, `${module}:${view}`);
}

