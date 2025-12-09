'use client'

import type { FC, ReactNode } from 'react'
import clsx from 'clsx'
import { emitQuickAction } from '@/lib/quickActionsBus'
import { WidgetCard } from '@/components/ui/WidgetCard'

export type QuickActionDefinition = {
  id: string
  title: string
  description: string
  icon?: ReactNode
  category?: string // Optional: "Marketing", "CRM" etc.
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
    <WidgetCard title={title} subtitle={subtitle} padding="sm" shadow={false}>
      <div className={clsx('flex-1 gap-2 overflow-y-auto', gridClass)}>
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => handleClick(action.id)}
            className={clsx(
              'group flex w-full flex-col rounded-[var(--ak-radius-card)] border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/80 px-3 py-2.5 text-left shadow-sm backdrop-blur-sm transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)]',
              'hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)]/80 hover:shadow-[var(--ak-shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25 focus-visible:ring-offset-1'
            )}
          >
            <div className="flex items-start gap-2.5">
              {action.icon ? (
                <div className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center text-[var(--ak-color-text-primary)]">
                  {action.icon}
                </div>
              ) : null}
              <div className="flex min-w-0 flex-1 flex-col">
                {action.category && (
                  <span className="ak-caption mb-1 text-[var(--ak-color-text-muted)]">
                    {action.category}
                  </span>
                )}
                <span className="ak-body truncate font-semibold">
                  {action.title}
                </span>
                <span className="ak-caption mt-1 line-clamp-2 text-[var(--ak-color-text-secondary)]">
                  {action.description}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </WidgetCard>
  )
}
