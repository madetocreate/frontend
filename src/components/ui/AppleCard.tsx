'use client'

import { ReactNode } from 'react'
import clsx from 'clsx'

interface AppleCardProps {
  children: ReactNode
  className?: string
  glass?: boolean
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export function AppleCard({ 
  children, 
  className, 
  glass = false,
  hover = false,
  padding = 'md',
  onClick 
}: AppleCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }

  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-2xl transition-all duration-250',
        glass 
          ? 'apple-glass' 
          : 'bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50',
        hover && 'hover:shadow-lg hover:scale-[1.02] cursor-pointer',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  )
}
