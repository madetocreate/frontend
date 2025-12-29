'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import {
  ChartBarIcon,
  CalendarDaysIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  BoltIcon,
  TrophyIcon,
  EnvelopeIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import { kmuClient, type WeeklySummarySettings, type WeeklySummary } from '@/lib/kmuClient'

const DAYS = [
  { id: 'monday', label: 'Montag' },
  { id: 'tuesday', label: 'Dienstag' },
  { id: 'wednesday', label: 'Mittwoch' },
  { id: 'thursday', label: 'Donnerstag' },
  { id: 'friday', label: 'Freitag' },
  { id: 'saturday', label: 'Samstag' },
  { id: 'sunday', label: 'Sonntag' },
]

const KPI_OPTIONS = [
  { id: 'conversations', label: 'Konversationen', icon: ChatBubbleLeftRightIcon },
  { id: 'response_time', label: 'Antwortzeit', icon: ClockIcon },
  { id: 'satisfaction', label: 'Zufriedenheit', icon: TrophyIcon },
  { id: 'automation_savings', label: 'Automatisierung', icon: BoltIcon },
]

export function WeeklyReports() {
  const [settings, setSettings] = useState<WeeklySummarySettings | null>(null)
  const [lastSentAt, setLastSentAt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Preview state
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<{ summary: WeeklySummary; week_start: string; week_end: string } | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  // Recipients input
  const [newRecipient, setNewRecipient] = useState('')

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await kmuClient.getWeeklySummarySettings()
      setSettings(data.settings)
      setLastSentAt(data.last_sent_at || null)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async () => {
    if (!settings) return
    
    try {
      setIsSaving(true)
      await kmuClient.updateWeeklySummarySettings(settings)
      setSuccess('Einstellungen gespeichert!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = async () => {
    try {
      setIsLoadingPreview(true)
      const data = await kmuClient.previewWeeklySummary()
      setPreviewData(data)
      setShowPreview(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Generieren')
    } finally {
      setIsLoadingPreview(false)
    }
  }

  const addRecipient = () => {
    if (!settings || !newRecipient.trim()) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newRecipient)) {
      setError('Ungültige E-Mail-Adresse')
      return
    }
    if (!settings.recipients.includes(newRecipient.trim())) {
      setSettings({ ...settings, recipients: [...settings.recipients, newRecipient.trim()] })
    }
    setNewRecipient('')
  }

  const removeRecipient = (email: string) => {
    if (!settings) return
    setSettings({ ...settings, recipients: settings.recipients.filter(r => r !== email) })
  }

  const toggleKpi = (kpiId: string) => {
    if (!settings) return
    const newKpis = settings.include_kpis.includes(kpiId)
      ? settings.include_kpis.filter(k => k !== kpiId)
      : [...settings.include_kpis, kpiId]
    setSettings({ ...settings, include_kpis: newKpis })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--ak-color-accent)]" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--ak-color-border-subtle)]">
        <div>
          <h2 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
            Wöchentliche Reports
          </h2>
          <p className="text-sm text-[var(--ak-color-text-secondary)]">
            Automatische Zusammenfassung per E-Mail
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AkButton onClick={handlePreview} variant="ghost" size="sm" disabled={isLoadingPreview}>
            {isLoadingPreview ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <ChartBarIcon className="w-4 h-4" />}
            <span className="ml-1">Vorschau</span>
          </AkButton>
          <AkButton onClick={handleSave} variant="primary" size="sm" disabled={isSaving}>
            {isSaving ? 'Speichern...' : 'Speichern'}
          </AkButton>
        </div>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mt-4 p-3 rounded-lg bg-[var(--ak-semantic-danger-soft)] border border-[var(--ak-semantic-danger-soft)] text-[var(--ak-semantic-danger)] text-sm flex items-center justify-between"
          >
            <span>{error}</span>
            <button onClick={() => setError(null)}><XMarkIcon className="w-4 h-4" /></button>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mt-4 p-3 rounded-lg bg-[var(--ak-semantic-success-soft)] border border-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)] text-sm flex items-center gap-2"
          >
            <CheckCircleIcon className="w-4 h-4" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {settings && (
          <>
            {/* Enable Toggle */}
            <div className="p-4 rounded-xl bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)]">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-medium text-[var(--ak-color-text-primary)]">Weekly Report aktivieren</span>
                  <p className="text-sm text-[var(--ak-color-text-secondary)]">
                    Automatisch wöchentliche Zusammenfassung senden
                  </p>
                </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.is_enabled}
                      onChange={(e) => setSettings({ ...settings, is_enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[var(--ak-color-bg-surface-muted)] rounded-full peer peer-checked:bg-[var(--ak-color-accent)] transition-colors"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-[var(--ak-color-text-inverted)] rounded-full transition-transform peer-checked:translate-x-5"></div>
                  </div>
              </label>
              {lastSentAt && (
                <p className="text-xs text-[var(--ak-color-text-tertiary)] mt-2">
                  Zuletzt gesendet: {new Date(lastSentAt).toLocaleDateString('de-DE', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>

            {/* Schedule */}
            <div className="p-4 rounded-xl bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)]">
              <h3 className="font-medium text-[var(--ak-color-text-primary)] mb-3 flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5" />
                Zeitplan
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-1">Wochentag</label>
                  <select
                    value={settings.send_day}
                    onChange={(e) => setSettings({ ...settings, send_day: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-elevated)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)]"
                  >
                    {DAYS.map(day => (
                      <option key={day.id} value={day.id}>{day.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-1">Uhrzeit</label>
                  <select
                    value={settings.send_hour}
                    onChange={(e) => setSettings({ ...settings, send_hour: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-elevated)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)]"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Recipients */}
            <div className="p-4 rounded-xl bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)]">
              <h3 className="font-medium text-[var(--ak-color-text-primary)] mb-3 flex items-center gap-2">
                <EnvelopeIcon className="w-5 h-5" />
                Empfänger
              </h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="email"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRecipient())}
                  placeholder="email@beispiel.de"
                  className="flex-1 px-3 py-2 rounded-lg bg-[var(--ak-color-bg-elevated)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)] text-sm"
                />
                <AkButton variant="ghost" onClick={addRecipient}>
                  <PlusIcon className="w-4 h-4" />
                </AkButton>
              </div>
              {settings.recipients.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {settings.recipients.map(email => (
                    <span
                      key={email}
                      className="px-3 py-1 rounded-full bg-[var(--ak-color-bg-surface-muted)] text-sm flex items-center gap-2"
                    >
                      {email}
                      <button
                        onClick={() => removeRecipient(email)}
                        className="hover:text-[var(--ak-semantic-danger)]"
                      >
                        <XMarkIcon className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--ak-color-text-tertiary)]">
                  Noch keine Empfänger hinzugefügt
                </p>
              )}
            </div>

            {/* KPIs */}
            <div className="p-4 rounded-xl bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)]">
              <h3 className="font-medium text-[var(--ak-color-text-primary)] mb-3 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5" />
                Enthaltene KPIs
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {KPI_OPTIONS.map(kpi => {
                  const Icon = kpi.icon
                  const isSelected = settings.include_kpis.includes(kpi.id)
                  return (
                    <button
                      key={kpi.id}
                      onClick={() => toggleKpi(kpi.id)}
                      className={clsx(
                        'p-3 rounded-lg border transition-all flex items-center gap-2',
                        isSelected
                          ? 'bg-[var(--ak-color-accent)]/10 border-[var(--ak-color-accent)] text-[var(--ak-color-accent)]'
                          : 'bg-[var(--ak-color-bg-elevated)] border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-secondary)] hover:border-[var(--ak-color-border-default)]'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{kpi.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Additional Options */}
            <div className="p-4 rounded-xl bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)]">
              <h3 className="font-medium text-[var(--ak-color-text-primary)] mb-3 flex items-center gap-2">
                <Cog6ToothIcon className="w-5 h-5" />
                Weitere Optionen
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.include_top_topics}
                    onChange={(e) => setSettings({ ...settings, include_top_topics: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-[var(--ak-color-text-secondary)]">Top-Themen der Woche anzeigen</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.include_team_stats}
                    onChange={(e) => setSettings({ ...settings, include_team_stats: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-[var(--ak-color-text-secondary)]">Team-Statistiken anzeigen</span>
                </label>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && previewData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--ak-color-bg-elevated)] rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-[var(--ak-color-border-subtle)] flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
                    Weekly Report Vorschau
                  </h3>
                  <p className="text-sm text-[var(--ak-color-text-secondary)]">
                    {new Date(previewData.week_start).toLocaleDateString('de-DE')} - {new Date(previewData.week_end).toLocaleDateString('de-DE')}
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)]"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                {/* KPIs Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)]">
                    <div className="flex items-center gap-2 text-sm text-[var(--ak-color-text-secondary)] mb-1">
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      Konversationen
                    </div>
                    <div className="text-2xl font-bold text-[var(--ak-color-text-primary)]">
                      {previewData.summary.kpis.conversations.total}
                    </div>
                    <div className="text-xs text-[var(--ak-semantic-success)]">
                      {previewData.summary.kpis.conversations.resolution_rate}% gelöst
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)]">
                    <div className="flex items-center gap-2 text-sm text-[var(--ak-color-text-secondary)] mb-1">
                      <ClockIcon className="w-4 h-4" />
                      Ø Antwortzeit
                    </div>
                    <div className="text-2xl font-bold text-[var(--ak-color-text-primary)]">
                      {Math.round(previewData.summary.kpis.response_time.avg_minutes)} min
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)]">
                    <div className="flex items-center gap-2 text-sm text-[var(--ak-color-text-secondary)] mb-1">
                      <BoltIcon className="w-4 h-4" />
                      Automatisiert
                    </div>
                    <div className="text-2xl font-bold text-[var(--ak-color-text-primary)]">
                      {previewData.summary.kpis.automation.executions}
                    </div>
                    <div className="text-xs text-[var(--ak-semantic-success)]">
                      ~{previewData.summary.kpis.automation.time_saved_minutes} min gespart
                    </div>
                  </div>
                </div>

                {/* Top Topics */}
                {previewData.summary.top_topics.length > 0 && (
                  <div>
                    <h4 className="font-medium text-[var(--ak-color-text-primary)] mb-3">Top-Themen</h4>
                    <div className="space-y-2">
                      {previewData.summary.top_topics.map((topic, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)]"
                        >
                          <span className="text-sm text-[var(--ak-color-text-primary)]">{topic.topic}</span>
                          <AkBadge tone="neutral">{topic.count}x</AkBadge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-[var(--ak-color-border-subtle)] flex justify-end">
                <AkButton variant="ghost" onClick={() => setShowPreview(false)}>
                  Schließen
                </AkButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

