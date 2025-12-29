'use client'

import { XMarkIcon, ChartBarIcon, InboxIcon, UserGroupIcon, DocumentIcon, ShieldCheckIcon, PhoneIcon, GlobeAltIcon, Cog6ToothIcon, ArrowTrendingUpIcon, StarIcon, TrashIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import { ChatCard } from '@/components/chat/cards'

type ModuleToken = 'chat' | 'inbox' | 'growth' | 'documents' | 'customers' | 'shield' | 'phone' | 'website' | 'settings'

interface DashboardOverlayProps {
  isOpen: boolean
  onClose: () => void
  activeModule: ModuleToken
  pinnedItems?: ChatCard[]
  activeExplanation?: { title: string; explanation: string; references?: string[] } | null
  onUnpin?: (cardId: string) => void
  onJumpToCard?: (card: ChatCard) => void
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

export function DashboardOverlay({ isOpen, onClose, activeModule, pinnedItems = [], activeExplanation, onUnpin, onJumpToCard }: DashboardOverlayProps) {
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
            className="fixed inset-x-4 top-20 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[800px] md:max-h-[80vh] ak-glass-modal rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b ak-border-hairline ak-bg-surface-muted">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl ak-bg-accent-inbox flex items-center justify-center shadow-lg">
                  {activeExplanation ? (
                    <StarIconSolid className="w-6 h-6" style={{ color: 'var(--ak-text-primary-dark)' }} />
                  ) : (
                    <Icon className="w-6 h-6" style={{ color: 'var(--ak-text-primary-dark)' }} />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold ak-text-primary">
                    {activeExplanation ? 'Erklärung & Details' : moduleData.title}
                  </h2>
                  <p className="text-sm ak-text-secondary">
                    {activeExplanation ? 'Warum wurde diese Entscheidung getroffen?' : 'Schnellübersicht & Statistiken'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl ak-bg-surface-muted hover:ak-bg-hover flex items-center justify-center transition-colors ak-focus-ring"
              >
                <XMarkIcon className="w-5 h-5 ak-text-secondary" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Active Explanation Section */}
              {activeExplanation && (
                <div className="ak-accent-bg-soft border ak-accent-border rounded-2xl p-6">
                    <h3 className="text-lg font-bold ak-text-primary mb-2">{activeExplanation.title}</h3>
                    <p className="ak-text-secondary leading-relaxed mb-6">
                        {activeExplanation.explanation}
                    </p>
                    
                    {activeExplanation.references && activeExplanation.references.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider ak-text-muted mb-3">
                                Quellen & Belege
                            </h4>
                            <div className="space-y-2">
                                {activeExplanation.references.map((ref, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 ak-bg-surface-0 rounded-xl border ak-accent-border">
                                        <div className="w-6 h-6 rounded-full ak-accent-bg-soft flex items-center justify-center flex-shrink-0 text-xs font-bold ak-accent">
                                            {i + 1}
                                        </div>
                                        <p className="text-sm ak-text-secondary">
                                            {ref}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
              )}

              {/* Pinned Items Section */}
              {pinnedItems.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold ak-text-primary mb-4 flex items-center gap-2">
                    <StarIconSolid className="w-4 h-4 text-[var(--ak-semantic-warning)]" />
                    Angepinnt
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pinnedItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-start justify-between p-3 rounded-xl ak-bg-warning-soft dark:ak-bg-warning-soft/20 border ak-border-warning hover:ak-bg-warning-hover transition-colors group cursor-pointer"
                        onClick={() => {
                            if (onJumpToCard) {
                                onJumpToCard(item);
                                onClose();
                            }
                        }}
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold ak-text-primary truncate">
                            {item.type === 'entity' ? (item as any).title : 
                             item.type === 'list' ? (item as any).title :
                             item.type === 'insight' ? (item as any).title : 'Gepinnter Inhalt'}
                          </span>
                          <span className="text-[10px] ak-text-muted truncate">
                            {new Date(item.createdAt || Date.now()).toLocaleTimeString()} • {item.type}
                          </span>
                        </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUnpin?.(item.id);
                            }}
                            className="p-1 ak-text-muted hover:ak-text-danger rounded-lg ak-bg-glass hover:ak-bg-danger-soft transition-colors opacity-0 group-hover:opacity-100 focus-visible:outline-none focus-visible:ring ak-focus-ring"
                            title="Lösen"
                          >
                            <TrashIcon className="w-4 h-4 ak-icon-danger" />
                          </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {moduleData.stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-2xl ak-card-glass border ak-border-default"
                  >
                    <p className="text-xs font-medium ak-text-muted uppercase tracking-wider mb-1">
                      {stat.label}
                    </p>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold ak-text-primary">
                        {stat.value}
                      </span>
                      {stat.change && (
                        <span className={clsx(
                          "text-xs font-medium px-1.5 py-0.5 rounded-full mb-1",
                          stat.positive 
                            ? "ak-badge-success"
                            : "ak-badge-danger"
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
                <h3 className="text-sm font-semibold ak-text-primary mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full ak-bg-success animate-pulse" />
                  Letzte Aktivitäten
                </h3>
                <div className="space-y-3">
                  {RECENT_ACTIVITY.map((activity, index) => (
                      <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-xl ak-bg-surface-muted hover:ak-bg-surface-hover transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full ak-bg-accent-inbox" />
                        <span className="text-sm ak-text-primary group-hover:ak-text-primary transition-colors">
                          {activity.label}
                        </span>
                      </div>
                      <span className="text-xs ak-text-muted">
                        {activity.time}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t ak-border-subtle">
                <p className="text-center text-sm ak-text-muted">
                  Drücke <kbd className="px-1.5 py-0.5 ak-bg-glass border ak-border-default rounded text-xs font-mono">ESC</kbd> zum Schließen oder <kbd className="px-1.5 py-0.5 ak-bg-glass border ak-border-default rounded text-xs font-mono">⌘K</kbd> für Aktionen
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
