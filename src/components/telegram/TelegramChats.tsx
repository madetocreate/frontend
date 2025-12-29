'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { 
  appleCardStyle, 
  appleSectionTitle, 
  appleSubTitle, 
  appleGroupedList, 
  appleListItem,
  appleInputStyle,
  appleAnimationFadeInUp
} from '@/lib/appleDesign'
import { authedFetch } from '@/lib/api/authedFetch'

interface TelegramChat {
  chatId: string
  username?: string
  firstName?: string
  lastName?: string
  lastMessage?: string
  lastMessageAt: string
  messageCount: number
  status: 'active' | 'inactive'
}

export function TelegramChats() {
  const router = useRouter()
  const [chats, setChats] = useState<TelegramChat[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    void loadChats()
  }, [])

  const loadChats = async () => {
    setLoading(true)
    try {
      const response = await authedFetch('/api/telegram/chats')

      if (response.ok) {
        const data = await response.json()
        setChats(data.chats || [])
      } else {
        throw new Error('Fehler beim Laden der Chats')
      }
    } catch (error) {
      console.error('Failed to load Telegram chats:', error)
      setChats([])
    }
    setLoading(false)
  }

  const filteredChats = chats.filter(chat => {
    // Filter by status
    if (filter !== 'all' && chat.status !== filter) {
      return false
    }
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        chat.username?.toLowerCase().includes(searchLower) ||
        chat.firstName?.toLowerCase().includes(searchLower) ||
        chat.lastName?.toLowerCase().includes(searchLower) ||
        chat.chatId.includes(searchLower)
      )
    }
    
    return true
  })

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `Vor ${diffMins}m`
    if (diffHours < 24) return `Vor ${diffHours}h`
    if (diffDays < 7) return `Vor ${diffDays}d`
    return date.toLocaleDateString('de-DE')
  }

  return (
    <div className={`space-y-6 ${appleAnimationFadeInUp}`}>
      {/* Header */}
      <div>
        <h2 className={appleSectionTitle}>
          Telegram Chats
        </h2>
        <p className={`${appleSubTitle} mt-1`}>
          Übersicht aller Telegram-Konversationen
        </p>
      </div>

      {/* Filters & Search */}
      <div className={`${appleCardStyle} p-4 flex flex-col sm:flex-row gap-4`}>
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--ak-color-text-muted)]" />
            <input
              type="text"
              placeholder="Suche nach Namen oder Chat-ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${appleInputStyle} pl-10`}
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 p-1 bg-[var(--ak-color-bg-surface-muted)] rounded-[var(--ak-radius-lg)]">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-[var(--ak-radius-md)] text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-[var(--ak-surface-1)] text-[var(--ak-color-text-primary)] shadow-sm'
                  : 'text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]'
              }`}
            >
              {f === 'all' ? 'Alle' : f === 'active' ? 'Aktiv' : 'Inaktiv'}
            </button>
          ))}
        </div>
      </div>

      {/* Chats List */}
      <div className={appleGroupedList}>
        {loading ? (
          <div className="p-8 text-center text-[var(--ak-color-text-secondary)]">
            Lade Chats...
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-8 text-center text-[var(--ak-color-text-secondary)]">
            Keine Chats gefunden
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.chatId}
              className={appleListItem}
              onClick={() => {
                // Navigate to inbox with this chat
                router.push(`/inbox?src=telegram&chatId=${chat.chatId}`)
              }}
            >
              <div className="flex items-start justify-between w-full">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[var(--ak-semantic-info)] to-[var(--ak-accent-documents)] rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-[var(--ak-color-text-inverted)] font-semibold text-lg">
                      {chat.firstName?.charAt(0) || chat.username?.charAt(0) || '#'}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    {/* Name & Username */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[var(--ak-color-text-primary)]">
                        {chat.firstName} {chat.lastName}
                      </span>
                      {chat.username && (
                        <span className="text-sm text-[var(--ak-color-text-secondary)]">
                          @{chat.username}
                        </span>
                      )}
                      {chat.status === 'active' && (
                        <div className="h-2 w-2 rounded-full bg-[var(--ak-semantic-success)]" />
                      )}
                    </div>

                    {/* Last Message */}
                    {chat.lastMessage && (
                      <p className="text-sm text-[var(--ak-color-text-secondary)] truncate">
                        {chat.lastMessage}
                      </p>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div className="flex flex-col items-end gap-1 ml-4 pt-1">
                  <span className="text-xs font-medium text-[var(--ak-color-text-muted)]">
                    {formatTime(chat.lastMessageAt)}
                  </span>
                  {chat.messageCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] text-xs font-medium border border-[var(--ak-color-border-subtle)]">
                      {chat.messageCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Footer */}
      <div className="text-center text-sm text-[var(--ak-color-text-secondary)] pb-4">
        {filteredChats.length} von {chats.length} Chats
      </div>
    </div>
  )
}

