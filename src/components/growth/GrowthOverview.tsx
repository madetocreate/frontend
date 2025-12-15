'use client'

import { WidgetCard } from '@/components/ui/WidgetCard'

export function GrowthOverview() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <WidgetCard title="Neue Leads (7d)" padding="lg" className="apple-glass-enhanced hover:shadow-[var(--ak-shadow-md)] transition-all duration-200">
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-[var(--ak-color-text-primary)]">84</span>
                <span className="text-sm text-green-600">+12%</span>
            </div>
        </WidgetCard>
        <WidgetCard title="Conversion Rate" padding="lg" className="apple-glass-enhanced hover:shadow-[var(--ak-shadow-md)] transition-all duration-200">
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-[var(--ak-color-text-primary)]">3.2%</span>
                <span className="text-sm text-green-600">+0.5%</span>
            </div>
        </WidgetCard>
        <WidgetCard title="Aktive Kampagnen" padding="lg" className="apple-glass-enhanced hover:shadow-[var(--ak-shadow-md)] transition-all duration-200">
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-[var(--ak-color-text-primary)]">5</span>
                <span className="text-sm text-[var(--ak-color-text-secondary)]">2 Pausiert</span>
            </div>
        </WidgetCard>
        <WidgetCard title="Ad Spend" padding="lg" className="apple-glass-enhanced hover:shadow-[var(--ak-shadow-md)] transition-all duration-200">
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-[var(--ak-color-text-primary)]">1.2k €</span>
                <span className="text-sm text-[var(--ak-color-text-secondary)]">On Track</span>
            </div>
        </WidgetCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WidgetCard title="Performance" className="lg:col-span-2 min-h-[300px] apple-glass-enhanced">
            <div className="flex items-center justify-center h-full text-[var(--ak-color-text-muted)]">
                <p>Chart: Leads vs. Kosten über Zeit</p>
            </div>
        </WidgetCard>

        <WidgetCard title="Top Kanäle" className="min-h-[300px] apple-glass-enhanced">
            <div className="space-y-4 pt-2">
                {[
                    { name: 'Instagram Ads', share: 45, trend: 'up' },
                    { name: 'Google Search', share: 30, trend: 'stable' },
                    { name: 'Newsletter', share: 15, trend: 'stable' },
                    { name: 'Direct Traffic', share: 10, trend: 'down' },
                ].map((item, i) => (
                    <div key={i}>
                        <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-[var(--ak-color-text-primary)]">{item.name}</span>
                            <span className="text-[var(--ak-color-text-secondary)]">{item.share}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-[var(--ak-color-bg-sidebar)] overflow-hidden">
                            <div className="h-full bg-[var(--ak-color-accent-growth)]" style={{ width: `${item.share}%`, opacity: 0.8 }} />
                        </div>
                    </div>
                ))}
            </div>
        </WidgetCard>
      </div>
    </div>
  )
}
