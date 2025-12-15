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
                leading={<MoonIcon className="h-5 w-5 text-indigo-500" />}
                trailing={
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
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
                leading={<EnvelopeIcon className="h-5 w-5 text-gray-500" />}
                trailing={
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                }
            />
            <AkListRow
                title="Push"
                subtitle="Sofortige Benachrichtigung"
                leading={<DevicePhoneMobileIcon className="h-5 w-5 text-gray-500" />}
                trailing={
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                }
            />
            <AkListRow
                title="Slack"
                subtitle="#general Channel"
                leading={<ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-500" />}
                trailing={
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                }
            />
        </div>
      </WidgetCard>

      <WidgetCard title="Kategorien" padding="none">
         <div className="divide-y divide-[var(--ak-color-border-hairline)]">
            <AkListRow title="System Updates" subtitle="Wartung, neue Features" trailing={<AkBadge tone="neutral">An</AkBadge>} />
            <AkListRow title="Sicherheit" subtitle="Login Alerts, Policy" trailing={<AkBadge tone="success">Wichtig</AkBadge>} />
            <AkListRow title="Leads & Sales" subtitle="Neue Deals, Statusänderungen" trailing={<AkBadge tone="neutral">An</AkBadge>} />
            <AkListRow title="Marketing" subtitle="Kampagnen Status" trailing={<AkBadge tone="neutral">Aus</AkBadge>} />
         </div>
      </WidgetCard>
    </div>
  )
}
