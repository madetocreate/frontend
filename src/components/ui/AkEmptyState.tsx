'use client'

import React, { ReactNode } from 'react'
import clsx from 'clsx'
import { AkButton } from './AkButton'

export interface AkEmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: {
    label: string
    onClick: () => void
    disabled?: boolean
    isLoading?: boolean
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    disabled?: boolean
    isLoading?: boolean
  }
  className?: string
  animate?: boolean
}

export function AkEmptyState({
  title,
  description,
  icon,
  action,
  secondaryAction,
  className,
  animate = true,
}: AkEmptyStateProps) {
  return (
    <div className={clsx(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      animate && 'animate-in fade-in slide-in-from-bottom-2 duration-500',
      className
    )}>
      {icon && (
        <div className={clsx(
          "mb-6 flex items-center justify-center w-20 h-20 rounded-2xl bg-[var(--ak-surface-2)] text-[var(--ak-color-text-secondary)] shadow-sm border border-[var(--ak-color-border-subtle)]",
          animate && "animate-in zoom-in-90 duration-500 delay-100"
        )}>
          {React.isValidElement(icon) ? 
            React.cloneElement(icon as React.ReactElement<any>, { 
              className: clsx((icon as React.ReactElement<any>).props?.className, "h-10 w-10 stroke-[1.5]") 
            } as any) 
            : icon}
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)] mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-[var(--ak-color-text-secondary)] max-w-sm mb-8 leading-relaxed">
          {description}
        </p>
      )}
      
      <div className="flex items-center gap-3">
        {secondaryAction && (
          <AkButton
            variant="ghost"
            onClick={secondaryAction.onClick}
            disabled={secondaryAction.disabled}
            isLoading={secondaryAction.isLoading}
          >
            {secondaryAction.label}
          </AkButton>
        )}
        
        {action && (
          <AkButton
            variant="primary"
            onClick={action.onClick}
            disabled={action.disabled}
            isLoading={action.isLoading}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            {action.label}
          </AkButton>
        )}
      </div>
    </div>
  )
}
