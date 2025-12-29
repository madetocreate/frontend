'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useCallback, useState } from 'react'
import { useProjects } from '@/lib/projectsStore'
import { useChatThreads, createChatThread, writeChatThreads, setActiveThreadId } from '@/lib/chatThreadsStore'
import { AkListRow } from '@/components/ui/AkListRow'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import { AkEmptyState } from '@/components/ui/AkEmptyState'
import { ChatBubbleLeftIcon, SparklesIcon, EyeSlashIcon, PaperClipIcon, XMarkIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import { ProjectFilesOverlay } from './ProjectFilesOverlay'
import clsx from 'clsx'

interface ProjectHubProps {
  projectId: string
}

function formatTimeAgo(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Gerade eben'
  if (diffMins < 60) return `vor ${diffMins} Min`
  if (diffHours < 24) return `vor ${diffHours} Std`
  if (diffDays === 1) return 'Gestern'
  if (diffDays < 7) return `vor ${diffDays} Tagen`
  return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
}

export function ProjectHub({ projectId }: ProjectHubProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { projects } = useProjects()
  const { threads } = useChatThreads()
  const [isCreatingThread, setIsCreatingThread] = useState(false)

  const project = useMemo(() => {
    return projects.find(p => p.id === projectId)
  }, [projects, projectId])

  const projectThreads = useMemo(() => {
    return threads
      .filter(t => t.projectId === projectId && !t.archived)
      .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0))
  }, [threads, projectId])

  const fileCount = useMemo(() => {
    return Array.isArray(project?.files) ? project.files.length : 0
  }, [project])

  const overlay = searchParams.get('overlay')

  const handleNewChat = useCallback(async () => {
    if (isCreatingThread || !project) return
    setIsCreatingThread(true)
    try {
      const newThread = await createChatThread('Neuer Chat', { projectId, temporary: false })
      writeChatThreads([newThread, ...threads])
      setActiveThreadId(newThread.id)
      router.push(`/chat?project=${projectId}&thread=${newThread.id}`)
    } finally {
      setIsCreatingThread(false)
    }
  }, [isCreatingThread, project, projectId, threads, router])

  const handleNewTemporaryChat = useCallback(async () => {
    if (isCreatingThread || !project) return
    setIsCreatingThread(true)
    try {
      const newThread = await createChatThread('Chat ohne Memory', { projectId, temporary: true })
      writeChatThreads([newThread, ...threads])
      setActiveThreadId(newThread.id)
      router.push(`/chat?project=${projectId}&thread=${newThread.id}`)
    } finally {
      setIsCreatingThread(false)
    }
  }, [isCreatingThread, project, projectId, threads, router])

  const handleThreadClick = (threadId: string) => {
    router.push(`/chat?project=${projectId}&thread=${threadId}`)
  }

  const handleFilesClick = () => {
    router.push(`/chat?project=${projectId}&overlay=files`)
  }

  const handleCloseOverlay = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('overlay')
    router.push(`/chat?${params.toString()}`)
  }

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center">
        <AkEmptyState
          icon={<ChatBubbleLeftIcon />}
          title="Projekt nicht gefunden"
          description="Das angeforderte Projekt existiert nicht."
        />
      </div>
    )
  }

  return (
    <>
      <div className="h-full overflow-y-auto ak-scrollbar">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <AkButton
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/chat?mode=projects')}
                  leftIcon={<ChevronLeftIcon className="w-4 h-4" />}
                  className="mb-3 text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]"
                >
                  Zur Übersicht
                </AkButton>
                <h1 className="text-2xl font-semibold text-[var(--ak-color-text-primary)] mb-1">
                  {project.name}
                </h1>
                {project.instructions && (
                  <p className="text-sm text-[var(--ak-color-text-muted)] mt-2">
                    {project.instructions}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <AkButton
                variant="primary"
                size="sm"
                onClick={handleNewChat}
                disabled={isCreatingThread}
                leftIcon={<SparklesIcon className="w-4 h-4" />}
              >
                Neuer Chat
              </AkButton>
              <AkButton
                variant="ghost"
                size="sm"
                onClick={handleNewTemporaryChat}
                disabled={isCreatingThread}
                leftIcon={<EyeSlashIcon className="w-4 h-4" />}
              >
                Ohne Memory
              </AkButton>
              {fileCount > 0 && (
                <button
                  onClick={handleFilesClick}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] rounded-lg transition-colors"
                >
                  <PaperClipIcon className="w-4 h-4" />
                  <AkBadge tone="neutral" size="xs">
                    {fileCount} Dateien
                  </AkBadge>
                </button>
              )}
            </div>
          </div>

          {/* Threads List */}
          {projectThreads.length === 0 ? (
            <AkEmptyState
              icon={<ChatBubbleLeftIcon />}
              title="Noch keine Chats"
              description="Erstelle einen neuen Chat in diesem Projekt."
              action={{
                label: 'Neuer Chat im Projekt',
                onClick: handleNewChat,
              }}
            />
          ) : (
            <div className="space-y-1">
              {projectThreads.map((thread) => (
                <AkListRow
                  key={thread.id}
                  accent="graphite"
                  onClick={() => handleThreadClick(thread.id)}
                  leading={<ChatBubbleLeftIcon className="w-4 h-4 text-[var(--ak-color-text-muted)]" />}
                  title={
                    <div>
                      <div className="text-sm font-medium text-[var(--ak-color-text-primary)]">
                        {thread.title}
                      </div>
                      {thread.preview && (
                        <div className="text-xs text-[var(--ak-color-text-muted)] mt-0.5 line-clamp-1">
                          {thread.preview}
                        </div>
                      )}
                    </div>
                  }
                  trailing={
                    <span className="text-xs text-[var(--ak-color-text-muted)]">
                      {formatTimeAgo(thread.lastMessageAt)}
                    </span>
                  }
                  className="py-3"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* File Overlay */}
      {overlay === 'files' && (
        <ProjectFilesOverlay projectId={projectId} onClose={handleCloseOverlay} />
      )}
    </>
  )
}

