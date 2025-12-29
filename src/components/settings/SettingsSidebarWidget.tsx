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
  UserCircleIcon,
  CircleStackIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  BoltIcon,
  DocumentDuplicateIcon,
  ChatBubbleLeftEllipsisIcon,
  BookOpenIcon,
  ChartBarIcon,
  PaintBrushIcon,
  LanguageIcon,
  BellIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { SidebarHeader } from '@/components/ui/SidebarHeader'
import { SidebarFooter } from '@/components/ui/SidebarFooter'
import { 
  DrawerSectionTitle, 
  DrawerListRow, 
} from '@/components/ui/drawer-kit'

export type SettingsView =
  | 'onboarding'
  | 'general'
  | 'appearance'
  | 'locale'
  | 'notifications'
  | 'collaboration'
  | 'account'
  | 'ai'
  | 'agents'
  | 'security'
  | 'database'
  | 'users'
  | 'billing'
  | 'modules'
  | 'integrations'
  | 'memory'
  | 'automations'
  | 'kmu-templates'
  | 'kmu-kb'
  | 'kmu-reports'
  | 'kmu-auto-reply'

import type { ComponentType } from 'react'

interface ViewItem {
  id: SettingsView
  label: string
  icon: ComponentType<{ className?: string }>
  category: string
}

const VIEWS: ViewItem[] = [
  // Einführung
  { id: 'onboarding', label: 'Erste Schritte', icon: SparklesIcon, category: 'Einführung' },
  
  // Konto
  { id: 'account', label: 'Mein Account', icon: UserCircleIcon, category: 'Konto' },
  
  // Aussehen
  { id: 'appearance', label: 'Aussehen', icon: PaintBrushIcon, category: 'Aussehen' },
  
  // Sprache & Region
  { id: 'locale', label: 'Sprache & Region', icon: LanguageIcon, category: 'Sprache & Region' },
  
  // Benachrichtigungen
  { id: 'notifications', label: 'Benachrichtigungen', icon: BellIcon, category: 'Benachrichtigungen' },
  
  // KI
  { id: 'ai', label: 'KI', icon: CpuChipIcon, category: 'KI' },
  { id: 'memory', label: 'KI-Gedächtnis', icon: CircleStackIcon, category: 'KI' },
  { id: 'agents', label: 'Agenten', icon: GlobeAltIcon, category: 'KI' },
  
  // Team
  { id: 'collaboration', label: 'Teams', icon: UserGroupIcon, category: 'Team' },
  { id: 'users', label: 'Nutzer & Rollen', icon: UsersIcon, category: 'Team' },
  
  // Integrationen
  { id: 'integrations', label: 'Integrationen', icon: PuzzlePieceIcon, category: 'Integrationen' },
  
  // Plan & Module
  { id: 'modules', label: 'Module & Plan', icon: CreditCardIcon, category: 'Plan & Module' },
  { id: 'billing', label: 'Abrechnung', icon: CreditCardIcon, category: 'Plan & Module' },
  
  // Sicherheit
  { id: 'security', label: 'Sicherheit', icon: ShieldCheckIcon, category: 'Sicherheit' },
  
  // Erweitert
  { id: 'general', label: 'Allgemein', icon: AdjustmentsHorizontalIcon, category: 'Erweitert' },
  { id: 'database', label: 'Daten & Speicher', icon: ServerIcon, category: 'Erweitert' },
  { id: 'automations', label: 'KI-Vorschläge', icon: BoltIcon, category: 'Erweitert' },
  
  // KMU Tools
  { id: 'kmu-templates', label: 'Vorlagen', icon: DocumentDuplicateIcon, category: 'KMU Tools' },
  { id: 'kmu-kb', label: 'Wissensdatenbank', icon: BookOpenIcon, category: 'KMU Tools' },
  { id: 'kmu-reports', label: 'Wochenberichte', icon: ChartBarIcon, category: 'KMU Tools' },
  { id: 'kmu-auto-reply', label: 'Auto-Antworten', icon: BoltIcon, category: 'KMU Tools' },
]

const CATEGORY_ORDER = ['Einführung', 'Konto', 'Aussehen', 'Sprache & Region', 'Benachrichtigungen', 'KI', 'Team', 'Integrationen', 'Plan & Module', 'Sicherheit', 'Erweitert', 'KMU Tools']

type SettingsSidebarWidgetProps = {
  activeView: SettingsView
  onViewSelect: (view: SettingsView) => void
}

export function SettingsSidebarWidget({
  activeView,
  onViewSelect,
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
        primaryAction={{
          label: 'Erste Schritte',
          icon: SparklesIcon,
          onClick: () => {
            onViewSelect('onboarding')
          }
        }}
      />
    </div>
  )
}

export default SettingsSidebarWidget
