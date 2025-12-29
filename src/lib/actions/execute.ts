/**
 * Action Execution Hook with SSE Support
 * 
 * Executes actions via Python backend and streams events via SSE
 */

import { startRun, type ActionStartRequest, type ActionRunEvent, type ActionRunResult } from '../actionRuns/client'
import { useCallback, useRef, useState } from 'react'

export type ExecuteActionOptions = {
  actionId: string
  module: 'inbox' | 'documents' | 'reviews' | 'crm' | 'onboarding' | 'website'
  moduleContext: Record<string, unknown>
  config?: Record<string, unknown>
  stream?: boolean
}

export type ActionRunState = {
  runId: string | null
  status: 'idle' | 'running' | 'completed' | 'failed' | 'needs_input'
  result: ActionRunResult | null
  error: Error | null
  events: ActionRunEvent[]
}

export type UseExecuteActionResult = {
  state: ActionRunState
  execute: (options: ExecuteActionOptions) => Promise<void>
  cancel: () => void
}

/**
 * React Hook for executing actions with SSE streaming
 */
export function useExecuteAction(): UseExecuteActionResult {
  const [state, setState] = useState<ActionRunState>({
    runId: null,
    status: 'idle',
    result: null,
    error: null,
    events: [],
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const execute = useCallback(async (options: ExecuteActionOptions) => {
    const { actionId, module, moduleContext, config, stream = true } = options

    // Cancel previous execution if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    setState({
      runId: null,
      status: 'running',
      result: null,
      error: null,
      events: [],
    })

    try {
      const request: ActionStartRequest = {
        actionId,
        context: {
          module,
          moduleContext,
        },
        config,
        stream,
        signal: abortControllerRef.current.signal,
      }

      const result = await startRun(request, (event: ActionRunEvent) => {
        setState((prev) => ({
          ...prev,
          events: [...prev.events, event],
        }))

        // Update status based on event
        if (event.type === 'run.started') {
          setState((prev) => ({
            ...prev,
            runId: (event.data.run_id as string) || null,
            status: 'running',
          }))
        } else if (event.type === 'run.completed') {
          setState((prev) => ({
            ...prev,
            status: 'completed',
            result: {
              runId: prev.runId || '',
              status: 'completed',
              result: event.data.output_data as Record<string, unknown>,
            },
          }))
        } else if (event.type === 'run.failed') {
          setState((prev) => ({
            ...prev,
            status: 'failed',
            error: new Error((event.data.error as string) || 'Action execution failed'),
          }))
        } else if (event.type === 'user_input.requested') {
          setState((prev) => ({
            ...prev,
            status: 'needs_input',
          }))
        }
      })

      // Final state update
      setState((prev) => ({
        ...prev,
        status: result.status === 'completed' ? 'completed' : result.status === 'failed' ? 'failed' : 'running',
        result,
      }))
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, ignore
        return
      }
      setState((prev) => ({
        ...prev,
        status: 'failed',
        error: err instanceof Error ? err : new Error('Unknown error'),
      }))
    }
  }, [])

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setState((prev) => ({
      ...prev,
      status: prev.status === 'running' ? 'failed' : prev.status,
      error: prev.status === 'running' ? new Error('Action cancelled') : prev.error,
    }))
  }, [])

  return {
    state,
    execute,
    cancel,
  }
}

/**
 * Standalone function to execute an action (for non-React usage)
 */
export async function executeAction(
  options: ExecuteActionOptions,
  onEvent?: (event: ActionRunEvent) => void
): Promise<ActionRunResult> {
  const { actionId, module, moduleContext, config, stream = true } = options

  const request: ActionStartRequest = {
    actionId,
    context: {
      module,
      moduleContext,
    },
    config,
    stream,
  }

  return startRun(request, onEvent)
}

