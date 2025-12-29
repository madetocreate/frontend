'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkBadge } from '@/components/ui/AkBadge'
import { PhoneIcon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { DynamicRechartsPerformanceChart as RechartsPerformanceChart } from '@/components/ui/DynamicRechartsPerformanceChart'
import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid'
import { OutputCardFrame } from '@/components/ui/OutputCardFrame'
import { loadIntegrationStatuses } from '@/lib/integrations/storage'
import type { IntegrationStatus } from '@/lib/integrations/types'
import { useTelephonyStats, formatDuration } from '@/lib/telephony/useTelephonyStats'
import { EnhancedStatCard } from '@/components/ui/EnhancedStatCard'
import { LivePulse, ProgressRing } from '@/components/ui/AnimatedNumber'
import { 
  appleCardStyle, 
  appleSectionTitle, 
  appleSubTitle, 
  appleGroupedList, 
  appleListItem,
  appleAnimationFadeInUp,
  appleAnimationHoverFloat,
  appleInputStyle
} from '@/lib/appleDesign'

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

export function TelephonyOverview() {
  const [searchQuery, setSearchQuery] = useState('')
  const [connected, setConnected] = useState(false)
  
  // ✨ NEU: Echte Daten statt Mock
  const { stats, loading, error } = useTelephonyStats(30000) // Refresh every 30s

  const status = useMemo<IntegrationStatus | null>(() => {
    const statuses = loadIntegrationStatuses()
    return statuses['phone_bot'] ?? null
  }, [])

  useEffect(() => {
    setConnected(status?.connected === true)
  }, [status])

  // Format avg duration
  const avgDuration = stats ? formatDuration(stats.avg_duration_seconds) : '—'

  return (
    <motion.div 
      className="h-full flex flex-col overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header - Apple Style */}
      <div className={`shrink-0 px-8 pt-8 pb-6 bg-[var(--ak-color-bg-app)] z-10`}>
        <div className="flex items-center justify-between gap-6 mb-6">
          <div>
            <h1 className={appleSectionTitle}>Telefon-Zentrale</h1>
            <p className={appleSubTitle}>
              Übersicht aller Anrufe, Statistiken und Live-Status
            </p>
          </div>
        </div>
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Anrufe durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${appleInputStyle} pl-10`}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-[var(--ak-color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <motion.div className="space-y-8" variants={itemVariants}>
          
          {/* AI Suggestions */}
          <OutputCardFrame>
            <div className={`${appleCardStyle} p-6 !border-0 !shadow-none !bg-transparent`}>
              <AISuggestionGrid 
                context="telephony"
                summary={connected ? "Anruf-Strategie" : "Keine Verbindung"}
                text={connected ? "Intelligente Anruferkennung und Automatisierung ist aktiv." : "Der Telefon-Bot ist nicht verbunden. Bitte verbinden, um Live-Daten zu sehen."}
                className="!bg-transparent !border-0 !p-0"
              />
            </div>
          </OutputCardFrame>

          {/* Enhanced Quick Stats with Glassmorphism */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className={`${appleCardStyle} p-0 overflow-hidden`}>
              <EnhancedStatCard
                icon={<PhoneIcon className="h-6 w-6" />}
                value={stats?.calls_today || 0}
                label="Anrufe Heute"
                badge={{ text: '+12%', tone: 'success' }}
                gradient={{ from: 'blue', to: 'indigo' }}
                sparklineData={[40, 45, 50, 48, 55, 52, stats?.calls_today || 50]}
                loading={loading}
              />
            </div>
            
            <div className={`${appleCardStyle} p-0 overflow-hidden`}>
              <EnhancedStatCard
                icon={<ClockIcon className="h-6 w-6" />}
                value={avgDuration}
                label="Durchschn. Dauer"
                gradient={{ from: 'purple', to: 'pink' }}
                sparklineData={[120, 135, 128, 142, 138, 145, stats?.avg_duration_seconds || 140]}
                loading={loading}
              />
            </div>
            
            <div className={`${appleCardStyle} p-0 overflow-hidden`}>
              <EnhancedStatCard
                icon={<CheckCircleIcon className="h-6 w-6" />}
                value={stats?.appointments_created || 0}
                label="Termine"
                badge={{ text: '+5', tone: 'success' }}
                gradient={{ from: 'green', to: 'green' }}
                sparklineData={[35, 38, 40, 42, 40, 43, stats?.appointments_created || 42]}
                loading={loading}
              />
            </div>
            
            <div className={`${appleCardStyle} p-0 overflow-hidden`}>
              <EnhancedStatCard
                icon={<ChartBarIcon className="h-6 w-6" />}
                value={`${stats?.success_rate || 0}%`}
                label="Erfolgsquote"
                badge={{ text: 'Stable', tone: 'info' }}
                gradient={{ from: 'orange', to: 'orange' }}
                loading={loading}
              />
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Enhanced Live Status Card with Progress Ring */}
            <motion.div variants={itemVariants}>
              <div className={`${appleCardStyle} p-8 h-full relative overflow-hidden`}>
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
                </div>
                
                <div className="relative z-10 flex flex-col items-center justify-center h-full gap-8">
                  <div className="relative">
                    <motion.div 
                      className="absolute inset-0 bg-[var(--ak-semantic-success)]/20 rounded-full"
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <div className="relative bg-gradient-to-br from-[var(--ak-semantic-success)] to-[var(--ak-semantic-success-strong)] p-8 rounded-full shadow-2xl ring-4 ring-[var(--ak-color-bg-surface)]/20">
                      <PhoneIcon className="h-12 w-12 text-[var(--ak-color-text-inverted)]" />
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <LivePulse color="green" />
                      <p className="font-bold text-xl text-[var(--ak-color-text-primary)]">System bereit</p>
                    </div>
                    <p className="text-sm text-[var(--ak-color-text-secondary)]">Wartet auf Anrufe</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="px-3 py-1.5 rounded-full bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)] border border-[var(--ak-semantic-success-soft)] text-xs font-semibold">
                      Support Mode
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] border border-[var(--ak-color-border-subtle)] text-xs font-semibold">
                      Voice: Nova
                    </span>
                  </div>

                  {/* Enhanced Stats with Progress Ring */}
                  <div className="grid grid-cols-2 gap-8 w-full mt-2 pt-6 border-t border-[var(--ak-color-border-subtle)]">
                    <div className="text-center">
                      <div className="flex justify-center mb-3">
                        <ProgressRing value={(stats?.active_calls || 0) * 10} size={64} strokeWidth={5} color="#10b981" />
                      </div>
                      <p className="text-2xl font-bold text-[var(--ak-color-text-primary)] tracking-tight">{loading ? '...' : (stats?.active_calls || 0)}</p>
                      <p className="text-xs font-medium text-[var(--ak-color-text-muted)] uppercase tracking-wide mt-1">Aktive Calls</p>
                    </div>
                    <div className="text-center">
                      <div className="flex justify-center mb-3">
                        <ProgressRing value={Math.min((stats?.calls_today || 0) / 2, 100)} size={64} strokeWidth={5} color="#3b82f6" />
                      </div>
                      <p className="text-2xl font-bold text-[var(--ak-color-text-primary)] tracking-tight">{loading ? '...' : (stats?.calls_today || 0)}</p>
                      <p className="text-xs font-medium text-[var(--ak-color-text-muted)] uppercase tracking-wide mt-1">Heute Gesamt</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Recent Activity */}
            <motion.div variants={itemVariants}>
              <div className={`${appleCardStyle} p-6 h-full flex flex-col`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-[var(--ak-semantic-info-soft)] flex items-center justify-center shadow-md">
                    <ClockIcon className="h-5 w-5 text-[var(--ak-semantic-info)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--ak-color-text-primary)]">Letzte Aktivitäten</h3>
                    <p className="text-xs text-[var(--ak-color-text-secondary)]">Echtzeit-Feed</p>
                  </div>
                </div>
                
                <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-[var(--ak-color-bg-surface-muted)] rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : stats?.recent_activity.length === 0 ? (
                    <div className="text-center py-12 h-full flex flex-col justify-center">
                      <PhoneIcon className="h-12 w-12 text-[var(--ak-color-text-muted)] mx-auto mb-3" />
                      <p className="text-sm text-[var(--ak-color-text-secondary)]">Noch keine Anrufe heute</p>
                    </div>
                  ) : (
                    stats?.recent_activity.slice(0, 6).map((call, i) => (
                      <motion.div 
                        key={call.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className="group relative p-4 rounded-xl bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-accent-documents-soft)] transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-lg bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center shadow-inner">
                              <span className="font-mono text-xs font-bold text-[var(--ak-color-text-secondary)]">
                                {new Date(call.time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[var(--ak-color-text-primary)] mb-1 truncate">
                                {call.from || 'Unbekannt'}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-[var(--ak-color-text-secondary)]">
                                <span className="px-2 py-0.5 rounded-full bg-[var(--ak-color-bg-surface-muted)] font-medium border border-[var(--ak-color-border-subtle)]">
                                  {formatDuration(call.duration || 0)}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-secondary)] font-medium border border-[var(--ak-color-border-subtle)]">
                                  {call.mode || 'support'}
                                </span>
                              </div>
                          </div>
                          
                          <div className="flex-shrink-0 self-center">
                            {call.status === 'ended' ? (
                              <div className="h-8 w-8 rounded-full bg-[var(--ak-semantic-success-soft)] flex items-center justify-center border border-[var(--ak-semantic-success-soft)]">
                                <CheckCircleIcon className="h-5 w-5 text-[var(--ak-semantic-success)]" />
                              </div>
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-[var(--ak-semantic-warning-soft)] flex items-center justify-center border border-[var(--ak-semantic-warning-soft)]">
                                <ExclamationTriangleIcon className="h-5 w-5 text-[var(--ak-semantic-warning)]" />
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Performance Chart */}
          <motion.div variants={itemVariants}>
            <div className={`${appleCardStyle} p-6`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">Performance Verlauf</h3>
                  <p className="text-sm text-[var(--ak-color-text-secondary)]">Anrufe - Letzte 7 Tage</p>
                </div>
              </div>
              <div className="pt-2">
                <RechartsPerformanceChart days={7} height={240} metric="calls" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
