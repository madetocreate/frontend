'use client'

import React, { useState, useRef, useEffect } from 'react'
import { MagnifyingGlassIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface SidebarHeaderProps {
  title: string
  onSearch?: (query: string) => void
  onToggleInspector?: () => void
  placeholder?: string
}

export function SidebarHeader({ 
  title, 
  onSearch, 
  onToggleInspector, 
  placeholder = 'Suchen...' 
}: SidebarHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isSearchOpen])

  const handleSearchToggle = () => {
    if (isSearchOpen) {
      setQuery('')
      onSearch?.('')
    }
    setIsSearchOpen(!isSearchOpen)
  }

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    onSearch?.(val)
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 h-14 bg-[var(--ak-color-bg-sidebar)]">
      {!isSearchOpen ? (
        <>
          <h2 className="text-sm font-bold text-[var(--ak-color-text-primary)] uppercase tracking-wider truncate">
            {title}
          </h2>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSearchToggle}
              className="p-1.5 rounded-full hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-secondary)] transition-all"
              title="Suche öffnen"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
            </button>
            {onToggleInspector && (
              <button
                onClick={onToggleInspector}
                className="p-1.5 rounded-full hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-secondary)] transition-all"
                title="Inspector öffnen"
              >
                <InformationCircleIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center w-full gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--ak-color-text-muted)]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder={placeholder}
              className="w-full bg-[var(--ak-color-bg-surface-muted)] text-sm rounded-lg pl-7 pr-2 py-1.5 border border-[var(--ak-color-border-subtle)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)] transition-all"
            />
          </div>
          <button
            onClick={handleSearchToggle}
            className="p-1.5 rounded-full hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-secondary)]"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

