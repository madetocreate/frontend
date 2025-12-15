'use client'

import { useState } from 'react'
import { 
  GlobeAltIcon, 
  ClockIcon, 
  LanguageIcon, 
  EyeIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'
import { SettingsSection, SettingsRow, SettingsSelect, SettingsToggle } from './SettingsSection'

type SettingsMode = 'simple' | 'expert'

export function SettingsGeneral({ mode }: { mode: SettingsMode }) {
  const [timezone, setTimezone] = useState('Europe/Berlin')
  const [language, setLanguage] = useState('de')
  const [notifications, setNotifications] = useState(true)
  const [theme, setTheme] = useState('system')

  return (
    <div className="p-6 space-y-6">
      {/* App Information - Always visible */}
      <SettingsSection 
        title="App-Informationen" 
        description="Grundlegende Informationen über Ihre Installation"
        mode={mode}
      >
        <SettingsRow
          title="Umgebung"
          subtitle="Aktuelle Laufzeitumgebung"
          leading={<GlobeAltIcon className="h-5 w-5" />}
          trailing={<span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">development</span>}
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
            trailing={<span className="text-sm font-mono bg-[var(--ak-color-bg-surface-muted)] px-2 py-1 rounded">backend</span>}
            mode={mode}
          />
        )}
      </SettingsSection>

      {/* Localization - Simple mode shows basic, expert shows all */}
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
            { value: 'fr', label: 'Français' },
            { value: 'es', label: 'Español' }
          ]}
          onChange={setLanguage}
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
          onChange={setTimezone}
          mode={mode}
        />
        {mode === 'expert' && (
          <>
            <SettingsRow
              title="Datumsformat"
              subtitle="Format für Datumsanzeige"
              leading={<ClockIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-[var(--ak-color-text-secondary)]">DD.MM.YYYY</span>}
              mode={mode}
            />
            <SettingsRow
              title="Zahlenformat"
              subtitle="Dezimaltrennzeichen und Tausenderzeichen"
              leading={<ClockIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-[var(--ak-color-text-secondary)]">1.234,56</span>}
              mode={mode}
            />
          </>
        )}
      </SettingsSection>

      {/* Appearance - Simple mode only */}
      {mode === 'simple' && (
        <SettingsSection 
          title="Erscheinungsbild" 
          description="Anpassen Sie das Aussehen der Anwendung"
          mode={mode}
        >
          <SettingsSelect
            title="Design"
            subtitle="Hell, Dunkel oder System"
            leading={theme === 'light' ? <SunIcon className="h-5 w-5" /> : theme === 'dark' ? <MoonIcon className="h-5 w-5" /> : <ComputerDesktopIcon className="h-5 w-5" />}
            value={theme}
            options={[
              { value: 'light', label: 'Hell' },
              { value: 'dark', label: 'Dunkel' },
              { value: 'system', label: 'System' }
            ]}
            onChange={setTheme}
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
            onChange={setNotifications}
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
              trailing={<span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">development</span>}
              mode={mode}
            />
            <SettingsRow
              title="Log Level"
              subtitle="LOG_LEVEL"
              leading={<EyeIcon className="h-5 w-5" />}
              trailing={<span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">info</span>}
              mode={mode}
            />
            <SettingsRow
              title="Alert Webhook URL"
              subtitle="ALERT_WEBHOOK_URL"
              leading={<BellIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-gray-400">Nicht konfiguriert</span>}
              mode={mode}
            />
          </SettingsSection>

          <SettingsSection 
            title="Performance & Caching" 
            description="Optimierungseinstellungen für bessere Performance"
            mode={mode}
          >
            <SettingsRow
              title="Cache aktiviert"
              subtitle="Redis-basiertes Caching"
              leading={<GlobeAltIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-green-600 font-medium">Aktiv</span>}
              mode={mode}
            />
            <SettingsRow
              title="Cache TTL"
              subtitle="Time-to-Live für Cache-Einträge"
              leading={<ClockIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-gray-600">3600s</span>}
              mode={mode}
            />
          </SettingsSection>
        </>
      )}
    </div>
  )
}
