'use client'

import { ShieldView } from './ShieldSidebarWidget'
import { ShieldOverview } from './ShieldOverview'
import { ShieldRegistry } from './ShieldRegistry'
import { ShieldPolicies } from './ShieldPolicies'
import { ShieldLogs } from './ShieldLogs'

export function ShieldDashboard({ view }: { view: ShieldView }) {
  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--ak-color-bg-app)]">
        <header className="sticky top-0 z-10 flex h-16 items-center border-b border-[var(--ak-color-border-hairline)] bg-[var(--ak-glass-bg)] px-6 backdrop-blur-[var(--ak-glass-blur)]">
            <h1 className="text-xl font-semibold text-[var(--ak-color-text-primary)] tracking-tight">
                {view === 'overview' && 'Systemübersicht'}
                {view === 'registry' && 'MCP Registry'}
                {view === 'policies' && 'Sicherheits-Policies'}
                {view === 'logs' && 'Logs & Tracing'}
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
