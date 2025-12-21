'use client'

/**
 * Lightweight Push-to-Talk Controller on top of realtimeVoiceClient.
 * Responsibilities:
 * - Ensure session is active (lazy start)
 * - On press: start audio capture if not already
 * - On release: commit audio buffer + request response
 * - Barge-in: if assistant is speaking and user presses, cancel current response then capture
 */

import {
  startRealtimeVoiceSession,
  stopRealtimeVoiceSession,
  cancelResponse,
  sendRealtimeTextMessage,
  getRealtimeStatus,
} from './realtimeVoiceClient'

export type PttState = 'idle' | 'holding' | 'assistant' | 'error'

type PttCallbacks = {
  onAssistantText?: (delta: string) => void
  onAssistantDone?: () => void
  onUserTranscript?: (text: string) => void
}

export function createPttController(callbacks: PttCallbacks = {}) {
  let state: PttState = 'idle'

  async function ensureSession() {
    if (getRealtimeStatus().isActive) return
    await startRealtimeVoiceSession({
      onTextDelta: callbacks.onAssistantText,
      onResponseDone: () => {
        state = 'idle'
        callbacks.onAssistantDone?.()
      },
      onUserTranscript: callbacks.onUserTranscript,
    })
  }

  return {
    getState() {
      return state
    },
    /**
     * User presses/holds the PTT button.
     * If assistant is speaking, cancel and prepare new input (barge-in).
     */
    async press() {
      try {
        await ensureSession()
        if (state === 'assistant') {
          cancelResponse()
        }
        state = 'holding'
      } catch (err) {
        console.error('PTT press failed', err)
        state = 'error'
        throw err
      }
    },
    /**
     * User releases the PTT button: finalize current input and ask for response.
     */
    async release() {
      if (state !== 'holding') return
      const status = getRealtimeStatus()
      if (!status.isActive) {
        state = 'idle'
        return
      }
      try {
        // request a response after audio input is committed
        state = 'assistant'
        sendRealtimeTextMessage('') // trigger response.create even if no text; audio already sent
      } catch (err) {
        console.error('PTT release failed', err)
        state = 'error'
        throw err
      }
    },
    /**
     * Stop everything (user cancels).
     */
    async stopAll() {
      await stopRealtimeVoiceSession()
      state = 'idle'
    },
  }
}


