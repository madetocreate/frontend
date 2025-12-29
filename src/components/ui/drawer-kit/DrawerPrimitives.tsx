'use client'

import React, { ReactNode } from 'react'
import clsx from 'clsx'
import { XMarkIcon, QuestionMarkCircleIcon, ChevronRightIcon, ArrowPathIcon, CommandLineIcon } from '@heroicons/react/24/outline'
import { AkBadge, AkBadgeTone } from '@/components/ui/AkBadge'
import { AkIconButton } from '@/components/ui/AkIconButton'
import { AkButton } from '@/components/ui/AkButton'

/**
 * DRAWER KIT PRIMITIVES
 * Single source of truth for all drawers (left & right).
 * 
 * --- DEFINITION OF DONE (DoD) FOR DRAWERS ---
 * 1. Must use DrawerHeader (right) or top Search/Command (left).
 * 2. All content must be inside DrawerCard containers.
 * 3. Use ActionGroup & ActionButton for consistency.
 * 4. No raw Tailwind grays (use var(--ak-color-*)).
 * 5. Transitions: 180-220ms timing.
 * 6. Must handle 3 states: Empty, Selected, Multi-select (if applicable).
 * 7. Skeleton & Error states must be implemented.
 */

// --- Types ---

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

// --- Components ---

export interface DrawerHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  status?: {
    label: string
    tone: AkBadgeTone
  }
  leading?: ReactNode
  trailing?: ReactNode
  onClose?: () => void
  showHelp?: boolean
}

/**
 * Standard Header for all drawers.
 * Anchored to Posteingang right drawer style.
 */
export function DrawerHeader({ title, subtitle, status, leading, trailing, onClose, showHelp = true }: DrawerHeaderProps) {
  const compositeSubtitle = (
    <div className="flex items-center gap-2">
      {status && (
        <StatusChip label={status.label} variant={status.tone} size="sm" />
      )}
      {status && subtitle && <span className="text-[var(--ak-color-text-muted)]">•</span>}
      <span className="text-[var(--ak-color-text-secondary)] truncate">{subtitle}</span>
    </div>
  )

  return (
    <div className="sticky top-0 z-20 flex flex-col ak-glass-drawer-header">
      <div className="flex h-14 items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {leading && <div className="flex-shrink-0">{leading}</div>}
          <div className="flex flex-col min-w-0">
            <h2 className="truncate text-sm font-semibold tracking-tight text-[var(--ak-color-text-primary)]">
              {title}
            </h2>
            {subtitle || status ? <div className="mt-0.5">{compositeSubtitle}</div> : null}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {showHelp && (
            <AkIconButton 
              size="sm" 
              variant="ghost" 
              title="Hilfe (?)"
              onClick={() => window.dispatchEvent(new CustomEvent('aklow-toggle-shortcuts'))}
            >
              <QuestionMarkCircleIcon className="h-4 w-4" />
            </AkIconButton>
          )}
          {trailing}
          {onClose && (
            <AkIconButton size="sm" variant="ghost" onClick={onClose} aria-label="Schließen">
              <XMarkIcon className="h-4 w-4" />
            </AkIconButton>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Standard Drawer Card.
 * Uses AKLOW elevated tokens.
 */
export function DrawerCard({ 
  children, 
  padding = 'normal', 
  className, 
  title 
}: { 
  children: ReactNode; 
  padding?: 'none' | 'small' | 'normal' | 'large'; 
  className?: string; 
  title?: string 
}) {
  const paddingMap = {
    none: '',
    small: 'p-3',
    normal: 'p-4',
    large: 'p-6',
  }
  
  return (
    <div className={clsx(
      "rounded-[var(--ak-radius-xl)] border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)] ak-shadow-sm overflow-hidden",
      className
    )}>
      {title && (
        <div className="px-4 pt-4 pb-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--ak-color-text-muted)]">
            {title}
          </div>
        </div>
      )}
      <div className={paddingMap[padding]}>{children}</div>
    </div>
  )
}

/**
 * Section title for groupings inside drawers.
 */
export function DrawerSectionTitle({ children, className, trailing }: { children: ReactNode; className?: string; trailing?: ReactNode }) {
  return (
    <div className={clsx('flex items-center justify-between px-1 mb-2', className)}>
      <h3 className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-widest">
        {children}
      </h3>
      {trailing && <div className="flex-shrink-0">{trailing}</div>}
    </div>
  )
}

/**
 * Keyboard shortcut chip.
 */
export function ShortcutChip({ label }: { label: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-[var(--ak-radius-sm)] border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-1 text-[9px] font-bold font-mono uppercase text-[var(--ak-color-text-muted)] shadow-sm">
      {label}
    </kbd>
  )
}

/**
 * Action group for organizing buttons.
 */
export function ActionGroup({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={clsx("space-y-2", className)}>
      <div className="px-1 text-[10px] font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)] opacity-80">{label}</div>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </div>
  )
}

/**
 * Standard Action Button for drawers.
 * Includes icon, label and optional shortcut.
 */
export function ActionButton({ 
  icon, 
  label, 
  shortcut, 
  onClick, 
  variant = 'secondary',
  className,
  loading = false
}: { 
  icon: ReactNode; 
  label: string; 
  shortcut?: string; 
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  className?: string;
  loading?: boolean;
}) {
  const variantMap = {
    primary: 'bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] hover:opacity-90 ak-shadow-colored border-transparent',
    secondary: 'bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] shadow-sm',
    ghost: 'bg-transparent border-transparent text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]',
    danger: 'bg-[var(--ak-color-bg-danger)] text-[var(--ak-color-text-danger)] border-[var(--ak-color-border-danger)] hover:opacity-90',
  }

  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className={clsx(
        "group flex w-full items-center justify-between rounded-[var(--ak-radius-xl)] p-3 border transition-[background-color,border-color,box-shadow,transform,opacity] duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)] ak-button-interactive hover:-translate-y-[1px] active:scale-[0.99]",
        variantMap[variant],
        loading && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={clsx(
          'flex h-8 w-8 items-center justify-center rounded-lg transition-[background-color,border-color,box-shadow,transform,opacity] duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)] shrink-0 group-hover:scale-110',
          variant === 'primary' ? 'bg-[var(--ak-color-bg-surface)]/20' : 'bg-[var(--ak-color-bg-surface-muted)] group-hover:bg-[var(--ak-color-accent)]/10 text-[var(--ak-color-accent-strong)]'
        )}>
          {icon}
        </div>
        <span className="text-xs font-semibold truncate">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {shortcut && <ShortcutChip label={shortcut} />}
        <ChevronRightIcon className="h-3.5 w-3.5 opacity-30 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  )
}

import { AkEmptyState } from '@/components/ui/AkEmptyState'

/**
 * Premium Empty State for drawers.
 */
export function DrawerEmptyState({ 
  icon, 
  title, 
  description, 
  primaryAction,
  secondaryActions
}: { 
  icon: ReactNode; 
  title: string; 
  description: string; 
  primaryAction?: { label: string; shortcut?: string; onClick: () => void };
  secondaryActions?: { label: string; shortcut?: string; onClick: () => void }[];
}) {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <AkEmptyState
        icon={icon}
        title={title}
        description={description}
        action={primaryAction ? {
          label: primaryAction.label,
          onClick: primaryAction.onClick
        } : undefined}
        secondaryAction={secondaryActions && secondaryActions.length > 0 ? {
          label: secondaryActions[0].label,
          onClick: secondaryActions[0].onClick
        } : undefined}
      />
      {secondaryActions && secondaryActions.length > 1 && (
        <div className="flex flex-wrap gap-2 justify-center px-6 pb-6">
          {secondaryActions.slice(1).map((action, i) => (
            <AkButton 
              key={i}
              variant="ghost" 
              size="sm"
              onClick={action.onClick}
            >
              {action.label}
              {action.shortcut && <ShortcutChip label={action.shortcut} />}
            </AkButton>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Standard List Row for drawer navigation or lists.
 */
export function DrawerListRow({
  title,
  subtitle,
  leading,
  trailing,
  selected,
  onClick,
  accent = 'neutral',
  className,
}: {
  title: ReactNode
  subtitle?: ReactNode
  leading?: ReactNode
  trailing?: ReactNode
  selected?: boolean
  onClick?: () => void
  accent?: 'neutral' | 'primary' | 'inbox' | 'growth' | 'documents' | 'settings'
  className?: string
}) {
  const accentMap = {
    neutral: 'hover:bg-[var(--ak-color-bg-hover)]',
    primary: 'hover:bg-[var(--ak-color-accent)]/5',
    inbox: 'hover:bg-[var(--ak-color-accent)]/5',
    growth: 'hover:bg-[var(--ak-color-accent)]/5',
    documents: 'hover:bg-[var(--ak-color-accent)]/5',
    settings: 'hover:bg-[var(--ak-color-bg-hover)]',
  }

  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex w-full items-center gap-3 rounded-[var(--ak-radius-xl)] px-3 py-2 text-left transition-[background-color,transform,opacity] duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] ak-button-interactive',
        selected
          ? 'bg-[var(--ak-color-bg-elevated)] shadow-sm ring-1 ring-[var(--ak-color-border-subtle)]'
          : accentMap[accent],
        className
      )}
    >
      {leading && (
        <div className={clsx('flex-shrink-0', selected ? 'text-[var(--ak-color-accent)]' : 'text-[var(--ak-color-text-secondary)]')}>
          {leading}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={clsx('text-xs font-semibold truncate', selected ? 'text-[var(--ak-color-text-primary)]' : 'text-[var(--ak-color-text-secondary)]')}>
          {title}
        </p>
        {subtitle && (
          <p className="text-[10px] text-[var(--ak-color-text-muted)] truncate">
            {subtitle}
          </p>
        )}
      </div>
      {trailing && <div className="flex-shrink-0">{trailing}</div>}
    </button>
  )
}

/**
 * Header for multi-select state.
 */
export function DrawerMultiSelectHeader({ 
  count, 
  onClear, 
  onClose 
}: { 
  count: number; 
  onClear: () => void; 
  onClose: () => void 
}) {
  return (
    <div className="sticky top-0 z-20 flex flex-col border-b border-[var(--ak-color-accent)] bg-[var(--ak-color-accent-soft)]/10 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] font-bold text-sm">
            {count}
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold tracking-tight text-[var(--ak-color-text-primary)]">
              {count} Dokumente ausgewählt
            </h2>
            <button 
              onClick={onClear}
            className="text-[10px] font-bold text-[var(--ak-color-accent-strong)] uppercase tracking-tight hover:opacity-80 transition-[opacity] duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)] text-left"
            >
              Auswahl aufheben
            </button>
          </div>
        </div>
        <AkIconButton size="sm" variant="ghost" onClick={onClose}>
          <XMarkIcon className="h-4 w-4" />
        </AkIconButton>
      </div>
    </div>
  )
}

/**
 * Standard Status Chip.
 * Uses AkBadge tokens but with a consistent drawer style.
 */
export function StatusChip({
  label,
  variant = 'neutral',
  size = 'sm',
}: {
  label: string
  variant?: StatusVariant | AkBadgeTone
  size?: 'xs' | 'sm'
}) {
  const toneMap: Record<string, AkBadgeTone> = {
    success: 'success',
    warning: 'warning',
    error: 'danger',
    danger: 'danger',
    info: 'info',
    neutral: 'muted',
    muted: 'muted',
    primary: 'accent',
  }

  const tone = toneMap[variant] || 'muted'

  return (
    <AkBadge 
      tone={tone} 
      size={size === 'xs' ? 'sm' : 'sm'} 
      className={clsx(
        'font-bold uppercase tracking-wider',
        size === 'xs' ? '!text-[8px] !px-1.5' : '!text-[9px] !px-2'
      )}
    >
      {label}
    </AkBadge>
  )
}

/**
 * Standard row for activity feeds or audit trails.
 */
export function ActivityRow({ 
  label, 
  time, 
  tone = 'neutral' 
}: { 
  label: string; 
  time: string; 
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' 
}) {
  const toneMap = {
    primary: 'bg-[var(--ak-color-accent)]',
    success: 'bg-[var(--ak-color-success-strong)]',
    warning: 'bg-[var(--ak-color-warning-strong)]',
    danger: 'bg-[var(--ak-color-danger-strong)]',
    info: 'bg-[var(--ak-color-info-strong)]',
    neutral: 'bg-[var(--ak-color-text-muted)]',
  }

  return (
    <div className="flex items-start gap-3">
      <div className={clsx("mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full", toneMap[tone])} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-[var(--ak-color-text-primary)] leading-tight">{label}</p>
        <p className="text-[9px] text-[var(--ak-color-text-muted)] uppercase tracking-wider mt-0.5">{time}</p>
      </div>
    </div>
  )
}

/**
 * Standard row for metadata (label/value).
 */
export function MetaRow({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex justify-between items-center gap-4 text-[10px] py-0.5">
      <div className="flex items-center gap-2 min-w-0">
        {icon && <div className="text-[var(--ak-color-text-muted)]">{icon}</div>}
        <span className="text-[var(--ak-color-text-muted)] font-medium uppercase tracking-tight truncate">{label}</span>
      </div>
      <span className="text-[var(--ak-color-text-primary)] font-bold truncate text-right">{value}</span>
    </div>
  )
}

/**
 * Skeleton loader for drawer cards.
 */
export function DrawerSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-1/2 rounded-lg bg-[var(--ak-color-bg-surface-muted)]" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 w-full rounded-xl bg-[var(--ak-color-bg-surface-muted)]" />
        ))}
      </div>
    </div>
  )
}

/**
 * Standard Error state for drawers.
 */
export function DrawerError({ onRetry }: { onRetry?: () => void }) {
  return (
    <DrawerCard className="border-[var(--ak-color-border-danger)]/30 bg-[var(--ak-color-bg-danger)]/5" padding="normal">
      <div className="flex flex-col items-center text-center space-y-3 py-4">
        <div className="text-[var(--ak-color-text-danger)] font-semibold">Fehler beim Laden</div>
        <p className="text-xs text-[var(--ak-color-text-secondary)]">Die Details konnten nicht abgerufen werden.</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="flex items-center gap-2 text-xs font-bold text-[var(--ak-color-accent-strong)] uppercase hover:opacity-80"
          >
            <ArrowPathIcon className="h-3.5 w-3.5" /> Erneut versuchen
          </button>
        )}
      </div>
    </DrawerCard>
  )
}
