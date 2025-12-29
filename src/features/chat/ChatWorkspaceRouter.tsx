'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { useChatThreads } from '@/lib/chatThreadsStore'
import { ProjectsHome } from './projects/ProjectsHome'
import { ProjectHub } from './projects/ProjectHub'
import { ProjectThread } from './projects/ProjectThread'
import { GlobalThread } from './projects/GlobalThread'
import { useEntitlements } from '@/hooks/useEntitlements'

const ROUTE_FRAME_CLASS = "ak-fade-in h-full min-h-0 w-full overflow-hidden";

function ChatWorkspaceRouterContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { activeThreadId } = useChatThreads()
  const { isEntitled, isLoading } = useEntitlements()
  
  const mode = searchParams.get('mode')
  const projectId = searchParams.get('project')
  const threadId = searchParams.get('thread')
  const type = searchParams.get('type')
  const overlay = searchParams.get('overlay')

  // Entitlement Guards
  useEffect(() => {
    if (isLoading) return

    if (type === 'team_channel' && !isEntitled('teams')) {
      router.replace('/chat')
    }
    // Add DM guard if DM type becomes explicit in URL
  }, [type, isEntitled, isLoading, router])

  // Auto-redirect to last active thread if we are at root /chat
  useEffect(() => {
    if (!mode && !projectId && !threadId && activeThreadId) {
      router.replace(`/chat?thread=${activeThreadId}`)
    } else if (!mode && !projectId && !threadId && !activeThreadId) {
        // If no active thread, start a new one directly
        import('@/lib/chatThreadsStore').then(({ createChatThread, setActiveThreadId }) => {
            createChatThread().then(thread => {
                setActiveThreadId(thread.id)
                router.replace(`/chat?thread=${thread.id}`)
            })
        })
    }
  }, [mode, projectId, threadId, activeThreadId, router])

  // Routing logic
  if (mode === 'projects') {
    // A) Projects Home
    return (
      <div className={ROUTE_FRAME_CLASS}>
        <ProjectsHome />
      </div>
    )
  }

  if (projectId && !threadId) {
    // B) Project Hub
    return (
      <div className={ROUTE_FRAME_CLASS}>
        <ProjectHub projectId={projectId} />
      </div>
    )
  }

  if (projectId && threadId) {
    // C) Project Thread
    return (
      <div className={ROUTE_FRAME_CLASS}>
        <ProjectThread projectId={projectId} threadId={threadId} />
      </div>
    )
  }

  if (threadId && !projectId) {
    // D) Global Thread (Standard Chat or Team Channel)
    return (
      <div className={ROUTE_FRAME_CLASS}>
        <GlobalThread threadId={threadId} />
      </div>
    )
  }

  // Fallback: Empty state or loading
  return <div className="h-full min-h-0 w-full bg-[var(--ak-color-bg-app)]" />
}

export function ChatWorkspaceRouter() {
  return (
    <Suspense fallback={<div className="h-full min-h-0 w-full bg-[var(--ak-color-bg-app)]" />}>
      <ChatWorkspaceRouterContent />
    </Suspense>
  )
}
