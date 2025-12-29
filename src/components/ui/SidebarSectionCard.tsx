'use client'

import React from 'react'
import clsx from 'clsx'

type SidebarSectionCardProps = {
  title?: string
  right?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function SidebarSectionCard({
  title,
  right,
  children,
  className,
}: SidebarSectionCardProps) {
  return (
    <div
      className={clsx(
        'bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-fine)] rounded-[var(--ak-radius-lg)]',
        'transition-colors',
        className
      )}
    >
      {(title || right) && (
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--ak-color-border-fine)]">
          {title && (
            <h3 className="text-xs font-semibold text-[var(--ak-color-text-primary)] uppercase tracking-wider">
              {title}
            </h3>
          )}
          {right && <div className="shrink-0">{right}</div>}
        </div>
      )}
      <div className={clsx(title || right ? 'p-0' : 'p-3')}>{children}</div>
    </div>
  )
}

