import clsx from 'clsx'
import type { ReactNode } from 'react'

interface PaneListProps {
  children: ReactNode
  className?: string
}

export function PaneList({ 
  children, 
  className 
}: PaneListProps) {
  return (
    <div className={clsx(
      "flex-1 overflow-y-auto ak-scrollbar px-[var(--ak-sidebar-pad-x)] py-[var(--ak-sidebar-pad-y)]",
      className
    )}>
      {children}
    </div>
  )
}

