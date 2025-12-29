'use client'

import React, { ReactNode } from 'react'
import clsx from 'clsx'
import { 
  InformationCircleIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline'
import { XMarkIcon } from '@heroicons/react/24/solid'

export type AkAlertTone = 'info' | 'success' | 'warning' | 'danger'

export interface AkAlertProps {
  tone?: AkAlertTone
  title?: string
  description?: string | ReactNode
  icon?: ReactNode
  actions?: ReactNode
  onDismiss?: () => void
  className?: string
  children?: ReactNode
}

const TONE_CONFIG: Record<AkAlertTone, {
  icon: React.ComponentType<{ className?: string }>
  bgClass: string
  borderClass: string
  textClass: string
  iconClass: string
}> = {
  info: {
    icon: InformationCircleIcon,
    bgClass: 'ak-alert-info',
    borderClass: 'border-[var(--ak-semantic-info)]/25',
    textClass: 'text-[var(--ak-semantic-info)]',
    iconClass: 'text-[var(--ak-semantic-info)]',
  },
  success: {
    icon: CheckCircleIcon,
    bgClass: 'ak-alert-success',
    borderClass: 'border-[var(--ak-semantic-success)]/25',
    textClass: 'text-[var(--ak-semantic-success)]',
    iconClass: 'text-[var(--ak-semantic-success)]',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    bgClass: 'ak-alert-warning',
    borderClass: 'border-[var(--ak-semantic-warning)]/25',
    textClass: 'text-[var(--ak-semantic-warning)]',
    iconClass: 'text-[var(--ak-semantic-warning)]',
  },
  danger: {
    icon: XCircleIcon,
    bgClass: 'ak-alert-danger',
    borderClass: 'border-[var(--ak-semantic-danger)]/25',
    textClass: 'text-[var(--ak-semantic-danger)]',
    iconClass: 'text-[var(--ak-semantic-danger)]',
  },
}

export function AkAlert({
  tone = 'info',
  title,
  description,
  icon,
  actions,
  onDismiss,
  className,
  children,
}: AkAlertProps) {
  const config = TONE_CONFIG[tone]
  const Icon = config.icon

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-4 rounded-[var(--ak-radius-lg)] border',
        config.bgClass,
        config.borderClass,
        className
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {icon || <Icon className={clsx('h-5 w-5', config.iconClass)} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={clsx('text-sm font-semibold mb-1', config.textClass)}>
            {title}
          </h4>
        )}
        {description && (
          <div className={clsx('text-sm', config.textClass, title && 'opacity-90')}>
            {description}
          </div>
        )}
        {children && (
          <div className={clsx('text-sm', config.textClass, (title || description) && 'mt-2')}>
            {children}
          </div>
        )}
        {actions && (
          <div className="mt-3 flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Dismiss Button */}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={clsx(
            'flex-shrink-0 p-1 rounded-md transition-colors',
            'hover:bg-[var(--ak-color-bg-hover)] focus:outline-none focus:ring-2 focus:ring-offset-1',
            config.textClass,
            'focus:ring-[var(--ak-semantic-info)]/25'
          )}
          aria-label="Schließen"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

