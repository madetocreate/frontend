'use client'

import { useCallback, useState } from 'react'
import { createPttController, PttState } from '../lib/realtimePTT'

export type RealtimeVoiceStatus = PttState | 'connecting'

type UseRealtimeVoiceOptions = {
  onStart?: () => void
  onStop?: () => void
  onTextDelta?: (text: string) => void
}

export function useRealtimeVoice(options: UseRealtimeVoiceOptions = {}) {
  const [status, setStatus] = useState<RealtimeVoiceStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const ptt = createPttController({
    onAssistantText: options.onTextDelta,
    onAssistantDone: options.onStop,
    onUserTranscript: options.onTextDelta, // surface transcript as text
  })

  const resetError = useCallback(() => {
    setError(null)
  }, [setError])

  const press = useCallback(async () => {
    try {
      setError(null)
      setStatus('connecting')
      await ptt.press()
      setStatus('holding')
      options.onStart?.()
    } catch (err) {
      console.error('Realtime voice press error', err)
      setError('Realtime-Audio konnte nicht gestartet werden.')
      setStatus('error')
    }
  }, [options, ptt, setError, setStatus])

  const release = useCallback(async () => {
    try {
      await ptt.release()
      setStatus('assistant')
    } catch (err) {
      console.error('Realtime voice release error', err)
      setError('Realtime-Audio konnte nicht abgeschlossen werden.')
      setStatus('error')
    }
  }, [ptt, setError, setStatus])

  const stopAll = useCallback(async () => {
    try {
      await ptt.stopAll()
      setStatus('idle')
      options.onStop?.()
    } catch (err) {
      console.error('Realtime voice stop error', err)
      setError('Session konnte nicht gestoppt werden.')
      setStatus('error')
    }
  }, [options, ptt, setError, setStatus])

  return {
    status,
    isLive: status === 'holding' || status === 'assistant',
    isConnecting: status === 'connecting',
    error,
    press,
    release,
    stopAll,
    resetError,
  }
}
