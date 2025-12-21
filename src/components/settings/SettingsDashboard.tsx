'use client'

import { useState, useEffect } from 'react'
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
import { SettingsOnboarding } from './SettingsOnboarding'
import { SettingsTestPanel } from './SettingsTestPanel'
import { StorageShell } from '@/modules/settings/storage/StorageShell'
import clsx from 'clsx'

type SettingsMode = 'simple' | 'expert'

export function SettingsDashboard({ view, mode: externalMode, onModeChange, externalMode: externalModeFlag = false }: { view: SettingsView; mode?: SettingsMode; onModeChange?: (mode: SettingsMode) => void; externalMode?: boolean }) {
  const [internalMode, setInternalMode] = useState<SettingsMode>(externalMode || 'simple')
  
  const mode = externalMode ?? internalMode
  const setMode = (value: SettingsMode) => {
    setInternalMode(value)
    onModeChange?.(value)
  }
  
  // Auto-switch to onboarding if first time user
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('aklow_onboarding_complete')
    if (!hasSeenOnboarding && view === 'general') {
      // Auto-navigate to onboarding - will be handled by parent component
    }
  }, [view])

  if (view === 'memory') {
    return (
      <div className="h-full w-full flex flex-col bg-[var(--ak-color-bg-app)]">
        <header className="flex h-16 items-center justify-between border-b border-[var(--ak-color-border-hairline)] bg-[var(--ak-glass-bg)] px-6 backdrop-blur-[var(--ak-glass-blur)] shrink-0">
          <h1 className="text-xl font-semibold text-[var(--ak-color-text-primary)] tracking-tight">
            KI-Speicher & Gedächtnis
          </h1>
        </header>
        <div className="flex-1 overflow-hidden">
          <StorageShell />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--ak-color-bg-app)]">
      {/* Only show header if not in drawer (will be handled by drawer header) */}
      {false && (
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-[var(--ak-glass-bg)] px-6 backdrop-blur-[var(--ak-glass-blur)] border-b border-[var(--ak-color-border-subtle)]">
          <h1 className="text-xl font-semibold text-[var(--ak-color-text-primary)] tracking-tight">
          {view === 'onboarding' && 'Erste Schritte'}
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
        <div className="flex items-center gap-2 bg-[var(--ak-color-bg-surface-muted)] rounded-lg p-1">
          <button
            onClick={() => setMode('simple')}
            className={clsx(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
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
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
              mode === 'expert'
                ? 'bg-[var(--ak-color-bg-elevated)] text-[var(--ak-color-text-primary)] shadow-sm'
                : 'text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)]'
            )}
          >
            Experte
          </button>
        </div>
      </header>
      )}
      
      <main className="max-w-5xl mx-auto py-6 px-6 overflow-y-auto">
        {/* Mode Switcher - Only show if not in drawer */}
        {!externalModeFlag && (
          <div className="mb-6 flex items-center justify-end">
            <div className="flex items-center gap-2 bg-[var(--ak-color-bg-surface-muted)] rounded-lg p-1">
              <button
                onClick={() => setMode('simple')}
                className={clsx(
                  'px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
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
                  'px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                  mode === 'expert'
                    ? 'bg-[var(--ak-color-bg-elevated)] text-[var(--ak-color-text-primary)] shadow-sm'
                    : 'text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)]'
                )}
              >
                Experte
              </button>
            </div>
          </div>
        )}
        {view === 'onboarding' && <SettingsOnboarding mode={mode} />}
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
        
        {/* Test Panel - Only in expert mode */}
        {mode === 'expert' && (
          <div className="mt-8 border-t border-[var(--ak-color-border-subtle)] pt-6">
            <SettingsTestPanel />
          </div>
        )}
      </main>
    </div>
  )
}
