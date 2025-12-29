'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type SpeechStatus = 'idle' | 'speaking' | 'ended' | 'error'

type SpeakParams = {
  id: string
  text: string
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
}

// OpenAI TTS Voices: alloy, echo, fable, onyx, nova, shimmer
// nova und shimmer sind die neuesten, hochwertigen Stimmen
function getVoiceForLanguage(lang: string): string {
  const normalized = (lang || '').toLowerCase()
  // Für Deutsch verwenden wir 'nova' (eine der besten Stimmen)
  if (normalized.startsWith('de')) {
    return 'nova'
  }
  // Standard: nova (hochwertige, natürliche Stimme)
  return 'nova'
}

export function useSpeechSynthesis(defaultLang: string = 'de-DE') {
  // OpenAI TTS ist immer unterstützt
  const supported = true
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const [status, setStatus] = useState<SpeechStatus>('idle')

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentIdRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup: Stoppe Audio wenn Komponente unmountet
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
        audioUrlRef.current = null
      }
      currentIdRef.current = null
      setSpeakingId(null)
      setStatus('idle')
    }
  }, [])

  const audioUrlRef = useRef<string | null>(null)

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      // Cleanup object URL if exists
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
        audioUrlRef.current = null
      }
      audioRef.current = null
    }
    currentIdRef.current = null
    setSpeakingId(null)
    setStatus('idle')
  }, [])

  const speak = useCallback(
    async (params: SpeakParams) => {
      if (!supported) return

      const text = (params.text || '').trim()
      if (!text) return

      const lang = params.lang ?? defaultLang
      stop()

      currentIdRef.current = params.id
      setStatus('speaking')
      setSpeakingId(params.id)

      try {
        // Rufe OpenAI TTS API auf mit Streaming
        const voice = getVoiceForLanguage(lang)
        const { authedFetch } = await import('@/lib/api/authedFetch')
        const response = await authedFetch('/api/audio/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            voice,
          }),
        })

        if (!response.ok) {
          throw new Error('TTS request failed')
        }

        // Für Streaming: Lese Stream in Chunks und starte Wiedergabe sobald genug Daten da sind
        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('No response body')
        }

        const chunks: Uint8Array[] = []

        // Read stream completely before playback (no partial playback to avoid choppy audio)
        const readStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) {
                // Stream complete - create blob and play
                if (chunks.length > 0 && currentIdRef.current === params.id) {
                  const finalBlob = new Blob(chunks as BlobPart[], { type: 'audio/mpeg' })
                  audioUrlRef.current = URL.createObjectURL(finalBlob)
                  const audioUrl = audioUrlRef.current
                  
                  const audio = new Audio(audioUrl)
                  audioRef.current = audio

                  if (typeof params.volume === 'number') {
                    audio.volume = Math.max(0, Math.min(1, params.volume))
                  } else {
                    audio.volume = 1.0
                  }

                  if (typeof params.rate === 'number') {
                    audio.playbackRate = Math.max(0.5, Math.min(2, params.rate))
                  }

                  audio.onended = () => {
                    if (audioUrlRef.current) {
                      URL.revokeObjectURL(audioUrlRef.current)
                      audioUrlRef.current = null
                    }
                    if (currentIdRef.current === params.id) {
                      setSpeakingId(null)
                      setStatus('ended')
                      currentIdRef.current = null
                    }
                    audioRef.current = null
                  }

                  audio.onerror = () => {
                    if (audioUrlRef.current) {
                      URL.revokeObjectURL(audioUrlRef.current)
                      audioUrlRef.current = null
                    }
                    if (currentIdRef.current === params.id) {
                      setSpeakingId(null)
                      setStatus('error')
                      currentIdRef.current = null
                    }
                    audioRef.current = null
                  }

                  audio.onplay = () => {
                    if (currentIdRef.current === params.id) {
                      setSpeakingId(params.id)
                      setStatus('speaking')
                    }
                  }

                  await audio.play()
                }
                break
              }
              
              // Collect chunks
              chunks.push(value)
            }
          } catch (error) {
            // Cleanup on error
            if (audioUrlRef.current) {
              URL.revokeObjectURL(audioUrlRef.current)
              audioUrlRef.current = null
            }
            if (audioRef.current) {
              audioRef.current.pause()
              audioRef.current = null
            }
            console.error('Stream reading error:', error)
            throw error
          }
        }

        readStream()
      } catch (error) {
        console.error('TTS error:', error)
        setSpeakingId(null)
        setStatus('error')
        currentIdRef.current = null
        audioRef.current = null
      }
    },
    [defaultLang, stop, supported]
  )

  const toggle = useCallback(
    (params: SpeakParams) => {
      if (speakingId === params.id && status === 'speaking') {
        stop()
        return
      }
      speak(params)
    },
    [speakingId, speak, status, stop]
  )

  return {
    supported,
    speakingId,
    status,
    speak,
    stop,
    toggle,
  }
}
