'use client'

import { useState } from 'react'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import { AIActions } from '@/components/ui/AIActions'
import { QuickActions } from '@/components/ui/QuickActions'
import {
    ArrowLeftIcon,
    ArchiveBoxIcon,
    TrashIcon,
    PaperAirplaneIcon,
    EllipsisHorizontalIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline'

type SelectOption = {
  label: string
  value: string
  disabled?: boolean
}

export type InboxDetailsDrawerProps = {
  threadId: string
  channel: string
  sender: string
  dateShort: string
  statusOptions?: SelectOption[]
  status?: string
  important?: boolean
  assigneeOptions?: SelectOption[]
  assignee?: string
  tags?: string
  customer?: string
  project?: string
  lastSync?: string
  connectionStatus?: 'OK' | 'Problem' | string
  advancedVisible?: boolean
  ids?: Record<string, string | number>
  canSpamControls?: boolean
  state?: 'loading' | 'loaded' | 'error'
  onClose?: () => void
}

export function InboxDetailsDrawer({
  channel,
  sender,
  dateShort,
  onClose,
}: InboxDetailsDrawerProps) {
  const [replyText, setReplyText] = useState('')

  return (
    <div className="flex h-full flex-col bg-[var(--ak-color-bg-app)]">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--ak-color-border-hairline)] bg-[var(--ak-glass-bg)] backdrop-blur-md sticky top-0 z-10">
         <div className="flex items-center gap-2">
             <AkButton variant="ghost" size="sm" onClick={onClose} leftIcon={<ArrowLeftIcon className="h-4 w-4"/>}>Zurück</AkButton>
         </div>
         <div className="flex items-center gap-1">
             <AkButton variant="ghost" size="sm"><ArchiveBoxIcon className="h-4 w-4 text-gray-500"/></AkButton>
             <AkButton variant="ghost" size="sm"><TrashIcon className="h-4 w-4 text-gray-500"/></AkButton>
             <div className="w-px h-4 bg-gray-200 mx-1"></div>
             <AkButton variant="ghost" size="sm"><EllipsisHorizontalIcon className="h-4 w-4 text-gray-500"/></AkButton>
         </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
              {/* Header Info - Apple Style */}
              <div className="apple-card rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)] p-6 shadow-[var(--ak-shadow-sm)]">
                  <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-2 border-white shadow-sm">
                              <UserCircleIcon className="h-10 w-10 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                              <h1 className="ak-heading text-xl mb-1 text-[var(--ak-color-text-primary)]">{sender}</h1>
                              <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">An: <span className="font-medium text-[var(--ak-color-text-primary)]">Support Team</span></p>
                              <div className="flex items-center gap-2 mt-2">
                                  <AkBadge tone="muted" size="sm">{channel}</AkBadge>
                                  <span className="ak-caption text-[var(--ak-color-text-muted)]">•</span>
                                  <span className="ak-caption text-[var(--ak-color-text-muted)]">{dateShort}</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Body - Apple Style */}
              <div className="apple-card rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)] p-6 shadow-[var(--ak-shadow-sm)]">
                  <div className="prose prose-sm max-w-none text-[var(--ak-color-text-primary)] leading-relaxed">
                      <p className="mb-3">Hallo Team,</p>
                      <p className="mb-3">ich wollte nachfragen, ob Sie für morgen Abend (19:00 Uhr) noch einen Tisch für 2 Personen am Fenster frei haben?</p>
                      <p className="mb-3">Es ist unser Jahrestag, daher wäre das sehr schön.</p>
                      <p className="mb-0">Vielen Dank und beste Grüße,<br/><strong>{sender}</strong></p>
                  </div>
              </div>
              
              {/* AI Suggestions & Quick Actions - in der Mitte */}
              <div className="flex flex-col gap-3 px-4 py-3 bg-[var(--ak-color-bg-surface-muted)]/50 rounded-xl border border-[var(--ak-color-border-subtle)]">
                <AIActions context="inbox" />
                <QuickActions context="inbox" />
              </div>

              {/* Quick Stats Widget */}
              <div className="grid grid-cols-3 gap-3">
                  <div className="apple-card rounded-xl border border-[var(--ak-color-border-subtle)] bg-gradient-to-br from-blue-50 to-blue-100/50 p-4">
                      <p className="ak-caption text-blue-600 mb-1 font-semibold">Kanal</p>
                      <p className="ak-body text-sm font-semibold text-blue-900">{channel}</p>
                  </div>
                  <div className="apple-card rounded-xl border border-[var(--ak-color-border-subtle)] bg-gradient-to-br from-purple-50 to-purple-100/50 p-4">
                      <p className="ak-caption text-purple-600 mb-1 font-semibold">Priorität</p>
                      <p className="ak-body text-sm font-semibold text-purple-900">Normal</p>
                  </div>
                  <div className="apple-card rounded-xl border border-[var(--ak-color-border-subtle)] bg-gradient-to-br from-green-50 to-green-100/50 p-4">
                      <p className="ak-caption text-green-600 mb-1 font-semibold">Status</p>
                      <p className="ak-body text-sm font-semibold text-green-900">Offen</p>
                  </div>
              </div>

              {/* Context Card (CRM) - Apple Style */}
              <div className="apple-card rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)] p-5 shadow-[var(--ak-shadow-sm)]">
                  <h4 className="ak-heading text-base mb-4 text-[var(--ak-color-text-primary)]">Kunden-Kontext</h4>
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-lg">
                              MM
                          </div>
                          <div>
                              <p className="ak-body text-base font-semibold text-[var(--ak-color-text-primary)]">Max Mustermann</p>
                              <p className="ak-caption text-sm text-[var(--ak-color-text-secondary)] mt-1">VIP Kunde • 3 Reservierungen • Seit 2023</p>
                          </div>
                      </div>
                      <AkButton size="sm" variant="primary">CRM Profil öffnen</AkButton>
                  </div>
              </div>

              {/* History / Previous Messages - Apple Style */}
              <div className="apple-section rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)] p-5">
                  <h4 className="ak-heading text-base mb-4 text-[var(--ak-color-text-primary)]">Verlauf</h4>
                  <div className="relative pl-8 border-l-2 border-[var(--ak-color-border-subtle)] space-y-4">
                      <div className="relative">
                          <div className="absolute -left-[37px] top-0 h-4 w-4 rounded-full bg-blue-500 ring-4 ring-white shadow-sm"></div>
                          <p className="ak-caption text-[var(--ak-color-text-secondary)] mb-1">Gestern, 10:00 Uhr</p>
                          <p className="ak-body text-sm text-[var(--ak-color-text-primary)]">Automatische Bestätigung gesendet.</p>
                      </div>
                      <div className="relative">
                          <div className="absolute -left-[37px] top-0 h-4 w-4 rounded-full bg-purple-500 ring-4 ring-white shadow-sm"></div>
                          <p className="ak-caption text-[var(--ak-color-text-secondary)] mb-1">Vor 3 Tagen, 14:30 Uhr</p>
                          <p className="ak-body text-sm text-[var(--ak-color-text-primary)]">Anfrage erhalten und bestätigt.</p>
                      </div>
                  </div>
              </div>

          </div>
      </div>

      {/* Reply Area - Apple Style */}
      <div className="p-6 bg-[var(--ak-color-bg-elevated)] border-t border-[var(--ak-color-border-hairline)]">
          <div className="max-w-4xl mx-auto">
              <div className="apple-card rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)] shadow-[var(--ak-shadow-sm)] focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                  <textarea 
                      className="w-full p-4 min-h-[120px] resize-none focus:outline-none rounded-t-2xl text-sm bg-transparent text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-placeholder)]"
                      placeholder="Antwort schreiben..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex items-center justify-between p-3 bg-[var(--ak-color-bg-surface)] rounded-b-2xl border-t border-[var(--ak-color-border-subtle)]">
                      <div className="flex gap-2">
                           <AkButton size="sm" variant="ghost" className="text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]">Vorlagen</AkButton>
                           <AkButton size="sm" variant="ghost" className="text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]">KI-Entwurf</AkButton>
                      </div>
                      <AkButton 
                        size="sm" 
                        variant="primary" 
                        leftIcon={<PaperAirplaneIcon className="h-4 w-4" />}
                        onClick={() => {
                            setReplyText('')
                            // Mock send
                        }}
                        className="apple-button-primary"
                      >
                          Senden
                      </AkButton>
                  </div>
              </div>
          </div>
      </div>
    </div>
  )
}
