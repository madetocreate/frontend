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
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <FolderIcon className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-sm font-bold text-slate-900 leading-tight">{title}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <XMarkIcon className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50/30">
          {items.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -2 }}
              onClick={() => onItemClick?.(item)}
              className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className={clsx(
                "w-10 h-10 rounded-lg mb-3 flex items-center justify-center",
                item.color || "bg-blue-50 text-blue-500"
              )}>
                {item.icon || <DocumentIcon className="w-6 h-6" />}
              </div>
              <p className="text-xs font-bold text-slate-900 truncate mb-0.5">{item.name}</p>
              <p className="text-[10px] text-slate-400 font-medium">{item.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

