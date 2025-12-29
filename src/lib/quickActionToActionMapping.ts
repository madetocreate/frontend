/**
 * Mapping von UI Action IDs zu kanonischen Executable Action IDs
 * 
 * FAIL-CLOSED: Nur Core-7 executable Actions werden gemappt
 */

import type { ExecutableActionId } from './actions/registry'
import { isExecutableActionId } from './actions/registry'

export type UIActionId = string

/**
 * Context-aware Mapping: UI Action ID -> ExecutableActionId
 * 
 * FAIL-CLOSED: Nur Core-7 executable Actions
 */
export function mapUIActionToExecutableActionId(
  uiActionId: UIActionId,
  module?: 'inbox' | 'documents' | 'crm' | 'reviews'
): ExecutableActionId | null {
  // Core-7 Mappings (nur executable)
  const mappings: Record<string, ExecutableActionId> = {
    // Inbox
    'reply': 'inbox.draft_reply',
    'summarize': 'inbox.summarize',
    'extract-tasks': 'inbox.next_steps',
    'ask-missing': 'inbox.ask_missing_info',
    'inbox.reply': 'inbox.draft_reply',
    'inbox.summarize': 'inbox.summarize',
    'inbox.extract-tasks': 'inbox.next_steps',
    'inbox.ask-missing': 'inbox.ask_missing_info',
    'inbox_summary': 'inbox.summarize',
    'reply_suggestion': 'inbox.draft_reply',
    'task_extraction': 'inbox.next_steps',
    
    // Documents
    'extract-keypoints': 'documents.extract_key_fields',
    'documents.extract-keypoints': 'documents.extract_key_fields',
    'document_analysis': 'documents.extract_key_fields',
    
    // CRM
    'crm_preparation': 'crm.link_to_customer',
    'crm.link': 'crm.link_to_customer',
    
    // Reviews
    'draft_reply': 'reviews.draft_review_reply',
    'reviews.draft_reply': 'reviews.draft_review_reply',
  }
  
  // Context-aware: module.uiActionId
  if (module) {
    const contextKey = `${module}.${uiActionId}`
    if (mappings[contextKey] && isExecutableActionId(mappings[contextKey])) {
      return mappings[contextKey]
    }
  }
  
  // Direktes Mapping
  const mapped = mappings[uiActionId]
  if (mapped && isExecutableActionId(mapped)) {
    return mapped
  }
  
  // FAIL-CLOSED: Kein Mapping gefunden
  return null
}

/**
 * Legacy: Alias für Kompatibilität
 * @deprecated Verwende mapUIActionToExecutableActionId
 */
export function mapUIActionToActionId(uiActionId: UIActionId, context?: string): ExecutableActionId | null {
  const contextModule =
    context?.startsWith('inbox') ? 'inbox' :
    context?.startsWith('documents') ? 'documents' :
    context?.startsWith('crm') ? 'crm' :
    context?.startsWith('reviews') ? 'reviews' : undefined
  return mapUIActionToExecutableActionId(uiActionId, contextModule)
}

/**
 * Export mappings for tests (backward compatibility)
 */
export const QUICK_ACTION_TO_ACTION_ID: Record<string, ExecutableActionId> = {
  'inbox_summary': 'inbox.summarize',
  'reply_suggestion': 'inbox.draft_reply',
  'document_analysis': 'documents.extract_key_fields',
  'task_extraction': 'inbox.next_steps',
}

export const UI_ACTION_TO_ACTION_ID: Record<string, ExecutableActionId> = {
  'reply': 'inbox.draft_reply',
  'summarize': 'inbox.summarize',
  'extract-tasks': 'inbox.next_steps',
  'extract-keypoints': 'documents.extract_key_fields',
}

