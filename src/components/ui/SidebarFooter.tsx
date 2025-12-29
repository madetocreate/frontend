'use client'

import React from 'react'
import { AkButton } from '@/components/ui/AkButton'
import { StatusChip } from '@/components/ui/drawer-kit'
import clsx from 'clsx'

type SidebarFooterProps = {
  primaryAction?: {
    label: string
    icon?: React.ComponentType<{ className?: string }>
    onClick: () => void
  }
  status?: {
    label: string
    tone?: 'success' | 'warning' | 'error' | 'neutral'
  }
  className?: string
}

export function SidebarFooter({ primaryAction, status, className }: SidebarFooterProps) {
  return (
    <div className={clsx(
      "shrink-0 px-4 py-4", 
      "ak-sidebar-cap ak-sidebar-cap--bottom",
      "sticky bottom-0 z-10",
      className
    )}>
      {status && (
        <div className="flex justify-center mb-3">
           <StatusChip label={status.label} variant={status.tone || 'neutral'} size="sm" />
        </div>
      )}
      
      {primaryAction && (
        <AkButton 
          variant="primary" 
          accent="graphite" // Strong contrast for primary action
          className="w-full justify-center"
          onClick={primaryAction.onClick}
          leftIcon={primaryAction.icon && <primaryAction.icon className="h-4 w-4" />}
        >
          {primaryAction.label}
        </AkButton>
      )}
    </div>
  )
}

