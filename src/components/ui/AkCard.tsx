'use client'

import React, { ReactNode } from 'react'
import clsx from 'clsx'

export type AkCardVariant = 'preview' | 'default' | 'cta'
export type AkAccent = 'default' | 'inbox' | 'customers' | 'documents' | 'growth' | 'settings' | 'graphite'

export interface AkCardProps {
  variant?: AkCardVariant
  accent?: AkAccent
  selected?: boolean
  accentBar?: boolean
  title?: ReactNode
  subtitle?: ReactNode
  meta?: ReactNode
  body?: ReactNode
  footerActions?: ReactNode
  details?: ReactNode
  onClick?: () => void
  className?: string
  children?: ReactNode
}

const ACCENT_COLORS: Record<AkAccent, string> = {
  default: 'var(--ak-color-accent)',
  inbox: 'var(--ak-accent-inbox)',
  customers: 'var(--ak-accent-customers)',
  documents: 'var(--ak-accent-documents)',
  growth: 'var(--ak-accent-growth)',
  settings: 'var(--ak-color-accent)',
  graphite: 'var(--ak-color-graphite-base)',
}

/**
 * AkCard - Der neue Standard-Container für Content-Karten.
 * Folgt der "Quiet Power" Design-Philosophie (flach, klar, Token-basiert).
 * 
 * Bevorzugt gegenüber Legacy-Varianten wie AppleCard oder EnhancedCard.
 */
export function AkCard({
  variant = 'default',
  accent = 'default',
  selected = false,
  accentBar = false,
  title,
  subtitle,
  meta,
  body,
  footerActions,
  details,
  onClick,
  className,
  children,
}: AkCardProps) {
  const accentColor = ACCENT_COLORS[accent]
  const isInteractive = !!onClick

  const baseClasses = clsx(
    'relative rounded-[var(--ak-card-radius)] border transition-all duration-[var(--ak-motion-base)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent-soft)] focus-visible:ring-offset-2',
    isInteractive && 'cursor-pointer',
    className
  )

  const variantClasses = {
    preview: clsx(
      'bg-[var(--ak-color-bg-surface)] border-[var(--ak-color-border-fine)]',
      'hover:bg-[var(--ak-color-bg-hover)] hover:border-[var(--ak-color-border-subtle)]',
      selected && 'bg-[var(--ak-color-bg-selected)] border-[var(--ak-color-border-strong)]'
    ),
    default: clsx(
      'bg-[var(--ak-color-bg-surface)] border-[var(--ak-color-border-fine)]',
      'hover:bg-[var(--ak-color-bg-hover)]',
      selected && 'bg-[var(--ak-color-bg-selected)] border-[var(--ak-color-border-strong)]'
    ),
    cta: clsx(
      'bg-[var(--ak-color-bg-elevated)] border-[var(--ak-color-border-subtle)] ak-shadow-soft',
      'hover:border-[var(--ak-color-border-strong)]',
      selected && 'bg-[var(--ak-color-bg-selected)] border-[var(--ak-color-border-strong)] ak-shadow-soft'
    ),
  }

  const accentBarClasses = accentBar && variant === 'cta' && clsx(
    'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px]',
    'before:rounded-l-[var(--ak-card-radius)]',
    `before:bg-[${accentColor}]`
  )

  const content = (
    <>
      {accentBar && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[2px] rounded-l-[var(--ak-card-radius)]"
          style={{ backgroundColor: accentColor }}
        />
      )}
      
      {(title || subtitle || meta) && (
        <div className="px-[var(--ak-card-padding)] pt-[var(--ak-card-padding)] pb-0">
          {title && (
            <div className="ak-text-title text-[var(--ak-color-text-primary)] mb-1">
              {title}
            </div>
          )}
          {subtitle && (
            <div className="ak-text-body text-[var(--ak-color-text-secondary)] text-sm mb-1">
              {subtitle}
            </div>
          )}
          {meta && (
            <div className="ak-text-meta text-[var(--ak-color-text-muted)] text-xs mt-1">
              {meta}
            </div>
          )}
        </div>
      )}

      {(body || children) && (
        <div className={clsx(
          'px-[var(--ak-card-padding)]',
          (title || subtitle || meta) ? 'pt-3' : 'pt-[var(--ak-card-padding)]',
          details ? 'pb-3' : (footerActions ? 'pb-3' : 'pb-[var(--ak-card-padding)]')
        )}>
          {body || children}
        </div>
      )}

      {details && (
        <div className="px-[var(--ak-card-padding)] pb-3">
          {details}
        </div>
      )}

      {footerActions && (
        <div className="px-[var(--ak-card-padding)] pb-[var(--ak-card-padding)] pt-0 border-t border-[var(--ak-color-border-fine)] mt-3">
          <div className="flex items-center gap-2 pt-3">
            {footerActions}
          </div>
        </div>
      )}
    </>
  )

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={clsx(baseClasses, variantClasses[variant], accentBarClasses)}
      >
        {content}
      </button>
    )
  }

  return (
    <div className={clsx(baseClasses, variantClasses[variant], accentBarClasses)}>
      {content}
    </div>
  )
}

