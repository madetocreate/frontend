'use client'

import React, { useState, useEffect } from 'react'
import { getAuditLog } from '@/lib/actions/audit'
import { AKLOW_EVENTS } from '@/commands/registry'
import { TrashIcon, ClockIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { PaneTopbar } from '@/components/ui/PaneTopbar'
import { PaneList } from '@/components/ui/PaneList'
import { PaneRow } from '@/components/ui/PaneRow'
import { AkPopoverMenu } from '@/components/ui/AkPopoverMenu'
import { AkEmptyState } from '@/components/ui/AkEmptyState'
import clsx from 'clsx'
import { useRef } from 'react'

type TimelineSidebarWidgetProps = {
  onToggleCommandPalette?: () => void
  onClose?: () => void
}

type TimelineEntry = {
  id: string
  time: string
  label: string
  module?: string
}

export function TimelineSidebarWidget({
  onToggleCommandPalette: _onToggleCommandPalette,
  onClose: _onClose,
}: TimelineSidebarWidgetProps) {
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const filterButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const updateTimeline = () => {
      const auditLog = getAuditLog()
      const entries: TimelineEntry[] = auditLog.slice(0, 10).map((entry) => ({
        id: entry.id,
        time: new Date(entry.createdAt).toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        label: entry.preview || entry.actionId,
        module: entry.module,
      }))
      setTimelineEntries(entries)
    }

    // Initial load
    updateTimeline()
    const interval = setInterval(updateTimeline, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleClearTimeline = () => {
    setTimelineEntries([])
  }

  const handleGoQuickActions = () => {
    window.dispatchEvent(new CustomEvent(AKLOW_EVENTS.OPEN_MODULE, { detail: { module: 'quick_actions' } }))
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
        {timelineEntries.length === 0 ? (
          <AkEmptyState
            title="Keine Aktivitäten"
            description="Hier erscheinen deine letzten Aktionen"
            icon={<ClockIcon className="h-6 w-6" />}
            action={{
              label: 'Schnellaktionen öffnen',
              onClick: handleGoQuickActions,
            }}
          />
        ) : (
          <div className="flex flex-col gap-0.5">
            {timelineEntries.map((entry) => (
              <PaneRow
                key={entry.id}
                title={entry.label}
                subtitle={entry.module ? `Modul: ${entry.module}` : undefined}
                trailing={<span className="text-[10px] text-[var(--ak-text-muted)] tabular-nums">{entry.time}</span>}
                leading={
                  <div className="h-2 w-2 rounded-full bg-[var(--ak-text-muted)]/30 mt-1" />
                }
                className="hover:bg-[var(--ak-surface-1)]"
              />
            ))}
            <PaneRow
              title="Verlauf löschen"
              leading={<TrashIcon className="h-4 w-4 text-[var(--ak-text-muted)]" />}
              onClick={handleClearTimeline}
              className="hover:bg-[var(--ak-surface-1)] mt-2 text-[var(--ak-text-muted)] hover:text-[var(--ak-semantic-danger)]"
            />
          </div>
        )}
      </PaneList>
    </div>
  )
}

