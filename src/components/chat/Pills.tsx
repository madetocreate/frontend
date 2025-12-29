'use client'

/**
 * Pills Komponente - Zeigt max. 3 Pills + "Mehr" Button
 * 
 * Wird verwendet für Guided Runs, um dem User die wichtigsten nächsten Schritte
 * als klickbare Pills anzubieten.
 * 
 * @see docs/ACTIONS_INTEGRATION.md für Details zur Integration
 */

import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

export interface Pill {
  id: string
  label: string
  value: string
  kind?: string
  step_key?: string
  input_key?: string
  ui_only?: boolean
}

interface PillsProps {
  pills: Pill[]
  onPillClick: (pill: Pill) => void
  maxVisible?: number
  className?: string
}

export function Pills({ pills, maxVisible = 3, onPillClick, className }: PillsProps) {
  const [showMore, setShowMore] = useState(false)
  
  if (pills.length === 0) return null

  const actionablePills = pills.filter(pill => !pill.ui_only && pill.value !== '__more__' && pill.id !== 'pill-more')
  const hasServerMore = pills.some(pill => pill.value === '__more__' || pill.ui_only)

  if (actionablePills.length === 0) return null

  const visiblePills = showMore ? actionablePills : actionablePills.slice(0, maxVisible)
  const hasMore = actionablePills.length > maxVisible || hasServerMore
  
  return (
    <div className={clsx('flex flex-wrap gap-2 items-start', className)}>
      {visiblePills.map((pill, index) => (
        <motion.button
          key={pill.id}
          initial={{ opacity: 0, scale: 0.95, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            delay: index * 0.05,
            duration: 0.2,
            ease: "easeOut"
          }}
          onClick={() => onPillClick(pill)}
          className={clsx(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
            'ak-bg-surface-1 border ak-border-default',
            'hover:border-[var(--ak-color-accent)] hover:bg-[var(--ak-color-bg-hover)]',
            'transition-all duration-200 text-sm font-medium',
            'text-[var(--ak-color-text-primary)]',
            'hover:shadow-sm active:scale-[0.98]',
            'group shadow-sm'
          )}
        >
          <span className="truncate max-w-[200px]">{pill.label}</span>
        </motion.button>
      ))}
      
      {hasMore && !showMore && (
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={() => setShowMore(true)}
          className={clsx(
            'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg',
            'ak-bg-surface-1 border ak-border-default',
            'hover:bg-[var(--ak-color-bg-hover)] transition-colors',
            'text-sm font-medium text-[var(--ak-color-text-secondary)]',
            'hover:text-[var(--ak-color-text-primary)] shadow-sm'
          )}
        >
          Mehr
          <ChevronDownIcon className="h-3.5 w-3.5" />
        </motion.button>
      )}
      
      {hasMore && showMore && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setShowMore(false)}
          className={clsx(
            'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg',
            'bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-subtle)]',
            'hover:bg-[var(--ak-color-bg-hover)] transition-colors',
            'text-sm font-medium text-[var(--ak-color-text-secondary)]',
            'hover:text-[var(--ak-color-text-primary)]'
          )}
        >
          Weniger
          <ChevronUpIcon className="h-3.5 w-3.5" />
        </motion.button>
      )}
    </div>
  )
}

