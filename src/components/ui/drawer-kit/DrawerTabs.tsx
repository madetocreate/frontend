'use client'

import React from 'react'
import clsx from 'clsx'

export type DrawerTabItem = {
  id: string
  label: string
  badge?: string | number
}

type DrawerTabsProps = {
  tabs: DrawerTabItem[]
  activeTab: string
  onTabChange: (id: string) => void
  className?: string
}

export function DrawerTabs({ tabs, activeTab, onTabChange, className }: DrawerTabsProps) {
  return (
    <div className={clsx("flex gap-1 bg-[var(--ak-color-bg-surface-muted)] p-0.5 rounded-lg w-fit", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              "relative px-3 py-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide rounded-md transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]",
              isActive 
                ? "bg-[var(--ak-color-bg-elevated)] text-[var(--ak-color-text-primary)] shadow-sm" 
                : "text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)]"
            )}
            style={isActive ? { color: 'var(--ak-color-accent)' } : undefined}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={clsx(
                "px-1.5 py-0.5 rounded-full text-[9px] leading-none",
                isActive 
                  ? "bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)]" 
                  : "bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-muted)]"
              )}>
                {tab.badge}
              </span>
            )}
            
            {/* Active Indicator Bottom (optional, if we want underline style instead of button style. But prompt implies button-like from 'glass' context) */}
            {/* keeping it simple pill-shape as per DocumentDetailsDrawer example */}
          </button>
        )
      })}
    </div>
  )
}

