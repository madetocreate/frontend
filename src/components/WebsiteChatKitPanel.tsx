'use client'

import { ChatKit, useChatKit } from "@openai/chatkit-react"
import {
  WEBSITE_CHATKIT_API_URL,
  WEBSITE_CHATKIT_DOMAIN_KEY,
  WEBSITE_GREETING,
  WEBSITE_STARTER_PROMPTS,
  WEBSITE_COMPOSER_OPTIONS,
  WEBSITE_HISTORY_OPTIONS,
  WEBSITE_THREAD_ITEM_ACTIONS,
} from "@/lib/website-chatkit-config"

export function WebsiteChatKitPanel() {
  const { control } = useChatKit({
    api: {
      url: WEBSITE_CHATKIT_API_URL,
      domainKey: WEBSITE_CHATKIT_DOMAIN_KEY,
    },
    greeting: WEBSITE_GREETING,
    startScreen: {
      prompts: WEBSITE_STARTER_PROMPTS,
    },
    history: WEBSITE_HISTORY_OPTIONS,
    threadItemActions: WEBSITE_THREAD_ITEM_ACTIONS,
    composer: WEBSITE_COMPOSER_OPTIONS,
  })

  return (
    <div className="h-full w-full">
      <ChatKit control={control} className="h-full w-full" />
    </div>
  )
}

export default WebsiteChatKitPanel
