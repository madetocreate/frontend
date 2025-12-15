'use client'

import { WidgetCard } from '@/components/ui/WidgetCard'
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline'

export function WebsiteOverview() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <WidgetCard title="Aktive Besucher" padding="lg">
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-[var(--ak-color-text-primary)]">42</span>
                <span className="text-sm text-green-600">Live</span>
            </div>
        </WidgetCard>
        <WidgetCard title="Gespräche (24h)" padding="lg">
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-[var(--ak-color-text-primary)]">156</span>
                <span className="text-sm text-green-600">+8%</span>
            </div>
        </WidgetCard>
        <WidgetCard title="Leads generiert" padding="lg">
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-[var(--ak-color-text-primary)]">18</span>
                <span className="text-sm text-green-600">+3</span>
            </div>
        </WidgetCard>
        <WidgetCard title="Hand-off Rate" padding="lg">
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-[var(--ak-color-text-primary)]">12%</span>
                <span className="text-sm text-[var(--ak-color-text-secondary)]">-2%</span>
            </div>
        </WidgetCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WidgetCard title="Engagement Verlauf" className="lg:col-span-2 min-h-[300px]">
            <div className="flex items-center justify-center h-full text-[var(--ak-color-text-muted)]">
                <p>Chart: Chat-Interaktionen über Zeit</p>
            </div>
        </WidgetCard>

        <WidgetCard title="Top Themen" className="min-h-[300px]">
            <div className="space-y-3 pt-2">
                {[
                    { topic: 'Preise & Tarife', count: 45, trend: 'up' },
                    { topic: 'Öffnungszeiten', count: 32, trend: 'stable' },
                    { topic: 'Lieferung', count: 28, trend: 'down' },
                    { topic: 'Terminbuchung', count: 15, trend: 'up' },
                    { topic: 'Support', count: 12, trend: 'stable' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-[var(--ak-color-text-primary)]">{item.topic}</span>
                        <div className="flex items-center gap-3">
                            <span className="text-[var(--ak-color-text-secondary)]">{item.count}</span>
                            {item.trend === 'up' && <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />}
                            {item.trend === 'down' && <ArrowTrendingUpIcon className="h-4 w-4 text-red-500 rotate-180" />}
                            {item.trend === 'stable' && <span className="w-4 text-center text-[var(--ak-color-text-muted)]">-</span>}
                        </div>
                    </div>
                ))}
            </div>
        </WidgetCard>
      </div>
    </div>
  )
}
