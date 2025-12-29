'use client'

import React, { useState, useMemo } from 'react'
import {
  HomeIcon,
  ServerStackIcon,
  ShieldCheckIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline'
import { SidebarHeader } from '@/components/ui/SidebarHeader'
import { SidebarFooter } from '@/components/ui/SidebarFooter'
import { 
  DrawerListRow, 
} from '@/components/ui/drawer-kit'

export type ShieldView = 'overview' | 'registry' | 'policies' | 'logs'

import type { ComponentType } from 'react'

const VIEWS: { id: ShieldView; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Übersicht', icon: HomeIcon },
  { id: 'registry', label: 'MCP Registry', icon: ServerStackIcon },
  { id: 'policies', label: 'Policies', icon: ShieldCheckIcon },
  { id: 'logs', label: 'Logs & Tracing', icon: CommandLineIcon },
]

type ShieldSidebarWidgetProps = {
  activeView: ShieldView
  onViewSelect: (view: ShieldView) => void
}

export function ShieldSidebarWidget({
  activeView,
  onViewSelect,
}: ShieldSidebarWidgetProps) {
  const [search, setSearch] = useState('')

  const filteredViews = useMemo(() => {
    if (!search) return VIEWS
    return VIEWS.filter(v => v.label.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  return (
    <div className="flex h-full flex-col bg-transparent">
      <SidebarHeader 
        title="AI-Shield" 
        onSearch={setSearch} 
      />

      <div className="flex-1 overflow-y-auto ak-scrollbar px-2 pb-4 mt-4">
        <ul className="flex flex-col gap-0.5">
          {filteredViews.map((view) => {
            const isActive = view.id === activeView
            const Icon = view.icon
            return (
              <li key={view.id}>
                <DrawerListRow
                  accent="settings"
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

      <SidebarFooter 
        primaryAction={{
          label: 'Policy prüfen',
          icon: ShieldCheckIcon,
          onClick: () => {
            onViewSelect('policies')
          }
        }}
      />
    </div>
  )
}
