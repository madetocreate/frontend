'use client'

import { GrowthView } from './GrowthSidebarWidget'
import { GrowthOverview } from './GrowthOverview'
import { GrowthCampaigns } from './GrowthCampaigns'
import { GrowthLeads } from './GrowthLeads'
import { GrowthAnalytics } from './GrowthAnalytics'
import { GrowthAutomation } from './GrowthAutomation'

export function GrowthDashboard({ view }: { view: GrowthView }) {
  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--ak-color-bg-app)]">
        <header className="sticky top-0 z-10 flex h-16 items-center border-b border-[var(--ak-color-border-hairline)] bg-[var(--ak-glass-bg)] px-6 backdrop-blur-[var(--ak-glass-blur)]">
            <h1 className="text-xl font-semibold text-[var(--ak-color-text-primary)] tracking-tight">
                {view === 'overview' && 'Growth Übersicht'}
                {view === 'campaigns' && 'Kampagnen Manager'}
                {view === 'leads' && 'Leads & Kontakte'}
                {view === 'analytics' && 'Performance Analytics'}
                {view === 'automation' && 'Marketing Automatisierung'}
            </h1>
        </header>
        <main className="max-w-7xl mx-auto h-[calc(100vh-64px)]">
            {view === 'overview' && <GrowthOverview />}
            {view === 'campaigns' && <GrowthCampaigns />}
            {view === 'leads' && <GrowthLeads />}
            {view === 'analytics' && <GrowthAnalytics />}
            {view === 'automation' && <GrowthAutomation />}
        </main>
    </div>
  )
}
