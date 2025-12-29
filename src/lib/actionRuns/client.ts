'use client'
/**
 * ActionRunClient - Client for executing actions via backend API.
 * 
 * Statt Prompts im Chat zu prefills, starten Actions sofort einen Run im Hintergrund
 * und führen den User Schritt für Schritt durch den Prozess.
 * 
 * Siehe auch:
 * - docs/ACTIONS_INTEGRATION.md - Frontend Integration Dokumentation
 * - docs/ACTIONS_ARCHITECTURE.md - Vollständige Architektur-Dokumentation
 */

import { normalizeExecutableActionId } from '@/lib/actions/registry'
import { authedFetch } from '@/lib/api/authedFetch'

function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) return token
  }
  // In Produktion kein Fallback auf NEXT_PUBLIC_AUTH_TOKEN
  const isProd = process.env.NODE_ENV === 'production'
  if (!isProd) {
    return process.env.NEXT_PUBLIC_AUTH_TOKEN || null
  }
  return null
}

function withAuthHeaders(base: Record<string, string> = {}): Record<string, string> {
  const headers = { ...base }
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export interface ActionStartRequest {
  actionId: string
  context: {
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
  stream?: boolean
  lastEventId?: string
  signal?: AbortSignal
}

export interface ActionRunEvent {
  type:
    | 'run.started'
    | 'run.progress'
    | 'assistant.message'
    | 'assistant.delta'
    | 'tool.called'
    | 'approval.requested'
    | 'user_input.requested'
    | 'user_input.received'
    | 'run.completed'
    | 'run.failed'
  data: Record<string, unknown>
}

export interface ActionRunResult {
  runId: string
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'needs_input'  // Phase 2: needs_input for missing fields
  result?: Record<string, unknown>
  error?: string
  lastEventId?: string
  missingFields?: string[]  // Phase 2: Missing fields if status="needs_input"
  errors?: string[]  // Phase 2: Validation errors if status="needs_input"
  reasonCode?: string  // Phase 5: Reason code for decision
}

export type ActionRunEventHandler = (event: ActionRunEvent) => void

/**
 * Start an action run and optionally stream events.
 */
export async function startRun(
  request: ActionStartRequest,
  onEvent?: ActionRunEventHandler
): Promise<ActionRunResult> {
  const normalizedActionId = normalizeExecutableActionId(request.actionId)
  if (!normalizedActionId) {
    throw new Error(`Action "${request.actionId}" ist nicht ausführbar (nicht in EXECUTABLE_ACTION_IDS).`)
  }

  // Get tenantId from context (JWT token or localStorage)
  const { requireTenantId } = await import('@/lib/tenant')
  const tenantId = requireTenantId()
  const sessionId = `action-${normalizedActionId}-${Date.now()}`

  const body = {
    tenantId,
    sessionId,
    actionId: normalizedActionId,
    context: request.context,
    config: request.config,
    stream: request.stream !== false,
  }

  // If streaming, use EventSource or fetch with SSE
  if (request.stream !== false && onEvent) {
    return streamRun(body, onEvent, request.lastEventId, request.signal)
  }

  // Non-streaming: wait for completion
  const headers = withAuthHeaders({
    'Content-Type': 'application/json',
  })
  
  let response: Response
  try {
    response = await authedFetch('/api/actions/execute', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(body),
      signal: request.signal,
    })
  } catch (error) {
    // Handle network/connection errors
    if (error instanceof Error && (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED'))) {
      throw new Error('Backend-Server ist nicht erreichbar. Bitte stelle sicher, dass der Backend-Server läuft.')
    }
    throw error
  }

  if (!response.ok) {
    let errorMessage = 'Action execution failed'
    try {
      const errorText = await response.text()
      if (errorText) {
        try {
          const errorJson = JSON.parse(errorText)
          // Handle nested JSON errors
          if (errorJson.message) {
            try {
              const inner = JSON.parse(errorJson.message)
              if (inner.details) {
                const details = JSON.parse(inner.details)
                errorMessage = details.detail || inner.message || errorJson.message
              } else {
                errorMessage = inner.message || errorJson.message
              }
            } catch {
              errorMessage = errorJson.message
            }
          } else if (errorJson.error) {
            errorMessage = errorJson.error
          } else {
            errorMessage = errorText
          }
        } catch {
          errorMessage = errorText
        }
      }
    } catch {
      // Fallback
    }

    // Try to parse Launch Gate error
    let errorJson: Record<string, unknown> | null = null
    try {
      const errorText = await response.text()
      if (errorText) {
        try {
          errorJson = JSON.parse(errorText)
        } catch {
          // Not JSON
        }
      }
    } catch {
      // Ignore
    }

    // Check for Launch Gate errors (403 with specific error codes)
    if (response.status === 403 && errorJson && errorJson.error) {
      const errorCode = errorJson.error as string
      if (['integration_not_connected', 'quota_exceeded', 'plan_not_allowed', 'tenant_not_found'].includes(errorCode)) {
        // Create structured error that can be parsed by LaunchGateErrorCard
        const launchGateError = new Error(errorJson.message as string || 'Launch Gate Error')
        ;(launchGateError as any).launchGate = {
          errorCode,
          message: errorJson.message,
          details: errorJson.details,
        }
        throw launchGateError
      }
    }

    // Map HTTP status codes to user-friendly messages
    if (response.status === 401) {
      errorMessage = 'Nicht autorisiert. Bitte melden Sie sich erneut an.'
    } else if (response.status === 403) {
      errorMessage = 'Zugriff verweigert. Möglicherweise blockiert eine Policy diese Aktion oder es ist eine Freigabe erforderlich.'
    } else if (response.status === 404) {
      errorMessage = 'Aktion nicht gefunden. Bitte überprüfen Sie die Action-ID.'
    } else if (response.status >= 500) {
      errorMessage = 'Backend-Fehler. Bitte versuchen Sie es später erneut.'
    }

    throw new Error(errorMessage)
  }

  const data = await response.json()
  return {
    runId: data.run_id || data.id,
    status: data.status || 'running',
    result: data.result,
    missingFields: data.missing_fields,  // Phase 2: Extract missing_fields
    errors: data.errors,  // Phase 2: Extract errors
    reasonCode: data.reason_code,  // Phase 5: Extract reason_code
  }
}

/**
 * Stream action run events via SSE.
 */
async function streamRun(
  body: Record<string, unknown>,
  onEvent: ActionRunEventHandler,
  resumeFromEventId?: string,
  signal?: AbortSignal
): Promise<ActionRunResult> {
  const headers = withAuthHeaders({
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  })
  if (resumeFromEventId) {
    headers['Last-Event-ID'] = resumeFromEventId
  }
  
  return new Promise((resolve, reject) => {
    // Use fetch with ReadableStream for SSE (POST support)
    authedFetch('/api/actions/execute', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(body),
      signal,
    })
      .then(async (response) => {
        // Check if response is actually available (network errors might give undefined)
        if (!response) {
          reject(new Error('Backend-Server ist nicht erreichbar. Bitte stelle sicher, dass der Backend-Server läuft.'))
          return
        }
        if (!response.ok) {
          let text = ''
          let errorMessage = `Action execution failed (${response.status})`
          try {
            text = await response.text()
            if (text) {
              try {
                // Try to parse nested JSON error from backend
                const json = JSON.parse(text)
                if (json.message) {
                   // Handle nested serialized JSON in message
                   try {
                     const inner = JSON.parse(json.message)
                     if (inner.details) {
                       const details = JSON.parse(inner.details)
                       errorMessage = details.detail || inner.message || json.message
                     } else {
                       errorMessage = inner.message || json.message
                     }
                   } catch {
                     errorMessage = json.message
                   }
                } else if (json.error) {
                  errorMessage = json.error
                } else {
                  errorMessage = text
                }
              } catch {
                errorMessage = text || errorMessage
              }
            }
          } catch (readError) {
            // If we can't read the response, use status-based message
            if (response.status === 401) {
              errorMessage = 'Nicht autorisiert. Bitte melden Sie sich erneut an.'
            } else if (response.status === 403) {
              errorMessage = 'Zugriff verweigert.'
            } else if (response.status === 404) {
              errorMessage = 'Aktion nicht gefunden.'
            } else if (response.status >= 500) {
              errorMessage = 'Backend-Fehler. Bitte versuchen Sie es später erneut.'
            }
          }
          reject(new Error(errorMessage))
          return
        }

        if (!response.body) {
          reject(new Error('No response body'))
          return
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let runId: string | undefined
        let result: ActionRunResult | undefined
        let currentEvent: { type?: string; data?: string; id?: string } = {}
        let lastEventId = resumeFromEventId

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              // Stream ended - check if we have a result
              if (!result && runId) {
                // Stream ended without completion event - assume still running
                result = {
                  runId,
                  status: 'running',
                }
              }
              break
            }

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              // SSE format: event:, data:, id:, or empty line (end of event)
              if (line.trim() === '') {
                // End of event - process if we have data
                if (currentEvent.data) {
                  try {
                    const data = JSON.parse(currentEvent.data)
                    if (currentEvent.id && !data.id) {
                      data.id = currentEvent.id
                    }
                    
                    // Extract run_id from first event
                    if (!runId && data.run_id) {
                      runId = data.run_id
                    }
                    if (!lastEventId && typeof data.id === 'string') {
                      lastEventId = data.id
                    }

                    // Map to ActionRunEvent
                    const event: ActionRunEvent = {
                      type: (currentEvent.type || data.type || 'run.progress') as ActionRunEvent['type'],
                      data,
                    }

                    onEvent(event)

                    // Check for completion
                    if (event.type === 'run.completed') {
                      result = {
                        runId: runId || data.run_id || '',
                        status: 'completed',
                        result: data.result,
                        lastEventId,
                      }
                      // Close reader and resolve
                      await reader.cancel()
                      resolve(result)
                      return
                    } else if (event.type === 'run.failed') {
                      result = {
                        runId: runId || data.run_id || '',
                        status: 'failed',
                        error: data.error || data.safe_message,
                        lastEventId,
                      }
                      // Close reader and resolve
                      await reader.cancel()
                      resolve(result)
                      return
                    }
                  } catch (e) {
                    console.warn('Failed to parse SSE data:', e, currentEvent.data)
                  }
                }
                // Reset for next event
                currentEvent = {}
              } else if (line.startsWith('event: ')) {
                currentEvent.type = line.substring(7).trim()
              } else if (line.startsWith('data: ')) {
                const dataStr = line.substring(6).trim()
                // Append to data (multi-line data support)
                currentEvent.data = currentEvent.data ? `${currentEvent.data}\n${dataStr}` : dataStr
              } else if (line.startsWith('id: ')) {
                currentEvent.id = line.substring(4).trim()
                lastEventId = currentEvent.id
              }
            }
          }

          // Process remaining buffer if any
          if (buffer.trim() && currentEvent.data) {
            try {
              const data = JSON.parse(currentEvent.data)
              const event: ActionRunEvent = {
                type: (currentEvent.type || data.type || 'run.progress') as ActionRunEvent['type'],
                data,
              }
              onEvent(event)
              
              if (event.type === 'run.completed' || event.type === 'run.failed') {
                result = {
                  runId: runId || data.run_id || '',
                  status: event.type === 'run.completed' ? 'completed' : 'failed',
                  result: data.result,
                  error: data.error || data.safe_message,
                  lastEventId,
                }
              }
            } catch (e) {
              // Ignore parse errors for trailing buffer
            }
          }

          // Ensure reader is closed
          try {
            await reader.cancel()
          } catch (e) {
            // Ignore cancel errors
          }

          resolve(
            result || {
              runId: runId || '',
              status: 'running',
              lastEventId,
            }
          )
        } catch (error) {
          // Ensure reader is closed on error
          try {
            await reader.cancel()
          } catch (e) {
            // Ignore cancel errors
          }
          
          // Only reject if it's not an abort error (abort is expected)
          if (error instanceof Error && error.name !== 'AbortError') {
            reject(error)
          } else if (!result) {
            // If aborted without result, resolve with running status
            resolve({
              runId: runId || '',
              status: 'running',
              lastEventId,
            })
          }
        }
      })
      .catch((error) => {
        // Handle fetch errors
        if (error instanceof Error && error.name === 'AbortError') {
          // Abort is expected - resolve with running status
          resolve({
            runId: '',
            status: 'running',
            lastEventId: undefined,
          })
        } else {
          // Network/connection errors - provide better error message
          let errorMessage = 'Verbindungsfehler: Backend-Server nicht erreichbar'
          if (error instanceof Error) {
            const errorMsg = error.message || ''
            const errorCause = error.cause?.toString() || ''
            if (errorMsg.includes('fetch failed') || 
                errorMsg.includes('ECONNREFUSED') ||
                errorMsg.includes('Failed to fetch') ||
                errorMsg.includes('network error') ||
                errorMsg.includes('Load failed') ||
                errorCause.includes('ECONNREFUSED') ||
                errorCause.includes('fetch failed')) {
              errorMessage = 'Backend-Server ist nicht erreichbar. Bitte stelle sicher, dass der Backend-Server läuft.'
            } else {
              errorMessage = errorMsg || 'Unbekannter Verbindungsfehler'
            }
          } else if (typeof error === 'string') {
            if (error.includes('fetch failed') || error.includes('Load failed')) {
              errorMessage = 'Backend-Server ist nicht erreichbar. Bitte stelle sicher, dass der Backend-Server läuft.'
            } else {
              errorMessage = error
            }
          }
          reject(new Error(errorMessage))
        }
      })
    
    // Return abort function for cleanup (optional - caller can use this)
    // Note: This is a limitation - we can't return both Promise and abort function easily
    // In practice, the caller should handle cleanup via component unmount
  })
}

export interface ActionInputPayload {
  step_key: string
  input: unknown
  input_key?: string
  idempotency_key?: string
}

/**
 * Send user input to a running action.
 *
 * Contract: { step_key: string, input: any, input_key?: string }
 */
export async function sendInput(runId: string, payload: ActionInputPayload): Promise<void> {
  if (!payload?.step_key) {
    throw new Error('step_key ist erforderlich, um Input zu senden')
  }

  const headers = withAuthHeaders({
    'Content-Type': 'application/json',
  })
  
  let response: Response
  try {
    response = await fetch(`/api/actions/runs/${runId}/input`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        input: payload.input,
        step_key: payload.step_key,
        input_key: payload.input_key,
        idempotency_key: payload.idempotency_key,
      }),
    })
  } catch (error) {
    // Handle network/connection errors
    if (error instanceof Error && (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED'))) {
      throw new Error('Backend-Server ist nicht erreichbar. Bitte stelle sicher, dass der Backend-Server läuft.')
    }
    throw error
  }

  if (!response.ok) {
    let errorMessage = 'Failed to send input'
    try {
      const errorText = await response.text()
      if (errorText) {
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorJson.error || errorText
        } catch {
          errorMessage = errorText
        }
      }
    } catch {
      // Fallback
    }

    if (response.status === 401) {
      errorMessage = 'Nicht autorisiert'
    } else if (response.status === 404) {
      errorMessage = 'Run nicht gefunden'
    }

    throw new Error(errorMessage)
  }
}

/**
 * Get action run status.
 */
export async function getRunStatus(runId: string): Promise<ActionRunResult> {
  const headers = withAuthHeaders()
  
  let response: Response
  try {
    response = await fetch(`/api/actions/runs/${runId}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    })
  } catch (error) {
    // Handle network/connection errors
    if (error instanceof Error && (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED'))) {
      throw new Error('Backend-Server ist nicht erreichbar. Bitte stelle sicher, dass der Backend-Server läuft.')
    }
    throw error
  }

  if (!response.ok) {
    const error = await response.text().catch(() => 'Unknown error')
    throw new Error(`Failed to get run status: ${error}`)
  }

  const data = await response.json()
  return {
    runId: data.id || runId,
    status: data.status || 'running',
    result: data.output_data,
    error: data.error_message,
  }
}

