'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkBadge } from '@/components/ui/AkBadge'
import { AkSearchField } from '@/components/ui/AkSearchField'
import { AkButton } from '@/components/ui/AkButton'
import { ArrowPathIcon, FunnelIcon, PlayIcon, PhoneIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

const MOCK_CALLS = [
    { id: 'c_1', from: '+49 171 1234567', time: 'Heute, 10:42', duration: '3m 12s', mode: 'reservation', status: 'completed', recording: true },
    { id: 'c_2', from: '+49 160 9876543', time: 'Heute, 10:38', duration: '0m 45s', mode: 'support', status: 'completed', recording: true },
    { id: 'c_3', from: 'Unbekannt', time: 'Heute, 10:31', duration: '0m 12s', mode: 'reservation', status: 'missed', recording: false },
    { id: 'c_4', from: '+49 175 5555555', time: 'Heute, 10:15', duration: '2m 40s', mode: 'reservation', status: 'completed', recording: true },
    { id: 'c_5', from: '+49 89 123123', time: 'Gestern, 18:30', duration: '5m 10s', mode: 'delivery', status: 'completed', recording: true },
    { id: 'c_6', from: '+49 151 2223334', time: 'Gestern, 14:20', duration: '1m 05s', mode: 'appointment', status: 'completed', recording: true },
]

const MODE_PILLS = ['all', 'reservation', 'support', 'appointment', 'delivery'] as const
type ModePill = typeof MODE_PILLS[number]

export function TelephonyLogs() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<ModePill>('all')

  const filteredCalls = MOCK_CALLS.filter(call => {
    const matchesSearch = call.from.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         call.time.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = activeFilter === 'all' || call.mode === activeFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[var(--ak-color-bg-app)]">
      {/* Header - Apple Style */}
      <div className="shrink-0 px-6 pt-6 pb-4 border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-app)]">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="ak-heading text-2xl font-bold text-[var(--ak-color-text-primary)] mb-1">Anruf-Protokoll</h1>
            <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">
              Historie aller eingegangenen Anrufe und deren Verlauf
            </p>
          </div>
          <div className="flex gap-2">
            <AkButton variant="secondary" leftIcon={<ArrowPathIcon className="h-4 w-4"/>}>Aktualisieren</AkButton>
            <AkButton variant="secondary" leftIcon={<FunnelIcon className="h-4 w-4"/>}>Filter</AkButton>
          </div>
        </div>
        <AkSearchField 
          placeholder="Suche nach Nummer oder Datum..." 
          value={searchQuery}
          onChange={setSearchQuery}
        />
        
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {MODE_PILLS.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setActiveFilter(mode)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                activeFilter === mode
                  ? 'bg-[var(--ak-color-accent)] text-white shadow-sm'
                  : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-surface)]'
              )}
            >
              {mode === 'all' ? 'Alle' : mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <WidgetCard padding="sm" className="apple-glass-enhanced overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--ak-color-bg-surface-muted)] border-b border-[var(--ak-color-border-subtle)]">
                <tr>
                  <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-xs uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-xs uppercase tracking-wider">Zeit</th>
                  <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-xs uppercase tracking-wider">Von</th>
                  <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-xs uppercase tracking-wider">Modus</th>
                  <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-xs uppercase tracking-wider text-right">Dauer</th>
                  <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-xs uppercase tracking-wider text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ak-color-border-hairline)] bg-[var(--ak-color-bg-surface)]">
                {filteredCalls.map((call, i) => (
                  <motion.tr 
                    key={call.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-[var(--ak-color-bg-hover)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      {call.status === 'completed' && <AkBadge tone="success">Erfolg</AkBadge>}
                      {call.status === 'missed' && <AkBadge tone="danger">Verpasst</AkBadge>}
                    </td>
                    <td className="px-4 py-3 text-[var(--ak-color-text-secondary)]">{call.time}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
                        <span className="font-mono text-xs text-[var(--ak-color-text-primary)]">{call.from}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <AkBadge tone="muted" size="sm" className="capitalize">{call.mode}</AkBadge>
                    </td>
                    <td className="px-4 py-3 text-[var(--ak-color-text-secondary)] text-right font-mono text-xs">{call.duration}</td>
                    <td className="px-4 py-3 text-right">
                      {call.recording && (
                        <AkButton size="sm" variant="ghost" leftIcon={<PlayIcon className="h-3 w-3" />}>
                          Play
                        </AkButton>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </WidgetCard>
      </div>
    </div>
  )
}
