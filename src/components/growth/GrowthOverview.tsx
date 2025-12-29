'use client'

import { WidgetCard } from '@/components/ui/WidgetCard'
import { SimpleChart } from '@/components/ui/SimpleChart'
import { SparklesIcon, ArrowTrendingUpIcon, MegaphoneIcon } from '@heroicons/react/24/outline'
import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid'
import { OutputCardFrame } from '@/components/ui/OutputCardFrame'

export function GrowthOverview() {
  return (
    <div className="py-6 space-y-8">
      
      {/* AI Suggestions Header Block */}
      <OutputCardFrame>
        <WidgetCard padding="lg">
          <AISuggestionGrid 
            context="growth"
            summary="Wachstums-Strategie Q1"
            text="Analyse der aktuellen Kampagnen-Performance und Lead-Generierung."
            className="!bg-transparent !border-0 !p-0"
          />
        </WidgetCard>
      </OutputCardFrame>

      {/* AI Insights Section */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--ak-color-text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-[var(--ak-color-accent)]" />
            AI Growth Hacking
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
                { title: 'Budget optimieren', desc: 'Instagram Ads haben 15% höheren ROI als Google. Schichte 500€ um.', type: 'opportunity' },
                { title: 'Neue Zielgruppe', desc: 'Lookalike Audience "Käufer Q4" erstellen für bessere Conversion.', type: 'idea' },
                { title: 'Content Gap', desc: 'Thema "Nachhaltigkeit" trendet. Erstelle einen Blogpost dazu.', type: 'trend' }
            ].map((item, i) => (
                <div key={i} className="p-5 ak-card-glass rounded-2xl border ak-border-default group cursor-pointer transition-transform hover:scale-[1.01]">
                    <div className="flex items-start justify-between mb-2">
                        <div className="p-2 rounded-lg ak-bg-surface-muted group-hover:ak-bg-surface-hover transition-colors">
                            {item.type === 'opportunity' && <ArrowTrendingUpIcon className="w-5 h-5 text-[var(--ak-semantic-success)]" />}
                            {item.type === 'idea' && <MegaphoneIcon className="w-5 h-5 text-[var(--ak-accent-inbox)]" />}
                            {item.type === 'trend' && <SparklesIcon className="w-5 h-5 text-[var(--ak-accent-documents)]" />}
                        </div>
                        <span className="text-[10px] uppercase font-bold ak-text-muted tracking-wider px-2 py-1 rounded-full border ak-border-hairline">{item.type}</span>
                    </div>
                    <h3 className="font-semibold ak-text-primary mb-1">{item.title}</h3>
                    <p className="text-sm ak-text-secondary leading-relaxed">{item.desc}</p>
                </div>
            ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <WidgetCard title="Neue Leads (7d)" padding="lg" className="ak-card-glass hover:shadow-lg transition-all duration-200">
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold ak-text-primary">84</span>
                <span className="text-sm ak-badge-success font-medium">+12%</span>
            </div>
        </WidgetCard>
        <WidgetCard title="Conversion Rate" padding="lg" className="ak-card-glass hover:shadow-lg transition-all duration-200">
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold ak-text-primary">3.2%</span>
                <span className="text-sm ak-badge-success font-medium">+0.5%</span>
            </div>
        </WidgetCard>
        <WidgetCard title="Aktive Kampagnen" padding="lg" className="ak-card-glass hover:shadow-lg transition-all duration-200">
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold ak-text-primary">5</span>
                <span className="text-sm ak-text-secondary">2 Pausiert</span>
            </div>
        </WidgetCard>
        <WidgetCard title="Ad Spend" padding="lg" className="ak-card-glass hover:shadow-lg transition-all duration-200">
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold ak-text-primary">1.2k €</span>
                <span className="text-sm ak-text-secondary">On Track</span>
            </div>
        </WidgetCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <WidgetCard title="Performance" className="lg:col-span-2 min-h-[300px] ak-card-glass">
            <div className="h-[250px] w-full mt-4">
                <SimpleChart 
                    data={[
                        { label: 'Mo', value: 40 },
                        { label: 'Di', value: 30 },
                        { label: 'Mi', value: 65 },
                        { label: 'Do', value: 50 },
                        { label: 'Fr', value: 85 },
                        { label: 'Sa', value: 45 },
                        { label: 'So', value: 60 },
                    ]}
                    height={250}
                />
            </div>
        </WidgetCard>

        {/* Channels */}
        <WidgetCard title="Top Kanäle" className="min-h-[300px] ak-card-glass">
            <div className="space-y-5 pt-2">
                {[
                    { name: 'Instagram Ads', share: 45, trend: 'up' },
                    { name: 'Google Search', share: 30, trend: 'stable' },
                    { name: 'Newsletter', share: 15, trend: 'stable' },
                    { name: 'Direct Traffic', share: 10, trend: 'down' },
                ].map((item, i) => (
                    <div key={i}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                            <span className="font-medium ak-text-primary">{item.name}</span>
                            <span className="ak-text-secondary font-mono">{item.share}%</span>
                        </div>
                        <div className="h-2.5 rounded-full ak-bg-surface-muted overflow-hidden">
                            <div className="h-full ak-bg-accent-inbox" style={{ width: `${item.share}%`, boxShadow: 'var(--ak-elev-2)' }} />
                        </div>
                    </div>
                ))}
            </div>
        </WidgetCard>
      </div>
    </div>
  )
}
