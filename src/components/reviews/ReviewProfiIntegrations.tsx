'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircleIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

const API_BASE_URL = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL || 'http://localhost:4051'

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
      color: 'bg-green-50 border-green-200'
    },
    {
      id: 'tripadvisor',
      name: 'Tripadvisor',
      icon: '🦉',
      description: 'Reisebewertungen und Antworten verwalten',
      connected: false,
      color: 'bg-emerald-50 border-emerald-200'
    },
    {
      id: 'google-reviews',
      name: 'Google Reviews',
      icon: '🔵',
      description: 'Google My Business Bewertungen',
      connected: false,
      color: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'yelp',
      name: 'Yelp',
      icon: '💬',
      description: 'Yelp Bewertungen und Antworten',
      connected: false,
      color: 'bg-red-50 border-red-200'
    },
    {
      id: 'facebook-reviews',
      name: 'Facebook Reviews',
      icon: '📘',
      description: 'Facebook Seitenbewertungen',
      connected: false,
      color: 'bg-blue-50 border-blue-200'
    },
  ])

  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    // TODO: Load connection status from backend
    loadConnections()
  }, [])

  const loadConnections = async () => {
    try {
      // TODO: Fetch from backend
      // For now, use mock data
    } catch (error) {
      console.error('Failed to load connections:', error)
    }
  }

  const handleConnect = async (platformId: string) => {
    setLoading(platformId)
    try {
      const response = await fetch(`${API_BASE_URL}/v1/integrations/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: 'default',
          provider: platformId,
        }),
      })

      if (!response.ok) {
        throw new Error('Connection failed')
      }

      const data = await response.json()
      
      if (data.auth_url) {
        window.location.href = data.auth_url
      } else {
        // Update connection status
        setPlatforms(prev => prev.map(p => 
          p.id === platformId ? { ...p, connected: true } : p
        ))
      }
    } catch (error) {
      console.error('Connection failed:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleDisconnect = async (platformId: string) => {
    setLoading(platformId)
    try {
      // TODO: Implement disconnect
      setPlatforms(prev => prev.map(p => 
        p.id === platformId ? { ...p, connected: false } : p
      ))
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
          <h2 className="text-2xl font-bold text-gray-900">Review-Plattformen</h2>
          <p className="text-gray-600 mt-1">Verbinden Sie Ihre Review-Plattformen</p>
        </div>
      </div>

      {/* Platforms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform) => (
          <div
            key={platform.id}
            className={`p-6 bg-white/60 backdrop-blur-2xl rounded-3xl border-2 ${
              platform.connected 
                ? 'border-emerald-300/50 bg-emerald-50/30' 
                : 'border-gray-200/50'
            } shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{platform.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{platform.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{platform.description}</p>
                </div>
              </div>
              {platform.connected && (
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                </div>
              )}
            </div>

            <div className="mt-4">
              {platform.connected ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-emerald-700">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Verbunden</span>
                  </div>
                  <button
                    onClick={() => handleDisconnect(platform.id)}
                    disabled={loading === platform.id}
                    className="w-full px-4 py-2 bg-white border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
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
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="bg-blue-50/80 backdrop-blur-xl rounded-2xl border border-blue-200/50 p-4 flex items-start gap-3">
        <SparklesIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Review Profi Integration</p>
          <p>Verbinden Sie Ihre Review-Plattformen, um alle Bewertungen an einem Ort zu verwalten, automatisch zu beantworten und detaillierte Analytics zu erhalten.</p>
        </div>
      </div>
    </div>
  )
}
