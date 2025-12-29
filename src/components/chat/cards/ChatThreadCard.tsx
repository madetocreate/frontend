'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import { CardShell, CardHeader, CardBody, CardFooter } from '@/components/ui/CardShell'
import { AkButton } from '@/components/ui/AkButton'

interface ChatMessage {
  id: string
  content: string
  timestamp: string
  isOutgoing: boolean
  status?: 'sent' | 'delivered' | 'read'
}

interface ChatThreadCardProps {
  id: string
  contactName: string
  contactAvatar?: string
  platform: 'whatsapp' | 'telegram' | 'sms' | 'messenger' | 'chat'
  messages: ChatMessage[]
  lastActivity?: string
  isExpanded?: boolean
  onClose?: () => void
  onAction?: (action: string) => void
}

const PLATFORM_CONFIG = {
  whatsapp: {
    name: 'WhatsApp',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-[var(--ak-semantic-success-soft)]',
    icon: '💬',
  },
  telegram: {
    name: 'Telegram',
    color: 'from-blue-400 to-blue-500',
    bgColor: 'bg-[var(--ak-accent-inbox-soft)]',
    icon: '✈️',
  },
  sms: {
    name: 'SMS',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-[var(--ak-accent-documents-soft)]',
    icon: '📱',
  },
  messenger: {
    name: 'Messenger',
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-[var(--ak-accent-inbox-soft)]',
    icon: '💭',
  },
  chat: {
    name: 'Chat',
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-[var(--ak-color-bg-surface-muted)]',
    icon: '💬',
  },
}

export function ChatThreadCard({
  id: _id, // eslint-disable-line @typescript-eslint/no-unused-vars
  contactName,
  contactAvatar,
  platform,
  messages,
  lastActivity,
  isExpanded: initialExpanded = false,
  onClose,
  onAction,
}: ChatThreadCardProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded)
  const platformConfig = PLATFORM_CONFIG[platform]

  // Show last 5 messages when collapsed, all when expanded
  const visibleMessages = isExpanded ? messages : messages.slice(-5)

  return (
    <CardShell className="w-full">
      <CardHeader
        icon={
          <div className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br",
            platformConfig.color
          )}>
            {contactAvatar ? (
              <Image src={contactAvatar} alt={contactName} width={40} height={40} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-lg">{platformConfig.icon}</span>
            )}
          </div>
        }
        title={contactName}
        subtitle={platformConfig.name}
        actions={
          <div className="flex items-center gap-1">
            {lastActivity && (
              <span className="text-xs text-[var(--ak-color-text-muted)] mr-2">{lastActivity}</span>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg hover:bg-[var(--ak-color-bg-hover)] transition-colors"
              title={isExpanded ? 'Einklappen' : 'Erweitern'}
            >
              {isExpanded ? (
                <ChevronUpIcon className="w-4 h-4 text-[var(--ak-color-text-secondary)]" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 text-[var(--ak-color-text-secondary)]" />
              )}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[var(--ak-color-bg-hover)] transition-colors"
                title="Schließen"
              >
                <XMarkIcon className="w-4 h-4 text-[var(--ak-color-text-secondary)]" />
              </button>
            )}
          </div>
        }
      />

      {/* Messages */}
      <CardBody padding="none">
        <div className="px-4 py-4 space-y-3 max-h-[400px] overflow-y-auto ak-scrollbar">
          {!isExpanded && messages.length > 5 && (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full text-center text-xs text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-secondary)] py-2"
            >
              + {messages.length - 5} ältere Nachrichten anzeigen
            </button>
          )}
          
          <AnimatePresence>
            {visibleMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={clsx(
                  "flex",
                  message.isOutgoing ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={clsx(
                    "max-w-[75%] rounded-2xl px-4 py-2 shadow-sm",
                    message.isOutgoing
                      ? "bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] rounded-br-md"
                      : "bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] rounded-bl-md"
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <div className={clsx(
                    "flex items-center justify-end gap-1 mt-1",
                    message.isOutgoing ? "text-[var(--ak-color-text-inverted)]/70" : "text-[var(--ak-color-text-muted)]"
                  )}>
                    <span className="text-[10px]">{message.timestamp}</span>
                    {message.isOutgoing && message.status && (
                      <span className="text-[10px]">
                        {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardBody>

      {/* Footer */}
      <CardFooter>
        <span className="text-xs text-[var(--ak-color-text-muted)] flex-1">
          {messages.length} Nachrichten
        </span>
        <AkButton
          variant="primary"
          accent="graphite"
          size="sm"
          onClick={() => {
            const lastMessage = messages[messages.length - 1]
            const subject = contactName || 'diesen Thread'
            const preview = lastMessage?.content?.substring(0, 100) || ''
            const prompt = `Schreibe eine kurze, freundliche Antwort auf ${subject}. ${preview ? `Beziehe dich auf: "${preview}${preview.length < lastMessage?.content?.length ? '...' : ''}"` : 'Beziehe dich auf den Kontext und schlage ggf. 2 Optionen vor.'}`
            
            if (onAction) {
              onAction(prompt)
            } else {
              window.dispatchEvent(new CustomEvent('aklow-compose', {
                detail: { text: prompt }
              }))
            }
          }}
        >
          Antworten
        </AkButton>
      </CardFooter>
    </CardShell>
  )
}
