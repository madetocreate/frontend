'use client'

import { XMarkIcon, ChartBarIcon, InboxIcon, UserGroupIcon, DocumentIcon, ShieldCheckIcon, PhoneIcon, GlobeAltIcon, Cog6ToothIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

type ModuleToken = 'chat' | 'inbox' | 'growth' | 'documents' | 'customers' | 'shield' | 'phone' | 'website' | 'settings'

interface DashboardOverlayProps {
  isOpen: boolean
  onClose: () => void
  activeModule: ModuleToken
  views: {
    growth?: string
    documents?: string
    customers?: string
    shield?: string
    phone?: string
    website?: string
    settings?: string
  }
}

// Mock stats for each module
const MODULE_STATS: Record<ModuleToken, { title: string; icon: typeof ChartBarIcon; stats: { label: string; value: string; change?: string; positive?: boolean }[] }> = {
  chat: {
    title: 'Chat Übersicht',
    icon: ChartBarIcon,
    stats: [
      { label: 'Heutige Chats', value: '24', change: '+12%', positive: true },
      { label: 'Nachrichten', value: '1.2k', change: '+8%', positive: true },
      { label: 'Avg. Antwortzeit', value: '< 1s', change: '-15%', positive: true },
      { label: 'Zufriedenheit', value: '98%', change: '+2%', positive: true },
    ],
  },
  inbox: {
    title: 'Posteingang Übersicht',
    icon: InboxIcon,
    stats: [
      { label: 'Ungelesen', value: '12', change: '-3', positive: true },
      { label: 'Dringend', value: '3', change: '+1', positive: false },
      { label: 'Diese Woche', value: '89', change: '+15%', positive: true },
      { label: 'Bearbeitet', value: '77', change: '+23%', positive: true },
    ],
  },
  growth: {
    title: 'Wachstum Übersicht',
    icon: ArrowTrendingUpIcon,
    stats: [
      { label: 'Aktive Kampagnen', value: '5', change: '+2', positive: true },
      { label: 'Leads diese Woche', value: '234', change: '+45%', positive: true },
      { label: 'Conversion Rate', value: '3.2%', change: '+0.5%', positive: true },
      { label: 'Budget genutzt', value: '67%' },
    ],
  },
  documents: {
    title: 'Dokumente Übersicht',
    icon: DocumentIcon,
    stats: [
      { label: 'Gesamt', value: '1,847', change: '+12', positive: true },
      { label: 'Diese Woche', value: '23', change: '+8', positive: true },
      { label: 'Geteilt', value: '156' },
      { label: 'Speicher', value: '4.2 GB' },
    ],
  },
  customers: {
    title: 'Kunden Übersicht',
    icon: UserGroupIcon,
    stats: [
      { label: 'Aktive Kunden', value: '847', change: '+5', positive: true },
      { label: 'Neu diese Woche', value: '12', change: '+3', positive: true },
      { label: 'Churn-Risiko', value: '8', change: '-2', positive: true },
      { label: 'Avg. LTV', value: '€12.5k', change: '+8%', positive: true },
    ],
  },
  shield: {
    title: 'AI-Shield Übersicht',
    icon: ShieldCheckIcon,
    stats: [
      { label: 'Geprüfte Anfragen', value: '45.2k' },
      { label: 'Blockiert', value: '127', change: '-15%', positive: true },
      { label: 'PII erkannt', value: '34' },
      { label: 'Policy-Verstöße', value: '2', change: '-5', positive: true },
    ],
  },
  phone: {
    title: 'Telefonie Übersicht',
    icon: PhoneIcon,
    stats: [
      { label: 'Anrufe heute', value: '18', change: '+3', positive: true },
      { label: 'Verpasst', value: '2', change: '-1', positive: true },
      { label: 'Avg. Dauer', value: '4:32' },
      { label: 'Bot-handled', value: '78%', change: '+5%', positive: true },
    ],
  },
  website: {
    title: 'Website-Bot Übersicht',
    icon: GlobeAltIcon,
    stats: [
      { label: 'Besucher heute', value: '1.2k', change: '+18%', positive: true },
      { label: 'Bot-Chats', value: '89', change: '+12%', positive: true },
      { label: 'Leads generiert', value: '23', change: '+5', positive: true },
      { label: 'Avg. Session', value: '3:45' },
    ],
  },
  settings: {
    title: 'Einstellungen',
    icon: Cog6ToothIcon,
    stats: [
      { label: 'API-Calls heute', value: '12.4k' },
      { label: 'Speicher genutzt', value: '67%' },
      { label: 'Team-Mitglieder', value: '8' },
      { label: 'Integrationen', value: '12' },
    ],
  },
}

// Recent activity mock
const RECENT_ACTIVITY = [
  { id: '1', label: 'E-Mail an Müller GmbH gesendet', time: 'vor 5 Min', module: 'inbox' },
  { id: '2', label: 'Neuer Kunde: Weber & Co', time: 'vor 1 Std', module: 'customers' },
  { id: '3', label: 'Kampagne "Winter Sale" gestartet', time: 'vor 2 Std', module: 'growth' },
  { id: '4', label: 'Dokument "Vertrag Q1" hochgeladen', time: 'vor 3 Std', module: 'documents' },
  { id: '5', label: '3 Anrufe vom Bot bearbeitet', time: 'vor 4 Std', module: 'phone' },
]

export function DashboardOverlay({ isOpen, onClose, activeModule }: DashboardOverlayProps) {
  if (!isOpen) return null

  const moduleData = MODULE_STATS[activeModule]
  const Icon = moduleData.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Overlay Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-20 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[800px] md:max-h-[80vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{moduleData.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Schnellübersicht & Statistiken</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {moduleData.stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                  >
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      {stat.label}
                    </p>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </span>
                      {stat.change && (
                        <span className={clsx(
                          "text-xs font-medium px-1.5 py-0.5 rounded-full mb-1",
                          stat.positive 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}>
                          {stat.change}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Letzte Aktivitäten
                </h3>
                <div className="space-y-3">
                  {RECENT_ACTIVITY.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                          {activity.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {activity.time}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Drücke <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">ESC</kbd> zum Schließen oder <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">⌘K</kbd> für Aktionen
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
