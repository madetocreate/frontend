'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkBadge } from '@/components/ui/AkBadge'
import { AkSearchField } from '@/components/ui/AkSearchField'
import { PhoneIcon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { RechartsPerformanceChart } from '@/components/ui/RechartsPerformanceChart'
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

export function TelephonyOverview() {
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
            <h1 className="ak-heading text-2xl font-bold text-[var(--ak-color-text-primary)] mb-1">Telefon-Zentrale</h1>
            <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">
              Übersicht aller Anrufe, Statistiken und Live-Status
            </p>
          </div>
        </div>
        <AkSearchField 
          placeholder="Anrufe durchsuchen..." 
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <motion.div className="space-y-6" variants={itemVariants}>
          
          {/* AI Suggestions */}
          <AISuggestionGrid 
            context="telephony"
            summary="Anruf-Strategie"
            text="Intelligente Anruferkennung und Automatisierung ist aktiv."
          />

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}>
              <WidgetCard padding="lg" className="apple-glass-enhanced hover:shadow-[var(--ak-shadow-md)] transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <PhoneIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <AkBadge tone="success" size="sm">+12%</AkBadge>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold text-[var(--ak-color-text-primary)] mb-1">128</p>
                  <p className="text-xs text-[var(--ak-color-text-secondary)] font-medium">Anrufe Heute</p>
                </div>
              </WidgetCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <WidgetCard padding="lg" className="apple-glass-enhanced hover:shadow-[var(--ak-shadow-md)] transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                    <ClockIcon className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold text-[var(--ak-color-text-primary)] mb-1">2m 14s</p>
                  <p className="text-xs text-[var(--ak-color-text-secondary)] font-medium">Durchschn. Dauer</p>
                </div>
              </WidgetCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <WidgetCard padding="lg" className="apple-glass-enhanced hover:shadow-[var(--ak-shadow-md)] transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <AkBadge tone="success" size="sm">+5</AkBadge>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold text-[var(--ak-color-text-primary)] mb-1">42</p>
                  <p className="text-xs text-[var(--ak-color-text-secondary)] font-medium">Reservierungen</p>
                </div>
              </WidgetCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <WidgetCard padding="lg" className="apple-glass-enhanced hover:shadow-[var(--ak-shadow-md)] transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <ChartBarIcon className="h-5 w-5 text-orange-600" />
                  </div>
                  <AkBadge tone="success" size="sm">Stable</AkBadge>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold text-[var(--ak-color-text-primary)] mb-1">94%</p>
                  <p className="text-xs text-[var(--ak-color-text-secondary)] font-medium">Erfolgsquote</p>
                </div>
              </WidgetCard>
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Status Card */}
            <motion.div variants={itemVariants}>
              <WidgetCard title="Aktive Leitung" subtitle="Live-Status" className="apple-glass-enhanced">
                <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
                  <div className="relative">
                    <motion.div 
                      className="absolute inset-0 bg-green-500/20 rounded-full"
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
                    <div className="relative apple-glass-enhanced p-6 rounded-full border-2 border-green-200 shadow-lg">
                      <PhoneIcon className="h-10 w-10 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <p className="font-semibold text-lg text-[var(--ak-color-text-primary)]">System bereit</p>
                    <p className="text-sm text-[var(--ak-color-text-secondary)]">Wartet auf Anrufe</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center">
                    <AkBadge tone="success">Reservation Mode</AkBadge>
                    <AkBadge tone="muted">Voice: Nova</AkBadge>
                    <AkBadge tone="info">Live</AkBadge>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 w-full mt-4 pt-4 border-t border-[var(--ak-color-border-subtle)]">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[var(--ak-color-text-primary)]">3</p>
                      <p className="text-xs text-[var(--ak-color-text-secondary)] mt-1">Aktive Calls</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[var(--ak-color-text-primary)]">12</p>
                      <p className="text-xs text-[var(--ak-color-text-secondary)] mt-1">Warteschlange</p>
                    </div>
                  </div>
                </div>
              </WidgetCard>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={itemVariants}>
              <WidgetCard title="Letzte Aktivitäten" subtitle="Echtzeit-Feed" className="apple-glass-enhanced">
                <div className="space-y-3">
                  {[
                    { time: '10:42', type: 'call_ended', desc: 'Reservierung bestätigt für 4 Pers.', duration: '3m 12s', status: 'success' },
                    { time: '10:38', type: 'call_ended', desc: 'Frage nach Öffnungszeiten', duration: '45s', status: 'success' },
                    { time: '10:31', type: 'call_missed', desc: 'Anruf abgebrochen', duration: '12s', status: 'warning' },
                    { time: '10:15', type: 'call_ended', desc: 'Tischreservierung (Abend)', duration: '2m 40s', status: 'success' },
                    { time: '10:08', type: 'call_ended', desc: 'Lieferung angefragt', duration: '1m 55s', status: 'success' },
                  ].map((log, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-xl border border-[var(--ak-color-border-subtle)] apple-glass-enhanced hover:shadow-[var(--ak-shadow-md)] transition-all duration-200"
                    >
                      <span className="font-mono text-xs text-[var(--ak-color-text-secondary)] min-w-[50px]">{log.time}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--ak-color-text-primary)]">{log.desc}</p>
                        <span className="text-xs text-[var(--ak-color-text-secondary)]">Dauer: {log.duration}</span>
                      </div>
                      {log.status === 'success' ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 flex-shrink-0" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </WidgetCard>
            </motion.div>
          </div>

          {/* Performance Chart */}
          <motion.div variants={itemVariants}>
            <WidgetCard title="Performance Verlauf" subtitle="Anrufe - Letzte 7 Tage" className="apple-glass-enhanced">
              <div className="pt-4">
                <RechartsPerformanceChart days={7} height={200} metric="calls" />
              </div>
            </WidgetCard>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
