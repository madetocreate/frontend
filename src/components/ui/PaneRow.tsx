'use client'

import clsx from 'clsx'
import type { ReactNode, KeyboardEvent } from 'react'
import { AkListRow } from './AkListRow'
import type { AkAccent } from './AkButton'

export interface PaneRowProps {
  leading?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  trailing?: ReactNode
  selected?: boolean
  unread?: boolean
  accent?: AkAccent
  onClick?: () => void
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void
  className?: string
}

export function PaneRow({
  leading,
  title,
  subtitle,
  trailing,
  selected = false,
  unread = false,
  accent = 'default',
  onClick,
  onKeyDown,
  className,
}: PaneRowProps) {
  return (
    <AkListRow
      onClick={onClick}
      onKeyDown={onKeyDown}
      selected={selected}
      accent={accent}
      className={clsx(
        // Basis-Anpassungen für Pane-Kontext
        "py-[var(--ak-row-padding-y)] px-[var(--ak-row-padding-x)] rounded-lg min-h-[var(--ak-row-height)]",
        // Unread Styling (optional: ganzer Text bold oder nur Dot)
        unread && "font-semibold bg-[var(--ak-color-bg-surface-muted)]/50",
        className
      )}
      title={
        <div className={clsx("text-[14px] leading-tight", unread ? "font-bold text-[var(--ak-color-text-primary)]" : "font-medium text-[var(--ak-color-text-primary)]")}>
          {title}
        </div>
      }
      subtitle={
        subtitle ? (
          <div className="text-[12px] text-[var(--ak-color-text-muted)] mt-0.5 line-clamp-1 leading-snug">
            {subtitle}
          </div>
        ) : undefined
      }
      leading={leading}
      trailing={
        <div className="flex items-center gap-2">
          {trailing}
          {unread && !selected && (
            <div className="h-2 w-2 rounded-full bg-[var(--ak-color-accent)]" />
          )}
        </div>
      }
    />
  )
}

export default PaneRow
