/**
 * Action Client - Zentrale Stelle für Action-Execution
 * 
 * Bietet:
 * - startAction(payload) -> { run_id }
 * - subscribeToRun(run_id, onEvent) -> unsubscribe
 * - normalizeEvent(event): typed event union
 */

import { startRun, type ActionStartRequest, type ActionRunEvent, type ActionRunResult } from '../actionRuns/client'

export interface ActionStartPayload {
  actionId: string
  context: {
    module?: string
    target?: {
      id?: string
      type?: string
      title?: string
    }
    moduleContext?: Record<string, unknown>
  }
  config?: Record<string, unknown>
}

export interface ActionStartResponse {
  run_id: string
}

/**
 * Typed Event Union - minimal für E2E
 */
export type ActionEvent =
  | { type: 'run_started'; run_id: string; action_id: string; ts: string }
  | { type: 'step_started'; step_id: string; label?: string; ts: string }
  | { type: 'step_progress'; step_id: string; message?: string; progress?: number; ts: string }
  | { type: 'card_render'; card: Record<string, unknown>; ts: string }
  | { type: 'run_completed'; summary?: string; ts: string }
  | { type: 'run_failed'; error_code?: string; message: string; ts: string }

/**
 * Startet eine Action und gibt run_id zurück
 * 
 * Startet die Action mit stream: false, um nur die run_id zu bekommen.
 * Für Streaming sollte subscribeToRun verwendet werden.
 */
export async function startAction(payload: ActionStartPayload): Promise<ActionStartResponse> {
  const request: ActionStartRequest = {
    actionId: payload.actionId,
    context: payload.context,
    config: payload.config,
    stream: false, // Start ohne Streaming, dann separat subscriben
  }

  const result = await startRun(request)
  return {
    run_id: result.runId,
  }
}

/**
 * Startet eine Action mit direktem Streaming
 * 
 * @param payload - Action Payload
 * @param onEvent - Event Handler
 * @returns Promise mit run_id und unsubscribe function
 */
export async function startActionWithStream(
  payload: ActionStartPayload,
  onEvent: (event: ActionEvent) => void
): Promise<{ run_id: string; unsubscribe: () => void }> {
  let runId: string | undefined
  let unsubscribe: (() => void) | undefined

  const request: ActionStartRequest = {
    actionId: payload.actionId,
    context: payload.context,
    config: payload.config,
    stream: true,
  }

  await startRun(request, (event) => {
    // Extract run_id from first event
    if (!runId && event.data.run_id) {
      runId = event.data.run_id as string
    }

    // Normalize and emit
    const normalized = normalizeEvent(event.data, event.type)
    if (normalized) {
      onEvent(normalized)
    }
  })

  // Return run_id and a no-op unsubscribe (streaming is handled by startRun)
  return {
    run_id: runId || '',
    unsubscribe: () => {
      // Note: startRun doesn't expose unsubscribe, so this is a no-op
      // In practice, the component should handle cleanup via unmount
    },
  }
}

/**
 * Subscribe zu einem Run via SSE
 * 
 * WICHTIG: Aktuell gibt es keinen separaten Stream-Endpoint für bestehende Runs.
 * Diese Funktion ist ein Stub und sollte später implementiert werden.
 * 
 * @param run_id - Run ID (bereits gestartet)
 * @param onEvent - Event Handler
 * @returns Unsubscribe function
 */
export function subscribeToRun(
  run_id: string,
  onEvent: (event: ActionEvent) => void
): () => void {
  // TODO: Implement proper streaming for existing runs
  // For now, this is a no-op. The InboxDetail component should use startActionWithStream instead.
  console.warn('subscribeToRun called but not fully implemented. Use startActionWithStream for new runs.')
  return () => {
    // No-op
  }
}

/**
 * Normalisiert ein Event zu unserem typed union
 * 
 * Unterstützt versioniertes Envelope (v=1):
 * {
 *   "v": 1,
 *   "type": "...",
 *   "run_id": "...",
 *   "ts": "iso",
 *   "payload": {...}
 * }
 * 
 * Robust gegen:
 * - keepalive/leerzeilen (ignoriert)
 * - JSON parse errors (ignoriert)
 * - unknown event types (ignoriert)
 */
export function normalizeEvent(
  data: Record<string, unknown>,
  eventType?: string
): ActionEvent | null {
  // Ignoriere keepalive
  if (!data || Object.keys(data).length === 0) {
    return null
  }

  // Unterstütze versioniertes Envelope (v=1)
  let envelope = data
  let payload = data
  let ts = (data.ts as string) || new Date().toISOString()
  let type = (eventType || data.type || 'run.progress') as string
  let runId = (data.run_id as string) || ''

  if (data.v === 1) {
    // Versioned envelope
    envelope = data
    payload = (data.payload as Record<string, unknown>) || {}
    ts = (data.ts as string) || new Date().toISOString()
    type = (data.type as string) || 'run.progress'
    runId = (data.run_id as string) || ''
  } else {
    // Legacy format (backward compatibility)
    payload = data
  }

  // Map Backend event types to our union
  switch (type) {
    case 'run.started':
      return {
        type: 'run_started',
        run_id: runId || (payload.run_id as string) || '',
        action_id: (payload.action_id as string) || 'unknown',
        ts,
      }

    case 'step.started':
    case 'run.progress':
      // Check if it's a step_started or step_progress
      if (payload.step_id || payload.step) {
        return {
          type: 'step_started',
          step_id: (payload.step_id as string) || (payload.step as string) || 'unknown',
          label: payload.label as string | undefined,
          ts,
        }
      }
      return {
        type: 'step_progress',
        step_id: (payload.step_id as string) || (payload.step as string) || 'unknown',
        message: payload.message as string | undefined,
        progress: payload.progress as number | undefined,
        ts,
      }

    case 'card_render':
    case 'run.completed':
      // Check if result contains a card
      const result = payload.result as Record<string, unknown> | undefined
      if (result && result.type) {
        // This is an ActionOutputV1 that should be rendered as a card
        return {
          type: 'card_render',
          card: result,
          ts,
        }
      }
      // Otherwise it's a completion
      return {
        type: 'run_completed',
        summary: payload.summary as string | undefined,
        ts,
      }

    case 'run.failed':
      return {
        type: 'run_failed',
        error_code: payload.error_code as string | undefined,
        message: (payload.safe_message as string) || (payload.error as string) || (payload.message as string) || 'Unknown error',
        ts,
      }

    default:
      // Unknown event type - log but don't crash
      console.debug('Unknown event type:', type, data)
      return null
  }
}

