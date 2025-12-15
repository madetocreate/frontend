'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import { AkSearchField } from '@/components/ui/AkSearchField'
import { 
  CalendarIcon, 
  FolderIcon, 
  ShoppingCartIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  TicketIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  DevicePhoneMobileIcon,
  BuildingOfficeIcon,
  HomeIcon,
  GlobeAltIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  CameraIcon,
  BuildingLibraryIcon,
  EnvelopeIcon,
  VideoCameraIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  ClipboardDocumentListIcon,
  CloudIcon,
  BellIcon,
  StarIcon,
  ChatBubbleBottomCenterTextIcon,
  MagnifyingGlassIcon,
  PuzzlePieceIcon,
} from '@heroicons/react/24/outline'

interface Connection {
  tenant_id: string
  provider: string
  status: 'connected' | 'disconnected' | 'pending' | 'error'
  nango_connection_id?: string
  scopes: string[]
  auth_url?: string
  created_at?: string
  updated_at?: string
}

interface ProviderInfo {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: string
  color: string
}

const PROVIDERS: ProviderInfo[] = [
  // Productivity & Communication
  {
    id: 'google',
    name: 'Google Calendar',
    description: 'Kalender-Events lesen und erstellen',
    icon: CalendarIcon,
    category: 'Productivity',
    color: 'from-blue-100 to-blue-200',
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Dateien und Dokumente verwalten',
    icon: FolderIcon,
    category: 'Productivity',
    color: 'from-blue-100 to-blue-200',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Notizen und Dokumentation',
    icon: DocumentTextIcon,
    category: 'Productivity',
    color: 'from-gray-100 to-gray-200',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team-Kommunikation und Nachrichten',
    icon: ChatBubbleLeftRightIcon,
    category: 'Communication',
    color: 'from-purple-100 to-purple-200',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Nachrichten senden und empfangen',
    icon: DevicePhoneMobileIcon,
    category: 'Communication',
    color: 'from-green-100 to-green-200',
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    description: 'Outlook Kalender und E-Mail',
    icon: EnvelopeIcon,
    category: 'Productivity',
    color: 'from-blue-100 to-blue-200',
  },
  // E-Commerce
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Bestellungen und Kunden verwalten',
    icon: ShoppingCartIcon,
    category: 'E-Commerce',
    color: 'from-green-100 to-green-200',
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    description: 'WooCommerce Bestellungen verwalten',
    icon: ShoppingBagIcon,
    category: 'E-Commerce',
    color: 'from-purple-100 to-purple-200',
  },
  // CRM & Support
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'CRM und Marketing Automation',
    icon: ChartBarIcon,
    category: 'CRM',
    color: 'from-orange-100 to-orange-200',
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Customer Support und Tickets',
    icon: TicketIcon,
    category: 'CRM',
    color: 'from-blue-100 to-blue-200',
  },
  // Hotel & Booking
  {
    id: 'booking-com',
    name: 'Booking.com',
    description: 'Reservierungen und Buchungen verwalten',
    icon: BuildingOfficeIcon,
    category: 'Hotel',
    color: 'from-blue-100 to-blue-200',
  },
  {
    id: 'airbnb',
    name: 'Airbnb',
    description: 'Airbnb Reservierungen verwalten',
    icon: HomeIcon,
    category: 'Hotel',
    color: 'from-pink-100 to-pink-200',
  },
  {
    id: 'expedia',
    name: 'Expedia',
    description: 'Expedia Buchungen verwalten',
    icon: GlobeAltIcon,
    category: 'Hotel',
    color: 'from-orange-100 to-orange-200',
  },
  {
    id: 'hrs',
    name: 'HRS',
    description: 'HRS Reservierungen verwalten',
    icon: BuildingOffice2Icon,
    category: 'Hotel',
    color: 'from-red-100 to-red-200',
  },
  {
    id: 'hotels-com',
    name: 'Hotels.com',
    description: 'Hotels.com Buchungen verwalten',
    icon: BuildingStorefrontIcon,
    category: 'Hotel',
    color: 'from-yellow-100 to-yellow-200',
  },
  {
    id: 'trivago',
    name: 'Trivago',
    description: 'Trivago Buchungen verwalten',
    icon: MagnifyingGlassIcon,
    category: 'Hotel',
    color: 'from-purple-100 to-purple-200',
  },
  {
    id: 'agoda',
    name: 'Agoda',
    description: 'Agoda Reservierungen verwalten',
    icon: GlobeAltIcon,
    category: 'Hotel',
    color: 'from-indigo-100 to-indigo-200',
  },
  // Real Estate
  {
    id: 'immobilienscout24',
    name: 'Immobilienscout24',
    description: 'Immobilien verwalten und veröffentlichen',
    icon: BuildingOfficeIcon,
    category: 'Real Estate',
    color: 'from-blue-100 to-blue-200',
  },
  {
    id: 'idealista',
    name: 'Idealista',
    description: 'Immobilien verwalten (Spanien)',
    icon: MapPinIcon,
    category: 'Real Estate',
    color: 'from-orange-100 to-orange-200',
  },
  {
    id: 'immowelt',
    name: 'ImmoWelt',
    description: 'Immobilien verwalten',
    icon: GlobeAltIcon,
    category: 'Real Estate',
    color: 'from-green-100 to-green-200',
  },
  {
    id: 'ebay-kleinanzeigen',
    name: 'eBay Kleinanzeigen',
    description: 'Immobilien inserieren',
    icon: ClipboardDocumentListIcon,
    category: 'Real Estate',
    color: 'from-yellow-100 to-yellow-200',
  },
  {
    id: 'wohnung-de',
    name: 'Wohnung.de',
    description: 'Wohnungen verwalten',
    icon: HomeIcon,
    category: 'Real Estate',
    color: 'from-blue-100 to-blue-200',
  },
  {
    id: 'immonet',
    name: 'Immonet',
    description: 'Immobilien verwalten',
    icon: BuildingOffice2Icon,
    category: 'Real Estate',
    color: 'from-purple-100 to-purple-200',
  },
  {
    id: 'fotocasa',
    name: 'Fotocasa',
    description: 'Immobilien verwalten (Spanien)',
    icon: CameraIcon,
    category: 'Real Estate',
    color: 'from-red-100 to-red-200',
  },
  {
    id: 'habitaclia',
    name: 'Habitaclia',
    description: 'Immobilien verwalten (Spanien)',
    icon: BuildingLibraryIcon,
    category: 'Real Estate',
    color: 'from-orange-100 to-orange-200',
  },
  // Health & Practice
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Video-Konsultationen und Telemedizin',
    icon: VideoCameraIcon,
    category: 'Health',
    color: 'from-blue-100 to-blue-200',
  },
  {
    id: 'calendly',
    name: 'Calendly',
    description: 'Terminbuchung und Scheduling',
    icon: CalendarIcon,
    category: 'Health',
    color: 'from-purple-100 to-purple-200',
  },
  {
    id: 'doxy-me',
    name: 'Doxy.me',
    description: 'Telemedizin-Plattform',
    icon: VideoCameraIcon,
    category: 'Health',
    color: 'from-green-100 to-green-200',
  },
  {
    id: 'simplepractice',
    name: 'SimplePractice',
    description: 'Practice Management System',
    icon: BriefcaseIcon,
    category: 'Health',
    color: 'from-indigo-100 to-indigo-200',
  },
  {
    id: 'jane-app',
    name: 'Jane App',
    description: 'Practice Management System',
    icon: BuildingOffice2Icon,
    category: 'Health',
    color: 'from-pink-100 to-pink-200',
  },
  {
    id: 'epic-mychart',
    name: 'Epic MyChart',
    description: 'EHR Integration (FHIR)',
    icon: ClipboardDocumentListIcon,
    category: 'Health',
    color: 'from-orange-100 to-orange-200',
  },
  {
    id: 'doctolib',
    name: 'Doctolib',
    description: 'Terminbuchung (Europa)',
    icon: CalendarIcon,
    category: 'Health',
    color: 'from-blue-100 to-blue-200',
  },
  // Apple Services
  {
    id: 'apple-signin',
    name: 'Apple Sign In',
    description: 'Apple ID Authentifizierung',
    icon: PuzzlePieceIcon,
    category: 'Apple',
    color: 'from-gray-100 to-gray-200',
  },
  {
    id: 'icloud-calendar',
    name: 'iCloud Calendar',
    description: 'iCloud Kalender verwalten',
    icon: CalendarIcon,
    category: 'Apple',
    color: 'from-blue-100 to-blue-200',
  },
  {
    id: 'icloud-drive',
    name: 'iCloud Drive',
    description: 'iCloud Drive Dateien verwalten',
    icon: CloudIcon,
    category: 'Apple',
    color: 'from-blue-100 to-blue-200',
  },
  {
    id: 'apple-push-notifications',
    name: 'Apple Push Notifications',
    description: 'Push-Benachrichtigungen senden',
    icon: BellIcon,
    category: 'Apple',
    color: 'from-gray-100 to-gray-200',
  },
  // Reviews
  {
    id: 'trustpilot',
    name: 'Trustpilot',
    description: 'Bewertungen verwalten und Einladungen senden',
    icon: StarIcon,
    category: 'Reviews',
    color: 'from-green-100 to-green-200',
  },
  {
    id: 'tripadvisor',
    name: 'Tripadvisor',
    description: 'Reisebewertungen und Antworten verwalten',
    icon: GlobeAltIcon,
    category: 'Reviews',
    color: 'from-emerald-100 to-emerald-200',
  },
  {
    id: 'google-reviews',
    name: 'Google Reviews',
    description: 'Google My Business Bewertungen',
    icon: StarIcon,
    category: 'Reviews',
    color: 'from-blue-100 to-blue-200',
  },
  {
    id: 'yelp',
    name: 'Yelp',
    description: 'Yelp Bewertungen und Antworten',
    icon: ChatBubbleBottomCenterTextIcon,
    category: 'Reviews',
    color: 'from-red-100 to-red-200',
  },
  {
    id: 'facebook-reviews',
    name: 'Facebook Reviews',
    description: 'Facebook Seitenbewertungen',
    icon: ChatBubbleLeftRightIcon,
    category: 'Reviews',
    color: 'from-blue-100 to-blue-200',
  },
]

const CATEGORIES = ['All', 'Productivity', 'Communication', 'E-Commerce', 'CRM', 'Hotel', 'Real Estate', 'Health', 'Apple', 'Reviews'] as const
type Category = typeof CATEGORIES[number]

const API_BASE_URL = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL || 'http://localhost:4051'

export default function IntegrationsDashboard() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tenantId] = useState('default-tenant')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category>('All')

  const loadConnections = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || ''
      if (!adminKey) {
        console.warn('NEXT_PUBLIC_ADMIN_KEY nicht gesetzt - verwende Mock-Daten')
        setConnections([])
        setLoading(false)
        return
      }
      
      const response = await fetch(`${API_BASE_URL}/v1/integrations/`, {
        method: 'GET',
        headers: {
          'x-tenant-id': tenantId,
          'x-ai-shield-admin-key': adminKey,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      })

      if (!response.ok) {
        throw new Error(`Failed to load connections: ${response.status}`)
      }

      const data = await response.json()
      setConnections(Array.isArray(data) ? data : [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Failed to load connections:', err)
      // Set empty array on error to allow UI to render
      setConnections([])
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  useEffect(() => {
    loadConnections()
  }, [loadConnections])

  const handleConnect = async (provider: string) => {
    try {
      setError(null)
      
      const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || ''
      if (!adminKey) {
        throw new Error('NEXT_PUBLIC_ADMIN_KEY nicht gesetzt')
      }
      
      const response = await fetch(`${API_BASE_URL}/v1/integrations/${provider}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ai-shield-admin-key': adminKey,
        },
        mode: 'cors',
        body: JSON.stringify({
          tenant_id: tenantId,
          provider: provider,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to initiate connection: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      
      if (data.auth_url) {
        window.location.href = data.auth_url
      } else {
        await loadConnections()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect'
      setError(errorMessage)
      console.error('Failed to connect:', err)
    }
  }

  const handleDisconnect = async (provider: string) => {
    if (!confirm(`Möchten Sie ${provider} wirklich trennen?`)) {
      return
    }

    try {
      setError(null)
      
      const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || ''
      if (!adminKey) {
        throw new Error('NEXT_PUBLIC_ADMIN_KEY nicht gesetzt')
      }
      
      const response = await fetch(
        `${API_BASE_URL}/v1/integrations/${provider}/disconnect?tenant_id=${tenantId}`,
        {
          method: 'POST',
          headers: {
            'x-ai-shield-admin-key': adminKey,
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to disconnect: ${response.status} ${errorText}`)
      }

      await loadConnections()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect'
      setError(errorMessage)
      console.error('Failed to disconnect:', err)
    }
  }

  const getConnectionStatus = (provider: string): Connection | undefined => {
    return connections.find((c) => c.provider === provider)
  }

  const getStatusBadge = (status: string) => {
    const toneMap: Record<string, 'success' | 'warning' | 'danger' | 'muted'> = {
      connected: 'success',
      disconnected: 'muted',
      pending: 'warning',
      error: 'danger',
    }

    const labels: Record<string, string> = {
      connected: 'Verbunden',
      disconnected: 'Nicht verbunden',
      pending: 'Ausstehend',
      error: 'Fehler',
    }

    return (
      <AkBadge tone={toneMap[status] || 'muted'} size="sm">
        {labels[status] || status}
      </AkBadge>
    )
  }

  // Filter providers
  const filteredProviders = PROVIDERS.filter((provider) => {
    const matchesSearch = 
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === 'All' || provider.category === activeCategory
    return matchesSearch && matchesCategory
  })

  // Group by category
  const groupedProviders = filteredProviders.reduce((acc, provider) => {
    if (!acc[provider.category]) {
      acc[provider.category] = []
    }
    acc[provider.category].push(provider)
    return acc
  }, {} as Record<string, ProviderInfo[]>)

  if (loading) {
    return (
      <div className="h-full flex flex-col overflow-hidden bg-[var(--ak-color-bg-app)]">
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-[var(--ak-color-border-subtle)]">
          <h1 className="ak-heading text-2xl font-bold text-[var(--ak-color-text-primary)] mb-1">Integrationen</h1>
          <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">Verwalte deine App-Verbindungen</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--ak-color-accent)] mx-auto mb-4"></div>
            <p className="text-sm text-[var(--ak-color-text-secondary)]">Lade Integrationen...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[var(--ak-color-bg-app)]">
      {/* Header - Apple Style */}
      <div className="shrink-0 px-6 pt-6 pb-4 border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-app)]">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="ak-heading text-2xl font-bold text-[var(--ak-color-text-primary)] mb-1">Integrationen</h1>
            <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">
              Verwalte deine App-Verbindungen und Nango-Integrationen
            </p>
          </div>
        </div>
        <AkSearchField 
          placeholder="Integrationen durchsuchen..." 
          value={searchQuery}
          onChange={setSearchQuery}
        />
        
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                activeCategory === category
                  ? 'bg-[var(--ak-color-accent)] text-white shadow-sm'
                  : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-surface)]'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800"
          >
            <strong>Fehler:</strong> {error}
          </motion.div>
        )}

        {Object.keys(groupedProviders).length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <PuzzlePieceIcon className="h-16 w-16 mx-auto mb-4 text-[var(--ak-color-text-muted)] opacity-30" />
              <p className="text-sm font-medium text-[var(--ak-color-text-primary)] mb-1">Keine Integrationen gefunden</p>
              <p className="text-xs text-[var(--ak-color-text-secondary)]">Versuche einen anderen Suchbegriff oder Filter</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedProviders).map(([category, providers]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="ak-heading text-lg font-semibold text-[var(--ak-color-text-primary)] mb-4">
                  {category}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {providers.map((provider) => {
                    const connection = getConnectionStatus(provider.id)
                    const isConnected = connection?.status === 'connected'
                    const Icon = provider.icon

                    return (
                      <motion.div
                        key={provider.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <WidgetCard className="apple-glass-enhanced hover:shadow-[var(--ak-shadow-md)] transition-all duration-200" padding="sm">
                          <div className="flex flex-col items-center text-center mb-3">
                            <div className={clsx(
                              'h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 mb-2',
                              provider.color
                            )}>
                              <Icon className="h-6 w-6 text-[var(--ak-color-text-primary)]" />
                            </div>
                            <h3 className="ak-heading text-xs font-semibold text-[var(--ak-color-text-primary)] truncate w-full">
                              {provider.name}
                            </h3>
                            <p className="ak-caption text-[10px] text-[var(--ak-color-text-secondary)] line-clamp-2 mt-0.5">
                              {provider.description}
                            </p>
                          </div>

                          <div className="mb-2 flex justify-center">
                            {getStatusBadge(connection?.status || 'disconnected')}
                          </div>

                          <div className="w-full">
                            {isConnected ? (
                              <AkButton
                                variant="secondary"
                                size="sm"
                                onClick={() => handleDisconnect(provider.id)}
                                className="flex-1"
                              >
                                Trennen
                              </AkButton>
                            ) : (
                              <AkButton
                                variant="primary"
                                size="sm"
                                onClick={() => handleConnect(provider.id)}
                                className="flex-1"
                              >
                                Verbinden
                              </AkButton>
                            )}
                          </div>
                        </WidgetCard>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
