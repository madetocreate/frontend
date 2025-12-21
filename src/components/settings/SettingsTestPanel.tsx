'use client'

import { useState } from 'react'
import { runSettingsSmokeTests, logSmokeTestResults, type SmokeTestResult } from '@/lib/settingsTestUtils'
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

export function SettingsTestPanel() {
  const [results, setResults] = useState<SmokeTestResult[]>([])
  const [running, setRunning] = useState(false)

  const handleRunTests = async () => {
    setRunning(true)
    const testResults = await runSettingsSmokeTests()
    setResults(testResults)
    logSmokeTestResults(testResults)
    setRunning(false)
  }

  const successCount = results.filter(r => r.success).length
  const totalCount = results.length

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
          Settings API Tests
        </h3>
        <button
          onClick={handleRunTests}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={clsx('h-4 w-4', running && 'animate-spin')} />
          {running ? 'Läuft...' : 'Tests ausführen'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-[var(--ak-color-text-secondary)]">
            Ergebnis: {successCount}/{totalCount} Tests erfolgreich
          </div>
          {results.map((result, index) => (
            <div
              key={index}
              className={clsx(
                'flex items-center justify-between p-3 rounded-lg border',
                result.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              )}
            >
              <div className="flex items-center gap-3">
                {result.success ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <div className="font-medium text-[var(--ak-color-text-primary)]">
                    {result.name}
                  </div>
                  {result.error && (
                    <div className="text-xs text-red-600 mt-1">{result.error}</div>
                  )}
                </div>
              </div>
              <div className="text-xs text-[var(--ak-color-text-secondary)]">
                {result.duration}ms
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

