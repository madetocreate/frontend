'use client'

import { useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface Shortcut {
  key: string
  description: string
  category: string
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { key: '⌘1', description: 'Dashboard', category: 'Navigation' },
  { key: '⌘2', description: 'Reservierungen', category: 'Navigation' },
  { key: '⌘3', description: 'Zimmer', category: 'Navigation' },
  { key: '⌘4', description: 'Restaurant', category: 'Navigation' },
  { key: '⌘5', description: 'Events', category: 'Navigation' },
  { key: '⌘6', description: 'Gäste', category: 'Navigation' },
  { key: '⌘7', description: 'Revenue', category: 'Navigation' },
  { key: '⌘8', description: 'Marketing', category: 'Navigation' },
  { key: '⌘9', description: 'Berichte', category: 'Navigation' },
  
  // Global
  { key: '⌘K', description: 'Command Palette', category: 'Global' },
  { key: '⌘/', description: 'Shortcuts anzeigen', category: 'Global' },
  { key: '⌘,', description: 'Einstellungen', category: 'Global' },
  { key: 'Esc', description: 'Schließen', category: 'Global' },
  
  // Reservierungen
  { key: 'N', description: 'Neue Reservierung', category: 'Reservierungen' },
  { key: 'S', description: 'Suche', category: 'Reservierungen' },
  { key: 'F', description: 'Filter', category: 'Reservierungen' },
  { key: 'C', description: 'Check-in', category: 'Reservierungen' },
  { key: 'O', description: 'Check-out', category: 'Reservierungen' },
  { key: 'U', description: 'Upgrade anbieten', category: 'Reservierungen' },
  
  // Zimmer
  { key: 'R', description: 'Zimmer-Status ändern', category: 'Zimmer' },
  { key: 'H', description: 'Housekeeping', category: 'Zimmer' },
  { key: 'M', description: 'Wartung', category: 'Zimmer' },
  
  // Restaurant
  { key: 'T', description: 'Neuer Tisch', category: 'Restaurant' },
  { key: 'B', description: 'Bestellung', category: 'Restaurant' },
  { key: 'K', description: 'Küche-Ansicht', category: 'Restaurant' },
  
  // Gäste
  { key: 'G', description: 'Neuer Gast', category: 'Gäste' },
  { key: 'P', description: 'Gast-Profil', category: 'Gäste' },
  { key: 'E', description: 'E-Mail senden', category: 'Gäste' },
  { key: 'W', description: 'WhatsApp', category: 'Gäste' },
]

type HotelKeyboardShortcutsProps = {
  isOpen: boolean
  onClose: () => void
}

export function HotelKeyboardShortcuts({ isOpen, onClose }: HotelKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        // Toggle handled by parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const grouped = SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) acc[shortcut.category] = []
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, Shortcut[]>)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6">
          {Object.entries(grouped).map(([category, shortcuts]) => (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono text-gray-900 shadow-sm">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Drücken Sie <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">Esc</kbd> zum Schließen
          </p>
        </div>
      </div>
    </div>
  )
}

