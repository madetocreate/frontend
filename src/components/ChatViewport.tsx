'use client'

import { ChatShell } from '@/components/ChatShell'

export function ChatViewport() {
  return (
    <div className="flex h-full min-h-0 flex-col w-full max-w-full overflow-x-hidden">
      <div className="flex-1 min-h-0 w-full max-w-full">
        <ChatShell />
      </div>
    </div>
  )
}
