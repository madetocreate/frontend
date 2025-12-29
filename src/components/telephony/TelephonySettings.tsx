'use client'

import { useState } from 'react'
import { 
  PhoneIcon,
  ClockIcon,
  UserGroupIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline'
import { SettingsSection, SettingsRow, SettingsToggle, SettingsSelect, SettingsInput } from '../settings/SettingsSection'

type SettingsMode = 'simple' | 'expert'

export function TelephonySettings({ mode }: { mode: SettingsMode }) {
  const [maxCallDuration, setMaxCallDuration] = useState('900')
  const [rateLimit, setRateLimit] = useState('60')
  const [voicemailEnabled, setVoicemailEnabled] = useState(true)
  const [modeType, setModeType] = useState('support')

  return (
    <div className="p-6 space-y-6">
      <SettingsSection 
        title="Anruf-Konfiguration" 
        description={mode === 'simple' ? 'Grundlegende Telefonie-Einstellungen' : 'Telefonie-Modus und Anruf-Parameter'}
        mode={mode}
      >
        <SettingsSelect
          title="Telefonie-Modus"
          subtitle={mode === 'expert' ? 'TELEPHONY_MODE' : 'Art der Anrufbehandlung'}
          leading={<PhoneIcon className="h-5 w-5 text-[var(--ak-semantic-info)]" />}
          value={modeType}
          options={[
            { value: 'support', label: 'Support & Anfragen' },
            { value: 'appointment', label: 'Termine' },
            { value: 'voicemail', label: 'Voicemail' }
          ]}
          onChange={setModeType}
          mode={mode}
        />
        <SettingsInput
          title="Max. Anrufdauer"
          subtitle={mode === 'expert' ? 'TELEPHONY_MAX_CALL_DURATION_SECONDS (Sekunden)' : 'Maximale Dauer eines Anrufs'}
          leading={<ClockIcon className="h-5 w-5" />}
          value={maxCallDuration}
          onChange={setMaxCallDuration}
          type="number"
          mode={mode}
        />
        <SettingsInput
          title="Rate Limit"
          subtitle={mode === 'expert' ? 'TELEPHONY_RATE_LIMIT_CALLS_PER_MINUTE' : 'Anrufe pro Minute'}
          leading={<UserGroupIcon className="h-5 w-5" />}
          value={rateLimit}
          onChange={setRateLimit}
          type="number"
          mode={mode}
        />
      </SettingsSection>

      <SettingsSection 
        title="Features" 
        description={mode === 'simple' ? 'Verfügbare Telefonie-Features' : 'Erweiterte Telefonie-Funktionen'}
        mode={mode}
      >
        <SettingsToggle
          title="Voicemail aktivieren"
          subtitle={mode === 'expert' ? 'Automatische Voicemail-Aufnahme' : 'Voicemail für verpasste Anrufe'}
          leading={<MicrophoneIcon className="h-5 w-5" />}
          checked={voicemailEnabled}
          onChange={setVoicemailEnabled}
          mode={mode}
        />
        {mode === 'expert' && (
          <>
            <SettingsToggle
              title="Call Recording"
              subtitle="Anrufe automatisch aufzeichnen"
              leading={<MicrophoneIcon className="h-5 w-5" />}
              checked={false}
              onChange={() => {}}
              mode={mode}
            />
            <SettingsToggle
              title="Transkription"
              subtitle="Automatische Spracherkennung"
              leading={<MicrophoneIcon className="h-5 w-5" />}
              checked={true}
              onChange={() => {}}
              mode={mode}
            />
            <SettingsRow
              title="Transkriptions-Modell"
              subtitle="Verwendetes Modell für Spracherkennung"
              leading={<MicrophoneIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-[var(--ak-color-text-secondary)]">gpt-4o-mini-transcribe</span>}
              mode={mode}
            />
          </>
        )}
      </SettingsSection>

      {mode === 'expert' && (
        <SettingsSection 
          title="Erweiterte Konfiguration" 
          description="Technische Einstellungen für Experten"
          mode={mode}
        >
          <SettingsRow
            title="Realtime API Endpoint"
            subtitle="OpenAI Realtime API Endpoint"
            leading={<PhoneIcon className="h-5 w-5" />}
            trailing={<span className="text-sm text-[var(--ak-color-text-muted)] font-mono">wss://api.openai.com/v1/realtime</span>}
            mode={mode}
          />
            <SettingsRow
              title="Session Timeout"
              subtitle="Timeout für Anruf-Sessions"
              leading={<ClockIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-[var(--ak-color-text-secondary)]">300s</span>}
              mode={mode}
            />
        </SettingsSection>
      )}
    </div>
  )
}

