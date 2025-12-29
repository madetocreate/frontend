'use client'

import type { ReactNode } from 'react'
import { useRef } from 'react'
import clsx from 'clsx'
import { useScrollToTopOnOpen } from '@/hooks/useScrollToTopOnOpen'

export type AkDrawerScaffoldProps = {
  header?: ReactNode
  title?: ReactNode
  subtitle?: ReactNode
  leading?: ReactNode
  trailing?: ReactNode
  children: ReactNode
  footer?: ReactNode
  variant?: 'default' | 'graphite'
  className?: string
  headerClassName?: string
  bodyClassName?: string
  footerClassName?: string
  contentKey?: string | number | null
  isOpen?: boolean
}

export function AkDrawerScaffold({
  header,
  title,
  subtitle,
  leading,
  trailing,
  children,
  footer,
  variant = 'default',
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  contentKey,
  isOpen = true,
}: AkDrawerScaffoldProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  // Reset scroll when drawer opens or content key changes
  useScrollToTopOnOpen({
    isOpen,
    contentKey,
    scrollRef: scrollRef as React.RefObject<HTMLElement>,
    headerRef: headerRef as React.RefObject<HTMLElement>,
  })

  return (
    <div className={clsx('flex h-full min-h-0 flex-col', className)}>
      {header ? (
        <div 
          ref={headerRef}
          className={clsx('shrink-0 z-20', headerClassName)}
        >
          {header}
        </div>
      ) : (
        <div 
          ref={headerRef}
          className={clsx(
            'ak-drawer-header shrink-0 z-20 ak-glass-drawer-header sticky top-0', 
            variant === 'graphite' && 'bg-[var(--ak-color-graphite-surface)] text-[var(--ak-color-graphite-text)] !backdrop-filter-none !border-none',
            headerClassName
          )}
          style={variant === 'graphite' ? { borderBottom: '1px solid var(--ak-color-graphite-border)' } : undefined}
        >
          <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-2">
            <div className="flex items-center">{leading}</div>
            <div className="min-w-0">
              <div className={clsx(
                "truncate text-[var(--ak-font-size-base)] font-semibold tracking-tight",
                variant === 'graphite' ? "text-[var(--ak-color-graphite-text)]" : "text-[var(--ak-color-text-primary)]"
              )}>
                {title}
              </div>
              {subtitle ? (
                <div className={clsx(
                  "truncate text-[var(--ak-font-size-xs)]",
                  variant === 'graphite' ? "text-[var(--ak-color-graphite-text)] opacity-70" : "text-[var(--ak-color-text-secondary)]"
                )}>
                  {subtitle}
                </div>
              ) : null}
            </div>
            <div className="flex items-center justify-end gap-2">{trailing}</div>
          </div>
        </div>
      )}

      <div 
        ref={scrollRef}
        className={clsx('flex-1 min-h-0 overflow-y-auto ak-scrollbar relative', bodyClassName)}
      >
        {children}
      </div>

      {footer ? (
        <div 
          className={clsx(
            'ak-drawer-footer shrink-0 z-20 ak-glass-drawer-footer sticky bottom-0', 
            variant === 'graphite' && 'bg-[var(--ak-color-graphite-surface)] text-[var(--ak-color-graphite-text)] !backdrop-filter-none !border-none',
            footerClassName
          )}
          style={variant === 'graphite' ? { borderTop: '1px solid var(--ak-color-graphite-border)' } : undefined}
        >
          {footer}
        </div>
      ) : null}
    </div>
  )
}
