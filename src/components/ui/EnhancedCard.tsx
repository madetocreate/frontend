'use client'

import { ReactNode } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'

type EnhancedCardProps = {
  children: ReactNode
  title?: string
  subtitle?: string
  gradient?: 'blue' | 'purple' | 'green' | 'none'
  elevation?: 1 | 2 | 3
  glass?: boolean
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
}

export function EnhancedCard({
  children,
  title,
  subtitle,
  gradient = 'none',
  elevation = 2,
  glass = false,
  className,
  padding = 'md',
  hover = true,
}: EnhancedCardProps) {
  const paddingClass =
    padding === 'sm' ? 'p-4' : padding === 'lg' ? 'p-6' : 'p-5'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'apple-card rounded-xl border border-[var(--ak-color-border-subtle)]',
        glass && 'apple-glass-enhanced',
        gradient !== 'none' && `gradient-overlay-${gradient}`,
        `card-elevation-${elevation}`,
        hover && 'hover:shadow-[var(--apple-shadow-lg)]',
        className
      )}
    >
      {(title || subtitle) && (
        <div className="mb-4 pb-4 border-b border-[var(--ak-color-border-subtle)]">
          {title && (
            <h3 className="ak-heading text-lg font-semibold text-[var(--ak-color-text-primary)] mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="ak-caption text-sm text-[var(--ak-color-text-secondary)]">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className={clsx('relative z-10', paddingClass)}>{children}</div>
    </motion.div>
  )
}

