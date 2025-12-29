import { useState, useRef, useCallback, useEffect } from 'react'
import { useSpeechSynthesis } from '../useSpeechSynthesis'
import { useDictation } from '../useDictation'
import { useRealtimeVoice } from '../useRealtimeVoice'

type SetInputFn = (value: string | ((prev: string) => string)) => void

export type ThinkingStep = {
  id: string
  label: string
  status: "pending" | "active" | "done"
  details?: string
}

export function useStreamingAndVoice(setInput?: SetInputFn) {
  const [isSending, setIsSending] = useState(false)
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([])
  const [thinkingNote, setThinkingNote] = useState<string | null>(null)
  const [quickHint, setQuickHint] = useState<string>("")
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([])
  const [isStepsOpen, setIsStepsOpen] = useState(false)
  
  const abortControllerRef = useRef<AbortController | null>(null)

  // TTS
  const { supported: ttsSupported, speakingId, toggle: toggleTts, stop: stopTts } =
    useSpeechSynthesis("de-DE")

  // Dictation
  const { status: dictationStatus, startRecording, stopRecording, cancelRecording } = useDictation({
    onTranscriptionReady: (text) => {
      if (setInput) {
        setInput((prev) => prev + (prev ? " " : "") + text)
      }
    },
  })

  // Realtime Voice
  const [audioLevel, setAudioLevel] = useState(0)
  const [audioBands, setAudioBands] = useState<number[]>(Array(20).fill(0))
  const audioLevelIntervalRef = useRef<number | null>(null)
  const audioAnalyserRef = useRef<AnalyserNode | null>(null)
  const audioDataArrayRef = useRef<Uint8Array | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const [fakeWaveLevels, setFakeWaveLevels] = useState<number[]>(Array(20).fill(0.3))
  const fakeWaveIntervalRef = useRef<number | null>(null)

  const startAudioLevelMeasurement = useCallback(async () => {
    try {
      let stream = audioStreamRef.current
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioStreamRef.current = stream
      }
      
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 64
      audioAnalyserRef.current = analyser
      
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      
      audioDataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
      
      const updateLevel = () => {
        if (!audioAnalyserRef.current || !audioDataArrayRef.current) return
        
        audioAnalyserRef.current.getByteFrequencyData(audioDataArrayRef.current as Uint8Array<ArrayBuffer>)
        
        const sum = audioDataArrayRef.current.reduce((a, b) => a + b, 0)
        const avg = sum / audioDataArrayRef.current.length
        const normalized = Math.min(avg / 255, 1)
        
        setAudioLevel(normalized)
        
        // Extract frequency bands
        const bands: number[] = []
        const bandCount = 20
        const dataLength = audioDataArrayRef.current.length
        const bandSize = Math.floor(dataLength / bandCount)
        
        for (let i = 0; i < bandCount; i++) {
          const start = i * bandSize
          const end = Math.min(start + bandSize, dataLength)
          let bandSum = 0
          for (let j = start; j < end; j++) {
            bandSum += audioDataArrayRef.current[j] || 0
          }
          bands.push(Math.min(bandSum / (bandSize * 255), 1))
        }
        
        setAudioBands(bands)
      }
      
      audioLevelIntervalRef.current = window.setInterval(updateLevel, 50)
    } catch (error) {
      console.error("Failed to start audio level measurement:", error)
    }
  }, [])

  const stopAudioLevelMeasurement = useCallback(() => {
    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current)
      audioLevelIntervalRef.current = null
    }
    
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop())
      audioStreamRef.current = null
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    
    setAudioLevel(0)
    setAudioBands(Array(20).fill(0))
  }, [])

  // Fake wave animation when not recording
  useEffect(() => {
    if (audioLevel === 0) {
      fakeWaveIntervalRef.current = window.setInterval(() => {
        setFakeWaveLevels(prev => prev.map(() => 0.2 + Math.random() * 0.3))
      }, 200)
    } else {
      if (fakeWaveIntervalRef.current) {
        clearInterval(fakeWaveIntervalRef.current)
        fakeWaveIntervalRef.current = null
      }
    }
    
    return () => {
      if (fakeWaveIntervalRef.current) {
        clearInterval(fakeWaveIntervalRef.current)
      }
    }
  }, [audioLevel])

  const {
    status: realtimeStatus,
    press: pressRealtime,
    release: releaseRealtime,
    stopAll: stopRealtimeAll,
  } = useRealtimeVoice({
    onStart: () => {
      console.log("Real-time Audio gestartet")
      void startAudioLevelMeasurement()
    },
    onStop: () => {
      console.log("Real-time Audio gestoppt")
      stopAudioLevelMeasurement()
      setAudioLevel(0)
    },
    onTextDelta: (text: string) => {
      console.log("Realtime delta:", text)
    },
  })

  const isMicrophoneActive =
    dictationStatus === "recording" ||
    dictationStatus === "transcribing" ||
    realtimeStatus === "holding" ||
    realtimeStatus === "assistant" ||
    realtimeStatus === "connecting"
  
  const isRealtimeActive =
    realtimeStatus === "holding" ||
    realtimeStatus === "assistant" ||
    realtimeStatus === "connecting"
  
  const shouldHideInput =
    dictationStatus === "recording" ||
    dictationStatus === "transcribing" ||
    realtimeStatus === "holding" ||
    realtimeStatus === "assistant"

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudioLevelMeasurement()
      if (fakeWaveIntervalRef.current) {
        clearInterval(fakeWaveIntervalRef.current)
      }
    }
  }, [stopAudioLevelMeasurement])

  return {
    // Streaming state
    isSending,
    setIsSending,
    thinkingSteps,
    setThinkingSteps,
    thinkingNote,
    setThinkingNote,
    quickHint,
    setQuickHint,
    followUpSuggestions,
    setFollowUpSuggestions,
    isStepsOpen,
    setIsStepsOpen,
    abortControllerRef,
    
    // TTS
    ttsSupported,
    speakingId,
    toggleTts,
    stopTts,
    
    // Dictation
    dictationStatus,
    startRecording,
    stopRecording,
    cancelRecording,
    
    // Realtime Voice
    realtimeStatus,
    pressRealtime,
    releaseRealtime,
    stopRealtimeAll,
    audioLevel,
    audioBands,
    fakeWaveLevels,
    isMicrophoneActive,
    isRealtimeActive,
    shouldHideInput,
  }
}

