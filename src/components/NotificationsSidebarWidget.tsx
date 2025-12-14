'use client'

import { useMemo, useState, type ElementType } from 'react'
import clsx from 'clsx'
import {
  AdjustmentsHorizontalIcon,
  BellAlertIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'
import { AkButton } from '@/components/ui/AkButton'
import { AkChip } from '@/components/ui/AkChip'
import { AkIconButton } from '@/components/ui/AkIconButton'

type NotificationPriority = 'high' | 'medium' | 'low'
type NotificationKind = 'task' | 'mention' | 'system' | 'insight'
type FilterId = 'all' | NotificationKind | 'unread' | 'high_priority'

export type NotificationItem = {
  id: string
  title: string
  message: string
  time: string
  priority: NotificationPriority
  kind: NotificationKind
  iconColor: 'blue-500' | 'orange-500' | 'green-500' | 'purple-500'
  isNew: boolean
}

export type NotificationsSidebarWidgetProps = {
  onInfoClick?: () => void
}

const ICONS: Record<NotificationKind, ElementType> = {
  task: ExclamationTriangleIcon,
  mention: BellAlertIcon,
  system: InformationCircleIcon,
  insight: LightBulbIcon
}

const TEXT_COLOR_MAP: Record<NotificationItem['iconColor'], string> = {
  'blue-500': 'text-blue-500',
  'orange-500': 'text-orange-500',
  'green-500': 'text-green-500',
  'purple-500': 'text-purple-500'
}

export function NotificationsSidebarWidget({ onInfoClick }: NotificationsSidebarWidgetProps) {
  const [activeFilter, setActiveFilter] = useState<FilterId>('all')
  const [activeId, setActiveId] = useState<string | null>(null)

  const notificationGroups = useMemo(() => {
    const items: NotificationItem[] = [
      {
        id: 'notif-001',
        title: 'Neue Aufgabe: Angebot nachfassen',
        message: 'Acme GmbH wartet auf ein Update zum Zeitplan.',
        time: '09:12',
        priority: 'high',
        kind: 'task',
        iconColor: 'orange-500',
        isNew: true
      },
      {
        id: 'notif-002',
        title: '@Matthias erwähnt',
        message: '„Kannst du kurz in die Inbox schauen?“',
        time: '08:55',
        priority: 'medium',
        kind: 'mention',
        iconColor: 'blue-500',
        isNew: true
      },
      {
        id: 'notif-003',
        title: 'System: Sync erfolgreich',
        message: 'E-Mail-Connector wurde aktualisiert.',
        time: '07:40',
        priority: 'low',
        kind: 'system',
        iconColor: 'green-500',
        isNew: false
      },
      {
        id: 'notif-004',
        title: 'Insight: Upsell-Chance erkannt',
        message: 'Hohe Nutzungsintensität im letzten Monat.',
        time: 'Gestern',
        priority: 'medium',
        kind: 'insight',
        iconColor: 'purple-500',
        isNew: false
      },
      {
        id: 'notif-005',
        title: 'Aufgabe: Follow-up vorbereiten',
        message: 'Entwurf für die nächste E-Mail ist bereit.',
        time: 'Gestern',
        priority: 'low',
        kind: 'task',
        iconColor: 'orange-500',
        isNew: false
      }
    ]

    return [
      { title: 'Heute', items: items.slice(0, 3) },
      { title: 'Gestern', items: items.slice(3) }
    ]
  }, [])

  const allItems = useMemo(
    () => notificationGroups.flatMap((g) => g.items),
    [notificationGroups]
  )

  const counts = useMemo(() => {
    const base = {
      all: allItems.length,
      task: 0,
      mention: 0,
      system: 0,
      insight: 0,
      unread: 0,
      high_priority: 0
    } as Record<FilterId, number>

    for (const it of allItems) {
      base[it.kind] += 1
      if (it.isNew) base.unread += 1
      if (it.priority === 'high') base.high_priority += 1
    }
    return base
  }, [allItems])

  const unreadCount = useMemo(
    () => allItems.filter((it) => it.isNew).length,
    [allItems]
  )

  const filteredGroups = useMemo(() => {
    if (activeFilter === 'all') return notificationGroups
    
    let filterFn: (item: NotificationItem) => boolean
    if (activeFilter === 'unread') {
      filterFn = (item) => item.isNew
    } else if (activeFilter === 'high_priority') {
      filterFn = (item) => item.priority === 'high'
    } else {
      filterFn = (item) => item.kind === activeFilter
    }

    const next = notificationGroups
      .map((g) => ({ ...g, items: g.items.filter(filterFn) }))
      .filter((g) => g.items.length > 0)
    return next
  }, [activeFilter, notificationGroups])

  const filterChips = useMemo(
    () =>
      ([
        { id: 'all', label: 'Alle' },
        { id: 'unread', label: 'Ungelesen' },
        { id: 'high_priority', label: 'Wichtig' },
        { id: 'task', label: 'Aufgaben' },
        { id: 'mention', label: 'Erwähnungen' },
        { id: 'system', label: 'System' },
        { id: 'insight', label: 'Insights' }
      ] as const),
    []
  )

  const handleClick = (id: string) => {
    setActiveId(id)
    console.log('Open notification:', id)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="ak-caption">{unreadCount} ungelesen</div>
        {onInfoClick ? (
          <AkIconButton label="Einstellungen" onClick={onInfoClick}>
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
          </AkIconButton>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filterChips.map((f) => (
          <AkChip
            key={f.id}
            pressed={activeFilter === f.id}
            onClick={() => setActiveFilter(f.id)}
          >
            <span>{f.label}</span>
            <span className="ml-1 rounded-full bg-black/5 px-1.5 py-0.5 text-[9px] font-medium">
              {counts[f.id]}
            </span>
          </AkChip>
        ))}
      </div>

      <div className="space-y-4">
        {filteredGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            <div className="ak-caption uppercase tracking-wide text-[var(--ak-color-text-muted)]">{group.title}</div>

            <ul className="flex flex-col gap-2">
              {group.items.map((item) => {
                const Icon = ICONS[item.kind]
                const isSelected = activeId === item.id
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleClick(item.id)}
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
                            TEXT_COLOR_MAP[item.iconColor]
                          )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                           <p className={clsx(
                             "ak-body text-slate-900 truncate",
                             item.isNew ? "font-semibold" : "font-medium"
                           )}>
                             {item.title}
                           </p>
                           <p className="ak-caption text-slate-500 line-clamp-2 mt-0.5">
                             {item.message}
                           </p>
                        </div>
                      </div>

                      <div className="flex w-full items-center justify-between mt-1">
                        <span className="text-[10px] text-slate-400">{item.time}</span>
                        {item.isNew && (
                           <span className="h-2 w-2 rounded-full bg-blue-500 shadow-sm" aria-label="Ungelesen" />
                        )}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="pt-1">
        <AkButton
          size="sm"
          variant="secondary"
          className="w-full"
          onClick={() => console.log('Load more notifications')}
        >
          Mehr anzeigen
        </AkButton>
      </div>
    </div>
  )
}
