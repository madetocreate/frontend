'use client'

import { useState } from 'react'
import { SettingsView } from './SettingsSidebarWidget'
import { SettingsGeneral } from './SettingsGeneral'
import { SettingsAI } from './SettingsAI'
import { SettingsAgents } from './SettingsAgents'
import { SettingsSecurity } from './SettingsSecurity'
import { SettingsDatabase } from './SettingsDatabase'
import { SettingsUsers } from './SettingsUsers'
import { SettingsBilling } from './SettingsBilling'
import { SettingsIntegrations } from './SettingsIntegrations'
import { SettingsMarketplace } from './SettingsMarketplace'
import { SettingsAccount } from './SettingsAccount'
import clsx from 'clsx'

type SettingsMode = 'simple' | 'expert'

export function SettingsDashboard({ view }: { view: SettingsView }) {
  const [mode, setMode] = useState<SettingsMode>('simple')

  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--ak-color-bg-app)]">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[var(--ak-color-border-hairline)] bg-[var(--ak-glass-bg)] px-6 backdrop-blur-[var(--ak-glass-blur)]">
          <h1 className="text-xl font-semibold text-[var(--ak-color-text-primary)] tracking-tight">
          {view === 'general' && 'Allgemeine Einstellungen'}
          {view === 'account' && 'Mein Account'}
          {view === 'ai' && 'KI & Modelle'}
          {view === 'agents' && 'Agenten Konfiguration'}
          {view === 'security' && 'Sicherheit & Policies'}
          {view === 'database' && 'Datenbank & Speicher'}
          {view === 'users' && 'Benutzerverwaltung'}
          {view === 'billing' && 'Abrechnung & Plan'}
          {view === 'integrations' && 'Integrationen'}
          {view === 'marketplace' && 'Marktplatz'}
        </h1>
        
        {/* Mode Switcher - Apple Style */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setMode('simple')}
            className={clsx(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
              mode === 'simple'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Einfach
          </button>
          <button
            onClick={() => setMode('expert')}
            className={clsx(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
              mode === 'expert'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Experte
          </button>
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto h-[calc(100vh-64px)]">
        {view === 'general' && <SettingsGeneral mode={mode} />}
        {view === 'account' && <SettingsAccount mode={mode} />}
        {view === 'ai' && <SettingsAI mode={mode} />}
        {view === 'agents' && <SettingsAgents mode={mode} />}
        {view === 'security' && <SettingsSecurity mode={mode} />}
        {view === 'database' && <SettingsDatabase mode={mode} />}
        {view === 'users' && <SettingsUsers mode={mode} />}
        {view === 'billing' && <SettingsBilling mode={mode} />}
        {view === 'integrations' && <SettingsIntegrations mode={mode} />}
        {view === 'marketplace' && <SettingsMarketplace mode={mode} />}
      </main>
    </div>
  )
}
