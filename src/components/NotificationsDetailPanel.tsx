'use client'

import { useState } from 'react'
import clsx from 'clsx'
import {
  CheckCircleIcon,
  EllipsisHorizontalIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ChartBarIcon,
  InformationCircleIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline'
import { WidgetCard } from '@/components/ui/WidgetCard'

type NotificationFilter = 'all' | 'mentions' | 'tasks' | 'system' | 'sales'

type NotificationItem = {
  id: string
  title: string
  subtitle: string
  time: string
  icon: 'notebook-pencil' | 'mail' | 'chart' | 'info' | 'write-alt'
  iconColor: string
  isUnread: boolean
  background: 'surface-secondary' | 'surface'
}

type NotificationGroup = {
  label: string
  items: NotificationItem[]
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'notebook-pencil': DocumentTextIcon,
  mail: EnvelopeIcon,
  chart: ChartBarIcon,
  info: InformationCircleIcon,
  'write-alt': PencilSquareIcon,
}

const COLOR_MAP: Record<string, string> = {
  'blue-500': 'bg-blue-500',
  'purple-500': 'bg-purple-500',
  'green-500': 'bg-green-500',
  'slate-500': 'bg-slate-500',
  'orange-500': 'bg-orange-500',
}

const MOCK_NOTIFICATIONS: NotificationGroup[] = [
  {
    label: 'Heute',
    items: [
      {
        id: 'n-001',
        title: 'Neues Ticket zugewiesen',
        subtitle: 'Projekt X',
        time: 'vor 5 Min',
        icon: 'notebook-pencil',
        iconColor: 'blue-500',
        isUnread: true,
        background: 'surface-secondary',
      },
      {
        id: 'n-002',
        title: 'Du wurdest erwähnt',
        subtitle: 'Kanal: Team-Updates',
        time: 'vor 23 Min',
        icon: 'mail',
        iconColor: 'purple-500',
        isUnread: true,
        background: 'surface-secondary',
      },
      {
        id: 'n-003',
        title: 'Kampagne erfolgreich abgeschlossen',
        subtitle: 'Kampagne Z',
        time: 'vor 2 Std',
        icon: 'chart',
        iconColor: 'green-500',
        isUnread: false,
        background: 'surface',
      },
    ],
  },
  {
    label: 'Gestern',
    items: [
      {
        id: 'n-004',
        title: 'Wartungsfenster abgeschlossen',
        subtitle: 'Status: Erfolgreich',
        time: 'gestern',
        icon: 'info',
        iconColor: 'slate-500',
        isUnread: false,
        background: 'surface',
      },
      {
        id: 'n-005',
        title: 'Aufgabe fällig',
        subtitle: 'Kunde Y',
        time: 'gestern, 16:20',
        icon: 'notebook-pencil',
        iconColor: 'orange-500',
        isUnread: false,
        background: 'surface',
      },
    ],
  },
  {
    label: 'Früher',
    items: [
      {
        id: 'n-006',
        title: 'Neuer Kommentar',
        subtitle: 'Projekt Delta',
        time: 'vor 3 Tagen',
        icon: 'write-alt',
        iconColor: 'slate-500',
        isUnread: false,
        background: 'surface',
      },
    ],
  },
]

export function NotificationsDetailPanel() {
  const [selectedFilter, setSelectedFilter] = useState<NotificationFilter>('all')
  const [notifications] = useState<NotificationGroup[]>(MOCK_NOTIFICATIONS)

  const handleMarkAllRead = () => {
    console.log('Mark all as read')
    // TODO: Implement mark all as read
  }

  const handleFilterChange = (filterId: NotificationFilter) => {
    setSelectedFilter(filterId)
    // TODO: Filter notifications
  }

  const handleNotificationClick = (id: string) => {
    console.log('Open notification:', id)
    // TODO: Open notification details
  }

  const handleMarkRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('Mark as read:', id)
    // TODO: Mark notification as read
  }

  const handleMute = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('Mute notification:', id)
    // TODO: Mute notification
  }

  const handleOpenSettings = () => {
    console.log('Open notification settings')
    // TODO: Open settings
  }

  return (
    <WidgetCard padding="sm">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="ak-heading">Benachrichtigungen</h2>
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center justify-center rounded-lg border border-transparent bg-transparent px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:bg-[var(--ak-color-bg-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25"
          >
            Alle als gelesen markieren
          </button>
        </div>

        <div className="h-px bg-[var(--ak-color-border-subtle)]" />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleFilterChange('all')}
            className={clsx(
              'inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
              selectedFilter === 'all'
                ? 'border-blue-300 bg-blue-100 text-blue-700 shadow-sm'
                : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)]'
            )}
          >
            Alle
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('mentions')}
            className={clsx(
              'inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
              selectedFilter === 'mentions'
                ? 'border-blue-300 bg-blue-100 text-blue-700 shadow-sm'
                : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)]'
            )}
          >
            Erwähnungen
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('tasks')}
            className={clsx(
              'inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
              selectedFilter === 'tasks'
                ? 'border-blue-300 bg-blue-100 text-blue-700 shadow-sm'
                : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)]'
            )}
          >
            Aufgaben
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('system')}
            className={clsx(
              'inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
              selectedFilter === 'system'
                ? 'border-blue-300 bg-blue-100 text-blue-700 shadow-sm'
                : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)]'
            )}
          >
            System
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('sales')}
            className={clsx(
              'inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
              selectedFilter === 'sales'
                ? 'border-blue-300 bg-blue-100 text-blue-700 shadow-sm'
                : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)]'
            )}
          >
            Sales & Marketing
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={handleOpenSettings}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-transparent text-[var(--ak-color-text-primary)] transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:bg-[var(--ak-color-bg-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25"
            aria-label="Einstellungen"
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="h-px bg-[var(--ak-color-border-subtle)]" />

        <div className="flex flex-col gap-1">
          {notifications.map((group) => (
            <div key={group.label}>
              <div className="px-1 py-1">
                <p className="ak-caption font-semibold text-[var(--ak-color-text-muted)]">
                  {group.label}
                </p>
              </div>
              {group.items.map((item) => {
                const IconComponent = ICON_MAP[item.icon] || InformationCircleIcon
                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item.id)}
                    className="w-full cursor-pointer"
                  >
                    <div
                      className={clsx(
                        'flex items-start gap-3 rounded-lg border border-[var(--ak-color-border-subtle)] p-2 transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
                        item.background === 'surface-secondary'
                          ? 'bg-[var(--ak-color-bg-surface-muted)]'
                          : 'bg-[var(--ak-color-bg-surface)]',
                        'hover:border-[var(--ak-color-border-strong)] hover:shadow-[var(--ak-shadow-card)]'
                      )}
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[var(--ak-color-bg-surface-muted)]">
                        <IconComponent className={clsx('h-5 w-5', `text-${item.iconColor}`)} />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-0">
                        <p
                          className={clsx(
                            'ak-body truncate',
                            item.isUnread ? 'font-semibold' : 'font-normal'
                          )}
                        >
                          {item.title}
                        </p>
                        <p className="ak-body truncate text-sm text-[var(--ak-color-text-secondary)]">
                          {item.subtitle}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          <p className="ak-caption text-[var(--ak-color-text-muted)]">
                            {item.time}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkRead(item.id, e)
                            }}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-transparent bg-transparent text-[var(--ak-color-text-primary)] transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:bg-[var(--ak-color-bg-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25"
                            aria-label="Als gelesen markieren"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMute(item.id, e)
                            }}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-transparent bg-transparent text-[var(--ak-color-text-primary)] transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:bg-[var(--ak-color-bg-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25"
                            aria-label="Stummschalten"
                          >
                            <EllipsisHorizontalIcon className="h-4 w-4" />
                          </button>
                          {item.isUnread && (
                            <div
                              className={clsx(
                                'h-2 w-2 rounded-full',
                                COLOR_MAP[item.iconColor] || 'bg-blue-500'
                              )}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </WidgetCard>
  )
}
