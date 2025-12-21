'use client'

import { useState, useEffect, useCallback } from 'react'
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
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'
import { SettingsSection, SettingsRow, SettingsSelect, SettingsToggle } from './SettingsSection'
import { loadSettings, saveSettings } from '@/lib/settingsClient'
import { useDebounce } from '@/hooks/useDebounce'

type SettingsMode = 'simple' | 'expert'

export function SettingsGeneral({ mode }: { mode: SettingsMode }) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { i18n } = useTranslation()
  const [timezone, setTimezone] = useState('Europe/Berlin')
  const [language, setLanguage] = useState(i18n.language || 'de')
  const [notifications, setNotifications] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_saving, setSaving] = useState(false)

  // Save function
  const saveSettingsData = useCallback(async (settings: { appearance: { theme: 'light' | 'dark' | 'system'; language: string; timezone: string }; notifications: { enabled: boolean; email: boolean; push: boolean } }) => {
    setSaving(true)
    try {
      await saveSettings(settings)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }, [])

  // Debounced save function
  const debouncedSave = useDebounce(saveSettingsData, 1000)


  // Save when settings change (only after initial load)
  const [hasLoaded, setHasLoaded] = useState(false)
  
  useEffect(() => {
    if (mounted) {
      const load = async () => {
        const settings = await loadSettings()
        if (settings) {
          if (settings.appearance) {
            setTimezone(settings.appearance.timezone || 'Europe/Berlin')
            setLanguage(settings.appearance.language || 'de')
          }
          if (settings.notifications) {
            setNotifications(settings.notifications.enabled ?? true)
          }
        }
        setHasLoaded(true)
      }
      void load()
    }
  }, [mounted])

  // Save when settings change (only after initial load to prevent saving defaults)
  useEffect(() => {
    if (mounted && hasLoaded) {
      void debouncedSave({
        appearance: { theme: (theme as 'light' | 'dark' | 'system') || 'system', language, timezone },
        notifications: { enabled: notifications, email: notifications, push: notifications }
      })
    }
  }, [theme, language, timezone, notifications, mounted, hasLoaded, debouncedSave])

  // Avoid hydration mismatch
  useEffect(() => {
    // Use setTimeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      setMounted(true)
      // Initialize language from i18n
      setLanguage(i18n.language || 'de')
    }, 0)
    return () => clearTimeout(timer)
  }, [i18n])

  if (!mounted) {
    return null // or a placeholder
  }

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
            setLanguage(val)
            i18n.changeLanguage(val)
            if (typeof window !== 'undefined') {
              localStorage.setItem('language', val)
            }
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
          onChange={setTimezone}
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
            onChange={(val) => setTheme(val)}
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
        </>
      )}
    </div>
  )
}

