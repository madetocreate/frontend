'use client'

import { useState, useCallback } from 'react'
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import type { InboxItem } from '@/components/InboxDrawerWidget'

interface ChatFirstFABProps {
  context: {
    type: 'inbox' | 'customer' | 'document' | 'growth' | 'none'
    item: InboxItem | null
    id: string | null
  }
  onAction: (action: { id: string; label: string; prompt: string }) => void
}

// Context-specific actions
const CONTEXT_ACTIONS: Record<string, { id: string; label: string; prompt: string; icon?: string }[]> = {
  inbox: [
    { id: 'reply', label: 'Antwort schreiben', prompt: 'Schreibe eine professionelle Antwort auf diese Nachricht' },
    { id: 'summarize', label: 'Zusammenfassen', prompt: 'Fasse diese Nachricht kurz zusammen' },
    { id: 'translate', label: 'Übersetzen', prompt: 'Übersetze diese Nachricht ins Englische' },
    { id: 'extract', label: 'Tasks extrahieren', prompt: 'Extrahiere alle Aufgaben und To-Dos aus dieser Nachricht' },
  ],
  customer: [
    { id: 'profile', label: 'Profil anreichern', prompt: 'Reichere dieses Kundenprofil mit zusätzlichen Informationen an' },
    { id: 'history', label: 'Historie zeigen', prompt: 'Zeige mir die komplette Kommunikationshistorie mit diesem Kunden' },
    { id: 'suggest', label: 'Angebot vorschlagen', prompt: 'Schlage ein passendes Angebot für diesen Kunden vor' },
    { id: 'churn', label: 'Churn-Risiko', prompt: 'Analysiere das Churn-Risiko für diesen Kunden' },
  ],
  document: [
    { id: 'summarize', label: 'Zusammenfassen', prompt: 'Fasse dieses Dokument zusammen' },
    { id: 'keypoints', label: 'Kernpunkte', prompt: 'Extrahiere die wichtigsten Punkte aus diesem Dokument' },
    { id: 'questions', label: 'Fragen stellen', prompt: 'Was möchtest du über dieses Dokument wissen?' },
    { id: 'translate', label: 'Übersetzen', prompt: 'Übersetze dieses Dokument ins Englische' },
  ],
  growth: [
    { id: 'campaign', label: 'Kampagne starten', prompt: 'Erstelle eine neue Marketingkampagne' },
    { id: 'audience', label: 'Zielgruppe', prompt: 'Analysiere und segmentiere die Zielgruppe' },
    { id: 'content', label: 'Content generieren', prompt: 'Generiere Content für diese Kampagne' },
    { id: 'analyze', label: 'Performance', prompt: 'Analysiere die Performance der aktuellen Kampagnen' },
  ],
  none: [],
}

export function ChatFirstFAB({ context, onAction }: ChatFirstFABProps) {
  const [openInternal, setOpenInternal] = useState(false)

  const handleActionClick = useCallback((action: { id: string; label: string; prompt: string }) => {
    onAction(action)
    setOpenInternal(false)
  }, [onAction])

  const actions = CONTEXT_ACTIONS[context.type] || []
  const hasContext = context.type !== 'none'
  const isOpen = hasContext && openInternal
  const shouldRender = hasContext || isOpen

  if (!shouldRender) return null

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">
      {/* Action Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="flex flex-col gap-2 mb-2"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleActionClick(action)}
                className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition-all text-left min-w-[200px] group"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <SparklesIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {action.label}
                </span>
              </motion.button>
            ))}
            
            {/* Command Palette hint */}
            <div className="text-center text-xs text-gray-400 mt-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-mono">⌘K</kbd>
              <span className="ml-1">für mehr Aktionen</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: hasContext ? 1 : 0, 
          opacity: hasContext ? 1 : 0 
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        onClick={() => setOpenInternal(!isOpen)}
        className={clsx(
          "relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300",
          isOpen
            ? "bg-gray-900 dark:bg-white rotate-45"
            : "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
        )}
      >
        {/* Pulse animation when context is active */}
        {hasContext && !isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        
        {isOpen ? (
          <XMarkIcon className="w-6 h-6 text-white dark:text-gray-900" />
        ) : (
          <SparklesIcon className="w-6 h-6 text-white" />
        )}
        
        {/* Badge showing number of actions */}
        {hasContext && !isOpen && actions.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg"
          >
            {actions.length}
          </motion.div>
        )}
      </motion.button>
    </div>
  )
}

