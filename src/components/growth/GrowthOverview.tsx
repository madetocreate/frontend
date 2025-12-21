'use client'

import { WidgetCard } from '@/components/ui/WidgetCard'
import { SimpleChart } from '@/components/ui/SimpleChart'
import { SparklesIcon, ArrowTrendingUpIcon, MegaphoneIcon } from '@heroicons/react/24/outline'
import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid'

export function GrowthOverview() {
  return (
    <div className="p-6 space-y-8">
      
      {/* AI Suggestions Header Block */}
      <AISuggestionGrid 
        context="growth"
        summary="Wachstums-Strategie Q1"
        text="Analyse der aktuellen Kampagnen-Performance und Lead-Generierung."
      />

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
                <div key={i} className="p-5 apple-card-enhanced rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:scale-[1.01] transition-transform cursor-pointer group">
                    <div className="flex items-start justify-between mb-2">
                        <div className="p-2 rounded-lg bg-[var(--ak-color-bg-surface-muted)] group-hover:bg-[var(--ak-color-bg-hover)] transition-colors">
                            {item.type === 'opportunity' && <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />}
                            {item.type === 'idea' && <MegaphoneIcon className="w-5 h-5 text-blue-600" />}
                            {item.type === 'trend' && <SparklesIcon className="w-5 h-5 text-purple-600" />}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-[var(--ak-color-text-muted)] tracking-wider px-2 py-1 rounded-full border border-[var(--ak-color-border-subtle)]">{item.type}</span>
                    </div>
                    <h3 className="font-semibold text-[var(--ak-color-text-primary)] mb-1">{item.title}</h3>
                    <p className="text-sm text-[var(--ak-color-text-secondary)] leading-relaxed">{item.desc}</p>
                </div>
            ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <WidgetCard title="Neue Leads (7d)" padding="lg" className="apple-glass-enhanced hover:shadow-[var(--ak-shadow-md)] transition-all duration-200">
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-[var(--ak-color-text-primary)]">84</span>
                <span className="text-sm text-green-600 font-medium">+12%</span>
            </div>
        </WidgetCard>
        <WidgetCard title="Conversion Rate" padding="lg" className="apple-glass-enhanced hover:shadow-[var(--ak-shadow-md)] transition-all duration-200">
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-[var(--ak-color-text-primary)]">3.2%</span>
                <span className="text-sm text-green-600 font-medium">+0.5%</span>
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
        {/* Main Chart */}
        <WidgetCard title="Performance" className="lg:col-span-2 min-h-[300px] apple-glass-enhanced">
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
        <WidgetCard title="Top Kanäle" className="min-h-[300px] apple-glass-enhanced">
            <div className="space-y-5 pt-2">
                {[
                    { name: 'Instagram Ads', share: 45, trend: 'up' },
                    { name: 'Google Search', share: 30, trend: 'stable' },
                    { name: 'Newsletter', share: 15, trend: 'stable' },
                    { name: 'Direct Traffic', share: 10, trend: 'down' },
                ].map((item, i) => (
                    <div key={i}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                            <span className="font-medium text-[var(--ak-color-text-primary)]">{item.name}</span>
                            <span className="text-[var(--ak-color-text-secondary)] font-mono">{item.share}%</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-[var(--ak-color-bg-surface-muted)] overflow-hidden">
                            <div className="h-full bg-[var(--ak-color-accent)] shadow-[0_0_10px_rgba(59,130,246,0.3)]" style={{ width: `${item.share}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </WidgetCard>
      </div>
    </div>
  )
}
