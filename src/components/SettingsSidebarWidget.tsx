'use client'

import clsx from 'clsx'
import { useEffect, useState } from 'react'
import {
  UserCircleIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  BellIcon,
  KeyIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline'

import { AkListRow } from '@/components/ui/AkListRow'
import { WidgetCard } from '@/components/ui/WidgetCard'

type SettingCategory = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const CATEGORIES: SettingCategory[] = [
  { id: 'account', label: 'Account', icon: UserCircleIcon },
  { id: 'preferences', label: 'Preferences', icon: Cog6ToothIcon },
  { id: 'billing', label: 'Billing', icon: CreditCardIcon },
  { id: 'notifications', label: 'Notifications', icon: BellIcon },
  { id: 'api', label: 'API Keys', icon: KeyIcon },
  { id: 'security', label: 'Security', icon: ShieldCheckIcon },
  { id: 'integrations', label: 'Integrations', icon: GlobeAltIcon },
]

type SettingsSidebarWidgetProps = {
  onCategorySelect?: (categoryId: string) => void
}

export function SettingsSidebarWidget({
  onCategorySelect,
}: SettingsSidebarWidgetProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(CATEGORIES[0]?.id || 'account')

  useEffect(() => {
    onCategorySelect?.(activeCategoryId)
  }, [activeCategoryId, onCategorySelect])

  return (
    <WidgetCard
      title="Einstellungen"
      subtitle="Account, Team, Integrationen"
      className="h-full"
      padding="sm"
    >
      <ul className="flex flex-col gap-1">
        {CATEGORIES.map((category) => {
          const isActive = category.id === activeCategoryId
          const Icon = category.icon
          return (
            <li key={category.id}>
              <AkListRow
                accent="settings"
                selected={isActive}
                accentBar={isActive}
                title={category.label}
                leading={
                  <Icon
                    className={clsx(
                      'h-5 w-5',
                      isActive
                        ? 'text-[var(--ak-color-text)]'
                        : 'text-[var(--ak-color-text-secondary)]',
                    )}
                  />
                }
                trailing={
                  isActive ? (
                    <span className="h-2 w-2 rounded-full bg-[var(--ak-color-selected-strong)]" />
                  ) : null
                }
                onClick={() => setActiveCategoryId(category.id)}
              />
            </li>
          )
        })}
      </ul>
    </WidgetCard>
  )
}
