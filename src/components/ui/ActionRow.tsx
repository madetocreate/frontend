'use client'

import React from 'react'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

type ActionRowProps = {
  icon?: React.ReactNode
  label: string
  description?: string
  onClick: () => void
  requiresApproval?: boolean
  disabled?: boolean
  className?: string
}

export function ActionRow({
  icon,
  label,
  description,
  onClick,
  requiresApproval = false,
  disabled = false,
  className,
}: ActionRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'w-full flex items-center gap-3 px-3 py-2.5',
        'text-left transition-colors',
        'hover:bg-[var(--ak-color-bg-hover)]',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {icon && (
        <div className="shrink-0 text-[var(--ak-color-text-secondary)]">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-[var(--ak-color-text-primary)] truncate">
          {label}
        </div>
        {description && (
          <div className="text-xs text-[var(--ak-color-text-muted)] truncate mt-0.5">
            {description}
          </div>
        )}
      </div>
      {requiresApproval && (
        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)]">
          Freigabe
        </span>
      )}
      <ChevronRightIcon className="h-4 w-4 text-[var(--ak-color-text-muted)] shrink-0" />
    </button>
  )
}

