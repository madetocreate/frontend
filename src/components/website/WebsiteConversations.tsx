'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkBadge } from '@/components/ui/AkBadge'
import { AkSearchField } from '@/components/ui/AkSearchField'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

const MOCK_CHATS = [
    { id: 'ch_1', user: 'Besucher #1293', topic: 'Preisanfrage', time: '10:45', status: 'active', msgs: 4 },
    { id: 'ch_2', user: 'Anna M.', topic: 'Terminbuchung', time: '10:30', status: 'closed', msgs: 12 },
    { id: 'ch_3', user: 'Besucher #1290', topic: 'Support', time: '10:15', status: 'handoff', msgs: 8 },
    { id: 'ch_4', user: 'Firma Schmidt', topic: 'Produktdetails', time: '09:50', status: 'closed', msgs: 6 },
    { id: 'ch_5', user: 'Besucher #1285', topic: 'Allgemein', time: '09:10', status: 'closed', msgs: 2 },
]

const STATUS_PILLS = ['all', 'active', 'closed', 'handoff'] as const
type StatusPill = typeof STATUS_PILLS[number]

export function WebsiteConversations() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<StatusPill>('all')
  const [selectedChat, setSelectedChat] = useState<string | null>(null)

  const filteredChats = MOCK_CHATS.filter(chat => {
    const matchesSearch = chat.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         chat.topic.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = activeFilter === 'all' || chat.status === activeFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[var(--ak-color-bg-app)]">
      {/* Header - Apple Style */}
      <div className="shrink-0 px-6 pt-6 pb-4 border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-app)]">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="ak-heading text-2xl font-bold text-[var(--ak-color-text-primary)] mb-1">Gesprächsverlauf</h1>
            <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">
              Live-Chat und Verlauf des Website-Assistenten
            </p>
          </div>
        </div>
        <AkSearchField 
          placeholder="Gespräche durchsuchen..." 
          value={searchQuery}
          onChange={setSearchQuery}
        />
        
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {STATUS_PILLS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveFilter(status)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                activeFilter === status
                  ? 'bg-[var(--ak-color-accent)] text-white shadow-sm'
                  : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-surface)]'
              )}
            >
              {status === 'all' ? 'Alle' : status === 'active' ? 'Aktiv' : status === 'closed' ? 'Beendet' : 'Handoff'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Chat List */}
        <WidgetCard padding="sm" className="flex flex-col h-full overflow-hidden apple-glass-enhanced">
          <div className="p-3 border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)]">
            <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--ak-color-text-secondary)]">Verlauf</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat, i) => (
              <motion.div 
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedChat(chat.id)}
                className={clsx(
                  'p-4 border-b border-[var(--ak-color-border-hairline)] cursor-pointer transition-all',
                  selectedChat === chat.id 
                    ? 'bg-[var(--ak-color-bg-selected)] border-l-2 border-l-[var(--ak-color-accent)]' 
                    : 'hover:bg-[var(--ak-color-bg-hover)]'
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm text-[var(--ak-color-text-primary)]">{chat.user}</span>
                  <span className="text-xs text-[var(--ak-color-text-secondary)]">{chat.time}</span>
                </div>
                <p className="text-xs text-[var(--ak-color-text-secondary)] mb-2">{chat.topic}</p>
                <div className="flex gap-2 items-center">
                  {chat.status === 'active' && <AkBadge tone="success" size="sm">Aktiv</AkBadge>}
                  {chat.status === 'closed' && <AkBadge tone="muted" size="sm">Beendet</AkBadge>}
                  {chat.status === 'handoff' && <AkBadge tone="warning" size="sm">Mensch benötigt</AkBadge>}
                  <span className="text-xs text-[var(--ak-color-text-muted)] ml-auto">{chat.msgs} Msgs</span>
                </div>
              </motion.div>
            ))}
          </div>
        </WidgetCard>

        {/* Chat Detail Preview */}
        <WidgetCard className="md:col-span-2 h-full flex flex-col apple-glass-enhanced" padding="sm">
          {selectedChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--ak-color-text-muted)] p-10 text-center">
              <ChatBubbleLeftRightIcon className="h-12 w-12 mb-4 opacity-20" />
              <p className="font-medium">Chat-Details werden geladen...</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--ak-color-text-muted)] p-10 text-center">
              <ChatBubbleLeftRightIcon className="h-12 w-12 mb-4 opacity-20" />
              <p className="font-medium">Wähle ein Gespräch aus</p>
              <p className="text-sm mt-2 max-w-xs">
                Hier siehst du den detaillierten Chat-Verlauf, erkannte Absichten und gesammelte Lead-Informationen.
              </p>
            </div>
          )}
        </WidgetCard>
      </div>
    </div>
  )
}
