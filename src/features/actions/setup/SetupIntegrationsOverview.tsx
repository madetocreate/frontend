'use client';

import { useState, useEffect, useMemo } from 'react';
import { INTEGRATIONS_CATALOG } from '@/lib/integrations/catalog';
import { IntegrationCard } from './IntegrationCard';
import type { IntegrationId, IntegrationStatus } from '@/lib/integrations/types';

export function SetupIntegrationsOverview() {
  const [statuses, setStatuses] = useState<Record<IntegrationId, IntegrationStatus>>({} as Record<IntegrationId, IntegrationStatus>);
  const [loading, setLoading] = useState(true);
  const [notConfigured, setNotConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const res = await authedFetch('/api/integrations/nango/status', { cache: 'no-store' });
      if (res.status === 503) {
        setNotConfigured(true);
        setStatuses({} as Record<IntegrationId, IntegrationStatus>);
        setLoading(false);
        return;
      }
      const data = await res.json().catch(() => ({}));
      // Expect data.connections? from platform route; fallback to map by provider_config_key/provider
      const next: Record<IntegrationId, IntegrationStatus> = {} as Record<IntegrationId, IntegrationStatus>;
      if (Array.isArray(data.connections)) {
        for (const conn of data.connections) {
          const provider = (conn.provider_config_key || conn.provider || '') as IntegrationId;
          if (provider) {
            next[provider] = { id: provider, connected: true };
          }
        }
      } else if (Array.isArray(data?.integrations)) {
        // no status info, keep empty
      }
      setStatuses(next);
    } catch (e) {
      setError('Status konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStatus();
  }, []);

  const handleStatusChange = () => {
    void fetchStatus();
  };

  // Sort: Nicht verbunden zuerst, dann Verbunden
  const sortedIntegrations = useMemo(() => {
    return [...INTEGRATIONS_CATALOG].sort((a, b) => {
      const statusA = statuses[a.id];
      const statusB = statuses[b.id];
      const connectedA = statusA?.connected === true;
      const connectedB = statusB?.connected === true;

      // Nicht verbunden zuerst
      if (!connectedA && connectedB) return -1;
      if (connectedA && !connectedB) return 1;
      return 0;
    });
  }, [statuses]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-medium text-[var(--ak-color-text-primary)] mb-1">
          Setup & Integrationen
        </h1>
        <p className="text-sm text-[var(--ak-color-text-muted)]">
          Verbinde Kanäle und Bots. Status wird in Einstellungen angezeigt.
        </p>
        {notConfigured && (
          <div className="mt-3 text-sm text-[var(--ak-color-text-muted)]">
            Nango ist noch nicht konfiguriert. Bitte NANGO_HOST / NANGO_SECRET_KEY setzen.
          </div>
        )}
        {error && (
          <div className="mt-3 text-sm text-[var(--ak-color-danger)]">
            {error}
          </div>
        )}
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedIntegrations.map((integration) => {
          const status = statuses[integration.id];
          if (!status && notConfigured) {
            // Show as disabled placeholder
            return (
              <div
                key={integration.id}
                className="opacity-60 ak-bg-surface-1 ak-border-default border rounded-lg p-4"
              >
                <div className="font-semibold">{integration.label}</div>
                <div className="text-sm text-[var(--ak-color-text-muted)]">Wartet auf Nango-Konfiguration</div>
              </div>
            );
          }
          if (!status) return null;
          return (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              status={status}
              onStatusChange={handleStatusChange}
            />
          );
        })}
        {loading && (
          <div className="text-sm text-[var(--ak-color-text-muted)]">Lade Integrationsstatus…</div>
        )}
      </div>
    </div>
  );
}

