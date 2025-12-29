'use client'

import { useState, useEffect } from 'react'
import { 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  FingerPrintIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { SettingsSection, SettingsRow, SettingsToggle } from '../settings/SettingsSection'
import { getAIShieldSettings, updateAIShieldSettings, type AIShieldSettings } from '@/lib/settingsClient'
import { useDebounce } from '@/hooks/useDebounce'

type SettingsMode = 'simple' | 'expert'

export function ShieldSettings({ mode }: { mode: SettingsMode }) {
  const [enabled, setEnabled] = useState(false)
  const [controlPlaneUrl, setControlPlaneUrl] = useState<string>('')
  const [presetSelection, setPresetSelection] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  
  // Load settings on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const settings = await getAIShieldSettings()
      if (settings) {
        setEnabled(settings.enabled ?? false)
        setControlPlaneUrl(settings.control_plane_url || '')
        setPresetSelection(settings.preset_selection || '')
      }
      setLoading(false)
    }
    void load()
  }, [])

  // Save function
  const saveSettingsData = async (settings: Partial<AIShieldSettings>) => {
    setSaving(true)
    setSaveError(null)
    try {
      const success = await updateAIShieldSettings({
        enabled: settings.enabled,
        control_plane_url: settings.control_plane_url,
        preset_selection: settings.preset_selection,
        integrations_enabled: settings.integrations_enabled,
      })
      if (!success) {
        setSaveError('Fehler beim Speichern der Einstellungen')
      }
    } catch (error) {
      console.error('Failed to save AI Shield settings:', error)
      setSaveError('Fehler beim Speichern der Einstellungen')
    } finally {
      setSaving(false)
    }
  }

  // Debounced save function
  const debouncedSave = useDebounce(async (...args: unknown[]) => {
    const settings = args[0] as Partial<AIShieldSettings>
    await saveSettingsData(settings)
  }, 1000)

  // Save when settings change (only after initial load)
  const [hasLoaded, setHasLoaded] = useState(false)
  
  useEffect(() => {
    if (!loading) {
      setHasLoaded(true)
    }
  }, [loading])

  useEffect(() => {
    if (hasLoaded && !loading) {
      void debouncedSave({
        enabled,
        control_plane_url: controlPlaneUrl || null,
        preset_selection: presetSelection || null,
      })
    }
  }, [enabled, controlPlaneUrl, presetSelection, hasLoaded, loading, debouncedSave])

  // Derived state for UI (based on enabled flag and preset)
  const piiDetection = enabled
  const contentFiltering = enabled
  const auditLogging = enabled

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-sm text-[var(--ak-color-text-secondary)]">Lade Einstellungen...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {saveError && (
        <div className="bg-[var(--ak-semantic-danger-soft)] border border-[var(--ak-semantic-danger-soft)] text-[var(--ak-semantic-danger)] px-4 py-3 rounded-md text-sm">
          {saveError}
        </div>
      )}
      {saving && (
        <div className="bg-[var(--ak-semantic-info-soft)] border border-[var(--ak-semantic-info-soft)] text-[var(--ak-semantic-info)] px-4 py-3 rounded-md text-sm">
          Speichere Einstellungen...
        </div>
      )}
      
      {/* Coming Soon Notice */}
      <div className="bg-[var(--ak-semantic-warning-soft)] border border-[var(--ak-semantic-warning)]/50 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-[var(--ak-semantic-warning)] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)] mb-1">
              UI-basierte Konfiguration: Coming Soon
            </h3>
            <p className="text-sm text-[var(--ak-color-text-secondary)] mb-2">
              Die UI-Einstellungen werden aktuell noch nicht für das Routing genutzt. AI Shield wird derzeit über Umgebungsvariablen konfiguriert (<code className="text-xs bg-[var(--ak-color-bg-surface)] px-1 py-0.5 rounded">AI_SHIELD_ENABLED</code>).
            </p>
            {mode === 'expert' && (
              <p className="text-xs text-[var(--ak-color-text-muted)]">
                Die hier gespeicherten Einstellungen werden in einer zukünftigen Version für tenant-spezifische Konfiguration genutzt.
              </p>
            )}
          </div>
        </div>
      </div>

      <SettingsSection 
        title="AI Shield" 
        description={mode === 'simple' ? 'Sicherheitsschutz für Ihre KI-Anwendungen' : 'LiteLLM Proxy und Gateway-Konfiguration (Coming Soon)'}
        mode={mode}
      >
        <SettingsToggle
          title="AI Shield aktivieren"
          subtitle={mode === 'expert' ? 'PII-Maskierung und Content-Filter (Coming Soon)' : 'Automatischer Schutz aktivieren (Coming Soon)'}
          leading={<ShieldCheckIcon className="h-5 w-5" />}
          checked={enabled}
          onChange={setEnabled}
          mode={mode}
          disabled={true}
        />
        
        {mode === 'expert' && enabled && (
          <>
            <SettingsRow
              title="Control Plane URL"
              subtitle="URL des AI Shield Control Planes (Coming Soon)"
              leading={<ShieldCheckIcon className="h-5 w-5" />}
              trailing={
                  <input
                    type="text"
                    value={controlPlaneUrl}
                    onChange={(e) => setControlPlaneUrl(e.target.value)}
                    placeholder="http://localhost:4051"
                    className="text-sm px-2 py-1 border rounded bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] min-w-[200px] opacity-50 cursor-not-allowed"
                    disabled={true}
                  />
              }
              mode={mode}
            />
            <SettingsRow
              title="Preset"
              subtitle="Verwendetes Policy-Preset (Coming Soon)"
              leading={<ShieldCheckIcon className="h-5 w-5" />}
              trailing={
                  <input
                    type="text"
                    value={presetSelection}
                    onChange={(e) => setPresetSelection(e.target.value)}
                    placeholder="kmu_standard"
                    className="text-sm px-2 py-1 border rounded bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] min-w-[150px] opacity-50 cursor-not-allowed"
                    disabled={true}
                  />
              }
              mode={mode}
            />
          </>
        )}
      </SettingsSection>

      {enabled && (
        <SettingsSection 
          title="PII-Schutz" 
          description={mode === 'simple' ? 'Automatische Erkennung und Maskierung von personenbezogenen Daten (Coming Soon)' : 'Personenbezogene Daten (PII) erkennen und schützen (Coming Soon)'}
          mode={mode}
        >
          <SettingsToggle
            title="PII-Erkennung aktivieren"
            subtitle={mode === 'expert' ? 'Automatische Erkennung von E-Mails, Telefonnummern, etc. (Coming Soon)' : 'Schutz vor Datenlecks (Coming Soon)'}
            leading={<FingerPrintIcon className="h-5 w-5" />}
            checked={piiDetection}
            onChange={() => {}} // Controlled by enabled
            mode={mode}
            disabled={true}
          />
          {mode === 'expert' && (
          <>
            <SettingsRow
              title="Erkannte PII-Typen"
              subtitle="Aktuell überwachte Datentypen"
              leading={<FingerPrintIcon className="h-5 w-5" />}
              trailing={
                <div className="flex gap-1">
                  <span className="px-2 py-1 bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] text-xs rounded">E-Mail</span>
                  <span className="px-2 py-1 bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] text-xs rounded">Telefon</span>
                  <span className="px-2 py-1 bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] text-xs rounded">IBAN</span>
                </div>
              }
              mode={mode}
            />
            <SettingsRow
              title="Maskierungs-Strategie"
              subtitle="Wie PII maskiert wird"
              leading={<LockClosedIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-[var(--ak-color-text-secondary)]">Partial Masking</span>}
              mode={mode}
            />
          </>
        )}
      </SettingsSection>
      )}

      {enabled && (
        <SettingsSection 
          title="Content-Filtering" 
          description={mode === 'simple' ? 'Automatische Filterung unangemessener Inhalte (Coming Soon)' : 'Inhaltsfilterung und Policy-Enforcement (Coming Soon)'}
          mode={mode}
        >
          <SettingsToggle
            title="Content-Filtering aktivieren"
            subtitle={mode === 'expert' ? 'Automatische Filterung basierend auf Policies (Coming Soon)' : 'Schutz vor unangemessenen Inhalten (Coming Soon)'}
            leading={<ShieldCheckIcon className="h-5 w-5" />}
            checked={contentFiltering}
            onChange={() => {}} // Controlled by enabled
            mode={mode}
            disabled={true}
          />
          {mode === 'expert' && (
          <>
            <SettingsRow
              title="Aktive Policies"
              subtitle="Anzahl der aktiven Filter-Policies"
              leading={<ShieldCheckIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-[var(--ak-color-text-secondary)]">---</span>}
              mode={mode}
            />
            <SettingsRow
              title="Blockierte Anfragen (heute)"
              subtitle="Anzahl der heute blockierten Anfragen"
              leading={<ExclamationTriangleIcon className="h-5 w-5 text-[var(--ak-semantic-danger)]" />}
              trailing={<span className="text-sm text-[var(--ak-color-text-secondary)]">---</span>}
              mode={mode}
            />
          </>
        )}
      </SettingsSection>
      )}

      {enabled && mode === 'expert' && (
        <SettingsSection 
          title="Audit & Logging" 
          description="Protokollierung und Überwachung"
          mode={mode}
        >
          <SettingsToggle
            title="Audit-Logging"
            subtitle="Alle Anfragen protokollieren"
            leading={<FingerPrintIcon className="h-5 w-5" />}
            checked={auditLogging}
            onChange={() => {}} // Controlled by enabled
            mode={mode}
          />
          <SettingsRow
            title="Log-Retention"
            subtitle="Aufbewahrungsdauer für Logs"
            leading={<FingerPrintIcon className="h-5 w-5" />}
            trailing={<span className="text-sm text-[var(--ak-color-text-secondary)]">90 Tage</span>}
            mode={mode}
          />
        </SettingsSection>
      )}
    </div>
  )
}

