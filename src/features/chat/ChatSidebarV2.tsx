'use client'

import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { 
  ChatBubbleLeftIcon,
  EllipsisHorizontalIcon, 
  PlusIcon,
  FolderIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { 
  useChatThreads, 
  writeChatThreads, 
  setActiveThreadId,
  createChatThread,
  renameThread,
  archiveChatThread,
  unarchiveChatThread,
  deleteChatThread,
  type ChatThread 
} from '@/lib/chatThreadsStore'
import { useProjects, createProject, deleteProject, updateProject, buildProjectTree, type Project } from '@/lib/projectsStore'
import { SidebarModuleLayout } from '@/components/ui/SidebarModuleLayout'
import { SidebarBottomBar } from '@/components/ui/navigation/SidebarBottomBar'
import { AkListRow } from '@/components/ui/AkListRow'
import { AkButton } from '@/components/ui/AkButton'
import { AkIconButton } from '@/components/ui/AkIconButton'
import { AkPopoverMenu } from '@/components/ui/AkPopoverMenu'
import { TeamChannelsSection } from './TeamChannelsSection'
import { useEntitlements } from '@/hooks/useEntitlements'
import { useAppSettings } from '@/contexts/AppSettingsContext'
import { AkModal } from '@/components/ui/AkModal'

// Helper component for rendering individual thread items
function ThreadItem({ 
  thread, 
  isActive, 
  isEditing, 
  editingTitle, 
  setEditingTitle, 
  handleRenameCommit,
  handleRenameCancel,
  handleRenameStart, 
  handleArchiveThread, 
  setDeleteConfirm, 
  handleThreadSelect, 
  getThreadMenuRef, 
  openKebabId, 
  setOpenKebabId,
  query
}: any) {
  return (
    <AkListRow
      accent="graphite"
      selected={isActive}
      title={
        isEditing ? (
          <input
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleRenameCommit(thread.id)
              } else if (e.key === 'Escape') {
                e.stopPropagation()
                e.preventDefault()
                handleRenameCancel() 
              }
            }}
            onBlur={() => handleRenameCommit(thread.id)}
            onFocus={(e) => e.target.select()}
            autoFocus
            className="text-sm font-medium bg-transparent border border-[var(--ak-color-border-subtle)] rounded px-2 py-1 w-full focus:outline-none"
          />
        ) : (
          <span className="text-sm font-medium truncate flex items-center gap-2">
            <span className="truncate">{thread.title}</span>
            {thread.temporary && (
              <span className="text-[10px] text-[var(--ak-color-text-muted)] font-semibold uppercase shrink-0">Temp</span>
            )}
            {thread.archived && query && (
               <span className="text-[10px] text-[var(--ak-color-text-muted)] font-semibold uppercase shrink-0 bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-fine)] px-1 rounded-sm">Archiv</span>
            )}
          </span>
        )
      }
      leading={<ChatBubbleLeftIcon className={clsx("h-4 w-4", thread.archived ? "text-[var(--ak-color-text-muted)] opacity-50" : "text-[var(--ak-color-text-muted)]")} />}
      trailing={
        !isEditing ? (
          <div className="group-hover:opacity-100 opacity-0 transition-opacity">
            <AkIconButton
              variant="ghost"
              size="sm"
              aria-label="Thread-Menü öffnen"
              ref={getThreadMenuRef(thread.id)}
              onClick={(e) => {
                e.stopPropagation()
                setOpenKebabId(openKebabId === `thread-${thread.id}` ? null : `thread-${thread.id}`)
              }}
              className="h-6 w-6"
            >
              <EllipsisHorizontalIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
            </AkIconButton>
            <AkPopoverMenu
              open={openKebabId === `thread-${thread.id}`}
              anchorRef={getThreadMenuRef(thread.id)}
              items={[
                {
                  label: 'Umbenennen',
                  onClick: () => {
                    handleRenameStart(thread)
                    // Popover closes via handleRenameStart side effects (setOpenKebabId null) usually, 
                    // but we ensure it here if needed, though handleRenameStart usually handles it.
                  },
                },
                {
                  label: thread.archived ? 'Archivierung aufheben' : 'Archivieren',
                  onClick: async () => {
                    await handleArchiveThread(thread.id)
                    setOpenKebabId(null)
                  },
                },
                {
                  label: 'Löschen',
                  onClick: () => {
                    setDeleteConfirm({ type: 'thread', id: thread.id, name: thread.title })
                    setOpenKebabId(null)
                  },
                },
              ]}
              onClose={() => setOpenKebabId(null)}
              className="w-40"
            />
          </div>
        ) : null
      }
      className={clsx(
        "transition-all duration-200 py-1.5",
        isActive 
          ? "bg-[var(--ak-color-bg-surface)] shadow-sm border-l-2 border-l-[var(--ak-color-accent)]" 
          : "hover:bg-[var(--ak-color-bg-hover)] border-l-2 border-l-transparent"
      )}
      onClick={() => handleThreadSelect(thread.id)}
    />
  )
}

export function ChatSidebarV2() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { threads, activeThreadId } = useChatThreads()
  const { projects } = useProjects()
  const { isEntitled } = useEntitlements()
  const [query, setQuery] = useState('')
  const [openKebabId, setOpenKebabId] = useState<string | null>(null)
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState<string>("")
  const [editingOriginalTitle, setEditingOriginalTitle] = useState<string>("")

  // Project State
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [editingProjectName, setEditingProjectName] = useState<string>("")
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  
  // Section State
  const [isProjectsOpen, setIsProjectsOpen] = useState(false)
  const [isChatsOpen, setIsChatsOpen] = useState(true)
  const [isDMsOpen, setIsDMsOpen] = useState(false)
  const [isArchiveOpen, setIsArchiveOpen] = useState(false)
  
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'project' | 'thread', id: string, name: string } | null>(null)
  
  const projectTree = useMemo(() => buildProjectTree(projects), [projects])
  const projectMenuRefs = useRef<Record<string, React.RefObject<HTMLButtonElement | null>>>({})
  const threadMenuRefs = useRef<Record<string, React.RefObject<HTMLButtonElement | null>>>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter logic: Search includes archived, otherwise exclude them
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    // Filter out archived threads by default (unless searching)
    const activeThreads = threads.filter(t => !t.archived)
    if (!q) return activeThreads
    
    // Search in ALL threads
    return threads.filter((t) => {
      const hay = `${t.title} ${t.preview}`.toLowerCase()
      return hay.includes(q)
    })
  }, [threads, query])

  // Archived threads for the Archive section (Global / Unassigned)
  const archivedThreads = useMemo(() => {
    return threads
      .filter(t => t.archived && !t.projectId)
      .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0))
  }, [threads])

  // Separate pinned and unpinned threads
  const { pinnedThreads, unpinnedThreads } = useMemo(() => {
    const pinned = filtered.filter(t => t.pinned).slice(0, 3)
    const unpinned = filtered.filter(t => !t.pinned)
    return { pinnedThreads: pinned, unpinnedThreads: unpinned }
  }, [filtered])

  // Group threads by project
  const threadsByProject = useMemo(() => {
    const grouped: Record<string | 'none', ChatThread[]> = { none: [] }
    unpinnedThreads.forEach(thread => {
      const key = thread.projectId || 'none'
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(thread)
    })
    return grouped
  }, [unpinnedThreads])

  // Group unassigned threads by date
  const groupedThreads = useMemo(() => {
    const unassigned = threadsByProject['none'] || []
    const groups: Record<string, ChatThread[]> = {
      'Heute': [],
      'Gestern': [],
      'Vorherige 7 Tage': [],
      'Vorherige 30 Tage': [],
      'Älter': []
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const yesterday = today - 86400000
    const last7Days = today - 7 * 86400000
    const last30Days = today - 30 * 86400000

    unassigned.forEach(thread => {
      const tDate = thread.lastMessageAt || 0
      if (tDate >= today) groups['Heute'].push(thread)
      else if (tDate >= yesterday) groups['Gestern'].push(thread)
      else if (tDate >= last7Days) groups['Vorherige 7 Tage'].push(thread)
      else if (tDate >= last30Days) groups['Vorherige 30 Tage'].push(thread)
      else groups['Älter'].push(thread)
    })

    return groups
  }, [threadsByProject])

  // Auto-expand archive if searching and matches found in archive
  useEffect(() => {
    const q = query.trim().toLowerCase()
    if (q) {
      const hasArchivedMatches = archivedThreads.some(t => {
        const hay = `${t.title} ${t.preview}`.toLowerCase()
        return hay.includes(q)
      })
      if (hasArchivedMatches) {
        setIsArchiveOpen(true)
      }
    }
  }, [query, archivedThreads])

  const handleThreadSelect = (threadId: string, projectId?: string) => {
    setActiveThreadId(threadId)
    window.dispatchEvent(new CustomEvent('aklow-select-thread', { detail: { threadId } }))
    
    // Navigate to thread
    if (projectId) {
      router.push(`/chat?project=${projectId}&thread=${threadId}`)
    } else {
      // Global thread (no project)
      router.push(`/chat?thread=${threadId}`)
    }
  }

  const handleProjectClick = (projectId: string) => {
    router.push(`/chat?project=${projectId}`)
  }

  const handleNewChat = useCallback(async () => {
    const newThread = await createChatThread()
    writeChatThreads([newThread, ...threads])
    setActiveThreadId(newThread.id)
    
    // Navigate to global thread (no project)
    router.push(`/chat?thread=${newThread.id}`)
    
    // Dispatch event for ChatShell to handle focus
    window.dispatchEvent(new CustomEvent('aklow-new-chat', { detail: { threadId: newThread.id } }))
  }, [threads, router])

  const handleNewTemporaryChat = useCallback(async () => {
    const newThread = await createChatThread('Chat ohne Memory', { temporary: true })
    writeChatThreads([newThread, ...threads])
    setActiveThreadId(newThread.id)
    
    // Navigate to global thread (no project)
    router.push(`/chat?thread=${newThread.id}`)
    
    // Dispatch event for ChatShell to handle focus
    window.dispatchEvent(new CustomEvent('aklow-new-chat', { detail: { threadId: newThread.id, temporary: true } }))
  }, [threads, router])

  const handleRenameStart = (thread: ChatThread) => {
    setEditingId(thread.id)
    setEditingTitle(thread.title)
    setEditingOriginalTitle(thread.title)
    setOpenKebabId(null)
  }

  const handleRenameCancel = () => {
    setEditingId(null)
    setEditingTitle("")
    setEditingOriginalTitle("")
  }

  const handleRenameCommit = async (threadId: string) => {
    const next = editingTitle.trim()
    const original = editingOriginalTitle.trim()

    if (next.length === 0 || next === original) {
      handleRenameCancel()
      return
    }

    await renameThread(threadId, next)
    handleRenameCancel()
  }

  const toggleProjectExpanded = (projectId: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev)
      if (next.has(projectId)) {
        next.delete(projectId)
      } else {
        next.add(projectId)
      }
      return next
    })
  }

  const normalizeName = useCallback((s: string | undefined | null): string => {
    return (s || '').trim().toLowerCase()
  }, [])

  const findProjectByName = useCallback((tree: typeof projectTree, name: string): Project | null => {
    const normalized = normalizeName(name)
    return tree.find(project => normalizeName(project.name) === normalized) || null
  }, [normalizeName])

  const findProjectById = useCallback((tree: typeof projectTree, id: string): Project | null => {
    return tree.find(project => project.id === id) || null
  }, [])

  const handleCreateProject = useCallback(async () => {
    if (isCreatingProject) return

    const existingUnnamed = editingProjectId 
      ? findProjectById(projectTree, editingProjectId)
      : findProjectByName(projectTree, 'Neues Projekt')

    if (existingUnnamed && normalizeName(existingUnnamed.name) === normalizeName('Neues Projekt')) {
      setExpandedProjects(prev => new Set(prev).add(existingUnnamed.id))
      setEditingProjectId(existingUnnamed.id)
      setEditingProjectName(existingUnnamed.name)
      
      setTimeout(() => {
        const element = document.querySelector(`[data-project-id="${existingUnnamed.id}"]`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }, 100)
      
      return
    }

    setIsCreatingProject(true)
    try {
      const project = await createProject('Neues Projekt', {
        isFolder: false,
      })
      setExpandedProjects(prev => new Set(prev).add(project.id))
      setEditingProjectId(project.id)
      setEditingProjectName('Neues Projekt')
      
      // Navigate to project hub
      router.push(`/chat?project=${project.id}`)
      
      setTimeout(() => {
        const element = document.querySelector(`[data-project-id="${project.id}"]`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }, 100)
    } finally {
      setIsCreatingProject(false)
    }
  }, [isCreatingProject, editingProjectId, projectTree, findProjectByName, findProjectById, normalizeName, router])

  const handleProjectRenameStart = (project: Project) => {
    setEditingProjectId(project.id)
    setEditingProjectName(project.name)
  }

  const handleProjectRenameCommit = async (projectId: string) => {
    const name = editingProjectName.trim()
    if (name.length > 0) {
      await updateProject(projectId, { name })
    } else {
      await deleteProject(projectId)
    }
    setEditingProjectId(null)
    setEditingProjectName("")
  }

  // Get or create ref for project menu
  const getProjectMenuRef = (projectId: string) => {
    if (!projectMenuRefs.current[projectId]) {
      projectMenuRefs.current[projectId] = React.createRef<HTMLButtonElement | null>()
    }
    return projectMenuRefs.current[projectId]
  }

  // Get or create ref for thread menu
  const getThreadMenuRef = (threadId: string) => {
    if (!threadMenuRefs.current[threadId]) {
      threadMenuRefs.current[threadId] = React.createRef<HTMLButtonElement | null>()
    }
    return threadMenuRefs.current[threadId]
  }

  const handleDeleteProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return
    
    // Check if current route is this project
    const searchParams = new URLSearchParams(window.location.search)
    const currentProjectId = searchParams.get('project')
    
    await deleteProject(projectId)
    
    // Navigate away if this was the current project
    if (currentProjectId === projectId) {
      router.push('/chat?mode=projects')
    }
    
    setDeleteConfirm(null)
  }

  const handleDeleteThread = async (threadId: string) => {
    const thread = threads.find(t => t.id === threadId)
    if (!thread) return
    
    // Check if current route is this thread
    const searchParams = new URLSearchParams(window.location.search)
    const currentThreadId = searchParams.get('thread')
    const currentProjectId = searchParams.get('project')
    
    await deleteChatThread(threadId)
    
    // Navigate away if this was the current thread
    if (currentThreadId === threadId) {
      if (currentProjectId) {
        router.push(`/chat?project=${currentProjectId}`)
      } else {
        router.push('/chat')
      }
    }
    
    setDeleteConfirm(null)
  }

  const handleArchiveThread = async (threadId: string) => {
    const thread = threads.find(t => t.id === threadId)
    if (!thread) return
    
    if (thread.archived) {
      await unarchiveChatThread(threadId)
    } else {
      await archiveChatThread(threadId)
    }
    
    setOpenKebabId(null)
  }

  if (!mounted) {
    return <div />
  }

  return (
    <SidebarModuleLayout
      onSearch={setQuery}
      footer={<SidebarBottomBar onAction={handleNewTemporaryChat} />}
    >
      <div className="space-y-4">
        {/* Actions Section */}
        <div>
          <AkButton
            onClick={handleNewChat}
            variant="secondary"
            size="md"
            leftIcon={<PlusIcon className="h-4 w-4" />}
            className="w-full justify-start border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:bg-[var(--ak-color-bg-hover)]"
          >
            Neuer Chat
          </AkButton>
        </div>

        {/* 1. CHATS (All Global Threads) */}
        <div>
          <AkListRow
            onClick={() => setIsChatsOpen((v) => !v)}
            title={<span className="text-xs font-semibold text-[var(--ak-color-text-muted)] opacity-80">Chats</span>}
            leading={
              isChatsOpen
                ? <ChevronDownIcon className="h-3.5 w-3.5 text-[var(--ak-color-text-muted)] transition-transform duration-[180ms] ease-out" />
                : <ChevronRightIcon className="h-3.5 w-3.5 text-[var(--ak-color-text-muted)] transition-transform duration-[180ms] ease-out" />
            }
            className="py-1.5 hover:bg-transparent cursor-pointer"
          />
          {isChatsOpen && (
            <div className="mt-1 space-y-0.5 pl-1">
              {/* Pinned Threads First */}
              {pinnedThreads.length > 0 && (
                <div className="mb-2">
                  <div className="px-2 mb-1 text-[9px] font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)] opacity-40">
                    Angepinnt
                  </div>
                  <ul className="space-y-0.5">
                  {pinnedThreads.map((thread) => (
                      <li key={thread.id}>
                        <ThreadItem 
                          thread={thread} 
                          isActive={thread.id === activeThreadId}
                          isEditing={editingId === thread.id}
                          editingTitle={editingTitle}
                          setEditingTitle={setEditingTitle}
                          handleRenameCommit={handleRenameCommit}
                          handleRenameCancel={handleRenameCancel}
                          handleRenameStart={handleRenameStart}
                          handleArchiveThread={handleArchiveThread}
                          setDeleteConfirm={setDeleteConfirm}
                          handleThreadSelect={handleThreadSelect}
                          getThreadMenuRef={getThreadMenuRef}
                          openKebabId={openKebabId}
                          setOpenKebabId={setOpenKebabId}
                          query={query}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Regular Global Threads (Grouped by Date) */}
              {Object.entries(groupedThreads).map(([label, groupThreads]) => {
                if (groupThreads.length === 0) return null
                return (
                  <div key={label} className="mb-2 last:mb-0">
                    <div className="px-2 mb-1 text-[9px] font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)] opacity-40">
                      {label}
                    </div>
                    <ul className="space-y-0.5">
                      {groupThreads.map((thread) => (
                        <li key={thread.id}>
                          <ThreadItem 
                            thread={thread} 
                            isActive={thread.id === activeThreadId}
                            isEditing={editingId === thread.id}
                            editingTitle={editingTitle}
                            setEditingTitle={setEditingTitle}
                            handleRenameCommit={handleRenameCommit}
                            handleRenameCancel={handleRenameCancel}
                            handleRenameStart={handleRenameStart}
                            handleArchiveThread={handleArchiveThread}
                            setDeleteConfirm={setDeleteConfirm}
                            handleThreadSelect={handleThreadSelect}
                            getThreadMenuRef={getThreadMenuRef}
                            openKebabId={openKebabId}
                            setOpenKebabId={setOpenKebabId}
                            query={query}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
              
              {/* Archiv Section (Inside Chats) */}
              {archivedThreads.length > 0 && (
                 <div className="mt-4">
                  <AkListRow
                    onClick={() => setIsArchiveOpen((v) => !v)}
                    title={
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[var(--ak-color-text-muted)] opacity-80">Archiv</span>
                        <span className="text-[10px] text-[var(--ak-color-text-muted)] bg-[var(--ak-color-bg-surface)] px-1.5 py-0.5 rounded opacity-80">
                          {archivedThreads.length}
                        </span>
                      </div>
                    }
                    leading={
                      isArchiveOpen
                        ? <ChevronDownIcon className="h-3.5 w-3.5 text-[var(--ak-color-text-muted)] opacity-60 transition-transform duration-[180ms] ease-out" />
                        : <ChevronRightIcon className="h-3.5 w-3.5 text-[var(--ak-color-text-muted)] opacity-60 transition-transform duration-[180ms] ease-out" />
                    }
                    className="py-1.5 hover:bg-transparent cursor-pointer"
                  />
                  {isArchiveOpen && (
                    <ul className="mt-1 space-y-0.5 pl-1">
                      {archivedThreads.map((thread) => (
                         <li key={thread.id}>
                          <ThreadItem 
                            thread={thread} 
                            isActive={thread.id === activeThreadId}
                            isEditing={editingId === thread.id}
                            editingTitle={editingTitle}
                            setEditingTitle={setEditingTitle}
                            handleRenameCommit={handleRenameCommit}
                            handleRenameCancel={handleRenameCancel}
                            handleRenameStart={handleRenameStart}
                            handleArchiveThread={handleArchiveThread}
                            setDeleteConfirm={setDeleteConfirm}
                            handleThreadSelect={handleThreadSelect}
                            getThreadMenuRef={getThreadMenuRef}
                            openKebabId={openKebabId}
                            setOpenKebabId={setOpenKebabId}
                            query={query}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                 </div>
              )}

              {filtered.length === 0 && !isArchiveOpen && (
                <div className="px-3 py-2 text-xs text-[var(--ak-color-text-muted)] opacity-60">
                  Keine aktiven Chats
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-px bg-[var(--ak-color-border-subtle)] opacity-60 my-2" />

        {/* 2. PROJECTS */}
        <div>
          <AkListRow
            onClick={() => setIsProjectsOpen((v) => !v)}
            title={<span className="text-xs font-semibold text-[var(--ak-color-text-muted)] opacity-80">Projekte</span>}
            leading={
              isProjectsOpen
                ? <ChevronDownIcon className="h-3.5 w-3.5 text-[var(--ak-color-text-muted)] transition-transform duration-[180ms] ease-out" />
                : <ChevronRightIcon className="h-3.5 w-3.5 text-[var(--ak-color-text-muted)] transition-transform duration-[180ms] ease-out" />
            }
            trailing={
              <AkIconButton
                size="sm"
                variant="ghost"
                aria-label="Projekt erstellen"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCreateProject()
                }}
                disabled={isCreatingProject}
              >
                <PlusIcon className="h-4 w-4" />
              </AkIconButton>
            }
            className="py-1.5 hover:bg-transparent cursor-pointer"
          />

          {isProjectsOpen && (
            <div className="mt-1 space-y-0.5 pl-1">
              {projectTree.map((project) => {
                const projectThreads = threadsByProject[project.id] || []
                const isExpanded = expandedProjects.has(project.id)
                const threadCount = projectThreads.length

                return (
                  <div key={project.id} data-project-id={project.id}>
                    <AkListRow
                      accent="graphite"
                      selected={false}
                      title={
                        <div className="flex items-center gap-2 w-full">
                          <button
                            type="button"
                            aria-label={isExpanded ? "Projekt zuklappen" : "Projekt aufklappen"}
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleProjectExpanded(project.id)
                            }}
                            className="p-0.5 hover:bg-[var(--ak-color-bg-hover)] rounded transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDownIcon className="h-4 w-4 text-[var(--ak-color-text-muted)] transition-transform duration-[180ms] ease-out" />
                            ) : (
                              <ChevronRightIcon className="h-4 w-4 text-[var(--ak-color-text-muted)] transition-transform duration-[180ms] ease-out" />
                            )}
                          </button>
                          <FolderIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
                          {editingProjectId === project.id ? (
                            <input
                              value={editingProjectName}
                              onChange={(e) => setEditingProjectName(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  handleProjectRenameCommit(project.id)
                                } else if (e.key === 'Escape') {
                                  setEditingProjectId(null)
                                  setEditingProjectName("")
                                }
                              }}
                              onBlur={() => handleProjectRenameCommit(project.id)}
                              onFocus={(e) => e.target.select()}
                              autoFocus
                              className="text-sm font-medium bg-transparent border border-[var(--ak-color-border-subtle)] rounded px-2 py-1 flex-1 focus:outline-none"
                            />
                          ) : (
                            <>
                              <span 
                                className="text-sm font-medium truncate flex-1"
                                onDoubleClick={(e) => {
                                  e.stopPropagation()
                                  handleProjectRenameStart(project)
                                }}
                              >
                                {project.name}
                              </span>
                              {threadCount > 0 && (
                                <span className="text-xs text-[var(--ak-color-text-muted)] bg-[var(--ak-color-bg-surface)] px-1.5 py-0.5 rounded opacity-80">
                                  {threadCount}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      }
                      trailing={
                        editingProjectId !== project.id ? (
                          <div className="group-hover:opacity-100 opacity-0 transition-opacity">
                            <AkIconButton
                              variant="ghost"
                              size="sm"
                              aria-label="Projekt-Menü öffnen"
                              ref={getProjectMenuRef(project.id)}
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenKebabId(openKebabId === `project-${project.id}` ? null : `project-${project.id}`)
                              }}
                              className="h-6 w-6"
                            >
                              <EllipsisHorizontalIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
                            </AkIconButton>
                            <AkPopoverMenu
                              open={openKebabId === `project-${project.id}`}
                              anchorRef={getProjectMenuRef(project.id)}
                              items={[
                                {
                                  label: 'Umbenennen',
                                  onClick: () => {
                                    handleProjectRenameStart(project)
                                    setOpenKebabId(null)
                                  },
                                },
                                {
                                  label: 'Löschen',
                                  onClick: () => {
                                    setDeleteConfirm({ type: 'project', id: project.id, name: project.name })
                                    setOpenKebabId(null)
                                  },
                                },
                              ]}
                              onClose={() => setOpenKebabId(null)}
                              className="w-40"
                            />
                          </div>
                        ) : null
                      }
                      className="py-1.5"
                      onClick={() => {
                        if (editingProjectId !== project.id) {
                          handleProjectClick(project.id)
                        }
                      }}
                    />

                    {isExpanded && projectThreads.length > 0 && (
                      <ul className="pl-8 mt-1 space-y-0.5">
                        {projectThreads.map((thread) => {
                          const isActive = thread.id === activeThreadId
                          const isEditing = editingId === thread.id
                          return (
                            <li key={thread.id}>
                              <ThreadItem 
                                thread={thread} 
                                isActive={isActive}
                                isEditing={isEditing}
                                editingTitle={editingTitle}
                                setEditingTitle={setEditingTitle}
                                handleRenameCommit={handleRenameCommit}
                                handleRenameCancel={handleRenameCancel}
                                handleRenameStart={handleRenameStart}
                                handleArchiveThread={handleArchiveThread}
                                setDeleteConfirm={setDeleteConfirm}
                                handleThreadSelect={(tid: string) => handleThreadSelect(tid, project.id)}
                                getThreadMenuRef={getThreadMenuRef}
                                openKebabId={openKebabId}
                                setOpenKebabId={setOpenKebabId}
                                query={query}
                              />
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 3. TEAMS */}
        <TeamChannelsSectionGate />
        
        {/* 4. DIREKTNACHRICHTEN */}
        <DirectMessagesSectionGate isDMsOpen={isDMsOpen} setIsDMsOpen={setIsDMsOpen} />
      </div>

      {/* Delete Confirm Dialog */}
      <AkModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title={deleteConfirm?.type === 'project' ? 'Projekt löschen?' : 'Chat löschen?'}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm ak-text-secondary">
             {deleteConfirm?.type === 'project' 
                ? `Möchtest du das Projekt "${deleteConfirm?.name}" wirklich löschen? Alle zugehörigen Chats werden ebenfalls entfernt.`
                : `Möchtest du den Chat "${deleteConfirm?.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
              }
          </p>
          <div className="flex gap-3 justify-end">
            <AkButton
              variant="ghost"
              size="sm"
              onClick={() => setDeleteConfirm(null)}
            >
              Abbrechen
            </AkButton>
            <AkButton
              variant="secondary"
              size="sm"
              onClick={() => {
                if (!deleteConfirm) return
                if (deleteConfirm.type === 'project') {
                  handleDeleteProject(deleteConfirm.id)
                } else {
                  handleDeleteThread(deleteConfirm.id)
                }
              }}
              style={{ backgroundColor: 'var(--ak-semantic-danger)', color: 'white' }}
              className="hover:opacity-90"
            >
              Löschen
            </AkButton>
          </div>
        </div>
      </AkModal>
      
      {/* Footer */}
      
    </SidebarModuleLayout>
  )
}

function TeamChannelsSectionGate() {
  const { isEntitled } = useEntitlements()
  const { tenantSettings } = useAppSettings()
  
  const hasTeamsEntitlement = isEntitled('teams')
  const teamsEnabled = tenantSettings.chat?.teamsEnabled ?? false
  const teamChannelsEnabled = tenantSettings.chat?.teamChannelsEnabled ?? false
  
  if (!hasTeamsEntitlement || !teamsEnabled || !teamChannelsEnabled) {
    return null
  }
  
  return <TeamChannelsSection defaultExpanded={false} />
}

function DirectMessagesSectionGate({ 
  isDMsOpen, 
  setIsDMsOpen 
}: { 
  isDMsOpen: boolean
  setIsDMsOpen: (value: boolean | ((prev: boolean) => boolean)) => void 
}) {
  const { isEntitled } = useEntitlements()
  const { tenantSettings } = useAppSettings()
  
  const hasDirectMessagesEntitlement = isEntitled('directMessages')
  const directMessagesEnabled = tenantSettings.chat?.directMessagesEnabled ?? false
  
  if (!hasDirectMessagesEntitlement || !directMessagesEnabled) {
    return null
  }
  
  return (
    <div>
      <AkListRow
        onClick={() => setIsDMsOpen((v) => !v)}
        title={<span className="text-xs font-semibold text-[var(--ak-color-text-muted)] opacity-80">Direktnachrichten</span>}
        leading={
          isDMsOpen
            ? <ChevronDownIcon className="h-3.5 w-3.5 text-[var(--ak-color-text-muted)] transition-transform duration-[180ms] ease-out" />
            : <ChevronRightIcon className="h-3.5 w-3.5 text-[var(--ak-color-text-muted)] transition-transform duration-[180ms] ease-out" />
        }
        className="py-1.5 hover:bg-transparent cursor-pointer"
      />

      {isDMsOpen && (
        <div className="mt-1 space-y-0.5 pl-1">
          <div className="px-3 py-2 text-xs text-[var(--ak-color-text-muted)] opacity-60 italic">
            Keine Direktnachrichten vorhanden
          </div>
        </div>
      )}
    </div>
  )
}
