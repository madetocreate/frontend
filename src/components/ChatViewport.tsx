'use client'

import { ChatKitPanel } from '@/components/ChatKitPanel'

export function ChatViewport() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 min-h-0">
        <ChatKitPanel showPrompts={false} />
      </div>
    </div>
  )
}
