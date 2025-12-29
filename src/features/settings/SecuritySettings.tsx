'use client';

import { useState, useEffect } from 'react';
import { fetchJson, ApiError } from '@/lib/api/fetchJson';

interface AiShieldStatus {
  active: boolean;
  status: 'active' | 'inactive' | 'unknown';
  message?: string;
}

export function SecuritySettings() {
  const [aiShieldStatus, setAiShieldStatus] = useState<AiShieldStatus>({
    active: false,
    status: 'unknown',
  });
  const [loading, setLoading] = useState(false);

  // Try to fetch AI-Shield status (defensive)
  useEffect(() => {
    const fetchAiShieldStatus = async () => {
      setLoading(true);
      try {
        const data = await fetchJson<any>('/api/settings/ai-shield', {
          method: 'GET',
        });

        setAiShieldStatus({
          active: data.active || false,
          status: data.active ? 'active' : 'inactive',
          message: data.message,
        });
      } catch (error) {
        if (error instanceof ApiError) {
          setAiShieldStatus({
            active: false,
            status: 'unknown',
            message: 'Nicht verbunden',
          });
        } else {
          // Network error or other
          setAiShieldStatus({
            active: false,
            status: 'unknown',
            message: 'Nicht verbunden (Demo)',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAiShieldStatus();
  }, []);

  const handleOpenAiShieldSettings = async () => {
    try {
      // Try to fetch AI-Shield settings endpoint
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const response = await authedFetch('/api/settings/ai-shield', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // If endpoint exists, could redirect to a settings page
        // For V1, just show a message
        alert('AI-Shield Einstellungen (Backend-Verkabelung kommt in V2)');
      } else {
        alert('AI-Shield Einstellungen sind noch nicht verfügbar');
      }
    } catch (error) {
      alert('AI-Shield Einstellungen sind noch nicht verfügbar');
    }
  };

  const getStatusLabel = () => {
    if (aiShieldStatus.status === 'active') return 'Aktiv';
    if (aiShieldStatus.status === 'inactive') return 'Inaktiv';
    return 'Unklar (Demo)';
  };

  const getStatusColor = () => {
    if (aiShieldStatus.status === 'active') {
      return 'text-[var(--ak-color-success)]';
    }
    if (aiShieldStatus.status === 'inactive') {
      return 'text-[var(--ak-color-text-muted)]';
    }
    return 'text-[var(--ak-color-text-muted)]';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium text-[var(--ak-color-text-primary)] mb-1">
          Sicherheit
        </h2>
        <p className="text-sm text-[var(--ak-color-text-muted)]">
          Sicherheitseinstellungen und Schutzmaßnahmen
        </p>
      </div>

      {/* AI-Shield Panel */}
      <div className="bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-fine)] rounded-[var(--ak-radius-lg)] p-6 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-[var(--ak-color-text-primary)] mb-1">
            AI-Shield
          </h3>
          <p className="text-xs text-[var(--ak-color-text-muted)] mb-4">
            Schutz vor unerwünschten KI-Aktionen
          </p>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between py-3 border-t border-[var(--ak-color-border-fine)]">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-[var(--ak-color-text-primary)]">
                Status:
              </span>
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {loading ? 'Lädt...' : getStatusLabel()}
              </span>
            </div>
            <p className="text-xs text-[var(--ak-color-text-muted)]">
              {aiShieldStatus.message || 'AI-Shield Status wird überprüft'}
            </p>
          </div>
        </div>

        {/* Button */}
        <div className="pt-2">
          <button
            onClick={handleOpenAiShieldSettings}
            className="px-4 py-2 text-sm font-medium text-[var(--ak-color-text-primary)] bg-[var(--ak-color-bg-surface-muted)] hover:bg-[var(--ak-color-bg-hover)] border border-[var(--ak-color-border-fine)] rounded-[var(--ak-radius-md)] transition-colors ak-button-interactive"
          >
            AI-Shield Einstellungen öffnen
          </button>
        </div>
      </div>

      {/* Audit Log Placeholder */}
      <div className="bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-fine)] rounded-[var(--ak-radius-lg)] p-6">
        <div>
          <h3 className="text-sm font-medium text-[var(--ak-color-text-primary)] mb-1">
            Audit Log
          </h3>
          <p className="text-xs text-[var(--ak-color-text-muted)]">
            Kommt in einer späteren Version
          </p>
        </div>
      </div>
    </div>
  );
}

