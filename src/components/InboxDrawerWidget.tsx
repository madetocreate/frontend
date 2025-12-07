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
  { id: 'all', label: 'Alle Kanäle' },
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
  const [isLoading, setIsLoading] = useState(false)
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
      } catch (_error) {
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

  const counts = useMemo(() => {
    const base = {
      all: items.length,
      email: 0,
      messenger: 0,
      support: 0,
    }

    for (const item of items) {
      base[item.channel]++
    }

    return base
  }, [items])

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
    <div className="flex h-full flex-col gap-3">
      <div className="grid grid-cols-4 gap-1">

        {FILTER_TABS.map((tab) => {
          const isActive = activeChannel === tab.id
          const isPrimary = tab.id === 'all'

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveChannel(tab.id)}
              className={clsx(
                'inline-flex w-full items-center justify-between gap-1 rounded-full border px-2 py-1 text-[11px] font-medium',
                isActive
                  ? 'border-slate-300 bg-slate-200 text-slate-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
              )}
            >
              <span>{tab.label}</span>
              <span
                className={clsx(
                  'inline-flex min-w-[1.5rem] items-center justify-center rounded-full border px-1 text-[10px]',
                  isActive && isPrimary
                    ? 'border-slate-400 bg-slate-100 text-slate-900'
                    : 'border-slate-200 bg-slate-100 text-slate-600',
                )}
              >
                {counts[tab.id as keyof typeof counts]}
              </span>
            </button>
          )
        })}
      </div>

      {error ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          {error}
        </div>
      ) : null}

      <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {filteredItems.length === 0 ? (
          <div className="flex h-32 items-center justify-center px-3 text-xs text-slate-500">
            Keine Einträge für diesen Filter.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const Icon = channelIcon(item.channel)
              const meta = CHANNEL_META[item.channel]

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={clsx(
                      'flex w-full items-stretch gap-3 px-3 py-2.5 text-left text-xs',
                      item.unread
                        ? `${meta.rowBg} hover:bg-slate-100`
                        : 'hover:bg-slate-50',
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
                      <p className="truncate text-[11px] text-slate-500">
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

      <div className="mt-1 flex justify-center">
        <p className="text-[11px] text-slate-400">
          Tipp: Rechtsklick oder Langdruck zum Löschen.
        </p>
      </div>
    </div>
  )
}
