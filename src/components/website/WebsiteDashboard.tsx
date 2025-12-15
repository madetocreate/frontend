'use client'

import { WebsiteView } from './WebsiteSidebarWidget'
import { WebsiteOverview } from './WebsiteOverview'
import { WebsiteConversations } from './WebsiteConversations'

import { WebsiteContent } from './WebsiteContent'
import { WebsiteAppearance } from './WebsiteAppearance'

export function WebsiteDashboard({ view }: { view: WebsiteView }) {
  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--ak-color-bg-app)]">
        <main className="h-full">
            {view === 'overview' && <WebsiteOverview />}
            {view === 'conversations' && <WebsiteConversations />}
            {view === 'content' && <WebsiteContent />}
            {view === 'appearance' && <WebsiteAppearance />}
        </main>
    </div>
  )
}
