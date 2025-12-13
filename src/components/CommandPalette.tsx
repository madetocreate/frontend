'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { MagnifyingGlassIcon, CommandLineIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

export type Command = {
  id: string
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  category: 'navigation' | 'action' | 'search' | 'settings'
  action: () => void
  shortcut?: string
  keywords?: string[] // Für bessere Suche
}

type CommandPaletteProps = {
  isOpen: boolean
  onClose: () => void
  commands: Command[]
}

const CATEGORY_LABELS: Record<Command['category'], string> = {
  navigation: 'Navigation',
  action: 'Aktionen',
  search: 'Suche',
  settings: 'Einstellungen',
}

export function CommandPalette({ isOpen, onClose, commands }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      return commands
    }

    const normalizedQuery = query.toLowerCase().trim()
    
    return commands.filter((cmd) => {
      const labelMatch = cmd.label.toLowerCase().includes(normalizedQuery)
      const descriptionMatch = cmd.description?.toLowerCase().includes(normalizedQuery)
      const keywordMatch = cmd.keywords?.some((kw) => kw.toLowerCase().includes(normalizedQuery))
      
      return labelMatch || descriptionMatch || keywordMatch
    })
  }, [commands, query])

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {}
    
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = []
      }
      groups[cmd.category].push(cmd)
    })
    
    return groups
  }, [filteredCommands])

  // Reset selection when query changes (defer to next tick to avoid rule noise)
  useEffect(() => {
    const t = setTimeout(() => setSelectedIndex(0), 0)
    return () => clearTimeout(t)
  }, [query])

  // Reset state when opened (defer to next tick)
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => {
        setQuery('')
        setSelectedIndex(0)
      }, 0)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  // Focus input after state reset
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [selectedIndex])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selectedCommand = filteredCommands[selectedIndex]
        if (selectedCommand) {
          selectedCommand.action()
          onClose()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    },
    [filteredCommands, selectedIndex, onClose]
  )

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] shadow-2xl ak-glass-popover"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-[var(--ak-color-border-subtle)] px-4 py-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-[var(--ak-color-text-secondary)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Befehle durchsuchen..."
            className="flex-1 bg-transparent text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-tertiary)] outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-2 py-1 text-xs font-mono text-[var(--ak-color-text-secondary)]">
            <span className="text-[10px]">⌘</span>K
          </kbd>
        </div>

        {/* Commands List */}
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto px-2 py-2"
        >
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[var(--ak-color-text-secondary)]">
              Keine Befehle gefunden
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, categoryCommands]) => (
              <div key={category} className="mb-2">
                <div className="px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-tertiary)] uppercase tracking-wider">
                  {CATEGORY_LABELS[category as Command['category']]}
                </div>
                {categoryCommands.map((cmd) => {
                  const globalIndex = filteredCommands.indexOf(cmd)
                  const isSelected = globalIndex === selectedIndex
                  const Icon = cmd.icon || CommandLineIcon

                  return (
                    <button
                      key={cmd.id}
                      data-index={globalIndex}
                      type="button"
                      onClick={() => {
                        cmd.action()
                        onClose()
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={clsx(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors',
                        isSelected
                          ? 'bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-primary)]'
                          : 'text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]'
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-xs text-[var(--ak-color-text-tertiary)] truncate">
                            {cmd.description}
                          </div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-2 py-0.5 text-xs font-mono text-[var(--ak-color-text-secondary)]">
                          {cmd.shortcut}
                        </kbd>
                      )}
                      {isSelected && (
                        <ArrowRightIcon className="h-4 w-4 text-[var(--ak-color-text-secondary)]" />
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--ak-color-border-subtle)] px-4 py-2 flex items-center justify-between text-xs text-[var(--ak-color-text-tertiary)]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-1.5 py-0.5 font-mono">↑↓</kbd>
              <span>Navigieren</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-1.5 py-0.5 font-mono">↵</kbd>
              <span>Auswählen</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-1.5 py-0.5 font-mono">Esc</kbd>
              <span>Schließen</span>
            </span>
          </div>
          <div className="text-[var(--ak-color-text-tertiary)]">
            {filteredCommands.length} {filteredCommands.length === 1 ? 'Befehl' : 'Befehle'}
          </div>
        </div>
      </div>
    </div>
  )
}

