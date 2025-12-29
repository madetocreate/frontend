'use client'

import { useEffect } from 'react'
import { useChatThreads, setActiveThreadId } from '@/lib/chatThreadsStore'
import { ChatViewport } from '@/components/ChatViewport'

interface GlobalThreadProps {
  threadId: string
}

export function GlobalThread({ threadId }: GlobalThreadProps) {
  const { threads } = useChatThreads()

  const thread = threads.find(t => t.id === threadId)

  // Set active thread
  useEffect(() => {
    if (threadId && typeof window !== 'undefined') {
      setActiveThreadId(threadId)
      window.dispatchEvent(new CustomEvent('aklow-select-thread', { detail: { threadId } }))
    }
  }, [threadId])

  // If thread is not found in the list yet, we still render ChatViewport
  // allowing it to try to load messages or handle the "new/loading" state.
  
  return (
    <div className="h-full min-h-0 w-full overflow-hidden">
      <ChatViewport />
    </div>
  )
}

