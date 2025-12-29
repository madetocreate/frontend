'use client'

import { motion } from 'framer-motion'
import { 
  DocumentIcon,
  XMarkIcon,
  FolderIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import type { ReactNode } from 'react'

interface GridItem {
  id: string
  name: string
  sub?: string
  icon?: ReactNode
  color?: string
}

interface VisualGridCardProps {
  id: string
  title: string
  items: GridItem[]
  onClose?: () => void
  onItemClick?: (item: GridItem) => void
}

export function VisualGridCard({
  id: _id, // eslint-disable-line @typescript-eslint/no-unused-vars
  title,
  items,
  onClose,
  onItemClick,
}: VisualGridCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="w-full"
    >
      <div className="ak-bg-surface-1 rounded-2xl border ak-border-default shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 ak-bg-surface-1 border-b ak-border-default">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center">
              <FolderIcon className="w-4 h-4 ak-text-secondary" />
            </div>
            <p className="text-sm font-bold ak-text-primary leading-tight">{title}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)] transition-colors"
            >
              <XMarkIcon className="w-4 h-4 ak-text-muted" />
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[var(--ak-color-bg-surface-muted)]/30">
          {items.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -2 }}
              onClick={() => onItemClick?.(item)}
              className="p-3 ak-bg-surface-1 rounded-xl border ak-border-default shadow-sm hover:border-[var(--ak-accent-inbox)]/25 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className={clsx(
                "w-10 h-10 rounded-lg mb-3 flex items-center justify-center",
                item.color || "bg-[var(--ak-accent-inbox-soft)] text-[var(--ak-accent-inbox)]"
              )}>
                {item.icon || <DocumentIcon className="w-6 h-6" />}
              </div>
              <p className="text-xs font-bold ak-text-primary truncate mb-0.5">{item.name}</p>
              <p className="text-[10px] ak-text-muted font-medium">{item.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

