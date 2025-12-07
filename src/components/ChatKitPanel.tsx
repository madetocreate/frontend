"use client"

import { ChatKit, useChatKit } from "@openai/chatkit-react"
import {
  CHATKIT_API_URL,
  CHATKIT_DOMAIN_KEY,
  GREETING,
  STARTER_PROMPTS,
  COMPOSER_ATTACHMENTS,
  COMPOSER_TOOLS,
  HISTORY_OPTIONS,
  THREAD_ITEM_ACTIONS,
} from "@/lib/chatkit-config"

export function ChatKitPanel() {
  const { control } = useChatKit({
    api: {
      url: CHATKIT_API_URL,
      domainKey: CHATKIT_DOMAIN_KEY,
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

  return (
    <div className="h-full w-full">
      <ChatKit control={control} className="h-full w-full" />
    </div>
  )
}

export default ChatKitPanel
