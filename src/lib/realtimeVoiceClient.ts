'use client'

/**
 * Real-Time Voice Client für direkte Kommunikation mit OpenAI Real-Time API
 * Verwendet Ephemeral Sessions mit Client-Secret für Browser-zu-OpenAI Verbindung
 * Basierend auf OpenAI Real-Time API Best Practices
 */

type Transport = 'websocket' | 'webrtc'

type RealtimeVoiceClient = {
  sessionId: string | null
  transport: Transport
  client: WebSocket | null
  peer: RTCPeerConnection | null
  dataChannel: RTCDataChannel | null
  remoteAudio: HTMLAudioElement | null
  micStream: MediaStream | null
  context: { threadId?: string; tenantId?: string } | null
  isActive: boolean
  onTextDelta?: (text: string) => void
  onAudioDelta?: (audio: string) => void
  onResponseDone?: () => void
  onUserTranscript?: (text: string) => void
}

const realtimeClient: RealtimeVoiceClient = {
  sessionId: null,
  client: null,
  peer: null,
  dataChannel: null,
  remoteAudio: null,
  micStream: null,
  transport: 'websocket',
  context: null,
  isActive: false,
}

// SECURITY: Session minting via Next.js API route (server-side)
// No direct access to Python backend URL from browser
const SESSION_API_URL = '/api/realtime/session'

const DEFAULT_TRANSPORT: Transport =
  (process.env.NEXT_PUBLIC_REALTIME_TRANSPORT as Transport) || 'webrtc'

function parseIceServers(): RTCIceServer[] {
  const turnUrls = (process.env.NEXT_PUBLIC_TURN_URLS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const stunDefaults = [{ urls: 'stun:stun.l.google.com:19302' }];
  if (turnUrls.length === 0) return stunDefaults;
  const username = process.env.NEXT_PUBLIC_TURN_USERNAME || '';
  const credential = process.env.NEXT_PUBLIC_TURN_PASSWORD || '';
  return [
    ...stunDefaults,
    ...turnUrls.map((u) => ({
      urls: u,
      username: username || undefined,
      credential: credential || undefined,
    })),
  ];
}

let audioContext: AudioContext | null = null
let mediaStream: MediaStream | null = null
let keepAliveSink: GainNode | null = null

/**
 * Startet eine Real-Time Voice Session mit OpenAI
 */
export async function startRealtimeVoiceSession(
  callbacks?: {
    onTextDelta?: (text: string) => void
    onAudioDelta?: (audio: string) => void
    onResponseDone?: () => void
    onUserTranscript?: (text: string) => void
  },
  transport: Transport = DEFAULT_TRANSPORT,
  context?: { threadId?: string; tenantId?: string }
): Promise<void> {
  if (realtimeClient.isActive) {
    console.warn('Real-Time Voice Session ist bereits aktiv')
    return
  }

  try {
    // SECURITY: Create ephemeral session via Next.js API route (server-side)
    // The API route handles authentication and calls Python backend securely
    const response = await fetch(SESSION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for auth
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create session: ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    const { session_id, client_secret, model } = data
    if (!client_secret || !session_id) {
      throw new Error('Invalid realtime session response (missing client_secret/session_id)')
    }
    if (!model || typeof model !== 'string') {
      throw new Error('Invalid realtime session response (missing model)')
    }

    realtimeClient.sessionId = session_id
    realtimeClient.transport = transport
    realtimeClient.context = context || null
    realtimeClient.onTextDelta = callbacks?.onTextDelta
    realtimeClient.onAudioDelta = callbacks?.onAudioDelta
    realtimeClient.onResponseDone = callbacks?.onResponseDone
    realtimeClient.onUserTranscript = callbacks?.onUserTranscript

    if (transport === 'webrtc') {
      try {
        await connectWebRTC({ clientSecret: client_secret, model })
        realtimeClient.isActive = true
        return
      } catch (err) {
        console.warn('WebRTC failed, falling back to WebSocket', err)
      }
    }

    await connectWebSocket({ clientSecret: client_secret, model })
    realtimeClient.isActive = true
    return
  } catch (error) {
    console.error('Fehler beim Starten der Real-Time Voice Session:', error)
    throw error
  }
}

/**
 * Stoppt die aktive Real-Time Voice Session
 */
export async function stopRealtimeVoiceSession(): Promise<void> {
  if (!realtimeClient.isActive) {
    return
  }

  try {
    // Stoppe Audio-Erfassung
    stopAudioCapture()
    
    // Schließe Verbindungen
    if (realtimeClient.client instanceof WebSocket) {
      realtimeClient.client.close(1000, 'User requested stop')
    }
    if (realtimeClient.dataChannel) {
      realtimeClient.dataChannel.close()
    }
    if (realtimeClient.peer) {
      realtimeClient.peer.close()
    }
    if (realtimeClient.remoteAudio) {
      realtimeClient.remoteAudio.srcObject = null
    }
    if (realtimeClient.micStream) {
      realtimeClient.micStream.getTracks().forEach((t) => t.stop())
      realtimeClient.micStream = null
    }
    
    realtimeClient.isActive = false
    realtimeClient.sessionId = null
    realtimeClient.client = null
    realtimeClient.peer = null
    realtimeClient.dataChannel = null
    realtimeClient.remoteAudio = null
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
    realtimeClient.micStream = stream

    // Erstelle AudioContext mit 24kHz Sample Rate
    audioContext = new AudioContext({ sampleRate: 24000 })
    
    // Erstelle MediaStreamSource
    const source = audioContext.createMediaStreamSource(stream)
    
    // ScriptProcessorNode is deprecated; keep buffer small for low latency.
    // TODO: migrate to AudioWorklet for production-grade latency/jitter.
    const bufferSize = 2048
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
    // Keep the processor alive without routing mic audio to speakers (avoids echo feedback).
    keepAliveSink = audioContext.createGain()
    keepAliveSink.gain.value = 0
    processor.connect(keepAliveSink)
    keepAliveSink.connect(audioContext.destination)
    
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
  
  keepAliveSink = null
  console.log('Audio-Erfassung gestoppt')
}

/**
 * Hilfsfunktion: ArrayBuffer zu Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  // Chunk to avoid quadratic string concat costs for frequent realtime audio frames.
  const chunkSize = 0x8000
  let binary = ''
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const sub = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...sub)
  }
  return btoa(binary)
}

async function handleFunctionCall(message: unknown) {
  const msg = (message && typeof message === 'object' ? (message as Record<string, unknown>) : {}) as Record<
    string,
    unknown
  >
  const name = typeof msg.name === 'string' ? msg.name : undefined
  const argsJson = msg.arguments
  let args: Record<string, unknown> = {}
  if (typeof argsJson === 'string') {
    try {
      args = JSON.parse(argsJson)
    } catch {
      args = {}
    }
  } else if (typeof argsJson === 'object' && argsJson != null) {
    args = argsJson as Record<string, unknown>
  }

  let toolResult = ''
  try {
    const { authedFetch } = await import('@/lib/api/authedFetch')
    const res = await authedFetch('/api/realtime/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: name,
        args,
        threadId: realtimeClient.context?.threadId,
        tenantId: realtimeClient.context?.tenantId,
      }),
    })
    const txt = await res.text()
    toolResult = txt || `Tool ${name} responded with empty body`
    if (!res.ok) {
      toolResult = `Tool ${name} failed (${res.status}): ${toolResult}`
    }
  } catch (err) {
    toolResult = `Tool ${name} error: ${String(err)}`
  }

  const payload = {
    type: 'conversation.item.create',
    item: {
      type: 'message',
      role: 'assistant',
      content: [
        {
          type: 'output_text',
          text: toolResult,
        },
      ],
      metadata: {
        tool_name: name,
        thread_id: realtimeClient.context?.threadId,
        tenant_id: realtimeClient.context?.tenantId,
        channel: 'voice',
      },
    },
  }

  sendRealtimePayload(payload)

  sendRealtimePayload({
    type: 'response.create',
    response: {
      modalities: ['text', 'audio'],
    },
  })
}

/**
 * Shared Realtime event handler (WS / WebRTC DC)
 */
function handleRealtimeEvent(raw: unknown) {
  try {
    const message = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!message || typeof message !== 'object') return
    const msg = message as Record<string, unknown>
    switch (msg.type) {
      case 'session.created':
        console.log('Real-Time Session erstellt:', (msg.session && typeof msg.session === 'object' ? (msg.session as Record<string, unknown>).id : undefined))
        break
      case 'session.updated':
        break
      case 'conversation.item.input_audio_transcription.completed':
        if (msg.transcript && realtimeClient.onUserTranscript) {
          realtimeClient.onUserTranscript(msg.transcript as string)
        }
        break
      // OpenAI Realtime GA API: Updated event names
      case 'response.output_text.delta':
      case 'response.text.delta': // Legacy support
        if (msg.delta && realtimeClient.onTextDelta) {
          realtimeClient.onTextDelta(msg.delta as string)
        }
        break
      case 'response.output_audio.delta':
      case 'response.audio.delta': // Legacy support
        if (msg.delta && realtimeClient.onAudioDelta) {
          realtimeClient.onAudioDelta(msg.delta as string)
        }
        break
      case 'response.function_call_arguments.done':
        void handleFunctionCall(msg)
        break
      case 'response.done':
        if (realtimeClient.onResponseDone) {
          realtimeClient.onResponseDone()
        }
        break
      case 'error':
        console.error('Realtime error', message.error)
        break
      default:
        break
    }
  } catch (error) {
    console.error('Fehler beim Verarbeiten der Realtime-Nachricht:', error)
  }
}

/**
 * Legacy / fallback WebSocket transport
 */
async function connectWebSocket(args: { clientSecret: string; model: string }) {
  const wsUrl = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(
    args.model
  )}&client_secret=${encodeURIComponent(args.clientSecret)}`
  
  console.log('Connecting to Real-Time API (WS):', wsUrl.replace(args.clientSecret, '***'))
  
  const ws = new WebSocket(wsUrl)
  
  ws.onopen = () => {
    console.log('Real-Time Voice Session (WS) verbunden')
    
    ws.send(
      JSON.stringify({
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        instructions: 'Antworte kurz, präzise und freundlich auf Deutsch.',
        voice: 'nova',
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        input_audio_transcription: {
          model: 'whisper-1',
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 150,
          silence_duration_ms: 350,
          create_response: true,
        },
        temperature: 0.6,
        max_response_output_tokens: 1024,
        metadata: {
          thread_id: realtimeClient.context?.threadId,
          tenant_id: realtimeClient.context?.tenantId,
          channel: 'voice',
        },
      },
    })
    )
    
    startAudioCapture(ws)
  }

  ws.onmessage = (event) => {
    handleRealtimeEvent(event.data)
  }

  ws.onerror = (error) => {
    console.error('Real-Time WebSocket Fehler:', error)
    realtimeClient.isActive = false
    realtimeClient.client = null
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
}

/**
 * Preferred WebRTC transport (lower latency/jitter in browsers)
 */
async function connectWebRTC(args: { clientSecret: string; model: string }) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  })

  const pc = new RTCPeerConnection({
    iceServers: parseIceServers(),
  })

  stream.getTracks().forEach((t) => pc.addTrack(t, stream))

  const dc = pc.createDataChannel('oai-events')
  dc.onopen = () => {
    dc.send(
      JSON.stringify({
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions: 'Antworte kurz, präzise und freundlich auf Deutsch.',
          voice: 'nova',
          input_audio_transcription: {
            model: 'whisper-1',
          },
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 150,
            silence_duration_ms: 350,
            create_response: true,
          },
          temperature: 0.6,
          max_response_output_tokens: 1024,
          metadata: {
            thread_id: realtimeClient.context?.threadId,
            tenant_id: realtimeClient.context?.tenantId,
            channel: 'voice',
          },
        },
      })
    )
  }
  dc.onmessage = (ev) => handleRealtimeEvent(ev.data)
  dc.onerror = (err) => console.error('DataChannel error', err)

  pc.ontrack = (ev) => {
    const [stream] = ev.streams
    if (!stream) return
    if (!realtimeClient.remoteAudio) {
      const audioEl = new Audio()
      audioEl.autoplay = true
      realtimeClient.remoteAudio = audioEl
    }
    realtimeClient.remoteAudio.srcObject = stream
  }

  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  await waitForIceGatheringComplete(pc)

  // OpenAI Realtime GA API: POST /v1/realtime/calls with application/sdp
  // Browser prefers WebRTC, no insecure WS auth needed
  const resp = await fetch(`https://api.openai.com/v1/realtime/calls?model=${encodeURIComponent(args.model)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/sdp',
      Authorization: `Bearer ${args.clientSecret}`,
    },
    body: offer.sdp || '',
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`Failed to start Realtime WebRTC: ${resp.status} ${text}`)
  }

  const answerSdp = await resp.text()
  await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })

  realtimeClient.peer = pc
  realtimeClient.dataChannel = dc
  return { pc, dc }
}

function waitForIceGatheringComplete(pc: RTCPeerConnection): Promise<void> {
  if (pc.iceGatheringState === 'complete') return Promise.resolve()
  return new Promise((resolve) => {
    const checkState = () => {
      if (pc.iceGatheringState === 'complete') {
        pc.removeEventListener('icegatheringstatechange', checkState)
        resolve()
      }
    }
    pc.addEventListener('icegatheringstatechange', checkState)
  })
}

function sendRealtimePayload(obj: unknown) {
  const payload = JSON.stringify(obj)
  if (realtimeClient.transport === 'webrtc' && realtimeClient.dataChannel?.readyState === 'open') {
    realtimeClient.dataChannel.send(payload)
    return true
  }
  if (realtimeClient.client && realtimeClient.client.readyState === WebSocket.OPEN) {
    realtimeClient.client.send(payload)
    return true
  }
  return false
}

/**
 * Sendet eine Text-Nachricht an die Real-Time Session
 */
export function sendRealtimeTextMessage(text: string): void {
  if (!realtimeClient.isActive) {
    console.warn('Real-Time Session ist nicht aktiv')
    return
  }
  
  const payload = JSON.stringify({
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
      metadata: {
        thread_id: realtimeClient.context?.threadId,
        tenant_id: realtimeClient.context?.tenantId,
        channel: 'voice',
      },
    },
  })

  if (realtimeClient.transport === 'webrtc' && realtimeClient.dataChannel?.readyState === 'open') {
    realtimeClient.dataChannel.send(payload)
    realtimeClient.dataChannel.send(
      JSON.stringify({
        type: 'response.create',
        response: {
          modalities: ['text', 'audio'],
        },
      })
    )
    return
  }

  if (!realtimeClient.client || realtimeClient.client.readyState !== WebSocket.OPEN) {
    console.warn('WebSocket ist nicht verbunden')
    return
  }
  
  realtimeClient.client.send(payload)

  // If text input is used (no audio VAD), explicitly request a response.
  realtimeClient.client.send(
    JSON.stringify({
      type: 'response.create',
      response: {
        modalities: ['text', 'audio'],
      },
    })
  )
}

/**
 * PTT helpers
 */
export function setMicEnabled(enabled: boolean) {
  if (realtimeClient.micStream) {
    realtimeClient.micStream.getAudioTracks().forEach((t) => {
      t.enabled = enabled
    })
  }
}

export function commitInputAudio() {
  if (!realtimeClient.isActive) return
  const payload = JSON.stringify({ type: 'input_audio_buffer.commit' })
  if (realtimeClient.transport === 'webrtc' && realtimeClient.dataChannel?.readyState === 'open') {
    realtimeClient.dataChannel.send(payload)
    return
  }
  if (realtimeClient.client && realtimeClient.client.readyState === WebSocket.OPEN) {
    realtimeClient.client.send(payload)
  }
}

export function cancelResponse() {
  if (!realtimeClient.isActive) return
  const payload = JSON.stringify({ type: 'response.cancel' })
  if (realtimeClient.transport === 'webrtc' && realtimeClient.dataChannel?.readyState === 'open') {
    realtimeClient.dataChannel.send(payload)
    return
  }
  if (realtimeClient.client && realtimeClient.client.readyState === WebSocket.OPEN) {
    realtimeClient.client.send(payload)
  }
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
