'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { 
  ArchiveBoxIcon, 
  EllipsisHorizontalIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  ChatBubbleLeftIcon,
  MagnifyingGlassIcon
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

  return (
    <div className="flex h-full flex-col bg-transparent">
      {/* Header Area */}
      <div className="px-3 pt-4 pb-2">
        <button
            onClick={handleNewChat}
            className="flex w-full items-center justify-between rounded-lg bg-white/50 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-200/60 hover:bg-white hover:shadow-md transition-all duration-200 backdrop-blur-sm active:scale-[0.98]"
        >
            <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black/5 text-black">
                    <ChatBubbleLeftIcon className="h-3.5 w-3.5" />
                </div>
                <span>Neuer Chat</span>
            </div>
            <PencilSquareIcon className="h-4 w-4 text-gray-400" />
        </button>

        <div className="mt-3 relative">
            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Suchen..."
                className="w-full h-8 rounded-lg bg-black/5 pl-8 pr-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]/20 transition-all"
            />
        </div>
      </div>

      {/* Grouped Threads List */}
      <div className="flex-1 overflow-y-auto px-2 pb-3 pt-2 ak-scrollbar">
          {Object.entries(groupedThreads).map(([label, group]) => {
              if (group.length === 0) return null
              return (
                  <div key={label} className="mb-4">
                      <h3 className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</h3>
                      <div className="flex flex-col gap-0.5">
                          {group.map(thread => (
                              <div
                                key={thread.id}
                                className={clsx(
                                    "group relative flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-200",
                                    effectiveActiveThreadId === thread.id 
                                        ? "bg-gray-200/60 text-black font-medium" 
                                        : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900 active:scale-[0.98] cursor-pointer"
                                )}
                                onClick={() => handleThreadSelect(thread.id)}
                              >
                                <div className="flex-1 text-left truncate pr-6 select-none">
                                    <span className="truncate">{thread.title || 'Neuer Chat'}</span>
                                </div>

                                {/* Kebab Menu - Only visible on hover or active */}
                                <div className={clsx(
                                    "absolute right-2 opacity-0 transition-opacity",
                                    (effectiveActiveThreadId === thread.id || openKebabId === thread.id) ? "opacity-100" : "group-hover:opacity-100"
                                )}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setOpenKebabId(openKebabId === thread.id ? null : thread.id)
                                            }}
                                            className="rounded p-1 hover:bg-black/10 text-gray-500 transition-colors active:scale-90"
                                        >
                                            <EllipsisHorizontalIcon className="h-4 w-4" />
                                        </button>
                                </div>

                                {/* Menu Dropdown */}
                                {openKebabId === thread.id && (
                                    <div className="absolute right-0 top-full z-50 mt-1 w-40 origin-top-right rounded-lg bg-white/90 p-1 shadow-lg ring-1 ring-black/5 backdrop-blur-md focus:outline-none animate-in fade-in zoom-in-95 duration-100">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleRenameThread(thread.id) }}
                                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                        >
                                            <PencilSquareIcon className="h-3.5 w-3.5" />
                                            Umbenennen
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleArchiveThread(thread.id) }}
                                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                        >
                                            <ArchiveBoxIcon className="h-3.5 w-3.5" />
                                            {thread.archived ? 'Wiederherstellen' : 'Archivieren'}
                                        </button>
                                        <div className="my-1 h-px bg-gray-100" />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteThread(thread.id) }}
                                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-red-600 hover:bg-red-50"
                                        >
                                            <TrashIcon className="h-3.5 w-3.5" />
                                            Löschen
                                        </button>
                                    </div>
                                )}
                              </div>
                          ))}
                      </div>
                  </div>
              )
          })}
          
          {filtered.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-400">
                  Keine Chats gefunden.
              </div>
          )}
      </div>
      
      {/* Profile / Settings Footer (Optional, like ChatGPT) */}
      <div className="p-3 border-t border-[var(--ak-color-border-hairline)] mt-auto">
         <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-black/5 cursor-pointer transition-colors">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold">
                JD
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-gray-800 truncate">John Doe</p>
                <p className="text-[10px] text-gray-500 truncate">Pro Plan</p>
            </div>
         </div>
      </div>
    </div>
  )
}
