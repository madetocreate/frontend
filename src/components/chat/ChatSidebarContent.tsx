'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { 
  ChatBubbleLeftIcon,
  EllipsisHorizontalIcon, 
  TrashIcon, 
  PlusIcon
} from '@heroicons/react/24/outline'
import { 
  ensureSeedChatThread, 
  useChatThreads, 
  writeChatThreads, 
  setActiveThreadId,
  createChatThread,
  updateChatThread,
  archiveChatThread,
  unarchiveChatThread,
  type ChatThread 
} from '@/lib/chatThreadsStore'
import { AkListRow } from '@/components/ui/AkListRow'
import { AkButton } from '@/components/ui/AkButton'
import { DrawerSectionTitle } from '@/components/ui/drawer-kit'
import { SidebarHeader } from '@/components/ui/SidebarHeader'

export function ChatSidebarContent({ onToggleInspector }: { onToggleInspector?: () => void }) {
  const isClient = typeof window !== 'undefined'
  const { threads, activeThreadId } = useChatThreads()
  const [query, setQuery] = useState('')
  const [openKebabId, setOpenKebabId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState<string>("")

  useEffect(() => {
    ensureSeedChatThread()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return threads
    return threads.filter((t) => {
      const hay = `${t.title} ${t.preview}`.toLowerCase()
      return hay.includes(q)
    })
  }, [threads, query])

  const groupedThreads = useMemo(() => {
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

    filtered.forEach(thread => {
      const tDate = thread.lastMessageAt || 0
      if (tDate >= today) groups['Heute'].push(thread)
      else if (tDate >= yesterday) groups['Gestern'].push(thread)
      else if (tDate >= last7Days) groups['Vorherige 7 Tage'].push(thread)
      else if (tDate >= last30Days) groups['Vorherige 30 Tage'].push(thread)
      else groups['Älter'].push(thread)
    })

    return groups
  }, [filtered])

  const handleThreadSelect = (threadId: string) => {
    setActiveThreadId(threadId)
    window.dispatchEvent(new CustomEvent('aklow-select-thread', { detail: { threadId } }))
  }

  const handleNewChat = useCallback(() => {
    const newThread = createChatThread()
    writeChatThreads([newThread, ...threads])
    setActiveThreadId(newThread.id)
    window.dispatchEvent(new CustomEvent('aklow-new-chat', { detail: { threadId: newThread.id } }))
  }, [threads])

  const handleDeleteThread = (id: string) => {
    writeChatThreads(threads.filter(t => t.id !== id))
    if (activeThreadId === id) setActiveThreadId(threads[0]?.id || '')
    setOpenKebabId(null)
  }

  const handleRenameStart = (thread: ChatThread) => {
    setEditingId(thread.id)
    setEditingTitle(thread.title)
    setOpenKebabId(null)
  }

  const handleRenameCommit = (threadId: string) => {
    const title = editingTitle.trim()
    if (title.length > 0) {
      updateChatThread(threadId, { title, preview: editingTitle })
    }
    setEditingId(null)
  }

  const handleArchiveToggle = (thread: ChatThread) => {
    if (thread.archived) {
      unarchiveChatThread(thread.id)
    } else {
      archiveChatThread(thread.id)
      if (activeThreadId === thread.id) {
        const fallback = threads.find(t => t.id !== thread.id)?.id || ''
        setActiveThreadId(fallback)
      }
    }
    setOpenKebabId(null)
  }

  const handleSaveThread = (threadId: string) => {
    window.dispatchEvent(new CustomEvent('aklow-save-thread', { detail: { threadId } }))
    setOpenKebabId(null)
  }

  if (!isClient) return null

  return (
    <div className="flex h-full flex-col bg-transparent">
      <SidebarHeader 
        title="Chat" 
        onSearch={setQuery} 
        onToggleInspector={onToggleInspector}
      />

      <div className="px-4 pt-4 pb-2">
        <AkButton 
          size="sm" 
          variant="secondary" 
          className="w-full justify-center text-xs font-semibold !rounded-xl bg-gradient-to-b from-[var(--ak-color-bg-surface)] to-[var(--ak-color-bg-surface-muted)]/50 border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-surface)] hover:shadow-md hover:-translate-y-0.5 shadow-sm transition-all duration-200 gap-2"
          leftIcon={<PlusIcon className="h-4 w-4" />}
          onClick={handleNewChat}
        >
          Neuer Chat
        </AkButton>
      </div>

      <div className="flex-1 overflow-y-auto ak-scrollbar px-2 pb-4 mt-2">
        {Object.entries(groupedThreads).map(([label, groupThreads]) => {
          if (groupThreads.length === 0) return null
          return (
            <div key={label} className="mb-6 last:mb-0">
              <DrawerSectionTitle className="px-3">{label}</DrawerSectionTitle>
              <ul className="flex flex-col gap-0.5">
                {groupThreads.map((thread) => {
                  const isActive = thread.id === activeThreadId
                  const isEditing = editingId === thread.id
                  return (
                    <li key={thread.id} className="group relative">
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
                                  setEditingId(null)
                                }
                              }}
                              onBlur={() => handleRenameCommit(thread.id)}
                              autoFocus
                              className="text-[14px] font-medium bg-transparent border border-[var(--ak-color-border-subtle)] rounded-lg px-2.5 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent-soft)]"
                            />
                          ) : (
                            <span className="text-[14px] font-medium truncate">{thread.title}</span>
                          )
                        }
                        subtitle={thread.archived ? <span className="text-[11px] text-[var(--ak-color-text-muted)] italic">Archiviert</span> : undefined}
                        className={clsx(
                          "transition-all duration-200 py-3",
                          isActive 
                            ? "bg-[var(--ak-color-bg-surface)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border-l-2 border-l-[var(--ak-color-accent)]" 
                            : "hover:bg-[var(--ak-color-bg-hover)] border-l-2 border-l-transparent"
                        )}
                        leading={<ChatBubbleLeftIcon className={clsx("h-5 w-5 transition-colors", isActive ? "text-[var(--ak-color-accent)]" : "text-[var(--ak-color-text-muted)]")} />}
                        onClick={() => handleThreadSelect(thread.id)}
                        trailing={
                          <div className="flex items-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenKebabId(openKebabId === thread.id ? null : thread.id)
                              }}
                              className={clsx(
                                "p-1 rounded hover:bg-[var(--ak-color-bg-hover)] transition-all",
                                openKebabId === thread.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                              )}
                            >
                              <EllipsisHorizontalIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
                            </button>
                          </div>
                        }
                      />
                      {openKebabId === thread.id && (
                        <div className="absolute right-2 top-10 z-30 w-40 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)] p-1 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100 space-y-0.5">
                          <button onClick={() => handleRenameStart(thread)} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-[var(--ak-color-bg-hover)]">
                            <ChatBubbleLeftIcon className="h-3.5 w-3.5" /> Umbenennen
                          </button>
                          <button onClick={() => handleArchiveToggle(thread)} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-[var(--ak-color-bg-hover)]">
                            <TrashIcon className="h-3.5 w-3.5" /> {thread.archived ? 'Wiederherstellen' : 'Archivieren'}
                          </button>
                          <button onClick={() => handleSaveThread(thread.id)} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-[var(--ak-color-bg-hover)]">
                            <EllipsisHorizontalIcon className="h-3.5 w-3.5" /> Speichern
                          </button>
                          <button onClick={() => handleDeleteThread(thread.id)} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-red-600 hover:bg-red-50">
                            <TrashIcon className="h-3.5 w-3.5" /> Löschen
                          </button>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
