'use client'

import type { ReactNode } from 'react'
import clsx from 'clsx'
import { AkBadge, type AkBadgeTone } from './AkBadge'

/**
 * CardShell - Einheitliche Außenhülle für alle Chat-Cards
 * 
 * Nutzt die gleichen Tokens wie WidgetCard, aber spezifisch für Chat-Cards optimiert.
 * Breite wird von OutputCardFrame kontrolliert (max-w-3xl).
 */
interface CardShellProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function CardShell({ children, className, hover = true }: CardShellProps) {
  return (
    <div
      className={clsx(
        'flex flex-col rounded-[var(--ak-radius-xl)] border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)]',
        'ak-shadow-card',
        hover && 'transition-all duration-200 ease-out hover:ak-shadow-strong hover:-translate-y-0.5',
        'overflow-hidden',
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * CardHeader - Einheitlicher Header für alle Cards
 * 
 * Links: Icon (optional) + Title + Subtitle
 * Rechts: Meta (optional) + Actions (optional)
 */
interface CardHeaderProps {
  icon?: ReactNode
  title?: string
  subtitle?: string
  meta?: ReactNode
  actions?: ReactNode
  className?: string
  divider?: boolean
}

export function CardHeader({ 
  icon, 
  title, 
  subtitle, 
  meta, 
  actions, 
  className,
  divider = true 
}: CardHeaderProps) {
  const hasContent = Boolean(icon || title || subtitle || meta || actions)
  
  if (!hasContent) return null

  return (
    <div className={clsx(
      'flex items-start justify-between gap-4 px-[var(--ak-card-padding)] py-[var(--ak-space-5)]',
      divider && 'border-b border-[var(--ak-color-border-subtle)]',
      className
    )}>
      <div className="min-w-0 flex-1 flex items-start gap-3">
        {icon && (
          <div className="flex-shrink-0 w-12 h-12 rounded-[var(--ak-radius-2xl)] bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center border border-[var(--ak-color-border-fine)]">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1 pt-0.5">
          {title && (
            <h3 className="ak-text-title text-[var(--ak-color-text-primary)] truncate">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="ak-text-meta mt-1 text-[var(--ak-color-text-secondary)] truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {(meta || actions) && (
        <div className="flex items-center gap-2 shrink-0">
          {meta && <div className="flex items-center gap-2">{meta}</div>}
          {actions && <div className="flex items-center gap-1">{actions}</div>}
        </div>
      )}
    </div>
  )
}

/**
 * CardBody - Einheitlicher Body-Container
 * 
 * Standard-Padding: px-6 py-5 (desktop), px-4 py-4 (mobile)
 */
interface CardBodyProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function CardBody({ children, className, padding = 'md' }: CardBodyProps) {
  const paddingClass = 
    padding === 'none' ? '' :
    padding === 'sm' ? 'p-4' :
    padding === 'lg' ? 'p-8' :
    'p-[var(--ak-card-padding)] py-5'

  return (
    <div className={clsx('flex-1', paddingClass, className)}>
      {children}
    </div>
  )
}

/**
 * CardFooter - Einheitlicher Footer für Actions
 * 
 * Buttons haben konsistente Höhe (size="sm")
 * Flex-wrap für mobile Responsiveness
 */
interface CardFooterProps {
  children: ReactNode
  className?: string
  divider?: boolean
}

export function CardFooter({ children, className, divider = true }: CardFooterProps) {
  return (
    <div className={clsx(
      'flex flex-wrap gap-2 justify-end px-[var(--ak-card-padding)] py-4',
      divider && 'border-t border-[var(--ak-color-border-subtle)]',
      'bg-[var(--ak-color-bg-surface-muted)]/50',
      className
    )}>
      {children}
    </div>
  )
}

/**
 * CardMeta - Meta-Informationen (Badges, Status, etc.)
 */
interface CardMetaProps {
  children: ReactNode
  className?: string
}

export function CardMeta({ children, className }: CardMetaProps) {
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      {children}
    </div>
  )
}

/**
 * CardBadge - Einheitliche Badge-Komponente
 * 
 * Wrapper um AkBadge mit konsistenten Props
 */
interface CardBadgeProps {
  children: ReactNode
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'info'
  size?: 'sm' | 'md'
}

const VARIANT_TO_TONE: Record<'success' | 'warning' | 'error' | 'neutral' | 'info', AkBadgeTone> = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  neutral: 'neutral',
  info: 'info',
}

export function CardBadge({ children, variant = 'neutral', size = 'sm' }: CardBadgeProps) {
  const tone = VARIANT_TO_TONE[variant]
  return (
    <AkBadge tone={tone} size={size}>
      {children}
    </AkBadge>
  )
}

