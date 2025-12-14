'use client'

import clsx from 'clsx'
import type { CSSProperties, HTMLAttributes, KeyboardEvent, ReactNode } from 'react'

import type { AkAccent } from './AkButton'

export type AkListRowProps = Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onClick'> & {
  accent?: AkAccent
  leading?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  trailing?: ReactNode
  selected?: boolean
  onClick?: () => void
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
}

export function AkListRow({
  accent = 'default',
  leading,
  title,
  subtitle,
  trailing,
  selected = false,
  onClick,
  className,
  ...props
}: AkListRowProps) {
  const accentVar = ACCENT_VAR[accent] ?? ACCENT_VAR.default

  const style: CSSProperties & CSSVars = {
    ...(props.style ?? {}),
    '--ak-control-accent': accentVar,
    '--ak-control-accent-soft': `color-mix(in oklab, ${accentVar} 28%, transparent)`,
  }

  const interactive = Boolean(onClick)

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.()
    }
  }

  return (
    <div
      {...props}
      style={style}
      role={interactive ? 'button' : props.role}
      tabIndex={interactive ? 0 : props.tabIndex}
      onKeyDown={interactive ? onKeyDown : props.onKeyDown}
      onClick={interactive ? () => onClick?.() : undefined}
      aria-current={selected ? 'true' : undefined}
      className={clsx(
        'group flex w-full items-center gap-3 px-3 py-2.5 rounded-[var(--ak-radius-lg)] border transition-colors duration-150 ease-out',
        interactive
          ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-control-accent-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ak-color-bg-sidebar)]'
          : '',
        selected
          ? 'bg-[var(--ak-color-bg-selected)] border-[var(--ak-color-border-strong)]'
          : 'bg-transparent border-transparent hover:bg-[var(--ak-color-bg-hover)] hover:border-[var(--ak-color-border-subtle)]',
        className,
      )}
    >
      {leading ? <div className="shrink-0">{leading}</div> : null}

      <div className="min-w-0 flex-1">
        <div className="min-w-0">{title}</div>
        {subtitle ? <div className="mt-0.5 min-w-0">{subtitle}</div> : null}
      </div>

      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  )
}
