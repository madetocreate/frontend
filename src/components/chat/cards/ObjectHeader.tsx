'use client'

import React from 'react'
import clsx from 'clsx'
import { AkBadge } from '@/components/ui/AkBadge'
import { InformationCircleIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface ObjectHeaderProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  status?: string
  pinned?: boolean
  onPin?: () => void
  onInfo?: () => void
  className?: string
}

export function ObjectHeader({
  icon,
  title,
  subtitle,
  status,
  pinned,
  onPin,
  onInfo,
  className
}: ObjectHeaderProps) {
  return (
    <div className={clsx('flex items-start justify-between gap-3 pb-3 border-b border-[var(--ak-color-border-subtle)]', className)}>
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center text-[var(--ak-color-text-secondary)]">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)] truncate">
              {title}
            </h3>
            {status && (
              <AkBadge tone="neutral" size="sm">
                {status}
              </AkBadge>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-[var(--ak-color-text-secondary)] truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1 flex-shrink-0">
        {onPin && (
          <button 
            onClick={onPin}
            className="p-1.5 text-[var(--ak-color-text-tertiary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] rounded-md transition-colors"
            title="Anpinnen"
          >
            {pinned ? <StarIconSolid className="w-4 h-4 text-[var(--ak-semantic-warning)]" /> : <StarIcon className="w-4 h-4" />}
          </button>
        )}
        {onInfo && (
          <button 
            onClick={onInfo}
            className="p-1.5 text-[var(--ak-color-text-tertiary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] rounded-md transition-colors"
            title="Details / Warum?"
          >
            <InformationCircleIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

