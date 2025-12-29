'use client'

import { useState, useEffect, useMemo, useRef, useCallback, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlassIcon, CommandLineIcon, ClockIcon, BoltIcon, PaperClipIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { usePathname } from 'next/navigation'
import { loadRecentCommands, addRecentCommand, type RecentCommand } from '@/lib/cmdk/recent'
import { useAklowEscape } from '@/hooks/useAklowEscape'
import { getWorkspaceByPath } from '@/components/shell-v2/workspaces'

// Constants for command ID prefixes and patterns
const WORKFLOW_PREFIX = 'workflow-'
const ACTION_PREFIX = 'action-'
const NAV_PREFIX = 'nav-'

export type Command = {
  id: string
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  category: 'navigation' | 'action' | 'search' | 'settings' | 'inbox' | 'customers' | 'automation' | 'docs'
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
  inbox: '✨ KI: Posteingang',
  customers: '👥 KI: Kunden & CRM',
  automation: '🤖 KI: Automatisierung',
  docs: '📄 KI: Dokumente',
}

export function CommandPalette({ isOpen, onClose, commands }: CommandPaletteProps) {
  const pathname = usePathname()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentCommands, setRecentCommands] = useState<RecentCommand[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const previousBodyOverflowRef = useRef<string>('')
  const titleId = useId()
  
  // Determine current context from pathname
  const workspace = useMemo(() => getWorkspaceByPath(pathname), [pathname])
  const currentContext = useMemo(() => {
    if (!workspace) return 'general'
    const workspaceId = workspace.id
    if (workspaceId === 'inbox') return 'inbox'
    if (workspaceId === 'docs') return 'docs'
    if (workspaceId === 'customers' || workspaceId === 'leads' || workspaceId === 'serviceHub') return 'customers'
    if (workspaceId === 'settings') return 'settings'
    return 'general'
  }, [workspace])

  // Load recent commands
  useEffect(() => {
    setRecentCommands(loadRecentCommands())
  }, [isOpen])

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

  // Get recent commands that match current commands
  const recentCommandsToShow = useMemo(() => {
    const commandIds = new Set(commands.map((c) => c.id))
    const recent = recentCommands
      .filter((recent) => commandIds.has(recent.id))
      .map((recent) => commands.find((c) => c.id === recent.id)!)
      .filter(Boolean)
    
    if (!query.trim()) {
      return recent.slice(0, 5) // Max 5 recent if no query
    }
    
    // If searching, only show recent that match query
    const normalizedQuery = query.toLowerCase().trim()
    return recent.filter(cmd => 
      cmd.label.toLowerCase().includes(normalizedQuery) ||
      cmd.keywords?.some(kw => kw.toLowerCase().includes(normalizedQuery))
    ).slice(0, 3) // Max 3 recent in search
  }, [recentCommands, commands, query])

  // Pinned commands (Schnellzugriff) - context-dependent, max 6, no duplicates with recents
  const pinnedCommands = useMemo(() => {
    const recentIds = new Set(recentCommandsToShow.map((c) => c.id))
    const pinnedIds = new Set<string>()
    
    // Define context-specific pin mappings (using constants for prefixes)
    const pinMappings: Record<string, string[]> = {
      inbox: [
        `${WORKFLOW_PREFIX}inbox.summarize`,
        `${WORKFLOW_PREFIX}inbox.draft_reply`,
        `${WORKFLOW_PREFIX}inbox.create_task`,
        `${WORKFLOW_PREFIX}inbox.next_steps`,
        `${ACTION_PREFIX}new-chat`,
        `${NAV_PREFIX}inbox`,
      ],
      docs: [
        `${WORKFLOW_PREFIX}documents.upload`,
        `${WORKFLOW_PREFIX}documents.summarize`,
        `${WORKFLOW_PREFIX}documents.extract_key_fields`,
        `${NAV_PREFIX}docs`,
      ],
      customers: [
        `${ACTION_PREFIX}new-customer`,
        `${NAV_PREFIX}service`,
        `${WORKFLOW_PREFIX}crm.link_to_customer`,
        `${WORKFLOW_PREFIX}customers.create`,
      ],
      settings: [`${NAV_PREFIX}settings`],
      general: [],
    }
    
    const pinIds = pinMappings[currentContext] || []
    const pinned: Command[] = []
    
    for (const pinId of pinIds) {
      if (pinned.length >= 6) break
      if (recentIds.has(pinId) || pinnedIds.has(pinId)) continue
      
      // Try to find command by ID (exact match or contains the action ID without prefix)
      const actionId = pinId.replace(WORKFLOW_PREFIX, '').replace(ACTION_PREFIX, '').replace(NAV_PREFIX, '')
      const cmd = filteredCommands.find(c => 
        c.id === pinId || c.id.includes(actionId)
      )
      
      if (cmd && !recentIds.has(cmd.id) && !pinnedIds.has(cmd.id)) {
        pinned.push(cmd)
        pinnedIds.add(cmd.id)
      }
    }
    
    return pinned
  }, [filteredCommands, recentCommandsToShow, currentContext])

  // Combine recent + pinned + filtered commands for navigation
  const allCommandsForNavigation = useMemo(() => {
    const recentIds = new Set(recentCommandsToShow.map((c) => c.id))
    const pinnedIds = new Set(pinnedCommands.map((c) => c.id))
    const filteredWithoutRecentOrPinned = filteredCommands.filter((c) => !recentIds.has(c.id) && !pinnedIds.has(c.id))
    
    // Recent commands always on top, then pinned, then rest
    return [...recentCommandsToShow, ...pinnedCommands, ...filteredWithoutRecentOrPinned]
  }, [recentCommandsToShow, pinnedCommands, filteredCommands])

  // Group commands by category (excluding those already in recent or pinned)
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {}
    const recentIds = new Set(recentCommandsToShow.map((c) => c.id))
    const pinnedIds = new Set(pinnedCommands.map((c) => c.id))
    
    filteredCommands
      .filter(cmd => !recentIds.has(cmd.id) && !pinnedIds.has(cmd.id))
      .forEach((cmd) => {
        if (!groups[cmd.category]) {
          groups[cmd.category] = []
        }
        groups[cmd.category].push(cmd)
      })
    
    return groups
  }, [filteredCommands, recentCommandsToShow, pinnedCommands])

  // Dynamic category order based on context
  const categoryOrder = useMemo(() => {
    const baseOrder: Command['category'][] = ['navigation', 'action', 'inbox', 'customers', 'docs', 'automation', 'settings', 'search']
    
    // Determine priority category for current context
    const priorityCategory: Record<string, Command['category']> = {
      inbox: 'inbox',
      docs: 'docs',
      customers: 'customers',
      settings: 'settings',
      general: 'navigation',
    }
    
    const priority = priorityCategory[currentContext] || 'navigation'
    const rest = baseOrder.filter(cat => cat !== priority)
    
    return [priority, ...rest]
  }, [currentContext])

  // Handle command execution (with recent tracking)
  const handleCommandExecute = useCallback((cmd: Command) => {
    addRecentCommand(cmd.id, cmd.label)
    cmd.action()
    onClose()
  }, [onClose])

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

  // ESC: zentralisiertes Escape-Handling (konsistent, auch wenn Fokus nicht im Input ist)
  useAklowEscape({ enabled: isOpen, onEscape: onClose })

  // Focus + Scroll-Lock + Restore-Focus
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null
      previousBodyOverflowRef.current = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      const raf = requestAnimationFrame(() => {
        inputRef.current?.focus()
      })

      return () => {
        cancelAnimationFrame(raf)
        document.body.style.overflow = previousBodyOverflowRef.current
        previousFocusRef.current?.focus?.()
      }
    }
  }, [isOpen])

  // Focus trap (Tab/Shift+Tab) innerhalb des Dialogs
  useEffect(() => {
    if (!isOpen) return

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const dialog = dialogRef.current
      if (!dialog) return

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => {
        if (el.hasAttribute('disabled')) return false
        if (el.getAttribute('aria-disabled') === 'true') return false
        return true
      })

      if (focusable.length === 0) {
        e.preventDefault()
        dialog.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement as HTMLElement | null
      const activeInside = !!active && dialog.contains(active)

      if (!activeInside) {
        e.preventDefault()
        first.focus()
        return
      }

      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', handleTab)
    return () => window.removeEventListener('keydown', handleTab)
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
        setSelectedIndex((prev) => Math.min(prev + 1, allCommandsForNavigation.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selectedCommand = allCommandsForNavigation[selectedIndex]
        if (selectedCommand) {
          handleCommandExecute(selectedCommand)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    },
    [allCommandsForNavigation, selectedIndex, onClose, handleCommandExecute]
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Enhanced Backdrop with Spotlight Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-[var(--ak-color-graphite-base)]/60 backdrop-blur-md"
            onClick={onClose}
          >
            {/* Spotlight Gradient */}
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-blue-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />
          </motion.div>

          {/* Enhanced Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ type: 'spring', stiffness: 450, damping: 35 }}
            className="fixed top-[15vh] left-1/2 -translate-x-1/2 z-[101] w-full max-w-2xl px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              className="relative rounded-[var(--ak-radius-2xl)] border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/95 backdrop-blur-2xl ak-shadow-elev-3 overflow-hidden"
            >
              <h2 id={titleId} className="sr-only">
                Command Palette
              </h2>
              {/* Enhanced Search Input */}
              <div className="relative flex items-center gap-3 border-b border-[var(--ak-color-border-hairline)] px-6 py-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--ak-radius-xl)] bg-[var(--ak-color-accent)] ak-shadow-colored">
                  <MagnifyingGlassIcon className="h-5 w-5" style={{ color: 'var(--ak-text-primary-dark)' }} />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Befehl oder Kunden suchen..."
                  className="flex-1 bg-transparent text-lg font-medium text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] outline-none"
                />
                <div className="flex items-center gap-2">
                  <kbd className="hidden sm:inline-flex items-center gap-1 rounded-[var(--ak-radius-sm)] border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-2 py-1 text-[10px] font-bold font-mono text-[var(--ak-color-text-muted)] shadow-sm uppercase">
                    ESC
                  </kbd>
                </div>
              </div>

        {/* Commands List */}
        <div
          ref={listRef}
          className="max-h-[55vh] overflow-y-auto px-2 py-2 ak-scrollbar"
        >
          {allCommandsForNavigation.length === 0 ? (
            <div className="px-4 py-16 text-center flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-2xl bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center mb-4">
                <CommandLineIcon className="h-6 w-6 text-[var(--ak-color-text-muted)]" />
              </div>
              <p className="text-sm font-semibold text-[var(--ak-color-text-primary)] mb-1">Keine Treffer gefunden</p>
              <p className="text-xs text-[var(--ak-color-text-muted)]">Versuche es mit einem anderen Suchbegriff</p>
            </div>
          ) : (
            <>
              {/* Recent Commands Section */}
              {recentCommandsToShow.length > 0 && (
                <div className="mb-3">
                  <div className="px-4 py-2 text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-widest flex items-center gap-2 opacity-60">
                    <ClockIcon className="h-3 w-3" />
                    Zuletzt verwendet
                  </div>
                  {recentCommandsToShow.map((cmd) => {
                    const globalIndex = allCommandsForNavigation.indexOf(cmd)
                    const isSelected = globalIndex === selectedIndex
                    const Icon = cmd.icon || CommandLineIcon

                    return (
                      <motion.button
                        key={`recent-${cmd.id}`}
                        data-index={globalIndex}
                        type="button"
                        onClick={() => handleCommandExecute(cmd)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={clsx(
                          'w-full flex items-center gap-3 px-4 py-3 rounded-[var(--ak-radius-xl)] text-left transition-all duration-200',
                          isSelected
                            ? 'bg-[var(--ak-color-accent)] ak-shadow-card scale-[1.01] z-10'
                            : 'text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)]'
                        )}
                        style={isSelected ? { color: 'var(--ak-text-primary-dark)' } : undefined}
                      >
                        <div className={clsx(
                          "flex h-9 w-9 items-center justify-center rounded-[var(--ak-radius-lg)] transition-colors",
                          isSelected ? "bg-[var(--ak-surface-1)]/20" : "bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)]"
                        )}
                        style={isSelected ? { color: 'var(--ak-text-primary-dark)' } : undefined}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={clsx(
                            "text-sm truncate",
                            isSelected ? "font-bold" : "font-medium"
                          )}>{cmd.label}</div>
                          {cmd.description && (
                            <div className={clsx(
                              "text-[11px] truncate mt-0.5",
                              isSelected ? "" : "text-[var(--ak-color-text-muted)]"
                            )}
                            style={isSelected ? { color: 'var(--ak-text-primary-dark)', opacity: 0.8 } : undefined}
                            >
                              {cmd.description}
                            </div>
                          )}
                        </div>
                        {cmd.shortcut && (
                          <div className="flex items-center gap-1.5">
                            {cmd.shortcut.split(' ').map((key, i) => (
                              <kbd key={i} className={clsx(
                                "inline-flex items-center justify-center min-w-[20px] h-5 rounded-[var(--ak-radius-sm)] border px-1.5 text-[10px] font-bold font-mono transition-colors shadow-sm",
                                isSelected 
                                  ? "bg-[var(--ak-surface-1)]/20 border-[var(--ak-surface-1)]/20" 
                                  : "bg-[var(--ak-color-bg-surface)] border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-muted)]"
                              )}
                              style={isSelected ? { color: 'var(--ak-text-primary-dark)' } : undefined}
                              >
                                {key.replace('cmd', '⌘').replace('shift', '⇧').replace('alt', '⌥').replace('ctrl', '⌃').toUpperCase()}
                              </kbd>
                            ))}
                          </div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              )}

              {/* Pinned Commands Section (Schnellzugriff) */}
              {pinnedCommands.length > 0 && (
                <div className="mb-3">
                  <div className="px-4 py-2 text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-widest flex items-center gap-2 opacity-60">
                    <PaperClipIcon className="h-3 w-3" />
                    Schnellzugriff
                  </div>
                  {pinnedCommands.map((cmd) => {
                    const globalIndex = allCommandsForNavigation.indexOf(cmd)
                    const isSelected = globalIndex === selectedIndex
                    const Icon = cmd.icon || CommandLineIcon

                    return (
                      <motion.button
                        key={`pinned-${cmd.id}`}
                        data-index={globalIndex}
                        type="button"
                        onClick={() => handleCommandExecute(cmd)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={clsx(
                          'w-full flex items-center gap-3 px-4 py-2.5 rounded-[var(--ak-radius-xl)] text-left transition-all duration-200',
                          isSelected
                            ? 'bg-[var(--ak-color-accent)] ak-shadow-card scale-[1.01] z-10'
                            : 'text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)]'
                        )}
                        style={isSelected ? { color: 'var(--ak-text-primary-dark)' } : undefined}
                      >
                        <div className={clsx(
                          "flex h-9 w-9 items-center justify-center rounded-[var(--ak-radius-lg)] transition-colors",
                          isSelected ? "bg-[var(--ak-surface-1)]/20" : "bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)]"
                        )}
                        style={isSelected ? { color: 'var(--ak-text-primary-dark)' } : undefined}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={clsx(
                            "text-sm truncate",
                            isSelected ? "font-bold" : "font-medium"
                          )}>{cmd.label}</div>
                          {cmd.description && (
                            <div className={clsx(
                              "text-[11px] truncate mt-0.5",
                              isSelected ? "" : "text-[var(--ak-color-text-muted)]"
                            )}
                            style={isSelected ? { color: 'var(--ak-text-primary-dark)', opacity: 0.8 } : undefined}
                            >
                              {cmd.description}
                            </div>
                          )}
                        </div>
                        {cmd.shortcut && (
                          <div className="flex items-center gap-1.5">
                            {cmd.shortcut.split(' ').map((key, i) => (
                              <kbd key={i} className={clsx(
                                "inline-flex items-center justify-center min-w-[20px] h-5 rounded-[var(--ak-radius-sm)] border px-1.5 text-[10px] font-bold font-mono transition-colors shadow-sm",
                                isSelected 
                                  ? "bg-[var(--ak-surface-1)]/20 border-[var(--ak-surface-1)]/20" 
                                  : "bg-[var(--ak-color-bg-surface)] border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-muted)]"
                              )}
                              style={isSelected ? { color: 'var(--ak-text-primary-dark)' } : undefined}
                              >
                                {key.replace('cmd', '⌘').replace('shift', '⇧').replace('alt', '⌥').replace('ctrl', '⌃').toUpperCase()}
                              </kbd>
                            ))}
                          </div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              )}

              {/* Regular Commands by Category (dynamically ordered) */}
              {categoryOrder.map((category) => {
                const categoryCommands = groupedCommands[category]
                if (!categoryCommands || categoryCommands.length === 0) return null

                return (
                  <div key={category} className="mb-3 last:mb-0">
                    <div className="px-4 py-2 text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-widest opacity-60">
                      {CATEGORY_LABELS[category] || category}
                    </div>
                    {categoryCommands.map((cmd) => {
                      const globalIndex = allCommandsForNavigation.indexOf(cmd)
                      const isSelected = globalIndex === selectedIndex
                      const Icon = cmd.icon || CommandLineIcon

                      return (
                        <motion.button
                          key={cmd.id}
                          data-index={globalIndex}
                          type="button"
                          onClick={() => handleCommandExecute(cmd)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={clsx(
                            'w-full flex items-center gap-3 px-4 py-2.5 rounded-[var(--ak-radius-xl)] text-left transition-all duration-200',
                            isSelected
                              ? 'bg-[var(--ak-color-accent)] ak-shadow-card scale-[1.01] z-10'
                              : 'text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)]'
                          )}
                          style={isSelected ? { color: 'var(--ak-text-primary-dark)' } : undefined}
                        >
                          <div className={clsx(
                            "flex h-9 w-9 items-center justify-center rounded-[var(--ak-radius-lg)] transition-colors",
                            isSelected ? "bg-[var(--ak-surface-1)]/20" : "bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)]"
                          )}
                          style={isSelected ? { color: 'var(--ak-text-primary-dark)' } : undefined}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={clsx(
                              "text-sm truncate",
                              isSelected ? "font-bold" : "font-medium"
                            )}>{cmd.label}</div>
                            {cmd.description && (
                              <div className={clsx(
                                "text-[11px] truncate mt-0.5",
                                isSelected ? "" : "text-[var(--ak-color-text-muted)]"
                              )}
                              style={isSelected ? { color: 'var(--ak-text-primary-dark)', opacity: 0.8 } : undefined}
                              >
                                {cmd.description}
                              </div>
                            )}
                          </div>
                          {cmd.shortcut && (
                            <div className="flex items-center gap-1.5">
                              {cmd.shortcut.split(' ').map((key, i) => (
                                <kbd key={i} className={clsx(
                                  "inline-flex items-center justify-center min-w-[20px] h-5 rounded-[var(--ak-radius-sm)] border px-1.5 text-[10px] font-bold font-mono transition-colors shadow-sm",
                                  isSelected 
                                    ? "bg-[var(--ak-surface-1)]/20 border-[var(--ak-surface-1)]/20" 
                                    : "bg-[var(--ak-color-bg-surface)] border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-muted)]"
                                )}
                                style={isSelected ? { color: 'var(--ak-text-primary-dark)' } : undefined}
                                >
                                  {key.replace('cmd', '⌘').replace('shift', '⇧').replace('alt', '⌥').replace('ctrl', '⌃').toUpperCase()}
                                </kbd>
                              ))}
                            </div>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--ak-color-border-hairline)] bg-[var(--ak-color-bg-surface-muted)]/50 px-6 py-4 flex items-center justify-between text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider">
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2.5">
              <kbd className="rounded-[var(--ak-radius-sm)] border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-1.5 py-0.5 font-mono text-[9px] shadow-sm">↑↓</kbd>
              <span>Navigieren</span>
            </span>
            <span className="flex items-center gap-2.5">
              <kbd className="rounded-[var(--ak-radius-sm)] border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-1.5 py-0.5 font-mono text-[9px] shadow-sm">ENTER</kbd>
              <span>Ausführen</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CommandLineIcon className="h-3.5 w-3.5 opacity-40" />
            <span className="opacity-60">{allCommandsForNavigation.length} Befehle</span>
          </div>
        </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

