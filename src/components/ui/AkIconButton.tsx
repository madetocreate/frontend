'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'
import { MagneticButton } from '@/components/ui/MagneticButton'

export type AkIconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children: ReactNode
  size?: 'sm' | 'md'
  variant?: 'surface' | 'glass' | 'ghost'
  selected?: boolean
}

export function AkIconButton({
  children,
  size = 'sm',
  variant = 'surface',
  selected = false,
  className,
  type,
  ...props
}: AkIconButtonProps) {
  const sizeClass = size === 'md' ? 'h-8 w-8 rounded-xl' : 'h-7 w-7 rounded-lg'

  const base =
    'inline-flex items-center justify-center border transition-colors duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'

  const palette =
    variant === 'ghost'
      ? 'bg-transparent border-transparent'
      : variant === 'glass'
        ? 'bg-[var(--ak-color-bg-surface)]/60 border-[var(--ak-color-border-fine)]'
        : 'bg-[var(--ak-color-bg-surface)] border-[var(--ak-color-border-subtle)]'

  const state = selected
    ? 'bg-[var(--ak-color-bg-selected)] border-[var(--ak-color-border-strong)] text-[var(--ak-color-text-primary)]'
    : 'text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]'

  return (
    <MagneticButton
      type={type === 'submit' || type === 'reset' ? type : 'button'}
      className={clsx(base, sizeClass, palette, state, 'ak-button-interactive', className)}
      isActive={selected}
      {...props}
    >
      {children}
    </MagneticButton>
  )
}
