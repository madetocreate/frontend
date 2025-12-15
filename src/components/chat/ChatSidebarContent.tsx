'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { 
  ArchiveBoxIcon, 
  EllipsisHorizontalIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  ChatBubbleLeftIcon,
  MagnifyingGlassIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { ensureSeedChatThread, useChatThreads, writeChatThreads, type ChatThread } from '@/lib/chatThreadsStore'

export function ChatSidebarContent() {
  const threads = useChatThreads()
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [openKebabId, setOpenKebabId] = useState<string | null>(null)

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

  // Group threads by date
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
      const tDate = thread.lastMessageAt || 0 // Fallback if missing
      if (tDate >= today) {
        groups['Heute'].push(thread)
      } else if (tDate >= yesterday) {
        groups['Gestern'].push(thread)
      } else if (tDate >= last7Days) {
        groups['Vorherige 7 Tage'].push(thread)
      } else if (tDate >= last30Days) {
        groups['Vorherige 30 Tage'].push(thread)
      } else {
        groups['Älter'].push(thread)
      }
    })

    return groups
  }, [filtered])

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

  const handleRenameThread = (threadId: string) => {
    if (typeof window === 'undefined') return
    const t = threads.find((x) => x.id === threadId)
    const nextTitle = window.prompt('Neuer Titel', t?.title ?? '')
    if (!nextTitle) return
    const next = threads.map((x) => (x.id === threadId ? { ...x, title: nextTitle } : x))
    writeChatThreads(next)
    setOpenKebabId(null)
  }

  const handleArchiveThread = (threadId: string) => {
      // Implement archive logic if needed, currently just hiding from main list logic in store maybe?
      // For now, toggle archived property
      const next = threads.map((x) => (x.id === threadId ? { ...x, archived: !x.archived } : x))
      writeChatThreads(next)
      setOpenKebabId(null)
  }

  const handleToggleInfo = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('aklow-toggle-chat-info'))
    }
  }

  return (
    <div className="flex h-full flex-col bg-transparent">
      {/* Header Area */}
      <div className="px-3 pt-4 pb-2 space-y-3">
        <div className="flex gap-2">
            <button
                onClick={handleNewChat}
                className="flex-1 flex items-center justify-between rounded-lg bg-white/50 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-200/60 hover:bg-white hover:shadow-md transition-all duration-200 backdrop-blur-sm active:scale-[0.98]"
            >
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black/5 text-black">
                        <ChatBubbleLeftIcon className="h-3.5 w-3.5" />
                    </div>
                    <span>Neuer Chat</span>
                </div>
                <div className="flex h-5 w-5 items-center justify-center rounded bg-white/50 text-xs text-gray-400">
                    +
                </div>
            </button>
            <button
                onClick={handleToggleInfo}
                className="flex h-[42px] w-[42px] items-center justify-center rounded-lg bg-white/50 text-gray-600 shadow-sm border border-gray-200/60 hover:bg-white hover:shadow-md transition-all duration-200 backdrop-blur-sm active:scale-[0.98]"
                title="Chat Informationen"
            >
                <InformationCircleIcon className="h-5 w-5" />
            </button>
        </div>

        {/* Search */}
        <div className="relative group">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
                type="text"
                placeholder="Suche..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200/60 bg-white/40 py-2 pl-9 pr-3 text-sm placeholder-gray-400 focus:bg-white focus:border-indigo-500/50 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
            />
        </div>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin scrollbar-thumb-gray-200/50 hover:scrollbar-thumb-gray-300/50">
        <div className="space-y-6 pt-2">
          {Object.entries(groupedThreads).map(([label, groupThreads]) => {
            if (groupThreads.length === 0) return null
            return (
              <div key={label}>
                <div className="sticky top-0 z-10 bg-gradient-to-b from-[#F3F5F7] via-[#F3F5F7] to-transparent px-2 pb-2 pt-1">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400/90">{label}</h3>
                </div>
                <div className="space-y-0.5">
                  {groupThreads.map((thread) => (
                    <div
                      key={thread.id}
                      className="group relative flex items-center gap-3 rounded-lg px-2 py-2 transition-all hover:bg-black/5"
                    >
                        {/* Selection Indicator */}
                        {thread.id === effectiveActiveThreadId && (
                            <div className="absolute left-0 h-4 w-1 rounded-r-full bg-black/80" />
                        )}

                        <button
                            className="flex-1 overflow-hidden text-left"
                            onClick={() => handleThreadSelect(thread.id)}
                        >
                            <span className={clsx(
                                "block truncate text-sm font-medium transition-colors",
                                thread.id === effectiveActiveThreadId ? "text-black" : "text-gray-600 group-hover:text-gray-900"
                            )}>
                                {thread.title}
                            </span>
                        </button>

                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setOpenKebabId(openKebabId === thread.id ? null : thread.id)
                                }}
                                className={clsx(
                                    "flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-black/10",
                                    openKebabId === thread.id ? "opacity-100 bg-black/10" : "opacity-0 group-hover:opacity-100"
                                )}
                            >
                                <EllipsisHorizontalIcon className="h-4 w-4 text-gray-500" />
                            </button>

                            {/* Dropdown Menu */}
                            {openKebabId === thread.id && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-20" 
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setOpenKebabId(null)
                                        }} 
                                    />
                                    <div className="absolute right-0 top-full z-30 mt-1 w-32 origin-top-right rounded-lg border border-gray-200 bg-white p-1 shadow-lg ring-1 ring-black/5 focus:outline-none animate-in fade-in zoom-in-95 duration-100">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleRenameThread(thread.id)
                                            }}
                                            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                                        >
                                            <PencilSquareIcon className="h-3.5 w-3.5" />
                                            Umbenennen
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleArchiveThread(thread.id)
                                            }}
                                            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                                        >
                                            <ArchiveBoxIcon className="h-3.5 w-3.5" />
                                            Archivieren
                                        </button>
                                        <div className="my-1 h-px bg-gray-100" />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteThread(thread.id)
                                            }}
                                            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-red-600 hover:bg-red-50"
                                        >
                                            <TrashIcon className="h-3.5 w-3.5" />
                                            Löschen
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
