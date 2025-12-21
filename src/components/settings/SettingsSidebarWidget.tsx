'use client'

import clsx from 'clsx'
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
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { AkListRow } from '@/components/ui/AkListRow'
import { WidgetCard } from '@/components/ui/WidgetCard'

export type SettingsView = 'general' | 'account' | 'ai' | 'agents' | 'security' | 'database' | 'users' | 'billing' | 'integrations' | 'marketplace'

import type { ComponentType } from 'react'

const VIEWS: { id: SettingsView; label: string; icon: ComponentType<{ className?: string }>; category: string }[] = [
  { id: 'general', label: 'Allgemein', icon: AdjustmentsHorizontalIcon, category: 'System' },
  { id: 'account', label: 'Mein Account', icon: UserCircleIcon, category: 'System' },
  { id: 'ai', label: 'KI & Modelle', icon: CpuChipIcon, category: 'System' },
  { id: 'agents', label: 'Agenten & Tools', icon: GlobeAltIcon, category: 'System' },
  { id: 'security', label: 'Sicherheit & Policies', icon: ShieldCheckIcon, category: 'Sicherheit' },
  { id: 'database', label: 'Datenbank & Speicher', icon: ServerIcon, category: 'Infrastruktur' },
  { id: 'users', label: 'Benutzer & Rollen', icon: UsersIcon, category: 'Organisation' },
  { id: 'billing', label: 'Abrechnung', icon: CreditCardIcon, category: 'Organisation' },
  { id: 'integrations', label: 'Integrationen', icon: PuzzlePieceIcon, category: 'Integrationen' },
  { id: 'marketplace', label: 'Marktplatz', icon: ShoppingBagIcon, category: 'Integrationen' },
]

type SettingsSidebarWidgetProps = {
  activeView: SettingsView
  onViewSelect: (view: SettingsView) => void
}

export function SettingsSidebarWidget({
  activeView,
  onViewSelect,
}: SettingsSidebarWidgetProps) {
  // Group by category
  const grouped = VIEWS.reduce((acc, view) => {
    if (!acc[view.category]) acc[view.category] = []
    acc[view.category].push(view)
    return acc
  }, {} as Record<string, typeof VIEWS>)

  return (
    <WidgetCard
      className="h-full border-none shadow-none bg-transparent"
      padding="sm"
    >
      <div className="flex flex-col gap-6">
        {Object.entries(grouped).map(([category, views]) => (
          <div key={category} className="flex flex-col gap-1">
            <h3 className="px-3 text-xs font-medium text-[var(--ak-color-text-secondary)] uppercase tracking-wider mb-1">
              {category}
            </h3>
            <ul className="flex flex-col gap-1">
              {views.map((view) => {
                const isActive = view.id === activeView
                const Icon = view.icon
                return (
                  <li key={view.id}>
                    <AkListRow
                      accent="graphite"
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
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}
