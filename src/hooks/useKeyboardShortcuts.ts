'use client'

import { useEffect, useCallback, useRef } from 'react'

export type KeyboardShortcut = {
  key: string
  ctrlOrCmd?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  description?: string
  action: () => void
  preventDefault?: boolean
  stopPropagation?: boolean
  enabled?: boolean
}

type UseKeyboardShortcutsOptions = {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
  target?: HTMLElement | null
}

/**
 * Hook für Keyboard Shortcuts
 * 
 * @example
 * useKeyboardShortcuts({
 *   shortcuts: [
 *     {
 *       key: 'k',
 *       ctrlOrCmd: true,
 *       description: 'Command Palette öffnen',
 *       action: () => openCommandPalette(),
 *     },
 *   ],
 * })
 */
export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
  target,
}: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef(shortcuts)

  // Update shortcuts ref when they change
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  const handleKeyDown = useCallback(
    (event: Event) => {
      if (!enabled) return
      
      const keyboardEvent = event as KeyboardEvent

      const key = keyboardEvent.key.toLowerCase()
      const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)
      const ctrlOrCmd = isMac ? keyboardEvent.metaKey : keyboardEvent.ctrlKey

      for (const shortcut of shortcutsRef.current) {
        // Skip disabled shortcuts
        if (shortcut.enabled === false) continue

        // Check if key matches
        const keyMatches = shortcut.key.toLowerCase() === key

        // Check modifiers
        const ctrlOrCmdMatches = shortcut.ctrlOrCmd ? ctrlOrCmd : !ctrlOrCmd && !keyboardEvent.metaKey && !keyboardEvent.ctrlKey
        const shiftMatches = shortcut.shift ? keyboardEvent.shiftKey : !keyboardEvent.shiftKey
        const altMatches = shortcut.alt ? keyboardEvent.altKey : !keyboardEvent.altKey
        const metaMatches = shortcut.meta !== undefined ? (shortcut.meta === keyboardEvent.metaKey) : true

        if (
          keyMatches &&
          ctrlOrCmdMatches &&
          shiftMatches &&
          altMatches &&
          metaMatches
        ) {
          if (shortcut.preventDefault !== false) {
            keyboardEvent.preventDefault()
          }
          if (shortcut.stopPropagation) {
            keyboardEvent.stopPropagation()
          }
          shortcut.action()
          break
        }
      }
    },
    [enabled]
  )

  useEffect(() => {
    const element = target || (typeof window !== 'undefined' ? window : null)
    if (!element) return

    element.addEventListener('keydown', handleKeyDown)

    return () => {
      element.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, target])
}

/**
 * Helper function to check if user is on Mac
 */
export function isMac(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform)
}

/**
 * Format shortcut for display (e.g., "⌘K" or "Ctrl+K")
 */
export function formatShortcut(shortcut: Omit<KeyboardShortcut, 'action' | 'enabled'>): string {
  const isMacPlatform = isMac()
  const parts: string[] = []

  if (shortcut.ctrlOrCmd) {
    parts.push(isMacPlatform ? '⌘' : 'Ctrl')
  }
  if (shortcut.shift) {
    parts.push('⇧')
  }
  if (shortcut.alt) {
    parts.push(isMacPlatform ? '⌥' : 'Alt')
  }
  if (shortcut.meta) {
    parts.push('⌘')
  }

  // Format key
  let key = shortcut.key
  if (key.length === 1) {
    key = key.toUpperCase()
  } else {
    // Special keys
    const keyMap: Record<string, string> = {
      ' ': 'Space',
      'arrowup': '↑',
      'arrowdown': '↓',
      'arrowleft': '←',
      'arrowright': '→',
      'enter': 'Enter',
      'escape': 'Esc',
      'backspace': 'Backspace',
      'delete': 'Delete',
      'tab': 'Tab',
    }
    key = keyMap[key.toLowerCase()] || key
  }
  parts.push(key)

  return parts.join(isMacPlatform ? '' : '+')
}

