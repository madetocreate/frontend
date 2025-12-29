'use client'

import React, { useState, useMemo } from 'react'
import {
  PhoneIcon,
  TableCellsIcon,
  Cog6ToothIcon,
  QueueListIcon,
  MicrophoneIcon,
} from '@heroicons/react/24/outline'
import { SidebarHeader } from '@/components/ui/SidebarHeader'
import { SidebarFooter } from '@/components/ui/SidebarFooter'
import { 
  DrawerListRow
} from '@/components/ui/drawer-kit'

export type TelephonyView = 'overview' | 'logs' | 'numbers' | 'configuration' | 'settings'

import type { ComponentType } from 'react'

const VIEWS: { id: TelephonyView; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Übersicht', icon: PhoneIcon },
  { id: 'logs', label: 'Logs', icon: QueueListIcon },
  { id: 'numbers', label: 'Rufnummern', icon: TableCellsIcon },
  { id: 'configuration', label: 'Konfiguration', icon: Cog6ToothIcon },
]

type TelephonySidebarWidgetProps = {
  activeView: TelephonyView
  onViewSelect: (view: TelephonyView) => void
}

export function TelephonySidebarWidget({
  activeView,
  onViewSelect,
}: TelephonySidebarWidgetProps) {
  const [search, setSearch] = useState('')

  const filteredViews = useMemo(() => {
    if (!search) return VIEWS
    return VIEWS.filter(v => v.label.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  return (
    <div className="flex h-full flex-col bg-transparent">
      <SidebarHeader 
        title="Telefon-Bot" 
        onSearch={setSearch} 
      />

      <div className="flex-1 overflow-y-auto ak-scrollbar px-2 pb-4 mt-4">
        <div className="flex flex-col gap-6">
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
      </div>

      <SidebarFooter 
        primaryAction={{
          label: 'Realtime Voice',
          icon: MicrophoneIcon,
          onClick: () => {}
        }}
      />
    </div>
  )
}
