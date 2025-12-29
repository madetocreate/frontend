'use client'

import { ReactNode } from 'react'
import clsx from 'clsx'

type GradientTextProps = {
  children: ReactNode
  variant?: 'blue' | 'purple' | 'green'
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

export function GradientText({
  children,
  variant = 'blue',
  className,
  as: Component = 'span',
}: GradientTextProps) {
  return (
    <Component
      className={clsx(
        `gradient-text-${variant}`,
        className
      )}
    >
      {children}
    </Component>
  )
}

