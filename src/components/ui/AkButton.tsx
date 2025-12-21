'use client'

import clsx from 'clsx'
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

export type AkAccent =
  | 'default'
  | 'inbox'
  | 'customers'
  | 'documents'
  | 'growth'
  | 'settings'
  | 'marketing'
  | 'news'
  | 'telephony'
  | 'automation'
  | 'graphite'

export type AkButtonVariant = 'primary' | 'secondary' | 'ghost'
export type AkButtonSize = 'sm' | 'md'

export type AkButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  accent?: AkAccent
  variant?: AkButtonVariant
  size?: AkButtonSize
  pressed?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  className?: string
}

type CSSVarKey = `--${string}`
type CSSVars = Partial<Record<CSSVarKey, string>>

const ACCENT_VAR: Record<AkAccent, string> = {
  default: 'var(--ak-color-accent)',
  inbox: 'var(--ak-accent-inbox, var(--ak-color-accent))',
  customers: 'var(--ak-accent-customers, var(--ak-color-accent))',
  documents: 'var(--ak-accent-documents, var(--ak-color-accent))',
  growth: 'var(--ak-accent-growth, var(--ak-color-accent))',
  settings: 'var(--ak-accent-settings, var(--ak-color-accent))',
  marketing: 'var(--ak-accent-marketing, var(--ak-color-accent))',
  news: 'var(--ak-accent-news, var(--ak-color-accent))',
  telephony: 'var(--ak-accent-telephony, var(--ak-color-accent))',
  automation: 'var(--ak-accent-automation, var(--ak-color-accent))',
  graphite: 'var(--ak-color-graphite-base)',
}

export function AkButton({
  accent = 'default',
  variant = 'secondary',
  size = 'md',
  pressed = false,
  leftIcon,
  rightIcon,
  className,
  type = 'button',
  ...props
}: AkButtonProps) {
  const accentVar = ACCENT_VAR[accent] ?? ACCENT_VAR.default

  const style: CSSProperties & CSSVars = {
    ...(props.style ?? {}),
    '--ak-control-accent': accentVar,
    '--ak-control-accent-soft': `color-mix(in oklab, ${accentVar} 28%, transparent)`,
    '--ak-control-accent-subtle': `color-mix(in oklab, ${accentVar} 10%, transparent)`,
  }

  const sizeCls = size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3 text-xs'

  const base =
    'inline-flex items-center justify-center gap-2 select-none whitespace-nowrap font-medium ' +
    'rounded-[4px] border transition-colors duration-150 ease-out ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-control-accent-soft)] ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ak-color-bg-sidebar)] ' +
    'disabled:pointer-events-none disabled:opacity-50'

  const variants: Record<AkButtonVariant, string> = {
    primary:
      accent === 'graphite'
        ? 'bg-[var(--ak-color-graphite-base)] text-[var(--ak-color-graphite-text)] border-[var(--ak-color-graphite-border)] shadow-sm hover:bg-[var(--ak-color-graphite-hover)]'
        : 'bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] border-[var(--ak-color-border-subtle)] shadow-sm hover:bg-[var(--ak-color-bg-hover)] active:bg-[var(--ak-color-bg-active)]',
    secondary:
      accent === 'graphite'
        ? 'bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] border-[var(--ak-color-graphite-border)] hover:bg-[var(--ak-color-graphite-soft)]'
        : 'bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] border-[var(--ak-color-border-subtle)] hover:bg-[var(--ak-color-bg-hover)]',
    ghost:
      accent === 'graphite'
        ? 'bg-transparent text-[var(--ak-color-text-secondary)] border-transparent hover:bg-[var(--ak-color-graphite-soft)] hover:text-[var(--ak-color-graphite-base)]'
        : 'bg-transparent text-[var(--ak-color-text-secondary)] border-transparent hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]',
  }

  const pressedCls =
    pressed && variant !== 'primary'
      ? 'bg-[var(--ak-color-bg-selected)] text-[var(--ak-color-text-primary)] border-[var(--ak-color-border-strong)] shadow-[inset_0_0_0_1px_var(--ak-control-accent-soft)]'
      : ''

  return (
    <button
      {...props}
      type={type}
      style={style}
      data-pressed={pressed ? 'true' : 'false'}
      className={clsx(base, sizeCls, variants[variant], pressedCls, className)}
    >
      {leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
      <span className="min-w-0 truncate">{props.children}</span>
      {rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
    </button>
  )
}
