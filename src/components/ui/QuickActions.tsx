'use client'

import { useMemo } from 'react'
import { BoltIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import type { AIActionContext } from './AIActions'
import { createActionHandler } from '@/lib/actionHandlers'
import {
  getQuickActionsForContext,
  type QuickActionDefinition,
} from '@/lib/quickActionsCatalog'
import { useQuickActionPreferences } from '@/lib/quickActionsPreferences'

export type QuickAction = QuickActionDefinition & {
  onClick?: () => void
}

interface QuickActionsProps {
  context: AIActionContext
  initialActions?: QuickAction[]
  className?: string
}

export function QuickActions({ 
  context, 
  initialActions,
  className 
}: QuickActionsProps) {
  // Normiere initialActions auf Katalog-Shape (ohne Handler)
  const defaultActions = useMemo<QuickActionDefinition[]>(() => {
    if (initialActions && initialActions.length > 0) {
      return initialActions.map(({ id, label, icon }) => ({ id, label, icon }))
    }
    return getQuickActionsForContext(context)
  }, [context, initialActions])

  // Nutzerpräferenzen (persistiert) greifen vor den Defaults
  const { actions } = useQuickActionPreferences(context, defaultActions)

  const effectiveActions = actions.length > 0 ? actions : defaultActions

  // Wire actions with handlers (fail-closed über Handler-Lookup)
  const wiredActions = effectiveActions.map((action) => ({
    ...action,
    onClick: (action as QuickAction).onClick || createActionHandler('quick-action', action.id, context)
  }))

  if (wiredActions.length === 0) {
    return null
  }

  return (
    <div className={clsx('flex flex-wrap gap-1.5', className)}>
      {wiredActions.map((action) => {
        const Icon = action.icon || BoltIcon
        return (
          <button
            key={action.id}
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-subtle)] hover:bg-[var(--ak-color-bg-hover)] hover:border-[var(--ak-color-border-strong)] transition-all duration-150 text-[11px] font-medium text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] active:scale-95"
            title={action.label}
          >
            <Icon className="h-3 w-3" />
            <span>{action.label}</span>
          </button>
        )
      })}
    </div>
  )
}
