'use client'

import { ChatShell } from '@/components/ChatShell'
import { ChatViewErrorBoundary } from '@/components/chat/ErrorBoundary'

export function ChatViewport() {
  return (
    <div className="flex h-full min-h-0 flex-col w-full max-w-full overflow-hidden">
      <div className="flex-1 min-h-0 h-full w-full max-w-full">
        <ChatViewErrorBoundary>
          <ChatShell />
        </ChatViewErrorBoundary>
      </div>
    </div>
  )
}
