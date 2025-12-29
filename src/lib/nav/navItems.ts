import {
  ChatBubbleLeftRightIcon,
  InboxIcon,
  DocumentIcon,
  Cog6ToothIcon,
  MegaphoneIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { ComponentType } from 'react'
import type { ModuleId } from '@/lib/entitlements/modules'

export type NavItemId = 
  | 'inbox' 
  | 'marketing'
  | 'service'
  | 'chat' 
  | 'documents' 
  | 'settings'

export type NavItem = {
  id: NavItemId
  label: string
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  section: 'main' | 'bottom'
  order: number
  requiresEntitlement?: ModuleId // Feature key for entitlement gating
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'inbox', label: 'Posteingang', icon: InboxIcon, section: 'main', order: 1 },
  { id: 'marketing', label: 'Wachstum', icon: MegaphoneIcon, section: 'main', order: 2 },
  { id: 'service', label: 'Service Hub', icon: UsersIcon, section: 'main', order: 3 },
  { id: 'chat', label: 'AI Chat', icon: ChatBubbleLeftRightIcon, section: 'main', order: 4 },
  { id: 'documents', label: 'Dokumente', icon: DocumentIcon, section: 'main', order: 5 },
  { id: 'settings', label: 'Einstellungen', icon: Cog6ToothIcon, section: 'bottom', order: 10 },
]

