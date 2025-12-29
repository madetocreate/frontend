'use client'

import React, { useState, useRef } from 'react'
import { MagnifyingGlassIcon, CommandLineIcon } from '@heroicons/react/24/outline'

interface SidebarHeaderProps {
  title?: string
  subtitle?: string
  onSearch?: (query: string) => void
  onToggleCommandPalette?: () => void
  placeholder?: string
  primaryAction?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  actions?: React.ReactNode
}

export function SidebarHeader({ 
  title,
  subtitle,
  onSearch, 
  onToggleCommandPalette,
  placeholder = 'Suchen...',
  primaryAction,
  actions,
}: SidebarHeaderProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    onSearch?.(val)
  }

  return (
    <div className="flex items-center justify-between px-[var(--ak-sidebar-pad-x)] h-[var(--ak-sidebar-topbar-height)]">
      {title && (
        <div className="min-w-0 flex-1">
          <h2 className="text-[14px] font-bold text-[var(--ak-color-text-primary)] truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] font-medium text-[var(--ak-color-text-muted)] mt-0.5 truncate opacity-70">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className="flex items-center gap-2 w-full">
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="px-3 py-1.5 rounded-md text-[12px] font-medium bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] hover:bg-[var(--ak-color-accent-hover)] shadow-sm flex items-center gap-1.5 transition-all shrink-0"
            title={primaryAction.label}
          >
            {primaryAction.icon}
            <span>{primaryAction.label}</span>
          </button>
        )}
        {actions}
        {onToggleCommandPalette && (
          <button
            onClick={onToggleCommandPalette}
            className="p-1.5 rounded-full transition-all ak-sidebar-button text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] shrink-0"
            title="Befehle (Cmd+K)"
          >
            <CommandLineIcon className="h-4 w-4" />
          </button>
        )}
        
        {/* Compact Search Field - Always Visible */}
        {onSearch && (
          <div className="relative flex-1 min-w-0">
            <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--ak-color-text-muted)] pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder={placeholder}
              className="w-full bg-[var(--ak-color-bg-surface-muted)] text-[13px] rounded-lg pl-7 pr-2 py-1.5 border border-[var(--ak-color-border-subtle)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)] transition-all placeholder:text-[var(--ak-color-text-muted)] placeholder:text-[12px]"
            />
          </div>
        )}
      </div>
    </div>
  )
}

