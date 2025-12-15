'use client'

import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

import { AkSearchField } from '@/components/ui/AkSearchField'

export type InboxItem = {
  id: string
  title: string
  snippet: string
  time: string
  unread?: boolean
  channel: 'email' | 'chat' | 'reviews' | 'support'
  badge?: string
  sender: string
  threadId?: string
}

type InboxDrawerWidgetProps = {
  onItemClick?: (item: InboxItem) => void
  onOverviewClick?: () => void
  onInfoClick?: () => void
}

export function InboxDrawerWidget({ onItemClick }: InboxDrawerWidgetProps) {
  const [items, setItems] = useState<InboxItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'vip'>('all')

  useEffect(() => {
    // Mock data load
    const timer = setTimeout(() => {
      setItems([
        {
          id: '1',
          sender: 'Max Mustermann',
          title: 'Tischreservierung Anfrage',
          snippet: 'Hallo, haben Sie morgen Abend noch einen Tisch für 2 Personen frei? Gerne am Fenster.',
          time: '14:20',
          unread: true,
          channel: 'email',
        },
        {
          id: '2',
          sender: 'Lisa Design',
          title: 'Lieferstatus #1042',
          snippet: 'Wann kommt meine Bestellung an? Ich warte schon seit 3 Tagen.',
          time: '13:05',
          unread: true,
          channel: 'chat',
        },
        {
          id: '3',
          sender: 'Google Reviews',
          title: '5 Sterne Bewertung',
          snippet: 'Fantastischer Service, super Essen! Kommen gerne wieder.',
          time: 'Gestern',
          unread: false,
          channel: 'reviews',
        },
        {
          id: '4',
          sender: 'Support System',
          title: 'Passwort Reset',
          snippet: 'Benutzer hat Passwort-Reset angefordert.',
          time: 'Gestern',
          unread: false,
          channel: 'support',
        },
      ])
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const filteredItems = useMemo(() => {
    let result = items
    if (activeFilter === 'unread') {
        result = result.filter(i => i.unread)
    }
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      result = result.filter((item) => {
        return (
          item.title.toLowerCase().includes(q) ||
          item.snippet.toLowerCase().includes(q) ||
          item.sender.toLowerCase().includes(q)
        )
      })
    }
    return result
  }, [items, activeFilter, searchQuery])

  const handleItemClick = (item: InboxItem) => {
    setSelectedId(item.id)
    onItemClick?.(item)
    // Mark read after delay
    if (item.unread) {
      setTimeout(() => {
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, unread: false } : i)))
      }, 1000)
    }
  }

  return (
    <div className="flex h-full flex-col bg-transparent">
        {/* Header */}
        <div className="px-4 pt-4 pb-2">
            <AkSearchField
                value={searchQuery}
                onValueChange={setSearchQuery}
                placeholder="Suchen"
            />
            
            {/* Filter Tabs */}
            <div className="flex mt-4 p-1 bg-[var(--ak-color-bg-surface)] rounded-lg border border-[var(--ak-color-border-subtle)]">
                {(['all', 'unread', 'vip'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={clsx(
                            "flex-1 py-1 text-xs font-medium rounded-md transition-all",
                            activeFilter === f 
                                ? "bg-white text-[var(--ak-color-text-primary)] shadow-sm"
                                : "text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]"
                        )}
                    >
                        {f === 'all' && 'Alle'}
                        {f === 'unread' && 'Ungelesen'}
                        {f === 'vip' && 'VIP'}
                    </button>
                ))}
            </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 mt-2">
            <ul className="flex flex-col gap-0.5">
                {filteredItems.map((item) => (
                    <li key={item.id}>
                        <button
                            onClick={() => handleItemClick(item)}
                            className={clsx(
                                "relative w-full text-left p-3 rounded-xl transition-all duration-200 group border border-transparent",
                                selectedId === item.id 
                                    ? "bg-[var(--ak-color-bg-selected)] border-[var(--ak-color-accent)]/20 shadow-sm"
                                    : "hover:bg-white/60"
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={clsx(
                                    "text-sm truncate pr-2",
                                    item.unread ? "font-bold text-[var(--ak-color-text-primary)]" : "font-semibold text-gray-700"
                                )}>
                                    {item.sender}
                                </span>
                                <span className="text-[11px] text-gray-400 shrink-0">{item.time}</span>
                            </div>
                            <div className="text-xs text-[var(--ak-color-text-secondary)] truncate mb-0.5">
                                {item.title}
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed flex-1">
                                    {item.snippet}
                                </div>
                                {item.unread && (
                                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-sm mt-1 shrink-0" />
                                )}
                                <ChevronRightIcon className="h-3 w-3 text-gray-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </button>
                        {/* Separator */}
                        <div className="mx-4 h-px bg-[var(--ak-color-border-hairline)]" />
                    </li>
                ))}
            </ul>
        </div>
    </div>
  )
}
