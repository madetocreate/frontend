'use client'

import React, { useState, useMemo } from 'react'
import { getActionIcon } from '@/lib/actions/icons'
import { dispatchActionStart } from '@/lib/actions/dispatch'
import type { ActionModule, ActionDefinition, ActionId } from '@/lib/actions/types'
import { getActionDefinition } from '@/lib/actions/registry'
import { PaneTopbar } from '@/components/ui/PaneTopbar'
import { PaneList } from '@/components/ui/PaneList'
import { PaneTile } from '@/components/ui/PaneTile'
import { AkPopoverMenu } from '@/components/ui/AkPopoverMenu'
import { FunnelIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useRef } from 'react'

type QuickActionsSidebarWidgetProps = {
  onToggleCommandPalette?: () => void
  onClose?: () => void
}

const CORE10_ACTION_IDS: readonly ActionId[] = [
  'inbox.summarize',
  'inbox.draft_reply',
  'inbox.ask_missing_info',
  'inbox.next_steps',
  'inbox.prioritize',
  'documents.extract_key_fields',
  'documents.summarize',
  'crm.link_to_customer',
  'reviews.draft_review_reply',
  'website.fetch_and_profile',  // Hidden, wird gefiltert
] as const

const MODULES: { id: ActionModule; label: string }[] = [
  { id: 'inbox', label: 'Posteingang' },
  { id: 'documents', label: 'Dokumente' },
  { id: 'crm', label: 'Kunden' },
  { id: 'reviews', label: 'Reviews' },
]

export function QuickActionsSidebarWidget({
  onToggleCommandPalette,
  onClose,
}: QuickActionsSidebarWidgetProps) {
  const [selectedModule, setSelectedModule] = useState<ActionModule | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const filterButtonRef = useRef<HTMLButtonElement>(null)

  const actions = useMemo(() => {
    // Core-10 Actions aus Registry laden (nur existierende, filtere hidden)
    const coreActions = CORE10_ACTION_IDS
      .map((id) => getActionDefinition(id))
      .filter((action): action is ActionDefinition => action !== undefined)
      .filter((action) => action.uiPlacement !== 'hidden')  // Filter hidden actions
    
    if (selectedModule === null) {
      // Alle Module: alle Core-10 Actions sortiert anzeigen
      return coreActions.sort((a, b) => {
        const orderA = a.uiOrder ?? 1000
        const orderB = b.uiOrder ?? 1000
        if (orderA !== orderB) return orderA - orderB
        return a.label.localeCompare(b.label, 'de')
      })
    } else {
      // Einzelnes Modul: nur Actions für dieses Modul filtern
      return coreActions
        .filter((action) => action.supportedModules.includes(selectedModule))
        .sort((a, b) => {
          const orderA = a.uiOrder ?? 1000
          const orderB = b.uiOrder ?? 1000
          if (orderA !== orderB) return orderA - orderB
          return a.label.localeCompare(b.label, 'de')
        })
    }
  }, [selectedModule])

  const handleActionClick = (actionId: string) => {
    // Finde die Action in den Core-10 Actions
    const coreActions = CORE10_ACTION_IDS
      .map((id) => getActionDefinition(id))
      .filter((action): action is ActionDefinition => action !== undefined)
    const action = coreActions.find((a) => a.id === actionId)
    
    // Modul bestimmen: selectedModule oder aus ActionDefinition
    const actionModule: ActionModule = selectedModule ?? (action?.supportedModules?.[0] ?? 'inbox')
    
    dispatchActionStart(
      actionId,
      {
        module: actionModule,
        target: { type: actionModule },
      },
      undefined,
      'sidebar-quick-actions'
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
                { 
                  label: 'Alle', 
                  onClick: () => {
                    setSelectedModule(null)
                    setIsFilterOpen(false)
                  }
                },
                ...MODULES.map((mod) => ({
                  label: mod.label,
                  onClick: () => {
                    setSelectedModule(mod.id)
                    setIsFilterOpen(false)
                  }
                }))
              ]}
              onClose={() => setIsFilterOpen(false)}
              className="w-48"
            />
          </>
        }
      />

      <PaneList>
        <div className="grid grid-cols-1 gap-2">
          {actions.map((action) => {
            const Icon = getActionIcon(action.icon)
            return (
              <PaneTile
                key={action.id}
                title={action.label}
                subtitle={action.description}
                icon={<Icon className="h-4 w-4" />}
                onClick={() => handleActionClick(action.id)}
                badge={action.requiresApproval ? 'Freigabe' : undefined}
              />
            )
          })}
        </div>
      </PaneList>
    </div>
  )
}

