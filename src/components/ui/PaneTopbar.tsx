import clsx from 'clsx'
import type { ReactNode } from 'react'

interface PaneTopbarProps {
  rightActions?: ReactNode
  leftSlot?: ReactNode
  className?: string
}

export function PaneTopbar({ 
  rightActions, 
  leftSlot,
  className 
}: PaneTopbarProps) {
  return (
    <div className={clsx(
      "h-[var(--ak-sidebar-topbar-height)] flex items-center justify-between px-[var(--ak-sidebar-pad-x)] flex-shrink-0 bg-[var(--ak-surface-0)] z-20",
      className
    )}>
      <div className="flex items-center gap-2">
        {leftSlot}
      </div>
      <div className="flex items-center gap-1">
        {rightActions}
      </div>
    </div>
  )
}

