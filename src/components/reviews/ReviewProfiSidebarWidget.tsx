'use client'

import React, { useState, useMemo } from 'react'
import {
  Squares2X2Icon,
  StarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { SidebarHeader } from '@/components/ui/SidebarHeader'
import { SidebarFooter } from '@/components/ui/SidebarFooter'
import { 
  DrawerListRow
} from '@/components/ui/drawer-kit'
import type { ReviewProfiView } from './ReviewProfiDashboard'

import type { ComponentType } from 'react'

const VIEWS: { id: ReviewProfiView; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Übersicht', icon: Squares2X2Icon },
  { id: 'reviews', label: 'Logs', icon: StarIcon },
  { id: 'settings', label: 'Konfiguration', icon: Cog6ToothIcon },
]

type ReviewProfiSidebarWidgetProps = {
  activeView: ReviewProfiView
  onViewSelect: (view: ReviewProfiView) => void
}

export function ReviewProfiSidebarWidget({
  activeView,
  onViewSelect,
}: ReviewProfiSidebarWidgetProps) {
  const [search, setSearch] = useState('')

  const filteredViews = useMemo(() => {
    if (!search) return VIEWS
    return VIEWS.filter(v => v.label.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  return (
    <div className="flex h-full flex-col bg-transparent">
      <SidebarHeader 
        title="ReviewBot" 
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
                  accent="primary"
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
  )
}
