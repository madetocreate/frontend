'use client';

import { useState, useEffect } from 'react';
import { AkButton } from '@/components/ui/AkButton';
import { AkBadge } from '@/components/ui/AkBadge';
import {
  PlusIcon,
  MegaphoneIcon,
  ChartBarIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { dispatchActionStart } from '@/lib/actions/dispatch';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  goals?: any;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; tone: 'muted' | 'accent' | 'success' | 'warning' }> = {
  draft: { label: 'Draft', tone: 'muted' },
  active: { label: 'Aktiv', tone: 'success' },
  paused: { label: 'Pausiert', tone: 'warning' },
  completed: { label: 'Abgeschlossen', tone: 'muted' },
};

export function CampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const res = await authedFetch('/api/marketing/campaigns');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.name.trim()) {
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'error', message: 'Bitte gib einen Namen ein' },
        })
      );
      return;
    }

    try {
      setCreating(true);
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const res = await authedFetch('/api/marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCampaign.name,
          description: newCampaign.description,
          status: 'draft',
          start_date: newCampaign.start_date || undefined,
          end_date: newCampaign.end_date || undefined,
        }),
      });

      if (res.ok) {
        window.dispatchEvent(
          new CustomEvent('aklow-notification', {
            detail: { type: 'success', message: 'Kampagne erstellt' },
          })
        );
        setShowCreateModal(false);
        setNewCampaign({ name: '', description: '', start_date: '', end_date: '' });
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'error', message: 'Fehler beim Erstellen' },
        })
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchtest du diese Kampagne wirklich löschen?')) return;

    try {
      const res = await fetch(`/api/marketing/campaigns/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        window.dispatchEvent(
          new CustomEvent('aklow-notification', {
            detail: { type: 'success', message: 'Kampagne gelöscht' },
          })
        );
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    }
  };

  const handleOptimize = (campaign: Campaign) => {
    dispatchActionStart(
      'marketing.optimize_campaign',
      {
        module: 'marketing',
        moduleContext: {
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          campaign_description: campaign.description,
        },
      },
      {},
      'campaign-manager'
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--ak-color-text-primary)] mb-1">
            Kampagnen Manager
          </h2>
          <p className="text-sm text-[var(--ak-color-text-secondary)]">
            Organisiere deine Marketing-Aktivitäten in Kampagnen
          </p>
        </div>
        <AkButton
          variant="primary"
          leftIcon={<PlusIcon className="h-4 w-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          Neue Kampagne
        </AkButton>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--ak-color-accent)]"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="py-12 text-center bg-[var(--ak-color-bg-surface)] rounded-2xl border border-[var(--ak-color-border-subtle)]">
          <MegaphoneIcon className="h-12 w-12 text-[var(--ak-color-text-muted)] mx-auto mb-3" />
          <p className="text-[var(--ak-color-text-secondary)] mb-4">
            Noch keine Kampagnen erstellt
          </p>
          <AkButton
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            Erste Kampagne erstellen
          </AkButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="p-6 rounded-2xl bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-color-accent)] transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)] mb-2">
                    {campaign.name}
                  </h3>
                  <AkBadge
                    tone={STATUS_CONFIG[campaign.status]?.tone || 'muted'}
                    size="sm"
                  >
                    {STATUS_CONFIG[campaign.status]?.label || campaign.status}
                  </AkBadge>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-1.5 rounded-lg hover:bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]"
                    title="Bearbeiten"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(campaign.id)}
                    className="p-1.5 rounded-lg hover:bg-[var(--ak-semantic-danger-soft)] text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-semantic-danger)]"
                    title="Löschen"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {campaign.description && (
                <p className="text-sm text-[var(--ak-color-text-secondary)] mb-4 line-clamp-2">
                  {campaign.description}
                </p>
              )}

              {/* Dates */}
              {(campaign.start_date || campaign.end_date) && (
                <div className="flex items-center gap-2 text-xs text-[var(--ak-color-text-muted)] mb-4">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {campaign.start_date
                      ? new Date(campaign.start_date).toLocaleDateString('de-DE')
                      : '?'}
                    {' - '}
                    {campaign.end_date
                      ? new Date(campaign.end_date).toLocaleDateString('de-DE')
                      : 'offen'}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-[var(--ak-color-border-subtle)] space-y-2">
                <AkButton
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  leftIcon={<SparklesIcon className="h-4 w-4" />}
                  onClick={() => handleOptimize(campaign)}
                >
                  KI Optimierung
                </AkButton>
                <AkButton
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  leftIcon={<ChartBarIcon className="h-4 w-4" />}
                >
                  Details ansehen
                </AkButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 m-4 bg-[var(--ak-color-bg-surface)] rounded-2xl border border-[var(--ak-color-border-subtle)] shadow-2xl">
            <h3 className="text-xl font-bold text-[var(--ak-color-text-primary)] mb-4">
              Neue Kampagne erstellen
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) =>
                    setNewCampaign({ ...newCampaign, name: e.target.value })
                  }
                  placeholder="z.B. Produkt-Launch Q1 2025"
                  className="w-full px-4 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">
                  Beschreibung
                </label>
                <textarea
                  value={newCampaign.description}
                  onChange={(e) =>
                    setNewCampaign({ ...newCampaign, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Kurze Beschreibung der Kampagne..."
                  className="w-full px-4 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">
                    Start-Datum
                  </label>
                  <input
                    type="date"
                    value={newCampaign.start_date}
                    onChange={(e) =>
                      setNewCampaign({ ...newCampaign, start_date: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">
                    End-Datum
                  </label>
                  <input
                    type="date"
                    value={newCampaign.end_date}
                    onChange={(e) =>
                      setNewCampaign({ ...newCampaign, end_date: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <AkButton
                variant="secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewCampaign({ name: '', description: '', start_date: '', end_date: '' });
                }}
              >
                Abbrechen
              </AkButton>
              <AkButton
                variant="primary"
                onClick={handleCreateCampaign}
                disabled={creating || !newCampaign.name.trim()}
              >
                {creating ? 'Erstelle...' : 'Erstellen'}
              </AkButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

