'use client'

import clsx from 'clsx'
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { useGlowEffect } from '@/hooks/useGlowEffect'

export type AkAccent =
  | 'default'
  | 'inbox'
  | 'customers'
  | 'documents'
  | 'growth'
  | 'settings'
  | 'marketing'
  | 'telephony'
  | 'automation'
  | 'graphite'

export type AkButtonVariant = 'primary' | 'secondary' | 'ghost'
export type AkButtonSize = 'sm' | 'md' | 'lg'

export type AkButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  accent?: AkAccent
  variant?: AkButtonVariant
  size?: AkButtonSize
  pressed?: boolean
  glow?: boolean
  isLoading?: boolean
  loading?: boolean // Alias for isLoading for backward compatibility
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
  telephony: 'var(--ak-accent-telephony, var(--ak-color-accent))',
  automation: 'var(--ak-accent-automation, var(--ak-color-accent))',
  graphite: 'var(--ak-color-graphite-base)',
}

export function AkButton({
  accent = 'default',
  variant = 'secondary',
  size = 'md',
  pressed = false,
  glow = false,
  isLoading: isLoadingProp,
  loading,
  leftIcon,
  rightIcon,
  className,
  type = 'button',
  ...props
}: AkButtonProps) {
  // Support both isLoading and loading props (loading is alias for backward compatibility)
  const isLoading = isLoadingProp ?? loading ?? false
  const accentVar = ACCENT_VAR[accent] ?? ACCENT_VAR.default
  const { onMouseMove } = useGlowEffect()

  const style: CSSProperties & CSSVars = {
    ...(props.style ?? {}),
    '--ak-control-accent': accentVar,
    '--ak-control-accent-soft': `color-mix(in oklab, ${accentVar} 28%, transparent)`,
    '--ak-control-accent-subtle': `color-mix(in oklab, ${accentVar} 10%, transparent)`,
  }

  const sizeCls = size === 'sm' ? 'h-7 px-2.5 text-xs' : size === 'lg' ? 'h-10 px-4 text-sm' : 'h-8 px-3 text-xs'

  const base =
    'inline-flex items-center justify-center gap-2 select-none whitespace-nowrap font-medium ' +
    'rounded-[var(--ak-radius-lg)] border transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] ak-button-interactive ' +
    'ak-focus-ring ' +
    'disabled:pointer-events-none disabled:opacity-50'

  const variants: Record<AkButtonVariant, string> = {
    primary:
      accent === 'graphite'
        ? 'bg-[var(--ak-color-graphite-base)] text-[var(--ak-color-graphite-text)] border-transparent shadow-sm hover:brightness-110 active:brightness-95'
        : 'bg-[var(--ak-control-accent)] text-[var(--ak-color-text-inverted)] border-transparent shadow-sm hover:bg-[color-mix(in oklab,var(--ak-control-accent) 92%,black)] active:bg-[color-mix(in oklab,var(--ak-control-accent) 86%,black)]',
    secondary:
      accent === 'graphite'
        ? 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] border-[var(--ak-color-border-fine)] hover:ak-item-hover active:ak-item-pressed'
        : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] border-[var(--ak-color-border-fine)] hover:ak-item-hover active:ak-item-pressed',
    ghost:
      'bg-transparent text-[var(--ak-color-text-secondary)] border-transparent hover:ak-item-hover active:ak-item-pressed hover:text-[var(--ak-color-text-primary)]',
  }

  const pressedCls =
    pressed && variant !== 'primary'
      ? 'bg-[var(--ak-control-accent-subtle)] text-[var(--ak-color-text-primary)] border-[var(--ak-control-accent-soft)] ak-shadow-inset-1'
      : ''
  
  const glowCls = glow ? 'ak-sidebar-button' : ''

  return (
    <button
      {...props}
      type={type}
      style={style}
      disabled={props.disabled || isLoading}
      data-pressed={pressed ? 'true' : 'false'}
      onMouseMove={glow ? onMouseMove : props.onMouseMove}
      className={clsx(base, sizeCls, variants[variant], pressedCls, glowCls, className)}
    >
      {isLoading ? (
        <span className="shrink-0 animate-spin">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </span>
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span className="min-w-0 truncate">{props.children}</span>
      {!isLoading && rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
    </button>
  )
}

