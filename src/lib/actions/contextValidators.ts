/**
 * Context-Validatoren für Actions
 * Prüft, ob der bereitgestellte Context für ein Modul gültig ist
 */

import type { ActionModule, ActionContext } from './types'

export interface ContextValidationResult {
  ok: boolean
  reason?: string
}

/**
 * Validiert Context für ein Modul
 */
export function validateContext(module: ActionModule, context?: ActionContext): ContextValidationResult {
  if (!context) {
    return {
      ok: false,
      reason: 'Kein Context bereitgestellt',
    }
  }

  switch (module) {
    case 'inbox': {
      // Inbox benötigt itemId im moduleContext
      const moduleContext = context.moduleContext as Record<string, unknown> | undefined
      const inboxContext = moduleContext?.inbox as Record<string, unknown> | undefined
      
      if (!inboxContext?.itemId) {
        return {
          ok: false,
          reason: 'Inbox-Actions benötigen itemId im Context',
        }
      }

      // threadId ist optional, aber empfohlen
      if (!inboxContext.threadId) {
        return {
          ok: true, // Warnung, aber nicht blockierend
          reason: 'threadId fehlt (optional, aber empfohlen)',
        }
      }

      return { ok: true }
    }

    case 'documents': {
      const moduleContext = context.moduleContext as Record<string, unknown> | undefined
      const documentsContext = moduleContext?.documents as Record<string, unknown> | undefined
      
      if (!documentsContext?.documentId) {
        return {
          ok: false,
          reason: 'Document-Actions benötigen documentId im Context',
        }
      }

      return { ok: true }
    }

    case 'crm': {
      const moduleContext = context.moduleContext as Record<string, unknown> | undefined
      const crmContext = moduleContext?.crm as Record<string, unknown> | undefined
      
      if (!crmContext?.customerId && !crmContext?.itemId) {
        return {
          ok: false,
          reason: 'CRM-Actions benötigen customerId oder itemId im Context',
        }
      }

      return { ok: true }
    }

    case 'reviews': {
      const moduleContext = context.moduleContext as Record<string, unknown> | undefined
      const reviewsContext = moduleContext?.reviews as Record<string, unknown> | undefined
      
      if (!reviewsContext?.reviewId) {
        return {
          ok: false,
          reason: 'Review-Actions benötigen reviewId im Context',
        }
      }

      return { ok: true }
    }

    case 'customers':
    case 'growth':
    case 'storage': {
      // Diese Module haben weniger strikte Anforderungen
      // Grundlegende Validierung: target.targetId sollte vorhanden sein
      const target = context.target as { targetId?: string; id?: string } | undefined
      // Unterstütze sowohl kanonische Form (targetId) als auch Legacy (id)
      const targetId = target?.targetId || target?.id
      if (!targetId) {
        return {
          ok: false,
          reason: `${module}-Actions benötigen target.targetId im Context`,
        }
      }

      return { ok: true }
    }

    default: {
      // Unbekanntes Modul: Warnung, aber nicht blockierend
      return {
        ok: true,
        reason: `Unbekanntes Modul: ${module}`,
      }
    }
  }
}

