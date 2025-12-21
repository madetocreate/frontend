'use client'

import { BoltIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import type { AIActionContext } from './AIActions'
import { createActionHandler } from '@/lib/actionHandlers'

export type QuickAction = {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick?: () => void
}

interface QuickActionsProps {
  context: AIActionContext
  initialActions?: QuickAction[]
  className?: string
}

const DEFAULT_QUICK_ACTIONS: Record<AIActionContext, QuickAction[]> = {
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
  news: [
    { id: 'quick-bookmark', label: 'Bookmark', icon: BoltIcon },
    { id: 'quick-share', label: 'Teilen', icon: BoltIcon },
    { id: 'quick-translate', label: 'Übersetzen', icon: BoltIcon },
  ],
  calendar: [
    { id: 'quick-event', label: 'Termin', icon: BoltIcon },
    { id: 'quick-meeting', label: 'Meeting', icon: BoltIcon },
    { id: 'quick-block', label: 'Blockieren', icon: BoltIcon },
  ],
  practice: [
    { id: 'quick-appointment', label: 'Termin', icon: BoltIcon },
    { id: 'quick-report', label: 'Bericht', icon: BoltIcon },
    { id: 'quick-prescription', label: 'Rezept', icon: BoltIcon },
  ],
  realestate: [
    { id: 'quick-expose', label: 'Exposé', icon: BoltIcon },
    { id: 'quick-viewing', label: 'Besichtigung', icon: BoltIcon },
    { id: 'quick-offer', label: 'Angebot', icon: BoltIcon },
  ],
  hotel: [
    { id: 'quick-booking', label: 'Buchung', icon: BoltIcon },
    { id: 'quick-checkin', label: 'Check-in', icon: BoltIcon },
    { id: 'quick-invoice', label: 'Rechnung', icon: BoltIcon },
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

export function QuickActions({ 
  context, 
  initialActions,
  className 
}: QuickActionsProps) {
  const allActions = initialActions || DEFAULT_QUICK_ACTIONS[context] || []

  if (allActions.length === 0) {
    return null
  }

  // Wire actions with handlers
  const wiredActions = allActions.map(action => ({
    ...action,
    onClick: action.onClick || createActionHandler('quick-action', action.id, context)
  }))

  return (
    <div className={clsx('flex flex-wrap gap-1.5', className)}>
      {wiredActions.map((action) => {
        const Icon = action.icon || BoltIcon
        return (
          <button
            key={action.id}
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-subtle)] hover:bg-[var(--ak-color-bg-hover)] hover:border-[var(--ak-color-border-strong)] transition-all duration-150 text-[11px] font-medium text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] active:scale-95"
            title={action.label}
          >
            <Icon className="h-3 w-3" />
            <span>{action.label}</span>
          </button>
        )
      })}
    </div>
  )
}
