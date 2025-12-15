'use client'

import clsx from 'clsx'
import {
  Squares2X2Icon,
  CalendarIcon,
  HomeIcon,
  CakeIcon,
  SparklesIcon,
  UserGroupIcon,
  CurrencyEuroIcon,
  MegaphoneIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { AkListRow } from '@/components/ui/AkListRow'
import { WidgetCard } from '@/components/ui/WidgetCard'
import type { HotelView } from './HotelDashboard'

const VIEWS: { id: HotelView; label: string; icon: typeof Squares2X2Icon; category: string; shortcut?: string }[] = [
  { id: 'overview', label: 'Übersicht', icon: Squares2X2Icon, category: 'Haupt', shortcut: '⌘1' },
  { id: 'reservations', label: 'Reservierungen', icon: CalendarIcon, category: 'Haupt', shortcut: '⌘2' },
  { id: 'rooms', label: 'Zimmer', icon: HomeIcon, category: 'Haupt', shortcut: '⌘3' },
  { id: 'restaurant', label: 'Restaurant', icon: CakeIcon, category: 'Service', shortcut: '⌘4' },
  { id: 'events', label: 'Events', icon: SparklesIcon, category: 'Service', shortcut: '⌘5' },
  { id: 'guests', label: 'Gäste', icon: UserGroupIcon, category: 'Haupt', shortcut: '⌘6' },
  { id: 'revenue', label: 'Revenue', icon: CurrencyEuroIcon, category: 'Business', shortcut: '⌘7' },
  { id: 'marketing', label: 'Marketing', icon: MegaphoneIcon, category: 'Business', shortcut: '⌘8' },
  { id: 'reports', label: 'Berichte', icon: ChartBarIcon, category: 'Business', shortcut: '⌘9' },
  { id: 'settings', label: 'Einstellungen', icon: Cog6ToothIcon, category: 'System' },
]

type HotelSidebarWidgetProps = {
  activeView: HotelView
  onViewSelect: (view: HotelView) => void
}

export function HotelSidebarWidget({
  activeView,
  onViewSelect,
}: HotelSidebarWidgetProps) {
  const grouped = VIEWS.reduce((acc, view) => {
    if (!acc[view.category]) acc[view.category] = []
    acc[view.category].push(view)
    return acc
  }, {} as Record<string, typeof VIEWS>)

  return (
    <WidgetCard
      className="h-full border-none shadow-none bg-transparent"
      padding="sm"
    >
      <div className="flex flex-col gap-6">
        {Object.entries(grouped).map(([category, views]) => (
          <div key={category} className="flex flex-col gap-1">
            <h3 className="px-3 text-xs font-medium text-[var(--ak-color-text-secondary)] uppercase tracking-wider mb-1">
              {category}
            </h3>
            <ul className="flex flex-col gap-1">
              {views.map((view) => {
                const isActive = view.id === activeView
                const Icon = view.icon
                return (
                  <li key={view.id}>
                    <AkListRow
                      accent="default"
                      selected={isActive}
                      title={view.label}
                      trailing={view.shortcut && (
                        <span className="text-xs text-gray-400 font-mono">
                          {view.shortcut}
                        </span>
                      )}
                      leading={
                        <Icon
                          className={clsx(
                            'h-5 w-5',
                            isActive
                              ? 'text-[var(--ak-color-text-primary)]'
                              : 'text-[var(--ak-color-text-secondary)]',
                          )}
                        />
                      }
                      onClick={() => onViewSelect(view.id)}
                    />
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}

export type { HotelView }

