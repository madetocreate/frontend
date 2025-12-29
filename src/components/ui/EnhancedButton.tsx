'use client'

import type { ReactNode } from 'react'
import clsx from 'clsx'
import { motion, type HTMLMotionProps } from 'framer-motion'

type EnhancedButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  gradient?: boolean
}

export function EnhancedButton({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  gradient = false,
  className,
  ...props
}: EnhancedButtonProps) {
  const sizeClass =
    size === 'sm' ? 'px-3 py-1.5 text-sm' :
    size === 'lg' ? 'px-6 py-3 text-lg' :
    'px-4 py-2 text-base'

  const variantClass =
    variant === 'primary' ? gradient
      ? 'bg-gradient-to-r from-[var(--ak-accent-inbox)] to-[var(--ak-accent-documents)] text-[var(--ak-color-text-inverted)] shadow-lg hover:shadow-xl'
      : 'bg-[var(--ak-accent-inbox)] text-[var(--ak-color-text-inverted)] shadow-md hover:shadow-lg'
    : variant === 'secondary'
    ? 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] border border-[var(--ak-color-border-default)] hover:bg-[var(--ak-color-bg-surface)]'
    : 'bg-transparent text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)]'

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        'btn-interactive rounded-lg font-medium transition-all duration-200 flex items-center gap-2',
        sizeClass,
        variantClass,
        className
      )}
      {...props}
    >
      {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </motion.button>
  )
}

