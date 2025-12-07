"use client"

import { useState, useCallback } from "react"
import { ChatKit, useChatKit } from "@openai/chatkit-react"
import {
  CHATKIT_API_URL,
  CHATKIT_DOMAIN_KEY,
  GREETING,
  STARTER_PROMPTS,
  COMPOSER_ATTACHMENTS,
  COMPOSER_TOOLS,
  THREAD_ITEM_ACTIONS,
  HISTORY_OPTIONS,
  CHATKIT_THEME,
} from "@/lib/chatkit-config"
import { useDictation } from "@/hooks/useDictation"
import { useRealtimeVoice } from "@/hooks/useRealtimeVoice"

type VoiceMode = "realtime" | "dictation" | null

type VoiceControlsProps = {
  mode: VoiceMode
  setMode: (mode: VoiceMode) => void
  onClick: () => void
  showMenu: boolean
  setShowMenu: (show: boolean) => void
  isRealtimeActive: boolean
  isDictationActive: boolean
}

export function ChatKitPanel() {
  const { control, setComposerValue, focusComposer } = useChatKit({
    api: {
      url: CHATKIT_API_URL,
      domainKey: CHATKIT_DOMAIN_KEY,
      uploadStrategy: { type: "two_phase" },
    },
    locale: "de-DE",
    history: HISTORY_OPTIONS,
    startScreen: {
      greeting: GREETING,
      prompts: STARTER_PROMPTS,
    },
    threadItemActions: THREAD_ITEM_ACTIONS,
    composer: {
      placeholder: "",
      attachments: COMPOSER_ATTACHMENTS,
      tools: COMPOSER_TOOLS,
    },
  })

  const dictation = useDictation({
    onTranscriptionReady: async (text: string) => {
      await setComposerValue({ text })
      try {
        await focusComposer()
      } catch {
      }
    },
  })

  const realtime = useRealtimeVoice()

  const [voiceMode, setVoiceMode] = useState<VoiceMode>(null)
  const [showVoiceMenu, setShowVoiceMenu] = useState(false)

  const handleVoiceClick = useCallback(() => {
    if (voiceMode === "realtime") {
      realtime.toggle()
    } else if (voiceMode === "dictation") {
      if (dictation.isRecording) {
        dictation.stopRecording()
      } else {
        dictation.startRecording()
      }
    } else {
      setVoiceMode("realtime")
      realtime.toggle()
    }
  }, [voiceMode, realtime, dictation])

  const handleVoiceModeChange = useCallback(
    (mode: VoiceMode) => {
      setVoiceMode(mode)
      setShowVoiceMenu(false)

      if (mode === "realtime") {
        if (!realtime.isLive && !realtime.isConnecting) {
          realtime.toggle()
        }
      } else if (mode === "dictation") {
        if (!dictation.isRecording && !dictation.isTranscribing) {
          dictation.startRecording()
        }
      } else {
        if (realtime.isLive || realtime.isConnecting) {
          realtime.toggle()
        }
        if (dictation.isRecording) {
          dictation.stopRecording()
        }
      }
    },
    [realtime, dictation],
  )

  return (
    <div className="relative h-full w-full">
      <ChatKit control={control} className="h-full w-full" />
      <VoiceControls
        mode={voiceMode}
        setMode={handleVoiceModeChange}
        onClick={handleVoiceClick}
        showMenu={showVoiceMenu}
        setShowMenu={setShowVoiceMenu}
        isRealtimeActive={realtime.isLive || realtime.isConnecting}
        isDictationActive={dictation.isRecording || dictation.isTranscribing}
      />
    </div>
  )
}

function VoiceControls(props: VoiceControlsProps) {
  const {
    mode,
    setMode,
    onClick,
    showMenu,
    setShowMenu,
    isRealtimeActive,
    isDictationActive,
  } = props

  const handlePointerDown = () => {
    ;(window as any).__voicePressTimer = window.setTimeout(() => {
      setShowMenu(true)
    }, 3000)
  }

  const clearTimer = () => {
    const t = (window as any).__voicePressTimer as number | undefined
    if (t) {
      window.clearTimeout(t)
      ;(window as any).__voicePressTimer = undefined
      return true
    }
    return false
  }

  const handlePointerUp = () => {
    const hadTimer = clearTimer()
    if (!showMenu && hadTimer) {
      onClick()
    }
  }

  const active =
    (mode === "realtime" && isRealtimeActive) ||
    (mode === "dictation" && isDictationActive)

  return (
    <div className="pointer-events-none absolute bottom-3 right-4 z-20 flex flex-col items-end gap-2">
      {showMenu && (
        <div className="pointer-events-auto mb-2 rounded-2xl bg-white/95 px-3 py-2 text-sm shadow-lg border border-slate-200">
          <div className="mb-1 font-medium">Sprachmodus waehlen</div>
          <button
            type="button"
            className="block w-full py-1 text-left hover:text-blue-600"
            onClick={() => setMode("realtime")}
          >
            Realtime Audio
          </button>
          <button
            type="button"
            className="block w-full py-1 text-left hover:text-blue-600"
            onClick={() => setMode("dictation")}
          >
            Diktat und Transkription
          </button>
          <button
            type="button"
            className="block w-full py-1 text-left text-slate-500 hover:text-slate-700"
            onClick={() => setMode(null)}
          >
            Abbrechen
          </button>
        </div>
      )}

      <button
        type="button"
        className={
          "pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border bg-white/90 shadow-md transition " +
          (active ? "border-blue-500 shadow-blue-200" : "border-slate-200")
        }
        onMouseDown={handlePointerDown}
        onMouseUp={handlePointerUp}
        onMouseLeave={clearTimer}
        onTouchStart={handlePointerDown}
        onTouchEnd={handlePointerUp}
        aria-label="Sprachmodus"
      >
        <svg
          viewBox="0 0 24 24"
          className={
            "h-4 w-4 " + (active ? "text-blue-600" : "text-slate-700")
          }
          aria-hidden="true"
        >
          <path
            d="M12 3a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zm-5 8a1 1 0 1 0-2 0 7 7 0 0 0 6 6.93V21H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-3.07A7 7 0 0 0 17 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
  )
}

export default ChatKitPanel
