'use client'

import { useState } from 'react'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import { AIActions } from '@/components/ui/AIActions'
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
          <div className="max-w-3xl mx-auto">
              {/* AI Actions */}
              <div className="mb-6">
                <AIActions context="inbox" />
              </div>
              
              {/* Header Info */}
              <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                          <UserCircleIcon className="h-8 w-8" />
                      </div>
                      <div>
                          <h1 className="text-xl font-bold text-[var(--ak-color-text-primary)]">{sender}</h1>
                          <p className="text-sm text-[var(--ak-color-text-secondary)]">An: <span className="text-gray-700">Support Team</span></p>
                      </div>
                  </div>
                  <div className="text-right">
                      <p className="text-sm text-gray-500">{dateShort}</p>
                      <AkBadge tone="neutral" size="sm" className="mt-1">{channel}</AkBadge>
                  </div>
              </div>

              {/* Body */}
              <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed mb-8">
                  <p>Hallo Team,</p>
                  <p>ich wollte nachfragen, ob Sie für morgen Abend (19:00 Uhr) noch einen Tisch für 2 Personen am Fenster frei haben?</p>
                  <p>Es ist unser Jahrestag, daher wäre das sehr schön.</p>
                  <p>Vielen Dank und beste Grüße,<br/>{sender}</p>
              </div>

              {/* Context Card (CRM) */}
              <div className="bg-[var(--ak-color-bg-surface)] rounded-xl border border-[var(--ak-color-border-subtle)] p-4 mb-8 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-100">
                          MM
                      </div>
                      <div>
                          <p className="text-sm font-medium text-gray-900">Max Mustermann</p>
                          <p className="text-xs text-gray-500">VIP Kunde • 3 Reservierungen</p>
                      </div>
                  </div>
                  <AkButton size="sm" variant="secondary">CRM Profil</AkButton>
              </div>

              {/* History / Previous Messages (Mock) */}
              <div className="relative pl-8 border-l-2 border-gray-100 space-y-6 mb-8">
                  <div className="relative">
                      <div className="absolute -left-[37px] top-0 h-4 w-4 rounded-full bg-gray-200 ring-4 ring-white"></div>
                      <p className="text-xs text-gray-400 mb-1">Gestern, 10:00 Uhr</p>
                      <p className="text-sm text-gray-600">Automatische Bestätigung gesendet.</p>
                  </div>
              </div>

          </div>
      </div>

      {/* Reply Area */}
      <div className="p-4 bg-white border-t border-[var(--ak-color-border-hairline)]">
          <div className="max-w-3xl mx-auto">
              <div className="relative rounded-xl border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all bg-white">
                  <textarea 
                      className="w-full p-3 min-h-[100px] resize-none focus:outline-none rounded-t-xl text-sm"
                      placeholder="Antwort schreiben..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-b-xl border-t border-gray-100">
                      <div className="flex gap-2">
                           <AkButton size="sm" variant="ghost">Vorlagen</AkButton>
                           <AkButton size="sm" variant="ghost">KI-Entwurf</AkButton>
                      </div>
                      <AkButton 
                        size="sm" 
                        variant="primary" 
                        leftIcon={<PaperAirplaneIcon className="h-3 w-3" />}
                        onClick={() => {
                            setReplyText('')
                            // Mock send
                        }}
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
