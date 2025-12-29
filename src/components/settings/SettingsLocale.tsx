'use client'

import { 
  LanguageIcon,
  ClockIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'
import { SettingsSection, SettingsSelect } from './SettingsSection'
import { useAppSettings } from '@/contexts/AppSettingsContext'
import { useTranslation } from '@/i18n'

type SettingsMode = 'simple' | 'expert'

export function SettingsLocale({ mode }: { mode: SettingsMode }) {
  const { userSettings, updateUserSettings } = useAppSettings()
  const { i18n } = useTranslation()

  const language = userSettings.locale?.language || 'de'
  const timezone = userSettings.locale?.timezone || 'Europe/Madrid'
  const weekStart = userSettings.locale?.weekStart || 'monday'

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--ak-color-text-primary)]">Sprache & Region</h2>
        <p className="text-sm text-[var(--ak-color-text-muted)] font-medium mt-1">
          Wähle deine bevorzugte Sprache, Zeitzone und regionale Einstellungen.
        </p>
      </div>
      <SettingsSection 
        title="Sprache" 
        description="Interface-Sprache und Lokalisierung"
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
      </SettingsSection>

      <SettingsSection 
        title="Zeitzone" 
        description="Zeitzone für Datum und Uhrzeit"
        mode={mode}
      >
        <SettingsSelect
          title="Zeitzone"
          subtitle={mode === 'expert' ? 'Systemzeitzone' : undefined}
          leading={<ClockIcon className="h-5 w-5" />}
          value={timezone}
          options={[
            { value: 'Europe/Berlin', label: 'Europe/Berlin (UTC+1)' },
            { value: 'Europe/Madrid', label: 'Europe/Madrid (UTC+1)' },
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

      <SettingsSection 
        title="Woche" 
        description="Wochenstart und Kalendereinstellungen"
        mode={mode}
      >
        <SettingsSelect
          title="Wochenstart"
          subtitle="Erster Tag der Woche"
          leading={<CalendarIcon className="h-5 w-5" />}
          value={weekStart}
          options={[
            { value: 'monday', label: 'Montag' },
            { value: 'sunday', label: 'Sonntag' }
          ]}
          onChange={(val) => {
            updateUserSettings({
              locale: {
                ...userSettings.locale,
                weekStart: val as 'monday' | 'sunday',
              },
            })
          }}
          mode={mode}
        />
      </SettingsSection>
    </div>
  )
}

