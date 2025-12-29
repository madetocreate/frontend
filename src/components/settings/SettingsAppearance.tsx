'use client'

import { useTheme } from 'next-themes'
import { 
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  PaintBrushIcon,
} from '@heroicons/react/24/outline'
import { SettingsSection, SettingsSelect, SettingsToggle } from './SettingsSection'
import { useAppSettings } from '@/contexts/AppSettingsContext'
import { useState, useEffect } from 'react'

type SettingsMode = 'simple' | 'expert'

export function SettingsAppearance({ mode }: { mode: SettingsMode }) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { userSettings, updateUserSettings } = useAppSettings()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const currentTheme = userSettings.appearance?.theme || theme || 'system'
  const density = userSettings.appearance?.density || 'cozy'
  const reduceMotion = userSettings.appearance?.reduceMotion || false

  const currentThemeIcon = currentTheme === 'light' ? (
    <SunIcon className="h-5 w-5" />
  ) : currentTheme === 'dark' ? (
    <MoonIcon className="h-5 w-5" />
  ) : (
    <ComputerDesktopIcon className="h-5 w-5" />
  )

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--ak-color-text-primary)]">Aussehen</h2>
        <p className="text-sm text-[var(--ak-color-text-muted)] font-medium mt-1">
          Passe das Design und die Darstellung der Anwendung an.
        </p>
      </div>
      <SettingsSection 
        title="Design" 
        description="Anpassen des Aussehens der Anwendung"
        mode={mode}
      >
        <SettingsSelect
          title="Design"
          subtitle={`Aktuell: ${currentTheme === 'system' ? `System (${resolvedTheme === 'dark' ? 'Dunkel' : 'Hell'})` : currentTheme === 'dark' ? 'Dunkel' : 'Hell'}`}
          leading={currentThemeIcon}
          value={currentTheme}
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

      <SettingsSection 
        title="Dichte" 
        description="Anpassen der Elementabstände"
        mode={mode}
      >
        <SettingsSelect
          title="Dichte"
          subtitle="Abstände zwischen Elementen"
          leading={<PaintBrushIcon className="h-5 w-5" />}
          value={density}
          options={[
            { value: 'compact', label: 'Kompakt' },
            { value: 'cozy', label: 'Gemütlich' }
          ]}
          onChange={(val) => {
            updateUserSettings({
              appearance: {
                ...userSettings.appearance,
                density: val as 'compact' | 'cozy',
              },
            })
          }}
          mode={mode}
        />
      </SettingsSection>

      <SettingsSection 
        title="Zugänglichkeit" 
        description="Einstellungen für bessere Barrierefreiheit"
        mode={mode}
      >
        <SettingsToggle
          title="Bewegungen reduzieren"
          subtitle="Reduziert Animationen und Übergänge"
          leading={<PaintBrushIcon className="h-5 w-5" />}
          checked={reduceMotion}
          onChange={(checked) => {
            updateUserSettings({
              appearance: {
                ...userSettings.appearance,
                reduceMotion: checked,
              },
            })
          }}
          mode={mode}
        />
      </SettingsSection>
    </div>
  )
}

