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
  const isCancelledRef = useRef<boolean>(false)

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

    isCancelledRef.current = false
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

      // Versuche ein unterstütztes Format zu verwenden
      let mimeType = 'audio/webm'
      const supportedTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/mpeg',
        'audio/wav',
      ]
      
      // Finde das erste unterstützte Format
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type
          break
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType })
      // Speichere den MIME-Type für später
      ;(recorder as MediaRecorder & { __mimeType?: string }).__mimeType = mimeType
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onerror = () => {
        if (isCancelledRef.current) return
        setError('Fehler bei der Audioaufnahme.')
        setStatus('error')
        stopStream()
      }

      recorder.onstop = async () => {
        if (isCancelledRef.current) {
          chunksRef.current = []
          stopStream()
          setStatus('idle')
          return
        }

        const chunks = chunksRef.current
        chunksRef.current = []

        if (!chunks.length) {
          stopStream()
          setStatus('idle')
          return
        }

        // Bestimme den Dateinamen basierend auf dem MIME-Type
        const mimeType = recorder.mimeType || (recorder as MediaRecorder & { __mimeType?: string }).__mimeType || 'audio/webm'
        let extension = 'webm'
        let blobType = 'audio/webm'
        
        if (mimeType.includes('mp4') || mimeType.includes('m4a')) {
          extension = 'm4a'
          blobType = 'audio/mp4'
        } else if (mimeType.includes('mpeg')) {
          extension = 'mp3'
          blobType = 'audio/mpeg'
        } else if (mimeType.includes('wav')) {
          extension = 'wav'
          blobType = 'audio/wav'
        } else {
          extension = 'webm'
          blobType = 'audio/webm'
        }

        const blob = new Blob(chunks, { type: blobType })
        
        // Validierung: Mindestgröße für Audio-Datei (z.B. 1KB)
        if (blob.size < 1024) {
          stopStream()
          setError('Aufnahme zu kurz. Bitte sprechen Sie länger.')
          setStatus('error')
          return
        }

        setStatus('transcribing')

        try {
          const formData = new FormData()
          formData.append('file', blob, `speech.${extension}`)

          const { authedFetch } = await import('@/lib/api/authedFetch')
          const response = await authedFetch('/api/audio/transcribe', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            let errorMessage = 'Transkription fehlgeschlagen'
            try {
              const errorJson = await response.json()
              // Bessere Extraktion der Fehlermeldung
              if (errorJson.error) {
                if (typeof errorJson.error === 'string') {
                  errorMessage = errorJson.error
                } else if (errorJson.error.message) {
                  errorMessage = errorJson.error.message
                } else if (errorJson.error.detail) {
                  errorMessage = errorJson.error.detail
                }
              } else if (errorJson.detail) {
                errorMessage = errorJson.detail
              }
              
              // Spezifische Fehlermeldungen für bekannte Probleme
              if (errorMessage.includes('corrupted') || errorMessage.includes('unsupported')) {
                errorMessage = 'Audio-Format wird nicht unterstützt. Bitte versuchen Sie es erneut.'
              }
            } catch {
              const message = await response.text().catch(() => '')
              errorMessage = message || errorMessage
            }
            throw new Error(errorMessage)
          }

          const json = (await response.json()) as { text?: string }
          const text = typeof json.text === 'string' ? json.text.trim() : ''

          if (text && options.onTranscriptionReady) {
            await options.onTranscriptionReady(text)
          }

          setStatus('idle')
        } catch (err) {
          console.error('Transcription error', err)
          const errorMessage = err instanceof Error ? err.message : 'Transkription fehlgeschlagen.'
          setError(errorMessage)
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
    isCancelledRef.current = false
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state === 'recording') {
      recorder.stop()
    }
  }, [])

  const cancelRecording = useCallback(() => {
    isCancelledRef.current = true
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state === 'recording') {
      recorder.stop()
    }
    stopStream()
    setStatus('idle')
  }, [stopStream])

  return {
    status,
    isRecording: status === 'recording',
    isTranscribing: status === 'transcribing',
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    resetError,
  }
}
