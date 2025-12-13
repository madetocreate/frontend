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

function canUseSpeechSynthesis(): boolean {
  if (typeof window === 'undefined') return false
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}

function normalizeLanguage(lang: string): string {
  const clean = (lang || '').trim()
  return clean.length > 0 ? clean : 'de-DE'
}

function guessVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | null {
  if (!Array.isArray(voices) || voices.length === 0) return null
  const normalized = lang.toLowerCase()
  const exact = voices.find((voice) => (voice.lang || '').toLowerCase() === normalized)
  if (exact) return exact
  const prefix = normalized.split('-')[0]
  const partial = voices.find((voice) => (voice.lang || '').toLowerCase().startsWith(prefix))
  return partial ?? voices[0] ?? null
}

export function useSpeechSynthesis(defaultLang: string = 'de-DE') {
  const [supported, setSupported] = useState(false)
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const [status, setStatus] = useState<SpeechStatus>('idle')

  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    const ok = canUseSpeechSynthesis()
    setSupported(ok)
    if (!ok) return

    const loadVoices = () => {
      try {
        voicesRef.current = window.speechSynthesis.getVoices()
      } catch {
        voicesRef.current = []
      }
    }

    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
      try {
        window.speechSynthesis.cancel()
      } catch {
        return
      }
    }
  }, [])

  const stop = useCallback(() => {
    if (!canUseSpeechSynthesis()) return
    try {
      window.speechSynthesis.cancel()
    } catch {
      return
    } finally {
      utteranceRef.current = null
      setSpeakingId(null)
      setStatus('idle')
    }
  }, [])

  const speak = useCallback(
    (params: SpeakParams) => {
      if (!supported) return
      if (!canUseSpeechSynthesis()) return

      const text = (params.text || '').trim()
      if (!text) return

      const lang = normalizeLanguage(params.lang ?? defaultLang)
      stop()

      const utterance = new window.SpeechSynthesisUtterance(text)
      utterance.lang = lang
      if (typeof params.rate === 'number') utterance.rate = params.rate
      if (typeof params.pitch === 'number') utterance.pitch = params.pitch
      if (typeof params.volume === 'number') utterance.volume = params.volume

      const voice = guessVoice(voicesRef.current, lang)
      if (voice) utterance.voice = voice

      utterance.onstart = () => {
        setSpeakingId(params.id)
        setStatus('speaking')
      }
      utterance.onend = () => {
        setSpeakingId(null)
        setStatus('ended')
      }
      utterance.onerror = () => {
        setSpeakingId(null)
        setStatus('error')
      }

      utteranceRef.current = utterance

      try {
        window.speechSynthesis.speak(utterance)
        setSpeakingId(params.id)
        setStatus('speaking')
      } catch {
        setSpeakingId(null)
        setStatus('error')
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
