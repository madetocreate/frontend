'use client'

import { useEffect, useState } from 'react'
import { TelephonyView } from './TelephonySidebarWidget'
import { TelephonyOverview } from './TelephonyOverview'
import { TelephonyLogViewer } from './TelephonyLogViewer'
import { BotConsoleLayout, BotTabId, BotStatus } from '@/components/bots/BotConsoleLayout'
import { BotInspector } from '@/components/bots/BotInspector'
import { PhoneIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { loadIntegrationStatuses } from '@/lib/integrations/storage'
import { useRouter } from 'next/navigation'
import { AkButton } from '@/components/ui/AkButton'

// Map TelephonyView to BotTabId
function mapViewToTab(view: TelephonyView): BotTabId {
  switch (view) {
    case 'overview':
      return 'overview'
    case 'logs':
      return 'logs'
    case 'numbers':
    case 'settings':
    case 'configuration':
      return 'configuration'
    default:
      return 'overview'
  }
}

export function TelephonyDashboard({ view }: { view: TelephonyView }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<BotTabId>(mapViewToTab(view))
  const [status, setStatus] = useState<BotStatus>('needs_setup')

  useEffect(() => {
    const integrations = loadIntegrationStatuses()
    const connected = integrations['phone_bot']?.connected === true
    setStatus(connected ? 'connected' : 'needs_setup')
  }, [])

  const tabs = [
    { id: 'overview' as BotTabId, label: 'Übersicht' },
    { id: 'setup' as BotTabId, label: 'Setup' },
    { id: 'configuration' as BotTabId, label: 'Konfiguration' },
    { id: 'logs' as BotTabId, label: 'Logs' },
  ]

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as BotTabId)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <TelephonyOverview />
      case 'logs':
        return <TelephonyLogViewer />
      case 'configuration':
        return (
          <div className="space-y-6">
            <section className="bg-[var(--ak-color-bg-surface-muted)] p-6 rounded-lg text-center">
              <h2 className="text-lg font-semibold mb-2">Einstellungen & Rufnummern</h2>
              <p className="text-sm text-[var(--ak-color-text-secondary)] mb-4">
                Die Verwaltung von Rufnummern und Bot-Verhalten finden Sie jetzt in den zentralen Einstellungen.
              </p>
              <AkButton 
                onClick={() => router.push('/settings?view=telephony')}
                variant="secondary"
              >
                <Cog6ToothIcon className="w-4 h-4 mr-2" />
                Einstellungen öffnen
              </AkButton>
            </section>
          </div>
        )
      case 'setup':
        return (
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-4">Erste Schritte</h2>
              <p className="text-sm text-[var(--ak-color-text-secondary)] mb-4">
                Richten Sie Ihren Telefon-Bot ein, um Anrufe automatisch zu verwalten.
              </p>
              <AkButton 
                onClick={() => router.push('/settings?view=addons&addon=telephony')}
                variant="secondary"
              >
                <PhoneIcon className="w-4 h-4 mr-2" />
                Rufnummer hinzufügen
              </AkButton>
            </section>
          </div>
        )
      default:
        return <TelephonyOverview />
    }
  }

  const rightRail = (
    <BotInspector
      health={{
        status: 'healthy',
        message: 'Telefon-Bot läuft normal',
        lastCheck: 'Vor 2 Minuten',
      }}
      lastEvents={[
        {
          id: '1',
          type: 'call',
          message: 'Neuer Anruf erhalten',
          timestamp: 'Vor 5 Minuten',
        },
      ]}
      quickTests={[
        {
          id: '1',
          label: 'Verbindung testen',
          status: 'pass',
          onClick: () => {},
        },
      ]}
    />
  )

  return (
    <BotConsoleLayout
      title="TelefonBot"
      description="Verwalten Sie Anrufe und Voicemails automatisch"
      icon={PhoneIcon}
      status={status}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      primaryAction={{
        label: 'Einstellungen',
        icon: Cog6ToothIcon,
        onClick: () => router.push('/settings?view=telephony'),
      }}
      rightRail={rightRail}
    >
      {renderTabContent()}
    </BotConsoleLayout>
  )
}
