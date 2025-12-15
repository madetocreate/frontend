'use client'

import {
  MegaphoneIcon,
  ChartBarIcon,
  UserGroupIcon,
  CpuChipIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { AkListRow } from '@/components/ui/AkListRow'
import { WidgetCard } from '@/components/ui/WidgetCard'
import type { ComponentType } from 'react'

export type GrowthView = 'overview' | 'campaigns' | 'leads' | 'analytics' | 'automation'

const VIEWS: { id: GrowthView; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Übersicht', icon: PresentationChartLineIcon },
  { id: 'campaigns', label: 'Kampagnen', icon: MegaphoneIcon },
  { id: 'leads', label: 'Leads & Kontakte', icon: UserGroupIcon },
  { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
  { id: 'automation', label: 'Automatisierung', icon: CpuChipIcon },
]

type GrowthSidebarWidgetProps = {
  activeView: GrowthView
  onViewSelect: (view: GrowthView) => void
}

export function GrowthSidebarWidget({
  activeView,
  onViewSelect,
}: GrowthSidebarWidgetProps) {
  return (
    <WidgetCard
      className="h-full border-none shadow-none bg-transparent"
      padding="sm"
    >
      <ul className="flex flex-col gap-1">
        {VIEWS.map((view) => {
          const isActive = view.id === activeView
          const Icon = view.icon
          return (
            <li key={view.id}>
              <AkListRow
                accent="growth"
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
    </WidgetCard>
  )
}
