'use client'

import { useEffect, useState } from 'react'
import { 
  EnvelopeIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  PaperClipIcon,
  ClockIcon,
  UserCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { CardShell, CardHeader, CardBody, CardFooter } from '@/components/ui/CardShell'
import { AkButton } from '@/components/ui/AkButton'
import { ActionBar } from '@/components/actions/ActionBar'

interface EmailCardProps {
  id: string
  from: string
  fromEmail?: string
  to?: string
  subject: string
  date: string
  preview: string
  body?: string
  attachments?: { name: string; size: string }[]
  isExpanded?: boolean
  onClose?: () => void
  onAction?: (action: string) => void
}

export function EmailCard({
  id,
  from,
  fromEmail,
  to,
  subject,
  date,
  preview,
  body,
  attachments = [],
  isExpanded: initialExpanded = false,
  onClose,
  onAction,
}: EmailCardProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded)

  useEffect(() => {
    setIsExpanded(initialExpanded)
  }, [initialExpanded])

  const fullBody = body || preview

  return (
    <CardShell className="w-full">
      <CardHeader
          icon={<EnvelopeIcon className="w-5 h-5" style={{ color: 'var(--ak-text-primary-dark)' }} />}
          title="E-Mail Nachricht"
          actions={
            <>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-[var(--ak-color-text-tertiary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] rounded-md transition-colors"
                title={isExpanded ? 'Einklappen' : 'Erweitern'}
              >
                {isExpanded ? (
                  <ChevronUpIcon className="w-4 h-4" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4" />
                )}
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 text-[var(--ak-color-text-tertiary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] rounded-md transition-colors"
                  title="Schließen"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </>
          }
        />

        {/* Email Meta */}
        <CardBody padding="sm" className="border-b border-[var(--ak-color-border-subtle)]">
          <div className="space-y-2">
            {/* From */}
            <div className="flex items-center gap-2">
              <UserCircleIcon className="w-4 h-4 text-[var(--ak-color-text-tertiary)] flex-shrink-0" />
              <span className="text-[11px] text-[var(--ak-color-text-tertiary)] w-12 uppercase font-medium">Von:</span>
              <span className="text-sm font-semibold text-[var(--ak-color-text-primary)]">{from}</span>
              {fromEmail && (
                <span className="text-xs text-[var(--ak-color-text-tertiary)] font-normal">&lt;{fromEmail}&gt;</span>
              )}
            </div>
            
            {/* To */}
            {to && (
              <div className="flex items-center gap-2">
                <UserCircleIcon className="w-4 h-4 text-[var(--ak-color-text-tertiary)] flex-shrink-0" />
                <span className="text-[11px] text-[var(--ak-color-text-tertiary)] w-12 uppercase font-medium">An:</span>
                <span className="text-sm text-[var(--ak-color-text-secondary)]">{to}</span>
              </div>
            )}
            
            {/* Subject */}
            <div className="flex items-start gap-2">
              <EnvelopeIcon className="w-4 h-4 text-[var(--ak-color-text-tertiary)] flex-shrink-0 mt-0.5" />
              <span className="text-[11px] text-[var(--ak-color-text-tertiary)] w-12 uppercase font-medium">Betreff:</span>
              <span className="text-sm font-bold text-[var(--ak-color-text-primary)] leading-tight">{subject}</span>
            </div>
            
            {/* Date */}
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-[var(--ak-color-text-tertiary)] flex-shrink-0" />
              <span className="text-[11px] text-[var(--ak-color-text-tertiary)] w-12 uppercase font-medium">Datum:</span>
              <span className="text-xs text-[var(--ak-color-text-tertiary)] font-medium">{date}</span>
            </div>
          </div>
        </CardBody>

        {/* Email Body */}
        <CardBody>
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="prose prose-sm max-w-none"
              >
                <div className="text-sm text-[var(--ak-color-text-primary)] leading-relaxed whitespace-pre-wrap font-normal">
                  {fullBody}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-sm text-[var(--ak-color-text-secondary)] line-clamp-3 leading-relaxed">
                  {preview}
                </p>
                {fullBody.length > preview.length && (
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="mt-3 text-xs font-bold text-[var(--ak-accent-inbox)] hover:brightness-110 underline underline-offset-4 decoration-[var(--ak-accent-inbox-soft)]"
                  >
                    Vollständige E-Mail lesen...
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--ak-color-border-subtle)]">
              <div className="flex items-center gap-2 mb-2">
                <PaperClipIcon className="w-4 h-4 text-[var(--ak-color-text-tertiary)]" />
                <span className="text-[11px] font-bold text-[var(--ak-color-text-tertiary)] uppercase">
                  {attachments.length} Anhang{attachments.length > 1 ? 'e' : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={`${attachment.name}-${attachment.size}-${index}`}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[var(--ak-color-bg-surface-muted)] rounded-xl border border-[var(--ak-color-border-subtle)] text-xs shadow-sm hover:border-[var(--ak-accent-inbox)]/25 transition-colors cursor-pointer"
                  >
                    <PaperClipIcon className="w-3 h-3 text-[var(--ak-accent-inbox)]" />
                    <span className="text-[var(--ak-color-text-primary)] font-medium">{attachment.name}</span>
                    <span className="text-[var(--ak-color-text-tertiary)] text-[10px]">({attachment.size})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardBody>

        {/* Action Buttons */}
        <CardFooter className="flex-col items-stretch gap-3">
          <ActionBar 
            module="inbox" 
            context={{
              target: { 
                module: 'inbox',
                targetId: id,
                title: subject,
              },
              moduleContext: {
                inbox: { itemId: id }
              }
            }}
          />
          
          {onAction && (
            <div className="flex gap-2">
              <AkButton
                variant="primary"
                accent="graphite"
                onClick={() => {
                  // Dispatch compose event for direct reply
                  window.dispatchEvent(new CustomEvent('aklow-open-compose', {
                    detail: { channel: 'email' }
                  }))
                  // Also prefill chat with reply prompt
                  onAction(`Antworte auf diese E-Mail von ${from}`)
                }}
                size="sm"
                className="flex-1"
              >
                Antwort schreiben
              </AkButton>
            </div>
          )}
        </CardFooter>
      </CardShell>
  )
}
