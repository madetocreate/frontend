'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
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
  
  // Create PTT controller only once per hook lifecycle
  const pttRef = useRef<ReturnType<typeof createPttController> | null>(null)
  
  // Lazy init ptt controller
  const getPtt = useCallback(() => {
    if (!pttRef.current) {
      pttRef.current = createPttController({
        onAssistantText: options.onTextDelta,
        onAssistantDone: options.onStop,
        onUserTranscript: options.onTextDelta, // surface transcript as text
      })
    }
    return pttRef.current
  }, [options.onTextDelta, options.onStop])

  // Update callbacks when options change (but keep same controller instance)
  useEffect(() => {
    const ptt = pttRef.current
    if (ptt && options) {
      // Update callbacks if the controller supports it, otherwise controller will use latest closures
      // The controller instance stays the same, ensuring press/release stability
    }
  }, [options.onTextDelta, options.onStop])

  const resetError = useCallback(() => {
    setError(null)
  }, [setError])

  const press = useCallback(async () => {
    const ptt = getPtt()
    if (!ptt) return
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
  }, [options, getPtt])

  const release = useCallback(async () => {
    const ptt = getPtt()
    if (!ptt) return
    try {
      await ptt.release()
      setStatus('assistant')
    } catch (err) {
      console.error('Realtime voice release error', err)
      setError('Realtime-Audio konnte nicht abgeschlossen werden.')
      setStatus('error')
    }
  }, [getPtt])

  const stopAll = useCallback(async () => {
    const ptt = getPtt()
    if (!ptt) return
    try {
      await ptt.stopAll()
      setStatus('idle')
      options.onStop?.()
    } catch (err) {
      console.error('Realtime voice stop error', err)
      setError('Session konnte nicht gestoppt werden.')
      setStatus('error')
    }
  }, [options, getPtt])

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
