'use client'

import React, { useEffect, useState } from 'react'
import { ArrowUturnLeftIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

export interface UndoToastProps {
  message: string
  onUndo: () => void
  onDismiss: () => void
  duration?: number
}

export function UndoToast({ message, onUndo, onDismiss, duration = 8000 }: UndoToastProps) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const startTime = Date.now()
    const endTime = startTime + duration
    
    const timer = setInterval(() => {
      const now = Date.now()
      const remaining = Math.max(0, endTime - now)
      const p = (remaining / duration) * 100
      setProgress(p)

      if (remaining <= 0) {
        clearInterval(timer)
        onDismiss()
      }
    }, 50)

    return () => clearInterval(timer)
  }, [duration, onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 bg-[var(--ak-color-tooltip-bg)] text-[var(--ak-color-tooltip-text)] px-4 py-3 rounded-xl shadow-lg border border-[var(--ak-color-graphite-border)] min-w-[320px] max-w-md backdrop-blur-md bg-opacity-95"
    >
      <div className="flex-1 text-sm font-medium truncate">
        {message}
      </div>
      <div className="flex items-center gap-3 border-l border-[var(--ak-color-graphite-border)] pl-3">
        <button
          onClick={onUndo}
          className="text-sm font-bold text-[var(--ak-accent-inbox)] hover:brightness-110 transition-colors flex items-center gap-1.5"
        >
          <ArrowUturnLeftIcon className="w-4 h-4" />
          Rückgängig
        </button>
        <button
          onClick={onDismiss}
          className="ak-text-muted hover:text-[var(--ak-color-tooltip-text)] transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-[var(--ak-accent-inbox)]/50 rounded-b-xl transition-all duration-75 ease-linear" style={{ width: `${progress}%` }} />
    </motion.div>
  )
}

