'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import { AkEmptyState } from '@/components/ui/AkEmptyState'
import {
  LightBulbIcon,
  BoltIcon,
  ArrowPathIcon,
  SparklesIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { 
  AutomationSuggestionCard, 
  AutomationRuleCard,
  UsageSummaryWidget,
} from './AutomationSuggestionCard'
import { AutomationInsightBanner, type AutomationInsight } from './AutomationInsightBanner'

// ============================================================================
// API Hook
// ============================================================================

interface UsageSummary {
  total_actions: number
  unique_actions: number
  completed: number
  time_saved_minutes: number
  time_saved_hours: number
  top_actions: Array<{ action_id: string; count: number }>
  pending_insights_count: number
}

interface AutomationRule {
  id: string
  name: string
  description?: string
  enabled: boolean
  created_at?: string
  source_insight_id?: string
}

export function useAutomationInsights() {
  const [insights, setInsights] = useState<AutomationInsight[]>([])
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [summary, setSummary] = useState<UsageSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = useCallback(async () => {
    try {
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const res = await authedFetch('/api/automation-insights/pending')
      if (!res.ok) throw new Error('Failed to fetch insights')
      const data = await res.json()
      setInsights(data.insights || [])
    } catch (e) {
      console.error('Failed to fetch insights:', e)
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }, [])

  const fetchRules = useCallback(async () => {
    try {
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const res = await authedFetch('/api/automation-insights/rules')
      if (!res.ok) throw new Error('Failed to fetch rules')
      const data = await res.json()
      setRules(data.rules || [])
    } catch (e) {
      console.error('Failed to fetch rules:', e)
    }
  }, [])

  const fetchSummary = useCallback(async () => {
    try {
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const res = await authedFetch('/api/automation-insights/summary')
      if (!res.ok) throw new Error('Failed to fetch summary')
      const data = await res.json()
      setSummary(data)
    } catch (e) {
      console.error('Failed to fetch summary:', e)
    }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await Promise.all([fetchInsights(), fetchRules(), fetchSummary()])
    setIsLoading(false)
  }, [fetchInsights, fetchRules, fetchSummary])

  const acceptInsight = useCallback(async (id: string, customizations?: Record<string, unknown>) => {
    const { authedFetch } = await import('@/lib/api/authedFetch')
    const res = await authedFetch(`/api/automation-insights/${id}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customizations }),
    })
    if (!res.ok) throw new Error('Failed to accept insight')
    await refresh()
  }, [refresh])

  const dismissInsight = useCallback(async (id: string, reason?: string) => {
    const { authedFetch } = await import('@/lib/api/authedFetch')
    const res = await authedFetch(`/api/automation-insights/${id}/dismiss`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    if (!res.ok) throw new Error('Failed to dismiss insight')
    setInsights(prev => prev.filter(i => i.id !== id))
  }, [])

  const snoozeInsight = useCallback(async (id: string, days: number = 7) => {
    const { authedFetch } = await import('@/lib/api/authedFetch')
    const res = await authedFetch(`/api/automation-insights/${id}/snooze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snooze_days: days }),
    })
    if (!res.ok) throw new Error('Failed to snooze insight')
    setInsights(prev => prev.filter(i => i.id !== id))
  }, [])

  const toggleRule = useCallback(async (id: string, enabled: boolean) => {
    const { authedFetch } = await import('@/lib/api/authedFetch')
    const res = await authedFetch(`/api/automation-insights/rules/${id}/toggle?enabled=${enabled}`, {
      method: 'PATCH',
    })
    if (!res.ok) throw new Error('Failed to toggle rule')
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled } : r))
  }, [])

  const deleteRule = useCallback(async (id: string) => {
    const { authedFetch } = await import('@/lib/api/authedFetch')
    const res = await authedFetch(`/api/automation-insights/rules/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to delete rule')
    setRules(prev => prev.filter(r => r.id !== id))
  }, [])

  const triggerAnalysis = useCallback(async () => {
    const { authedFetch } = await import('@/lib/api/authedFetch')
    const res = await authedFetch('/api/automation-insights/analyze', {
      method: 'POST',
    })
    if (!res.ok) throw new Error('Failed to trigger analysis')
    await fetchInsights()
  }, [fetchInsights])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    insights,
    rules,
    summary,
    isLoading,
    error,
    refresh,
    acceptInsight,
    dismissInsight,
    snoozeInsight,
    toggleRule,
    deleteRule,
    triggerAnalysis,
  }
}

// ============================================================================
// Main Panel Component
// ============================================================================

type TabId = 'insights' | 'active' | 'stats'

export function AutomationInsightsPanel() {
  const {
    insights,
    rules,
    summary,
    isLoading,
    error,
    refresh,
    acceptInsight,
    dismissInsight,
    snoozeInsight,
    toggleRule,
    deleteRule,
    triggerAnalysis,
  } = useAutomationInsights()

  const [activeTab, setActiveTab] = useState<TabId>('insights')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedInsight, setSelectedInsight] = useState<AutomationInsight | null>(null)

  const handleTriggerAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      await triggerAnalysis()
    } finally {
      setIsAnalyzing(false)
    }
  }

  const tabs: { id: TabId; label: string; icon: React.ElementType; badge?: number }[] = [
    { 
      id: 'insights', 
      label: 'Vorschläge', 
      icon: LightBulbIcon,
      badge: insights.length > 0 ? insights.length : undefined,
    },
    { 
      id: 'active', 
      label: 'Aktiv', 
      icon: BoltIcon,
      badge: rules.filter(r => r.enabled).length || undefined,
    },
    { 
      id: 'stats', 
      label: 'Statistiken', 
      icon: ChartBarIcon,
    },
  ]

  return (
    <div className="h-full flex flex-col bg-[var(--ak-color-bg-app)]">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-[var(--ak-color-border-subtle)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ak-accent-automation-soft)]">
              <SparklesIcon className="h-5 w-5 text-[var(--ak-accent-automation)]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
                Automation Insights
              </h1>
              <p className="text-xs text-[var(--ak-color-text-muted)]">
                KI-generierte Vorschläge basierend auf deiner Nutzung
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <AkButton
              variant="ghost"
              size="sm"
              onClick={handleTriggerAnalysis}
              disabled={isAnalyzing}
              leftIcon={
                <ArrowPathIcon className={clsx('h-4 w-4', isAnalyzing && 'animate-spin')} />
              }
            >
              {isAnalyzing ? 'Analysiere...' : 'Analysieren'}
            </AkButton>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-[var(--ak-color-bg-surface-muted)]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] shadow-sm'
                  : 'text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-secondary)]'
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <AkBadge tone="accent" size="xs">
                  {tab.badge}
                </AkBadge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 ak-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <ArrowPathIcon className="h-8 w-8 text-[var(--ak-color-text-muted)] animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-sm text-[var(--ak-color-text-danger)] mb-4">{error}</p>
            <AkButton variant="secondary" size="sm" onClick={refresh}>
              Erneut versuchen
            </AkButton>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {insights.length === 0 ? (
                  <AkEmptyState
                    icon={<LightBulbIcon />}
                    title="Keine Vorschläge"
                    description="AKLOW analysiert deine Nutzung und schlägt Automationen vor, sobald Muster erkannt werden."
                    action={{
                      label: "Jetzt analysieren",
                      onClick: handleTriggerAnalysis,
                      disabled: isAnalyzing
                    }}
                  />
                ) : (
                  insights.map(insight => (
                    <AutomationSuggestionCard
                      key={insight.id}
                      insight={insight}
                      onAccept={acceptInsight}
                      onDismiss={dismissInsight}
                      onSnooze={snoozeInsight}
                    />
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'active' && (
              <motion.div
                key="active"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {rules.length === 0 ? (
                  <AkEmptyState
                    icon={<BoltIcon />}
                    title="Keine aktiven Automationen"
                    description="Akzeptiere Vorschläge, um Automationen zu aktivieren."
                    action={{
                      label: "Vorschläge ansehen",
                      onClick: () => setActiveTab('insights')
                    }}
                  />
                ) : (
                  rules.map(rule => (
                    <AutomationRuleCard
                      key={rule.id}
                      rule={rule}
                      onToggle={toggleRule}
                      onDelete={deleteRule}
                    />
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {summary ? (
                  <>
                    <UsageSummaryWidget
                      summary={summary}
                      onViewInsights={() => setActiveTab('insights')}
                    />
                    
                    {/* Top Actions */}
                    <div className="p-4 rounded-2xl bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)]">
                      <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)] mb-3">
                        Meistgenutzte Aktionen
                      </h3>
                      <div className="space-y-2">
                        {summary.top_actions.map((action, idx) => (
                          <div 
                            key={action.action_id}
                            className="flex items-center justify-between py-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[var(--ak-color-bg-surface-muted)] text-[10px] font-bold text-[var(--ak-color-text-muted)]">
                                {idx + 1}
                              </span>
                              <span className="text-sm text-[var(--ak-color-text-secondary)]">
                                {action.action_id.split('.').pop()?.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <AkBadge tone="muted" size="xs">
                              {action.count}x
                            </AkBadge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Time Saved */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--ak-semantic-success-soft)] to-[var(--ak-color-bg-surface)] border border-[var(--ak-semantic-success-soft)]">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl font-bold text-[var(--ak-semantic-success)]">
                          {summary.time_saved_hours}h
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[var(--ak-color-text-primary)]">
                            Zeit gespart
                          </div>
                          <div className="text-xs text-[var(--ak-color-text-muted)]">
                            Diese Woche mit AKLOW
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <AkEmptyState
                    icon={<ChartBarIcon />}
                    title="Keine Statistiken"
                    description="Nutze AKLOW, um Statistiken zu sammeln."
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Selected Insight Detail Modal would go here */}
    </div>
  )
}

// ============================================================================
// Inline Insight Banner for Chat/Inbox
// ============================================================================

interface InlineInsightBannerProps {
  maxInsights?: number
  className?: string
}

export function InlineInsightBanner({ maxInsights = 1, className }: InlineInsightBannerProps) {
  const { insights, acceptInsight, dismissInsight, snoozeInsight } = useAutomationInsights()
  const [selectedInsight, setSelectedInsight] = useState<AutomationInsight | null>(null)

  const displayInsights = insights.slice(0, maxInsights)

  if (displayInsights.length === 0) return null

  return (
    <div className={clsx('space-y-3', className)}>
      {displayInsights.map(insight => (
        <AutomationInsightBanner
          key={insight.id}
          insight={insight}
          onAccept={acceptInsight}
          onDismiss={dismissInsight}
          onSnooze={snoozeInsight}
          onShowDetails={setSelectedInsight}
        />
      ))}
    </div>
  )
}

