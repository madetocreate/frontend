'use client'

import { useState, useEffect } from 'react'
import clsx from 'clsx'

export type SettingsCategory = 'general' | 'notifications' | 'personalization' | 'apps_connectors' | 'schedules' | 'data_controls' | 'security' | 'parental' | 'account'

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = newSettings
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newSettings
    })
  }

  if (!category) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center text-sm text-slate-500">
          <p className="font-medium text-slate-600">Wähle eine Kategorie aus</p>
          <p className="mt-1">Klicke auf eine Einstellungskategorie in der linken Sidebar.</p>
        </div>
      </div>
    )
  }

  if (category !== 'general') {
    // Für andere Kategorien zeigen wir Platzhalter-Content
    const categoryLabels: Record<SettingsCategory, string> = {
      general: 'Allgemein',
      notifications: 'Benachrichtigungen',
      personalization: 'Personalisierung',
      apps_connectors: 'Apps & Konnektoren',
      schedules: 'Zeitpläne',
      data_controls: 'Datenkontrollen',
      security: 'Sicherheit',
      parental: 'Kindersicherung',
      account: 'Konto',
    }

    return (
      <div className="flex h-full flex-col gap-4 overflow-y-auto">
        <div className="flex flex-col gap-4">
          <h2 className="ak-heading">{categoryLabels[category]}</h2>
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6">
            <div className="text-center text-sm text-slate-500">
              <p className="font-medium text-slate-600">Einstellungen für {categoryLabels[category]}</p>
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

        {/* AUSSEHEN */}
        <div className="flex flex-col gap-3">
          <p className="ak-caption uppercase tracking-wide text-slate-400">AUSSEHEN</p>
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex w-[220px] flex-col gap-0">
              <p className="ak-body font-semibold">Darstellung</p>
              <p className="ak-caption text-slate-500">
                Steuere, ob sich die App an das System anpasst oder ein eigenes Erscheinungsbild nutzt.
              </p>
            </div>
            <div className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => handleSettingsChange('appearance.mode', 'system')}
                className={clsx(
                  'inline-flex items-center justify-center rounded-full border px-3 py-1.5 ak-caption font-medium transition-all',
                  settings.appearance.mode === 'system'
                    ? 'border-slate-300 bg-slate-100 text-slate-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                )}
              >
                System
              </button>
              <button
                type="button"
                onClick={() => handleSettingsChange('appearance.mode', 'hell')}
                className={clsx(
                  'inline-flex items-center justify-center rounded-full border px-3 py-1.5 ak-caption font-medium transition-all',
                  settings.appearance.mode === 'hell'
                    ? 'border-slate-300 bg-slate-100 text-slate-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                )}
              >
                Hell
              </button>
              <button
                type="button"
                onClick={() => handleSettingsChange('appearance.mode', 'dunkel')}
                className={clsx(
                  'inline-flex items-center justify-center rounded-full border px-3 py-1.5 ak-caption font-medium transition-all',
                  settings.appearance.mode === 'dunkel'
                    ? 'border-slate-300 bg-slate-100 text-slate-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                )}
              >
                Dunkel
              </button>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex w-[220px] flex-col gap-0">
              <p className="ak-body font-semibold">Akzentfarbe</p>
              <p className="ak-caption text-slate-500">
                Wähle die Akzentfarbe für Markierungen und Schaltflächen.
              </p>
            </div>
            <div className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => handleSettingsChange('appearance.accentColor', 'standard')}
                className={clsx(
                  'inline-flex items-center justify-center rounded-full border px-3 py-1.5 ak-caption font-medium transition-all',
                  settings.appearance.accentColor === 'standard'
                    ? 'border-slate-300 bg-slate-100 text-slate-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                )}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => handleSettingsChange('appearance.accentColor', 'blau')}
                className={clsx(
                  'inline-flex items-center justify-center rounded-full border px-3 py-1.5 ak-caption font-medium transition-all',
                  settings.appearance.accentColor === 'blau'
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
                )}
              >
                Blau
              </button>
              <button
                type="button"
                onClick={() => handleSettingsChange('appearance.accentColor', 'gruen')}
                className={clsx(
                  'inline-flex items-center justify-center rounded-full border px-3 py-1.5 ak-caption font-medium transition-all',
                  settings.appearance.accentColor === 'gruen'
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-green-300'
                )}
              >
                Grün
              </button>
              <button
                type="button"
                onClick={() => handleSettingsChange('appearance.accentColor', 'lila')}
                className={clsx(
                  'inline-flex items-center justify-center rounded-full border px-3 py-1.5 ak-caption font-medium transition-all',
                  settings.appearance.accentColor === 'lila'
                    ? 'border-purple-300 bg-purple-50 text-purple-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-purple-300'
                )}
              >
                Lila
              </button>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-200" />

        {/* SPRACHE */}
        <div className="flex flex-col gap-3">
          <p className="ak-caption uppercase tracking-wide text-slate-400">SPRACHE</p>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex w-[220px] flex-col gap-0">
              <p className="ak-body font-semibold">Sprache der Oberfläche</p>
              <p className="ak-caption text-slate-500">
                Sprache für Menüs, Beschriftungen und Meldungen.
              </p>
            </div>
            <select
              value={settings.language.uiLanguage}
              onChange={(e) => handleSettingsChange('language.uiLanguage', e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 ak-body text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="auto">Automatisch erkennen</option>
              <option value="de">Deutsch</option>
              <option value="en">Englisch</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex w-[220px] flex-col gap-0">
              <p className="ak-body font-semibold">Gesprochene Sprache</p>
              <p className="ak-caption text-slate-500">
                Sprache für gesprochene Antworten und Vorlesen.
              </p>
            </div>
            <select
              value={settings.language.spokenLanguage}
              onChange={(e) => handleSettingsChange('language.spokenLanguage', e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 ak-body text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="de">Deutsch</option>
              <option value="en">Englisch</option>
              <option value="fr">Französisch</option>
              <option value="es">Spanisch</option>
            </select>
          </div>
        </div>

        <div className="h-px bg-slate-200" />

        {/* STIMME & AUDIO */}
        <div className="flex flex-col gap-3">
          <p className="ak-caption uppercase tracking-wide text-slate-400">STIMME & AUDIO</p>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex w-[220px] flex-col gap-0">
              <p className="ak-body font-semibold">Stimme</p>
              <p className="ak-caption text-slate-500">
                Wähle die Stimme für gesprochene Antworten.
              </p>
            </div>
            <select
              value={settings.language.voice}
              onChange={(e) => handleSettingsChange('language.voice', e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 ak-body text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
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
              <p className="ak-caption text-slate-500">
                Eröffne einen separaten Modus für Sprachausgabe, ohne visuelle Ablenkungen.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.language.separateAudioMode}
              onChange={(e) => handleSettingsChange('language.separateAudioMode', e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-slate-600 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex w-[220px] flex-col gap-0">
              <p className="ak-body font-semibold">Töne abspielen</p>
              <p className="ak-caption text-slate-500">
                Spiele dezente Hinweistöne bei wichtigen Ereignissen.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.generalFlags.playSounds}
              onChange={(e) => handleSettingsChange('generalFlags.playSounds', e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-slate-600 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>

        <div className="h-px bg-slate-200" />

        {/* STARTBEREICH */}
        <div className="flex flex-col gap-3">
          <p className="ak-caption uppercase tracking-wide text-slate-400">STARTBEREICH</p>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex w-[220px] flex-col gap-0">
              <p className="ak-body font-semibold">Beim Start öffnen</p>
              <p className="ak-caption text-slate-500">
                Bereich, der beim Öffnen der App zuerst angezeigt wird.
              </p>
            </div>
            <select
              value={settings.startup.defaultSection}
              onChange={(e) => handleSettingsChange('startup.defaultSection', e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 ak-body text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
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
              <p className="ak-caption text-slate-500">
                Zeige gelegentlich kurze Tipps zur Nutzung des Assistenten.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.generalFlags.showTips}
              onChange={(e) => handleSettingsChange('generalFlags.showTips', e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-slate-600 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>

        <div className="h-px bg-slate-200" />

        {/* WORKSPACE */}
        <div className="flex flex-col gap-3">
          <p className="ak-caption uppercase tracking-wide text-slate-400">WORKSPACE</p>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex w-[220px] flex-col gap-0">
              <p className="ak-body font-semibold">Standard-Workspace</p>
              <p className="ak-caption text-slate-500">
                Workspace, der standardmäßig verwendet wird.
              </p>
            </div>
            <div className="flex flex-1 items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 ak-caption font-medium text-slate-700">
                {settings.workspace.defaultWorkspaceName}
              </span>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 ak-caption font-medium text-slate-700 hover:bg-slate-50"
              >
                Ändern
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex w-[220px] flex-col gap-0">
              <p className="ak-body font-semibold">Automatisch anhand des Kontexts wechseln</p>
              <p className="ak-caption text-slate-500">
                Wechsle den Workspace automatisch, wenn du mit bestimmten Kontakten oder Projekten arbeitest.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.workspace.autoSwitchByContext}
              onChange={(e) => handleSettingsChange('workspace.autoSwitchByContext', e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-slate-600 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

