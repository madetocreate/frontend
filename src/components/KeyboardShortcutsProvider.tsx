'use client'

import { ReactNode, useCallback, useState, useEffect } from 'react'
import { useKeyboardShortcuts, KeyboardShortcut, formatShortcut } from '../hooks/useKeyboardShortcuts'
import {
  XMarkIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline'

type KeyboardShortcutsProviderProps = {
  children: ReactNode
}

// Globale Shortcuts Definition
const GLOBAL_SHORTCUTS: Omit<KeyboardShortcut, 'action'>[] = [
  {
    key: 'k',
    ctrlOrCmd: true,
    description: 'Command Palette öffnen',
  },
  {
    key: 'n',
    ctrlOrCmd: true,
    description: 'Neuer Chat',
  },
  {
    key: 'p',
    ctrlOrCmd: true,
    shift: true,
    description: 'Neues Projekt',
  },
  {
    key: 'b',
    ctrlOrCmd: true,
    description: 'Sidebar ein-/ausblenden',
  },
  {
    key: '/',
    description: 'Fokus auf Suche',
  },
  {
    key: 'j',
    description: 'Nächster Chat',
  },
  {
    key: 'k',
    description: 'Vorheriger Chat',
  },
  {
    key: 'Escape',
    description: 'Schließen / Abbrechen',
  },
  {
    key: '?',
    shift: true,
    description: 'Shortcuts anzeigen',
  },
]

export function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
  const [showShortcuts, setShowShortcuts] = useState(false)
  
  const handleCommandPalette = useCallback(() => {
    window.dispatchEvent(new CustomEvent('aklow-toggle-command-palette'))
  }, [])

  const handleNewChat = useCallback(() => {
    // Trigger neuen Chat über Custom Event
    window.dispatchEvent(new CustomEvent('aklow-keyboard-new-chat'))
  }, [])

  const handleNewProject = useCallback(() => {
    // Trigger neues Projekt über Custom Event
    window.dispatchEvent(new CustomEvent('aklow-keyboard-new-project'))
  }, [])

  const handleToggleSidebar = useCallback(() => {
    // Trigger Sidebar Toggle über Custom Event
    window.dispatchEvent(new CustomEvent('aklow-toggle-sidebar'))
  }, [])

  const handleFocusSearch = useCallback(() => {
    try {
      const searchInput = document.querySelector('input[placeholder*="Suchen"], input[placeholder*="suchen"]') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      }
    } catch {
      // Ignore
    }
  }, [])

  const handleNextChat = useCallback(() => {
    window.dispatchEvent(new CustomEvent('aklow-keyboard-next-chat'))
  }, [])

  const handlePrevChat = useCallback(() => {
    window.dispatchEvent(new CustomEvent('aklow-keyboard-prev-chat'))
  }, [])

  const handleEscape = useCallback(() => {
    // Schließe offene Modals/Menüs
    const event = new CustomEvent('ak-escape-pressed')
    window.dispatchEvent(event)
    // Schließe auch die Shortcuts-Modal, falls offen
    setShowShortcuts(false)
  }, [])

  const handleShowShortcuts = useCallback(() => {
    setShowShortcuts((prev) => !prev)
  }, [])

  useEffect(() => {
    const handleToggleShortcuts = () => setShowShortcuts(prev => !prev)
    window.addEventListener('aklow-toggle-shortcuts', handleToggleShortcuts)
    return () => window.removeEventListener('aklow-toggle-shortcuts', handleToggleShortcuts)
  }, [])

  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'k',
        ctrlOrCmd: true,
        description: 'Command Palette öffnen',
        action: handleCommandPalette,
        preventDefault: true,
        stopPropagation: true,
        allowInInput: true,
      },
      {
        key: 'n',
        ctrlOrCmd: true,
        description: 'Neuer Chat',
        action: handleNewChat,
        preventDefault: true,
      },
      {
        key: 'p',
        ctrlOrCmd: true,
        shift: true,
        description: 'Neues Projekt',
        action: handleNewProject,
        preventDefault: true,
      },
      {
        key: 'b',
        ctrlOrCmd: true,
        description: 'Sidebar ein-/ausblenden',
        action: handleToggleSidebar,
        preventDefault: true,
      },
      {
        key: '/',
        description: 'Fokus auf Suche',
        action: handleFocusSearch,
      },
      {
        key: 'j',
        description: 'Nächster Chat',
        action: handleNextChat,
      },
      {
        key: 'k',
        description: 'Vorheriger Chat',
        action: handlePrevChat,
      },
      {
        key: 'Escape',
        description: 'Schließen / Abbrechen',
        action: handleEscape,
        allowInInput: true,
      },
      {
        key: '?',
        shift: true,
        description: 'Shortcuts anzeigen',
        action: handleShowShortcuts,
      },
    ],
  })

  // Helper functions for commands

  return (
    <>
      {children}
      {showShortcuts && (
        <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}
    </>
  )
}

type KeyboardShortcutsModalProps = {
  onClose: () => void
}

function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
  const shortcuts = GLOBAL_SHORTCUTS

  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'Escape',
        action: onClose,
        allowInInput: true,
      },
      {
        key: '?',
        shift: true,
        action: onClose,
      },
    ],
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--ak-color-border-subtle)] px-6 py-4">
          <div className="flex items-center gap-3">
            <CommandLineIcon className="h-5 w-5 text-[var(--ak-color-text-primary)]" />
            <h2 className="ak-heading text-lg">Tastenkombinationen</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded text-[var(--ak-color-text-secondary)] transition-colors hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]"
            aria-label="Schließen"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-[var(--ak-color-border-subtle)] pb-3 last:border-0"
              >
                <span className="ak-body text-sm text-[var(--ak-color-text-primary)]">
                  {shortcut.description}
                </span>
                <kbd className="inline-flex items-center gap-1 rounded border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-2.5 py-1 text-xs font-mono text-[var(--ak-color-text-primary)]">
                  {formatShortcut(shortcut)}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--ak-color-border-subtle)] px-6 py-3">
          <p className="ak-caption text-center text-[var(--ak-color-text-secondary)]">
            Drücke <kbd className="rounded border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-1.5 py-0.5 text-[10px] font-mono">?</kbd> oder <kbd className="rounded border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-1.5 py-0.5 text-[10px] font-mono">Esc</kbd> zum Schließen
          </p>
        </div>
      </div>
    </div>
  )
}

