'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { MagnifyingGlassIcon, CommandLineIcon } from '@heroicons/react/24/outline'
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
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-[var(--ak-color-bg-app)]/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-[var(--ak-radius-xl)] border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/80 backdrop-blur-2xl shadow-[var(--ak-shadow-glass)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-[var(--ak-color-border-hairline)] px-5 py-4">
          <MagnifyingGlassIcon className="h-5 w-5 text-[var(--ak-color-text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Befehl suchen oder Modul wechseln..."
            className="flex-1 bg-transparent text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] outline-none text-base"
          />
          <div className="flex items-center gap-1">
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded-[var(--ak-radius-sm)] border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-1.5 py-0.5 text-[10px] font-bold font-mono text-[var(--ak-color-text-muted)] uppercase tracking-tighter shadow-sm">
              ESC
            </kbd>
          </div>
        </div>

        {/* Commands List */}
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto px-2 py-2 ak-scrollbar"
        >
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-12 text-center flex flex-col items-center justify-center opacity-40">
              <CommandLineIcon className="h-10 w-10 mb-2 text-[var(--ak-color-text-muted)]" />
              <p className="text-sm font-medium text-[var(--ak-color-text-secondary)]">Keine Befehle gefunden</p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, categoryCommands]) => (
              <div key={category} className="mb-2 last:mb-0">
                <div className="px-4 py-2 text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-widest">
                  {CATEGORY_LABELS[category as Command['category']] || category}
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
                        'w-full flex items-center gap-3 px-4 py-2.5 rounded-[var(--ak-radius-lg)] text-left transition-all duration-200',
                        isSelected
                          ? 'bg-[var(--ak-color-accent)] text-white shadow-md shadow-[var(--ak-color-accent-soft)] scale-[1.01]'
                          : 'text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]'
                      )}
                    >
                      <div className={clsx(
                        "flex h-8 w-8 items-center justify-center rounded-[var(--ak-radius-md)] transition-colors",
                        isSelected ? "bg-white/20 text-white" : "bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-muted)]"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={clsx(
                          "text-sm truncate",
                          isSelected ? "font-bold" : "font-medium"
                        )}>{cmd.label}</div>
                        {cmd.description && (
                          <div className={clsx(
                            "text-[11px] truncate opacity-70",
                            isSelected ? "text-white" : "text-[var(--ak-color-text-muted)]"
                          )}>
                            {cmd.description}
                          </div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <div className="flex items-center gap-1">
                          {cmd.shortcut.split(' ').map((key, i) => (
                            <kbd key={i} className={clsx(
                              "inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-[var(--ak-radius-sm)] border px-1 text-[9px] font-bold font-mono uppercase transition-colors shadow-sm",
                              isSelected 
                                ? "bg-white/20 border-white/30 text-white" 
                                : "bg-[var(--ak-color-bg-surface)] border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-muted)]"
                            )}>
                              {key}
                            </kbd>
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--ak-color-border-hairline)] bg-[var(--ak-color-bg-surface-muted)] px-5 py-3 flex items-center justify-between text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <kbd className="rounded-[var(--ak-radius-sm)] border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-1.5 py-0.5 font-mono text-[9px] shadow-sm">↑↓</kbd>
              <span>Navigieren</span>
            </span>
            <span className="flex items-center gap-2">
              <kbd className="rounded-[var(--ak-radius-sm)] border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-1.5 py-0.5 font-mono text-[9px] shadow-sm">ENTER</kbd>
              <span>Ausführen</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CommandLineIcon className="h-3 w-3" />
            <span>{filteredCommands.length} Befehle verfügbar</span>
          </div>
        </div>
      </div>
    </div>
  )
}

