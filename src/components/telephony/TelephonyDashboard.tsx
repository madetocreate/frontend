'use client'

import { TelephonyView } from './TelephonySidebarWidget'
import { TelephonyOverview } from './TelephonyOverview'
import { TelephonyLogs } from './TelephonyLogs'

import { TelephonyConfiguration } from './TelephonyConfiguration'
import { TelephonyNumbers } from './TelephonyNumbers'

export function TelephonyDashboard({ view }: { view: TelephonyView }) {
  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--ak-color-bg-app)]">
        <header className="sticky top-0 z-10 flex h-16 items-center border-b border-[var(--ak-color-border-hairline)] bg-[var(--ak-glass-bg)] px-6 backdrop-blur-[var(--ak-glass-blur)]">
            <h1 className="text-xl font-semibold text-[var(--ak-color-text-primary)] tracking-tight">
                {view === 'overview' && 'Telefon-Zentrale'}
                {view === 'logs' && 'Anruf-Historie'}
                {view === 'numbers' && 'Rufnummern-Verwaltung'}
                {view === 'configuration' && 'Bot-Konfiguration'}
            </h1>
        </header>
        <main className="max-w-7xl mx-auto h-[calc(100vh-64px)]">
            {view === 'overview' && <TelephonyOverview />}
            {view === 'logs' && <TelephonyLogs />}
            {view === 'numbers' && <TelephonyNumbers />}
            {view === 'configuration' && <TelephonyConfiguration />}
        </main>
    </div>
  )
}
