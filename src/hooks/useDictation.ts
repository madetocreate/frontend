'use client'

import { useCallback, useRef, useState } from 'react'

type DictationStatus = 'idle' | 'recording' | 'transcribing' | 'error'

type UseDictationOptions = {
  onTranscriptionReady?: (text: string) => void | Promise<void>
}

export function useDictation(options: UseDictationOptions = {}) {
  const [status, setStatus] = useState<DictationStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  const resetError = useCallback(() => {
    setError(null)
  }, [])

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
      streamRef.current = null
    }
  }, [])

  const startRecording = useCallback(async () => {
    if (typeof window === 'undefined') {
      return
    }

    if (status === 'recording' || status === 'transcribing') {
      return
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Mikrofon wird im Browser nicht unterstützt.')
      setStatus('error')
      return
    }

    if (typeof MediaRecorder === 'undefined') {
      setError('Audioaufnahmen werden im Browser nicht unterstützt.')
      setStatus('error')
      return
    }

    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onerror = () => {
        setError('Fehler bei der Audioaufnahme.')
        setStatus('error')
        stopStream()
      }

      recorder.onstop = async () => {
        const chunks = chunksRef.current
        chunksRef.current = []

        if (!chunks.length) {
          stopStream()
          setStatus('idle')
          return
        }

        const blob = new Blob(chunks, { type: 'audio/webm' })
        setStatus('transcribing')

        try {
          const formData = new FormData()
          formData.append('file', blob, 'speech.webm')

          const response = await fetch('/api/audio/transcribe', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            const message = await response.text().catch(() => '')
            throw new Error(message || 'Transkription fehlgeschlagen')
          }

          const json = (await response.json()) as { text?: string }
          const text = typeof json.text === 'string' ? json.text.trim() : ''

          if (text && options.onTranscriptionReady) {
            await options.onTranscriptionReady(text)
          }

          setStatus('idle')
        } catch (err) {
          console.error('Transcription error', err)
          setError('Transkription fehlgeschlagen.')
          setStatus('error')
        } finally {
          stopStream()
        }
      }

      recorder.start()
      setStatus('recording')
    } catch (err) {
      console.error('Mic permission error', err)
      setError('Mikrofonzugriff nicht möglich.')
      setStatus('error')
      stopStream()
    }
  }, [options, status, stopStream])

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state === 'recording') {
      recorder.stop()
    }
  }, [])

  return {
    status,
    isRecording: status === 'recording',
    isTranscribing: status === 'transcribing',
    error,
    startRecording,
    stopRecording,
    resetError,
  }
}
