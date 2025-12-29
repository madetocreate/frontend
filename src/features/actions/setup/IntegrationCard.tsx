'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { IntegrationCatalogItem } from '@/lib/integrations/catalog';
import { IntegrationStatus } from '@/lib/integrations/types';
import { setConnected } from '@/lib/integrations/storage';
import { appendWorkLog } from '@/lib/worklog/storage';
import { createWorkLogEntry } from '@/lib/worklog/helpers';

interface IntegrationCardProps {
  integration: IntegrationCatalogItem;
  status: IntegrationStatus;
  onStatusChange: () => void;
}

export function IntegrationCard({
  integration,
  status,
  onStatusChange,
}: IntegrationCardProps) {
  const router = useRouter();
  const [testResult, setTestResult] = useState<string | null>(null);
  const isConnected = status.connected === true;

  const handleConnect = () => {
    router.push(`/actions?cat=setup&integration=${integration.id}`);
  };

  const handleTest = () => {
    // Demo: Test erfolgreich
    setTestResult('Test erfolgreich (Demo)');
    setTimeout(() => setTestResult(null), 3000);
    
    // Log WorkLog entry
    appendWorkLog(
      createWorkLogEntry({
        type: 'executed',
        channel: integration.id === 'phone_bot' ? 'phone' : integration.id === 'website_bot' ? 'website' : integration.id,
        title: `Integration getestet: ${integration.label}`,
        ref: { kind: 'integration', id: integration.id, href: `/actions?cat=setup&integration=${integration.id}` },
      })
    );
  };

  const handleDisconnect = () => {
    setConnected(integration.id, false);
    onStatusChange();
    
    // Log WorkLog entry
    appendWorkLog(
      createWorkLogEntry({
        type: 'setup',
        channel: integration.id === 'phone_bot' ? 'phone' : integration.id === 'website_bot' ? 'website' : integration.id,
        title: `Integration getrennt: ${integration.label}`,
        ref: { kind: 'integration', id: integration.id, href: `/actions?cat=setup&integration=${integration.id}` },
      })
    );
  };

  return (
    <div className="bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-fine)] rounded-[var(--ak-radius-lg)] p-5 hover:border-[var(--ak-color-border-subtle)] transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-medium text-[var(--ak-color-text-primary)]">
              {integration.label}
            </h3>
            {/* Status Pill */}
            <div
              className={clsx(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium',
                isConnected
                  ? 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)]'
                  : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-muted)]'
              )}
            >
              {isConnected && <CheckCircleIcon className="w-3 h-3" />}
              {isConnected ? 'Verbunden' : 'Nicht verbunden'}
            </div>
          </div>
          <p className="text-sm text-[var(--ak-color-text-muted)]">
            {integration.description}
          </p>
          {status.connectedAt && (
            <p className="text-xs text-[var(--ak-color-text-muted)] mt-1">
              Verbunden am {new Date(status.connectedAt).toLocaleDateString('de-DE')}
            </p>
          )}
        </div>
      </div>

      {/* Test Result (Demo) */}
      {testResult && (
        <div className="mb-3 p-2 rounded-[var(--ak-radius-md)] bg-[var(--ak-color-bg-surface-muted)] text-xs text-[var(--ak-color-text-secondary)]">
          {testResult}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-[var(--ak-color-border-fine)]">
        {!isConnected ? (
          <>
            <button
              onClick={handleConnect}
              className="px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] rounded-[var(--ak-radius-md)] hover:opacity-90 transition-opacity"
            >
              Verbinden
            </button>
            <button
              onClick={handleConnect}
              className="px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-secondary)] bg-[var(--ak-color-bg-surface-muted)] hover:bg-[var(--ak-color-bg-hover)] rounded-[var(--ak-radius-md)] transition-colors"
            >
              Setup Guide
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleTest}
              className="px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] rounded-[var(--ak-radius-md)] hover:opacity-90 transition-opacity"
            >
              Testen
            </button>
            <button
              onClick={() => router.push(`/actions?cat=setup&integration=${integration.id}`)}
              className="px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-secondary)] bg-[var(--ak-color-bg-surface-muted)] hover:bg-[var(--ak-color-bg-hover)] rounded-[var(--ak-radius-md)] transition-colors"
            >
              Einstellungen
            </button>
            <button
              onClick={handleDisconnect}
              className="px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-muted)] bg-[var(--ak-color-bg-surface-muted)] hover:bg-[var(--ak-color-bg-hover)] rounded-[var(--ak-radius-md)] transition-colors"
            >
              Trennen
            </button>
          </>
        )}
      </div>
    </div>
  );
}

