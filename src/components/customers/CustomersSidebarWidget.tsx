'use client'

import React, { useState, useMemo } from 'react'
import {
  UserGroupIcon,
  FunnelIcon,
  UserPlusIcon,
  ArchiveBoxIcon,
  StarIcon,
  ClockIcon,
  ExclamationCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { SidebarHeader } from '@/components/ui/SidebarHeader'
import { SidebarFooter } from '@/components/ui/SidebarFooter'
import { AkBadge } from '@/components/ui/AkBadge'
import { 
  DrawerSectionTitle, 
  DrawerListRow
} from '@/components/ui/drawer-kit'
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
  onViewSelect,
}: CustomersSidebarWidgetProps) {
  const [search, setSearch] = useState('')

  const filteredViews = useMemo(() => {
    if (!search) return VIEWS
    return VIEWS.filter(v => v.label.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  return (
    <div className="flex h-full flex-col bg-transparent">
      <SidebarHeader 
        title="Kunden" 
        onSearch={setSearch} 
      />

      <div className="flex-1 overflow-y-auto ak-scrollbar px-2 pb-4 mt-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-0.5">
            <ul className="flex flex-col gap-0.5">
              {filteredViews.map((view) => {
                const isActive = view.id === activeView
                const Icon = view.icon
                return (
                  <li key={view.id}>
                    <DrawerListRow
                      accent="primary"
                      selected={isActive}
                      title={<span className="text-[15px] font-medium">{view.label}</span>}
                      leading={<Icon className="h-5 w-5" />}
                      className="py-3"
                      onClick={() => onViewSelect?.(view.id)}
                    />
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="flex flex-col gap-0.5">
            <DrawerSectionTitle className="px-3">Smart Segments</DrawerSectionTitle>
            <ul className="flex flex-col gap-0.5">
              <li>
                <DrawerListRow
                  title={<span className="text-[14px]">VIP Kunden</span>}
                  leading={<StarIcon className="h-4 w-4 text-[var(--ak-color-text-secondary)]" />}
                  trailing={<AkBadge tone="muted" size="sm">12</AkBadge>}
                  onClick={() => onViewSelect?.('active')}
                />
              </li>
              <li>
                <DrawerListRow
                  title={<span className="text-[14px]">Neu (30 Tage)</span>}
                  leading={<ClockIcon className="h-4 w-4 text-[var(--ak-color-text-secondary)]" />}
                  trailing={<AkBadge tone="muted" size="sm">5</AkBadge>}
                  onClick={() => onViewSelect?.('all')}
                />
              </li>
              <li>
                <DrawerListRow
                  title={<span className="text-[14px]">Risiko</span>}
                  leading={<ExclamationCircleIcon className="h-4 w-4 text-[var(--ak-color-text-danger)]" />}
                  trailing={<AkBadge tone="muted" size="sm">3</AkBadge>}
                  onClick={() => onViewSelect?.('opportunities')}
                />
              </li>
            </ul>
          </div>
        </div>
      </div>

      <SidebarFooter 
        primaryAction={{
          label: 'Neuer Kunde',
          icon: PlusIcon,
          onClick: () => {}
        }}
      />
    </div>
  )
}
