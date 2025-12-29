'use client'

import { useEffect, useState } from 'react'
import { WebsiteView } from './WebsiteSidebarWidget'
import { WebsiteOverview } from './WebsiteOverview'
import { WebsiteConversationViewer } from './WebsiteConversationViewer'
import { BotConsoleLayout, BotTabId, BotStatus } from '@/components/bots/BotConsoleLayout'
import { BotInspector } from '@/components/bots/BotInspector'
import { GlobeAltIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { loadIntegrationStatuses } from '@/lib/integrations/storage'
import { useRouter } from 'next/navigation'
import { AkButton } from '@/components/ui/AkButton'

// Map WebsiteView to BotTabId
function mapViewToTab(view: WebsiteView): BotTabId {
  switch (view) {
    case 'overview':
      return 'overview'
    case 'conversations':
      return 'logs'
    case 'setup':
      return 'setup'
    default:
      return 'overview'
  }
}

export function WebsiteDashboard({ view }: { view: WebsiteView }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<BotTabId>(mapViewToTab(view))
  const [status, setStatus] = useState<BotStatus>('needs_setup')

  useEffect(() => {
    const integrations = loadIntegrationStatuses()
    const connected = integrations['website_bot']?.connected === true
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
        return <WebsiteOverview />
      case 'logs':
        return <WebsiteConversationViewer />
      case 'setup':
        return (
          <div className="space-y-6">
            <div className="p-6 border border-[var(--ak-color-border-subtle)] rounded-lg">
                <h3 className="text-lg font-medium mb-2">Widget Integration</h3>
                <p className="text-sm text-[var(--ak-color-text-secondary)] mb-4">
                    Kopieren Sie das Snippet in den Head-Bereich Ihrer Website.
                </p>
                <code className="block p-4 bg-[var(--ak-color-bg-surface-muted)] rounded text-xs overflow-x-auto">
                    {`<script src="https://cdn.aklow.com/widget.js" data-site-key="YOUR_KEY"></script>`}
                </code>
            </div>
          </div>
        )
      case 'configuration':
        return (
          <div className="space-y-6">
            <section className="bg-[var(--ak-color-bg-surface-muted)] p-6 rounded-lg text-center">
              <h2 className="text-lg font-semibold mb-2">Einstellungen</h2>
              <p className="text-sm text-[var(--ak-color-text-secondary)] mb-4">
                Design, Branding und Verhaltensregeln finden Sie in den zentralen Einstellungen.
              </p>
              <AkButton 
                onClick={() => router.push('/settings?view=website')}
                variant="secondary"
              >
                <Cog6ToothIcon className="w-4 h-4 mr-2" />
                Einstellungen öffnen
              </AkButton>
            </section>
          </div>
        )
      default:
        return <WebsiteOverview />
    }
  }

  const rightRail = (
    <BotInspector
      health={{
        status: 'healthy',
        message: 'Website-Bot läuft normal',
        lastCheck: 'Vor 2 Minuten',
      }}
      lastEvents={[
        {
          id: '1',
          type: 'conversation',
          message: 'Neue Konversation gestartet',
          timestamp: 'Vor 5 Minuten',
        },
      ]}
      quickTests={[
        {
          id: '1',
          label: 'Widget testen',
          status: 'pass',
          onClick: () => {},
        },
      ]}
    />
  )

  return (
    <BotConsoleLayout
      title="WebsiteBot"
      description="Chat-Sessions und Besucherinteraktionen verwalten"
      icon={GlobeAltIcon}
      status={status}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      primaryAction={{
        label: 'Einstellungen',
        icon: Cog6ToothIcon,
        onClick: () => router.push('/settings?view=website'),
      }}
      rightRail={rightRail}
    >
      {renderTabContent()}
    </BotConsoleLayout>
  )
}
