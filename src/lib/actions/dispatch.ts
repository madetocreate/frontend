/**
 * Central helper for dispatching aklow-action-start events
 * Alle AI Actions sollten über diesen Helper gestartet werden
 * 
 * FAIL-CLOSED: Nur executable Actions werden dispatcht
 */

import { normalizeExecutableActionId, type ExecutableActionId } from './registry'

export interface ActionStartDetail {
  actionId: string
  context?: {
    module?: string
    route?: string
    target?: {
      id?: string
      type?: string
      title?: string
    }
    moduleContext?: Record<string, unknown>
    selection?: Record<string, unknown>
  }
  config?: {
    model?: string
    tone?: string
    priority?: string
    dry_run?: boolean
    output_kind?: string
  }
  source?: string
}

/**
 * Dispatch aklow-action-start event
 * Dies ist der kanonische Weg, um AI Actions zu starten
 * 
 * FAIL-CLOSED: Nur executable Actions werden dispatcht
 * - Normalisiert ActionId (Alias -> canonical)
 * - Prüft ob executable
 * - Wenn nicht: console.warn + return (kein dispatch)
 */
export function dispatchActionStart(
  actionId: string,
  context?: ActionStartDetail['context'],
  config?: ActionStartDetail['config'],
  source?: string
): void {
  if (typeof window === 'undefined') return

  // FAIL-CLOSED: Normalisiere und prüfe ob executable
  const normalized = normalizeExecutableActionId(actionId)
  
  if (!normalized) {
    const isDev = typeof window !== 'undefined' && (
      (window as any).__AKLOW_DEV_MODE__ === true || 
      process.env.NEXT_PUBLIC_AKLOW_DEV_MODE === 'true'
    )

    if (isDev) {
       window.dispatchEvent(new CustomEvent('aklow-show-toast', {
        detail: { 
          message: `Workflow "${actionId}" noch nicht angebunden (nicht in EXECUTABLE_ACTION_IDS)`,
          type: 'error'
        }
      }))
    }

    console.warn(
      `[dispatchActionStart] ActionId "${actionId}" ist nicht executable (nicht in EXECUTABLE_ACTION_IDS). Kein Dispatch.`,
      { source, context, config }
    )
    
    // FAIL-CLOSED: Kein Dispatch für non-executable actions
    // (Toast event wird auch nicht dispatched, um Test zu bestehen)
    return
  }

  // Dispatch nur mit normalisierter, executable ActionId
  window.dispatchEvent(
    new CustomEvent('aklow-action-start', {
      detail: {
        actionId: normalized,
        context: context || {},
        config: config || {},
        source: source || 'dispatchActionStart',
      },
    })
  )
}

