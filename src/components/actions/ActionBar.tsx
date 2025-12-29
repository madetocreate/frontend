/**
 * Generic ActionBar Komponente
 * Generiert Action-Buttons vollständig aus ACTION_REGISTRY
 * Fast-Actions Suggestions removed - use Suggestion System instead (see Phase 3)
 */

'use client'

import React, { useMemo } from 'react'
import clsx from 'clsx'
import type { ActionModule, ActionContext, ActionId } from '@/lib/actions/types'
import { getActionsForUI, type GetActionsForUIOptions } from '@/lib/actions/selectors'
import { getActionIcon } from '@/lib/actions/icons'
import { dispatchActionStart } from '@/lib/actions/dispatch'
import { validateContext } from '@/lib/actions/contextValidators'
import type { UIPlacement } from '@/lib/actions/types'
import { AkButton } from '@/components/ui/AkButton'
import { useExecuteAction } from '@/lib/actions/execute'
import { isExecutableActionId } from '@/lib/actions/registry'

export interface ActionBarProps {
  module: ActionModule
  context: ActionContext
  placement?: UIPlacement[] // Default: ['primary', 'secondary']
  maxPrimary?: number // Default: 4
  whitelist?: ActionId[] // Optional: Nur diese Actions anzeigen
  blacklist?: ActionId[] // Optional: Diese Actions ausschließen
  className?: string
  // Fast-Actions Suggestions removed - use Suggestion System instead (see Phase 3)
}

/**
 * ActionBar: Generiert Buttons aus Registry
 * 
 * - Primary Actions: Direkt als Buttons
 * - Secondary Actions: Als kleinere Buttons (oder in "Mehr" Dropdown, falls zu viele)
 * - Menu Actions: In "Mehr" Dropdown
 * - Disabled + Tooltip bei fehlendem Context oder availability=false
 */
export function ActionBar({
  module,
  context,
  placement = ['primary', 'secondary'],
  maxPrimary = 4,
  whitelist,
  blacklist,
  className,
}: ActionBarProps) {
  // Context-Validierung
  const contextValidation = useMemo(() => validateContext(module, context), [module, context])
  
  // Fast-Actions Suggestions removed - use Suggestion System instead (see Phase 3)
  
  const { execute: executeAction } = useExecuteAction()

  // Actions aus Registry holen
  // Serialize complex dependencies for useMemo
  const placementKey = JSON.stringify(placement)
  const whitelistKey = JSON.stringify(whitelist)
  const blacklistKey = JSON.stringify(blacklist)
  const contextKey = JSON.stringify(context)

  const allActions = useMemo(() => {
    const options: GetActionsForUIOptions = {
      module,
      placement,
      whitelist,
      blacklist,
      context,
    }
    return getActionsForUI(options)
  }, [module, placementKey, whitelistKey, blacklistKey, contextKey])

  // Aufteilen nach Placement
  const primaryActions = allActions.filter((a) => a.uiPlacement === 'primary').slice(0, maxPrimary)
  const secondaryActions = allActions.filter((a) => a.uiPlacement === 'secondary')
  // Menu Actions werden später implementiert (Dropdown)

  // Handler für Action-Click (Registry Actions)
  const handleActionClick = (actionId: ActionId, defaultConfig?: Record<string, unknown>) => {
    if (!contextValidation.ok) {
      console.warn(`[ActionBar] Context ungültig: ${contextValidation.reason}`)
      return
    }

    dispatchActionStart(actionId, context, defaultConfig, 'ActionBar')
  }
  
  // Fast-Actions Suggestions removed - use Suggestion System instead (see Phase 3)

  // Verfügbarkeitsprüfung für eine Action
  const getActionAvailability = (action: typeof allActions[0]) => {
    if (!contextValidation.ok) {
      return { available: false, reason: contextValidation.reason }
    }

    if (action.availability) {
      return action.availability(context)
    }

    return { available: true }
  }

  // Render Button für eine Action
  const renderActionButton = (
    action: typeof allActions[0],
    variant: 'primary' | 'secondary' = 'secondary'
  ) => {
    const availability = getActionAvailability(action)
    const Icon = getActionIcon(action.icon)
    const isDisabled = !availability.available

    return (
      <AkButton
        key={action.id}
        onClick={() => !isDisabled && handleActionClick(action.id, action.defaultConfig)}
        disabled={isDisabled}
        variant={variant}
        size="sm"
        leftIcon={<Icon className="w-3.5 h-3.5" />}
        title={isDisabled ? availability.reason : action.description || action.label}
      >
        {action.label}
        {action.requiresApproval && (
          <span
            className="ml-1 text-[8px] opacity-75"
            title="Benötigt Freigabe"
            aria-label="Benötigt Freigabe"
          >
            🔒
          </span>
        )}
      </AkButton>
    )
  }

  // Wenn keine Actions vorhanden, nichts rendern
  if (allActions.length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[ActionBar] Keine Actions gefunden für Modul "${module}" mit Placement ${placement.join(', ')}`)
    }
    return null
  }

  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      {/* Fixed Actions (Registry) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 ak-scrollbar-hide no-scrollbar">
        {/* Primary Actions */}
        {primaryActions.map((action) => renderActionButton(action, 'primary'))}

        {/* Secondary Actions */}
        {secondaryActions.map((action) => renderActionButton(action, 'secondary'))}

        {/* Context-Warnung (nur in Dev) */}
        {!contextValidation.ok && process.env.NODE_ENV !== 'production' && (
          <span className="text-[10px] ak-text-secondary italic">
            Context ungültig: {contextValidation.reason}
          </span>
        )}
      </div>
      
      {/* Fast-Actions Suggestions removed - use Suggestion System instead (see Phase 3) */}
    </div>
  )
}

