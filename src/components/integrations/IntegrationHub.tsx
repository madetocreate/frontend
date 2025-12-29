'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Check, Loader2, ExternalLink, Zap, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import clsx from 'clsx'

import { ImapConnectDrawer } from '@/components/integrations/imap/ImapConnectDrawer'
import { GoogleFamilyConnectDrawer } from '@/components/integrations/google/GoogleFamilyConnectDrawer'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkButton } from '@/components/ui/AkButton'

import { 
  INTEGRATIONS_CATALOG, 
  INTEGRATION_CATEGORIES, 
  getIntegrationById, 
  type IntegrationCatalogItem, 
  type IntegrationConnection, 
  type IntegrationCategory 
} from '@/lib/integrations/catalog'

export function IntegrationHub() {
  const [catalog, setCatalog] = useState<IntegrationCatalogItem[]>([])
  const [connections, setConnections] = useState<IntegrationConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<IntegrationCategory>('All')
  const [sortBy, setSortBy] = useState<'popular' | 'name' | 'new'>('popular')
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationCatalogItem | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()

  // Deep linking logic
  useEffect(() => {
    const integrationKey = searchParams?.get('integration')
    if (integrationKey && catalog.length > 0) {
      const integration = getIntegrationById(integrationKey)
      if (integration) {
        setSelectedIntegration(integration)
      }
    }
  }, [searchParams, catalog])

  // Clear query param on close
  const handleCloseDrawer = () => {
    setSelectedIntegration(null)
    const newParams = new URLSearchParams(searchParams?.toString())
    newParams.delete('integration')
    router.replace(`?${newParams.toString()}`, { scroll: false })
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setAuthError(false)
    try {
      const { authedFetch } = await import('@/lib/api/authedFetch')
      
      // Load catalog (static + local overrides if any) and connections
      const [catalogRes, connectionsRes] = await Promise.all([
        authedFetch('/api/integrations/hub/catalog'),
        authedFetch('/api/integrations/hub/connections'),
      ])

      // Handle 401 specifically
      if (catalogRes.status === 401 || connectionsRes.status === 401) {
        setAuthError(true)
        setCatalog(INTEGRATIONS_CATALOG) // Show static catalog anyway
        setLoading(false)
        return
      }

      if (catalogRes.ok) {
        // In a real app we might merge server catalog with local
        // For now, local source of truth is fine, maybe merge status?
        setCatalog(INTEGRATIONS_CATALOG)
      } else {
        setCatalog(INTEGRATIONS_CATALOG)
      }

      if (connectionsRes.ok) {
        const data = await connectionsRes.json()
        setConnections(data.connections || [])
      }
    } catch (error) {
      console.error('Failed to load integration hub data:', error)
      setCatalog(INTEGRATIONS_CATALOG)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (provider: string) => {
    try {
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const response = await authedFetch('/api/integrations/hub/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.connect_url && !data.connect_url.startsWith('#mock')) {
          window.open(data.connect_url, '_blank', 'width=600,height=700')
        } else {
          // Mock mode: Just update local state
          setConnections(prev => [
            ...prev.filter(c => c.key !== provider),
            {
              key: provider,
              status: 'connected',
              connectedAt: new Date().toISOString(),
              accountLabel: 'Mock Account',
            },
          ])
        }
        // Don't close drawer immediately for family/groups
        if (!selectedIntegration?.children) {
           handleCloseDrawer()
        }
      }
    } catch (error) {
      console.error('Failed to connect integration:', error)
    }
  }

  const handleDisconnect = async (provider: string) => {
    try {
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const response = await authedFetch('/api/integrations/hub/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })

      if (response.ok) {
        setConnections(prev => prev.filter(c => c.key !== provider))
        // Don't close drawer for family groups
        if (!selectedIntegration?.children) {
           handleCloseDrawer()
        }
      }
    } catch (error) {
      console.error('Failed to disconnect integration:', error)
    }
  }

  const recommendedIntegrations = useMemo(() => {
    return catalog
      .filter(item => item.onboardingRecommended)
      .sort((a, b) => (a.hubOrder || 99) - (b.hubOrder || 99))
  }, [catalog])

  const filteredAndSortedCatalog = useMemo(() => {
    let filtered = catalog

    // Filter by category
    if (activeCategory !== 'All') {
      filtered = filtered.filter(item => item.category === activeCategory)
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      // Always respect hubOrder first if set
      if (a.hubOrder && b.hubOrder) return a.hubOrder - b.hubOrder
      if (a.hubOrder) return -1
      if (b.hubOrder) return 1

      if (sortBy === 'popular') {
        if (a.isPopular && !b.isPopular) return -1
        if (!a.isPopular && b.isPopular) return 1
      } else if (sortBy === 'new') {
        if (a.isNew && !b.isNew) return -1
        if (!a.isNew && b.isNew) return 1
      }
      return a.name.localeCompare(b.name)
    })

    return sorted
  }, [catalog, activeCategory, searchQuery, sortBy])

  const getConnectionStatus = (key: string): IntegrationConnection | undefined => {
    return connections.find(c => c.key === key)
  }

  const renderIntegrationCard = (item: IntegrationCatalogItem) => {
    // Check connection status (complex for family groups)
    let isConnected = false
    const connection = getConnectionStatus(item.key)
    
    if (item.children) {
      isConnected = item.children.some(child => 
        connections.some(c => c.key === child.id && c.status === 'connected')
      )
    } else {
      isConnected = connection?.status === 'connected'
    }

    return (
      <motion.div
        key={item.key}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <WidgetCard
          title={item.name}
          subtitle={item.category}
          actions={
            isConnected && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)] text-[10px] font-bold uppercase tracking-wider border border-[var(--ak-semantic-success)]/10">
                <Check className="h-3 w-3" />
                <span>Verbunden</span>
              </div>
            )
          }
          className="h-full hover:-translate-y-0.5"
          padding="md"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl ak-bg-surface-2 border ak-border-fine flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                {item.logoPath ? (
                  <Image 
                    src={item.logoPath} 
                    alt={item.name} 
                    width={32} 
                    height={32} 
                    className="w-7 h-7 object-contain opacity-90 grayscale-[0.2] group-hover:grayscale-0 transition-all"
                  />
                ) : (
                  <span className="text-xl select-none" role="img" aria-label={item.name}>
                    {item.icon || '🔌'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm ak-text-secondary line-clamp-2 leading-tight">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="mt-auto pt-4 flex gap-2">
              <AkButton
                variant={isConnected ? "secondary" : "primary"}
                accent={isConnected ? "graphite" : "default"}
                size="sm"
                className="flex-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIntegration(item)
                }}
                disabled={item.availability === 'coming_soon'}
              >
                {item.availability === 'coming_soon' ? 'Bald verfügbar' : (isConnected ? 'Verwalten' : 'Verbinden')}
              </AkButton>
            </div>
          </div>
        </WidgetCard>
      </motion.div>
    )
  }

  if (loading && catalog.length === 0) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--ak-color-accent)]" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      {/* Auth Error Banner */}
      {authError && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 text-amber-900"
        >
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
          <div className="text-sm">
            <strong className="block font-medium mb-1">Authentifizierungsproblem</strong>
            <p>Wir konnten deinen Status nicht vollständig laden (401). Bitte lade die Seite neu oder melde dich erneut an.</p>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold ak-text-primary mb-2 tracking-tight">Integrationen</h1>
          <p className="ak-text-secondary text-lg max-w-2xl">
            Verbinde AKLOW mit deinen Diensten für automatische Synchronisierung.
            {connections.length > 0 && (
              <span className="inline-block ml-2 px-2 py-0.5 rounded-full bg-[var(--ak-color-accent)]/10 text-[var(--ak-color-accent)] text-xs font-medium align-middle">
                {connections.length} aktiv
              </span>
            )}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ak-text-secondary pointer-events-none" />
            <input
              type="text"
              placeholder="Suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl ak-bg-surface-2 ak-border-default border ak-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]/50 transition-all placeholder:text-[var(--ak-text-muted)]"
            />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2.5 rounded-xl ak-bg-surface-2 ak-border-default border ak-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]/50 text-sm font-medium cursor-pointer"
            >
              <option value="popular">Beliebt</option>
              <option value="name">Name (A-Z)</option>
              <option value="new">Neu</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {INTEGRATION_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={clsx(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border',
                activeCategory === category
                  ? 'bg-[var(--ak-color-accent)] border-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] shadow-sm'
                  : 'bg-transparent border-transparent ak-text-secondary hover:ak-bg-surface-2 hover:ak-text-primary'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {filteredAndSortedCatalog.map(renderIntegrationCard)}
      </div>

      {filteredAndSortedCatalog.length === 0 && (
        <div className="text-center py-24 ak-text-secondary">
          <p className="text-lg font-medium mb-1">Keine Integrationen gefunden</p>
          <p className="text-sm">Versuche es mit einem anderen Suchbegriff.</p>
        </div>
      )}

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedIntegration && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
              onClick={handleCloseDrawer}
            />
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-[480px] ak-bg-surface border-l ak-border-default z-50 overflow-y-auto shadow-2xl"
            >
              {(() => {
                // 1. Google Family
                if (selectedIntegration.key === 'google') {
                  return (
                    <GoogleFamilyConnectDrawer 
                      integration={selectedIntegration}
                      connections={connections}
                      onConnect={handleConnect}
                      onDisconnect={handleDisconnect}
                      onClose={handleCloseDrawer}
                    />
                  )
                }

                // 2. IMAP
                if (selectedIntegration.key === 'imap') {
                  const isConnected = connections.some(c => c.key === 'imap' && c.status === 'connected')
                  if (!isConnected) {
                    return (
                      <div className="p-6 h-full flex flex-col">
                        <ImapConnectDrawer
                          onConnect={() => {
                            loadData()
                            handleCloseDrawer()
                          }}
                          onCancel={handleCloseDrawer}
                        />
                      </div>
                    )
                  }
                  // Fallthrough to default view if connected
                }

                // 3. Default View
                const connection = getConnectionStatus(selectedIntegration.key)
                const isConnected = connection?.status === 'connected'

                return (
                <div className="p-8 space-y-8 h-full flex flex-col">
                  {/* Drawer Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 rounded-2xl ak-bg-surface-2 border ak-border-default flex items-center justify-center p-4">
                        {selectedIntegration.logoPath ? (
                          <Image 
                            src={selectedIntegration.logoPath} 
                            alt={selectedIntegration.name} 
                            width={64} 
                            height={64} 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-4xl">{selectedIntegration.icon || '🔌'}</span>
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold ak-text-primary tracking-tight">{selectedIntegration.name}</h2>
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md ak-bg-surface-2 text-xs font-medium ak-text-secondary">
                          {selectedIntegration.category}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleCloseDrawer}
                      className="p-2 rounded-full hover:ak-bg-surface-2 transition-colors ak-text-secondary hover:ak-text-primary"
                    >
                      <span className="sr-only">Schließen</span>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-6 flex-1">
                    <p className="ak-text-primary text-lg leading-relaxed">{selectedIntegration.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {selectedIntegration.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-lg ak-bg-surface-2 text-sm ak-text-secondary border ak-border-default"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Status Info */}
                    {isConnected && (
                       <div className="p-4 rounded-xl bg-[var(--ak-semantic-success-soft)] border border-[var(--ak-semantic-success)]/20 space-y-2">
                          <div className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-[var(--ak-semantic-success)]" />
                            <span className="font-semibold text-[var(--ak-semantic-success)]">Aktiv verbunden</span>
                          </div>
                          <div className="pl-7 space-y-1 text-sm ak-text-secondary">
                             {connection.accountLabel && <p>Account: {connection.accountLabel}</p>}
                             {connection.lastSyncAt && <p>Sync: {new Date(connection.lastSyncAt).toLocaleString()}</p>}
                          </div>
                       </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-auto pt-6 border-t ak-border-default flex flex-col gap-3">
                    {selectedIntegration.availability === 'coming_soon' && (
                        <AkButton disabled className="w-full py-4">
                          Bald verfügbar
                        </AkButton>
                    )}

                    {selectedIntegration.availability === 'beta' && (
                       <div className="mb-2 text-center">
                          <p className="text-xs text-purple-600 font-medium bg-purple-50 py-1.5 px-3 rounded-lg inline-block">
                             Beta-Feature: Nutzung auf eigene Gefahr 🧪
                          </p>
                       </div>
                    )}

                    {selectedIntegration.connectMode === 'link' && (
                         <AkButton
                           as="a"
                           href={selectedIntegration.deepLinkTarget?.route || '#'}
                           variant="primary"
                           leftIcon={<ExternalLink className="h-4 w-4" />}
                           className="w-full py-4"
                         >
                           Extern öffnen
                         </AkButton>
                    )}

                    {selectedIntegration.availability === 'available' && selectedIntegration.connectMode !== 'link' && (
                      <>
                        {isConnected ? (
                            <AkButton
                              onClick={() => handleDisconnect(selectedIntegration.key)}
                              variant="secondary"
                              className="w-full py-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Verbindung trennen
                            </AkButton>
                        ) : (
                          <AkButton
                            onClick={() => handleConnect(selectedIntegration.key)}
                            variant="primary"
                            leftIcon={<Zap className="h-5 w-5" />}
                            className="w-full py-4 shadow-lg shadow-[var(--ak-color-accent)]/20"
                          >
                            Jetzt verbinden
                          </AkButton>
                        )}
                      </>
                    )}
                  </div>
                </div>)
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
