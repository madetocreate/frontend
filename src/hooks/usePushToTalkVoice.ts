'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  startRealtimeVoiceSession,
  stopRealtimeVoiceSession,
  cancelResponse,
  commitInputAudio,
  setMicEnabled,
} from '../lib/realtimeVoiceClient'

export type PttStatus = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error'

type UsePushToTalkVoiceOptions = {
  onAssistantText?: (text: string) => void
  onUserText?: (text: string) => void
  threadId?: string
  tenantId?: string
}

/**
 * Push-to-talk state machine:
 * - press: ensure session; enable mic; cancel current assistant if speaking (barge-in)
 * - release: disable mic; commit audio buffer; wait for response
 */
export function usePushToTalkVoice(options: UsePushToTalkVoiceOptions = {}) {
  const [status, setStatus] = useState<PttStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const assistantBufferRef = useRef<string>('')

  const resetError = useCallback(() => setError(null), [setError])

  useEffect(() => {
    return () => {
      stopRealtimeVoiceSession().catch(() => undefined)
    }
  }, [])

  const handleAssistantDelta = useCallback(
    (delta: string) => {
      assistantBufferRef.current += delta
      setStatus((prev) => (prev === 'listening' ? 'thinking' : prev))
    },
    []
  )

  const handleUserTranscript = useCallback(
    (text: string) => {
      if (text && options.onUserText) {
        options.onUserText(text)
      }
    },
    [options]
  )

  const handleResponseDone = useCallback(() => {
    if (assistantBufferRef.current && options.onAssistantText) {
      options.onAssistantText(assistantBufferRef.current)
    }
    assistantBufferRef.current = ''
    setStatus('idle')
  }, [options])

  const startPress = useCallback(async () => {
    try {
      setError(null)
      // If assistant is currently talking, cancel (barge-in)
      cancelResponse()
      if (status === 'idle' || status === 'thinking' || status === 'speaking') {
        setStatus('connecting')
        await startRealtimeVoiceSession(
          {
            onTextDelta: handleAssistantDelta,
            onResponseDone: handleResponseDone,
            onUserTranscript: handleUserTranscript,
          },
          undefined,
          { threadId: options.threadId, tenantId: options.tenantId }
        )
      }
      // Enable mic (both WS and WebRTC)
      setMicEnabled(true)
      setStatus('listening')
    } catch (err) {
      console.error('PTT start error', err)
      setStatus('error')
      setError('Voice konnte nicht gestartet werden.')
    }
  }, [handleAssistantDelta, handleResponseDone, handleUserTranscript, options, status])

  const stopPress = useCallback(async () => {
    try {
      // Disable mic and commit current audio buffer
      setMicEnabled(false)
      commitInputAudio()
      setStatus((prev) => (prev === 'listening' ? 'thinking' : prev))
    } catch (err) {
      console.error('PTT stop error', err)
      setStatus('error')
      setError('Voice konnte nicht gestoppt werden.')
    }
  }, [])

  return {
    status,
    error,
    isListening: status === 'listening',
    isThinking: status === 'thinking',
    isSpeaking: status === 'speaking',
    startPress,
    stopPress,
    resetError,
  }
}

