'use client'

import { TelephonyView } from './TelephonySidebarWidget'
import { TelephonyOverview } from './TelephonyOverview'
import { TelephonyLogs } from './TelephonyLogs'

import { TelephonyConfiguration } from './TelephonyConfiguration'
import { TelephonyNumbers } from './TelephonyNumbers'

export function TelephonyDashboard({ view }: { view: TelephonyView }) {
  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--ak-color-bg-app)]">
        <main className="h-full">
            {view === 'overview' && <TelephonyOverview />}
            {view === 'logs' && <TelephonyLogs />}
            {view === 'numbers' && <TelephonyNumbers />}
            {view === 'configuration' && <TelephonyConfiguration />}
        </main>
    </div>
  )
}
