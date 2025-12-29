'use client'

import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { AIActions } from '@/components/ui/AIActions'
import { QuickActions } from '@/components/ui/QuickActions'
import { RefreshCcw } from 'lucide-react'

export type SettingsCategory = 'general' | 'memory_crm' | 'notifications' | 'personalization' | 'apps_connectors' | 'schedules' | 'data_controls' | 'security' | 'parental' | 'account' | 'shop'

type GeneralSettings = {
  appearance: {
    mode: 'system' | 'hell' | 'dunkel'
    accentColor: 'standard' | 'blau' | 'gruen' | 'lila'
  }
  language: {
    uiLanguage: 'auto' | 'de' | 'en'
    spokenLanguage: 'de' | 'en' | 'fr' | 'es'
    voice: 'Cove' | 'Amber' | 'Sol' | 'Anders'
    separateAudioMode: boolean
  }
  startup: {
    defaultSection: 'chat' | 'inbox' | 'automations' | 'calendar' | 'settings'
  }
  workspace: {
    defaultWorkspaceName: string
    autoSwitchByContext: boolean
  }
  generalFlags: {
    playSounds: boolean
    showTips: boolean
  }
}

type SettingsDetailPanelProps = {
  category: SettingsCategory | null
}

const DEFAULT_SETTINGS: GeneralSettings = {
  appearance: {
    mode: 'system',
    accentColor: 'standard',
  },
  language: {
    uiLanguage: 'auto',
    spokenLanguage: 'de',
    voice: 'Cove',
    separateAudioMode: false,
  },
  startup: {
    defaultSection: 'chat',
  },
  workspace: {
    defaultWorkspaceName: 'Team Alpha',
    autoSwitchByContext: true,
  },
  generalFlags: {
    playSounds: true,
    showTips: true,
  },
}

export function SettingsDetailPanel({ category }: SettingsDetailPanelProps) {
  const [settings, setSettings] = useState<GeneralSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    // Hier könnte man die Einstellungen vom Backend laden
    // Für jetzt verwenden wir die Default-Werte
  }, [])

  const handleSettingsChange = (path: string, value: string | boolean) => {
    setSettings((prev) => {
      const newSettings = { ...prev }
      const keys = path.split('.')
      let current: Record<string, unknown> = newSettings as Record<string, unknown>
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] as Record<string, unknown>
      }
      
      current[keys[keys.length - 1]] = value
      return newSettings
    })
  }

  if (!category) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center text-sm ak-text-muted">
          <p className="font-medium ak-text-primary">Wähle eine Kategorie aus</p>
          <p className="mt-1">Klicke auf eine Einstellungskategorie in der linken Sidebar.</p>
        </div>
      </div>
    )
  }

  if (category !== 'general') {
    // Für andere Kategorien zeigen wir Platzhalter-Content
    const categoryLabels: Record<SettingsCategory, string> = {
      general: 'Allgemein',
      memory_crm: 'Speicher & CRM',
      notifications: 'Benachrichtigungen',
      personalization: 'Personalisierung',
      apps_connectors: 'Apps & Konnektoren',
      schedules: 'Zeitpläne',
      data_controls: 'Datenkontrollen',
      security: 'Sicherheit',
      parental: 'Kindersicherung',
      account: 'Konto',
      shop: 'Shop',
    }

    return (
      <div className="flex h-full flex-col gap-4 overflow-y-auto">
        <div className="flex flex-col gap-4">
          <h2 className="ak-heading">{categoryLabels[category]}</h2>
          
          {/* AI Suggestions & Quick Actions - in der Mitte */}
          <div className="flex flex-col gap-3 px-4 py-3 bg-[var(--ak-color-bg-surface-muted)]/50 rounded-xl border border-[var(--ak-color-border-subtle)]">
            <AIActions context="settings" />
            <QuickActions context="settings" />
          </div>
          
          <div className="rounded-xl border ak-border-default bg-[var(--ak-color-bg-surface-muted)] p-6">
            <div className="text-center text-sm ak-text-secondary">
              <p className="font-medium ak-text-secondary">Einstellungen für {categoryLabels[category]}</p>
              <p className="mt-2">
                Hier werden später die Einstellungen für {categoryLabels[category]} angezeigt.
              </p>
              <p className="mt-1 text-xs">
                Diese Ansicht wird über Widgets konfiguriert.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto">
      <div className="flex flex-col gap-4">
        <h2 className="ak-heading">Allgemein</h2>

        {/* AI Suggestions & Quick Actions - in der Mitte */}
        <div className="flex flex-col gap-3 px-4 py-3 bg-[var(--ak-color-bg-surface-muted)]/50 rounded-xl border border-[var(--ak-color-border-subtle)]">
          <AIActions context="settings" />
          <QuickActions context="settings" />
        </div>

        {/* AUSSEHEN */}
        <div className="flex flex-col gap-3">
          <p className="ak-caption uppercase tracking-wide ak-text-muted">AUSSEHEN</p>
          
          <div className="flex items-start justify-between gap-4">
          <div className="flex w-[220px] flex-col gap-0">
              <p className="ak-body font-semibold">Darstellung</p>
              <p className="ak-caption ak-text-muted">
                Steuere, ob sich die App an das System anpasst oder ein eigenes Erscheinungsbild nutzt.
              </p>
            </div>
            <div className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => handleSettingsChange('appearance.mode', 'system')}
                className={clsx(
                  'inline-flex items-center justify-center rounded-[var(--ak-radius-md)] border px-2.5 py-1 ak-caption font-medium transition-all',
                  settings.appearance.mode === 'system'
                    ? 'border-[var(--ak-color-border-strong)] bg-[var(--ak-color-bg-surface-muted)] ak-text-primary'
                    : 'ak-border-default ak-bg-surface-1 ak-text-secondary hover:border-[var(--ak-color-border-strong)]'
                )}
              >
                System
              </button>
              <button
                type="button"
                onClick={() => handleSettingsChange('appearance.mode', 'hell')}
                className={clsx(
                  'inline-flex items-center justify-center rounded-[var(--ak-radius-md)] border px-2.5 py-1 ak-caption font-medium transition-all',
                  settings.appearance.mode === 'hell'
                    ? 'border-[var(--ak-color-border-strong)] bg-[var(--ak-color-bg-surface-muted)] ak-text-primary'
                    : 'ak-border-default ak-bg-surface-1 ak-text-secondary hover:border-[var(--ak-color-border-strong)]'
                )}
              >
                Hell
              </button>
              <button
                type="button"
                onClick={() => handleSettingsChange('appearance.mode', 'dunkel')}
                className={clsx(
                  'inline-flex items-center justify-center rounded-[var(--ak-radius-md)] border px-2.5 py-1 ak-caption font-medium transition-all',
                  settings.appearance.mode === 'dunkel'
                    ? 'border-[var(--ak-color-border-strong)] bg-[var(--ak-color-bg-surface-muted)] ak-text-primary'
                    : 'ak-border-default ak-bg-surface-1 ak-text-secondary hover:border-[var(--ak-color-border-strong)]'
                )}
              >
                Dunkel
              </button>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex w-[220px] flex-col gap-0">
              <p className="ak-body font-semibold">Akzentfarbe</p>
              <p className="ak-caption ak-text-muted">
                Wähle die Akzentfarbe für Markierungen und Schaltflächen.
              </p>
            </div>
            <div className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => handleSettingsChange('appearance.accentColor', 'standard')}
                className={clsx(
                  'inline-flex items-center justify-center rounded-[var(--ak-radius-md)] border px-2.5 py-1 ak-caption font-medium transition-all',
                  settings.appearance.accentColor === 'standard'
                    ? 'border-[var(--ak-color-border-strong)] bg-[var(--ak-color-bg-surface-muted)] ak-text-primary'
                    : 'ak-border-default ak-bg-surface-1 ak-text-secondary hover:border-[var(--ak-color-border-strong)]'
                )}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => handleSettingsChange('appearance.accentColor', 'blau')}
                className={clsx(
                  'inline-flex items-center justify-center rounded-[var(--ak-radius-md)] border px-2.5 py-1 ak-caption font-medium transition-all',
                  settings.appearance.accentColor === 'blau'
                  ? 'border-[var(--ak-accent-inbox)] ak-bg-info-soft ak-text-info'
                  : 'ak-border-default ak-bg-surface-0 ak-text-secondary hover:border-[var(--ak-accent-inbox)]'
                )}
              >
                Blau
              </button>
              <button
                type="button"
                onClick={() => handleSettingsChange('appearance.accentColor', 'gruen')}
                className={clsx(
                  'inline-flex items-center justify-center rounded-[var(--ak-radius-md)] border px-2.5 py-1 ak-caption font-medium transition-all',
                  settings.appearance.accentColor === 'gruen'
                  ? 'border-[var(--ak-semantic-success)] ak-bg-success-soft ak-text-success'
                  : 'ak-border-default ak-bg-surface-0 ak-text-secondary hover:border-[var(--ak-semantic-success)]'
                )}
              >
                Grün
              </button>
              <button
                type="button"
                onClick={() => handleSettingsChange('appearance.accentColor', 'lila')}
                className={clsx(
                  'inline-flex items-center justify-center rounded-[var(--ak-radius-md)] border px-2.5 py-1 ak-caption font-medium transition-all',
                  settings.appearance.accentColor === 'lila'
                  ? 'border-[var(--ak-accent-documents)] ak-bg-accent-documents-soft ak-text-accent-documents'
                  : 'ak-border-default ak-bg-surface-0 ak-text-secondary hover:border-[var(--ak-accent-documents)]'
                )}
              >
                Lila
              </button>
            </div>
          </div>
        </div>

        <div className="h-px ak-border-hairline" />

        {/* SPRACHE */}
        <div className="flex flex-col gap-3">
          <p className="ak-caption uppercase tracking-wide ak-text-muted">SPRACHE</p>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex w-[220px] flex-col gap-0">
              <p className="ak-body font-semibold">Sprache der Oberfläche</p>
              <p className="ak-caption ak-text-muted">
                Sprache für Menüs, Beschriftungen und Meldungen.
              </p>
            </div>
              <select
              value={settings.language.uiLanguage}
              onChange={(e) => handleSettingsChange('language.uiLanguage', e.target.value)}
              className="flex-1 rounded-lg border ak-border-default ak-bg-surface-0 px-3 py-2 ak-body ak-text-primary focus:ak-focus-ring"
            >
              <option value="auto">Automatisch erkennen</option>
              <option value="de">Deutsch</option>
              <option value="en">Englisch</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex w-[220px] flex-col gap-0">
              <p className="ak-body font-semibold">Gesprochene Sprache</p>
              <p className="ak-caption ak-text-muted">
                Sprache für gesprochene Antworten und Vorlesen.
              </p>
            </div>
              <select
              value={settings.language.spokenLanguage}
              onChange={(e) => handleSettingsChange('language.spokenLanguage', e.target.value)}
              className="flex-1 rounded-lg border ak-border-default ak-bg-surface-0 px-3 py-2 ak-body ak-text-primary focus:ak-focus-ring"
            >
              <option value="de">Deutsch</option>
              <option value="en">Englisch</option>
              <option value="fr">Französisch</option>
              <option value="es">Spanisch</option>
            </select>
          </div>
        </div>

        <div className="h-px ak-border-hairline" />

        {/* STIMME & AUDIO */}
        <div className="flex flex-col gap-3">
          <p className="ak-caption uppercase tracking-wide ak-text-muted">STIMME & AUDIO</p>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex w-[220px] flex-col gap-0">
              <p className="ak-body font-semibold">Stimme</p>
              <p className="ak-caption ak-text-muted">
                Wähle die Stimme für gesprochene Antworten.
              </p>
            </div>
              <select
              value={settings.language.voice}
              onChange={(e) => handleSettingsChange('language.voice', e.target.value)}
              className="flex-1 rounded-lg border ak-border-default ak-bg-surface-0 px-3 py-2 ak-body ak-text-primary focus:ak-focus-ring"
            >
              <option value="Cove">Cove</option>
              <option value="Amber">Amber</option>
              <option value="Sol">Sol</option>
              <option value="Anders">Anders</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex w-[220px] flex-col gap-0">
              <p className="ak-body font-semibold">Separater Audiomodus</p>
              <p className="ak-caption ak-text-muted">
                Eröffne einen separaten Modus für Sprachausgabe, ohne visuelle Ablenkungen.
              </p>
            </div>
              <input
              type="checkbox"
              checked={settings.language.separateAudioMode}
              onChange={(e) => handleSettingsChange('language.separateAudioMode', e.target.checked)}
              className="h-5 w-5 rounded ak-border-default ak-text-secondary focus:ak-focus-ring"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex w-[220px] flex-col gap-0">
              <p className="ak-body font-semibold">Töne abspielen</p>
              <p className="ak-caption ak-text-muted">
                Spiele dezente Hinweistöne bei wichtigen Ereignissen.
              </p>
            </div>
              <input
              type="checkbox"
              checked={settings.generalFlags.playSounds}
              onChange={(e) => handleSettingsChange('generalFlags.playSounds', e.target.checked)}
              className="h-5 w-5 rounded ak-border-default ak-text-secondary focus:ak-focus-ring"
            />
          </div>
        </div>

        <div className="h-px ak-border-hairline" />

        {/* STARTBEREICH */}
        <div className="flex flex-col gap-3">
          <p className="ak-caption uppercase tracking-wide ak-text-muted">STARTBEREICH</p>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex w-[220px] flex-col gap-0">
              <p className="ak-body font-semibold">Beim Start öffnen</p>
              <p className="ak-caption ak-text-muted">
                Bereich, der beim Öffnen der App zuerst angezeigt wird.
              </p>
            </div>
            <select
              value={settings.startup.defaultSection}
              onChange={(e) => handleSettingsChange('startup.defaultSection', e.target.value)}
              className="flex-1 rounded-lg border ak-border-default ak-bg-surface-0 px-3 py-2 ak-body ak-text-primary focus:ak-focus-ring"
            >
              <option value="chat">Chat</option>
              <option value="inbox">Posteingang</option>
              <option value="automations">Automatisierungen</option>
              <option value="calendar">Kalender</option>
              <option value="settings">Einstellungen</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex w-[220px] flex-col gap-0">
              <p className="ak-body font-semibold">Tipps & Hinweise anzeigen</p>
              <p className="ak-caption ak-text-muted">
                Zeige gelegentlich kurze Tipps zur Nutzung des Assistenten.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.generalFlags.showTips}
              onChange={(e) => handleSettingsChange('generalFlags.showTips', e.target.checked)}
              className="h-5 w-5 rounded ak-border-default ak-text-secondary focus:ak-focus-ring"
            />
          </div>
        </div>

        <div className="h-px ak-border-hairline" />

        {/* WORKSPACE */}
        <div className="flex flex-col gap-3">
          <p className="ak-caption uppercase tracking-wide ak-text-muted">WORKSPACE</p>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex w-[220px] flex-col gap-0">
              <p className="ak-body font-semibold">Standard-Workspace</p>
              <p className="ak-caption ak-text-muted">
                Workspace, der standardmäßig verwendet wird.
              </p>
            </div>
              <div className="flex flex-1 items-center gap-2">
              <span className="inline-flex items-center rounded-[var(--ak-radius-md)] border ak-border-default ak-bg-surface-muted px-3 py-1 ak-caption font-medium ak-text-secondary">
                {settings.workspace.defaultWorkspaceName}
              </span>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border ak-border-default ak-bg-surface-0 px-3 py-1.5 ak-caption font-medium ak-text-secondary hover:ak-bg-hover"
              >
                Ändern
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex w-[220px] flex-col gap-0">
              <p className="ak-body font-semibold">Automatisch anhand des Kontexts wechseln</p>
              <p className="ak-caption ak-text-muted">
                Wechsle den Workspace automatisch, wenn du mit bestimmten Kontakten oder Projekten arbeitest.
              </p>
            </div>
              <input
              type="checkbox"
              checked={settings.workspace.autoSwitchByContext}
              onChange={(e) => handleSettingsChange('workspace.autoSwitchByContext', e.target.checked)}
              className="h-5 w-5 rounded ak-border-default ak-text-secondary focus:ak-focus-ring"
            />
          </div>
        </div>

        <div className="h-px ak-border-hairline" />

        {/* ONBOARDING */}
        <div className="flex flex-col gap-3">
          <p className="ak-caption uppercase tracking-wide ak-text-muted">ONBOARDING</p>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex w-[220px] flex-col gap-0">
              <p className="ak-body font-semibold">Assistent neu starten</p>
              <p className="ak-caption ak-text-muted">
                Führe das initiale Onboarding erneut durch, um deinen Startpunkt neu zu bestimmen.
              </p>
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('aklow-restart-onboarding'))}
              className="flex items-center gap-2 rounded-xl ak-bg-surface-muted px-4 py-2 text-sm font-medium ak-text-secondary hover:ak-bg-hover transition-colors"
            >
              <RefreshCcw className="h-4 w-4" />
              Onboarding neu starten
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

