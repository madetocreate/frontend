'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkBadge } from '@/components/ui/AkBadge'
import { AkSearchField } from '@/components/ui/AkSearchField'
import { AkButton } from '@/components/ui/AkButton'
import { ArrowPathIcon, FunnelIcon, PlayIcon, PhoneIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { formatDuration } from '@/lib/telephony/useTelephonyStats'
import { useTelephonyLogs, TelephonyCall } from '@/hooks/useTelephonyLogs'

const MODE_PILLS = ['all', 'support', 'appointment', 'voicemail'] as const
type ModePill = typeof MODE_PILLS[number]

import { TableVirtuoso } from 'react-virtuoso'

// ... existing imports ...

export function TelephonyLogs() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<ModePill>('all')
  const { calls, loading, refetch } = useTelephonyLogs()

  const filteredCalls = calls.filter((call: TelephonyCall) => {
    const matchesSearch = call.from_number?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         new Date(call.created_at).toLocaleString('de-DE').toLowerCase().includes(searchQuery.toLowerCase())
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
            <AkButton variant="secondary" leftIcon={<ArrowPathIcon className="h-4 w-4"/>} onClick={refetch}>
              Aktualisieren
            </AkButton>
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
                  ? 'bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] shadow-sm'
                  : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-surface)]'
              )}
            >
              {mode === 'all' ? 'Alle' : mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 min-h-0">
        <WidgetCard padding="none" className="h-full overflow-hidden bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] ak-shadow-sm flex flex-col">
          <div className="flex-1">
            {loading ? (
              <div className="p-8 text-center text-[var(--ak-color-text-secondary)]">Lade Anrufe...</div>
            ) : filteredCalls.length === 0 ? (
              <div className="p-8 text-center text-[var(--ak-color-text-secondary)]">Keine Anrufe gefunden</div>
            ) : (
              <TableVirtuoso
                data={filteredCalls}
                style={{ height: '100%' }}
                fixedHeaderContent={() => (
                  <tr className="bg-[var(--ak-color-bg-surface-muted)] border-b border-[var(--ak-color-border-subtle)]">
                    <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-xs uppercase tracking-wider text-left">Status</th>
                    <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-xs uppercase tracking-wider text-left">Zeit</th>
                    <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-xs uppercase tracking-wider text-left">Von</th>
                    <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-xs uppercase tracking-wider text-left">Modus</th>
                    <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-xs uppercase tracking-wider text-right">Dauer</th>
                    <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-xs uppercase tracking-wider text-right">Aktionen</th>
                  </tr>
                )}
                itemContent={(index, call) => (
                  <>
                    <td className="px-4 py-3">
                      {call.status === 'ended' && <AkBadge tone="success">Beendet</AkBadge>}
                      {call.status === 'accepted' && <AkBadge tone="info">Aktiv</AkBadge>}
                      {call.status === 'error' && <AkBadge tone="danger">Fehler</AkBadge>}
                      {call.status === 'incoming' && <AkBadge tone="warning">Eingehend</AkBadge>}
                      {!call.status && <AkBadge tone="muted">Unbekannt</AkBadge>}
                    </td>
                    <td className="px-4 py-3 text-[var(--ak-color-text-secondary)]">
                      {new Date(call.created_at).toLocaleString('de-DE', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
                        <span className="font-mono text-xs text-[var(--ak-color-text-primary)]">
                          {call.from_number || 'Unbekannt'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <AkBadge tone="muted" size="sm" className="capitalize">
                        {call.mode || 'support'}
                      </AkBadge>
                    </td>
                    <td className="px-4 py-3 text-[var(--ak-color-text-secondary)] text-right font-mono text-xs">
                      {call.call_duration_seconds ? formatDuration(call.call_duration_seconds) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {call.status === 'ended' && (
                        <AkButton size="sm" variant="ghost" leftIcon={<PlayIcon className="h-3 w-3" />} onClick={() => {
                          try {
                            const { dispatchTelephonyCallCard } = require('@/lib/telephonyCardService')
                            dispatchTelephonyCallCard(call)
                          } catch (err) {
                            console.log('Telephony card service not available')
                          }
                        }}>
                          Details
                        </AkButton>
                      )}
                    </td>
                  </>
                )}
                components={{
                  Table: (props) => <table {...props} className="w-full text-left text-sm border-collapse" />,
                  TableRow: (props) => <tr {...props} className="hover:bg-[var(--ak-color-bg-hover)] transition-colors cursor-pointer border-b border-[var(--ak-color-border-hairline)]" />
                }}
              />
            )}
          </div>
        </WidgetCard>
      </div>
    </div>
  )
}
