'use client'

import { useEffect } from 'react'
import { useChatThreads, setActiveThreadId } from '@/lib/chatThreadsStore'
import { ChatViewport } from '@/components/ChatViewport'

interface ProjectThreadProps {
  projectId: string
  threadId: string
}

export function ProjectThread({ projectId, threadId }: ProjectThreadProps) {
  const { threads } = useChatThreads()

  const thread = threads.find(t => t.id === threadId)

  // Set active thread
  useEffect(() => {
    if (threadId) {
      setActiveThreadId(threadId)
      window.dispatchEvent(new CustomEvent('aklow-select-thread', { detail: { threadId } }))
    }
  }, [threadId])

  return (
    <div className="h-full min-h-0 w-full overflow-hidden">
      <ChatViewport />
    </div>
  )
}

