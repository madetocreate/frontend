'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkBadge } from '@/components/ui/AkBadge'
import { AkSearchField } from '@/components/ui/AkSearchField'
import { ArrowTrendingUpIcon, UsersIcon, ChatBubbleLeftRightIcon, HandRaisedIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { DynamicRechartsEngagementChart as RechartsEngagementChart } from '@/components/ui/DynamicRechartsEngagementChart'
import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid'
import { OutputCardFrame } from '@/components/ui/OutputCardFrame'
import { loadIntegrationStatuses } from '@/lib/integrations/storage'
import { IntegrationStatus } from '@/lib/integrations/types'
import { useWebsiteStats } from '@/lib/website/useWebsiteStats'
import { EnhancedStatCard } from '@/components/ui/EnhancedStatCard'
import { LivePulse } from '@/components/ui/AnimatedNumber'
import {
  appleCardStyle,
  appleSectionTitle,
  appleSubTitle,
  appleGroupedList,
  appleListItem,
  appleAnimationFadeInUp,
  appleAnimationHoverFloat,
  appleInputStyle,
  appleGlassHeader
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

export function WebsiteOverview() {
  const [searchQuery, setSearchQuery] = useState('')
  const [connected, setConnected] = useState(false)
  
  // ✨ NEU: Echte Daten statt Mock
  const { stats, loading, error } = useWebsiteStats(30000) // Refresh every 30s

  const status = useMemo<IntegrationStatus | null>(() => {
    const statuses = loadIntegrationStatuses()
    return statuses['website_bot'] ?? null
  }, [])

  useEffect(() => {
    setConnected(status?.connected === true)
  }, [status])

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
            <h1 className={appleSectionTitle}>Website-Assistent</h1>
            <p className={appleSubTitle}>
              Übersicht aller Chat-Interaktionen und Leads
            </p>
          </div>
        </div>
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Besucher oder Gespräche durchsuchen..."
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
          {!connected && (
            <div className={`${appleCardStyle} p-6 border-dashed border-[var(--ak-color-border-strong)]`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[var(--ak-color-text-primary)]">Website-Bot ist nicht konfiguriert.</p>
                  <p className="text-sm text-[var(--ak-color-text-secondary)]">Verbinden Sie den Website-Bot, um Live-Metriken und Chats zu sehen.</p>
                </div>
                <AkBadge tone="neutral" size="sm">Not configured</AkBadge>
              </div>
            </div>
          )}

          {/* AI Suggestions */}
          <OutputCardFrame>
            <div className={`${appleCardStyle} p-6 !border-0 !shadow-none !bg-transparent`}>
              <AISuggestionGrid 
                context="website"
                summary={connected ? "Website-Performance" : "Demo-Performance"}
                text={connected ? "Live-Daten verfügbar." : "Demo-Daten werden angezeigt, da keine Verbindung besteht."}
                className="!bg-transparent !border-0 !p-0"
              />
            </div>
          </OutputCardFrame>

          {/* Enhanced Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className={`${appleCardStyle} p-0 overflow-hidden`}>
              <EnhancedStatCard
                icon={<UsersIcon className="h-6 w-6" />}
                value={stats?.active_visitors || 0}
                label="Aktive Besucher"
                badge={{ text: 'Live', tone: 'success' }}
                gradient={{ from: 'blue', to: 'indigo' }}
                sparklineData={[35, 42, 38, 45, 40, 48, stats?.active_visitors || 42]}
                loading={loading}
              />
            </div>
            
            <div className={`${appleCardStyle} p-0 overflow-hidden`}>
              <EnhancedStatCard
                icon={<ChatBubbleLeftRightIcon className="h-6 w-6" />}
                value={stats?.conversations_today || 0}
                label="Gespräche (24h)"
                badge={{ text: '+8%', tone: 'success' }}
                gradient={{ from: 'purple', to: 'pink' }}
                sparklineData={[120, 145, 135, 155, 148, 160, stats?.conversations_today || 156]}
                loading={loading}
              />
            </div>
            
            <div className={`${appleCardStyle} p-0 overflow-hidden`}>
              <EnhancedStatCard
                icon={<HandRaisedIcon className="h-6 w-6" />}
                value={stats?.leads_generated || 0}
                label="Leads generiert"
                badge={{ text: '+3', tone: 'success' }}
                gradient={{ from: 'green', to: 'green' }}
                sparklineData={[12, 15, 14, 17, 16, 19, stats?.leads_generated || 18]}
                loading={loading}
              />
            </div>
            
            <div className={`${appleCardStyle} p-0 overflow-hidden`}>
              <EnhancedStatCard
                icon={<ChartBarIcon className="h-6 w-6" />}
                value={`${stats?.handoff_rate || 0}%`}
                label="Hand-off Rate"
                badge={{ text: '-2%', tone: 'info' }}
                gradient={{ from: 'orange', to: 'orange' }}
                loading={loading}
              />
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Engagement Chart */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <div className={`${appleCardStyle} p-6 h-full`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">Engagement Verlauf</h3>
                    <p className="text-sm text-[var(--ak-color-text-secondary)]">Letzte 7 Tage</p>
                  </div>
                </div>
                <div className="pt-2">
                  <RechartsEngagementChart days={7} height={280} />
                </div>
              </div>
            </motion.div>

            {/* Enhanced Top Topics */}
            <motion.div variants={itemVariants}>
              <div className={`${appleCardStyle} p-6 h-full relative overflow-hidden`}>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-[var(--ak-color-text-inverted)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--ak-color-text-primary)]">Top Themen</h3>
                    <p className="text-xs text-[var(--ak-color-text-secondary)]">Häufigste Anfragen</p>
                  </div>
                </div>
                
                <div className="space-y-3 relative z-10">
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-12 bg-[var(--ak-color-bg-surface-muted)] rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : stats?.top_topics.length === 0 ? (
                    <div className="text-center py-12">
                      <ChatBubbleLeftRightIcon className="h-12 w-12 text-[var(--ak-color-text-muted)] mx-auto mb-3" />
                      <p className="text-sm text-[var(--ak-color-text-secondary)]">Noch keine Themen</p>
                    </div>
                  ) : (
                    stats?.top_topics.slice(0, 5).map((item, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className="group relative p-3 rounded-xl bg-gradient-to-r from-[var(--ak-color-bg-surface-muted)] to-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-accent-documents-soft)] transition-all cursor-pointer shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--ak-accent-documents-soft)] to-[var(--ak-accent-growth-soft)] flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-[var(--ak-accent-documents)]">#{i + 1}</span>
                            </div>
                            <span className="text-sm font-semibold text-[var(--ak-color-text-primary)]">{item.topic}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-[var(--ak-accent-documents-soft)] text-[var(--ak-accent-documents)] text-xs font-bold">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
