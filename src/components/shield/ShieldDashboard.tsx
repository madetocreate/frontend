'use client'

import { ShieldView } from './ShieldSidebarWidget'
import { ShieldOverview } from './ShieldOverview'
import { ShieldRegistry } from './ShieldRegistry'
import { ShieldPolicies } from './ShieldPolicies'
import { ShieldLogs } from './ShieldLogs'

export function ShieldDashboard({ view }: { view: ShieldView }) {
  const title =
    view === 'overview'
      ? 'AI Shield Übersicht'
      : view === 'registry'
        ? 'MCP Registry'
        : view === 'policies'
          ? 'Richtlinien'
          : 'Audit Logs'

  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--ak-color-bg-app)]">
      <header className="sticky top-0 z-10 flex h-16 items-center bg-[var(--ak-glass-bg)] px-6 backdrop-blur-[var(--ak-glass-blur)]">
        <h1 className="text-xl font-semibold text-[var(--ak-color-text-primary)] tracking-tight">
          {title}
        </h1>
      </header>
      <main className="max-w-7xl mx-auto h-[calc(100vh-64px)]">
        {view === 'overview' && <ShieldOverview />}
        {view === 'registry' && <ShieldRegistry />}
        {view === 'policies' && <ShieldPolicies />}
        {view === 'logs' && <ShieldLogs />}
      </main>
    </div>
  )
}
