'use client'

import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { SidebarHeader } from '@/components/ui/SidebarHeader'

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
  status?: string
  important?: boolean
}

type InboxDrawerWidgetProps = {
  onThreadSelect?: (id: string) => void
  activeThreadId?: string | null
  onItemClick?: (item: InboxItem) => void
  onToggleInspector?: () => void
}

export function InboxDrawerWidget({ onThreadSelect, activeThreadId, onItemClick, onToggleInspector }: InboxDrawerWidgetProps) {
  const [items, setItems] = useState<InboxItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'email' | 'messenger' | 'support'>('all')

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
    if (activeFilter === 'email') {
        result = result.filter(i => i.channel === 'email')
    } else if (activeFilter === 'messenger') {
        result = result.filter(i => i.channel === 'chat' || i.channel === 'reviews')
    } else if (activeFilter === 'support') {
        result = result.filter(i => i.channel === 'support')
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
    onItemClick?.(item)
    onThreadSelect?.(item.id)
    // Mark read after delay
    if (item.unread) {
      setTimeout(() => {
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, unread: false } : i)))
      }, 1000)
    }
  }

  return (
    <div className="flex h-full flex-col bg-transparent">
      <SidebarHeader 
        title="Posteingang" 
        onSearch={setSearchQuery} 
        onToggleInspector={onToggleInspector} 
      />

      <div className="px-2 pt-3 pb-2">
        {/* Filter Tabs - Smaller and updated labels */}
        <div className="flex p-0.5 bg-[var(--ak-color-bg-surface-muted)]/50 rounded-lg border border-[var(--ak-color-border-subtle)]">
          {(['all', 'email', 'messenger', 'support'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={clsx(
                "flex-1 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all",
                activeFilter === f 
                  ? "bg-white text-[var(--ak-color-text-primary)] shadow-sm"
                  : "text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-secondary)]"
              )}
            >
              {f === 'all' && 'Alle'}
              {f === 'email' && 'E-Mail'}
              {f === 'messenger' && 'Messenger'}
              {f === 'support' && 'Support'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 mt-1 ak-scrollbar">
        <ul className="flex flex-col gap-0.5">
          {filteredItems.map((item) => {
            const isActive = activeThreadId === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleItemClick(item)}
                  className={clsx(
                    "relative w-full text-left p-3.5 rounded-xl transition-all duration-200 group border border-transparent",
                    isActive 
                      ? "bg-[var(--ak-color-bg-surface)] border-[var(--ak-color-border-subtle)] shadow-sm"
                      : "hover:bg-[var(--ak-color-bg-hover)]"
                  )}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className={clsx(
                      "text-sm truncate pr-2 font-bold transition-colors",
                      isActive ? "text-[var(--ak-color-text-primary)]" : (item.unread ? "text-[var(--ak-color-text-primary)]" : "text-[var(--ak-color-text-secondary)]")
                    )}>
                      {item.sender}
                    </span>
                    <span className="text-[11px] text-[var(--ak-color-text-muted)] shrink-0 font-medium">{item.time}</span>
                  </div>
                  <div className={clsx(
                    "text-[13px] truncate mb-1.5 font-medium transition-colors",
                    isActive ? "text-[var(--ak-color-text-primary)]" : "text-[var(--ak-color-text-secondary)]"
                  )}>
                    {item.title}
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="text-xs text-[var(--ak-color-text-muted)] line-clamp-2 leading-relaxed flex-1">
                      {item.snippet}
                    </div>
                    {item.unread && (
                      <div className="h-2 w-2 rounded-full bg-[var(--ak-color-accent)] shadow-[0_0_8px_var(--ak-color-accent)] mt-1.5 shrink-0" />
                    )}
                    <ChevronRightIcon className={clsx("h-3.5 w-3.5 mt-1.5 transition-opacity", isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40")} />
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Bottom Section */}
      <div className="px-4 py-3 border-t border-[var(--ak-color-border-hairline)] bg-[var(--ak-color-bg-surface-muted)]/30">
        <div className="flex items-center justify-between text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>Sync: Live</span>
          </div>
          <span>v1.2.0</span>
        </div>
      </div>
    </div>
  )
}

