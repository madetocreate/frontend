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
  const [supported, setSupported] = useState(true) // OpenAI TTS ist immer unterstützt
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
      currentIdRef.current = null
      setSpeakingId(null)
      setStatus('idle')
    }
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
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
        const response = await fetch('/api/audio/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            voice,
            model: 'tts-1-hd', // Höchste Qualität
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
        let totalLength = 0
        let audioStarted = false

        // Lese Stream in Chunks
        const readStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) {
                // Wenn Audio noch nicht gestartet wurde, starte es jetzt mit allen Daten
                if (!audioStarted && chunks.length > 0) {
                  const finalBlob = new Blob(chunks as BlobPart[], { type: 'audio/mpeg' })
                  const audioUrl = URL.createObjectURL(finalBlob)
                  
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
                    URL.revokeObjectURL(audioUrl)
                    if (currentIdRef.current === params.id) {
                      setSpeakingId(null)
                      setStatus('ended')
                      currentIdRef.current = null
                    }
                    audioRef.current = null
                  }

                  audio.onerror = () => {
                    URL.revokeObjectURL(audioUrl)
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
                  audioStarted = true
                }
                break
              }
              
              chunks.push(value)
              totalLength += value.length

              // Starte Wiedergabe sobald genug Daten vorhanden sind (64KB für schnellen Start)
              if (!audioStarted && totalLength >= 65536) {
                // Erstelle Blob aus bisherigen Chunks
                const partialBlob = new Blob(chunks as BlobPart[], { type: 'audio/mpeg' })
                const audioUrl = URL.createObjectURL(partialBlob)
                
                const audio = new Audio(audioUrl)
                audioRef.current = audio

                // Volume-Einstellung
                if (typeof params.volume === 'number') {
                  audio.volume = Math.max(0, Math.min(1, params.volume))
                } else {
                  audio.volume = 1.0
                }

                if (typeof params.rate === 'number') {
                  audio.playbackRate = Math.max(0.5, Math.min(2, params.rate))
                }

                audio.onended = () => {
                  URL.revokeObjectURL(audioUrl)
                  if (currentIdRef.current === params.id) {
                    setSpeakingId(null)
                    setStatus('ended')
                    currentIdRef.current = null
                  }
                  audioRef.current = null
                }

                audio.onerror = () => {
                  URL.revokeObjectURL(audioUrl)
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

                // Starte Wiedergabe sobald genug Daten geladen sind
                audio.oncanplay = () => {
                  if (currentIdRef.current === params.id && audio.paused) {
                    audio.play().catch(console.error)
                  }
                }

                // Versuche sofort abzuspielen
                audio.play().catch(() => {
                  // Wird automatisch abgespielt wenn genug Daten da sind
                })

                audioStarted = true

                // Lese weiter im Hintergrund (für vollständige Datei, falls nötig)
                // Das Audio-Element wird automatisch weiter streamen
              }
            }
          } catch (error) {
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
