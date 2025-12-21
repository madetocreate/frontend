'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkBadge } from '@/components/ui/AkBadge'
import { AkSearchField } from '@/components/ui/AkSearchField'
import { ArrowTrendingUpIcon, UsersIcon, ChatBubbleLeftRightIcon, HandRaisedIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { RechartsEngagementChart } from '@/components/ui/RechartsEngagementChart'
import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid'

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
            <h1 className="ak-heading text-2xl font-bold text-[var(--ak-color-text-primary)] mb-1">Website-Assistent</h1>
            <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">
              Übersicht aller Chat-Interaktionen und Leads
            </p>
          </div>
        </div>
        <AkSearchField 
          placeholder="Besucher oder Gespräche durchsuchen..." 
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <motion.div className="space-y-6" variants={itemVariants}>
          
          {/* AI Suggestions */}
          <AISuggestionGrid 
            context="website"
            summary="Website-Performance"
            text="Die Lead-Rate ist heute um 5% höher als im Durchschnitt."
          />

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}>
              <WidgetCard padding="lg" className="apple-glass-enhanced hover:shadow-[var(--ak-shadow-md)] transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <UsersIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <AkBadge tone="success" size="sm">Live</AkBadge>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold text-[var(--ak-color-text-primary)] mb-1">42</p>
                  <p className="text-xs text-[var(--ak-color-text-secondary)] font-medium">Aktive Besucher</p>
                </div>
              </WidgetCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <WidgetCard padding="lg" className="apple-glass-enhanced hover:shadow-[var(--ak-shadow-md)] transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <AkBadge tone="success" size="sm">+8%</AkBadge>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold text-[var(--ak-color-text-primary)] mb-1">156</p>
                  <p className="text-xs text-[var(--ak-color-text-secondary)] font-medium">Gespräche (24h)</p>
                </div>
              </WidgetCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <WidgetCard padding="lg" className="apple-glass-enhanced hover:shadow-[var(--ak-shadow-md)] transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                    <HandRaisedIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <AkBadge tone="success" size="sm">+3</AkBadge>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold text-[var(--ak-color-text-primary)] mb-1">18</p>
                  <p className="text-xs text-[var(--ak-color-text-secondary)] font-medium">Leads generiert</p>
                </div>
              </WidgetCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <WidgetCard padding="lg" className="apple-glass-enhanced hover:shadow-[var(--ak-shadow-md)] transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <ChartBarIcon className="h-5 w-5 text-orange-600" />
                  </div>
                  <AkBadge tone="muted" size="sm">-2%</AkBadge>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold text-[var(--ak-color-text-primary)] mb-1">12%</p>
                  <p className="text-xs text-[var(--ak-color-text-secondary)] font-medium">Hand-off Rate</p>
                </div>
              </WidgetCard>
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Engagement Chart */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <WidgetCard title="Engagement Verlauf" subtitle="Letzte 7 Tage" className="apple-glass-enhanced">
                <div className="pt-4">
                  <RechartsEngagementChart days={7} height={250} />
                </div>
              </WidgetCard>
            </motion.div>

            {/* Top Topics */}
            <motion.div variants={itemVariants}>
              <WidgetCard title="Top Themen" subtitle="Häufigste Anfragen" className="apple-glass-enhanced">
                <div className="space-y-3 pt-2">
                  {[
                    { topic: 'Preise & Tarife', count: 45, trend: 'up' },
                    { topic: 'Öffnungszeiten', count: 32, trend: 'stable' },
                    { topic: 'Lieferung', count: 28, trend: 'down' },
                    { topic: 'Terminbuchung', count: 15, trend: 'up' },
                    { topic: 'Support', count: 12, trend: 'stable' },
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)] transition-colors"
                    >
                      <span className="text-sm text-[var(--ak-color-text-primary)] font-medium">{item.topic}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-[var(--ak-color-text-secondary)] font-mono">{item.count}</span>
                        {item.trend === 'up' && <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />}
                        {item.trend === 'down' && <ArrowTrendingUpIcon className="h-4 w-4 text-red-500 rotate-180" />}
                        {item.trend === 'stable' && <span className="w-4 text-center text-[var(--ak-color-text-muted)]">-</span>}
                      </div>
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
