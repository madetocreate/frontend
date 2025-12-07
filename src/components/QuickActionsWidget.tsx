'use client'

import type { FC, ReactNode } from 'react'
import clsx from 'clsx'
import { emitQuickAction } from '@/lib/quickActionsBus'

export type QuickActionDefinition = {
  id: string
  title: string
  description: string
  icon?: ReactNode
}

type QuickActionsWidgetProps = {
  title: string
  subtitle?: string
  source?: string
  columns?: 1 | 2
  actions: QuickActionDefinition[]
  onSelectAction?: (id: string) => void
}

export const QuickActionsWidget: FC<QuickActionsWidgetProps> = ({
  title,
  subtitle,
  source,
  columns = 2,
  actions,
  onSelectAction,
}) => {
  const handleClick = (id: string) => {
    emitQuickAction({ id, source })
    if (onSelectAction) {
      onSelectAction(id)
    }
  }

  const gridClass =
    columns === 1 ? 'grid grid-cols-1' : 'grid grid-cols-2'

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </p>
        {subtitle ? (
          <p className="text-xs text-slate-500">{subtitle}</p>
        ) : null}
      </div>

      <div className={clsx('flex-1 gap-2 overflow-y-auto pr-1', gridClass)}>
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => handleClick(action.id)}
            className={clsx(
              'group flex w-full flex-col rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-left text-xs shadow-sm transition-colors',
              'hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-slate-50'
            )}
          >
            <div className="flex items-start gap-2">
              {action.icon ? (
                <div className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900">
                  {action.icon}
                </div>
              ) : null}
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[13px] font-semibold text-slate-900">
                  {action.title}
                </span>
                <span className="mt-0.5 text-[11px] text-slate-500">
                  {action.description}
                </span>
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--ak-color-accent)]">
                  <span>Jetzt starten</span>
                  <span aria-hidden="true">↗</span>
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
