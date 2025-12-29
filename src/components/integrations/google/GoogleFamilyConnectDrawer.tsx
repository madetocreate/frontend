'use client'

import { useState } from 'react'
import { CheckCircleIcon, PlusIcon } from '@heroicons/react/24/outline'
import { IntegrationCatalogItem } from '@/lib/integrations/catalog'
import { Loader2 } from 'lucide-react'

interface GoogleFamilyConnectDrawerProps {
  integration: IntegrationCatalogItem
  connections: any[]
  onConnect: (key: string) => void
  onDisconnect: (key: string) => void
  onClose: () => void
}

export function GoogleFamilyConnectDrawer({
  integration,
  connections,
  onConnect,
  onDisconnect,
  onClose
}: GoogleFamilyConnectDrawerProps) {
  const [connecting, setConnecting] = useState<string | null>(null)

  const handleAction = async (childKey: string, isConnected: boolean) => {
    if (isConnected) {
      onDisconnect(childKey)
    } else {
      setConnecting(childKey)
      await onConnect(childKey)
      setConnecting(null)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[var(--ak-bg-surface)]">
      {/* Header */}
      <div className="p-6 border-b border-[var(--ak-border-default)]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl font-bold">
              G
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--ak-text-primary)]">Google Integrationen</h2>
              <p className="text-sm text-[var(--ak-text-secondary)]">Verwalte deine Google-Verbindungen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--ak-bg-surface-2)] transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <p className="text-[var(--ak-text-primary)] mb-6">
          Verbinde einzelne Google-Dienste, um AKLOW Zugriff auf Kalender, Dateien oder Kontakte zu geben.
        </p>

        <div className="space-y-4">
          {integration.children?.map((child) => {
            const isConnected = connections.some((c) => c.key === child.id && c.status === 'connected')
            const isComingSoon = child.availability === 'coming_soon'
            const isConnecting = connecting === child.id

            return (
              <div
                key={child.id}
                className="p-4 rounded-xl border border-[var(--ak-border-default)] bg-[var(--ak-bg-surface-1)] hover:border-[var(--ak-color-accent)]/50 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[var(--ak-text-primary)]">{child.title}</h3>
                    {isConnected && (
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--ak-semantic-success)] bg-[var(--ak-semantic-success-soft)] px-2 py-0.5 rounded-full">
                        Verbunden
                      </span>
                    )}
                    {isComingSoon && (
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--ak-text-secondary)] bg-[var(--ak-bg-surface-2)] px-2 py-0.5 rounded-full">
                        Bald
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--ak-text-secondary)]">{child.description}</p>
                </div>

                <div>
                  {isComingSoon ? (
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-lg bg-[var(--ak-bg-surface-2)] text-[var(--ak-text-muted)] text-sm font-medium cursor-not-allowed"
                    >
                      Bald verfügbar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction(child.id, isConnected)}
                      disabled={isConnecting}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        isConnected
                          ? 'bg-[var(--ak-bg-surface-2)] text-[var(--ak-text-primary)] hover:bg-[var(--ak-bg-surface-3)] border border-[var(--ak-border-default)]'
                          : 'bg-[var(--ak-color-accent)] text-[var(--ak-text-inverted)] hover:opacity-90'
                      }`}
                    >
                      {isConnecting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isConnected ? (
                        <>
                          Trenne
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-4 w-4" />
                          Verbinden
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
