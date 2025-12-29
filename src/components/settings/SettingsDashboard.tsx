'use client'

import { useState, useEffect } from 'react'
import { SettingsView } from './SettingsSidebarWidget'
import { SettingsGeneral } from './SettingsGeneral'
import { AISettingsPanelV2 } from './AISettingsPanelV2'
import { SettingsAgents } from './SettingsAgents'
import { SettingsSecurity } from './SettingsSecurity'
import { SettingsDatabase } from './SettingsDatabase'
import { SettingsUsers } from './SettingsUsers'
import { SettingsBilling } from './SettingsBilling'
import { ModulesSettings } from '@/features/settings/ModulesSettings'
import { SettingsIntegrations } from './SettingsIntegrations'
import { SettingsAccount } from './SettingsAccount'
import { SettingsOnboarding } from './SettingsOnboarding'
import { SettingsTestPanel } from './SettingsTestPanel'
import { AutomationInsightsPanel } from '@/components/automation'
import { QuickTemplates, KnowledgeBase, WeeklyReports, AutoReplyRules } from '@/components/kmu'
import { SettingsAppearance } from './SettingsAppearance'
import { SettingsLocale } from './SettingsLocale'
import { SettingsNotifications } from './SettingsNotifications'
import { SettingsCollaboration } from './SettingsCollaboration'
import clsx from 'clsx'

import { MemorySettings } from '@/features/memory/MemorySettings'

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
          {view === 'memory' && 'Memory'}
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
        {view === 'appearance' && <SettingsAppearance mode={mode} />}
        {view === 'locale' && <SettingsLocale mode={mode} />}
        {view === 'notifications' && <SettingsNotifications mode={mode} />}
        {view === 'collaboration' && <SettingsCollaboration mode={mode} />}
        {view === 'account' && <SettingsAccount mode={mode} />}
        {view === 'ai' && <AISettingsPanelV2 mode={mode} />}
        {view === 'agents' && <SettingsAgents mode={mode} />}
        {view === 'automations' && <AutomationInsightsPanel />}
        {view === 'kmu-templates' && <QuickTemplates />}
        {view === 'kmu-kb' && <KnowledgeBase />}
        {view === 'kmu-reports' && <WeeklyReports />}
        {view === 'kmu-auto-reply' && <AutoReplyRules />}
        {view === 'security' && <SettingsSecurity mode={mode} />}
        {view === 'database' && <SettingsDatabase mode={mode} />}
        {view === 'users' && <SettingsUsers mode={mode} />}
        {view === 'billing' && <SettingsBilling mode={mode} />}
        {view === 'modules' && <ModulesSettings />}
        {view === 'integrations' && <SettingsIntegrations mode={mode} />}
        {view === 'memory' && <MemorySettings />}
        
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
