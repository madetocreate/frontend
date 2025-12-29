'use client'

import React, { useState, useMemo } from 'react'
import {
  MegaphoneIcon,
  ChartBarIcon,
  UserGroupIcon,
  CpuChipIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/24/outline'
import { SidebarHeader } from '@/components/ui/SidebarHeader'
import { SidebarFooter } from '@/components/ui/SidebarFooter'
import { 
  DrawerSectionTitle, 
  DrawerListRow
} from '@/components/ui/drawer-kit'
import type { ComponentType } from 'react'

export type GrowthView = 'overview' | 'campaigns' | 'leads' | 'contacts' | 'analytics' | 'automation'

const VIEWS: { id: GrowthView; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Übersicht', icon: PresentationChartLineIcon },
  { id: 'campaigns', label: 'Kampagnen', icon: MegaphoneIcon },
  { id: 'leads', label: 'Leads', icon: UserGroupIcon },
  { id: 'contacts', label: 'Kontakte', icon: UserGroupIcon },
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
  const [search, setSearch] = useState('')

  const filteredViews = useMemo(() => {
    if (!search) return VIEWS
    return VIEWS.filter(v => v.label.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  return (
    <div className="flex h-full flex-col bg-transparent">
      <SidebarHeader 
        title="Wachstum" 
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
                      accent="growth"
                      selected={isActive}
                      title={<span className="text-[15px] font-medium">{view.label}</span>}
                      leading={<Icon className="h-5 w-5" />}
                      className="py-3"
                      onClick={() => onViewSelect(view.id)}
                    />
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="flex flex-col gap-0.5">
            <DrawerSectionTitle className="px-3">Favoriten</DrawerSectionTitle>
            <ul className="flex flex-col gap-0.5">
              <li>
                <DrawerListRow
                  title={<span className="text-[14px]">Q4 Performance</span>}
                  leading={<ChartBarIcon className="h-4 w-4 text-[var(--ak-color-text-secondary)]" />}
                  onClick={() => {
                    onViewSelect('analytics')
                    // Dispatch specific context
                    window.dispatchEvent(new CustomEvent('aklow-show-context-card', {
                      detail: { type: 'growth', item: null, id: 'analytics-q4' }
                    }))
                  }}
                />
              </li>
              <li>
                <DrawerListRow
                  title={<span className="text-[14px]">Lead Gen Pipeline</span>}
                  leading={<UserGroupIcon className="h-4 w-4 text-[var(--ak-color-text-secondary)]" />}
                  onClick={() => {
                    onViewSelect('leads')
                    window.dispatchEvent(new CustomEvent('aklow-show-context-card', {
                      detail: { type: 'growth', item: null, id: 'leads-pipeline' }
                    }))
                  }}
                />
              </li>
            </ul>
          </div>
        </div>
      </div>

      <SidebarFooter 
        primaryAction={{
          label: 'Neue Kampagne',
          icon: MegaphoneIcon,
          onClick: () => {}
        }}
      />
    </div>
  )
}
