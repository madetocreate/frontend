'use client'

import { 
  UserGroupIcon,
  LockClosedIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline'
import { SettingsSection, SettingsToggle } from './SettingsSection'
import { useAppSettings } from '@/contexts/AppSettingsContext'
import { useEntitlements } from '@/hooks/useEntitlements'
import { useRouter } from 'next/navigation'
import { AkButton } from '@/components/ui/AkButton'

type SettingsMode = 'simple' | 'expert'

export function SettingsCollaboration({ mode }: { mode: SettingsMode }) {
  const { tenantSettings, updateTenantSettings } = useAppSettings()
  const { isEntitled } = useEntitlements()
  const router = useRouter()

  const hasTeamsEntitlement = isEntitled('teams')
  const hasDirectMessagesEntitlement = isEntitled('directMessages')
  const teamsEnabled = tenantSettings.chat?.teamsEnabled ?? false
  const teamChannelsEnabled = tenantSettings.chat?.teamChannelsEnabled ?? false
  const directMessagesEnabled = tenantSettings.chat?.directMessagesEnabled ?? false

  const handleNavigateToBilling = () => {
    router.push('/settings?view=billing')
  }

  if (!hasTeamsEntitlement) {
    return (
      <div className="p-6 space-y-6">
        <SettingsSection 
          title="Teams & Zusammenarbeit" 
          description="Team-Management und kollaborative Features"
          mode={mode}
        >
          <div className="px-4 py-6 border border-[var(--ak-color-border-subtle)] rounded-lg bg-[var(--ak-color-bg-surface-muted)]">
            <div className="flex items-start gap-4">
              <LockClosedIcon className="h-6 w-6 text-[var(--ak-color-text-muted)] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)] mb-1">
                  Teams nur Premium
                </h3>
                <p className="text-sm text-[var(--ak-color-text-secondary)] mb-4">
                  Teams und Team-Channels sind nur im Premium-Plan verfügbar. Upgrade jetzt, um kollaborative Features zu nutzen.
                </p>
                <AkButton
                  variant="primary"
                  size="sm"
                  onClick={handleNavigateToBilling}
                >
                  Zu Abrechnung
                </AkButton>
              </div>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection 
          title="Einstellungen" 
          description="Diese Einstellungen sind nur mit Premium verfügbar"
          mode={mode}
        >
          <SettingsToggle
            title="Teams im Chat aktiv"
            subtitle="Aktiviert Team-Features im Chat"
            leading={<UserGroupIcon className="h-5 w-5" />}
            checked={teamsEnabled}
            onChange={() => {}}
            mode={mode}
            disabled={true}
          />
          <SettingsToggle
            title="Team-Channels im Chat anzeigen"
            subtitle="Zeigt Team-Channels in der Chat-Sidebar"
            leading={<ChatBubbleLeftRightIcon className="h-5 w-5" />}
            checked={teamChannelsEnabled}
            onChange={() => {}}
            mode={mode}
            disabled={true}
          />
          {hasDirectMessagesEntitlement && (
            <SettingsToggle
              title="Direktnachrichten im Chat anzeigen"
              subtitle="Zeigt Direktnachrichten in der Chat-Sidebar"
              leading={<ChatBubbleLeftIcon className="h-5 w-5" />}
              checked={directMessagesEnabled}
              onChange={() => {}}
              mode={mode}
              disabled={true}
            />
          )}
        </SettingsSection>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <SettingsSection 
        title="Teams & Zusammenarbeit" 
        description="Team-Management und kollaborative Features"
        mode={mode}
      >
        <SettingsToggle
          title="Teams im Chat aktiv"
          subtitle="Aktiviert Team-Features im Chat"
          leading={<UserGroupIcon className="h-5 w-5" />}
          checked={teamsEnabled}
          onChange={(checked) => {
            updateTenantSettings({
              chat: {
                ...tenantSettings.chat,
                teamsEnabled: checked,
              },
            })
          }}
          mode={mode}
        />
        <SettingsToggle
          title="Team-Channels im Chat anzeigen"
          subtitle="Zeigt Team-Channels in der Chat-Sidebar"
          leading={<ChatBubbleLeftRightIcon className="h-5 w-5" />}
          checked={teamChannelsEnabled}
          onChange={(checked) => {
            updateTenantSettings({
              chat: {
                ...tenantSettings.chat,
                teamChannelsEnabled: checked,
              },
            })
          }}
          mode={mode}
        />
        {hasDirectMessagesEntitlement && (
          <SettingsToggle
            title="Direktnachrichten im Chat anzeigen"
            subtitle="Zeigt Direktnachrichten in der Chat-Sidebar"
            leading={<ChatBubbleLeftIcon className="h-5 w-5" />}
            checked={directMessagesEnabled}
            onChange={(checked) => {
              updateTenantSettings({
                chat: {
                  ...tenantSettings.chat,
                  directMessagesEnabled: checked,
                },
              })
            }}
            mode={mode}
          />
        )}
        {mode === 'expert' && (
          <div className="px-4 py-3 text-xs text-[var(--ak-color-text-muted)] border-t border-[var(--ak-color-border-subtle)]">
            Hinweis: Teams sind serverseitig gated und erfordern ein Premium-Abonnement.
          </div>
        )}
      </SettingsSection>
    </div>
  )
}

