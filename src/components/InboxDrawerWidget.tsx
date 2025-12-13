'use client'

import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import {
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  LifebuoyIcon,
  StarIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  Square3Stack3DIcon,
  ArrowPathIcon,
  PlusIcon,
  BoltIcon,
  CheckCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'

export type InboxChannel = 'all' | 'email' | 'messenger' | 'reviews' | 'support'

export type InboxItem = {
  id: string
  channel: Exclude<InboxChannel, 'all'>
  icon: string
  title: string
  snippet: string
  time: string
  unread: boolean
  badge?: 'Neu' | 'Wichtig'
  threadId?: string | null
}

type InboxApiResponse = {
  items?: InboxItem[]
  error?: string
}

type InboxDrawerWidgetProps = {
  onItemClick?: (item: InboxItem) => void
  onOverviewClick?: () => void
}

// Icon-Mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  mail: EnvelopeIcon,
  mobile: DevicePhoneMobileIcon,
  lifesaver: LifebuoyIcon,
  star: StarIcon,
  globe: GlobeAltIcon,
  'write-alt': PencilSquareIcon,
  'square-text': Square3Stack3DIcon,
  reload: ArrowPathIcon,
  plus: PlusIcon,
  bolt: BoltIcon,
  info: InformationCircleIcon,
  'page-blank': DocumentTextIcon,
  'check-circle': CheckCircleIcon,
}

const DEFAULT_ITEMS: InboxItem[] = [
  {
    id: 't_101',
    channel: 'email',
    icon: 'mail',
    title: 'Re: Angebot für Q1',
    snippet: 'Können wir den Umfang am Montag finalisieren?',
    time: '09:12',
    unread: true,
    badge: 'Wichtig',
  },
  {
    id: 't_102',
    channel: 'messenger',
    icon: 'mobile',
    title: 'Neue Chat-Anfrage',
    snippet: 'Hallo! Ich habe eine kurze Frage zu Ihrer Preisliste…',
    time: '08:47',
    unread: true,
    badge: 'Neu',
  },
  {
    id: 't_103',
    channel: 'reviews',
    icon: 'star',
    title: 'Bewertung (4★) – Super schneller Support',
    snippet: 'Das Team hat mir innerhalb von 10 Minuten geholfen!',
    time: 'Gestern',
    unread: false,
  },
  {
    id: 't_104',
    channel: 'support',
    icon: 'lifesaver',
    title: 'Ticket #4821: Rechnung korrigieren',
    snippet: 'Bitte prüfen Sie Position 3 – falscher Betrag ausgewiesen.',
    time: 'Mi',
    unread: true,
  },
  {
    id: 't_105',
    channel: 'email',
    icon: 'mail',
    title: 'Newsletter Dezember',
    snippet: 'Highlights: Produkt-Updates, Roadmap und Termine…',
    time: 'Mo',
    unread: false,
  },
]

const CHANNELS = [
  { key: 'all' as const, label: 'Alle', icon: 'globe' },
  { key: 'email' as const, label: 'E‑Mail', icon: 'mail' },
  { key: 'messenger' as const, label: 'Messenger', icon: 'mobile' },
  { key: 'reviews' as const, label: 'Bewertungen', icon: 'star' },
  { key: 'support' as const, label: 'Support', icon: 'lifesaver' },
]

const ACTIONS_DOCK = [
  {
    key: 'inbox_suggest_replies',
    label: 'Antworten',
    icon: 'write-alt',
  },
  {
    key: 'inbox_summarize',
    label: 'Zusammenfassen',
    icon: 'square-text',
  },
  {
    key: 'inbox_cleanup',
    label: 'Aufräumen',
    icon: 'reload',
  },
]

const BADGE_COLOR_MAP = {
  Neu: 'border-[var(--ak-color-border-discovery)] bg-[var(--ak-color-bg-discovery)] text-[var(--ak-color-text-discovery)]',
  Wichtig: 'border-[var(--ak-color-border-warning)] bg-[var(--ak-color-bg-warning)] text-[var(--ak-color-text-warning)]',
}

export function InboxDrawerWidget({ onItemClick, onOverviewClick }: InboxDrawerWidgetProps) {
  const [currentChannel, setCurrentChannel] = useState<InboxChannel>('all')
  const [items, setItems] = useState<InboxItem[]>(DEFAULT_ITEMS)
  const [, setIsLoading] = useState(false)
  const [uiState, setUiState] = useState<'ok' | 'error' | 'empty'>('ok')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadInbox() {
      try {
        setIsLoading(true)
        setUiState('ok')

        const response = await fetch('/api/inbox', {
          method: 'GET',
        })

        if (!response.ok) {
          if (!cancelled) {
            setUiState('error')
          }
          return
        }

        const data = (await response.json()) as InboxApiResponse

        if (cancelled) {
          return
        }

        if (Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items)
          setUiState('ok')
        } else {
          setItems(DEFAULT_ITEMS)
          setUiState('ok')
        }
      } catch {
        if (!cancelled) {
          setUiState('error')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadInbox()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredItems = useMemo(() => {
    let filtered = items

    // Filter nach Channel
    if (currentChannel !== 'all') {
      filtered = filtered.filter((item) => item.channel === currentChannel)
    }

    // Filter nach Suchbegriff
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.snippet.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [items, currentChannel, searchQuery])

  const unreadCount = items.filter((item) => item.unread).length

  const handleItemClick = (item: InboxItem) => {
    if (onItemClick) {
      onItemClick(item)
    }

    if (typeof window !== 'undefined' && item.threadId) {
      const detail = {
        threadId: item.threadId,
        composerText: undefined as string | undefined,
      }

      window.dispatchEvent(
        new CustomEvent('aklow-focus-thread', {
          detail,
        }),
      )
    }
  }

  const handleActionClick = (e: React.MouseEvent, actionKey: string) => {
    e.stopPropagation()
    // TODO: Action handlers
    console.log('Action:', actionKey, 'Channel:', currentChannel)
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Action Palette öffnen
  }

  const handleReload = () => {
    // TODO: Reload action
    window.location.reload()
  }

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      {/* Header mit Titel, Badge und Info-Button */}
      <div className="flex items-center gap-2">
        <h2 className="ak-heading text-base">Posteingang</h2>
        {unreadCount > 0 && (
          <span className="inline-flex items-center rounded-full border border-[var(--ak-color-border-info)] bg-[var(--ak-color-bg-info)] px-2 py-0.5 text-[10px] font-medium text-[var(--ak-color-text-info)]">
            {unreadCount}
          </span>
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={onOverviewClick}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-secondary)] transition-colors hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]"
          aria-label="Details öffnen"
        >
          <InformationCircleIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Suchfeld (optional) */}
      {showSearch && (
        <input
          type="text"
          name="inbox.search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Suchen…"
          className="w-full rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-4 py-2 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)]"
        />
      )}

      {/* Channel Filter Buttons */}
      <div className="flex items-center gap-1">
        {CHANNELS.map((channel) => {
          const IconComponent = ICON_MAP[channel.icon] || GlobeAltIcon
          return (
            <button
              key={channel.key}
              type="button"
              onClick={() => setCurrentChannel(channel.key)}
              className={clsx(
                'inline-flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
                currentChannel === channel.key
                  ? 'border-[var(--ak-color-border-strong)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] shadow-sm'
                  : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-secondary)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)]'
              )}
            >
              <IconComponent className="h-4 w-4" />
              {channel.label}
            </button>
          )
        })}
      </div>

      {/* Actions Dock */}
      <div className="flex items-center gap-1">
        {ACTIONS_DOCK.map((action) => {
          const IconComponent = ICON_MAP[action.icon] || BoltIcon
          return (
            <button
              key={action.key}
              type="button"
              onClick={(e) => handleActionClick(e, action.key)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
            >
              <IconComponent className="h-4 w-4" />
              {action.label}
            </button>
          )
        })}
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleMenuClick}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
        >
          <PlusIcon className="h-4 w-4" />
          Mehr…
        </button>
      </div>

      {/* Error State */}
      {uiState === 'error' && (
        <div className="rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-elevated-secondary)] p-3">
          <div className="flex items-center gap-2">
            <ArrowPathIcon className="h-4 w-4 text-[var(--ak-color-text-secondary)]" />
            <p className="ak-body flex-1 text-sm text-[var(--ak-color-text-primary)]">
              Posteingang gerade nicht erreichbar
            </p>
            <button
              type="button"
              onClick={handleReload}
              className="inline-flex items-center justify-center rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
            >
              Neu laden
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {uiState === 'empty' && (
        <div className="rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] p-4">
          <p className="ak-body text-center text-sm text-[var(--ak-color-text-secondary)]">
            Noch keine Nachrichten – sobald etwas reinkommt, landet es hier.
          </p>
        </div>
      )}

      {/* ListView */}
      {uiState === 'ok' && (
        <div className="flex-1 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="flex h-32 items-center justify-center px-3 text-xs text-slate-500">
              Keine Einträge für diesen Filter.
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filteredItems.map((item) => {
                const IconComponent = ICON_MAP[item.icon] || EnvelopeIcon

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="group flex w-full items-center gap-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/80 p-2 text-left transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)] hover:shadow-[var(--ak-shadow-card)] cursor-pointer"
                  >
                    {/* Icon Box */}
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-[var(--ak-color-bg-surface-muted)]/50">
                      <IconComponent className="h-5 w-5 text-[var(--ak-color-text-primary)]" />
                    </div>

                    {/* Content Col mit flex: 1 */}
                    <div className="flex min-w-0 flex-1 flex-col gap-0">
                      {/* Row mit Titel und Badge */}
                      <div className="flex items-baseline gap-2">
                        <p className="ak-body flex-1 truncate text-sm font-semibold text-[var(--ak-color-text-primary)]">
                          {item.title}
                        </p>
                        {item.badge && (
                          <span
                            className={clsx(
                              'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
                              BADGE_COLOR_MAP[item.badge]
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {/* Snippet */}
                      <p className="ak-body truncate text-sm text-[var(--ak-color-text-secondary)]">
                        {item.snippet}
                      </p>
                    </div>

                    {/* Col mit Zeit und unread-Punkt */}
                    <div className="flex flex-col items-end gap-1">
                      <span className="ak-caption text-sm text-[var(--ak-color-text-secondary)]">
                        {item.time}
                      </span>
                      {item.unread && (
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      )}
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMenuClick(e)
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded text-[var(--ak-color-text-secondary)] transition-colors hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]"
                        aria-label="Aktionen"
                      >
                        <BoltIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: Open thread details
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded text-[var(--ak-color-text-secondary)] transition-colors hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]"
                        aria-label="Details"
                      >
                        <InformationCircleIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: Archive thread
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded text-[var(--ak-color-text-secondary)] transition-colors hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]"
                        aria-label="Archivieren"
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: Mark as read
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded text-[var(--ak-color-text-secondary)] transition-colors hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]"
                        aria-label="Als gelesen markieren"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
