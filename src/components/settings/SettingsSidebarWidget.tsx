'use client'

import React, { useState, useMemo } from 'react'
import {
  CpuChipIcon,
  ShieldCheckIcon,
  ServerIcon,
  UsersIcon,
  CreditCardIcon,
  AdjustmentsHorizontalIcon,
  GlobeAltIcon,
  PuzzlePieceIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  CircleStackIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { SidebarHeader } from '@/components/ui/SidebarHeader'
import { SidebarFooter } from '@/components/ui/SidebarFooter'
import { 
  DrawerSectionTitle, 
  DrawerListRow, 
} from '@/components/ui/drawer-kit'

export type SettingsView = 'onboarding' | 'general' | 'account' | 'ai' | 'agents' | 'security' | 'database' | 'users' | 'billing' | 'integrations' | 'marketplace' | 'memory'

import type { ComponentType } from 'react'

interface ViewItem {
  id: SettingsView
  label: string
  icon: ComponentType<{ className?: string }>
  category: string
}

const VIEWS: ViewItem[] = [
  { id: 'onboarding', label: 'Erste Schritte', icon: SparklesIcon, category: 'Einführung' },
  { id: 'account', label: 'Mein Account', icon: UserCircleIcon, category: 'Personal' },
  { id: 'general', label: 'Allgemein', icon: AdjustmentsHorizontalIcon, category: 'System' },
  { id: 'ai', label: 'KI & Modelle', icon: CpuChipIcon, category: 'System' },
  { id: 'agents', label: 'Agenten & Tools', icon: GlobeAltIcon, category: 'System' },
  { id: 'security', label: 'Sicherheit & Policies', icon: ShieldCheckIcon, category: 'Sicherheit' },
  { id: 'database', label: 'Datenbank & Speicher', icon: ServerIcon, category: 'Infrastruktur' },
  { id: 'memory', label: 'KI-Gedächtnis', icon: CircleStackIcon, category: 'Infrastruktur' },
  { id: 'users', label: 'Benutzer & Rollen', icon: UsersIcon, category: 'Organisation' },
  { id: 'billing', label: 'Abrechnung', icon: CreditCardIcon, category: 'Organisation' },
  { id: 'integrations', label: 'Integrationen', icon: PuzzlePieceIcon, category: 'Integrationen' },
  { id: 'marketplace', label: 'Marktplatz', icon: ShoppingBagIcon, category: 'Integrationen' },
]

const CATEGORY_ORDER = ['Einführung', 'Personal', 'System', 'Sicherheit', 'Infrastruktur', 'Organisation', 'Integrationen']

type SettingsSidebarWidgetProps = {
  activeView: SettingsView
  onViewSelect: (view: SettingsView) => void
  onToggleInspector?: () => void
}

export function SettingsSidebarWidget({
  activeView,
  onViewSelect,
  onToggleInspector,
}: SettingsSidebarWidgetProps) {
  const [search, setSearch] = useState('')

  const filteredViews = useMemo(() => {
    if (!search) return VIEWS
    return VIEWS.filter(v => 
      v.label.toLowerCase().includes(search.toLowerCase()) || 
      v.category.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const sortedCategories = useMemo(() => {
    const grouped = filteredViews.reduce((acc, view) => {
      if (!acc[view.category]) acc[view.category] = []
      acc[view.category].push(view)
      return acc
    }, {} as Record<string, ViewItem[]>)

    return Object.entries(grouped).sort(([a], [b]) => {
      const idxA = CATEGORY_ORDER.indexOf(a)
      const idxB = CATEGORY_ORDER.indexOf(b)
      if (idxA === -1) return 1
      if (idxB === -1) return -1
      return idxA - idxB
    })
  }, [filteredViews])

  return (
    <div className="flex h-full flex-col bg-transparent">
      <SidebarHeader 
        title="Einstellungen" 
        onSearch={setSearch} 
        onToggleInspector={onToggleInspector} 
      />

      <div className="flex-1 overflow-y-auto ak-scrollbar px-2 pb-4 mt-4">
        <div className="space-y-6">
          {sortedCategories.map(([category, views]) => (
            <div key={category}>
              <DrawerSectionTitle className="px-3">
                {category}
              </DrawerSectionTitle>
              <ul className="space-y-0.5">
                {views.map((view) => (
                  <li key={view.id}>
                    <DrawerListRow 
                      accent="settings"
                      selected={activeView === view.id}
                      title={<span className="text-[15px] font-medium">{view.label}</span>}
                      leading={<view.icon className="h-5 w-5" />}
                      className="py-3"
                      onClick={() => onViewSelect(view.id)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <SidebarFooter 
        status={{ label: 'v1.2.0', tone: 'neutral' }}
      />
    </div>
  )
}
