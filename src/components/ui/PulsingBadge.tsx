'use client'

import { ReactNode } from 'react'
import clsx from 'clsx'

type PulsingBadgeProps = {
  children: ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info'
  pulse?: boolean
  className?: string
}

export function PulsingBadge({
  children,
  variant = 'success',
  pulse = true,
  className,
}: PulsingBadgeProps) {
  return (
    <span
      className={clsx(
        'badge-enhanced',
        pulse && 'badge-pulse',
        variant === 'success' && 'badge-success-enhanced',
        variant === 'warning' && 'badge-warning-enhanced',
        variant === 'error' && 'badge-error-enhanced',
        variant === 'info' && 'badge-enhanced',
        className
      )}
    >
      {children}
    </span>
  )
}

