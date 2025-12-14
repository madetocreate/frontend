'use client'

import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import {
  AdjustmentsHorizontalIcon,
  ChatBubbleLeftRightIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  FunnelIcon,
  LifebuoyIcon,
  MagnifyingGlassIcon,
  StarIcon,
} from '@heroicons/react/24/outline'

import { AkButton } from '@/components/ui/AkButton'
import { AkChip } from '@/components/ui/AkChip'
import { AkSearchField } from '@/components/ui/AkSearchField'

export type InboxItem = {
  id: string
  title: string
  snippet: string
  time: string
  unread?: boolean
  channel: 'email' | 'chat' | 'reviews' | 'support'
  badge?: string
}

type InboxDrawerWidgetProps = {
  onItemClick?: (item: InboxItem) => void
  onOverviewClick?: () => void
  onInfoClick?: () => void
}

const ICON_MAP: Record<InboxItem['channel'], React.ComponentType<{ className?: string }>> = {
  email: EnvelopeIcon,
  chat: ChatBubbleLeftRightIcon,
  reviews: StarIcon,
  support: LifebuoyIcon,
}

const CHANNELS: Array<{
  key: 'all' | InboxItem['channel']
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { key: 'all', label: 'Alle', icon: FunnelIcon },
  { key: 'email', label: 'E-Mail', icon: EnvelopeIcon },
  { key: 'chat', label: 'Chat', icon: ChatBubbleLeftRightIcon },
  { key: 'reviews', label: 'Bewertungen', icon: StarIcon },
  { key: 'support', label: 'Support', icon: LifebuoyIcon },
  { key: 'unread', label: 'Ungelesen', icon: FunnelIcon },
  { key: 'starred', label: 'Favoriten', icon: StarIcon },
]

const ACTIONS: Array<{
  key: 'filter' | 'settings' | 'search'
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { key: 'filter', label: 'Filter', icon: FunnelIcon },
  { key: 'settings', label: 'Regeln', icon: AdjustmentsHorizontalIcon },
  { key: 'search', label: 'Suche', icon: MagnifyingGlassIcon },
]

const ICON_COLOR_MAP: Record<InboxItem['channel'], string> = {
  email: 'text-blue-500',
  chat: 'text-emerald-500',
  reviews: 'text-amber-500',
  support: 'text-rose-500',
}

export function InboxDrawerWidget({ onItemClick }: InboxDrawerWidgetProps) {
  const [items, setItems] = useState<InboxItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentChannel, setCurrentChannel] = useState<'all' | InboxItem['channel']>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems([
        {
          id: '1',
          title: 'Neue Reservierungsanfrage',
          snippet: '2 Personen morgen 19:00 — Tisch am Fenster?',
          time: 'vor 2 Min',
          unread: true,
          channel: 'email',
          badge: 'Neu',
        },
        {
          id: '2',
          title: 'Chat: Lieferstatus',
          snippet: 'Kunde fragt nach ETA fuer Bestellung #1042',
          time: 'vor 12 Min',
          unread: true,
          channel: 'chat',
          badge: 'Dringend',
        },
        {
          id: '3',
          title: 'Bewertung: 5 Sterne',
          snippet: 'Sehr lecker, schneller Service',
          time: 'vor 1 Std',
          unread: false,
          channel: 'reviews',
          badge: 'VIP',
        },
        {
          id: '4',
          title: 'Support: Passwort zuruecksetzen',
          snippet: 'Nutzer meldet Login-Probleme nach Update',
          time: 'gestern',
          unread: false,
          channel: 'support',
        },
      ])
      setIsLoading(false)
      setHasError(false)
    }, 900)
    return () => clearTimeout(timer)
  }, [])

  const filteredItems = useMemo(() => {
    let result = items
    if (currentChannel !== 'all') {
      result = result.filter((item) => item.channel === currentChannel)
    }
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      result = result.filter((item) => {
        return (
          item.title.toLowerCase().includes(q) ||
          item.snippet.toLowerCase().includes(q) ||
          item.channel.toLowerCase().includes(q) ||
          (item.badge ?? '').toLowerCase().includes(q)
        )
      })
    }
    return result
  }, [items, currentChannel, searchQuery])

  const handleItemClick = (item: InboxItem) => {
    setSelectedId(item.id)
    onItemClick?.(item)
    if (item.unread) {
      setTimeout(() => {
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, unread: false } : i)))
      }, 700)
    }
  }

  const handleActionClick = (e: React.MouseEvent, actionKey: string) => {
    e.stopPropagation()
    if (actionKey === 'filter') {
      setHasError(false)
    }
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleReload = () => {
    setHasError(false)
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 600)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-3 px-3 pb-3 flex-1 overflow-hidden pt-3">
        <AkSearchField
          value={searchQuery}
          onValueChange={setSearchQuery}
          placeholder="Suchen..."
          accent="inbox"
          aria-label="Inbox durchsuchen"
        />

        <div className="flex flex-wrap gap-2">
          {CHANNELS.map((channel) => {
            const IconComponent = channel.icon
            const pressed = currentChannel === channel.key
            return (
              <AkChip
                key={channel.key}
                pressed={pressed}
                onClick={() => setCurrentChannel(channel.key)}
              >
                <IconComponent className="h-3 w-3" aria-hidden="true" />
                {channel.label}
              </AkChip>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {ACTIONS.map((action) => {
            const IconComponent = action.icon
            return (
              <AkChip
                key={action.key}
                onClick={(e) => handleActionClick(e, action.key)}
              >
                <IconComponent className="h-3 w-3" aria-hidden="true" />
                {action.label}
              </AkChip>
            )
          })}

          <AkChip onClick={handleMenuClick}>
            Mehr...
            <EllipsisHorizontalIcon className="h-3 w-3" aria-hidden="true" />
          </AkChip>
        </div>

        <div className="flex-1 overflow-y-auto ak-scrollbar -mx-1 px-1">
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 bg-white/60 p-3"
                >
                  <div className="h-3 w-2/3 rounded bg-slate-100" />
                  <div className="mt-2 h-2 w-full rounded bg-slate-100 opacity-60" />
                </div>
              ))}
            </div>
          ) : hasError ? (
            <div className="rounded-xl border border-slate-200 bg-white/60 p-3">
              <p className="ak-caption text-[var(--ak-color-text-muted)]">Konnte Inbox nicht laden. Bitte neu versuchen.</p>
              <div className="mt-3">
                <AkButton size="sm" variant="secondary" accent="inbox" onClick={handleReload}>
                  Neu laden
                </AkButton>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white/60 p-3">
              <p className="ak-caption text-[var(--ak-color-text-muted)]">Keine Treffer.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {filteredItems.map((item) => {
                const IconComponent = ICON_MAP[item.channel]
                const isSelected = selectedId === item.id
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className={clsx(
                        'relative flex w-full flex-col gap-2 rounded-xl border p-3 text-left transition-all',
                        'bg-white/60 backdrop-blur-sm',
                        isSelected
                          ? 'border-[var(--ak-color-accent)] ring-1 ring-[var(--ak-color-accent)]'
                          : 'border-slate-200 hover:bg-white/80'
                      )}
                    >
                      <div className="flex w-full items-start gap-3">
                        <div className={clsx(
                            "grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--ak-color-border)] bg-white/50",
                            ICON_COLOR_MAP[item.channel]
                          )}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                           <p className={clsx(
                             "ak-body text-slate-900 truncate",
                             item.unread ? "font-semibold" : "font-medium"
                           )}>
                             {item.title}
                           </p>
                           <p className="ak-caption text-slate-500 line-clamp-2 mt-0.5">
                             {item.snippet}
                           </p>
                        </div>
                      </div>

                      <div className="flex w-full items-center justify-between mt-1">
                        <span className="text-[10px] text-slate-400">{item.time}</span>
                        {item.unread && (
                           <span className="h-2 w-2 rounded-full bg-blue-500 shadow-sm" aria-label="Ungelesen" />
                        )}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

