'use client'

import { useState, useEffect } from 'react'
import IntegrationsDashboard from '@/components/integrations/IntegrationsDashboard'
import { getIntegrationStatus } from '@/lib/settingsClient'
import { SettingsSection, SettingsRow } from './SettingsSection'
import {
  EnvelopeIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

export function SettingsIntegrations({ mode: _mode }: { mode?: 'simple' | 'expert' }) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const [status, setStatus] = useState({
    gmail: false,
    calendar: false,
    telegram: false,
    imap: false,
    smtp: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const integrationStatus = await getIntegrationStatus()
      setStatus(integrationStatus)
      setLoading(false)
    }
    void load()
  }, [])

  if (mode === 'simple') {
    return (
      <div className="p-6 space-y-6">
        <SettingsSection
          title="Integrationen"
          description="Verbinde deine Dienste mit Aklow"
          mode={mode || 'simple'}
        >
          <SettingsRow
            title="Gmail"
            subtitle={status.gmail ? 'Verbunden' : 'Nicht verbunden'}
            leading={<EnvelopeIcon className="h-5 w-5 text-red-500" />}
            trailing={
              loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              ) : status.gmail ? (
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-gray-400" />
              )
            }
            mode={mode || 'simple'}
          />
          <SettingsRow
            title="Google Calendar"
            subtitle={status.calendar ? 'Verbunden' : 'Nicht verbunden'}
            leading={<CalendarIcon className="h-5 w-5 text-blue-500" />}
            trailing={
              loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              ) : status.calendar ? (
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-gray-400" />
              )
            }
            mode={mode || 'simple'}
          />
          <SettingsRow
            title="Telegram"
            subtitle={status.telegram ? 'Verbunden' : 'Nicht verbunden'}
            leading={<ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-400" />}
            trailing={
              loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              ) : status.telegram ? (
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-gray-400" />
              )
            }
            mode={mode || 'simple'}
          />
        </SettingsSection>

        {/* Full Dashboard for advanced configuration */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)] mb-4">
            Erweiterte Konfiguration
          </h3>
          <IntegrationsDashboard />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <IntegrationsDashboard />
    </div>
  )
}
