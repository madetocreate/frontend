'use client'

import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkBadge } from '@/components/ui/AkBadge'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

const MOCK_CHATS = [
    { id: 'ch_1', user: 'Besucher #1293', topic: 'Preisanfrage', time: '10:45', status: 'active', msgs: 4 },
    { id: 'ch_2', user: 'Anna M.', topic: 'Terminbuchung', time: '10:30', status: 'closed', msgs: 12 },
    { id: 'ch_3', user: 'Besucher #1290', topic: 'Support', time: '10:15', status: 'handoff', msgs: 8 },
    { id: 'ch_4', user: 'Firma Schmidt', topic: 'Produktdetails', time: '09:50', status: 'closed', msgs: 6 },
    { id: 'ch_5', user: 'Besucher #1285', topic: 'Allgemein', time: '09:10', status: 'closed', msgs: 2 },
]

export function WebsiteConversations() {
  return (
    <div className="p-6 h-full flex flex-col space-y-6 overflow-hidden">
        <div className="flex justify-between items-center shrink-0">
            <div>
                <h2 className="text-lg font-medium text-[var(--ak-color-text-primary)]">Aktuelle Gespräche</h2>
                <p className="text-sm text-[var(--ak-color-text-secondary)]">
                    Live-Chat und Verlauf des Website-Assistenten.
                </p>
            </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
            {/* Chat List */}
            <WidgetCard padding="none" className="flex flex-col h-full overflow-hidden">
                <div className="p-3 border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-sidebar)]">
                    <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--ak-color-text-secondary)]">Verlauf</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {MOCK_CHATS.map(chat => (
                        <div key={chat.id} className="p-4 border-b border-[var(--ak-color-border-hairline)] hover:bg-[var(--ak-color-bg-hover)] cursor-pointer transition-colors">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-sm text-[var(--ak-color-text-primary)]">{chat.user}</span>
                                <span className="text-xs text-[var(--ak-color-text-secondary)]">{chat.time}</span>
                            </div>
                            <p className="text-xs text-[var(--ak-color-text-secondary)] mb-2">{chat.topic}</p>
                            <div className="flex gap-2">
                                {chat.status === 'active' && <AkBadge tone="success">Aktiv</AkBadge>}
                                {chat.status === 'closed' && <AkBadge tone="neutral">Beendet</AkBadge>}
                                {chat.status === 'handoff' && <AkBadge tone="warning">Mensch benötigt</AkBadge>}
                                <span className="text-xs text-[var(--ak-color-text-muted)] ml-auto">{chat.msgs} Msgs</span>
                            </div>
                        </div>
                    ))}
                </div>
            </WidgetCard>

            {/* Chat Detail Preview */}
            <WidgetCard className="md:col-span-2 h-full flex flex-col" padding="none">
                <div className="flex-1 flex flex-col items-center justify-center text-[var(--ak-color-text-muted)] p-10 text-center">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 mb-4 opacity-20" />
                    <p className="font-medium">Wähle ein Gespräch aus</p>
                    <p className="text-sm mt-2 max-w-xs">
                        Hier siehst du den detaillierten Chat-Verlauf, erkannte Absichten und gesammelte Lead-Informationen.
                    </p>
                </div>
            </WidgetCard>
        </div>
    </div>
  )
}
