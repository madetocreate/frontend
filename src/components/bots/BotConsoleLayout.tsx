'use client'

import React, { ReactNode } from 'react'
import { ComponentType } from 'react'
import { DrawerTabs, DrawerTabItem } from '@/components/ui/drawer-kit/DrawerTabs'
import { AkBadge, AkBadgeTone } from '@/components/ui/AkBadge'
import { AkButton } from '@/components/ui/AkButton'

export type BotStatus = 'connected' | 'needs_setup' | 'error' | 'disabled'

export type BotTabId = 'overview' | 'setup' | 'configuration' | 'logs' | 'broadcasts'

export interface BotConsoleLayoutProps {
  // Header
  title: string
  description: string
  icon?: ComponentType<{ className?: string }>
  status: BotStatus
  statusLabel?: string
  primaryAction?: {
    label: string
    onClick: () => void
    icon?: ComponentType<{ className?: string }>
  }
  
  // Tabs
  tabs: DrawerTabItem[]
  activeTab: BotTabId
  onTabChange: (tab: string) => void
  
  // Content
  children: ReactNode
  
  // Right Rail / Inspector (optional)
  rightRail?: ReactNode
}

const STATUS_CONFIG: Record<BotStatus, { tone: AkBadgeTone; label: string }> = {
  connected: { tone: 'success', label: 'Verbunden' },
  needs_setup: { tone: 'warning', label: 'Setup erforderlich' },
  error: { tone: 'error', label: 'Fehler' },
  disabled: { tone: 'muted', label: 'Deaktiviert' },
}

export function BotConsoleLayout({
  title,
  description,
  icon: Icon,
  status,
  statusLabel,
  primaryAction,
  tabs,
  activeTab,
  onTabChange,
  children,
  rightRail,
}: BotConsoleLayoutProps) {
  const statusConfig = STATUS_CONFIG[status]
  const displayStatusLabel = statusLabel || statusConfig.label

  return (
    <div className="flex h-full w-full overflow-hidden bg-[var(--ak-color-bg-app)]">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="shrink-0 ak-glass-drawer-header border-b border-[var(--ak-color-border-subtle)]">
          <div className="px-6 py-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {Icon && (
                  <div className="w-10 h-10 rounded-xl bg-[var(--ak-color-accent-soft)] flex items-center justify-center shrink-0 border border-[var(--ak-color-border-subtle)]">
                    <Icon className="w-6 h-6 text-[var(--ak-color-accent)]" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl font-bold text-[var(--ak-color-text-primary)] tracking-tight truncate">
                      {title}
                    </h1>
                    <AkBadge tone={statusConfig.tone} size="sm">
                      {displayStatusLabel}
                    </AkBadge>
                  </div>
                  <p className="text-sm text-[var(--ak-color-text-secondary)]">
                    {description}
                  </p>
                </div>
              </div>
              
              {primaryAction && (
                <div className="shrink-0">
                  <AkButton
                    variant="primary"
                    size="sm"
                    onClick={primaryAction.onClick}
                    leftIcon={primaryAction.icon ? <primaryAction.icon className="w-4 h-4" /> : undefined}
                  >
                    {primaryAction.label}
                  </AkButton>
                </div>
              )}
            </div>
            
            {/* Tabs */}
            <div className="flex items-center">
              <DrawerTabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={onTabChange}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 min-h-0 overflow-y-auto ak-scrollbar">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Right Rail / Inspector */}
      {rightRail && (
        <aside className="w-[var(--ak-sidebar-width)] border-l border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] flex-shrink-0 overflow-y-auto ak-scrollbar">
          {rightRail}
        </aside>
      )}
    </div>
  )
}

