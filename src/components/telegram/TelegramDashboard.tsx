'use client'

import { useEffect, useState } from 'react'
import { TelegramView } from './TelegramSidebarWidget'
import { TelegramOverview } from './TelegramOverview'
import { TelegramChats } from './TelegramChats'
import { TelegramBroadcast } from './TelegramBroadcast'
import { TelegramConfiguration } from './TelegramConfiguration'
import { TelegramWizard } from './TelegramWizard'
import { BotConsoleLayout, BotTabId, BotStatus } from '@/components/bots/BotConsoleLayout'
import { BotInspector } from '@/components/bots/BotInspector'
import { PaperAirplaneIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { loadIntegrationStatuses } from '@/lib/integrations/storage'
import { useRouter } from 'next/navigation'

function getTenantId(): string {
  if (typeof window === 'undefined') return 'aklow-main'
  return localStorage.getItem('tenant_id') || process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'aklow-main'
}

// Map TelegramView to BotTabId
function mapViewToTab(view: TelegramView): BotTabId {
  switch (view) {
    case 'overview':
      return 'overview'
    case 'chats':
      return 'logs'
    case 'broadcasts':
      return 'broadcasts'
    case 'configuration':
      return 'configuration'
    case 'setup':
      return 'setup'
    default:
      return 'overview'
  }
}

export function TelegramDashboard({ view }: { view: TelegramView }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<BotTabId>(mapViewToTab(view))
  const [status, setStatus] = useState<BotStatus>('needs_setup')

  useEffect(() => {
    const integrations = loadIntegrationStatuses()
    const connected = integrations['telegram']?.connected === true
    setStatus(connected ? 'connected' : 'needs_setup')
  }, [])

  const tabs = [
    { id: 'overview' as BotTabId, label: 'Übersicht' },
    { id: 'setup' as BotTabId, label: 'Setup' },
    { id: 'logs' as BotTabId, label: 'Chats' },
    { id: 'broadcasts' as BotTabId, label: 'Broadcasts' },
    { id: 'configuration' as BotTabId, label: 'Konfiguration' },
  ]

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as BotTabId)
    // Update URL to match tab
    const viewMap: Record<BotTabId, TelegramView> = {
      overview: 'overview',
      setup: 'setup',
      logs: 'chats',
      broadcasts: 'broadcasts',
      configuration: 'configuration',
    }
    const newView = viewMap[tab as BotTabId] || 'overview'
    router.replace(`/telegram?view=${newView}`)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <TelegramOverview />
      case 'logs':
        return <TelegramChats />
      case 'broadcasts':
        return <TelegramBroadcast />
      case 'configuration':
        return <TelegramConfiguration />
      case 'setup':
        return <TelegramWizard tenantId={getTenantId()} />
      default:
        return <TelegramOverview />
    }
  }

  const rightRail = (
    <BotInspector
      health={{
        status: 'healthy',
        message: 'Telegram-Bot läuft normal',
        lastCheck: 'Vor 2 Minuten',
      }}
      lastEvents={[
        {
          id: '1',
          type: 'message',
          message: 'Neue Nachricht erhalten',
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
      title="TelegramBot"
      description="Verwalten Sie Telegram-Chats und Broadcasts automatisch"
      icon={PaperAirplaneIcon}
      status={status}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      primaryAction={{
        label: 'Einstellungen',
        icon: Cog6ToothIcon,
        onClick: () => router.push('/settings?view=telegram'),
      }}
      rightRail={rightRail}
    >
      {renderTabContent()}
    </BotConsoleLayout>
  )
}

