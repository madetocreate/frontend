'use client'

import { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

interface DiagnosticCheck {
  name: string
  ok: boolean
  details: Record<string, unknown>
}

interface Core7DiagnosticsResponse {
  ok: boolean
  checks: DiagnosticCheck[]
  sample_run_ids: Record<string, string | null>
}

export function Core7Diagnostics() {
  const [data, setData] = useState<Core7DiagnosticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDiagnostics = async () => {
    setLoading(true)
    setError(null)
    try {
      // SECURITY: Kein x-internal-api-key aus Browser! Admin-Session wird serverseitig verifiziert.
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const response = await authedFetch('/api/internal/admin/diagnostics/core7')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiagnostics()
  }, [])

  if (loading) {
    return (
      <div className="p-6 bg-[var(--ak-color-bg-surface)] rounded-lg shadow-sm border border-[var(--ak-color-border-fine)]">
        <div className="flex items-center gap-2 ak-text-secondary">
          <ClockIcon className="h-5 w-5 animate-spin" />
          <span>Lade Diagnostics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 ak-alert-danger rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <XCircleIcon className="h-5 w-5" />
          <span>Fehler: {error}</span>
        </div>
        <button
          onClick={fetchDiagnostics}
          className="mt-4 px-4 py-2 ak-badge-danger rounded-md hover:opacity-80 transition-opacity"
        >
          Erneut versuchen
        </button>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="p-6 bg-[var(--ak-color-bg-surface)] rounded-lg shadow-sm border border-[var(--ak-color-border-fine)]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold ak-text-primary">Core-7 Diagnostics</h2>
        <button
          onClick={fetchDiagnostics}
          className="px-4 py-2 text-sm bg-[var(--ak-color-bg-surface-muted)] ak-text-secondary rounded-md hover:bg-[var(--ak-color-bg-hover)]"
        >
          Aktualisieren
        </button>
      </div>

      {/* Overall Status */}
      <div className={`mb-6 p-4 rounded-lg ${
        data.ok ? 'ak-badge-success' : 'ak-badge-danger'
      }`}>
        <div className="flex items-center gap-2">
          {data.ok ? (
            <CheckCircleIcon className="h-6 w-6" />
          ) : (
            <XCircleIcon className="h-6 w-6" />
          )}
          <span className="font-semibold">
            {data.ok ? 'Alle Checks bestanden' : 'Einige Checks fehlgeschlagen'}
          </span>
        </div>
      </div>

      {/* Checks */}
      <div className="space-y-4">
        {data.checks.map((check) => (
          <div
            key={check.name}
            className={`p-4 rounded-lg border ${
              check.ok
                ? 'ak-badge-success'
                : 'ak-badge-danger'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {check.ok ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                <XCircleIcon className="h-5 w-5" />
              )}
              <span className="font-medium">
                {check.name}
              </span>
            </div>
            <div className="mt-2 text-sm">
              <pre className="whitespace-pre-wrap font-mono text-xs bg-[var(--ak-color-bg-surface)] p-2 rounded border border-[var(--ak-color-border-fine)] ak-text-primary">
                {JSON.stringify(check.details, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>

      {/* Sample Run IDs */}
      {Object.keys(data.sample_run_ids).length > 0 && (
        <div className="mt-6 p-4 bg-[var(--ak-color-bg-surface-muted)] rounded-lg border border-[var(--ak-color-border-fine)]">
          <h3 className="text-sm font-semibold ak-text-secondary mb-2">Sample Run IDs</h3>
          <div className="space-y-1 text-sm ak-text-secondary">
            {Object.entries(data.sample_run_ids).map(([key, value]) => (
              <div key={key}>
                <span className="font-medium">{key}:</span> {value || 'N/A'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

