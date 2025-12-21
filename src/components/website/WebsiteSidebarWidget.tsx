'use client'

import React, { useState, useMemo } from 'react'
import {
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  PaintBrushIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { SidebarHeader } from '@/components/ui/SidebarHeader'
import { SidebarFooter } from '@/components/ui/SidebarFooter'
import { 
  DrawerListRow, 
} from '@/components/ui/drawer-kit'

export type WebsiteView = 'overview' | 'conversations' | 'content' | 'appearance'

import type { ComponentType } from 'react'

const VIEWS: { id: WebsiteView; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Übersicht', icon: ChartBarIcon },
  { id: 'conversations', label: 'Gespräche', icon: ChatBubbleLeftRightIcon },
  { id: 'content', label: 'Wissen & Inhalt', icon: DocumentTextIcon },
  { id: 'appearance', label: 'Design & Widget', icon: PaintBrushIcon },
]

type WebsiteSidebarWidgetProps = {
  activeView: WebsiteView
  onViewSelect: (view: WebsiteView) => void
  onToggleInspector?: () => void
}

export function WebsiteSidebarWidget({
  activeView,
  onViewSelect,
  onToggleInspector,
}: WebsiteSidebarWidgetProps) {
  const [search, setSearch] = useState('')

  const filteredViews = useMemo(() => {
    if (!search) return VIEWS
    return VIEWS.filter(v => v.label.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  return (
    <div className="flex h-full flex-col bg-transparent">
      <SidebarHeader 
        title="Website-Bot" 
        onSearch={setSearch} 
        onToggleInspector={onToggleInspector} 
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

      <SidebarFooter 
        status={{ label: 'Ready', tone: 'success' }}
      />
    </div>
  )
}
