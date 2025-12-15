'use client'

import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkBadge } from '@/components/ui/AkBadge'
import { PhoneIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export function TelephonyOverview() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <WidgetCard title="Anrufe Heute" padding="lg">
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-[var(--ak-color-text-primary)]">128</span>
                <span className="text-sm text-green-600">+12%</span>
            </div>
        </WidgetCard>
        <WidgetCard title="Durchschn. Dauer" padding="lg">
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-[var(--ak-color-text-primary)]">2m 14s</span>
                <span className="text-sm text-[var(--ak-color-text-secondary)]">Ø</span>
            </div>
        </WidgetCard>
        <WidgetCard title="Reservierungen" padding="lg">
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-[var(--ak-color-text-primary)]">42</span>
                <span className="text-sm text-green-600">+5</span>
            </div>
        </WidgetCard>
        <WidgetCard title="Erfolgsquote" padding="lg">
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-[var(--ak-color-text-primary)]">94%</span>
                <span className="text-sm text-green-600">Stable</span>
            </div>
        </WidgetCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WidgetCard title="Aktive Leitung" subtitle="Live-Status" className="min-h-[300px]">
            <div className="flex flex-col items-center justify-center h-full gap-4 text-[var(--ak-color-text-secondary)]">
                <div className="relative">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                    <div className="relative bg-[var(--ak-color-bg-surface)] p-4 rounded-full border border-[var(--ak-color-border-subtle)]">
                        <PhoneIcon className="h-8 w-8 text-green-600" />
                    </div>
                </div>
                <p className="font-medium">System bereit & wartet auf Anrufe</p>
                <div className="flex gap-2">
                    <AkBadge tone="success">Reservation Mode</AkBadge>
                    <AkBadge tone="neutral">Voice: Nova</AkBadge>
                </div>
            </div>
        </WidgetCard>

        <WidgetCard title="Letzte Aktivitäten" subtitle="Echtzeit-Feed" className="min-h-[300px]">
            <div className="space-y-4">
                {[
                    { time: '10:42', type: 'call_ended', desc: 'Reservierung bestätigt für 4 Pers.', duration: '3m 12s', status: 'success' },
                    { time: '10:38', type: 'call_ended', desc: 'Frage nach Öffnungszeiten', duration: '45s', status: 'success' },
                    { time: '10:31', type: 'call_missed', desc: 'Anruf abgebrochen', duration: '12s', status: 'warning' },
                    { time: '10:15', type: 'call_ended', desc: 'Tischreservierung (Abend)', duration: '2m 40s', status: 'success' },
                ].map((log, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm border-b border-[var(--ak-color-border-hairline)] last:border-0 pb-3 last:pb-0">
                        <span className="font-mono text-[var(--ak-color-text-secondary)]">{log.time}</span>
                        <div className="flex-1">
                            <p className="text-[var(--ak-color-text-primary)]">{log.desc}</p>
                            <span className="text-xs text-[var(--ak-color-text-secondary)]">Dauer: {log.duration}</span>
                        </div>
                        {log.status === 'success' ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : (
                            <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
                        )}
                    </div>
                ))}
            </div>
        </WidgetCard>
      </div>
    </div>
  )
}
