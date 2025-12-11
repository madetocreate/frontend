'use client'

import { useState } from 'react'
import clsx from 'clsx'
import {
  Cog6ToothIcon,
  ArchiveBoxIcon,
  EnvelopeIcon,
  SparklesIcon,
  CodeBracketSquareIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  KeyIcon,
  UserCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline'

type SettingsCategory =
  | 'general'
  | 'memory_crm'
  | 'notifications'
  | 'personalization'
  | 'apps_connectors'
  | 'schedules'
  | 'data_controls'
  | 'security'
  | 'parental'
  | 'account'

type CategoryConfig = {
  id: SettingsCategory
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const CATEGORIES: CategoryConfig[] = [
  { id: 'general', label: 'Allgemein', icon: Cog6ToothIcon },
  { id: 'memory_crm', label: 'Speicher & CRM', icon: ArchiveBoxIcon },
  { id: 'notifications', label: 'Benachrichtigungen', icon: EnvelopeIcon },
  { id: 'personalization', label: 'Personalisierung', icon: SparklesIcon },
  { id: 'apps_connectors', label: 'Apps & Konnektoren', icon: CodeBracketSquareIcon },
  { id: 'schedules', label: 'Zeitpläne', icon: CalendarDaysIcon },
  { id: 'data_controls', label: 'Datenkontrollen', icon: DocumentTextIcon },
  { id: 'security', label: 'Sicherheit', icon: KeyIcon },
  { id: 'parental', label: 'Kindersicherung', icon: UserCircleIcon },
  { id: 'account', label: 'Konto', icon: UserIcon },
]

type SettingsSidebarWidgetProps = {
  onCategorySelect?: (category: SettingsCategory | null) => void
}

export function SettingsSidebarWidget({ onCategorySelect }: SettingsSidebarWidgetProps) {
  const [selectedCategory, setSelectedCategory] = useState<SettingsCategory | null>(null)

  const handleCategoryClick = (category: SettingsCategory) => {
    setSelectedCategory(category)
    if (onCategorySelect) {
      onCategorySelect(category)
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 px-3 py-3">
      <h2 className="ak-heading">Einstellungen</h2>
      <ul className="flex flex-col gap-2">
        {CATEGORIES.map((category) => {
          const Icon = category.icon
          const isActive = selectedCategory === category.id

          return (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => handleCategoryClick(category.id)}
                className="relative flex w-full items-center gap-3"
              >
                {/* Linker Akzent-Streifen */}
                <div
                  className={clsx(
                    'h-7 w-0.5 rounded-full transition-colors duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
                    isActive ? 'bg-slate-300' : 'bg-transparent'
                  )}
                />
                {/* Haupt-Button-Bereich */}
                <div
                  className={clsx(
                    'flex flex-1 items-center gap-2 rounded-xl px-3 py-2 transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
                    isActive
                      ? 'bg-[var(--ak-color-bg-surface-muted)]'
                      : 'bg-transparent hover:bg-[var(--ak-color-bg-surface-muted)]/50'
                  )}
                >
                  <Icon
                    className={clsx(
                      'h-5 w-5 transition-colors duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
                      isActive
                        ? 'text-[var(--ak-color-text-primary)]'
                        : 'text-[var(--ak-color-text-secondary)]'
                    )}
                  />
                  {/* Kleiner Punkt-Indikator */}
                  <div
                    className={clsx(
                      'h-1.5 w-1.5 rounded-full transition-colors duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
                      isActive ? 'bg-slate-300' : 'bg-transparent'
                    )}
                  />
                  <span
                    className={clsx(
                      'ak-body transition-colors duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
                      isActive
                        ? 'font-semibold text-[var(--ak-color-text-primary)]'
                        : 'font-normal text-[var(--ak-color-text-secondary)]'
                    )}
                  >
                    {category.label}
                  </span>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

