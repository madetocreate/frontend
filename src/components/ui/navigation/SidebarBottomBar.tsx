'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { 
  EyeSlashIcon,
  EnvelopeIcon,
  UserPlusIcon,
  DocumentPlusIcon,
  BoltIcon,
  GlobeAltIcon,
  StarIcon,
  PhoneIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline'

interface SidebarBottomBarProps {
  onAction?: () => void
  workspaceOverride?: string
}

const WORKSPACE_ACTIONS: Record<string, { label: string; icon: typeof EyeSlashIcon }> = {
  inbox: { label: 'Neue Nachricht', icon: EnvelopeIcon },
  chat: { label: 'Chat ohne Memory', icon: EyeSlashIcon },
  'service-hub': { label: 'Neuer Kunde', icon: UserPlusIcon },
  customers: { label: 'Neuer Kontakt', icon: UserPlusIcon },
  docs: { label: 'Neues Dokument', icon: DocumentPlusIcon },
  actions: { label: 'Neue Aktion', icon: BoltIcon },
  marketing: { label: 'Neue Kampagne', icon: MegaphoneIcon },
  website: { label: 'Neuer Bot', icon: GlobeAltIcon },
  reviews: { label: 'Review anfordern', icon: StarIcon },
  telephony: { label: 'Neuer Anruf', icon: PhoneIcon },
}

export function SidebarBottomBar({ onAction, workspaceOverride }: SidebarBottomBarProps) {
  const pathname = usePathname()
  
  // Use override if provided, otherwise extract from pathname
  const workspaceId = workspaceOverride || pathname?.split('/')[1] || ''
  const action = WORKSPACE_ACTIONS[workspaceId]
  
  if (!action) {
    return null
  }

  const Icon = action.icon

  return (
    <div className="px-3 py-2.5 w-full">
      <button
        onClick={onAction}
        className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] border border-[var(--ak-color-border-fine)] hover:border-[var(--ak-color-border-subtle)] transition-all text-xs font-medium"
      >
        <Icon className="h-4 w-4" />
        <span>{action.label}</span>
      </button>
    </div>
  )
}
