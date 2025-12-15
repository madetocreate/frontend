'use client'

import { useState } from 'react'
import { 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  FingerPrintIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { SettingsSection, SettingsRow, SettingsToggle } from '../settings/SettingsSection'

type SettingsMode = 'simple' | 'expert'

export function ShieldSettings({ mode }: { mode: SettingsMode }) {
  const [piiDetection, setPiiDetection] = useState(true)
  const [contentFiltering, setContentFiltering] = useState(true)
  const [auditLogging, setAuditLogging] = useState(true)

  return (
    <div className="p-6 space-y-6">
      <SettingsSection 
        title="PII-Schutz" 
        description={mode === 'simple' ? 'Automatische Erkennung und Maskierung von personenbezogenen Daten' : 'Personenbezogene Daten (PII) erkennen und schützen'}
        mode={mode}
      >
        <SettingsToggle
          title="PII-Erkennung aktivieren"
          subtitle={mode === 'expert' ? 'Automatische Erkennung von E-Mails, Telefonnummern, etc.' : 'Schutz vor Datenlecks'}
          leading={<FingerPrintIcon className="h-5 w-5" />}
          checked={piiDetection}
          onChange={setPiiDetection}
          mode={mode}
        />
        {mode === 'expert' && (
          <>
            <SettingsRow
              title="Erkannte PII-Typen"
              subtitle="Aktuell überwachte Datentypen"
              leading={<FingerPrintIcon className="h-5 w-5" />}
              trailing={
                <div className="flex gap-1">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">E-Mail</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Telefon</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">IBAN</span>
                </div>
              }
              mode={mode}
            />
            <SettingsRow
              title="Maskierungs-Strategie"
              subtitle="Wie PII maskiert wird"
              leading={<LockClosedIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-gray-600">Partial Masking</span>}
              mode={mode}
            />
          </>
        )}
      </SettingsSection>

      <SettingsSection 
        title="Content-Filtering" 
        description={mode === 'simple' ? 'Automatische Filterung unangemessener Inhalte' : 'Inhaltsfilterung und Policy-Enforcement'}
        mode={mode}
      >
        <SettingsToggle
          title="Content-Filtering aktivieren"
          subtitle={mode === 'expert' ? 'Automatische Filterung basierend auf Policies' : 'Schutz vor unangemessenen Inhalten'}
          leading={<ShieldCheckIcon className="h-5 w-5" />}
          checked={contentFiltering}
          onChange={setContentFiltering}
          mode={mode}
        />
        {mode === 'expert' && (
          <>
            <SettingsRow
              title="Aktive Policies"
              subtitle="Anzahl der aktiven Filter-Policies"
              leading={<ShieldCheckIcon className="h-5 w-5" />}
              trailing={<span className="text-sm text-gray-600">12</span>}
              mode={mode}
            />
            <SettingsRow
              title="Blockierte Anfragen (heute)"
              subtitle="Anzahl der heute blockierten Anfragen"
              leading={<ExclamationTriangleIcon className="h-5 w-5 text-red-500" />}
              trailing={<span className="text-sm text-gray-600">3</span>}
              mode={mode}
            />
          </>
        )}
      </SettingsSection>

      {mode === 'expert' && (
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
            onChange={setAuditLogging}
            mode={mode}
          />
          <SettingsRow
            title="Log-Retention"
            subtitle="Aufbewahrungsdauer für Logs"
            leading={<FingerPrintIcon className="h-5 w-5" />}
            trailing={<span className="text-sm text-gray-600">90 Tage</span>}
            mode={mode}
          />
        </SettingsSection>
      )}
    </div>
  )
}

