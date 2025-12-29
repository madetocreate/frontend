'use client'

import { useEffect, useState } from 'react'
import { ReviewProfiOverview } from './ReviewProfiOverview'
import { ReviewProfiReviews } from './ReviewProfiReviews'
import { ReviewProfiAnalytics } from './ReviewProfiAnalytics'
import { ReviewProfiIntegrations } from './ReviewProfiIntegrations'
import { BotConsoleLayout, BotTabId, BotStatus } from '@/components/bots/BotConsoleLayout'
import { BotInspector } from '@/components/bots/BotInspector'
import { StarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { AkButton } from '@/components/ui/AkButton'

export type ReviewProfiView = 
  | 'overview' 
  | 'reviews' 
  | 'settings'
  | 'inbox'
  | 'tasks'
  | 'configuration'

// Map ReviewProfiView to BotTabId
function mapViewToTab(view: ReviewProfiView): BotTabId {
  switch (view) {
    case 'overview':
      return 'overview'
    case 'reviews':
    case 'inbox':
    case 'tasks':
      return 'logs'
    case 'settings':
    case 'configuration':
      return 'configuration'
    default:
      return 'overview'
  }
}

type ReviewProfiDashboardProps = {
  view: ReviewProfiView
}

export function ReviewProfiDashboard({ view }: ReviewProfiDashboardProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<BotTabId>(mapViewToTab(view))
  const [status, setStatus] = useState<BotStatus>('needs_setup')

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const { authedFetch } = await import('@/lib/api/authedFetch')
        const res = await authedFetch('/api/reviews/status')
        if (res.ok) {
          const data = await res.json()
          const connected = data.connected === true
          setStatus(connected ? 'connected' : 'needs_setup')
        } else {
          setStatus('needs_setup')
        }
      } catch (error) {
        console.error('Failed to load reviews status:', error)
        setStatus('needs_setup')
      }
    }
    void loadStatus()
  }, [])

  const tabs = [
    { id: 'overview' as BotTabId, label: 'Übersicht' },
    { id: 'setup' as BotTabId, label: 'Setup' },
    { id: 'configuration' as BotTabId, label: 'Konfiguration' },
    { id: 'logs' as BotTabId, label: 'Inbox & Logs' },
  ]

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as BotTabId)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ReviewProfiOverview />
      case 'logs':
        return <ReviewProfiReviews />
      case 'configuration':
        return (
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-4">Analytics & Insights</h2>
              <ReviewProfiAnalytics />
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-4">Integrationen</h2>
              <ReviewProfiIntegrations />
            </section>
            <section className="bg-[var(--ak-color-bg-surface-muted)] p-6 rounded-lg text-center">
              <h2 className="text-lg font-semibold mb-2">Einstellungen</h2>
              <p className="text-sm text-[var(--ak-color-text-secondary)] mb-4">
                Die Konfiguration für den Review Bot finden Sie jetzt in den zentralen Einstellungen.
              </p>
              <AkButton 
                onClick={() => router.push('/settings?view=reviews')}
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
                Verbinden Sie Ihren Google Business Account, um Bewertungen automatisch zu verwalten.
              </p>
              <ReviewProfiIntegrations />
            </section>
          </div>
        )
      default:
        return <ReviewProfiOverview />
    }
  }

  const rightRail = (
    <BotInspector
      health={{
        status: 'healthy',
        message: 'ReviewBot läuft normal',
        lastCheck: 'Vor 2 Minuten',
      }}
      lastEvents={[
        {
          id: '1',
          type: 'review',
          message: 'Neue Bewertung erhalten',
          timestamp: 'Vor 5 Minuten',
        },
      ]}
      quickTests={[
        {
          id: '1',
          label: 'Sync testen',
          status: 'pass',
          onClick: () => {},
        },
      ]}
    />
  )

  return (
    <BotConsoleLayout
      title="ReviewBot"
      description="Google-Bewertungen automatisch verwalten und beantworten"
      icon={StarIcon}
      status={status}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      primaryAction={{
        label: 'Einstellungen',
        icon: Cog6ToothIcon,
        onClick: () => router.push('/settings?view=reviews'),
      }}
      rightRail={rightRail}
    >
      {renderTabContent()}
    </BotConsoleLayout>
  )
}
