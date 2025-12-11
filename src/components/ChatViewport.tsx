'use client'

import { ChatShell } from '@/components/ChatShell'

export function ChatViewport() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 min-h-0">
        <ChatShell />
      </div>
    </div>
  )
}
