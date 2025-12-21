'use client'

import React, { useState } from 'react'
import { AkDrawerScaffold } from '@/components/ui/AkDrawerScaffold'
import { InspectorHeader } from '@/components/ui/drawer-kit/InspectorHeader'
import { DrawerTabItem } from '@/components/ui/drawer-kit/DrawerTabs'
import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid'
import { DrawerSectionTitle } from '@/components/ui/drawer-kit'
import { AkBadge } from '@/components/ui/AkBadge'
import { 
  InboxIcon, 
  ChevronRightIcon, 
  PaperAirplaneIcon, 
  TagIcon, 
  SparklesIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

type SelectOption = {
  label: string
  value: string
  disabled?: boolean
}

export type InboxDetailsDrawerProps = {
  threadId: string | null
  channel?: string
  sender?: string
  dateShort?: string
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
  onExpand?: () => void
  isExpanded?: boolean
  onAction?: (action: string) => void
}

export function InboxDetailsDrawerV2({
  threadId,
  channel = 'email',
  sender = '',
  dateShort = '',
  onClose,
  onExpand,
  isExpanded,
  onAction
}: InboxDetailsDrawerProps) {
  const [isComposerFocused, setIsComposerFocused] = useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const [activeTab, setActiveTab] = useState('details')
  const [replyText, setReplyText] = useState('')

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [replyText])

  const tabs: DrawerTabItem[] = [
    { id: 'details', label: 'Details' },
    { id: 'verlauf', label: 'Verlauf' }
  ]

  // ------------------------------------------------------------------
  // LIST VIEW (Kein Thread gewählt)
  // ------------------------------------------------------------------
  if (!threadId) {
    return (
      <AkDrawerScaffold
        header={
          <InspectorHeader
            icon={InboxIcon}
            title="Posteingang"
            subtitle="Nachrichten & Tickets"
            onClose={onClose!}
            onExpand={onExpand}
            isExpanded={isExpanded}
            actions={<AkBadge tone="info" size="sm">12 Neu</AkBadge>}
          />
        }
        title={null} // Bypassed by header prop
      >
        <div className="p-4 space-y-6">
           <DrawerSectionTitle>Wichtige Nachrichten</DrawerSectionTitle>
           <div className="space-y-1">
              {[
                { id: '1', sender: 'Max Mustermann', subject: 'Tischreservierung Anfrage', time: '10:30', channel: 'email' },
                { id: '2', sender: 'Sarah Design', subject: 'Neues Logo Entwurf', time: '09:15', channel: 'email' },
                { id: '3', sender: '+49 123 45678', subject: 'Rückruf bitte', time: 'Gestern', channel: 'phone' },
                { id: '4', sender: 'Web Lead', subject: 'Interesse an Produkt X', time: 'Gestern', channel: 'chat' },
              ].map(msg => (
                  <button 
                      key={msg.id}
                      onClick={() => onAction?.('select')} 
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--ak-color-bg-hover)] transition-all text-left group"
                  >
                      <div className={clsx(
                          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold border border-[var(--ak-color-border-hairline)] group-hover:border-[var(--ak-color-border-subtle)]",
                          msg.channel === 'email' ? "bg-blue-50 text-blue-600" :
                          msg.channel === 'phone' ? "bg-purple-50 text-purple-600" :
                          "bg-cyan-50 text-cyan-600"
                      )}>
                          {msg.sender.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                              <p className="text-sm font-medium text-[var(--ak-color-text-primary)] truncate">{msg.sender}</p>
                              <span className="text-[10px] text-[var(--ak-color-text-muted)]">{msg.time}</span>
                          </div>
                          <p className="text-xs text-[var(--ak-color-text-secondary)] truncate flex items-center gap-1.5">
                            {msg.channel === 'email' && <EnvelopeIcon className="w-3 h-3" />}
                            {msg.channel === 'phone' && <PhoneIcon className="w-3 h-3" />}
                            {msg.channel === 'chat' && <ChatBubbleLeftRightIcon className="w-3 h-3" />}
                            {msg.subject}
                          </p>
                      </div>
                      <ChevronRightIcon className="w-4 h-4 text-[var(--ak-color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                  </button>
              ))}
           </div>
        </div>
      </AkDrawerScaffold>
    )
  }

  // ------------------------------------------------------------------
  // DETAIL VIEW
  // ------------------------------------------------------------------
  
  // Icon based on channel
  const ChannelIcon = channel === 'email' ? EnvelopeIcon : channel === 'chat' ? ChatBubbleLeftRightIcon : PhoneIcon

  // ------------------------------------------------------------------
  // COMPOSER (Footer)
  // ------------------------------------------------------------------
  const showComposer = activeTab === 'details'
  const isComposerExpanded = isComposerFocused || replyText.length > 0

  const composer = (
    <div className="p-4 bg-[var(--ak-color-bg-surface)]/80 backdrop-blur-md border-t border-[var(--ak-color-border-subtle)]">
        <div 
            className={clsx(
                "relative rounded-xl border bg-[var(--ak-color-bg-surface)] shadow-sm transition-all overflow-hidden group",
                isComposerFocused ? "border-[var(--ak-color-accent)] ring-1 ring-[var(--ak-color-accent)]" : "border-[var(--ak-color-border-subtle)]"
            )}
        >
            <textarea 
                ref={textareaRef}
                className={clsx(
                    "w-full px-4 py-3 resize-none focus:outline-none text-sm bg-transparent text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)]",
                    isComposerExpanded ? "min-h-[80px]" : "min-h-[44px] h-[44px]"
                )}
                placeholder="Antworten..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onFocus={() => setIsComposerFocused(true)}
                onBlur={() => setIsComposerFocused(false)}
                rows={1}
            />
            
            {/* Toolbar - Only visible when expanded */}
            {isComposerExpanded && (
                <div className="flex items-center justify-between p-2 pl-3 bg-[var(--ak-color-bg-surface-muted)]/30 border-t border-[var(--ak-color-border-subtle)] animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-secondary)] transition-colors" title="Anhang">
                            <TagIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-secondary)] transition-colors" title="Vorlage">
                            <SparklesIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <button 
                        onClick={() => {
                            setReplyText('')
                            setIsComposerFocused(false)
                        }}
                        disabled={!replyText.trim()}
                        className={clsx(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                            replyText.trim() 
                                ? "bg-[var(--ak-color-accent)] text-white hover:bg-[var(--ak-color-accent)]/90 shadow-sm" 
                                : "bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-muted)] cursor-not-allowed"
                        )}
                    >
                        <PaperAirplaneIcon className="w-3.5 h-3.5" />
                        Senden
                    </button>
                </div>
            )}
        </div>
        {!isComposerExpanded && (
            <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--ak-color-text-muted)] px-1">
                <span>Drücke <strong>Enter</strong> zum Senden</span>
                <span className="flex items-center gap-1"><SparklesIcon className="w-3 h-3" /> AI-Draft verfügbar</span>
            </div>
        )}
    </div>
  )

  return (
    <AkDrawerScaffold
      header={
        <InspectorHeader
          icon={ChannelIcon}
          title={sender}
          subtitle={`${channel} • ${dateShort}`}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClose={onClose!}
          onExpand={onExpand}
          isExpanded={isExpanded}
          actions={
            <div className="flex items-center gap-2">
               <AkBadge tone="muted" size="sm">Offen</AkBadge>
            </div>
          }
        />
      }
      title={null}
      footer={showComposer ? composer : null}
    >
      <div className="flex flex-col min-h-full">
        {activeTab === 'details' && (
          <div className="flex-1 p-6 pb-2">
                {/* CRM Context Preview */}
                <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] flex items-center gap-4 mb-6 hover:border-[var(--ak-color-border-strong)] transition-colors group cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center text-[var(--ak-color-text-secondary)] font-bold group-hover:bg-[var(--ak-color-bg-hover)] transition-colors">
                        {sender.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[var(--ak-color-text-primary)] text-sm mb-0.5">{sender}</h4>
                        <div className="flex items-center gap-2 text-xs text-[var(--ak-color-text-muted)]">
                            <AkBadge tone="info" size="sm">VIP</AkBadge>
                            <span>Stammkunde • ID: 12345</span>
                        </div>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-[var(--ak-color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>

                <div className="bg-[var(--ak-color-bg-surface)] rounded-xl border border-[var(--ak-color-border-subtle)] p-5 shadow-sm mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-[var(--ak-color-text-primary)]">Anfrage</h3>
                        <span className="text-xs text-[var(--ak-color-text-muted)]">{dateShort}</span>
                    </div>
                    <div className="prose prose-sm max-w-none text-[var(--ak-color-text-secondary)] leading-relaxed text-sm">
                        <p className="mb-4">Hallo Team,</p>
                        <p className="mb-4">ich wollte nachfragen, ob Sie für morgen Abend (19:00 Uhr) noch einen Tisch für 2 Personen am Fenster frei haben?</p>
                        <p className="mb-0">Vielen Dank und beste Grüße,<br/><strong className="text-[var(--ak-color-text-primary)]">{sender}</strong></p>
                    </div>
                </div>

                {/* AI Suggestions */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <SparklesIcon className="w-4 h-4 text-[var(--ak-color-accent)]" />
                        <h4 className="text-xs font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider">KI-Vorschläge</h4>
                    </div>
                    <AISuggestionGrid
                        context="inbox"
                        summary={`${sender || 'Nachricht'} (${channel})`}
                        text="Tischreservierung Anfrage für 19:00 Uhr, 2 Personen am Fenster."
                        channel={channel}
                        onActionSelect={async (action) => {
                            if (action.id === 'reply' || action.id === 'suggest-followup') {
                                // "Direct output" simulation
                                setReplyText('Generiere Antwortvorschlag...')
                                setIsComposerFocused(true)
                                try {
                                    // Use a simulated response to avoid backend 500 errors in dev environment
                                    await new Promise(resolve => setTimeout(resolve, 1500));
                                    const mockResponse = `Hallo ${sender || 'Max'},\n\nvielen Dank für Ihre Anfrage. Gerne bestätige ich Ihnen die Reservierung für morgen Abend um 19:00 Uhr für 2 Personen am Fenster.\n\nWir freuen uns auf Ihren Besuch!\n\nMit freundlichen Grüßen,\nIhr Team`;
                                    setReplyText(mockResponse)
                                } catch (e) {
                                    setReplyText('Fehler beim Generieren: ' + (e as Error).message)
                                }
                            } else {
                                // "Show in Chat" for other actions
                                if (typeof window !== 'undefined') {
                                    window.dispatchEvent(
                                        new CustomEvent('aklow-open-module', { detail: { module: 'chat' } })
                                    )
                                    // Send the prompt to the chat
                                    setTimeout(() => {
                                        // TODO: We might want to pre-fill the chat input or send it directly
                                        // For now just switching module is a start
                                    }, 100)
                                }
                            }
                        }}
                    />
                </div>
            </div>
        )}

        {activeTab === 'verlauf' && (
           <div className="p-6 flex-1">
             <div className="relative pl-4 space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--ak-color-border-subtle)]">
                <div className="relative flex gap-4">
                  <div className="absolute -left-[5px] w-3 h-3 rounded-full bg-[var(--ak-color-accent)] ring-4 ring-[var(--ak-color-bg-app)]" />
                  <div className="flex-1 -mt-1.5">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-[var(--ak-color-text-primary)]">E-Mail empfangen</span>
                      <span className="text-[10px] font-medium text-[var(--ak-color-text-muted)]">Vor 10 Min</span>
                    </div>
                    <p className="text-xs text-[var(--ak-color-text-secondary)] mt-0.5">Automatisch getaggt als &quot;Reservierung&quot;</p>
                  </div>
                </div>
            </div>
           </div>
        )}
      </div>
    </AkDrawerScaffold>
  )
}
