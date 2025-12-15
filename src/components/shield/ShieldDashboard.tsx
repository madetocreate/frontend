'use client'

import { ShieldView } from './ShieldSidebarWidget'
import { ShieldOverview } from './ShieldOverview'
import { ShieldRegistry } from './ShieldRegistry'
import { ShieldPolicies } from './ShieldPolicies'
import { ShieldLogs } from './ShieldLogs'

export function ShieldDashboard({ view }: { view: ShieldView }) {
  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--ak-color-bg-app)]">
        <main className="h-full">
            {view === 'overview' && <ShieldOverview />}
            {view === 'registry' && <ShieldRegistry />}
            {view === 'policies' && <ShieldPolicies />}
            {view === 'logs' && <ShieldLogs />}
        </main>
    </div>
  )
}
