'use client'

import React, { useState } from 'react'
import { SettingsView } from './SettingsSidebarWidget'
import { SettingsDashboard } from './SettingsDashboard'
import { AkDrawerScaffold } from '@/components/ui/AkDrawerScaffold'
import { InspectorHeader } from '@/components/ui/drawer-kit/InspectorHeader'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

interface SettingsDetailDrawerProps {
  view: SettingsView
  isOpen: boolean
  onClose: () => void
}

type SettingsMode = 'simple' | 'expert'

const VIEW_TITLES: Record<SettingsView, string> = {
  onboarding: 'Erste Schritte',
  general: 'Allgemeine Einstellungen',
  account: 'Mein Account',
  ai: 'KI & Modelle',
  agents: 'Agenten & Tools',
  security: 'Sicherheit & Policies',
  database: 'Datenbank & Speicher',
  users: 'Benutzer & Rollen',
  billing: 'Abrechnung & Plan',
  integrations: 'Integrationen',
  marketplace: 'Marktplatz',
  memory: 'KI-Gedächtnis',
}

export const SettingsDetailDrawer: React.FC<SettingsDetailDrawerProps> = ({
  view,
  isOpen,
  onClose,
}) => {
  const [mode, setMode] = useState<SettingsMode>('simple')

  return (
    <div
      className={clsx(
        'fixed inset-y-0 right-0 lg:relative lg:inset-auto h-full flex flex-col border-l border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] transition-all duration-300 ease-in-out z-20',
        isOpen ? 'w-full lg:w-[calc(100vw-280px)] xl:w-[calc(100vw-560px)] opacity-100' : 'w-0 translate-x-full opacity-0 pointer-events-none'
      )}
    >
      <AkDrawerScaffold
        header={
          <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-[var(--ak-color-border-subtle)]">
            <div className="flex-1 min-w-0">
              <InspectorHeader
                icon={Cog6ToothIcon}
                title={VIEW_TITLES[view] || 'Einstellungen'}
                subtitle="Konfiguration & Präferenzen"
                onClose={onClose}
              />
            </div>
            {/* Mode Switcher */}
            <div className="flex items-center gap-2 bg-[var(--ak-color-bg-surface-muted)] rounded-lg p-1 flex-shrink-0">
              <button
                onClick={() => setMode('simple')}
                className={clsx(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                  mode === 'simple'
                    ? 'bg-[var(--ak-color-bg-elevated)] text-[var(--ak-color-text-primary)] shadow-sm'
                    : 'text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)]'
                )}
              >
                Einfach
              </button>
              <button
                onClick={() => setMode('expert')}
                className={clsx(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                  mode === 'expert'
                    ? 'bg-[var(--ak-color-bg-elevated)] text-[var(--ak-color-text-primary)] shadow-sm'
                    : 'text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)]'
                )}
              >
                Experte
              </button>
            </div>
          </div>
        }
        title={null}
        headerClassName="!p-0"
        bodyClassName="flex flex-col h-full overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto ak-scrollbar">
          <SettingsDashboard view={view} mode={mode} onModeChange={setMode} externalMode />
        </div>
      </AkDrawerScaffold>
    </div>
  )
}

