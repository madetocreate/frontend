'use client'

import { useState, useEffect } from 'react'
import type { InboxItem } from '@/components/InboxDrawerWidget'
import { InboxReadingPane } from './inbox/InboxReadingPane'
import { RightDrawer } from './inbox/RightDrawer'
import { ActivityEntry } from './inbox/ActivityPanel'
import { InboxTabId } from '@/lib/inbox/actions'
import type { ActionRunResult } from '@/lib/actions/types'

type InboxDetailPanelProps = {
  item: InboxItem | null
  onClose?: () => void
}

const INITIAL_TAB_CONTENTS: Record<InboxTabId, string> = {
  original: '',
  summary: '',
  draft: '',
  tasks: '',
  history: '',
}

export function InboxDetailPanel({ item }: InboxDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<InboxTabId>('original')
  const [tabContents, setTabContents] = useState<Record<InboxTabId, string>>(INITIAL_TAB_CONTENTS)
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(true)

  useEffect(() => {
    if (item) {
      const timer = setTimeout(() => {
        setActiveTab('original')
        setTabContents(INITIAL_TAB_CONTENTS)
        setActivities([])
      }, 0)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id])

  if (!item) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--ak-color-bg-app)]">
        <div className="max-w-xs text-center p-8 rounded-[var(--ak-radius-xl)] bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] shadow-[var(--ak-shadow-md)]">
          <p className="font-semibold text-[var(--ak-color-text-primary)]">Posteingang leer</p>
          <p className="text-sm mt-2 text-[var(--ak-color-text-secondary)]">
            Wähle eine Konversation aus der Liste aus, um mit der Bearbeitung zu beginnen.
          </p>
        </div>
      </div>
    )
  }

  const handleApplyAction = (result: ActionRunResult) => {
    // Placeholder for action handling
    console.log('Action applied:', result)
  }

  return (
    <div className="flex h-full overflow-hidden bg-[var(--ak-color-bg-app)]">
      <div className="flex-1 min-w-0 h-full relative">
        <InboxReadingPane 
          item={item} 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabContents={tabContents}
        />
      </div>

      <RightDrawer 
        item={item} 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onApplyAction={handleApplyAction}
        activities={activities}
      />

      {!isDrawerOpen && (
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed right-6 bottom-6 w-12 h-12 rounded-full bg-[var(--ak-color-accent)] text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-30"
          title="Kontext & Aktionen öffnen"
          aria-label="Kontext & Aktionen öffnen"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}

