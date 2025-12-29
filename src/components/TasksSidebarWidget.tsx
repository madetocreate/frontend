'use client'

import React, { useState } from 'react'
import { dispatchActionStart } from '@/lib/actions/dispatch'
import { ListBulletIcon, SparklesIcon, PaperAirplaneIcon, ArrowPathIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { PaneTopbar } from '@/components/ui/PaneTopbar'
import { PaneList } from '@/components/ui/PaneList'
import { PaneRow } from '@/components/ui/PaneRow'
import { AkPopoverMenu } from '@/components/ui/AkPopoverMenu'
import clsx from 'clsx'
import { useRef } from 'react'

type TasksSidebarWidgetProps = {
  unreadCount: number
  onToggleCommandPalette?: () => void
  onGoInbox?: () => void
  onClose?: () => void
}

export function TasksSidebarWidget({
  unreadCount,
  onToggleCommandPalette,
  onGoInbox,
  onClose,
}: TasksSidebarWidgetProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const filterButtonRef = useRef<HTMLButtonElement>(null)

  const handleNextSteps = () => {
    dispatchActionStart(
      'inbox.next_steps',
      {
        module: 'inbox',
        target: { type: 'inbox' },
      },
      undefined,
      'tasks-sidebar'
    )
  }

  const handleSummarize = () => {
    dispatchActionStart(
      'inbox.summarize',
      {
        module: 'inbox',
        target: { type: 'inbox' },
      },
      undefined,
      'tasks-sidebar'
    )
  }

  const handleDraftReply = () => {
    dispatchActionStart(
      'inbox.draft_reply',
      {
        module: 'inbox',
        target: { type: 'inbox' },
      },
      undefined,
      'tasks-sidebar'
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--ak-surface-0)]">
      <PaneTopbar
        rightActions={
          <>
            <button
              ref={filterButtonRef}
              className={clsx(
                "p-1.5 rounded-md transition-colors",
                isFilterOpen 
                  ? "bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-primary)]" 
                  : "hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-primary)]"
              )}
              title="Filter"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
            
            <AkPopoverMenu
              open={isFilterOpen}
              anchorRef={filterButtonRef}
              items={[
                { label: 'Alle', onClick: () => setIsFilterOpen(false) }
              ]}
              onClose={() => setIsFilterOpen(false)}
              className="w-44"
            />
          </>
        }
      />
      
      <PaneList>
        <div className="flex flex-col gap-0.5">
          <PaneRow
            title="Nächste Schritte"
            subtitle="Offene Punkte ableiten"
            leading={<ListBulletIcon className="h-4 w-4 text-[var(--ak-text-secondary)]" />}
            onClick={handleNextSteps}
            className="hover:bg-[var(--ak-surface-1)]"
          />
          <PaneRow
            title="Posteingang zusammenfassen"
            subtitle="Überblick verschaffen"
            leading={<SparklesIcon className="h-4 w-4 text-[var(--ak-text-secondary)]" />}
            onClick={handleSummarize}
            className="hover:bg-[var(--ak-surface-1)]"
          />
          <PaneRow
            title="Antwortvorschläge"
            subtitle="Schnelle Antworten (Entwurf)"
            leading={<ArrowPathIcon className="h-4 w-4 text-[var(--ak-text-secondary)]" />}
            onClick={handleDraftReply}
            trailing={<span className="text-[10px] bg-[var(--ak-surface-2)] px-1.5 py-0.5 rounded text-[var(--ak-text-muted)]">Beta</span>}
            className="hover:bg-[var(--ak-surface-1)]"
          />
          <PaneRow
            title="Ungelesene Nachrichten"
            subtitle={`${unreadCount} neue Nachrichten`}
            leading={<div className="h-2 w-2 rounded-full bg-[var(--ak-color-accent)]" />}
            trailing={<span className="font-semibold tabular-nums text-[var(--ak-text-secondary)]">{unreadCount}</span>}
            onClick={onGoInbox}
            className="hover:bg-[var(--ak-surface-1)]"
          />
          {onGoInbox && (
            <PaneRow
              title="Zum Posteingang"
              leading={<PaperAirplaneIcon className="h-4 w-4 text-[var(--ak-text-secondary)]" />}
              onClick={onGoInbox}
              className="hover:bg-[var(--ak-surface-1)] mt-2"
            />
          )}
        </div>
      </PaneList>
    </div>
  )
}

export default TasksSidebarWidget