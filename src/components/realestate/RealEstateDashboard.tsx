'use client'
import { RealEstateOverview } from './RealEstateOverview'
import { RealEstateProperties } from './RealEstateProperties'
import { RealEstateLeads } from './RealEstateLeads'
import { RealEstateCalendar } from './RealEstateCalendar'
import { RealEstateDocuments } from './RealEstateDocuments'
import { RealEstateSettings } from './RealEstateSettings'
import { RealEstateAnalytics } from './RealEstateAnalytics'
import { RealEstateMarketing } from './RealEstateMarketing'

export type RealEstateView = 
  | 'overview' 
  | 'properties' 
  | 'leads' 
  | 'calendar' 
  | 'documents'
  | 'analytics'
  | 'marketing'
  | 'settings'

type RealEstateDashboardProps = {
  view: RealEstateView
  enabledViews?: string[]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function RealEstateDashboard({ view, enabledViews }: RealEstateDashboardProps) {
  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--ak-color-bg-app)]">
      <header className="sticky top-0 z-10 flex h-16 items-center border-b border-[var(--ak-color-border-hairline)] bg-[var(--ak-glass-bg)] px-6 backdrop-blur-[var(--ak-glass-blur)]">
        <h1 className="text-xl font-semibold text-[var(--ak-color-text-primary)] tracking-tight">
          {view === 'overview' && 'Immobilien Übersicht'}
          {view === 'properties' && 'Immobilien'}
          {view === 'leads' && 'Leads'}
          {view === 'calendar' && 'Besichtigungen'}
          {view === 'documents' && 'Exposés'}
          {view === 'analytics' && 'Analytics'}
          {view === 'marketing' && 'Marketing'}
          {view === 'settings' && 'Einstellungen'}
        </h1>
      </header>
      <main className="max-w-7xl mx-auto h-[calc(100vh-64px)]">
        {view === 'overview' && <RealEstateOverview />}
        {view === 'properties' && <RealEstateProperties />}
        {view === 'leads' && <RealEstateLeads />}
        {view === 'calendar' && <RealEstateCalendar />}
        {view === 'documents' && <RealEstateDocuments />}
        {view === 'analytics' && <RealEstateAnalytics />}
        {view === 'marketing' && <RealEstateMarketing />}
        {view === 'settings' && <RealEstateSettings />}
      </main>
    </div>
  )
}

