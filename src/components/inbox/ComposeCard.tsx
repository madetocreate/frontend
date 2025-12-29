'use client'

import { useState, useEffect } from 'react'
import { 
  PaperAirplaneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  UserIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  LinkIcon
} from '@heroicons/react/24/outline'
import { AkButton } from '@/components/ui/AkButton'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid'
import clsx from 'clsx'
import { toast } from 'sonner'
import { getIntegrationsStatus, sendInboxMessage, type IntegrationsStatus, type IntegrationIdentity } from '@/features/inbox/api'

type ComposeChannel = 'email' | 'messenger' | 'review' | 'support'

export interface ComposeContext {
  recipient?: string
  subject?: string
  threadId?: string
  inboxItemId?: string
  reviewId?: string
  channel?: ComposeChannel
  body?: string
}

interface ComposeCardProps {
  initialContext?: ComposeContext
  onClose: () => void
  onSuccess?: () => void
}

export function ComposeCard({ initialContext, onClose, onSuccess }: ComposeCardProps) {
  const [channel, setChannel] = useState<ComposeChannel>(initialContext?.channel || 'email')
  const [recipient, setRecipient] = useState(initialContext?.recipient || '')
  const [subject, setSubject] = useState(initialContext?.subject || '')
  const [message, setMessage] = useState(initialContext?.body || '')
  
  // Integrations State
  const [integrations, setIntegrations] = useState<IntegrationsStatus | null>(null)
  const [loadingIntegrations, setLoadingIntegrations] = useState(false)
  const [selectedIdentity, setSelectedIdentity] = useState<IntegrationIdentity | null>(null)
  
  // UI State
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isIdentityDropdownOpen, setIsIdentityDropdownOpen] = useState(false)

  // Load Integrations
  useEffect(() => {
    async function load() {
      setLoadingIntegrations(true)
      try {
        const status = await getIntegrationsStatus()
        setIntegrations(status)
      } catch (err) {
        console.error('Failed to load integrations', err)
        // Silent fail or toast? Toast for now.
        toast.error('Verbindungen konnten nicht geladen werden')
      } finally {
        setLoadingIntegrations(false)
      }
    }
    load()
  }, [])

  // Auto-select identity when channel changes or integrations load
  useEffect(() => {
    if (!integrations) return

    const available = getAvailableIdentities(channel, integrations)
    if (available.length > 0) {
      // Prefer primary or first
      const best = available.find(i => i.type === 'primary') || available[0]
      setSelectedIdentity(best)
    } else {
      setSelectedIdentity(null)
    }
  }, [channel, integrations])

  const getAvailableIdentities = (ch: ComposeChannel, status: IntegrationsStatus) => {
    switch(ch) {
      case 'email': return status.email;
      case 'messenger': return status.messenger;
      case 'review': return status.review;
      case 'support': return status.support;
      default: return [];
    }
  }

  const handleSend = async () => {
    if (!recipient.trim() || !message.trim()) return
    if (channel === 'email' && !subject.trim()) return
    
    setIsSending(true)
    setError(null)

    try {
      await sendInboxMessage({
        channel,
        to: recipient.trim(),
        subject: channel === 'email' ? subject.trim() : undefined,
        body: message.trim(),
        connectionId: selectedIdentity?.id,
        identity: selectedIdentity ? { provider: selectedIdentity.provider, from: selectedIdentity.fromAddress } : undefined,
        threadId: initialContext?.threadId,
        inboxItemId: initialContext?.inboxItemId,
        reviewId: initialContext?.reviewId
      })

      toast.success('Nachricht gesendet!')
      onSuccess?.()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Fehler beim Senden')
      toast.error('Senden fehlgeschlagen')
    } finally {
      setIsSending(false)
    }
  }

  const handleSuggestionSelect = (suggestion: { label: string; description?: string; id?: string }) => {
    const suggestionText = suggestion.description || suggestion.label
    setMessage(suggestionText)
  }

  const availableIdentities = integrations ? getAvailableIdentities(channel, integrations) : []
  const canSend = selectedIdentity && recipient.trim() && message.trim() && (channel !== 'email' || subject.trim())

  return (
    <div className="mx-auto max-w-3xl w-full">
      <WidgetCard
        title={initialContext?.inboxItemId ? "Antwort verfassen" : "Neue Nachricht"}
        subtitle="Wähle Kanal und Identität"
        actions={
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--ak-color-bg-hover)] transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-[var(--ak-color-text-muted)]" />
          </button>
        }
        padding="lg"
      >
        <div className="space-y-6">
          {/* Header Controls: Channel & Identity */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Kanal-Auswahl */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-[var(--ak-color-text-secondary)] mb-1.5 uppercase tracking-wider">
                Kanal
              </label>
              <div className="flex gap-1 p-1 bg-[var(--ak-color-bg-surface-muted)] rounded-lg border border-[var(--ak-color-border-subtle)]">
                {(['email', 'messenger'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setChannel(c)}
                    className={clsx(
                      "flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-sm font-medium transition-all",
                      channel === c
                        ? "bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] shadow-sm border border-[var(--ak-color-border-subtle)]"
                        : "text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-surface-hover)]"
                    )}
                  >
                    {c === 'email' ? <EnvelopeIcon className="h-4 w-4" /> : <ChatBubbleLeftRightIcon className="h-4 w-4" />}
                    <span className="capitalize">{c}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Identität / Account Picker */}
            <div className="flex-1 relative">
               <label className="block text-xs font-medium text-[var(--ak-color-text-secondary)] mb-1.5 uppercase tracking-wider">
                Senden als
              </label>
              
              {loadingIntegrations ? (
                 <div className="h-[38px] w-full bg-[var(--ak-color-bg-surface-muted)] animate-pulse rounded-lg border border-[var(--ak-color-border-subtle)]" />
              ) : availableIdentities.length > 0 ? (
                <div className="relative">
                  <button
                    onClick={() => setIsIdentityDropdownOpen(!isIdentityDropdownOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] hover:border-[var(--ak-color-border-default)] transition-colors text-sm"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                       <div className={`w-2 h-2 rounded-full ${selectedIdentity?.connected ? 'bg-[var(--ak-semantic-success)]' : 'bg-[var(--ak-semantic-danger)]'}`} />
                       <span className="truncate">{selectedIdentity?.label || 'Wähle Account...'}</span>
                    </div>
                    <ChevronDownIcon className="h-4 w-4 text-[var(--ak-color-text-muted)] flex-shrink-0" />
                  </button>
                  
                  {isIdentityDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-default)] rounded-lg shadow-lg overflow-hidden py-1 max-h-48 overflow-y-auto">
                      {availableIdentities.map((identity) => (
                        <button
                          key={identity.id}
                          onClick={() => {
                            setSelectedIdentity(identity)
                            setIsIdentityDropdownOpen(false)
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-[var(--ak-color-bg-surface-hover)] flex items-center gap-2 text-sm"
                        >
                          <div className={`w-2 h-2 rounded-full ${identity.connected ? 'bg-[var(--ak-semantic-success)]' : 'bg-[var(--ak-semantic-danger)]'}`} />
                          <div className="flex flex-col">
                            <span className="text-[var(--ak-color-text-primary)] font-medium">{identity.label}</span>
                            {identity.fromAddress && identity.fromAddress !== identity.label && (
                                <span className="text-[var(--ak-color-text-muted)] text-xs">{identity.fromAddress}</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--ak-semantic-warning)]/20 bg-[var(--ak-semantic-warning-soft)] text-[var(--ak-semantic-warning)] text-sm">
                   <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
                   <span className="truncate text-xs">Kein Account verbunden</span>
                   <a href="/settings/integrations" className="ml-auto text-[var(--ak-semantic-warning)] hover:text-[var(--ak-semantic-warning)] underline text-xs whitespace-nowrap">
                     Hub
                   </a>
                </div>
              )}
            </div>
          </div>

          {/* Empfänger */}
          <div>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={channel === 'email' 
                ? 'Empfänger (name@example.com)' 
                : 'Empfänger (Name oder Nummer)'}
              className="w-full px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)] transition-all text-sm font-medium"
            />
          </div>

          {/* Betreff (nur bei E-Mail) */}
          {channel === 'email' && (
            <div>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Betreff"
                className="w-full px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)] transition-all text-sm font-medium"
              />
            </div>
          )}

          {/* Nachricht */}
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={channel === 'email' 
                ? 'Schreibe deine Nachricht...' 
                : 'Schnelle Nachricht...'}
              rows={channel === 'email' ? 10 : 6}
              autoFocus
              className="w-full p-4 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)] transition-all resize-y text-base leading-relaxed font-sans"
            />
          </div>

          {/* Fehleranzeige */}
          {error && (
            <div className="px-3 py-2 rounded-lg bg-[var(--ak-color-bg-danger-soft)] text-[var(--ak-color-danger-strong)] text-sm flex items-center gap-2">
              <ExclamationTriangleIcon className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* KI-Vorschläge (nur wenn leer) */}
          {message.length === 0 && !initialContext?.body && (
            <div>
              <AISuggestionGrid
                context="inbox"
                summary={channel === 'email' ? 'E-Mail verfassen' : 'Messenger-Nachricht'}
                text={recipient ? `Nachricht an ${recipient}` : 'Neue Nachricht verfassen'}
                channel={channel}
                onActionSelect={handleSuggestionSelect}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--ak-color-border-subtle)]">
            <div className="text-xs text-[var(--ak-color-text-muted)]">
                {availableIdentities.length === 0 && (
                     <span className="flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" />
                        <a href="/settings/integrations" className="hover:underline">Integration Hub öffnen</a>
                     </span>
                )}
            </div>
            <div className="flex gap-3">
                <AkButton
                  variant="secondary"
                  onClick={onClose}
                  disabled={isSending}
                >
                  Abbrechen
                </AkButton>
                <AkButton
                  variant="primary"
                  accent="graphite"
                  leftIcon={isSending ? undefined : <PaperAirplaneIcon className="h-4 w-4" />}
                  onClick={handleSend}
                  loading={isSending}
                  disabled={!canSend || isSending}
                >
                  {isSending ? 'Sende...' : 'Senden'}
                </AkButton>
            </div>
          </div>
        </div>
      </WidgetCard>
    </div>
  )
}
