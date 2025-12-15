'use client'

import { ReviewProfiOverview } from './ReviewProfiOverview'
import { ReviewProfiReviews } from './ReviewProfiReviews'
import { ReviewProfiAnalytics } from './ReviewProfiAnalytics'
import { ReviewProfiSettings } from './ReviewProfiSettings'
import { ReviewProfiIntegrations } from './ReviewProfiIntegrations'

export type ReviewProfiView = 
  | 'overview' 
  | 'reviews' 
  | 'analytics' 
  | 'integrations'
  | 'settings'

type ReviewProfiDashboardProps = {
  view: ReviewProfiView
}

export function ReviewProfiDashboard({ view }: ReviewProfiDashboardProps) {
  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--ak-color-bg-app)]">
      <header className="sticky top-0 z-10 flex h-16 items-center border-b border-[var(--ak-color-border-hairline)] bg-[var(--ak-glass-bg)] px-6 backdrop-blur-[var(--ak-glass-blur)]">
        <h1 className="text-xl font-semibold text-[var(--ak-color-text-primary)] tracking-tight">
          {view === 'overview' && 'Review Profi Übersicht'}
          {view === 'reviews' && 'Bewertungen'}
          {view === 'analytics' && 'Analytics & Insights'}
          {view === 'integrations' && 'Integrationen'}
          {view === 'settings' && 'Einstellungen'}
        </h1>
      </header>
      <main className="max-w-7xl mx-auto h-[calc(100vh-64px)]">
        {view === 'overview' && <ReviewProfiOverview />}
        {view === 'reviews' && <ReviewProfiReviews />}
        {view === 'analytics' && <ReviewProfiAnalytics />}
        {view === 'integrations' && <ReviewProfiIntegrations />}
        {view === 'settings' && <ReviewProfiSettings />}
      </main>
    </div>
  )
}
