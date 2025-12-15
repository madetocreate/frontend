'use client'

import { ReactNode } from 'react'
import clsx from 'clsx'

interface AppleSectionProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  headerClassName?: string
  glass?: boolean
}

export function AppleSection({
  title,
  subtitle,
  children,
  className,
  headerClassName,
  glass = false
}: AppleSectionProps) {
  return (
    <section className={clsx('space-y-4', className)}>
      {(title || subtitle) && (
        <div className={clsx('space-y-1', headerClassName)}>
          {title && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className={clsx(
        glass && 'apple-glass rounded-2xl p-6'
      )}>
        {children}
      </div>
    </section>
  )
}
