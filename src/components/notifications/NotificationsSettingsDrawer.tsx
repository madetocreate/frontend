'use client'

import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkListRow } from '@/components/ui/AkListRow'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import { 
    EnvelopeIcon, 
    DevicePhoneMobileIcon, 
    ChatBubbleLeftRightIcon,
    MoonIcon
} from '@heroicons/react/24/outline'

interface NotificationSettings {
    [key: string]: unknown;
}

type NotificationsSettingsDrawerProps = {
    onClose?: () => void
    onSave?: (settings: NotificationSettings) => void
    onCancel?: () => void
}

export function NotificationsSettingsDrawer({ onClose }: NotificationsSettingsDrawerProps) {
  return (
    <div className="flex h-full flex-col gap-6 p-1 bg-[var(--ak-color-bg-app)]">
      <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-medium">Benachrichtigungen</h2>
          <AkButton variant="ghost" onClick={onClose} size="sm">Fertig</AkButton>
      </div>

      {/* Focus Mode */}
      <WidgetCard title="Fokus" padding="none">
         <div className="divide-y divide-[var(--ak-color-border-hairline)]">
            <AkListRow
                title="Nicht stören"
                subtitle="Alle Benachrichtigungen stummschalten"
                leading={<MoonIcon className="h-5 w-5 text-[var(--ak-color-accent)]" />}
                trailing={
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-9 h-5 bg-[var(--ak-color-bg-surface-muted)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--ak-color-accent)] peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--ak-color-border-subtle)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--ak-color-bg-surface)] after:border-[var(--ak-color-border-subtle)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--ak-color-accent)] transition-colors duration-200"></div>
                    </label>
                }
            />
         </div>
      </WidgetCard>

      <WidgetCard title="Kanäle" padding="none">
        <div className="divide-y divide-[var(--ak-color-border-hairline)]">
            <AkListRow
                title="E-Mail"
                subtitle="Tägliche Zusammenfassung"
                leading={<EnvelopeIcon className="h-5 w-5 text-[var(--ak-color-text-muted)]" />}
                trailing={
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-9 h-5 bg-[var(--ak-color-bg-surface-muted)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--ak-color-accent)] peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--ak-color-border-subtle)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--ak-color-bg-surface)] after:border-[var(--ak-color-border-subtle)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--ak-semantic-success)] transition-colors duration-200"></div>
                    </label>
                }
            />
            <AkListRow
                title="Push"
                subtitle="Sofortige Benachrichtigung"
                leading={<DevicePhoneMobileIcon className="h-5 w-5 text-[var(--ak-color-text-muted)]" />}
                trailing={
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-9 h-5 bg-[var(--ak-color-bg-surface-muted)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--ak-color-accent)] peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--ak-color-border-subtle)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--ak-color-bg-surface)] after:border-[var(--ak-color-border-subtle)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--ak-semantic-success)] transition-colors duration-200"></div>
                    </label>
                }
            />
            <AkListRow
                title="Slack"
                subtitle="#general Channel"
                leading={<ChatBubbleLeftRightIcon className="h-5 w-5 text-[var(--ak-color-text-muted)]" />}
                trailing={
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-9 h-5 bg-[var(--ak-color-bg-surface-muted)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--ak-color-accent)] peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--ak-color-border-subtle)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--ak-color-bg-surface)] after:border-[var(--ak-color-border-subtle)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--ak-semantic-success)] transition-colors duration-200"></div>
                    </label>
                }
            />
        </div>
      </WidgetCard>

      <WidgetCard title="Kategorien" padding="none">
         <div className="divide-y divide-[var(--ak-color-border-hairline)]">
            <AkListRow title="System Updates" subtitle="Wartung, neue Features" trailing={<AkBadge tone="muted">An</AkBadge>} />
            <AkListRow title="Sicherheit" subtitle="Login Alerts, Policy" trailing={<AkBadge tone="success">Wichtig</AkBadge>} />
            <AkListRow title="Leads & Sales" subtitle="Neue Deals, Statusänderungen" trailing={<AkBadge tone="muted">An</AkBadge>} />
            <AkListRow title="Marketing" subtitle="Kampagnen Status" trailing={<AkBadge tone="muted">Aus</AkBadge>} />
         </div>
      </WidgetCard>
    </div>
  )
}
