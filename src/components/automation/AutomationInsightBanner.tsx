'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import {
  LightBulbIcon,
  XMarkIcon,
  ChevronRightIcon,
  SparklesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

export interface AutomationInsight {
  id: string
  insight_type: string
  status: string
  title: string
  description: string
  pattern_summary: string
  trigger: {
    event_type: string
    conditions: Array<{ field: string; operator: string; value: string }>
    description: string
  }
  actions: Array<{
    action_id: string
    parameters: Record<string, unknown>
    description: string
    requires_approval: boolean
  }>
  confidence_score: number
  estimated_time_saved: number
  pattern_count: number
  created_at?: string
  shown_at?: string
}

interface AutomationInsightBannerProps {
  insight: AutomationInsight
  onAccept: (id: string) => Promise<void>
  onDismiss: (id: string) => Promise<void>
  onSnooze: (id: string) => Promise<void>
  onShowDetails: (insight: AutomationInsight) => void
  className?: string
}

export function AutomationInsightBanner({
  insight,
  onAccept,
  onDismiss,
  onSnooze,
  onShowDetails,
  className,
}: AutomationInsightBannerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAccepted, setIsAccepted] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      await onAccept(insight.id)
      setIsAccepted(true)
      // Auto-hide after success
      setTimeout(() => setIsDismissed(true), 2000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = async () => {
    setIsLoading(true)
    try {
      await onDismiss(insight.id)
      setIsDismissed(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSnooze = async () => {
    setIsLoading(true)
    try {
      await onSnooze(insight.id)
      setIsDismissed(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (isDismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={clsx(
          'relative overflow-hidden rounded-2xl',
          'bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)]',
          'shadow-sm',
          className
        )}
      >
        {/* Success State Overlay */}
        <AnimatePresence>
          {isAccepted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--ak-color-bg-success)]/90 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 text-[var(--ak-color-text-success)]">
                <CheckCircleIcon className="h-6 w-6" />
                <span className="font-semibold">Automation aktiviert!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-accent-automation)] border border-[var(--ak-color-border-subtle)]">
                <LightBulbIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ak-accent-automation)]">
                    💡 Insight
                  </span>
                  <AkBadge tone="accent" size="xs">
                    {Math.round(insight.confidence_score * 100)}% Konfidenz
                  </AkBadge>
                </div>
                <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)] mt-0.5">
                  {insight.title}
                </h3>
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              disabled={isLoading}
              className="p-1.5 rounded-lg hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-secondary)] transition-colors"
              aria-label="Schließen"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-[var(--ak-color-text-secondary)] mb-3 leading-relaxed">
            {insight.description}
          </p>

          {/* Pattern Summary */}
          <div className="flex items-center gap-4 mb-4 text-xs text-[var(--ak-color-text-muted)]">
            <div className="flex items-center gap-1.5">
              <SparklesIcon className="h-3.5 w-3.5" />
              <span>{insight.pattern_summary}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ClockIcon className="h-3.5 w-3.5" />
              <span>~{insight.estimated_time_saved} Min/Woche gespart</span>
            </div>
          </div>

          {/* Trigger & Actions Preview */}
          <div className="mb-4 p-3 rounded-xl bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-hairline)]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--ak-color-text-muted)] mb-2">
              Vorgeschlagene Automation
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 text-xs font-semibold text-[var(--ak-accent-automation)]">
                  WENN:
                </span>
                <span className="text-xs text-[var(--ak-color-text-secondary)]">
                  {insight.trigger.description}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 text-xs font-semibold text-[var(--ak-accent-automation)]">
                  DANN:
                </span>
                <span className="text-xs text-[var(--ak-color-text-secondary)]">
                  {insight.actions.map(a => a.description).join(' → ')}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <AkButton
              accent="automation"
              variant="primary"
              size="sm"
              onClick={handleAccept}
              disabled={isLoading}
              leftIcon={<CheckCircleIcon className="h-4 w-4" />}
              className="flex-1"
            >
              Aktivieren
            </AkButton>
            <AkButton
              variant="secondary"
              size="sm"
              onClick={() => onShowDetails(insight)}
              disabled={isLoading}
              rightIcon={<ChevronRightIcon className="h-3.5 w-3.5" />}
            >
              Anpassen
            </AkButton>
            <AkButton
              variant="ghost"
              size="sm"
              onClick={handleSnooze}
              disabled={isLoading}
            >
              Später
            </AkButton>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ============================================================================
// Floating Insight Toast
// ============================================================================

interface AutomationInsightToastProps {
  insight: AutomationInsight
  onAccept: (id: string) => Promise<void>
  onDismiss: (id: string) => Promise<void>
  onShowDetails: (insight: AutomationInsight) => void
  position?: 'bottom-right' | 'bottom-left' | 'top-right'
}

export function AutomationInsightToast({
  insight,
  onAccept,
  onDismiss,
  onShowDetails,
  position = 'bottom-right',
}: AutomationInsightToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      await onAccept(insight.id)
      setIsVisible(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = async () => {
    setIsLoading(true)
    try {
      await onDismiss(insight.id)
      setIsVisible(false)
    } finally {
      setIsLoading(false)
    }
  }

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
  }

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={clsx(
        'fixed z-50 w-80',
        positionClasses[position]
      )}
    >
      <div className="rounded-2xl bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-[var(--ak-color-bg-surface-muted)] border-b border-[var(--ak-color-border-subtle)]">
          <div className="flex items-center gap-2">
            <LightBulbIcon className="h-4 w-4 text-[var(--ak-accent-automation)]" />
            <span className="text-xs font-semibold text-[var(--ak-color-text-primary)]">
              Automation-Vorschlag
            </span>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-md hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-muted)]"
          >
            <XMarkIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          <h4 className="text-sm font-semibold text-[var(--ak-color-text-primary)] mb-1">
            {insight.title}
          </h4>
          <p className="text-xs text-[var(--ak-color-text-secondary)] mb-3 line-clamp-2">
            {insight.pattern_summary}
          </p>

          <div className="flex gap-2">
            <AkButton
              accent="automation"
              variant="primary"
              size="sm"
              onClick={handleAccept}
              disabled={isLoading}
              className="flex-1 text-xs"
            >
              Aktivieren
            </AkButton>
            <AkButton
              variant="ghost"
              size="sm"
              onClick={() => onShowDetails(insight)}
              disabled={isLoading}
              className="text-xs"
            >
              Details
            </AkButton>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

