'use client'

import { useState } from 'react'
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  FingerPrintIcon,
  ClockIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  KeyIcon
} from '@heroicons/react/24/outline'
import { SettingsSection, SettingsRow, SettingsToggle, SettingsInput } from './SettingsSection'

type SettingsMode = 'simple' | 'expert'

export function SettingsSecurity({ mode }: { mode: SettingsMode }) {
  const [shieldEnabled, setShieldEnabled] = useState(true)
  const [humanInLoop, setHumanInLoop] = useState(true)
  const [rateLimitGlobal, setRateLimitGlobal] = useState('120')
  const [rateLimitPerActor, setRateLimitPerActor] = useState('60')
  const [sensitiveActions, setSensitiveActions] = useState({
    memory_delete: true,
    crm_create_deal: true,
    crm_log_call: true,
    crm_delete_contact: true
  })

  return (
    <div className="p-6 space-y-6">
      {/* AI Shield Configuration */}
      <SettingsSection 
        title="AI Shield" 
        description={mode === 'simple' ? 'Sicherheitsschutz für Ihre KI-Anwendungen' : 'LiteLLM Proxy und Gateway-Konfiguration'}
        mode={mode}
      >
        <SettingsRow
          title="Gateway Status"
          subtitle={mode === 'expert' ? 'LiteLLM Proxy Status' : 'Sicherheits-Gateway'}
          leading={<ShieldCheckIcon className="h-5 w-5 text-green-500" />}
          trailing={<span className="text-sm text-green-600 font-medium">Geschützt</span>}
          mode={mode}
        />
        <SettingsToggle
          title="AI Shield aktivieren"
          subtitle={mode === 'expert' ? 'PII-Maskierung und Content-Filter' : 'Automatischer Schutz aktivieren'}
          leading={<ShieldCheckIcon className="h-5 w-5" />}
          checked={shieldEnabled}
          onChange={setShieldEnabled}
          mode={mode}
        />
        {mode === 'expert' && (
          <>
            <SettingsRow
              title="Callbacks"
              subtitle="Active Logging Services"
              leading={<FingerPrintIcon className="h-5 w-5" />}
              trailing={
                <div className="flex gap-1">
                  <span className="px-2 py-1 bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] text-xs rounded">langfuse</span>
                  <span className="px-2 py-1 bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] text-xs rounded">ai_shield</span>
                </div>
              }
              mode={mode}
            />
            <SettingsRow
              title="PII Detection"
              subtitle="Personenbezogene Daten erkennen"
              leading={<FingerPrintIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-green-600 font-medium">Aktiv</span>}
              mode={mode}
            />
            <SettingsRow
              title="Content Filtering"
              subtitle="Inhaltsfilterung aktiv"
              leading={<ShieldCheckIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-green-600 font-medium">Aktiv</span>}
              mode={mode}
            />
          </>
        )}
      </SettingsSection>

      {/* Human-in-the-Loop */}
      <SettingsSection 
        title="Human-in-the-Loop" 
        description={mode === 'simple' ? 'Wichtige Aktionen erfordern Bestätigung' : 'Sensitive Aktionen erfordern explizite Zustimmung'}
        mode={mode}
      >
        <SettingsToggle
          title="Human-in-the-Loop aktivieren"
          subtitle={mode === 'expert' ? 'Alle sensiblen Aktionen' : 'Bestätigung für wichtige Aktionen'}
          leading={<LockClosedIcon className="h-5 w-5" />}
          checked={humanInLoop}
          onChange={setHumanInLoop}
          mode={mode}
        />
        {humanInLoop && mode === 'expert' && (
          <>
            <SettingsToggle
              title="Memory Delete"
              subtitle="memory_delete"
              leading={<ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />}
              checked={sensitiveActions.memory_delete}
              onChange={(checked) => setSensitiveActions({ ...sensitiveActions, memory_delete: checked })}
              mode={mode}
            />
            <SettingsToggle
              title="CRM Create Deal"
              subtitle="crm_create_deal"
              leading={<ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />}
              checked={sensitiveActions.crm_create_deal}
              onChange={(checked) => setSensitiveActions({ ...sensitiveActions, crm_create_deal: checked })}
              mode={mode}
            />
            <SettingsToggle
              title="CRM Log Call"
              subtitle="crm_log_call"
              leading={<ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />}
              checked={sensitiveActions.crm_log_call}
              onChange={(checked) => setSensitiveActions({ ...sensitiveActions, crm_log_call: checked })}
              mode={mode}
            />
            <SettingsToggle
              title="CRM Delete Contact"
              subtitle="crm_delete_contact"
              leading={<ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />}
              checked={sensitiveActions.crm_delete_contact}
              onChange={(checked) => setSensitiveActions({ ...sensitiveActions, crm_delete_contact: checked })}
              mode={mode}
            />
          </>
        )}
      </SettingsSection>

      {/* Rate Limits */}
      <SettingsSection 
        title="Rate Limits" 
        description={mode === 'simple' ? 'Schutz vor Überlastung' : 'API-Rate-Limiting Konfiguration'}
        mode={mode}
      >
        <SettingsInput
          title="Global Limit"
          subtitle={mode === 'expert' ? 'default_per_minute' : 'Anfragen pro Minute (gesamt)'}
          leading={<ClockIcon className="h-5 w-5" />}
          value={rateLimitGlobal}
          onChange={setRateLimitGlobal}
          type="number"
          mode={mode}
        />
        <SettingsInput
          title="Per Actor Limit"
          subtitle={mode === 'expert' ? 'per_actor_per_minute' : 'Anfragen pro Minute (pro Nutzer)'}
          leading={<UsersIcon className="h-5 w-5" />}
          value={rateLimitPerActor}
          onChange={setRateLimitPerActor}
          type="number"
          mode={mode}
        />
        {mode === 'expert' && (
          <>
            <SettingsRow
              title="Burst Limit"
              subtitle="Maximale Anfragen in kurzer Zeit"
              leading={<ClockIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-[var(--ak-color-text-secondary)]">30 req/10s</span>}
              mode={mode}
            />
            <SettingsRow
              title="Rate Limit Strategy"
              subtitle="Limiting-Strategie"
              leading={<ClockIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-[var(--ak-color-text-secondary)]">Token Bucket</span>}
              mode={mode}
            />
          </>
        )}
      </SettingsSection>

      {/* Authentication - Expert mode */}
      {mode === 'expert' && (
        <SettingsSection 
          title="Authentifizierung" 
          description="API-Schlüssel und Authentifizierungseinstellungen"
          mode={mode}
        >
          <SettingsRow
            title="API Key Rotation"
            subtitle="Automatische Rotation von API-Schlüsseln"
            leading={<KeyIcon className="h-5 w-5" />}
            trailing={<span className="text-sm text-[var(--ak-color-text-muted)]">Nicht aktiviert</span>}
            mode={mode}
          />
          <SettingsRow
            title="Session Timeout"
            subtitle="Timeout für Benutzer-Sessions"
            leading={<ClockIcon className="h-5 w-5" />}
            trailing={<span className="text-sm text-[var(--ak-color-text-secondary)]">24 Stunden</span>}
            mode={mode}
          />
          <SettingsRow
            title="2FA Required"
            subtitle="Zwei-Faktor-Authentifizierung erforderlich"
            leading={<LockClosedIcon className="h-5 w-5" />}
            trailing={<span className="text-sm text-[var(--ak-color-text-muted)]">Optional</span>}
            mode={mode}
          />
        </SettingsSection>
      )}
    </div>
  )
}
