'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { ArchiveBoxIcon, EllipsisVerticalIcon, PencilSquareIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import { AkChip } from '@/components/ui/AkChip'
import { AkSearchField } from '@/components/ui/AkSearchField'
import { ensureSeedChatThread, useChatThreads, writeChatThreads, type ChatThread } from '@/lib/chatThreadsStore'

export function ChatSidebarContent() {
  const threads = useChatThreads()
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [openKebabId, setOpenKebabId] = useState<string | null>(null)
  const [chatsCollapsed, setChatsCollapsed] = useState(false)

  const effectiveActiveThreadId = activeThreadId ?? (threads[0]?.id ?? null)

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

  const handleThreadSelect = (threadId: string) => {
    setActiveThreadId(threadId)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aklow-select-thread', { detail: { threadId } }))
    }
  }

  const buildNewChat = useCallback((base: ChatThread[]) => {
    const now = Date.now()
    const newId = `thread-${now}`
    const newThread: ChatThread = {
      id: newId,
      title: 'Neuer Chat',
      lastMessageAt: now,
      preview: '',
    }
    const next = [newThread, ...base].slice(0)
    return { newId, next }
  }, [])

  const handleNewChat = useCallback(() => {
    const built = buildNewChat(threads)
    writeChatThreads(built.next)
    setActiveThreadId(built.newId)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aklow-new-chat', { detail: { threadId: built.newId } }))
    }
  }, [buildNewChat, threads])

  const handleDeleteThread = useCallback(
    (threadId: string) => {
      const base = threads.filter((t) => t.id !== threadId)
      if (effectiveActiveThreadId === threadId) {
        const built = buildNewChat(base)
        writeChatThreads(built.next)
        setActiveThreadId(built.newId)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('aklow-new-chat', { detail: { threadId: built.newId } }))
        }
      } else {
        writeChatThreads(base)
      }
      setOpenKebabId(null)
    },
    [buildNewChat, effectiveActiveThreadId, threads]
  )

  const handleArchiveThread = useCallback(
    (threadId: string) => {
      const base = threads.map((t) => (t.id === threadId ? { ...t, archived: !t.archived } : t))
      if (effectiveActiveThreadId === threadId) {
        const built = buildNewChat(base)
        writeChatThreads(built.next)
        setActiveThreadId(built.newId)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('aklow-new-chat', { detail: { threadId: built.newId } }))
        }
      } else {
        writeChatThreads(base)
      }
      setOpenKebabId(null)
    },
    [buildNewChat, effectiveActiveThreadId, threads]
  )

  const handleRenameThread = (threadId: string) => {
    if (typeof window === 'undefined') return
    const t = threads.find((x) => x.id === threadId)
    const nextTitle = window.prompt('Neuer Titel', t?.title ?? '')
    if (!nextTitle) return
    const next = threads.map((x) => (x.id === threadId ? { ...x, title: nextTitle } : x))
    writeChatThreads(next)
    setOpenKebabId(null)
  }

  const toggleChatsVisibility = () => {
    setChatsCollapsed((prev) => !prev)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <div className="flex-1">
          <AkSearchField value={query} onChange={setQuery} placeholder="Suchen..." />
        </div>
        <AkButton
          variant="secondary"
          size="sm"
          onClick={handleNewChat}
          className="shrink-0 rounded-[4px] px-2 h-8 text-[12px] gap-1"
        >
          <PencilSquareIcon className="h-3.5 w-3.5" />
          Neuer Chat
        </AkButton>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 px-3 pb-2">
        <AkChip onClick={toggleChatsVisibility}>
          {chatsCollapsed ? (
            <ChevronRightIcon className="h-3 w-3" />
          ) : (
            <ChevronLeftIcon className="h-3 w-3" />
          )}
        </AkChip>
        <AkChip pressed={true} onClick={() => {}}>Alle</AkChip>
        <AkChip onClick={() => {}}>Archiv</AkChip>
        <AkChip onClick={() => {}}>Favoriten</AkChip>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        <div className="space-y-1">
          {chatsCollapsed ? (
            <div className="p-3 text-sm text-slate-500">Chats ausgeblendet</div>
          ) : filtered.length === 0 ? (
            <div className="p-3 text-sm text-slate-500">Keine Threads gefunden.</div>
          ) : (
            filtered.map((thread) => (
              <div
                key={thread.id}
                className={clsx(
                  'group flex items-center justify-between rounded-lg px-3 py-2 text-sm',
                  effectiveActiveThreadId === thread.id ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                )}
              >
                <button
                  type="button"
                  className="flex-1 text-left"
                  onClick={() => handleThreadSelect(thread.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{thread.title}</span>
                    {thread.archived ? <AkBadge tone="muted">archiviert</AkBadge> : null}
                  </div>
                  <div className="truncate text-xs text-slate-500">{thread.preview || '—'}</div>
                </button>

                <div className="relative">
                  <button
                    type="button"
                    className="rounded-md p-1 opacity-0 transition group-hover:opacity-100 hover:bg-slate-200"
                    onClick={() => setOpenKebabId((prev) => (prev === thread.id ? null : thread.id))}
                  >
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </button>

                  {openKebabId === thread.id ? (
                    <div className="absolute right-0 z-20 mt-2 w-44 rounded-md border border-slate-200 bg-white shadow-sm">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                        onClick={() => handleRenameThread(thread.id)}
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        Umbenennen
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                        onClick={() => handleArchiveThread(thread.id)}
                      >
                        <ArchiveBoxIcon className="h-4 w-4" />
                        {thread.archived ? 'Wiederherstellen' : 'Archivieren'}
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-slate-50"
                        onClick={() => handleDeleteThread(thread.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                        Löschen
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
