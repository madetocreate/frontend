'use client'

import { useRouter } from 'next/navigation'
import { useProjects, createProject, buildProjectTree } from '@/lib/projectsStore'
import { useChatThreads, createChatThread, writeChatThreads, setActiveThreadId } from '@/lib/chatThreadsStore'
import { AkListRow } from '@/components/ui/AkListRow'
import { AkButton } from '@/components/ui/AkButton'
import { AkEmptyState } from '@/components/ui/AkEmptyState'
import { FolderIcon, PlusIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useCallback, useMemo, useState } from 'react'

export function ProjectsHome() {
  const router = useRouter()
  const { projects } = useProjects()
  const { threads } = useChatThreads()
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const projectTree = useMemo(() => buildProjectTree(projects), [projects])

  // Count threads per project
  const threadsByProject = useMemo(() => {
    const grouped: Record<string, number> = {}
    threads.forEach(thread => {
      if (thread.projectId) {
        grouped[thread.projectId] = (grouped[thread.projectId] || 0) + 1
      }
    })
    return grouped
  }, [threads])

  const handleCreateProject = useCallback(async () => {
    if (isCreatingProject) return
    setIsCreatingProject(true)
    try {
      const project = await createProject('Neues Projekt', {
        isFolder: false,
      })
      router.push(`/chat?project=${project.id}`)
    } finally {
      setIsCreatingProject(false)
    }
  }, [isCreatingProject, router])

  const handleProjectClick = (projectId: string) => {
    router.push(`/chat?project=${projectId}`)
  }

  if (projectTree.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <AkEmptyState
          icon={<FolderIcon />}
          title="Noch keine Projekte"
          description="Erstelle ein Projekt, um Chats zu organisieren und Dateien zu teilen."
          action={{
            label: 'Neues Projekt',
            onClick: handleCreateProject,
          }}
        />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto ak-scrollbar">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--ak-color-text-primary)] mb-1">
              Projekte
            </h1>
            <p className="text-sm text-[var(--ak-color-text-muted)]">
              Organisiere deine Chats in Projekten
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AkButton
              variant="secondary"
              size="sm"
              onClick={async () => {
                const newThread = await createChatThread()
                writeChatThreads([newThread, ...threads])
                setActiveThreadId(newThread.id)
                router.push(`/chat?thread=${newThread.id}`)
              }}
              leftIcon={<SparklesIcon className="w-4 h-4" />}
            >
              Chat starten
            </AkButton>
            <AkButton
              variant="primary"
              size="sm"
              onClick={handleCreateProject}
              disabled={isCreatingProject}
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              Neues Projekt
            </AkButton>
          </div>
        </div>

        {/* Project List */}
        <div className="space-y-2">
          {projectTree.map((project) => {
            const threadCount = threadsByProject[project.id] || 0
            const fileCount = Array.isArray(project.files) ? project.files.length : 0

            return (
              <AkListRow
                key={project.id}
                accent="graphite"
                onClick={() => handleProjectClick(project.id)}
                leading={
                  <div className="w-10 h-10 rounded-lg bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center">
                    <FolderIcon className="w-5 h-5 text-[var(--ak-color-text-secondary)]" />
                  </div>
                }
                title={
                  <div>
                    <div className="text-sm font-medium text-[var(--ak-color-text-primary)]">
                      {project.name}
                    </div>
                    {project.instructions && (
                      <div className="text-xs text-[var(--ak-color-text-muted)] mt-0.5 line-clamp-1">
                        {project.instructions}
                      </div>
                    )}
                  </div>
                }
                trailing={
                  <div className="flex items-center gap-3 text-xs text-[var(--ak-color-text-muted)]">
                    {threadCount > 0 && <span>{threadCount} Chats</span>}
                    {fileCount > 0 && <span>{fileCount} Dateien</span>}
                  </div>
                }
                className="py-3"
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

