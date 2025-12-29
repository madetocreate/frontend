'use client'

import React, { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

export type AkTooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface AkTooltipProps {
  content: ReactNode
  children: React.ReactElement
  placement?: AkTooltipPlacement
  delay?: number
  disabled?: boolean
  className?: string
}

const PLACEMENT_STYLES: Record<AkTooltipPlacement, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

export function AkTooltip({
  content,
  children,
  placement = 'top',
  delay = 300,
  disabled = false,
  className,
}: AkTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (disabled) return
    const id = setTimeout(() => setIsVisible(true), delay)
    setTimeoutId(id)
  }

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsVisible(false)
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && !disabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.15,
              ease: [0.28, 0.11, 0.32, 1], // --ak-motion-ease
            }}
            className={clsx(
              'absolute z-[200] pointer-events-none',
              PLACEMENT_STYLES[placement],
              className
            )}
          >
            <div
              className={clsx(
                'px-2 py-1.5 rounded-[var(--ak-radius-md)]',
                'bg-[var(--ak-color-tooltip-bg)]',
                'text-[var(--ak-color-tooltip-text)]',
                'text-xs font-medium',
                'shadow-sm',
                'whitespace-nowrap',
                'border border-[var(--ak-color-border-subtle)]/20'
              )}
            >
              {content}
            </div>
            {/* Arrow */}
            <div
              className={clsx(
                'absolute w-2 h-2 rotate-45',
                'bg-[var(--ak-color-tooltip-bg)]',
                'border border-[var(--ak-color-border-subtle)]/20',
                placement === 'top' && 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2 border-t-0 border-l-0',
                placement === 'bottom' && 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 border-b-0 border-r-0',
                placement === 'left' && 'left-full top-1/2 -translate-y-1/2 -translate-x-1/2 border-l-0 border-b-0',
                placement === 'right' && 'right-full top-1/2 -translate-y-1/2 translate-x-1/2 border-r-0 border-t-0'
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

