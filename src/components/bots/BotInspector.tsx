'use client'

import React, { ReactNode } from 'react'
import { DrawerCard, DrawerSectionTitle } from '@/components/ui/drawer-kit'
import { CheckCircleIcon, ExclamationTriangleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { AkBadge } from '@/components/ui/AkBadge'

export interface BotInspectorProps {
  health?: {
    status: 'healthy' | 'warning' | 'error'
    message: string
    lastCheck?: string
  }
  lastEvents?: Array<{
    id: string
    type: string
    message: string
    timestamp: string
  }>
  quickTests?: Array<{
    id: string
    label: string
    status: 'pass' | 'fail' | 'pending'
    onClick?: () => void
  }>
  webhookStatus?: {
    configured: boolean
    url?: string
    lastReceived?: string
  }
  credentialsStatus?: {
    configured: boolean
    provider?: string
    expiresAt?: string
  }
}

export function BotInspector({
  health,
  lastEvents,
  quickTests,
  webhookStatus,
  credentialsStatus,
}: BotInspectorProps) {
  return (
    <div className="p-4 space-y-4">
      {/* Health Status */}
      {health && (
        <DrawerCard padding="normal" title="Health">
          <div className="flex items-start gap-2">
            {health.status === 'healthy' && (
              <CheckCircleIcon className="w-5 h-5 text-[var(--ak-semantic-success)] shrink-0 mt-0.5" />
            )}
            {health.status === 'warning' && (
              <ExclamationTriangleIcon className="w-5 h-5 text-[var(--ak-semantic-warning)] shrink-0 mt-0.5" />
            )}
            {health.status === 'error' && (
              <XCircleIcon className="w-5 h-5 text-[var(--ak-semantic-error)] shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--ak-color-text-primary)]">
                {health.message}
              </p>
              {health.lastCheck && (
                <p className="text-xs text-[var(--ak-color-text-muted)] mt-1">
                  Letzte Prüfung: {health.lastCheck}
                </p>
              )}
            </div>
          </div>
        </DrawerCard>
      )}

      {/* Last Events */}
      {lastEvents && lastEvents.length > 0 && (
        <DrawerCard padding="normal" title="Letzte Events">
          <div className="space-y-2">
            {lastEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-start gap-2 text-xs">
                <ClockIcon className="w-3.5 h-3.5 text-[var(--ak-color-text-muted)] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--ak-color-text-primary)] truncate">
                    {event.message}
                  </p>
                  <p className="text-[var(--ak-color-text-muted)] mt-0.5">
                    {event.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DrawerCard>
      )}

      {/* Quick Tests */}
      {quickTests && quickTests.length > 0 && (
        <DrawerCard padding="normal" title="Quick Tests">
          <div className="space-y-2">
            {quickTests.map((test) => (
              <button
                key={test.id}
                onClick={test.onClick}
                className="w-full flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)] transition-colors text-left"
              >
                <span className="text-sm text-[var(--ak-color-text-primary)]">
                  {test.label}
                </span>
                {test.status === 'pass' && (
                  <CheckCircleIcon className="w-4 h-4 text-[var(--ak-semantic-success)]" />
                )}
                {test.status === 'fail' && (
                  <XCircleIcon className="w-4 h-4 text-[var(--ak-semantic-error)]" />
                )}
                {test.status === 'pending' && (
                  <ClockIcon className="w-4 h-4 text-[var(--ak-color-text-muted)]" />
                )}
              </button>
            ))}
          </div>
        </DrawerCard>
      )}

      {/* Webhook Status */}
      {webhookStatus && (
        <DrawerCard padding="normal" title="Webhook Status">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--ak-color-text-primary)]">
                Konfiguriert
              </span>
              <AkBadge tone={webhookStatus.configured ? 'success' : 'muted'} size="xs">
                {webhookStatus.configured ? 'Ja' : 'Nein'}
              </AkBadge>
            </div>
            {webhookStatus.url && (
              <p className="text-xs text-[var(--ak-color-text-muted)] truncate font-mono">
                {webhookStatus.url}
              </p>
            )}
            {webhookStatus.lastReceived && (
              <p className="text-xs text-[var(--ak-color-text-muted)]">
                Letzter Empfang: {webhookStatus.lastReceived}
              </p>
            )}
          </div>
        </DrawerCard>
      )}

      {/* Credentials Status */}
      {credentialsStatus && (
        <DrawerCard padding="normal" title="Credentials">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--ak-color-text-primary)]">
                Konfiguriert
              </span>
              <AkBadge tone={credentialsStatus.configured ? 'success' : 'muted'} size="xs">
                {credentialsStatus.configured ? 'Ja' : 'Nein'}
              </AkBadge>
            </div>
            {credentialsStatus.provider && (
              <p className="text-xs text-[var(--ak-color-text-muted)]">
                Provider: {credentialsStatus.provider}
              </p>
            )}
            {credentialsStatus.expiresAt && (
              <p className="text-xs text-[var(--ak-color-text-muted)]">
                Läuft ab: {credentialsStatus.expiresAt}
              </p>
            )}
          </div>
        </DrawerCard>
      )}

      {/* Empty State */}
      {!health && !lastEvents && !quickTests && !webhookStatus && !credentialsStatus && (
        <DrawerCard padding="normal">
          <p className="text-sm text-[var(--ak-color-text-muted)] text-center py-4">
            Keine Inspector-Daten verfügbar
          </p>
        </DrawerCard>
      )}
    </div>
  )
}

