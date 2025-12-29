'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import {
  BoltIcon,
  ClockIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import type { AutomationInsight } from './AutomationInsightBanner'

// ============================================================================
// Suggestion Card (for pending insights)
// ============================================================================

interface AutomationSuggestionCardProps {
  insight: AutomationInsight
  onAccept: (id: string, customizations?: Record<string, unknown>) => Promise<void>
  onDismiss: (id: string, reason?: string) => Promise<void>
  onSnooze: (id: string, days?: number) => Promise<void>
  isExpanded?: boolean
  className?: string
}

export function AutomationSuggestionCard({
  insight,
  onAccept,
  onDismiss,
  onSnooze,
  isExpanded: initialExpanded = false,
  className,
}: AutomationSuggestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded)
  const [isLoading, setIsLoading] = useState(false)
  const [showApprovalToggle, setShowApprovalToggle] = useState(true)

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      await onAccept(insight.id, {
        actions: insight.actions.map((a, i) => ({
          requires_approval: i === 0 ? showApprovalToggle : a.requires_approval,
        })),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const confidenceColor = 
    insight.confidence_score >= 0.8 ? 'success' :
    insight.confidence_score >= 0.6 ? 'warning' : 'muted'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'rounded-2xl border overflow-hidden transition-all',
        isExpanded 
          ? 'border-[var(--ak-accent-automation)]/30 bg-[var(--ak-color-bg-surface)] shadow-lg'
          : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] hover:bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-strong)]',
        className
      )}
    >
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={clsx(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
            isExpanded 
              ? 'bg-[var(--ak-accent-automation)]/20' 
              : 'bg-[var(--ak-color-bg-surface-muted)]'
          )}>
            <BoltIcon className={clsx(
              'h-5 w-5',
              isExpanded 
                ? 'text-[var(--ak-accent-automation)]' 
                : 'text-[var(--ak-color-text-muted)]'
            )} />
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)] truncate">
                {insight.title}
              </h3>
              <AkBadge 
                tone={confidenceColor as 'success' | 'warning' | 'muted'} 
                size="xs"
              >
                {Math.round(insight.confidence_score * 100)}%
              </AkBadge>
            </div>
            <p className="text-xs text-[var(--ak-color-text-muted)] truncate">
              {insight.pattern_summary}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--ak-color-text-muted)]">
            <ClockIcon className="h-3.5 w-3.5" />
            <span>~{insight.estimated_time_saved} Min</span>
          </div>
          {isExpanded ? (
            <ChevronUpIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="px-4 pb-4"
        >
          {/* Description */}
          <div className="mb-4 p-3 rounded-xl bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-hairline)]">
            <p className="text-sm text-[var(--ak-color-text-secondary)] leading-relaxed">
              {insight.description}
            </p>
          </div>

          {/* Trigger & Actions */}
          <div className="space-y-3 mb-4">
            {/* Trigger */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--ak-accent-automation-soft)] text-[var(--ak-accent-automation)]">
                <span className="text-[10px] font-bold">1</span>
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--ak-color-text-muted)] mb-1">
                  Auslöser
                </div>
                <p className="text-sm text-[var(--ak-color-text-primary)]">
                  {insight.trigger.description}
                </p>
                {insight.trigger.conditions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {insight.trigger.conditions.map((c, i) => (
                      <span 
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-xs text-[var(--ak-color-text-secondary)]"
                      >
                        {c.field} {c.operator} "{c.value}"
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {insight.actions.map((action, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--ak-accent-automation-soft)] text-[var(--ak-accent-automation)]">
                  <span className="text-[10px] font-bold">{idx + 2}</span>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--ak-color-text-muted)] mb-1">
                    Aktion {idx + 1}
                  </div>
                  <p className="text-sm text-[var(--ak-color-text-primary)]">
                    {action.description}
                  </p>
                  {action.requires_approval && (
                    <AkBadge tone="warning" size="xs" className="mt-1.5">
                      Freigabe erforderlich
                    </AkBadge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Approval Toggle */}
          <div className="mb-4 p-3 rounded-xl bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-hairline)]">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-[var(--ak-color-text-warning)]" />
                <span className="text-xs text-[var(--ak-color-text-secondary)]">
                  Vor Ausführung um Freigabe fragen
                </span>
              </div>
              <button
                onClick={() => setShowApprovalToggle(!showApprovalToggle)}
                className={clsx(
                  'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                  showApprovalToggle 
                    ? 'bg-[var(--ak-accent-automation)]' 
                    : 'bg-[var(--ak-color-border-subtle)]'
                )}
              >
                <span
                  className={clsx(
                    'inline-block h-3.5 w-3.5 rounded-full ak-bg-surface-1 transition-transform',
                    showApprovalToggle ? 'translate-x-4' : 'translate-x-1'
                  )}
                />
              </button>
            </label>
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
              Automation aktivieren
            </AkButton>
            <AkButton
              variant="ghost"
              size="sm"
              onClick={() => onSnooze(insight.id, 7)}
              disabled={isLoading}
            >
              Später
            </AkButton>
            <AkButton
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(insight.id)}
              disabled={isLoading}
              className="text-[var(--ak-color-text-danger)]"
            >
              Verwerfen
            </AkButton>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// ============================================================================
// Active Rule Card (for accepted insights that became rules)
// ============================================================================

interface AutomationRuleCardProps {
  rule: {
    id: string
    name: string
    description?: string
    enabled: boolean
    created_at?: string
    source_insight_id?: string
  }
  onToggle: (id: string, enabled: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onEdit?: (id: string) => void
  className?: string
}

export function AutomationRuleCard({
  rule,
  onToggle,
  onDelete,
  onEdit,
  className,
}: AutomationRuleCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      await onToggle(rule.id, !rule.enabled)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Diese Automation wirklich löschen?')) return
    setIsLoading(true)
    try {
      await onDelete(rule.id)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={clsx(
        'flex items-center gap-4 p-4 rounded-xl border transition-all',
        rule.enabled
          ? 'bg-[var(--ak-color-bg-surface)] border-[var(--ak-color-border-subtle)]'
          : 'bg-[var(--ak-color-bg-surface-muted)] border-[var(--ak-color-border-hairline)] opacity-60',
        className
      )}
    >
      {/* Status Indicator */}
      <div className={clsx(
        'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
        rule.enabled 
          ? 'bg-[var(--ak-color-bg-success)]' 
          : 'bg-[var(--ak-color-bg-surface-muted)]'
      )}>
        {rule.enabled ? (
          <PlayIcon className="h-5 w-5 text-[var(--ak-color-text-success)]" />
        ) : (
          <PauseIcon className="h-5 w-5 text-[var(--ak-color-text-muted)]" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)] truncate">
            {rule.name}
          </h3>
          <AkBadge 
            tone={rule.enabled ? 'success' : 'muted'} 
            size="xs"
          >
            {rule.enabled ? 'Aktiv' : 'Pausiert'}
          </AkBadge>
        </div>
        {rule.description && (
          <p className="text-xs text-[var(--ak-color-text-muted)] truncate mt-0.5">
            {rule.description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            'hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-muted)]',
            'hover:text-[var(--ak-color-text-secondary)]'
          )}
          title={rule.enabled ? 'Pausieren' : 'Aktivieren'}
        >
          {rule.enabled ? (
            <PauseIcon className="h-4 w-4" />
          ) : (
            <PlayIcon className="h-4 w-4" />
          )}
        </button>
        
        {onEdit && (
          <button
            onClick={() => onEdit(rule.id)}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-secondary)] transition-colors"
            title="Bearbeiten"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        )}
        
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-danger)] text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-danger)] transition-colors"
          title="Löschen"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// Usage Summary Widget
// ============================================================================

interface UsageSummaryWidgetProps {
  summary: {
    total_actions: number
    completed: number
    time_saved_hours: number
    pending_insights_count: number
  }
  onViewInsights: () => void
  className?: string
}

export function UsageSummaryWidget({
  summary,
  onViewInsights,
  className,
}: UsageSummaryWidgetProps) {
  return (
    <div className={clsx(
      'p-4 rounded-2xl bg-[var(--ak-color-bg-surface-muted)]/30 border border-[var(--ak-color-border-subtle)]',
      className
    )}>
      <div className="flex items-center gap-2 mb-4">
        <SparklesIcon className="h-5 w-5 text-[var(--ak-accent-automation)]" />
        <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)]">
          Diese Woche mit AKLOW
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--ak-color-text-primary)]">
            {summary.total_actions}
          </div>
          <div className="text-[10px] text-[var(--ak-color-text-muted)] uppercase tracking-wider">
            Aktionen
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--ak-color-text-success)]">
            {summary.time_saved_hours}h
          </div>
          <div className="text-[10px] text-[var(--ak-color-text-muted)] uppercase tracking-wider">
            Gespart
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--ak-accent-automation)]">
            {summary.pending_insights_count}
          </div>
          <div className="text-[10px] text-[var(--ak-color-text-muted)] uppercase tracking-wider">
            Vorschläge
          </div>
        </div>
      </div>

      {summary.pending_insights_count > 0 && (
        <AkButton
          accent="automation"
          variant="secondary"
          size="sm"
          onClick={onViewInsights}
          className="w-full"
        >
          {summary.pending_insights_count} neue Automation-Vorschläge
        </AkButton>
      )}
    </div>
  )
}

