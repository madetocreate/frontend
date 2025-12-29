'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkSearchField } from '@/components/ui/AkSearchField'
import { ShieldCheckIcon, ServerStackIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { DynamicRechartsGatewayChart as RechartsGatewayChart } from '@/components/ui/DynamicRechartsGatewayChart'
import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid'
import { OutputCardFrame } from '@/components/ui/OutputCardFrame'

interface HealthData {
    status: string;
    detail?: string;
    [key: string]: unknown;
}

interface RegistryData {
    servers: Record<string, unknown>;
    [key: string]: unknown;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
}

export function ShieldOverview() {
    const [health, setHealth] = useState<HealthData | null>(null)
    const [registry, setRegistry] = useState<RegistryData | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const { authedFetch } = await import('@/lib/api/authedFetch')
                const res = await authedFetch('/api/shield/health')
                if (res.ok) {
                    const contentType = res.headers.get('content-type')
                    if (contentType && contentType.includes('application/json')) {
                        const data = await res.json()
                        setHealth(data)
                    } else {
                        setHealth({ status: 'error', detail: 'Invalid response type' })
                    }
                } else {
                    setHealth({ status: 'error', detail: `HTTP ${res.status}` })
                }
            } catch {
                setHealth({ status: 'error', detail: 'Network error' })
            }
        }

        const fetchRegistry = async () => {
            try {
                const { authedFetch } = await import('@/lib/api/authedFetch')
                const res = await authedFetch('/api/shield/v1/mcp/registry')
                if (res.ok) {
                    const contentType = res.headers.get('content-type')
                    if (contentType && contentType.includes('application/json')) {
                        const data = await res.json()
                        setRegistry(data)
                    } else {
                        setRegistry({ servers: {} })
                    }
                } else {
                    setRegistry({ servers: {} })
                }
            } catch {
                setRegistry({ servers: {} })
            }
        }

        fetchHealth()
        fetchRegistry()
    }, [])

    const serverCount = registry?.servers ? Object.keys(registry.servers).length : 0
    const isHealthy = health?.status === 'ok'

    return (
        <motion.div 
          className="h-full flex flex-col overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header - Apple Style */}
          <div className="shrink-0 px-6 pt-6 pb-4 border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-app)]">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="ak-heading text-2xl font-bold text-[var(--ak-color-text-primary)] mb-1">Systemübersicht</h1>
                <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">
                  Status und Metriken des AI Shield Systems
                </p>
              </div>
            </div>
            <AkSearchField 
              placeholder="System durchsuchen..." 
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <motion.div className="space-y-6" variants={itemVariants}>
              
              {/* AI Suggestions */}
              <OutputCardFrame>
                <WidgetCard padding="lg">
                  <AISuggestionGrid 
                    context="shield"
                    summary="Sicherheits-Status"
                    text="Das AI Shield System ist operational. Alle Policies sind aktiv."
                    className="!bg-transparent !border-0 !p-0"
                  />
                </WidgetCard>
              </OutputCardFrame>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div variants={itemVariants}>
                  <WidgetCard title="System Status" padding="lg" className="ak-bg-glass hover:ak-shadow-md transition-all duration-200">
                    <div className="flex flex-col gap-3 mt-2">
                      <div className="flex items-center gap-3">
                        <motion.div 
                          className={clsx(
                            'h-3 w-3 rounded-full',
                            isHealthy ? 'bg-[var(--ak-semantic-success)]' : 'bg-[var(--ak-semantic-danger)]'
                          )}
                          animate={{ 
                            scale: isHealthy ? [1, 1.2, 1] : 1,
                            opacity: isHealthy ? [1, 0.7, 1] : 1
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: isHealthy ? Infinity : 0
                          }}
                        />
                        <span className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
                          {isHealthy ? 'Operational' : 'Systemfehler'}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--ak-color-text-secondary)]">
                        Control Plane ist {isHealthy ? 'aktiv' : 'offline'}.
                      </p>
                    </div>
                  </WidgetCard>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <WidgetCard title="MCP Server" padding="lg" className="ak-bg-glass hover:ak-shadow-md transition-all duration-200">
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[var(--ak-semantic-info-soft)] flex items-center justify-center">
                          <ServerStackIcon className="h-5 w-5 text-[var(--ak-semantic-info)]" />
                        </div>
                        <span className="text-3xl font-bold text-[var(--ak-color-text-primary)]">
                          {serverCount}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--ak-color-text-secondary)]">
                        Registrierte Tool-Provider
                      </p>
                    </div>
                  </WidgetCard>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <WidgetCard title="Aktive Policies" padding="lg" className="ak-bg-glass hover:ak-shadow-md transition-all duration-200">
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[var(--ak-semantic-warning-soft)] flex items-center justify-center">
                          <ShieldCheckIcon className="h-5 w-5 text-[var(--ak-semantic-warning)]" />
                        </div>
                        <span className="text-3xl font-bold text-[var(--ak-color-text-primary)]">
                          Active
                        </span>
                      </div>
                      <p className="text-sm text-[var(--ak-color-text-secondary)]">
                        Gateway Protection enabled
                      </p>
                    </div>
                  </WidgetCard>
                </motion.div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={itemVariants}>
                  <WidgetCard title="Gateway Metriken" subtitle="Live Monitoring - Letzte 24h" className="ak-bg-glass">
                    <div className="pt-4">
                      <RechartsGatewayChart hours={24} height={250} metric="requests" />
                    </div>
                  </WidgetCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <WidgetCard title="Letzte Aktivitäten" subtitle="Recent Events" className="ak-bg-glass">
                    <div className="space-y-3 pt-2">
                      {[
                        { time: '10:42', action: 'Policy updated', status: 'success' },
                        { time: '10:38', action: 'Server registered', status: 'success' },
                        { time: '10:31', action: 'Security check', status: 'warning' },
                        { time: '10:15', action: 'System backup', status: 'success' },
                      ].map((log, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-xl border border-[var(--ak-color-border-subtle)] ak-bg-glass hover:ak-shadow-md transition-all duration-200"
                        >
                          <span className="font-mono text-xs text-[var(--ak-color-text-secondary)] min-w-[50px]">{log.time}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--ak-color-text-primary)]">{log.action}</p>
                          </div>
                          {log.status === 'success' ? (
                            <CheckCircleIcon className="h-5 w-5 text-[var(--ak-semantic-success)] flex-shrink-0" />
                          ) : (
                            <ExclamationTriangleIcon className="h-5 w-5 text-[var(--ak-semantic-warning)] flex-shrink-0" />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </WidgetCard>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
    )
}
