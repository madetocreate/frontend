'use client'

import { useState, useEffect } from 'react'
import { 
  CpuChipIcon, 
  SparklesIcon, 
  KeyIcon,
  AdjustmentsHorizontalIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { SettingsSection, SettingsRow, SettingsSelect, SettingsInput, SettingsToggle } from './SettingsSection'
import { loadSettings, saveSettings } from '@/lib/settingsClient'
import { useDebounce } from '@/hooks/useDebounce'

type SettingsMode = 'simple' | 'expert'

export function SettingsAI({ mode }: { mode: SettingsMode }) {
  const [defaultModel, setDefaultModel] = useState('gpt-4o-mini')
  const [transcribeModel, setTranscribeModel] = useState('gpt-4o-mini-transcribe')
  const [temperature, setTemperature] = useState('0.7')
  const [maxTokens, setMaxTokens] = useState('2000')
  const [streaming, setStreaming] = useState(true)
  const [apiKeyVisible, setApiKeyVisible] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_saving, setSaving] = useState(false)

  // Debounced save function
  const debouncedSave = useDebounce(async (settings: { ai: { model: string; temperature: number; max_tokens: number } }) => {
    setSaving(true)
    await saveSettings(settings)
    setSaving(false)
  }, 1000)

  const [hasLoaded, setHasLoaded] = useState(false)

  // Load settings on mount
  useEffect(() => {
    const load = async () => {
      const settings = await loadSettings()
      if (settings?.ai) {
        setDefaultModel(settings.ai.model || 'gpt-4o-mini')
        setTemperature(String(settings.ai.temperature || 0.7))
        setMaxTokens(String(settings.ai.max_tokens || 2000))
      }
      setHasLoaded(true)
    }
    void load()
  }, [])

  // Save when settings change (only after initial load)
  useEffect(() => {
    if (hasLoaded) {
      void debouncedSave({
        ai: {
          model: defaultModel,
          temperature: parseFloat(temperature) || 0.7,
          max_tokens: parseInt(maxTokens) || 2000
        }
      })
    }
  }, [defaultModel, temperature, maxTokens, hasLoaded, debouncedSave])

  const models = [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
  ]

  const transcribeModels = [
    { value: 'gpt-4o-mini-transcribe', label: 'GPT-4o Mini Transcribe' },
    { value: 'whisper-1', label: 'Whisper 1' }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Model Configuration - Always visible */}
      <SettingsSection 
        title="Modell-Konfiguration" 
        description="Wählen Sie die KI-Modelle für verschiedene Aufgaben"
        mode={mode}
      >
        <SettingsSelect
          title="Standard LLM"
          subtitle={mode === 'expert' ? 'OPENAI_DEFAULT_MODEL' : 'Hauptmodell für Text-Generierung'}
          leading={<SparklesIcon className="h-5 w-5 text-purple-500" />}
          value={defaultModel}
          options={models}
          onChange={setDefaultModel}
          mode={mode}
        />
        <SettingsSelect
          title="Transkriptions-Modell"
          subtitle={mode === 'expert' ? 'AUDIO_TRANSCRIBE_MODEL' : 'Für Audio-zu-Text Konvertierung'}
          leading={<CpuChipIcon className="h-5 w-5 text-blue-500" />}
          value={transcribeModel}
          options={transcribeModels}
          onChange={setTranscribeModel}
          mode={mode}
        />
        {mode === 'expert' && (
          <>
            <SettingsRow
              title="Modell-Version"
              subtitle="Spezifische Modell-Version"
              leading={<CpuChipIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-[var(--ak-color-text-secondary)]">latest</span>}
              mode={mode}
            />
            <SettingsRow
              title="Fallback-Modell"
              subtitle="Bei Fehlern verwendetes Modell"
              leading={<ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />}
              trailing={<span className="text-sm text-[var(--ak-color-text-secondary)]">gpt-3.5-turbo</span>}
              mode={mode}
            />
          </>
        )}
      </SettingsSection>

      {/* API Configuration */}
      <SettingsSection 
        title="API-Konfiguration" 
        description={mode === 'simple' ? 'API-Schlüssel und Verbindungseinstellungen' : 'OpenAI API-Schlüssel und Authentifizierung'}
        mode={mode}
      >
        <SettingsRow
          title="OpenAI API Key"
          subtitle={mode === 'expert' ? 'OPENAI_API_KEY' : 'Für Backend-Agenten'}
          leading={<KeyIcon className="h-5 w-5 text-amber-500" />}
          trailing={
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-[var(--ak-color-text-muted)]">
                {apiKeyVisible ? 'sk-proj-...' : 'sk-proj-********************'}
              </span>
              <button
                onClick={() => setApiKeyVisible(!apiKeyVisible)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {apiKeyVisible ? 'Verbergen' : 'Anzeigen'}
              </button>
            </div>
          }
          mode={mode}
        />
        {mode === 'expert' && (
          <>
            <SettingsRow
              title="API Base URL"
              subtitle="Custom OpenAI-compatible API endpoint"
              leading={<BoltIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-[var(--ak-color-text-muted)]">https://api.openai.com/v1</span>}
              mode={mode}
            />
            <SettingsRow
              title="API Timeout"
              subtitle="Timeout für API-Anfragen in Sekunden"
              leading={<BoltIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-[var(--ak-color-text-secondary)]">30s</span>}
              mode={mode}
            />
            <SettingsRow
              title="Retry Attempts"
              subtitle="Anzahl der Wiederholungsversuche"
              leading={<BoltIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-[var(--ak-color-text-secondary)]">3</span>}
              mode={mode}
            />
          </>
        )}
      </SettingsSection>

      {/* Generation Parameters - Simple shows basic, expert shows all */}
      <SettingsSection 
        title="Generierungs-Parameter" 
        description={mode === 'simple' ? 'Grundlegende Einstellungen für KI-Generierung' : 'Detaillierte Parameter für Text-Generierung'}
        mode={mode}
      >
        <SettingsInput
          title="Temperature"
          subtitle={mode === 'expert' ? 'Kreativität (0.0-2.0)' : 'Kreativität der Antworten'}
          leading={<AdjustmentsHorizontalIcon className="h-5 w-5" />}
          value={temperature}
          onChange={setTemperature}
          type="number"
          mode={mode}
        />
        {mode === 'expert' && (
          <>
            <SettingsInput
              title="Max Tokens"
              subtitle="Maximale Anzahl von Tokens in der Antwort"
              leading={<ArrowTrendingUpIcon className="h-5 w-5" />}
              value={maxTokens}
              onChange={setMaxTokens}
              type="number"
              mode={mode}
            />
            <SettingsInput
              title="Top P"
              subtitle="Nucleus Sampling Parameter"
              leading={<AdjustmentsHorizontalIcon className="h-5 w-5" />}
              value="1.0"
              onChange={() => {}}
              type="number"
              mode={mode}
            />
            <SettingsInput
              title="Frequency Penalty"
              subtitle="Penalty für häufige Tokens"
              leading={<AdjustmentsHorizontalIcon className="h-5 w-5" />}
              value="0.0"
              onChange={() => {}}
              type="number"
              mode={mode}
            />
            <SettingsInput
              title="Presence Penalty"
              subtitle="Penalty für neue Tokens"
              leading={<AdjustmentsHorizontalIcon className="h-5 w-5" />}
              value="0.0"
              onChange={() => {}}
              type="number"
              mode={mode}
            />
          </>
        )}
      </SettingsSection>

      {/* Features - Simple mode */}
      {mode === 'simple' && (
        <SettingsSection 
          title="Features" 
          description="Aktivieren oder deaktivieren Sie KI-Features"
          mode={mode}
        >
          <SettingsToggle
            title="Streaming aktivieren"
            subtitle="Echtzeit-Antworten während der Generierung"
            leading={<BoltIcon className="h-5 w-5" />}
            checked={streaming}
            onChange={setStreaming}
            mode={mode}
          />
        </SettingsSection>
      )}

      {/* Advanced Features - Expert mode */}
      {mode === 'expert' && (
        <>
          <SettingsSection 
            title="Erweiterte Features" 
            description="Experimentelle und erweiterte KI-Funktionen"
            mode={mode}
          >
            <SettingsToggle
              title="Streaming"
              subtitle="Server-Sent Events für Echtzeit-Antworten"
              leading={<BoltIcon className="h-5 w-5" />}
              checked={streaming}
              onChange={setStreaming}
              mode={mode}
            />
            <SettingsToggle
              title="Function Calling"
              subtitle="Tools und Funktionen für Agenten"
              leading={<CpuChipIcon className="h-5 w-5" />}
              checked={true}
              onChange={() => {}}
              mode={mode}
            />
            <SettingsToggle
              title="JSON Mode"
              subtitle="Strukturierte JSON-Antworten erzwingen"
              leading={<CpuChipIcon className="h-5 w-5" />}
              checked={false}
              onChange={() => {}}
              mode={mode}
            />
            <SettingsToggle
              title="Logprobs"
              subtitle="Token-Wahrscheinlichkeiten zurückgeben"
              leading={<CpuChipIcon className="h-5 w-5" />}
              checked={false}
              onChange={() => {}}
              mode={mode}
            />
          </SettingsSection>

          <SettingsSection 
            title="Monitoring & Logging" 
            description="Überwachung und Protokollierung von API-Aufrufen"
            mode={mode}
          >
            <SettingsRow
              title="Langfuse Integration"
              subtitle="LLM Observability Platform"
              leading={<BoltIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-green-600 font-medium">Aktiv</span>}
              mode={mode}
            />
            <SettingsRow
              title="AI Shield Gateway"
              subtitle="LiteLLM Proxy für Sicherheit"
              leading={<ExclamationTriangleIcon className="h-5 w-5 text-green-500" />}
              trailing={<span className="text-sm text-green-600 font-medium">Geschützt</span>}
              mode={mode}
            />
            <SettingsRow
              title="Usage Tracking"
              subtitle="Token- und Kosten-Tracking"
              leading={<ArrowTrendingUpIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-green-600 font-medium">Aktiv</span>}
              mode={mode}
            />
          </SettingsSection>
        </>
      )}
    </div>
  )
}
