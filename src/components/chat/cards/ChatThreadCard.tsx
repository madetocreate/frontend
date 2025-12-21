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
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    icon: '💬',
  },
  telegram: {
    name: 'Telegram',
    color: 'from-blue-400 to-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    icon: '✈️',
  },
  sms: {
    name: 'SMS',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    icon: '📱',
  },
  messenger: {
    name: 'Messenger',
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    icon: '💭',
  },
  chat: {
    name: 'Chat',
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-800/50',
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        {/* Header */}
        <div className={clsx(
          "flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700",
          platformConfig.bgColor
        )}>
          <div className="flex items-center gap-3">
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
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {platformConfig.name}
              </span>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{contactName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastActivity && (
              <span className="text-xs text-gray-400">{lastActivity}</span>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700 transition-colors"
              title={isExpanded ? 'Einklappen' : 'Erweitern'}
            >
              {isExpanded ? (
                <ChevronUpIcon className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700 transition-colors"
                title="Schließen"
              >
                <XMarkIcon className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="px-4 py-4 space-y-3 max-h-[400px] overflow-y-auto">
          {!isExpanded && messages.length > 5 && (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 py-2"
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
                      ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-br-md"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md"
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <div className={clsx(
                    "flex items-center justify-end gap-1 mt-1",
                    message.isOutgoing ? "text-white/70" : "text-gray-400"
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

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {messages.length} Nachrichten
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAction?.('reply')}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Antworten
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

