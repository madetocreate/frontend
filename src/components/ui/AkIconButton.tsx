'use client'

import { forwardRef, type ReactNode, type ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

export type AkIconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  size?: 'sm' | 'md'
  variant?: 'surface' | 'glass' | 'ghost' | 'graphite'
  selected?: boolean
}

export const AkIconButton = forwardRef<HTMLButtonElement, AkIconButtonProps>(function AkIconButton({
  children,
  size = 'sm',
  variant = 'surface',
  selected = false,
  className,
  type = 'button',
  ...props
}, ref) {
  const sizeClass = size === 'md' ? 'h-8 w-8 rounded-xl' : 'h-7 w-7 rounded-lg'

  const base =
    'inline-flex items-center justify-center border transition-[background-color,border-color,box-shadow,transform,opacity] duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)] ak-button-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'

  const palette =
    variant === 'ghost'
      ? 'bg-transparent border-transparent'
      : variant === 'glass'
        ? 'bg-[var(--ak-color-bg-surface)]/60 border-[var(--ak-color-border-fine)]'
        : variant === 'graphite'
          ? 'bg-[var(--ak-color-graphite-base)] border-[var(--ak-color-graphite-border)] text-[var(--ak-color-graphite-text)] hover:bg-[var(--ak-color-graphite-hover)]'
          : 'bg-[var(--ak-color-bg-surface)] border-[var(--ak-color-border-subtle)]'

  const state = selected
    ? variant === 'graphite'
      ? 'bg-[var(--ak-color-graphite-hover)] border-[var(--ak-color-graphite-border)] text-[var(--ak-color-graphite-text)] ring-1 ring-[var(--ak-color-graphite-border)]'
      : 'bg-[var(--ak-color-bg-selected)] border-[var(--ak-color-border-strong)] text-[var(--ak-color-text-primary)]'
    : variant === 'graphite'
      ? ''
      : 'text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]'

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      aria-pressed={selected}
      className={clsx(base, sizeClass, palette, state, className)}
    >
      {children}
    </button>
  )
})
