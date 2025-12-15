'use client'

import clsx from 'clsx'
import {
  UserGroupIcon,
  FunnelIcon,
  UserPlusIcon,
  ArchiveBoxIcon,
  StarIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import { AkListRow } from '@/components/ui/AkListRow'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkBadge } from '@/components/ui/AkBadge'
import type { ComponentType } from 'react'

export type CustomersView = 'all' | 'opportunities' | 'active' | 'archived'

const VIEWS: { id: CustomersView; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'Alle Kunden', icon: UserGroupIcon },
  { id: 'opportunities', label: 'Chancen', icon: FunnelIcon },
  { id: 'active', label: 'Aktive', icon: UserPlusIcon },
  { id: 'archived', label: 'Archiviert', icon: ArchiveBoxIcon },
]

type CustomersSidebarWidgetProps = {
  activeView?: CustomersView
  onViewSelect?: (view: CustomersView) => void
  onCustomerClick?: (customerId: string) => void
  onOverviewClick?: () => void
}

export function CustomersSidebarWidget({
  activeView = 'all',
  onViewSelect
}: CustomersSidebarWidgetProps) {
  return (
    <WidgetCard
      className="h-full border-none shadow-none bg-transparent"
      padding="sm"
    >
      <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="px-3 text-xs font-medium text-[var(--ak-color-text-secondary)] uppercase tracking-wider mb-1">
              Listen
            </h3>
            <ul className="flex flex-col gap-1">
              {VIEWS.map((view) => {
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
                      onClick={() => onViewSelect?.(view.id)}
                    />
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="px-3 text-xs font-medium text-[var(--ak-color-text-secondary)] uppercase tracking-wider mb-1">
              Segmente
            </h3>
             <ul className="flex flex-col gap-1">
                <li>
                    <AkListRow
                        title="VIP Kunden"
                        leading={<StarIcon className="h-4 w-4 text-yellow-500" />}
                        trailing={<AkBadge tone="neutral" size="sm">12</AkBadge>}
                        onClick={() => {}}
                    />
                </li>
                <li>
                    <AkListRow
                        title="Neu (30 Tage)"
                        leading={<ClockIcon className="h-4 w-4 text-blue-500" />}
                        trailing={<AkBadge tone="neutral" size="sm">5</AkBadge>}
                        onClick={() => {}}
                    />
                </li>
                <li>
                    <AkListRow
                        title="Risiko"
                        leading={<ExclamationCircleIcon className="h-4 w-4 text-red-500" />}
                        trailing={<AkBadge tone="neutral" size="sm">3</AkBadge>}
                        onClick={() => {}}
                    />
                </li>
             </ul>
          </div>
      </div>
    </WidgetCard>
  )
}
