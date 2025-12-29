'use client'

import React, { ComponentType, ReactNode } from 'react'
import { DrawerTabs, DrawerTabItem } from './DrawerTabs'
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline'

type InspectorHeaderProps = {
  icon?: ComponentType<{ className?: string }>
  title: string
  subtitle?: string
  tabs?: DrawerTabItem[]
  activeTab?: string
  onTabChange?: (id: string) => void
  onClose: () => void
  onExpand?: () => void
  isExpanded?: boolean
  actions?: ReactNode
}

export function InspectorHeader({
  icon: Icon,
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  onClose,
  onExpand,
  isExpanded,
  actions
}: InspectorHeaderProps) {
  return (
    <div className="flex flex-col w-full ak-glass-drawer-header sticky top-0 z-20">
      {/* Top Row: Icon + Title + Actions */}
      <div className="flex items-center justify-between px-4 min-h-[56px] gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-[var(--ak-color-accent-soft)] flex items-center justify-center shrink-0 border border-[var(--ak-color-border-subtle)] shadow-sm">
              <Icon className="w-4 h-4 text-[var(--ak-color-accent-strong)]" />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-[var(--ak-font-size-base)] font-semibold tracking-tight text-[var(--ak-color-text-primary)] truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[var(--ak-font-size-xs)] text-[var(--ak-color-text-muted)] mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {actions}
          
          <div className="flex items-center gap-1 ml-1 border-l border-[var(--ak-color-border-hairline)] pl-2">
            {onExpand && (
              <button
                onClick={onExpand}
                className="p-1.5 rounded-lg hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-secondary)] transition-colors"
                title={isExpanded ? "Verkleinern" : "Vergrößern"}
              >
                {isExpanded ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-secondary)] transition-colors"
              title="Schließen"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Tabs (optional) */}
      {tabs && tabs.length > 0 && activeTab && onTabChange && (
        <div className="px-4 pb-3">
            <DrawerTabs 
                tabs={tabs} 
                activeTab={activeTab} 
                onTabChange={onTabChange} 
            />
        </div>
      )}
    </div>
  )
}

