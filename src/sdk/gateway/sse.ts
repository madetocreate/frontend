import type { ChatStreamCallbacks, OrchestratorStep, UIMessage } from './types'

function parseJsonOrWrap(text: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(text)
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, unknown>
    }
    return { content: text }
  } catch {
    return { content: text }
  }
}

function extractEffectiveEvent(eventName: string, data: Record<string, unknown>): string {
  if (eventName && eventName !== 'message') {
    return eventName
  }

  const embedded = data.event
  return typeof embedded === 'string' ? embedded : ''
}

export async function consumeSseReadableStream(params: {
  stream: ReadableStream<Uint8Array>
  callbacks: ChatStreamCallbacks
  signal?: AbortSignal
}): Promise<void> {
  const reader = params.stream.getReader()
  const decoder = new TextDecoder()

  let buffer = ''
  let currentEvent = ''
  let currentData = ''
  let ended = false // Flag to prevent double onEnd() calls

  const dispatch = (eventName: string, dataText: string) => {
    if (!dataText) return
    const data = parseJsonOrWrap(dataText)
    const effectiveEvent = extractEffectiveEvent(eventName, data)
    if (!effectiveEvent) return

    switch (effectiveEvent) {
      case 'start':
        params.callbacks.onStart?.({ steps: (data.steps as OrchestratorStep[]) || [] })
        return
      case 'step_update':
        params.callbacks.onStepUpdate?.({
          stepId: String(data.stepId || ''),
          status: String(data.status || ''),
        })
        return
      case 'status':
        // Status event: { stage: 'routing' | 'thinking' | 'finalizing' }
        params.callbacks.onStatus?.({ stage: String(data.stage || '') })
        return
      case 'delta':
        // Delta event: { delta: string } - only new characters, append to existing content
        params.callbacks.onDelta?.({ delta: String(data.delta || '') })
        return
      case 'chunk':
        // Legacy chunk event: { content: string } - cumulative content (for backward compatibility)
        params.callbacks.onChunk?.({ content: String(data.content || '') })
        return
      case 'final':
        // Final event: full content + metadata (primary end event)
        if (!ended) {
          ended = true
          params.callbacks.onEnd?.({
            content: String(data.content || ''),
            steps: (data.steps as OrchestratorStep[] | undefined) || undefined,
            uiMessages: (data.uiMessages as UIMessage[] | undefined) || undefined,
            actions: (data.actions as Record<string, unknown>[] | undefined) || undefined,
          })
        }
        return
      case 'end':
        // End event (backward compatibility - only call if final hasn't been called)
        if (!ended) {
          ended = true
          params.callbacks.onEnd?.({
            content: String(data.content || ''),
            steps: (data.steps as OrchestratorStep[] | undefined) || undefined,
            uiMessages: (data.uiMessages as UIMessage[] | undefined) || undefined,
            actions: (data.actions as Record<string, unknown>[] | undefined) || undefined,
          })
        }
        return
      case 'error':
        params.callbacks.onError?.({ message: String(data.message || 'Unknown error') })
        return
      default:
        return
    }
  }

  try {
    while (true) {
      if (params.signal?.aborted) {
        params.callbacks.onAbort?.()
        return
      }

      const { value, done } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (line.startsWith('event:')) {
          currentEvent = line.slice(6).trim()
          continue
        }

        if (line.startsWith('data:')) {
          const raw = line.slice(5)
          const payload = raw.startsWith(' ') ? raw.slice(1) : raw
          currentData = currentData ? `${currentData}\n${payload}` : payload
          continue
        }

        if (line.trim() === '' && currentData) {
          dispatch(currentEvent, currentData)
          currentEvent = ''
          currentData = ''
        }
      }
    }

    if (buffer) {
      const tailLines = buffer.split(/\r?\n/)
      for (const line of tailLines) {
        if (line.startsWith('event:')) {
          currentEvent = line.slice(6).trim()
          continue
        }

        if (line.startsWith('data:')) {
          const raw = line.slice(5)
          const payload = raw.startsWith(' ') ? raw.slice(1) : raw
          currentData = currentData ? `${currentData}\n${payload}` : payload
          continue
        }

        if (line.trim() === '' && currentData) {
          dispatch(currentEvent, currentData)
          currentEvent = ''
          currentData = ''
        }
      }
    }

    if (currentData) {
      dispatch(currentEvent, currentData)
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      params.callbacks.onAbort?.()
      return
    }
    throw err
  } finally {
    try {
      reader.releaseLock()
    } catch {
    }
  }
}

export async function consumeSseResponse(params: {
  response: Response
  callbacks: ChatStreamCallbacks
  signal?: AbortSignal
}): Promise<void> {
  if (!params.response.body) {
    throw new Error('No response body for SSE stream')
  }

  await consumeSseReadableStream({
    stream: params.response.body,
    callbacks: params.callbacks,
    signal: params.signal,
  })
}
