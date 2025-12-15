'use client'

import { WebsiteView } from './WebsiteSidebarWidget'
import { WebsiteOverview } from './WebsiteOverview'
import { WebsiteConversations } from './WebsiteConversations'

import { WebsiteContent } from './WebsiteContent'
import { WebsiteAppearance } from './WebsiteAppearance'

export function WebsiteDashboard({ view }: { view: WebsiteView }) {
  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--ak-color-bg-app)]">
        <header className="sticky top-0 z-10 flex h-16 items-center border-b border-[var(--ak-color-border-hairline)] bg-[var(--ak-glass-bg)] px-6 backdrop-blur-[var(--ak-glass-blur)]">
            <h1 className="text-xl font-semibold text-[var(--ak-color-text-primary)] tracking-tight">
                {view === 'overview' && 'Website-Assistent Übersicht'}
                {view === 'conversations' && 'Gesprächsverlauf'}
                {view === 'content' && 'Wissensbasis & Inhalt'}
                {view === 'appearance' && 'Widget Design'}
            </h1>
        </header>
        <main className="max-w-7xl mx-auto h-[calc(100vh-64px)]">
            {view === 'overview' && <WebsiteOverview />}
            {view === 'conversations' && <WebsiteConversations />}
            {view === 'content' && <WebsiteContent />}
            {view === 'appearance' && <WebsiteAppearance />}
        </main>
    </div>
  )
}
