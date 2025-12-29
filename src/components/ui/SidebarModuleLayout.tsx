'use client'

import React from 'react'
import { SidebarHeader } from './SidebarHeader'
import clsx from 'clsx'

type SidebarModuleLayoutProps = {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  onToggleCommandPalette?: () => void
  onSearch?: (query: string) => void
  primaryAction?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
  headerMode?: 'default' | 'clean' | 'none'
}

export function SidebarModuleLayout({
  title,
  subtitle,
  actions,
  onToggleCommandPalette,
  onSearch,
  primaryAction,
  children,
  footer,
  className,
  headerMode = 'default',
}: SidebarModuleLayoutProps) {
  return (
    <div className={clsx('flex h-full flex-col bg-transparent relative', className)}>
      {headerMode === 'default' && (
        <SidebarHeader
          title={title}
          subtitle={subtitle}
          actions={actions}
          onToggleCommandPalette={onToggleCommandPalette}
          onSearch={onSearch}
          primaryAction={primaryAction}
        />
      )}

      <div className={clsx(
        "flex-1 overflow-y-auto ak-scrollbar px-3",
        headerMode === 'default' ? 'py-3' : 'pt-2 pb-3',
        headerMode === 'none' && 'px-0 pt-0' // No padding for none mode
      )}>
        {children}
      </div>

      {footer && (
        <>
          {/* Divider before Footer */}
          <div className="h-px bg-[var(--ak-color-border-subtle)] opacity-60 mx-3" />
          <div className="shrink-0">
            {footer}
          </div>
        </>
      )}
    </div>
  )
}

