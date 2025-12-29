'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import {
  EnvelopeIcon,
  ChartBarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  BoltIcon,
  CalendarIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

// ============================================================================
// Types
// ============================================================================

interface WeeklySummarySettings {
  is_enabled: boolean
  recipients: string[]
  send_day: string
  send_hour: number
  timezone: string
  include_kpis: string[]
  include_top_topics: boolean
  include_team_stats: boolean
}

interface WeeklySummaryPreview {
  period: {
    start: string
    end: string
  }
  kpis: {
    conversations: {
      total: number
      resolved: number
      resolution_rate: number
    }
    response_time: {
      avg_minutes: number
    }
    automation: {
      executions: number
      successful: number
      time_saved_minutes: number
    }
  }
  top_topics: Array<{
    topic: string
    count: number
  }>
}

// ============================================================================
// Hook
// ============================================================================

export function useWeeklySummary() {
  const [settings, setSettings] = useState<WeeklySummarySettings | null>(null)
  const [preview, setPreview] = useState<WeeklySummaryPreview | null>(null)
  const [lastSentAt, setLastSentAt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true)
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const res = await authedFetch('/api/kmu/weekly-summary')
      if (!res.ok) throw new Error('Failed to fetch settings')
      const data = await res.json()
      setSettings(data.settings)
      setLastSentAt(data.last_sent_at)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateSettings = useCallback(async (newSettings: WeeklySummarySettings) => {
    const { authedFetch } = await import('@/lib/api/authedFetch')
    const res = await authedFetch('/api/kmu/weekly-summary', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    })
    if (!res.ok) throw new Error('Failed to update settings')
    setSettings(newSettings)
    return res.json()
  }, [])

  const fetchPreview = useCallback(async () => {
    try {
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const res = await authedFetch('/api/kmu/weekly-summary/preview', {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to generate preview')
      const data = await res.json()
      setPreview(data.summary)
    } catch (e) {
      console.error('Failed to fetch preview:', e)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return {
    settings,
    preview,
    lastSentAt,
    isLoading,
    error,
    updateSettings,
    fetchPreview,
    refresh: fetchSettings,
  }
}

// ============================================================================
// KPI Card
// ============================================================================

interface KPICardProps {
  icon: React.ElementType
  label: string
  value: string | number
  subvalue?: string
  color?: 'blue' | 'green' | 'amber' | 'purple'
}

function KPICard({ icon: Icon, label, value, subvalue, color = 'blue' }: KPICardProps) {
  const colors = {
    blue: 'bg-[var(--ak-semantic-info-soft)] text-[var(--ak-semantic-info)]',
    green: 'bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)]',
    amber: 'bg-[var(--ak-semantic-warning-soft)] text-[var(--ak-semantic-warning)]',
    purple: 'bg-[var(--ak-color-accent-marketing-soft)] text-[var(--ak-color-accent-marketing)]',
  }

  return (
    <div className="p-4 rounded-xl bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        <div className={clsx('p-2 rounded-lg', colors[color])}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs text-[var(--ak-color-text-muted)] uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold text-[var(--ak-color-text-primary)]">
        {value}
      </div>
      {subvalue && (
        <div className="text-xs text-[var(--ak-color-text-muted)] mt-1">
          {subvalue}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function WeeklySummary() {
  const { settings, preview, lastSentAt, isLoading, updateSettings, fetchPreview } = useWeeklySummary()
  const [isEditing, setIsEditing] = useState(false)
  const [localSettings, setLocalSettings] = useState<WeeklySummarySettings | null>(null)
  const [newRecipient, setNewRecipient] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  const handleSave = async () => {
    if (!localSettings) return
    setIsSaving(true)
    try {
      await updateSettings(localSettings)
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddRecipient = () => {
    if (!newRecipient || !localSettings) return
    if (!newRecipient.includes('@')) return
    
    setLocalSettings({
      ...localSettings,
      recipients: [...localSettings.recipients, newRecipient],
    })
    setNewRecipient('')
  }

  const handleRemoveRecipient = (email: string) => {
    if (!localSettings) return
    setLocalSettings({
      ...localSettings,
      recipients: localSettings.recipients.filter(r => r !== email),
    })
  }

  const handleLoadPreview = async () => {
    setIsPreviewLoading(true)
    try {
      await fetchPreview()
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const days = [
    { value: 'monday', label: 'Montag' },
    { value: 'tuesday', label: 'Dienstag' },
    { value: 'wednesday', label: 'Mittwoch' },
    { value: 'thursday', label: 'Donnerstag' },
    { value: 'friday', label: 'Freitag' },
    { value: 'saturday', label: 'Samstag' },
    { value: 'sunday', label: 'Sonntag' },
  ]

  if (isLoading || !localSettings) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--ak-color-border-subtle)] border-t-[var(--ak-accent-primary)]" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[var(--ak-color-bg-app)]">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-[var(--ak-color-border-subtle)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ak-color-accent-marketing-soft)] text-[var(--ak-color-accent-marketing)] border border-[var(--ak-color-border-subtle)]">
              <EnvelopeIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
                Weekly Summary
              </h1>
              <p className="text-xs text-[var(--ak-color-text-muted)]">
                Automatische Wochenberichte per E-Mail
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AkBadge tone={localSettings.is_enabled ? 'success' : 'muted'}>
              {localSettings.is_enabled ? 'Aktiviert' : 'Deaktiviert'}
            </AkBadge>
            {isEditing ? (
              <>
                <AkButton variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  Abbrechen
                </AkButton>
                <AkButton variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Speichern...' : 'Speichern'}
                </AkButton>
              </>
            ) : (
              <AkButton variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                Bearbeiten
              </AkButton>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 ak-scrollbar">
        {/* Enable Toggle */}
        <div className="p-4 rounded-xl bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)]">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-medium text-[var(--ak-color-text-primary)]">
                Weekly Summary aktivieren
              </div>
              <div className="text-xs text-[var(--ak-color-text-muted)]">
                Erhalte jeden {days.find(d => d.value === localSettings.send_day)?.label} um {localSettings.send_hour}:00 Uhr eine Zusammenfassung
              </div>
            </div>
            <button
              onClick={() => isEditing && setLocalSettings({ ...localSettings, is_enabled: !localSettings.is_enabled })}
              disabled={!isEditing}
              className={clsx(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                localSettings.is_enabled ? 'bg-[var(--ak-semantic-success)]' : 'bg-[var(--ak-color-bg-surface-muted)]',
                !isEditing && 'opacity-60 cursor-not-allowed'
              )}
            >
              <span
                className={clsx(
                'inline-block h-4 w-4 rounded-full bg-[var(--ak-color-text-inverted)] transition-transform',
                  localSettings.is_enabled ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </label>
        </div>

        {/* Schedule */}
        <div className="p-4 rounded-xl bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)]">
          <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)] mb-3 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Zeitplan
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--ak-color-text-muted)] mb-1">Tag</label>
              <select
                value={localSettings.send_day}
                onChange={(e) => setLocalSettings({ ...localSettings, send_day: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-sm disabled:opacity-60"
              >
                {days.map(day => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--ak-color-text-muted)] mb-1">Uhrzeit</label>
              <select
                value={localSettings.send_hour}
                onChange={(e) => setLocalSettings({ ...localSettings, send_hour: parseInt(e.target.value) })}
                disabled={!isEditing}
                className="w-full px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-sm disabled:opacity-60"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
          </div>
          {lastSentAt && (
            <p className="mt-3 text-xs text-[var(--ak-color-text-muted)]">
              Letzter Versand: {new Date(lastSentAt).toLocaleString('de-DE')}
            </p>
          )}
        </div>

        {/* Recipients */}
        <div className="p-4 rounded-xl bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)]">
          <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)] mb-3 flex items-center gap-2">
            <EnvelopeIcon className="h-4 w-4" />
            Empfänger
          </h3>
          
          {localSettings.recipients.length === 0 ? (
            <p className="text-xs text-[var(--ak-color-text-muted)] mb-3">
              Noch keine Empfänger hinzugefügt
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-3">
              {localSettings.recipients.map((email, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--ak-color-bg-surface-muted)] text-xs text-[var(--ak-color-text-secondary)]"
                >
                  {email}
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveRecipient(email)}
                      className="p-0.5 rounded hover:bg-[var(--ak-color-bg-hover)]"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}

          {isEditing && (
            <div className="flex gap-2">
              <input
                type="email"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddRecipient()}
                placeholder="email@example.com"
                className="flex-1 px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-sm"
              />
              <AkButton variant="secondary" size="sm" onClick={handleAddRecipient}>
                <PlusIcon className="h-4 w-4" />
              </AkButton>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="p-4 rounded-xl bg-[var(--ak-color-bg-surface-muted)]/30 border border-[var(--ak-color-border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)] flex items-center gap-2">
              <ChartBarIcon className="h-4 w-4 text-[var(--ak-color-accent)]" />
              Vorschau
            </h3>
            <AkButton
              variant="secondary"
              size="sm"
              onClick={handleLoadPreview}
              disabled={isPreviewLoading}
              leftIcon={<ArrowPathIcon className={clsx('h-4 w-4', isPreviewLoading && 'animate-spin')} />}
            >
              {isPreviewLoading ? 'Laden...' : 'Vorschau generieren'}
            </AkButton>
          </div>

          {preview ? (
            <div className="space-y-4">
              <div className="text-xs text-[var(--ak-color-text-muted)]">
                Zeitraum: {preview.period.start} bis {preview.period.end}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KPICard
                  icon={ChatBubbleLeftRightIcon}
                  label="Gespräche"
                  value={preview.kpis.conversations.total}
                  subvalue={`${preview.kpis.conversations.resolution_rate}% gelöst`}
                  color="blue"
                />
                <KPICard
                  icon={ClockIcon}
                  label="Ø Antwortzeit"
                  value={`${preview.kpis.response_time.avg_minutes} min`}
                  color="amber"
                />
                <KPICard
                  icon={BoltIcon}
                  label="Automationen"
                  value={preview.kpis.automation.successful}
                  subvalue={`${preview.kpis.automation.time_saved_minutes} min gespart`}
                  color="purple"
                />
                <KPICard
                  icon={CheckCircleIcon}
                  label="Gelöst"
                  value={preview.kpis.conversations.resolved}
                  color="green"
                />
              </div>

              {preview.top_topics.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-[var(--ak-color-text-secondary)] mb-2">
                    Top Themen
                  </h4>
                  <div className="space-y-1">
                    {preview.top_topics.map((topic, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1 px-2 rounded bg-[var(--ak-color-bg-surface-muted)]/60"
                      >
                        <span className="text-xs text-[var(--ak-color-text-secondary)] truncate">
                          {topic.topic}
                        </span>
                        <span className="text-[10px] text-[var(--ak-color-text-muted)]">
                          {topic.count}x
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--ak-color-text-muted)]">
              <ChartBarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">
                Klicke auf "Vorschau generieren" um eine Beispiel-Summary zu sehen
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WeeklySummary

