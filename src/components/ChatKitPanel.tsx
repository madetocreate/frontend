"use client"

import { ChatKit, useChatKit } from "@openai/chatkit-react"
import type { ToolOption } from "@openai/chatkit-react"

type ChatKitSessionResponse = {
  client_secret?: string
  error?: string
}

const composerTools: ToolOption[] = [
  {
    id: "file-upload",
    label: "Datei oder Foto hinzufügen",
    shortLabel: "Datei",
    icon: "images",
  },
  {
    id: "document-analysis",
    label: "Dokumentenanalyse",
    shortLabel: "Dokumente",
    icon: "document",
  },
  {
    id: "deep-research",
    label: "Deep Research",
    shortLabel: "Research",
    icon: "sparkle-double",
  },
  {
    id: "study-learn",
    label: "Studieren & Lernen",
    shortLabel: "Lernen",
    icon: "book-open",
  },
  {
    id: "voice-memo",
    label: "Sprachaufnahme",
    shortLabel: "Mikrofon",
    icon: "phone",
    pinned: true,
    persistent: true,
    placeholderOverride: "Sprich oder halte gedrueckt...",
  },
]

export function ChatKitPanel() {
  const { control, setThreadId } = useChatKit({
    api: {
      async getClientSecret() {
        const response = await fetch("/api/chatkit/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        })

        if (!response.ok) {
          console.error("ChatKit-Session-Request fehlgeschlagen", response.status)
          throw new Error("ChatKit-Session konnte nicht erstellt werden")
        }

        const data: ChatKitSessionResponse = await response.json()

        if (!data.client_secret) {
          console.error("ChatKit-Session-Antwort ohne client_secret", data.error)
          throw new Error(data.error ?? "Ungueltige ChatKit-Session-Antwort")
        }

        return data.client_secret
      },
    },
    header: {
      enabled: true,
      rightAction: {
        icon: "compose",
        onClick: () => {
          void setThreadId(null)
        },
      },
    },
    history: {
      enabled: true,
      showDelete: true,
      showRename: true,
    },
    composer: {
      attachments: {
        enabled: true,
      },
      tools: composerTools,
    },
    theme: {
      colorScheme: "light",
      color: {
        accent: {
          primary: "#E5E7EB",
          level: 1,
        },
      },
    },
  })

  return (
    <div className="h-full w-full bg-white">
      <ChatKit control={control} className="h-full w-full" />
    </div>
  )
}

export default ChatKitPanel
