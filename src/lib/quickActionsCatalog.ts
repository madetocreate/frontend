'use client'

import { BoltIcon } from '@heroicons/react/24/outline'
import type { AIActionContext } from '@/components/ui/AIActions'

export type QuickActionDefinition = {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

// Zentrales Verzeichnis aller verfügbaren Quick Actions (ohne Handler)
export const QUICK_ACTIONS_CATALOG: Record<AIActionContext, QuickActionDefinition[]> = {
  inbox: [
    { id: 'quick-reply', label: 'Schnellantwort', icon: BoltIcon },
    { id: 'quick-archive', label: 'Archivieren', icon: BoltIcon },
    { id: 'quick-forward', label: 'Weiterleiten', icon: BoltIcon },
  ],
  customer: [
    { id: 'quick-call', label: 'Anrufen', icon: BoltIcon },
    { id: 'quick-email', label: 'E-Mail', icon: BoltIcon },
    { id: 'quick-meeting', label: 'Meeting', icon: BoltIcon },
  ],
  growth: [
    { id: 'quick-campaign', label: 'Kampagne', icon: BoltIcon },
    { id: 'quick-post', label: 'Post', icon: BoltIcon },
    { id: 'quick-analytics', label: 'Analytics', icon: BoltIcon },
  ],
  document: [
    { id: 'quick-download', label: 'Download', icon: BoltIcon },
    { id: 'quick-share', label: 'Teilen', icon: BoltIcon },
    { id: 'quick-edit', label: 'Bearbeiten', icon: BoltIcon },
  ],
  automation: [
    { id: 'quick-run', label: 'Ausführen', icon: BoltIcon },
    { id: 'quick-test', label: 'Testen', icon: BoltIcon },
    { id: 'quick-edit', label: 'Bearbeiten', icon: BoltIcon },
  ],
  telephony: [
    { id: 'quick-call', label: 'Anrufen', icon: BoltIcon },
    { id: 'quick-transcribe', label: 'Transkribieren', icon: BoltIcon },
    { id: 'quick-summary', label: 'Zusammenfassen', icon: BoltIcon },
  ],
  // BETA: Marketing Quick Actions (gated by NEXT_PUBLIC_MARKETING_BETA + entitlement)
  marketing: [
    { id: 'quick-post', label: 'Post', icon: BoltIcon },
    { id: 'quick-campaign', label: 'Kampagne', icon: BoltIcon },
    { id: 'quick-schedule', label: 'Planen', icon: BoltIcon },
  ],
  memory: [
    { id: 'quick-search', label: 'Suchen', icon: BoltIcon },
    { id: 'quick-save', label: 'Speichern', icon: BoltIcon },
    { id: 'quick-link', label: 'Verknüpfen', icon: BoltIcon },
  ],
  settings: [
    { id: 'quick-export', label: 'Exportieren', icon: BoltIcon },
    { id: 'quick-backup', label: 'Backup', icon: BoltIcon },
    { id: 'quick-reset', label: 'Zurücksetzen', icon: BoltIcon },
  ],
  notifications: [
    { id: 'quick-mark-read', label: 'Als gelesen', icon: BoltIcon },
    { id: 'quick-mute', label: 'Stummschalten', icon: BoltIcon },
    { id: 'quick-settings', label: 'Einstellungen', icon: BoltIcon },
  ],
  calendar: [
    { id: 'quick-event', label: 'Termin', icon: BoltIcon },
    { id: 'quick-meeting', label: 'Meeting', icon: BoltIcon },
    { id: 'quick-block', label: 'Blockieren', icon: BoltIcon },
  ],
  shield: [
    { id: 'quick-policy', label: 'Policy prüfen', icon: BoltIcon },
    { id: 'quick-pii', label: 'PII Scan', icon: BoltIcon },
    { id: 'quick-risk', label: 'Risiko-Report', icon: BoltIcon },
  ],
  website: [
    { id: 'quick-optimize', label: 'Widget optimieren', icon: BoltIcon },
    { id: 'quick-analyze', label: 'Traffic analysieren', icon: BoltIcon },
    { id: 'quick-snippets', label: 'Snippets', icon: BoltIcon },
  ],
}

export function getQuickActionsForContext(context: AIActionContext): QuickActionDefinition[] {
  return QUICK_ACTIONS_CATALOG[context] ?? []
}

export function findQuickAction(
  context: AIActionContext,
  id: string
): QuickActionDefinition | undefined {
  return getQuickActionsForContext(context).find((action) => action.id === id)
}

