'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { getIntegrationById } from '@/lib/integrations/catalog';
import { loadIntegrationStatuses, setConnected } from '@/lib/integrations/storage';
import { IntegrationId, IntegrationStatus } from '@/lib/integrations/types';
import { appendWorkLog } from '@/lib/worklog/storage';
import { createWorkLogEntry } from '@/lib/worklog/helpers';

interface IntegrationSetupFlowStubProps {
  integrationId: IntegrationId;
  onBack: () => void;
}

export function IntegrationSetupFlowStub({
  integrationId,
  onBack,
}: IntegrationSetupFlowStubProps) {
  const router = useRouter();
  const integration = getIntegrationById(integrationId);
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const statuses = loadIntegrationStatuses();
    const currentStatus = statuses[integrationId];
    setStatus(currentStatus);
    setIsConnected(currentStatus?.connected === true);
  }, [integrationId]);

  if (!integration) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] transition-colors ak-icon-interactive"
          aria-label="Zur Übersicht"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <p className="text-sm text-[var(--ak-color-text-muted)]">
          Integration nicht gefunden.
        </p>
      </div>
    );
  }

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate connection delay
    setTimeout(() => {
      const now = new Date().toISOString();
      setConnected(integrationId, true, {
        connectedAt: now,
        lastEventAt: now,
      });
      setIsConnected(true);
      setIsConnecting(false);
      
      // Log WorkLog entry
      const channelMap: Record<IntegrationId, 'email' | 'telegram' | 'reviews' | 'website' | 'phone'> = {
        email: 'email',
        telegram: 'telegram',
        reviews: 'reviews',
        website_bot: 'website',
        phone_bot: 'phone',
      };
      const channel = channelMap[integrationId] || 'email';
      
      appendWorkLog(
        createWorkLogEntry({
          type: 'setup',
          channel,
          title: `Integration verbunden: ${integration?.label || integrationId}`,
          ref: { kind: 'integration', id: integrationId, href: `/actions?cat=setup&integration=${integrationId}` },
        })
      );
    }, 1000);
  };

  const handleDisconnect = () => {
    setConnected(integrationId, false);
    setIsConnected(false);
    
    // Log WorkLog entry
    const channelMap: Record<IntegrationId, 'email' | 'telegram' | 'reviews' | 'website' | 'phone'> = {
      email: 'email',
      telegram: 'telegram',
      reviews: 'reviews',
      website_bot: 'website',
      phone_bot: 'phone',
    };
    const channel = channelMap[integrationId] || 'email';
    
    appendWorkLog(
      createWorkLogEntry({
        type: 'setup',
        channel,
        title: `Integration getrennt: ${integration?.label || integrationId}`,
        ref: { kind: 'integration', id: integrationId, href: `/actions?cat=setup&integration=${integrationId}` },
      })
    );
    
    // Navigate back after disconnect
    setTimeout(() => {
      router.push('/actions?cat=setup');
    }, 500);
  };

  const handleBackToOverview = () => {
    router.push('/actions?cat=setup');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] transition-colors ak-icon-interactive"
          aria-label="Zur Übersicht"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-medium text-[var(--ak-color-text-primary)]">
          {integration.label} einrichten
        </h1>
      </div>

      {/* Connected State */}
      {isConnected && (
        <div className="p-5 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-6 rounded-full bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)] flex items-center justify-center text-xs font-medium">
              ✓
            </div>
            <h3 className="text-sm font-medium text-[var(--ak-color-text-primary)]">
              Verbunden
            </h3>
          </div>
          <p className="text-sm text-[var(--ak-color-text-muted)] ml-9 mb-4">
            {integration.label} ist erfolgreich verbunden.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToOverview}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--ak-color-text-primary)] bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] hover:opacity-90 transition-opacity"
            >
              Zur Übersicht
            </button>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 rounded-lg text-sm text-[var(--ak-color-text-secondary)] bg-[var(--ak-color-bg-surface-muted)] hover:bg-[var(--ak-color-bg-hover)] transition-colors"
            >
              Trennen (Demo)
            </button>
          </div>
        </div>
      )}

      {/* Setup Steps */}
      {!isConnected && (
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="p-5 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 rounded-full bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)] flex items-center justify-center text-xs font-medium">
                1
              </div>
              <h3 className="text-sm font-medium text-[var(--ak-color-text-primary)]">
                Zugangsdaten
              </h3>
            </div>
            <div className="ml-9 space-y-2">
              <input
                type="text"
                placeholder="API-Schlüssel (Demo)"
                disabled
                className="w-full px-3 py-2 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface-muted)] text-sm text-[var(--ak-color-text-muted)] opacity-50"
              />
              <p className="text-xs text-[var(--ak-color-text-muted)]">
                (V1) Echte Authentifizierung kommt in V2
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] opacity-60">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 rounded-full bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-muted)] flex items-center justify-center text-xs font-medium">
                2
              </div>
              <h3 className="text-sm font-medium text-[var(--ak-color-text-muted)]">
                Berechtigungen
              </h3>
            </div>
            <p className="text-sm text-[var(--ak-color-text-muted)] ml-9">
              (V1) Flow kommt als nächste Stufe
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] opacity-60">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 rounded-full bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-muted)] flex items-center justify-center text-xs font-medium">
                3
              </div>
              <h3 className="text-sm font-medium text-[var(--ak-color-text-muted)]">
                Test
              </h3>
            </div>
            <p className="text-sm text-[var(--ak-color-text-muted)] ml-9">
              (V1) Flow kommt als nächste Stufe
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      {!isConnected && (
        <div className="flex items-center gap-2 pt-4 border-t border-[var(--ak-color-border-fine)]">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg text-sm text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] transition-colors ak-button-interactive"
          >
            Abbrechen
          </button>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium text-[var(--ak-color-text-inverted)] transition-opacity',
              isConnecting
                ? 'bg-[var(--ak-color-accent)] opacity-50 cursor-not-allowed'
                : 'bg-[var(--ak-color-accent)] hover:opacity-90'
            )}
          >
            {isConnecting ? 'Verbinde...' : 'Verbinden (Demo)'}
          </button>
        </div>
      )}
    </div>
  );
}

