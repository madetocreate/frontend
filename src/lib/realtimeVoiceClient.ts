'use client'

/**
 * Real-Time Voice Client für direkte Kommunikation mit dem Orchestrator
 * Verwendet die OpenAI Real-Time API für Voice-Chat
 */

type RealtimeVoiceClient = {
  sessionId: string | null
  client: WebSocket | null
  isActive: boolean
}

const realtimeClient: RealtimeVoiceClient = {
  sessionId: null,
  client: null,
  isActive: false
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'

/**
 * Startet eine Real-Time Voice Session
 */
export async function startRealtimeVoiceSession(): Promise<void> {
  if (realtimeClient.isActive) {
    console.warn('Real-Time Voice Session ist bereits aktiv')
    return
  }

  try {
    // Erstelle eine Session über das Backend
    const response = await fetch(`${BACKEND_URL}/realtime/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenant_id: 'demo-tenant',
        session_id: `web-session-${Date.now()}`,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`)
    }

    const data = await response.json()
    const { session_id, client_secret } = data

    // OpenAI Real-Time API verwendet WebSocket mit Authorization Header
    // Die Verbindung erfolgt über die Session-ID und client_secret
    const wsUrl = `wss://api.openai.com/v1/realtime?model=gpt-realtime-preview-2024-12-17`
    
    // Erstelle WebSocket-Verbindung
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      console.log('Real-Time Voice Session verbunden')
      
      // Sende Session-Update mit client_secret für Authentifizierung
      ws.send(JSON.stringify({
        type: 'session.update',
        session: {
          modalities: ['audio', 'text'],
          instructions: 'Du bist der zentrale Orchestrator. Antworte auf Deutsch und duze den Nutzer.',
          voice: 'alloy',
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
        },
      }))
      
      // Sende client_secret für Authentifizierung
      ws.send(JSON.stringify({
        type: 'session.update',
        client_secret: client_secret,
      }))
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      console.log('Real-Time message:', message.type)
      
      if (message.type === 'session.created') {
        realtimeClient.sessionId = session_id
        realtimeClient.isActive = true
        console.log('Real-Time Session erstellt:', session_id)
      } else if (message.type === 'response.audio.delta') {
        // Audio-Antwort vom Orchestrator
        handleAudioResponse(message.delta)
      } else if (message.type === 'response.text.delta') {
        // Text-Antwort vom Orchestrator
        handleTextResponse(message.delta)
      } else if (message.type === 'response.done') {
        console.log('Orchestrator Antwort abgeschlossen')
      }
    }

    ws.onerror = (error) => {
      console.error('Real-Time WebSocket Fehler:', error)
      realtimeClient.isActive = false
    }

    ws.onclose = () => {
      console.log('Real-Time Voice Session beendet')
      realtimeClient.isActive = false
      realtimeClient.sessionId = null
      realtimeClient.client = null
    }

    realtimeClient.client = ws

    // Starte Audio-Erfassung
    await startAudioCapture(ws)
    
  } catch (error) {
    console.error('Fehler beim Starten der Real-Time Voice Session:', error)
    throw error
  }
}

/**
 * Stoppt die aktive Real-Time Voice Session
 */
export async function stopRealtimeVoiceSession(): Promise<void> {
  if (!realtimeClient.isActive || !realtimeClient.client) {
    return
  }

  try {
    // Stoppe Audio-Erfassung
    stopAudioCapture()
    
    // Schließe WebSocket-Verbindung
    if (realtimeClient.client instanceof WebSocket) {
      realtimeClient.client.close()
    }
    
    realtimeClient.isActive = false
    realtimeClient.sessionId = null
    realtimeClient.client = null
    
    console.log('Real-Time Voice Session gestoppt')
  } catch (error) {
    console.error('Fehler beim Stoppen der Real-Time Voice Session:', error)
    throw error
  }
}

let audioContext: AudioContext | null = null
let mediaStream: MediaStream | null = null
// audioWorkletNode reserved for future AudioWorklet implementation
// let audioWorkletNode: AudioWorkletNode | null = null

/**
 * Startet die Audio-Erfassung vom Mikrofon
 */
async function startAudioCapture(ws: WebSocket): Promise<void> {
  try {
    // Erfrage Mikrofon-Zugriff
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 24000, // OpenAI Real-Time API erfordert 24kHz
        echoCancellation: true,
        noiseSuppression: true,
      },
    })

    mediaStream = stream

    // Erstelle AudioContext
    audioContext = new AudioContext({ sampleRate: 24000 })
    
    // Erstelle MediaStreamSource
    const source = audioContext.createMediaStreamSource(stream)
    
    // Erstelle ScriptProcessorNode für Audio-Verarbeitung (Fallback für Browser ohne AudioWorklet)
    const bufferSize = 4096
    const processor = audioContext.createScriptProcessor(bufferSize, 1, 1)
    
    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0)
      
      // Konvertiere Float32 zu Int16 PCM
      const pcm16 = new Int16Array(inputData.length)
      for (let i = 0; i < inputData.length; i++) {
        // Clamp und konvertiere zu 16-bit
        const s = Math.max(-1, Math.min(1, inputData[i]))
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
      }
      
      // Sende Audio-Daten an OpenAI Real-Time API
      ws.send(JSON.stringify({
        type: 'input_audio_buffer.append',
        audio: Array.from(pcm16),
      }))
    }
    
    source.connect(processor)
    processor.connect(audioContext.destination)
    
    console.log('Audio-Erfassung gestartet')
  } catch (error) {
    console.error('Fehler beim Starten der Audio-Erfassung:', error)
    throw error
  }
}

/**
 * Stoppt die Audio-Erfassung
 */
function stopAudioCapture(): void {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
  
  // audioWorkletNode = null // Reserved for future use
  console.log('Audio-Erfassung gestoppt')
}

/**
 * Verarbeitet Audio-Antworten vom Orchestrator
 */
function handleAudioResponse(audioDelta: string): void {
  // Konvertiere Base64 Audio zu AudioBuffer und spiele ab
  // Dies ist eine vereinfachte Implementierung
  // In Production sollte dies über Web Audio API erfolgen
  console.log('Audio-Antwort erhalten:', audioDelta.length, 'bytes')
}

/**
 * Verarbeitet Text-Antworten vom Orchestrator
 */
function handleTextResponse(textDelta: string): void {
  // Zeige Text-Antwort im Chat an
  console.log('Text-Antwort:', textDelta)
  
  // Dispatch Event für Chat-Integration
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('realtime-voice-text', {
      detail: { text: textDelta }
    }))
  }
}

// Setze Funktionen auf window für useRealtimeVoice Hook
interface WindowWithRealtimeVoice {
  startRealtimeVoiceSession?: typeof startRealtimeVoiceSession
  stopRealtimeVoiceSession?: typeof stopRealtimeVoiceSession
}

if (typeof window !== 'undefined') {
  (window as WindowWithRealtimeVoice).startRealtimeVoiceSession = startRealtimeVoiceSession
  (window as WindowWithRealtimeVoice).stopRealtimeVoiceSession = stopRealtimeVoiceSession
}
