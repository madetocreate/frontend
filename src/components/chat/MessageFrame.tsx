'use client'

import React, { ReactNode } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'

export type MessageAlignment = 'left' | 'right'

export interface MessageFrameProps {
  alignment: MessageAlignment
  children: ReactNode
  className?: string
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  showHoverActions?: boolean
  hoverActions?: ReactNode
}

/**
 * MessageFrame: Kanonische Hülle für Chat-Messages
 * 
 * Verantwortlich für:
 * - Max Width (80% für Assistant, 70% für User)
 * - Alignment (left/right)
 * - Vertical Rhythm (Spacing zwischen Messages)
 * - Hover Action Region
 * - Bubble Shell (optional)
 */
export function MessageFrame({
  alignment,
  children,
  className,
  onMouseEnter,
  onMouseLeave,
  showHoverActions = false,
  hoverActions,
}: MessageFrameProps) {
  const isRight = alignment === 'right'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.2,
        ease: 'easeOut',
      }}
      className={clsx(
        'group flex',
        isRight ? 'justify-end' : 'justify-start',
        className
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        marginLeft: isRight ? 'auto' : '4%',
        marginRight: isRight ? '4%' : undefined,
        maxWidth: isRight ? '70%' : '80%',
        width: '100%',
        willChange: 'transform',
        contain: 'layout style paint',
      }}
    >
      <div className={clsx(
        'flex w-full flex-col gap-3',
        isRight ? 'items-end' : 'items-start'
      )}>
        {children}
      </div>
      
      {/* Hover Actions Region - Outside of content div for proper positioning */}
      {showHoverActions && hoverActions && (
        <div className={clsx(
          'flex items-center gap-0 mt-1.5 transition-opacity duration-200',
          isRight ? 'justify-end' : 'justify-start',
          showHoverActions ? 'opacity-100' : 'opacity-0'
        )}>
          {hoverActions}
        </div>
      )}
    </motion.div>
  )
}

