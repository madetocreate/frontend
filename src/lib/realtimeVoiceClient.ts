'use client'

/**
 * Real-Time Voice Client für direkte Kommunikation mit OpenAI Real-Time API
 * Verwendet Ephemeral Sessions mit Client-Secret für Browser-zu-OpenAI Verbindung
 * Basierend auf OpenAI Real-Time API Best Practices
 */

type RealtimeVoiceClient = {
  sessionId: string | null
  client: WebSocket | null
  isActive: boolean
  onTextDelta?: (text: string) => void
  onAudioDelta?: (audio: string) => void
  onResponseDone?: () => void
}

const realtimeClient: RealtimeVoiceClient = {
  sessionId: null,
  client: null,
  isActive: false,
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'

let audioContext: AudioContext | null = null
let mediaStream: MediaStream | null = null
let audioOutputNode: GainNode | null = null

/**
 * Startet eine Real-Time Voice Session mit OpenAI
 */
export async function startRealtimeVoiceSession(
  callbacks?: {
    onTextDelta?: (text: string) => void
    onAudioDelta?: (audio: string) => void
    onResponseDone?: () => void
  }
): Promise<void> {
  if (realtimeClient.isActive) {
    console.warn('Real-Time Voice Session ist bereits aktiv')
    return
  }

  try {
    // Erstelle eine Ephemeral Session über das Backend
    const response = await fetch(`${BACKEND_URL}/realtime/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create session: ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    const { session_id, client_secret } = data

    // OpenAI Real-Time API WebSocket URL
    // Für Ephemeral Sessions: client_secret wird als Query-Parameter übergeben
    // Die URL-Struktur: wss://api.openai.com/v1/realtime?model=MODEL&client_secret=SECRET
    const wsUrl = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17&client_secret=${encodeURIComponent(client_secret)}`
    
    console.log('Connecting to Real-Time API:', wsUrl.replace(client_secret, '***'))
    
    // Erstelle WebSocket-Verbindung
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      console.log('Real-Time Voice Session verbunden')
      
      // Konfiguriere Session
      ws.send(JSON.stringify({
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions: 'Du bist ein hilfreicher Assistent. Antworte auf Deutsch und duze den Nutzer. Sei präzise und freundlich.',
          voice: 'nova', // Hochwertige Stimme
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          input_audio_transcription: {
            // OpenAI Real-Time API verwendet automatisch das beste verfügbare Modell
            // Für Live-Transkription wird whisper-1 verwendet (beste Qualität)
            // Alternativ könnte auch gpt-4o-mini-transcribe verwendet werden (schneller)
            model: 'whisper-1', // Beste Qualität für Live-Transkription
          },
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500,
          },
          temperature: 0.8,
          max_response_output_tokens: 4096,
        },
      }))
      
      // Starte Konversation
      ws.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: 'Hallo! Ich bin bereit für eine Live-Konversation.',
            },
          ],
        },
      }))
      
      realtimeClient.sessionId = session_id
      realtimeClient.isActive = true
      realtimeClient.onTextDelta = callbacks?.onTextDelta
      realtimeClient.onAudioDelta = callbacks?.onAudioDelta
      realtimeClient.onResponseDone = callbacks?.onResponseDone
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        
        switch (message.type) {
          case 'session.created':
            console.log('Real-Time Session erstellt:', message.session.id)
            break
            
          case 'session.updated':
            console.log('Session aktualisiert')
            // Starte Audio-Erfassung nach Session-Update
            startAudioCapture(ws)
            break
            
          case 'response.audio_transcript.delta':
            // Transkription des User-Audio (optional, für Debugging)
            if (message.delta) {
              console.log('User Audio Transcript:', message.delta)
            }
            break
            
          case 'response.text.delta':
            // Text-Antwort vom Assistant (inkrementell)
            if (message.delta && realtimeClient.onTextDelta) {
              realtimeClient.onTextDelta(message.delta)
            }
            break
            
          case 'response.audio.delta':
            // Audio-Antwort vom Assistant (Base64-kodiertes PCM16)
            if (message.delta && realtimeClient.onAudioDelta) {
              realtimeClient.onAudioDelta(message.delta)
            } else {
              // Fallback: Direktes Abspielen
              handleAudioDelta(message.delta)
            }
            break
            
          case 'response.audio_transcript.done':
            // Vollständige Transkription verfügbar
            if (message.transcript) {
              console.log('Full transcript:', message.transcript)
            }
            break
            
          case 'response.done':
            // Antwort abgeschlossen
            console.log('Assistant Antwort abgeschlossen')
            if (realtimeClient.onResponseDone) {
              realtimeClient.onResponseDone()
            }
            break
            
          case 'error':
            console.error('Real-Time API Fehler:', message.error)
            break
            
          case 'conversation.item.input_audio_transcription.completed':
            // User-Input wurde transkribiert
            if (message.transcript) {
              console.log('User sagte:', message.transcript)
            }
            break
            
          default:
            // Unbekannte Nachricht (für Debugging)
            if (message.type && !message.type.startsWith('response.')) {
              console.log('Real-Time message:', message.type)
            }
        }
      } catch (error) {
        console.error('Fehler beim Verarbeiten der WebSocket-Nachricht:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('Real-Time WebSocket Fehler:', error)
      realtimeClient.isActive = false
      if (realtimeClient.onResponseDone) {
        realtimeClient.onResponseDone()
      }
    }

    ws.onclose = (event) => {
      console.log('Real-Time Voice Session beendet', event.code, event.reason)
      if (event.code !== 1000) {
        console.error('WebSocket closed unexpectedly:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        })
      }
      realtimeClient.isActive = false
      realtimeClient.sessionId = null
      realtimeClient.client = null
      stopAudioCapture()
    }

    realtimeClient.client = ws
    
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
      realtimeClient.client.close(1000, 'User requested stop')
    }
    
    realtimeClient.isActive = false
    realtimeClient.sessionId = null
    realtimeClient.client = null
    realtimeClient.onTextDelta = undefined
    realtimeClient.onAudioDelta = undefined
    realtimeClient.onResponseDone = undefined
    
    console.log('Real-Time Voice Session gestoppt')
  } catch (error) {
    console.error('Fehler beim Stoppen der Real-Time Voice Session:', error)
    throw error
  }
}

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
        autoGainControl: true,
      },
    })

    mediaStream = stream

    // Erstelle AudioContext mit 24kHz Sample Rate
    audioContext = new AudioContext({ sampleRate: 24000 })
    
    // Erstelle MediaStreamSource
    const source = audioContext.createMediaStreamSource(stream)
    
    // Erstelle ScriptProcessorNode für Audio-Verarbeitung
    // Hinweis: ScriptProcessorNode ist deprecated, aber funktioniert in allen Browsern
    // Für Production sollte AudioWorklet verwendet werden
    const bufferSize = 4096
    const processor = audioContext.createScriptProcessor(bufferSize, 1, 1)
    
    processor.onaudioprocess = (e) => {
      if (!realtimeClient.isActive || !ws || ws.readyState !== WebSocket.OPEN) {
        return
      }
      
      const inputData = e.inputBuffer.getChannelData(0)
      
      // Konvertiere Float32 zu Int16 PCM
      const pcm16 = new Int16Array(inputData.length)
      for (let i = 0; i < inputData.length; i++) {
        // Clamp und konvertiere zu 16-bit
        const s = Math.max(-1, Math.min(1, inputData[i]))
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
      }
      
      // Konvertiere zu Base64 für OpenAI Real-Time API
      // OpenAI erwartet Base64-kodierte PCM16-Daten
      const base64Audio = arrayBufferToBase64(pcm16.buffer)
      
      // Sende Audio-Daten an OpenAI Real-Time API
      ws.send(JSON.stringify({
        type: 'input_audio_buffer.append',
        audio: base64Audio,
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
  
  audioOutputNode = null
  console.log('Audio-Erfassung gestoppt')
}

/**
 * Verarbeitet Audio-Antworten vom Assistant (Base64 PCM16)
 */
function handleAudioDelta(base64Audio: string): void {
  if (!audioContext) {
    audioContext = new AudioContext({ sampleRate: 24000 })
  }
  
  try {
    // Dekodiere Base64 zu Int16Array
    const audioData = base64ToArrayBuffer(base64Audio)
    const pcm16 = new Int16Array(audioData)
    
    // Konvertiere Int16 zu Float32
    const float32 = new Float32Array(pcm16.length)
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768.0
    }
    
    // Erstelle AudioBuffer und spiele ab
    const audioBuffer = audioContext.createBuffer(1, float32.length, 24000)
    audioBuffer.copyToChannel(float32, 0)
    
    const source = audioContext.createBufferSource()
    source.buffer = audioBuffer
    
    if (!audioOutputNode) {
      audioOutputNode = audioContext.createGain()
      audioOutputNode.connect(audioContext.destination)
    }
    
    source.connect(audioOutputNode)
    source.start(0)
  } catch (error) {
    console.error('Fehler beim Abspielen der Audio-Antwort:', error)
  }
}

/**
 * Hilfsfunktion: ArrayBuffer zu Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Hilfsfunktion: Base64 zu ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * Sendet eine Text-Nachricht an die Real-Time Session
 */
export function sendRealtimeTextMessage(text: string): void {
  if (!realtimeClient.isActive || !realtimeClient.client) {
    console.warn('Real-Time Session ist nicht aktiv')
    return
  }
  
  if (realtimeClient.client.readyState !== WebSocket.OPEN) {
    console.warn('WebSocket ist nicht verbunden')
    return
  }
  
  realtimeClient.client.send(JSON.stringify({
    type: 'conversation.item.create',
    item: {
      type: 'message',
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: text,
        },
      ],
    },
  }))
}

/**
 * Gibt den aktuellen Status der Real-Time Session zurück
 */
export function getRealtimeStatus(): { isActive: boolean; sessionId: string | null } {
  return {
    isActive: realtimeClient.isActive,
    sessionId: realtimeClient.sessionId,
  }
}

// Setze Funktionen auf window für globale Verfügbarkeit
declare global {
  interface Window {
    startRealtimeVoiceSession?: typeof startRealtimeVoiceSession
    stopRealtimeVoiceSession?: typeof stopRealtimeVoiceSession
    sendRealtimeTextMessage?: typeof sendRealtimeTextMessage
    getRealtimeStatus?: typeof getRealtimeStatus
  }
}

if (typeof window !== 'undefined') {
  window.startRealtimeVoiceSession = startRealtimeVoiceSession
  window.stopRealtimeVoiceSession = stopRealtimeVoiceSession
  window.sendRealtimeTextMessage = sendRealtimeTextMessage
  window.getRealtimeStatus = getRealtimeStatus
}
