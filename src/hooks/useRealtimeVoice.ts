'use client'

import { useCallback, useState } from 'react'

export type RealtimeVoiceStatus = 'idle' | 'connecting' | 'live' | 'error'

type UseRealtimeVoiceOptions = {
  onStart?: () => void
  onStop?: () => void
}

export function useRealtimeVoice(options: UseRealtimeVoiceOptions = {}) {
  const [status, setStatus] = useState<RealtimeVoiceStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const resetError = useCallback(() => {
    setError(null)
  }, [])

  const toggle = useCallback(async () => {
    if (typeof window === 'undefined') {
      return
    }

    const anyWindow = window as unknown as {
      startRealtimeVoiceSession?: () => Promise<void> | void
      stopRealtimeVoiceSession?: () => Promise<void> | void
    }

    try {
      if (status === 'idle' || status === 'error') {
        setError(null)
        setStatus('connecting')

        if (anyWindow.startRealtimeVoiceSession) {
          await anyWindow.startRealtimeVoiceSession()
        }

        setStatus('live')
        if (options.onStart) {
          options.onStart()
        }
      } else {
        if (anyWindow.stopRealtimeVoiceSession) {
          await anyWindow.stopRealtimeVoiceSession()
        }

        setStatus('idle')
        if (options.onStop) {
          options.onStop()
        }
      }
    } catch (err) {
      console.error('Realtime voice error', err)
      setError('Realtime-Audio konnte nicht gestartet werden.')
      setStatus('error')
    }
  }, [options, status])

  return {
    status,
    isLive: status === 'live',
    isConnecting: status === 'connecting',
    error,
    toggle,
    resetError,
  }
}
