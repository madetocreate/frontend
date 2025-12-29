'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useTranslation } from '@/i18n'
import { 
  GlobeAltIcon, 
  ClockIcon, 
  LanguageIcon, 
  EyeIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline'
import { SettingsSection, SettingsRow, SettingsSelect, SettingsToggle } from './SettingsSection'
import { useAppSettings } from '@/contexts/AppSettingsContext'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'

type SettingsMode = 'simple' | 'expert'

export function SettingsGeneral({ mode }: { mode: SettingsMode }) {
  const [mounted, setMounted] = useState(false)
  const { userSettings, updateUserSettings } = useAppSettings()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { i18n } = useTranslation()
  const { isDeveloper } = useFeatureAccess()

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const timezone = userSettings.locale?.timezone || 'Europe/Berlin'
  const language = userSettings.locale?.language || i18n.language || 'de'
  const notifications = userSettings.notifications?.enabled ?? true

  const currentThemeIcon = theme === 'light' ? (
    <SunIcon className="h-5 w-5" />
  ) : theme === 'dark' ? (
    <MoonIcon className="h-5 w-5" />
  ) : (
    <ComputerDesktopIcon className="h-5 w-5" />
  )

  return (
    <div className="p-6 space-y-6">
      {/* ... existing App Information ... */}
      <SettingsSection 
        title="App-Informationen" 
        description="Grundlegende Informationen über Ihre Installation"
        mode={mode}
      >
        <SettingsRow
          title="Umgebung"
          subtitle="Aktuelle Laufzeitumgebung"
          leading={<GlobeAltIcon className="h-5 w-5" />}
          trailing={<span className="text-sm font-mono bg-[var(--ak-color-bg-surface-muted)] px-2 py-1 rounded text-[var(--ak-color-text-primary)] border border-[var(--ak-color-border-fine)]">development</span>}
          mode={mode}
        />
        <SettingsRow
          title="Version"
          subtitle="Build 2025.12.14"
          leading={<EyeIcon className="h-5 w-5" />}
          trailing={<span className="text-sm text-[var(--ak-color-text-secondary)]">v2.4.0-beta</span>}
          mode={mode}
        />
        {mode === 'expert' && (
          <SettingsRow
            title="Service Name"
            subtitle="SERVICE_NAME"
            leading={<GlobeAltIcon className="h-5 w-5" />}
            trailing={<span className="text-sm font-mono bg-[var(--ak-color-bg-surface-muted)] px-2 py-1 rounded text-[var(--ak-color-text-primary)]">backend</span>}
            mode={mode}
          />
        )}
      </SettingsSection>

      {/* ... existing Localization ... */}
      <SettingsSection 
        title="Lokalisierung" 
        description="Sprache, Zeitzone und regionale Einstellungen"
        mode={mode}
      >
        <SettingsSelect
          title="Sprache"
          subtitle="Interface-Sprache"
          leading={<LanguageIcon className="h-5 w-5" />}
          value={language}
          options={[
            { value: 'de', label: 'Deutsch' },
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Español' },
            { value: 'fr', label: 'Français' },
            { value: 'it', label: 'Italiano' }
          ]}
          onChange={(val) => {
            i18n.changeLanguage(val)
            if (typeof window !== 'undefined') {
              localStorage.setItem('language', val)
            }
            updateUserSettings({
              locale: {
                ...userSettings.locale,
                language: val,
              },
            })
          }}
          mode={mode}
        />
        <SettingsSelect
          title="Zeitzone"
          subtitle={mode === 'expert' ? 'Systemzeitzone' : undefined}
          leading={<ClockIcon className="h-5 w-5" />}
          value={timezone}
          options={[
            { value: 'Europe/Berlin', label: 'Europe/Berlin (UTC+1)' },
            { value: 'UTC', label: 'UTC (UTC+0)' },
            { value: 'America/New_York', label: 'America/New_York (UTC-5)' },
            { value: 'America/Los_Angeles', label: 'America/Los_Angeles (UTC-8)' },
            { value: 'Asia/Tokyo', label: 'Asia/Tokyo (UTC+9)' }
          ]}
          onChange={(val) => {
            updateUserSettings({
              locale: {
                ...userSettings.locale,
                timezone: val,
              },
            })
          }}
          mode={mode}
        />
      </SettingsSection>

      {/* Appearance - Simple mode only */}
      {mode === 'simple' && (
        <SettingsSection 
          title="Erscheinungsbild" 
          description="Anpassen des Aussehens der Anwendung"
          mode={mode}
        >
          <SettingsSelect
            title="Design"
            subtitle={`Aktuell: ${theme === 'system' ? `System (${resolvedTheme === 'dark' ? 'Dunkel' : 'Hell'})` : theme === 'dark' ? 'Dunkel' : 'Hell'}`}
            leading={currentThemeIcon}
            value={theme || 'system'}
            options={[
              { value: 'light', label: 'Hell' },
              { value: 'dark', label: 'Dunkel' },
              { value: 'system', label: 'System' }
            ]}
            onChange={(val) => {
              setTheme(val)
              updateUserSettings({
                appearance: {
                  ...userSettings.appearance,
                  theme: val as 'light' | 'dark' | 'system',
                },
              })
            }}
            mode={mode}
          />
        </SettingsSection>
      )}

      {/* Notifications - Simple mode */}
      {mode === 'simple' && (
        <SettingsSection 
          title="Benachrichtigungen" 
          description="Verwalten Sie Ihre Benachrichtigungseinstellungen"
          mode={mode}
        >
          <SettingsToggle
            title="Benachrichtigungen aktivieren"
            subtitle="Erhalten Sie Updates und Alerts"
            leading={<BellIcon className="h-5 w-5" />}
            checked={notifications}
            onChange={(checked) => {
              updateUserSettings({
                notifications: {
                  ...userSettings.notifications,
                  enabled: checked,
                  email: checked,
                  inApp: checked,
                },
              })
            }}
            mode={mode}
          />
        </SettingsSection>
      )}

      {/* Advanced Settings - Expert mode only */}
      {mode === 'expert' && (
        <>
          <SettingsSection 
            title="Erweiterte Konfiguration" 
            description="Systemweite Einstellungen und Umgebungsvariablen"
            mode={mode}
          >
            <SettingsRow
              title="Node Environment"
              subtitle="NODE_ENV"
              leading={<GlobeAltIcon className="h-5 w-5" />}
              trailing={<span className="text-sm font-mono bg-[var(--ak-color-bg-surface-muted)] px-2 py-1 rounded text-[var(--ak-color-text-primary)]">development</span>}
              mode={mode}
            />
            <SettingsRow
              title="Log Level"
              subtitle="LOG_LEVEL"
              leading={<EyeIcon className="h-5 w-5" />}
              trailing={<span className="text-sm font-mono bg-[var(--ak-color-bg-surface-muted)] px-2 py-1 rounded text-[var(--ak-color-text-primary)]">info</span>}
              mode={mode}
            />
          </SettingsSection>

          {isDeveloper && (
            <SettingsSection 
              title="Entwickler-Einstellungen" 
              description="Spezielle Konfigurationen für den Developer-Modus"
              mode={mode}
            >
              <SettingsRow
                title="Developer-Modus"
                subtitle="Status: Aktiv (Alle Features freigeschaltet)"
                leading={<CommandLineIcon className="h-5 w-5 text-[var(--ak-semantic-success)]" />}
                trailing={<span className="text-xs font-bold uppercase tracking-wider text-[var(--ak-semantic-success)] bg-[var(--ak-semantic-success-soft)] px-2 py-1 rounded border border-[var(--ak-semantic-success-soft)]">Aktiv</span>}
                mode={mode}
              />
              <SettingsRow
                title="Bypass Billing"
                subtitle="Alle Plan-Checks werden übersprungen"
                leading={<CommandLineIcon className="h-5 w-5 opacity-50" />}
                trailing={<span className="text-xs text-[var(--ak-color-text-muted)] italic">Read-only</span>}
                mode={mode}
              />
            </SettingsSection>
          )}
        </>
      )}
    </div>
  )
}

