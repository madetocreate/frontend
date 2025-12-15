'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkButton } from '@/components/ui/AkButton'
import { AkSearchField } from '@/components/ui/AkSearchField'
import { ClockIcon, SpeakerWaveIcon, GlobeAltIcon, Cog6ToothIcon, SparklesIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

// Simple Switch Component
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      className={clsx(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)] focus:ring-offset-2',
        checked ? 'bg-[var(--ak-color-accent)]' : 'bg-gray-200 dark:bg-gray-700'
      )}
      onClick={() => onChange(!checked)}
      aria-label={label}
    >
      <span
        className={clsx(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  )
}

export function TelephonyConfiguration() {
  const [recordCalls, setRecordCalls] = useState(true)
  const [transcribe, setTranscribe] = useState(true)
  const [voiceDetection, setVoiceDetection] = useState(true)
  const [expertMode, setExpertMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[var(--ak-color-bg-app)]">
      {/* Header - Apple Style */}
      <div className="shrink-0 px-6 pt-6 pb-4 border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-app)]">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="ak-heading text-2xl font-bold text-[var(--ak-color-text-primary)] mb-1">Bot-Konfiguration</h1>
            <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">
              Globale Einstellungen für alle Telefon-Agenten
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExpertMode(!expertMode)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                expertMode
                  ? 'bg-[var(--ak-color-accent)] text-white'
                  : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-surface)]'
              )}
            >
              <Cog6ToothIcon className="h-4 w-4 inline mr-1.5" />
              {expertMode ? 'Experten-Modus' : 'Einfach'}
            </button>
            <AkButton 
              variant="primary"
              onClick={async () => {
                try {
                  const response = await fetch('/api/telephony/calls', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'change-mode',
                      tenant_id: 'default-tenant',
                      config: {
                        recordCalls,
                        transcribe,
                        voiceDetection,
                        expertMode,
                      },
                    }),
                  })
                  if (response.ok) {
                    window.dispatchEvent(
                      new CustomEvent('aklow-notification', {
                        detail: { type: 'success', message: 'Einstellungen gespeichert' }
                      })
                    )
                  }
                } catch (error) {
                  console.error('Error saving config:', error)
                }
              }}
            >
              Speichern
            </AkButton>
          </div>
        </div>
        <AkSearchField 
          placeholder="Einstellungen durchsuchen..." 
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6 max-w-5xl">
          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WidgetCard title="Allgemein" className="apple-glass-enhanced" padding="sm">
              <div className="divide-y divide-[var(--ak-color-border-subtle)]">
                <div className="p-4 flex items-center justify-between hover:bg-[var(--ak-color-bg-surface-muted)]/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <ClockIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--ak-color-text-primary)]">Zeitzone</p>
                      <p className="text-xs text-[var(--ak-color-text-secondary)]">Europe/Berlin</p>
                    </div>
                  </div>
                  <AkButton variant="ghost" size="sm">Ändern</AkButton>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-[var(--ak-color-bg-surface-muted)]/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                      <GlobeAltIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--ak-color-text-primary)]">Standard Sprache</p>
                      <p className="text-xs text-[var(--ak-color-text-secondary)]">Deutsch (DE)</p>
                    </div>
                  </div>
                  <AkButton variant="ghost" size="sm">Ändern</AkButton>
                </div>
              </div>
            </WidgetCard>
          </motion.div>

          {/* Recording & Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <WidgetCard title="Aufzeichnung & Analyse" className="apple-glass-enhanced" padding="sm">
              <div className="divide-y divide-[var(--ak-color-border-subtle)]">
                <div className="p-4 flex items-center justify-between hover:bg-[var(--ak-color-bg-surface-muted)]/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-[var(--ak-color-text-primary)]">Anrufe aufzeichnen</p>
                      <InformationCircleIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
                    </div>
                    <p className="text-xs text-[var(--ak-color-text-secondary)]">Für Qualitätssicherung speichern</p>
                  </div>
                  <Toggle checked={recordCalls} onChange={setRecordCalls} label="Anrufe aufzeichnen" />
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-[var(--ak-color-bg-surface-muted)]/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-[var(--ak-color-text-primary)]">Live-Transkription</p>
                      <InformationCircleIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
                    </div>
                    <p className="text-xs text-[var(--ak-color-text-secondary)]">Echtzeit Text-Erkennung</p>
                  </div>
                  <Toggle checked={transcribe} onChange={setTranscribe} label="Live-Transkription" />
                </div>
              </div>
            </WidgetCard>
          </motion.div>

          {/* Voice Engine */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <WidgetCard title="Voice Engine" className="apple-glass-enhanced md:col-span-2" padding="md">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-2">
                    KI Modell
                  </label>
                  <select className="w-full rounded-xl border border-[var(--ak-color-border-default)] bg-[var(--ak-color-bg-surface)] px-4 py-2.5 text-sm focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]/20 transition-all">
                    <option>GPT-4o Realtime (Recommended)</option>
                    <option>GPT-4o Audio Preview</option>
                    <option>Claude 3.5 Sonnet</option>
                  </select>
                  <p className="text-xs text-[var(--ak-color-text-secondary)] mt-1.5">
                    Empfohlen für natürliche Gespräche
                  </p>
                </div>
                
                <div className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)]/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                      <SpeakerWaveIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-[var(--ak-color-text-primary)]">Voice Activity Detection (VAD)</p>
                        <InformationCircleIcon className="h-4 w-4 text-[var(--ak-color-text-muted)]" />
                      </div>
                      <p className="text-xs text-[var(--ak-color-text-secondary)]">Unterbricht den Bot, wenn der Nutzer spricht</p>
                    </div>
                    <Toggle checked={voiceDetection} onChange={setVoiceDetection} label="VAD" />
                  </div>
                </div>

                {expertMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div>
                      <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-2">
                        System Prompt (Fallback)
                      </label>
                      <textarea 
                        className="w-full rounded-xl border border-[var(--ak-color-border-default)] bg-[var(--ak-color-bg-surface)] px-4 py-3 text-sm focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]/20 transition-all min-h-[120px] font-mono"
                        defaultValue="Du bist ein freundlicher Telefon-Assistent. Fasse dich kurz. Sei höflich und hilfsbereit."
                        placeholder="System Prompt..."
                      />
                      <p className="text-xs text-[var(--ak-color-text-secondary)] mt-1.5">
                        Wird verwendet, wenn keine spezifische Konfiguration vorhanden ist
                      </p>
                    </div>

                    <div className="mt-4 p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-amber-50/50">
                      <div className="flex items-start gap-2">
                        <InformationCircleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-900 mb-1">Experten-Einstellungen</p>
                          <p className="text-xs text-amber-700">
                            Änderungen an diesen Einstellungen können die Bot-Performance beeinflussen. 
                            Nur ändern, wenn du weißt, was du tust.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </WidgetCard>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <WidgetCard title="Schnellaktionen" className="apple-glass-enhanced" padding="md">
              <div className="grid grid-cols-2 gap-3">
                <AkButton variant="secondary" className="justify-start">
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  KI-Training starten
                </AkButton>
                <AkButton variant="secondary" className="justify-start">
                  <Cog6ToothIcon className="h-4 w-4 mr-2" />
                  Backup erstellen
                </AkButton>
              </div>
            </WidgetCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
