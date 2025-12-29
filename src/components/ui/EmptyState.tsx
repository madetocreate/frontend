'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { 
  InboxIcon, 
  PhoneIcon, 
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  StarIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  type?: 'inbox' | 'calls' | 'chats' | 'documents' | 'reviews' | 'users' | 'custom'
}

const iconMap = {
  inbox: InboxIcon,
  calls: PhoneIcon,
  chats: ChatBubbleLeftRightIcon,
  documents: DocumentTextIcon,
  reviews: StarIcon,
  users: UsersIcon
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  type = 'custom'
}: EmptyStateProps) {
  const Icon = type !== 'custom' ? iconMap[type] : null
  const defaultIcon = Icon ? <Icon className="h-16 w-16" /> : icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center"
    >
      {/* Animated Icon with Glow */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: 'spring', 
          stiffness: 200, 
          damping: 15,
          delay: 0.1 
        }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--ak-semantic-info-soft)]/20 via-[var(--ak-accent-documents-soft)]/20 to-[var(--ak-accent-growth-soft)]/20 blur-2xl" />
        <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-muted)]">
          {defaultIcon}
        </div>
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-[var(--ak-color-text-primary)] mb-2"
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-[var(--ak-color-text-secondary)] mb-6 max-w-md"
        >
          {description}
        </motion.p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          {action && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.onClick}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--ak-semantic-info)] to-[var(--ak-accent-documents)] text-[var(--ak-color-text-inverted)] font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              {action.label}
            </motion.button>
          )}
          {secondaryAction && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={secondaryAction.onClick}
              className="px-6 py-3 rounded-xl bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] font-semibold hover:bg-[var(--ak-color-bg-hover)] transition-colors"
            >
              {secondaryAction.label}
            </motion.button>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

// Compact Empty State (for smaller spaces)
export function CompactEmptyState({
  icon,
  message,
  action
}: {
  icon: ReactNode
  message: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-muted)] mb-4">
        {icon}
      </div>
      <p className="text-sm text-[var(--ak-color-text-secondary)] mb-4">{message}</p>
      {action && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className="text-sm font-semibold text-[var(--ak-semantic-info)] hover:text-[var(--ak-semantic-info-strong)]"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
}

