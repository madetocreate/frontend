'use client'

import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkButton } from '@/components/ui/AkButton'
import { useState } from 'react'
import { ClockIcon, SpeakerWaveIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

// Simple Switch Component for this view
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`${
        checked ? 'bg-[var(--ak-color-accent)]' : 'bg-zinc-200 dark:bg-zinc-700'
      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)] focus:ring-offset-2`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`${
          checked ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </button>
  )
}

export function TelephonyConfiguration() {
  const [recordCalls, setRecordCalls] = useState(true)
  const [transcribe, setTranscribe] = useState(true)
  const [voiceDetection, setVoiceDetection] = useState(true)

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-[var(--ak-color-text-primary)]">Bot Konfiguration</h2>
          <p className="text-sm text-[var(--ak-color-text-secondary)]">
            Globale Einstellungen für alle Telefon-Agenten.
          </p>
        </div>
        <AkButton variant="primary">Speichern</AkButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WidgetCard title="Allgemein" padding="none">
          <div className="divide-y divide-[var(--ak-color-border-hairline)]">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ClockIcon className="h-5 w-5 text-[var(--ak-color-text-secondary)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--ak-color-text-primary)]">Zeitzone</p>
                  <p className="text-xs text-[var(--ak-color-text-secondary)]">Europe/Berlin</p>
                </div>
              </div>
              <AkButton variant="ghost" size="sm">Ändern</AkButton>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GlobeAltIcon className="h-5 w-5 text-[var(--ak-color-text-secondary)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--ak-color-text-primary)]">Standard Sprache</p>
                  <p className="text-xs text-[var(--ak-color-text-secondary)]">Deutsch (DE)</p>
                </div>
              </div>
              <AkButton variant="ghost" size="sm">Ändern</AkButton>
            </div>
          </div>
        </WidgetCard>

        <WidgetCard title="Aufzeichnung & Analyse" padding="none">
          <div className="divide-y divide-[var(--ak-color-border-hairline)]">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--ak-color-text-primary)]">Anrufe aufzeichnen</p>
                <p className="text-xs text-[var(--ak-color-text-secondary)]">Für Qualitätssicherung speichern</p>
              </div>
              <Toggle checked={recordCalls} onChange={setRecordCalls} />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--ak-color-text-primary)]">Live-Transkription</p>
                <p className="text-xs text-[var(--ak-color-text-secondary)]">Echtzeit Text-Erkennung</p>
              </div>
              <Toggle checked={transcribe} onChange={setTranscribe} />
            </div>
          </div>
        </WidgetCard>

        <WidgetCard title="Voice Engine" className="md:col-span-2" padding="md">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-1">KI Modell</label>
              <select className="w-full rounded-md border border-[var(--ak-color-border-default)] bg-[var(--ak-color-bg-surface)] px-3 py-2 text-sm focus:border-[var(--ak-color-accent)] focus:outline-none">
                <option>GPT-4o Realtime (Recommended)</option>
                <option>GPT-4o Audio Preview</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-1">Voice Activity Detection (VAD)</label>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--ak-color-border-default)] bg-[var(--ak-color-bg-sidebar)]">
                <SpeakerWaveIcon className="h-5 w-5 text-[var(--ak-color-text-secondary)]" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--ak-color-text-primary)]">Automatische Sprechererkennung</p>
                  <p className="text-xs text-[var(--ak-color-text-secondary)]">Unterbricht den Bot, wenn der Nutzer spricht</p>
                </div>
                <Toggle checked={voiceDetection} onChange={setVoiceDetection} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-1">System Prompt (Fallback)</label>
              <textarea 
                className="w-full rounded-md border border-[var(--ak-color-border-default)] bg-[var(--ak-color-bg-surface)] px-3 py-2 text-sm focus:border-[var(--ak-color-accent)] focus:outline-none min-h-[100px]"
                defaultValue="Du bist ein freundlicher Telefon-Assistent. Fasse dich kurz. Sei höflich und hilfsbereit."
              />
            </div>
          </div>
        </WidgetCard>
      </div>
    </div>
  )
}
