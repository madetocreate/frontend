'use client'

import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { 
  CheckCircleIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface ReviewPlatform {
  id: string
  name: string
  icon: string
  description: string
  connected: boolean
  color: string
}

export function ReviewProfiIntegrations() {
  const [platforms, setPlatforms] = useState<ReviewPlatform[]>([
    {
      id: 'trustpilot',
      name: 'Trustpilot',
      icon: '⭐',
      description: 'Bewertungen verwalten und Einladungen senden',
      connected: false,
      color: 'bg-[var(--ak-semantic-success-soft)] border-[var(--ak-semantic-success)]/50'
    },
    {
      id: 'tripadvisor',
      name: 'Tripadvisor',
      icon: '🦉',
      description: 'Reisebewertungen und Antworten verwalten',
      connected: false,
      color: 'bg-[var(--ak-semantic-success-soft)] border-[var(--ak-semantic-success)]/50'
    },
    {
      id: 'google-reviews',
      name: 'Google Reviews',
      icon: '🔵',
      description: 'Google My Business Bewertungen',
      connected: false,
      color: 'bg-[var(--ak-accent-inbox-soft)] border-[var(--ak-accent-inbox)]/50'
    },
    {
      id: 'yelp',
      name: 'Yelp',
      icon: '💬',
      description: 'Yelp Bewertungen und Antworten',
      connected: false,
      color: 'bg-[var(--ak-semantic-danger-soft)] border-[var(--ak-semantic-danger)]/50'
    },
    {
      id: 'facebook-reviews',
      name: 'Facebook Reviews',
      icon: '📘',
      description: 'Facebook Seitenbewertungen',
      connected: false,
      color: 'bg-[var(--ak-accent-inbox-soft)] border-[var(--ak-accent-inbox)]/50'
    },
  ])

  const [loading, setLoading] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Load connection status from API
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const { authedFetch } = await import('@/lib/api/authedFetch')
        const res = await authedFetch('/api/reviews/status')
        if (res.ok) {
          const data = await res.json()
          const connected = data.connected === true
          setIsConnected(connected)
          // If connected, mark all platforms as connected (simplified for now)
          if (connected) {
            setPlatforms(prev => prev.map(p => ({ ...p, connected: true })))
          }
        }
      } catch (error) {
        console.error('Failed to load reviews status:', error)
      }
    }
    void loadStatus()
  }, [])

  const handleConnect = async (platformId: string) => {
    setLoading(platformId)
    try {
      // TODO: Implement actual connection logic via API
      // For now, this is a placeholder - actual connection would go through OAuth/Nango
      console.warn('Connect not yet implemented for platform:', platformId)
      // After successful connection, reload status from API
      // await loadStatus()
    } catch (error) {
      console.error('Connection failed:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleDisconnect = async (platformId: string) => {
    setLoading(platformId)
    try {
      // TODO: Implement actual disconnection logic via API
      console.warn('Disconnect not yet implemented for platform:', platformId)
      // After successful disconnection, reload status from API
      // await loadStatus()
      // For now, just update UI optimistically
      setPlatforms(prev => prev.map(p => 
        p.id === platformId ? { ...p, connected: false } : p
      ))
      setIsConnected(false)
    } catch (error) {
      console.error('Disconnect failed:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--ak-color-text-primary)]">Review-Plattformen</h2>
          <p className="text-[var(--ak-color-text-secondary)] mt-1">Verbinden Sie Ihre Review-Plattformen</p>
        </div>
      </div>

      {/* Platforms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform) => (
          <div
            key={platform.id}
          className={clsx(
            'p-6 ak-card-glass rounded-3xl border-2 transition-all duration-300',
            platform.connected 
              ? 'border-[var(--ak-semantic-success)]/50 ak-bg-success-soft shadow-lg hover:shadow-xl'
              : 'ak-border-default ak-bg-surface-0 hover:ak-shadow-md'
          )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{platform.icon}</span>
                <div>
                  <h3 className="text-lg font-bold ak-text-primary">{platform.name}</h3>
                  <p className="text-sm ak-text-secondary mt-1">{platform.description}</p>
                </div>
              </div>
              {platform.connected && (
                <div className="p-2 ak-bg-success-soft rounded-xl">
                  <CheckCircleIcon className="h-5 w-5 text-[var(--ak-semantic-success)]" />
                </div>
              )}
            </div>

            <div className="mt-4">
              {platform.connected ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[var(--ak-semantic-success)]">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Verbunden</span>
                  </div>
                    <button
                    onClick={() => handleDisconnect(platform.id)}
                    disabled={loading === platform.id}
                    className="w-full px-4 py-2 ak-bg-surface-0 rounded-xl border ak-border-danger ak-text-danger hover:ak-bg-danger-soft transition-colors font-medium disabled:opacity-50"
                  >
                    {loading === platform.id ? (
                      <ArrowPathIcon className="h-5 w-5 mx-auto animate-spin" />
                    ) : (
                      'Trennen'
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(platform.id)}
                  disabled={loading === platform.id}
                  className="w-full px-4 py-2 ak-btn-primary ak-btn-gradient rounded-xl transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === platform.id ? (
                    <ArrowPathIcon className="h-5 w-5 mx-auto animate-spin" />
                  ) : (
                    'Verbinden'
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
          <div className="ak-card-glass rounded-2xl border ak-border-default p-4 flex items-start gap-3">
        <SparklesIcon className="h-5 w-5 text-[var(--ak-accent-inbox)] flex-shrink-0 mt-0.5" />
        <div className="text-sm ak-text-secondary">
          <p className="font-semibold mb-1 ak-text-primary">Review Profi Integration</p>
          <p>Verbinden Sie Ihre Review-Plattformen, um alle Bewertungen an einem Ort zu verwalten, automatisch zu beantworten und detaillierte Analytics zu erhalten.</p>
        </div>
      </div>
    </div>
  )
}
