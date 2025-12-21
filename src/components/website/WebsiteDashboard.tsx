'use client'

import { WebsiteView } from './WebsiteSidebarWidget'
import { WebsiteOverview } from './WebsiteOverview'
import { WebsiteConversations } from './WebsiteConversations'
import { WebsiteContent } from './WebsiteContent'
import { WebsiteAppearance } from './WebsiteAppearance'

export function WebsiteDashboard({ view }: { view: WebsiteView }) {
  const title =
    view === 'overview'
      ? 'Website-Bot Übersicht'
      : view === 'conversations'
        ? 'Besucher-Chats'
        : view === 'content'
          ? 'Wissensbasis'
          : 'Erscheinungsbild'

  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--ak-color-bg-app)]">
      <header className="sticky top-0 z-10 flex h-16 items-center bg-[var(--ak-glass-bg)] px-6 backdrop-blur-[var(--ak-glass-blur)]">
        <h1 className="text-xl font-semibold text-[var(--ak-color-text-primary)] tracking-tight">
          {title}
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
