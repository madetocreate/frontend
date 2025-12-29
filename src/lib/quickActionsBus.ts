'use client'

export type QuickActionPayload = {
  id: string
  source?: string
}

const EVENT_NAME = 'ak.quickAction'

export function emitQuickAction(payload: QuickActionPayload) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<QuickActionPayload>(EVENT_NAME, { detail: payload }))
}

export function subscribeQuickAction(
  handler: (payload: QuickActionPayload) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<QuickActionPayload>
    if (!customEvent.detail) return
    handler(customEvent.detail)
  }

  window.addEventListener(EVENT_NAME, listener as EventListener)

  return () => {
    window.removeEventListener(EVENT_NAME, listener as EventListener)
  }
}
