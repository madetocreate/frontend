'use client'

import React, { useState } from 'react'
import { SettingsView } from './SettingsSidebarWidget'
import { SettingsDashboard } from './SettingsDashboard'
import { AkDrawerScaffold } from '@/components/ui/AkDrawerScaffold'
import { AkIconButton } from '@/components/ui/AkIconButton'
import { Cog6ToothIcon, XMarkIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useAklowEscape } from '@/hooks/useAklowEscape'

interface SettingsDetailDrawerProps {
  view: SettingsView
  isOpen: boolean
  onClose: () => void
}

type SettingsMode = 'simple' | 'expert'

const VIEW_TITLES: Record<SettingsView, string> = {
  onboarding: 'Erste Schritte',
  general: 'Allgemeine Einstellungen',
  appearance: 'Aussehen',
  locale: 'Sprache & Zeit',
  notifications: 'Benachrichtigungen',
  collaboration: 'Teams & Zusammenarbeit',
  account: 'Mein Account',
  ai: 'KI & Modelle',
  agents: 'Agenten & Tools',
  addons: 'Add-ons',
  automations: 'KI-Vorschläge & Automatisierung',
  'kmu-templates': 'Quick Templates',
  'kmu-kb': 'Knowledge Base',
  'kmu-reports': 'Weekly Reports',
  'kmu-auto-reply': 'Auto-Reply Regeln',
  security: 'Sicherheit & Policies',
  database: 'Datenbank & Speicher',
  users: 'Benutzer & Rollen',
  billing: 'Abrechnung & Plan',
  modules: 'Module & Plan',
  integrations: 'Integrationen',
  telegram: 'Telegram Control',
  memory: 'KI-Gedächtnis',
  marketing: 'Marketing',
  website: 'Website Bot',
  reviews: 'Reviews',
  telephony: 'Telefonie',
}

export const SettingsDetailDrawer: React.FC<SettingsDetailDrawerProps> = ({
  view,
  isOpen,
  onClose,
}) => {
  const [mode, setMode] = useState<SettingsMode>('simple')
  
  useAklowEscape({ enabled: isOpen, onEscape: onClose })

  return (
    <div
      className={clsx(
        'fixed inset-y-0 right-0 lg:relative lg:inset-auto h-full flex flex-col border-l border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] transition-all duration-300 ease-in-out z-20',
        isOpen ? 'w-full lg:w-[calc(100vw-280px)] xl:w-[calc(100vw-560px)] opacity-100' : 'w-0 translate-x-full opacity-0 pointer-events-none'
      )}
    >
      <AkDrawerScaffold
        leading={
          <div className="w-8 h-8 rounded-lg bg-[var(--ak-color-accent-soft)] border border-[var(--ak-color-border-subtle)] flex items-center justify-center">
            <Cog6ToothIcon className="w-5 h-5 text-[var(--ak-color-accent)]" />
          </div>
        }
        title={VIEW_TITLES[view] || 'Einstellungen'}
        subtitle="Konfiguration & Präferenzen"
        trailing={
          <>
            <div className="flex items-center gap-2 bg-[var(--ak-color-bg-surface-muted)] rounded-lg p-1">
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
            <AkIconButton size="sm" variant="ghost" onClick={onClose} aria-label="Schließen">
              <XMarkIcon className="h-4 w-4" />
            </AkIconButton>
          </>
        }
        bodyClassName="flex flex-col h-full overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto ak-scrollbar">
          <SettingsDashboard view={view} mode={mode} onModeChange={setMode} externalMode />
        </div>
      </AkDrawerScaffold>
    </div>
  )
}

