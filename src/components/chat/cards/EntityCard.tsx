'use client'

import React, { useState } from 'react'
import { EntityCardPayload, ChatCardAction } from './types'
import { ObjectHeader } from './ObjectHeader'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid'
import { ActionBar } from '@/components/actions/ActionBar'

interface EntityCardProps {
  card: EntityCardPayload
  onAction?: (actionId: string, params?: any) => void
  onPin?: () => void
  onInfo?: () => void
  embedded?: boolean // If true, simpler rendering (e.g. inside a list)
}

export function EntityCard({ card, onAction, onPin, onInfo, embedded = false }: EntityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Max items to show in compact mode
  const VISIBLE_FIELDS = 4
  const dataEntries = Object.entries(card.data)
  const hasMore = dataEntries.length > VISIBLE_FIELDS || !!card.details
  const showEntries = isExpanded ? dataEntries : dataEntries.slice(0, VISIBLE_FIELDS)

  return (
    <div className={clsx(
      "bg-[var(--ak-color-bg-surface)] border rounded-xl overflow-hidden transition-all duration-200",
      embedded ? "border-none shadow-none" : "border-[var(--ak-color-border-subtle)] shadow-sm hover:shadow-md"
    )}>
      {!embedded && (
        <div className="p-4">
          <ObjectHeader 
            icon={card.icon}
            title={card.title}
            subtitle={card.subtitle}
            status={card.status}
            pinned={card.pinned}
            onPin={onPin}
            onInfo={onInfo}
          />
          {card.source?.moduleToken === 'inbox' && (
            <div className="mt-4">
              <ActionBar
                module="inbox"
                context={{
                  module: 'inbox',
                  target: {
                    module: 'inbox',
                    targetId: card.source.entityId || card.id,
                    subtype: card.source.entityType || 'inbox',
                    title: card.title,
                  },
                  moduleContext: {
                    inbox: {
                      itemId: card.source.entityId || card.id,
                      threadId: card.source.entityId || card.id,
                      channel: card.source.entityType,
                    },
                  },
                }}
              />
            </div>
          )}
        </div>
      )}

      <div className={clsx("px-4", !embedded ? "pb-4" : "py-2")}>
        {showEntries.length > 0 && (
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            {showEntries.map(([key, value]) => (
              <div key={key} className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-[var(--ak-color-text-tertiary)] mb-0.5 truncate">
                  {key}
                </span>
                <span className="text-[var(--ak-color-text-primary)] font-medium truncate" title={String(value)}>
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        )}

        {card.details && isExpanded && (
           <motion.div 
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             exit={{ opacity: 0, height: 0 }}
             className="mt-4 pt-4 border-t border-[var(--ak-color-border-subtle)]"
           >
             {card.details}
           </motion.div>
        )}

        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 flex items-center gap-1 text-xs font-medium text-[var(--ak-color-primary)] hover:underline"
          >
            {isExpanded ? (
              <>Weniger anzeigen <ChevronUpIcon className="w-3 h-3" /></>
            ) : (
              card.source?.entityType === 'email' ? (
                <>Original Mail anzeigen <ChevronDownIcon className="w-3 h-3" /></>
              ) : (
                <>Mehr Details <ChevronDownIcon className="w-3 h-3" /></>
              )
            )}
          </button>
        )}
      </div>

      {/* AI Suggestions Grid - immer unten an der Card für alle EntityCards */}
      {!embedded && (
        <div className="border-t border-[var(--ak-color-border-subtle)] p-4 bg-[var(--ak-color-bg-surface-muted)]">
          <AISuggestionGrid
            context={card.source?.entityType === 'email' ? 'inbox' :
                    card.source?.moduleToken === 'documents' ? 'document' :
                    card.source?.moduleToken === 'customers' ? 'customer' :
                    card.source?.moduleToken === 'growth' ? 'growth' : 'inbox'}
            summary={card.title}
            text={card.subtitle || (card.data?.Zusammenfassung as string)}
            channel={card.source?.entityType === 'email' ? 'email' : undefined}
            onActionSelect={(action) => {
              onAction?.(action.id, action.payload)
            }}
            className="!bg-transparent !border-0 !p-0"
          />
        </div>
      )}
    </div>
  )
}
