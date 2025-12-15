'use client'

import clsx from 'clsx'
import {
  Squares2X2Icon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { AkListRow } from '@/components/ui/AkListRow'
import { WidgetCard } from '@/components/ui/WidgetCard'
import type { RealEstateView } from './RealEstateDashboard'

const VIEWS: { id: RealEstateView; label: string; icon: typeof Squares2X2Icon; category: string }[] = [
  { id: 'overview', label: 'Übersicht', icon: Squares2X2Icon, category: 'Haupt' },
  { id: 'properties', label: 'Immobilien', icon: BuildingOfficeIcon, category: 'Haupt' },
  { id: 'leads', label: 'Leads', icon: UserGroupIcon, category: 'Haupt' },
  { id: 'calendar', label: 'Besichtigungen', icon: CalendarIcon, category: 'Haupt' },
  { id: 'documents', label: 'Exposés', icon: DocumentTextIcon, category: 'Haupt' },
  { id: 'settings', label: 'Einstellungen', icon: Cog6ToothIcon, category: 'Verwaltung' },
]

type RealEstateSidebarWidgetProps = {
  activeView: RealEstateView
  onViewSelect: (view: RealEstateView) => void
}

export function RealEstateSidebarWidget({
  activeView,
  onViewSelect,
}: RealEstateSidebarWidgetProps) {
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
                      accent="neutral"
                      selected={isActive}
                      title={view.label}
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

export type { RealEstateView }

