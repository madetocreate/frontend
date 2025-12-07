'use client'

import { ChatKitPanel } from '@/components/ChatKitPanel'
import { NewsGreetingWidget } from '@/components/NewsGreetingWidget'

export function ChatViewport() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <NewsGreetingWidget />
      <div className="flex-1 min-h-0">
        <ChatKitPanel />
      </div>
    </div>
  )
}
