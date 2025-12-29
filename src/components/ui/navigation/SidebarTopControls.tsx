'use client'

import React from 'react'
import { MagnifyingGlassIcon, CommandLineIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { AkIconButton } from '@/components/ui/AkIconButton'
import { AkTooltip } from '@/components/ui/AkTooltip'

interface SidebarTopControlsProps {
  onToggleSearch?: () => void
  onToggleCommandPalette?: () => void
  onToggleCollapse?: () => void
}

export function SidebarTopControls({
  onToggleSearch,
  onToggleCommandPalette,
  onToggleCollapse,
}: SidebarTopControlsProps) {
  return (
    <div className="flex items-center justify-between px-3 h-14 shrink-0">
      {/* Left: Collapse Button */}
      <div className="flex items-center">
        {onToggleCollapse && (
          <AkTooltip content="Sidebar einklappen">
            <AkIconButton
              onClick={onToggleCollapse}
              variant="ghost"
              className="text-[var(--ak-text-secondary)] hover:text-[var(--ak-text-primary)]"
            >
              <Bars3Icon className="h-5 w-5" />
            </AkIconButton>
          </AkTooltip>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {onToggleSearch && (
          <AkTooltip content="Suche">
            <AkIconButton
              onClick={onToggleSearch}
              variant="ghost"
            >
              <MagnifyingGlassIcon className="h-4.5 w-4.5" />
            </AkIconButton>
          </AkTooltip>
        )}
        {onToggleCommandPalette && (
          <AkTooltip content="Befehle (Cmd+K)">
            <AkIconButton
              onClick={onToggleCommandPalette}
              variant="ghost"
            >
              <CommandLineIcon className="h-4.5 w-4.5" />
            </AkIconButton>
          </AkTooltip>
        )}
      </div>
    </div>
  )
}

