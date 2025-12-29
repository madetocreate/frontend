'use client'

import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { EmailCard } from './EmailCard'
import { ChatThreadCard } from './ChatThreadCard'
import { BotDeck } from '@/components/bots/BotDeck'
import { fetchInboxItem, fetchChatThread, type EmailData, type ChatThreadData } from '@/lib/contextDataService'
import { dispatchClearContext, dispatchPrefillChat, dispatchFocusChat } from '@/lib/events/dispatch'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { CardShell, CardHeader, CardBody, CardFooter } from '@/components/ui/CardShell'
import { AkButton } from '@/components/ui/AkButton'
import { XMarkIcon, DocumentTextIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'

interface ContextCardRendererProps {
  className?: string
}

interface ActiveContext {
  type: string
  id: string
  item: any
}

export function ContextCardRenderer({ className }: ContextCardRendererProps) {
  const [activeContext, setActiveContext] = useState<ActiveContext | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resolvedData, setResolvedData] = useState<EmailData | ChatThreadData | null>(null)

  // Listen for context card events
  useEffect(() => {
    const handleShowContextCard = (event: CustomEvent<{ type: string; item: any; id: string }>) => {
      const { type, item, id } = event.detail
      setActiveContext({ type, id, item })
      setLoading(true)
      setError(null)
      setResolvedData(null)
    }

    const handleClearContext = () => {
      setActiveContext(null)
      setLoading(false)
      setError(null)
      setResolvedData(null)
    }

    window.addEventListener('aklow-show-context-card', handleShowContextCard as EventListener)
    window.addEventListener('aklow-clear-context', handleClearContext)

    return () => {
      window.removeEventListener('aklow-show-context-card', handleShowContextCard as EventListener)
      window.removeEventListener('aklow-clear-context', handleClearContext)
    }
  }, [])

  // Load data when context changes
  useEffect(() => {
    if (!activeContext) return

    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        if (activeContext.type === 'inbox') {
          const data = await fetchInboxItem(activeContext.id)
          if (data) {
            setResolvedData(data)
          } else {
            setError('Konnte E-Mail nicht laden')
          }
        } else if (activeContext.type === 'bot') {
          // Bot context is handled by BotDeck component
          setLoading(false)
          return
        } else if (activeContext.type === 'document' && (activeContext.item === 'overview' || activeContext.id === 'overview')) {
          // Document Overview
          setLoading(false)
          return
        } else {
          // For other types (customer, growth), we'll show a placeholder for now
          // For document items, we might need fetching later
          setLoading(false)
        }
      } catch (err) {
        console.error('[ContextCardRenderer] Error loading context data:', err)
        setError('Fehler beim Laden der Daten')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [activeContext])

  // Handle close
  const handleClose = () => {
    dispatchClearContext()
  }

  // Handle action (for EmailCard)
  const handleAction = (prompt: string) => {
    dispatchPrefillChat(prompt, 'inbox')
    dispatchFocusChat()
  }

  // Render nothing if no context
  if (!activeContext) {
    return null
  }

  // Render loading state
  if (loading && activeContext.type === 'inbox') {
    return (
      <div className={className}>
        <SkeletonCard />
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className={className}>
        <CardShell>
          <CardHeader
            title="Fehler"
            actions={
              <button
                onClick={handleClose}
                className="p-1.5 text-[var(--ak-color-text-tertiary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] rounded-md transition-colors"
                title="Schließen"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            }
          />
          <CardBody>
            <p className="text-sm text-[var(--ak-color-text-secondary)]">{error}</p>
          </CardBody>
          <CardFooter>
            <AkButton
              variant="primary"
              onClick={() => {
                setError(null)
                setLoading(true)
                // Retry loading
                if (activeContext?.type === 'inbox') {
                  fetchInboxItem(activeContext.id).then((data) => {
                    if (data) {
                      setResolvedData(data)
                      setError(null)
                    } else {
                      setError('Konnte E-Mail nicht laden')
                    }
                    setLoading(false)
                  }).catch(() => {
                    setError('Fehler beim Laden der Daten')
                    setLoading(false)
                  })
                }
              }}
              size="sm"
            >
              Erneut versuchen
            </AkButton>
          </CardFooter>
        </CardShell>
      </div>
    )
  }

  // Render based on context type
  if (activeContext.type === 'inbox' && resolvedData) {
    // Check if it's an email or chat thread
    if ('from' in resolvedData && 'subject' in resolvedData) {
      // It's an EmailData
      const emailData = resolvedData as EmailData
      return (
        <div key={emailData.id} className={clsx(className, "ak-animate-card-in")}>
          <EmailCard
            id={emailData.id}
            from={emailData.from}
            fromEmail={emailData.fromEmail}
            to={emailData.to}
            subject={emailData.subject}
            date={emailData.date}
            preview={emailData.preview}
            body={emailData.body}
            attachments={emailData.attachments}
            onClose={handleClose}
            onAction={handleAction}
          />
        </div>
      )
    } else if ('contactName' in resolvedData && 'platform' in resolvedData) {
      // It's a ChatThreadData
      const chatData = resolvedData as ChatThreadData
      return (
        <div key={chatData.id} className={clsx(className, "ak-animate-card-in")}>
          <ChatThreadCard
            id={chatData.id}
            contactName={chatData.contactName}
            contactAvatar={chatData.contactAvatar}
            platform={chatData.platform}
            messages={chatData.messages}
            lastActivity={chatData.lastActivity}
            onClose={handleClose}
            onAction={handleAction}
          />
        </div>
      )
    }
  }

  // Bot context - render BotDeck
  if (activeContext.type === 'bot' && activeContext.item) {
    return (
      <div key={activeContext.id} className={clsx(className, "ak-animate-card-in")}>
        <BotDeck
          module={activeContext.item.module as 'website_bot' | 'telephony_bot' | 'review_bot'}
          view={activeContext.item.view || 'overview'}
          onClose={handleClose}
        />
      </div>
    )
  }

  // Document Overview Context
  if (activeContext.type === 'document' && (activeContext.item === 'overview' || activeContext.id === 'overview')) {
    return (
      <div key="document-overview" className={clsx(className, "ak-animate-card-in")}>
        <CardShell>
          <CardHeader
            title="Dokumente"
            subtitle="Übersicht & Upload"
            actions={
              <button
                onClick={handleClose}
                className="p-1.5 text-[var(--ak-color-text-tertiary)] hover:ak-item-hover rounded-md transition-colors"
                title="Schließen"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            }
          />
          <CardBody>
            <div className="flex flex-col gap-6">
              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-black/5 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-black/5 hover:border-black/10 transition-all cursor-pointer group active:scale-[0.99]">
                <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ArrowUpTrayIcon className="w-6 h-6 text-[var(--ak-color-text-primary)]" />
                </div>
                <p className="text-sm font-medium text-[var(--ak-color-text-primary)]">
                  Datei hier ablegen oder klicken
                </p>
                <p className="text-xs text-[var(--ak-color-text-tertiary)] mt-1">
                  PDF, DOCX, TXT bis 10MB
                </p>
              </div>

              {/* Recent Docs */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ak-color-text-tertiary)] opacity-60 mb-3">
                  Zuletzt bearbeitet
                </h4>
                <div className="space-y-1">
                  {[
                    { title: 'Preisliste_2024.pdf', date: 'Vor 2h', size: '1.2 MB' },
                    { title: 'Vertrag_Muster.docx', date: 'Gestern', size: '450 KB' },
                    { title: 'Meeting_Notes.txt', date: 'Vor 3 Tagen', size: '12 KB' },
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:ak-item-hover transition-all cursor-pointer group active:scale-[0.98]">
                      <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-[var(--ak-color-text-tertiary)] group-hover:text-[var(--ak-color-text-primary)]">
                        <DocumentTextIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--ak-color-text-primary)] truncate">
                          {doc.title}
                        </p>
                        <p className="text-[11px] text-[var(--ak-color-text-tertiary)]">
                          {doc.date} • {doc.size}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardBody>
        </CardShell>
      </div>
    )
  }

  // Placeholder for other types
  return (
    <div className={className}>
      <CardShell>
        <CardHeader
          title="Kontext"
          subtitle={activeContext.type}
          actions={
            <button
              onClick={handleClose}
              className="p-1.5 text-[var(--ak-color-text-tertiary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] rounded-md transition-colors"
              title="Schließen"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          }
        />
        <CardBody>
          <p className="text-sm text-[var(--ak-color-text-secondary)]">
            Noch nicht implementiert
          </p>
        </CardBody>
      </CardShell>
    </div>
  )
}
