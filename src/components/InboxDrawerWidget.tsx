'use client'

import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import {
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  LifebuoyIcon,
} from '@heroicons/react/24/outline'

export type InboxChannel = 'all' | 'email' | 'messenger' | 'support'

export type InboxItem = {
  id: string
  channel: Exclude<InboxChannel, 'all'>
  type: string
  source: string
  contactName: string
  title: string
  preview: string
  time: string
  unread: boolean
  threadId?: string | null
}

type InboxApiResponse = {
  items?: InboxItem[]
  error?: string
}

type InboxDrawerWidgetProps = {
  onItemClick?: (item: InboxItem) => void
}

const DEFAULT_ITEMS: InboxItem[] = [
  {
    id: 'sample-email-1',
    channel: 'email',
    type: 'email',
    source: 'E-Mail',
    contactName: 'Max Mustermann',
    title: 'Willkommen an Bord 👋',
    preview:
      'Hi, ich habe mir deinen Assistenten angesehen und habe noch eine Frage zur Einrichtung …',
    time: '09:24',
    unread: true,
  },
  {
    id: 'sample-dm-1',
    channel: 'messenger',
    type: 'dm',
    source: 'Instagram',
    contactName: 'Anna',
    title: 'Frage zu deinem Angebot',
    preview: 'Hey, funktioniert das auch mit meinem bestehenden CRM-System?',
    time: 'Gestern',
    unread: true,
  },
  {
    id: 'sample-review-1',
    channel: 'support',
    type: 'review',
    source: 'Trustpilot',
    contactName: 'Kund:in',
    title: 'Neue 5★ Bewertung',
    preview: '„Super schneller Support, hat mir sofort geholfen …“',
    time: 'Mo',
    unread: false,
  },
]

const FILTER_TABS: { id: InboxChannel; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'email', label: 'E‑Mail' },
  { id: 'messenger', label: 'Messenger' },
  { id: 'support', label: 'Support' },

]

const CHANNEL_META = {
  email: {
    label: 'E‑Mail',
    bubbleBg: 'bg-slate-100',
    iconColor: 'text-slate-700',
    rowBg: 'bg-slate-50',
    dotColor: 'bg-sky-500',
  },
  messenger: {
    label: 'Messenger',
    bubbleBg: 'bg-slate-100',
    iconColor: 'text-slate-700',
    rowBg: 'bg-slate-50',
    dotColor: 'bg-sky-500',
  },
  support: {
    label: 'Support',
    bubbleBg: 'bg-slate-100',
    iconColor: 'text-slate-700',
    rowBg: 'bg-slate-50',
    dotColor: 'bg-sky-500',
  },
} as const

function channelIcon(channel: Exclude<InboxChannel, 'all'>) {
  switch (channel) {
    case 'email':
      return EnvelopeIcon
    case 'messenger':
      return ChatBubbleLeftRightIcon
    case 'support':
    default:
      return LifebuoyIcon
  }
}

export function InboxDrawerWidget({ onItemClick }: InboxDrawerWidgetProps) {
  const [activeChannel, setActiveChannel] = useState<InboxChannel>('all')
  const [items, setItems] = useState<InboxItem[]>(DEFAULT_ITEMS)
  const [, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadInbox() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/inbox', {
          method: 'GET',
        })

        if (!response.ok) {
          const text = await response.text()
          if (!cancelled && text) {
            setError(text)
          }
          return
        }

        const data = (await response.json()) as InboxApiResponse

        if (cancelled) {
          return
        }

        if (Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items)
        } else {
          setItems(DEFAULT_ITEMS)
        }

        if (data.error) {
          setError(data.error)
        }
      } catch {
        if (!cancelled) {
          setError('Fehler beim Laden der Inbox.')
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

  const filteredItems = useMemo(
    () =>
      activeChannel === 'all'
        ? items
        : items.filter((item) => item.channel === activeChannel),
    [items, activeChannel],
  )

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

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-slate-200 bg-[var(--ak-color-bg-surface)]/95 p-3 shadow-[var(--ak-shadow-soft)] backdrop-blur-xl">
      <div className="grid grid-cols-4 gap-1">
        {FILTER_TABS.map((tab) => {
          const isActive = activeChannel === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveChannel(tab.id)}
                className={clsx(
                  'inline-flex w-full items-center justify-center rounded-lg border px-2 py-0.5 text-[9px] font-medium transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] ak-button-interactive',
                isActive
                  ? 'border-[var(--ak-color-border-strong)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] shadow-[var(--ak-shadow-soft)]'
                  : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-secondary)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)]'
              )}
            >
              <span className="truncate">{tab.label}</span>
            </button>
          )
        })}
      </div>

{error ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          {error}
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto rounded-xl">
        {filteredItems.length === 0 ? (
          <div className="flex h-32 items-center justify-center px-3 text-xs text-slate-500">
            Keine Einträge für diesen Filter.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {filteredItems.map((item) => {
              const Icon = channelIcon(item.channel)
              const meta = CHANNEL_META[item.channel]

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={clsx(
                      'group flex w-full items-stretch gap-3 rounded-[var(--ak-radius-card)] border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/80 px-3 py-2.5 text-left text-xs shadow-sm backdrop-blur-sm transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] ak-button-interactive',
                      item.unread
                        ? 'bg-slate-50/90 hover:border-slate-300 hover:bg-slate-100/90 hover:shadow-[var(--ak-shadow-card)]'
                        : 'hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)]/80 hover:shadow-[var(--ak-shadow-card)]',
                    )}
                  >
                    <div className="flex items-center">
                      <div
                        className={clsx(
                          'flex h-9 w-9 items-center justify-center rounded-full',
                          meta.bubbleBg,
                        )}
                      >
                        <Icon className={clsx('h-4 w-4', meta.iconColor)} />
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className="truncate text-[11px] font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="truncate text-[11px] text-slate-600">
                        {item.contactName}
                        {item.source ? (
                          <span className="text-slate-400">
                            {' '}
                            · {item.source}
                          </span>
                        ) : null}
                      </p>
                      <p className="truncate text-[10px] text-slate-500">
                        {item.preview}
                      </p>
                    </div>

                    <div className="flex w-16 flex-col items-end justify-between py-0.5">
                      <span className="text-[10px] text-slate-400">
                        {item.time}
                      </span>
                      <span
                        className={clsx(
                          'mt-2 h-2 w-2 rounded-full',
                          item.unread ? meta.dotColor : 'bg-slate-200',
                        )}
                      />
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
