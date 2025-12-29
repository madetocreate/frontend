'use client'

import React, { useMemo } from 'react'
import { getPrimaryActions } from '@/lib/actions/selectors'
import { getActionIcon } from '@/lib/actions/icons'
import { dispatchActionStart } from '@/lib/actions/dispatch'
import type { ActionModule } from '@/lib/actions/types'
import type { ExecutableActionId } from '@/lib/actions/registry'
import { ActionRow } from './ActionRow'
import clsx from 'clsx'

type QuickActionsSectionProps = {
  module: ActionModule
  maxActions?: number
  className?: string
  inCard?: boolean
}

export function QuickActionsSection({ 
  module, 
  maxActions = 5,
  className,
  inCard = false,
}: QuickActionsSectionProps) {
  const actions = useMemo(() => {
    const primaryActions = getPrimaryActions(module)
    return primaryActions.slice(0, maxActions)
  }, [module, maxActions])

  if (actions.length === 0) {
    return null
  }

  const handleActionClick = (actionId: string) => {
    // actionId kommt von selectors, die nur executable Actions liefern
    // dispatchActionStart normalisiert und validiert automatisch
    dispatchActionStart(
      actionId,
      {
        module,
        target: { type: module },
      },
      undefined,
      'sidebar-quick-actions'
    )
  }

  return (
    <div className={clsx(inCard ? 'space-y-0' : 'px-4 py-2 border-b border-[var(--ak-color-border-fine)]', className)}>
      {actions.map((action, index) => {
        const Icon = getActionIcon(action.icon)
        return (
          <div key={action.id} className={index > 0 && inCard ? 'border-t border-[var(--ak-color-border-fine)]' : ''}>
            <ActionRow
              icon={<Icon className="h-4 w-4" />}
              label={action.label}
              description={action.description}
              onClick={() => handleActionClick(action.id)}
              requiresApproval={action.requiresApproval}
            />
          </div>
        )
      })}
    </div>
  )
}

