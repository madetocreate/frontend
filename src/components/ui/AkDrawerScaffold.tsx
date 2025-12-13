'use client'

import type { ReactNode } from 'react'
import clsx from 'clsx'

export type AkDrawerScaffoldProps = {
  title: ReactNode
  subtitle?: ReactNode
  leading?: ReactNode
  trailing?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
  headerClassName?: string
  bodyClassName?: string
  footerClassName?: string
}

export function AkDrawerScaffold({
  title,
  subtitle,
  leading,
  trailing,
  children,
  footer,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
}: AkDrawerScaffoldProps) {
  return (
    <div className={clsx('flex h-full min-h-0 flex-col', className)}>
      <div className={clsx('ak-drawer-header', headerClassName)}>
        <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-2">
          <div className="flex items-center">{leading}</div>
          <div className="min-w-0">
            <div className="truncate text-[var(--ak-font-size-base)] font-semibold tracking-tight text-[var(--ak-color-text-primary)]">
              {title}
            </div>
            {subtitle ? (
              <div className="truncate text-[var(--ak-font-size-xs)] text-[var(--ak-color-text-secondary)]">
                {subtitle}
              </div>
            ) : null}
          </div>
          <div className="flex items-center justify-end gap-2">{trailing}</div>
        </div>
      </div>

      <div className={clsx('flex-1 min-h-0 overflow-y-auto', bodyClassName)}>{children}</div>

      {footer ? <div className={clsx('ak-drawer-footer', footerClassName)}>{footer}</div> : null}
    </div>
  )
}
