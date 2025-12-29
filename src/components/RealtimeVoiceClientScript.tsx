'use client'

import { useEffect } from 'react'
import '../lib/realtimeVoiceClient'

/**
 * Client-Script Component, die die Real-Time Voice Client Funktionen lädt
 */
export function RealtimeVoiceClientScript() {
  useEffect(() => {
    // Die Funktionen werden bereits in realtimeVoiceClient.ts auf window gesetzt
    // Diese Component stellt sicher, dass das Modul geladen wird
    console.log('Real-Time Voice Client geladen')
  }, [])

  return null
}
