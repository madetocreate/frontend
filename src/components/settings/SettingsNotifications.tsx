'use client'

import { 
  BellIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'
import { SettingsSection, SettingsToggle } from './SettingsSection'
import { useAppSettings } from '@/contexts/AppSettingsContext'

type SettingsMode = 'simple' | 'expert'

export function SettingsNotifications({ mode }: { mode: SettingsMode }) {
  const { userSettings, updateUserSettings } = useAppSettings()

  const notificationsEnabled = userSettings.notifications?.enabled ?? true
  const emailEnabled = userSettings.notifications?.email ?? true
  const inAppEnabled = userSettings.notifications?.inApp ?? true

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--ak-color-text-primary)]">Benachrichtigungen</h2>
        <p className="text-sm text-[var(--ak-color-text-muted)] font-medium mt-1">
          Verwalte, wie und wann du über Aktivitäten informiert wirst.
        </p>
      </div>
      <SettingsSection 
        title="Benachrichtigungen" 
        description="Verwalten Sie Ihre Benachrichtigungseinstellungen"
        mode={mode}
      >
        <SettingsToggle
          title="Benachrichtigungen aktivieren"
          subtitle="Erhalten Sie Updates und Alerts"
          leading={<BellIcon className="h-5 w-5" />}
          checked={notificationsEnabled}
          onChange={(checked) => {
            updateUserSettings({
              notifications: {
                ...userSettings.notifications,
                enabled: checked,
              },
            })
          }}
          mode={mode}
        />
        <SettingsToggle
          title="E-Mail-Benachrichtigungen"
          subtitle="Erhalten Sie Benachrichtigungen per E-Mail"
          leading={<EnvelopeIcon className="h-5 w-5" />}
          checked={emailEnabled}
          onChange={(checked) => {
            updateUserSettings({
              notifications: {
                ...userSettings.notifications,
                email: checked,
              },
            })
          }}
          mode={mode}
        />
        <SettingsToggle
          title="In-App-Benachrichtigungen"
          subtitle="Erhalten Sie Benachrichtigungen in der Anwendung"
          leading={<ChatBubbleLeftRightIcon className="h-5 w-5" />}
          checked={inAppEnabled}
          onChange={(checked) => {
            updateUserSettings({
              notifications: {
                ...userSettings.notifications,
                inApp: checked,
              },
            })
          }}
          mode={mode}
        />
      </SettingsSection>
    </div>
  )
}

