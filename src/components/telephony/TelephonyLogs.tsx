'use client'

import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkBadge } from '@/components/ui/AkBadge'
import { AkSearchField } from '@/components/ui/AkSearchField'
import { AkButton } from '@/components/ui/AkButton'
import { ArrowPathIcon, FunnelIcon, PlayIcon } from '@heroicons/react/24/outline'

const MOCK_CALLS = [
    { id: 'c_1', from: '+49 171 1234567', time: 'Heute, 10:42', duration: '3m 12s', mode: 'reservation', status: 'completed', recording: true },
    { id: 'c_2', from: '+49 160 9876543', time: 'Heute, 10:38', duration: '0m 45s', mode: 'support', status: 'completed', recording: true },
    { id: 'c_3', from: 'Unbekannt', time: 'Heute, 10:31', duration: '0m 12s', mode: 'reservation', status: 'missed', recording: false },
    { id: 'c_4', from: '+49 175 5555555', time: 'Heute, 10:15', duration: '2m 40s', mode: 'reservation', status: 'completed', recording: true },
    { id: 'c_5', from: '+49 89 123123', time: 'Gestern, 18:30', duration: '5m 10s', mode: 'delivery', status: 'completed', recording: true },
    { id: 'c_6', from: '+49 151 2223334', time: 'Gestern, 14:20', duration: '1m 05s', mode: 'appointment', status: 'completed', recording: true },
]

export function TelephonyLogs() {
  return (
    <div className="p-6 space-y-6 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center shrink-0">
        <div>
            <h2 className="text-lg font-medium text-[var(--ak-color-text-primary)]">Anruf-Protokoll</h2>
            <p className="text-sm text-[var(--ak-color-text-secondary)]">
                Historie aller eingegangenen Anrufe und deren Verlauf.
            </p>
        </div>
        <div className="flex gap-2">
            <AkButton variant="secondary" leftIcon={<ArrowPathIcon className="h-4 w-4"/>}>Aktualisieren</AkButton>
            <AkButton variant="secondary" leftIcon={<FunnelIcon className="h-4 w-4"/>}>Filter</AkButton>
        </div>
      </div>

      <div className="shrink-0">
        <AkSearchField placeholder="Suche nach Nummer oder Datum..." />
      </div>

      <WidgetCard padding="none" className="flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[var(--ak-color-bg-sidebar)] border-b border-[var(--ak-color-border-subtle)]">
                    <tr>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Status</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Zeit</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Von</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)]">Modus</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-right">Dauer</th>
                        <th className="px-4 py-3 font-medium text-[var(--ak-color-text-secondary)] text-right">Aktionen</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ak-color-border-hairline)] bg-[var(--ak-color-bg-surface)]">
                    {MOCK_CALLS.map((call) => (
                        <tr key={call.id} className="hover:bg-[var(--ak-color-bg-hover)] transition-colors">
                            <td className="px-4 py-3">
                                {call.status === 'completed' && <AkBadge tone="success">Erfolg</AkBadge>}
                                {call.status === 'missed' && <AkBadge tone="critical">Verpasst</AkBadge>}
                            </td>
                            <td className="px-4 py-3 text-[var(--ak-color-text-secondary)]">{call.time}</td>
                            <td className="px-4 py-3 font-mono text-xs text-[var(--ak-color-text-primary)]">{call.from}</td>
                            <td className="px-4 py-3">
                                <span className="capitalize text-[var(--ak-color-text-secondary)]">{call.mode}</span>
                            </td>
                            <td className="px-4 py-3 text-[var(--ak-color-text-secondary)] text-right font-mono text-xs">{call.duration}</td>
                            <td className="px-4 py-3 text-right">
                                {call.recording && (
                                    <AkButton size="sm" variant="ghost" leftIcon={<PlayIcon className="h-3 w-3" />}>
                                        Play
                                    </AkButton>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </WidgetCard>
    </div>
  )
}
