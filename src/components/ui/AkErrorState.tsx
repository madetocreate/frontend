'use client'

import React, { ReactNode } from 'react'
import clsx from 'clsx'
import { AkButton } from './AkButton'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export interface AkErrorStateProps {
  title?: string
  description?: string
  icon?: ReactNode
  onRetry?: () => void
  onBack?: () => void
  error?: string | Error
  className?: string
}

export function AkErrorState({
  title = 'Ein Fehler ist aufgetreten',
  description = 'Die angeforderten Daten konnten nicht geladen werden. Bitte versuchen Sie es erneut.',
  icon,
  onRetry,
  onBack,
  error,
  className,
}: AkErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : null

  return (
    <div className={clsx(
      'flex flex-col items-center justify-center py-16 px-4 text-center',
      className
    )}>
      <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-2xl bg-[var(--ak-semantic-danger-soft)] text-[var(--ak-semantic-danger)] shadow-sm border border-[var(--ak-semantic-danger)]/20">
        {icon ? icon : <ExclamationTriangleIcon className="h-10 w-10 stroke-[1.5]" />}
      </div>
      
      <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)] mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-[var(--ak-color-text-secondary)] max-w-sm mb-4 leading-relaxed">
        {description}
      </p>

      {errorMessage && (
        <div className="mb-8 p-3 rounded-lg bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-subtle)] max-w-md w-full">
          <p className="text-xs font-mono text-[var(--ak-color-text-muted)] truncate">
            {errorMessage}
          </p>
        </div>
      )}
      
      <div className="flex items-center gap-3">
        {onBack && (
          <AkButton
            variant="ghost"
            onClick={onBack}
          >
            Zurück
          </AkButton>
        )}
        
        {onRetry && (
          <AkButton
            variant="primary"
            accent="graphite"
            onClick={onRetry}
            leftIcon={<ArrowPathIcon className="h-4 w-4" />}
          >
            Erneut versuchen
          </AkButton>
        )}
      </div>
    </div>
  )
}
