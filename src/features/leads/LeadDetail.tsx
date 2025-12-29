'use client';

import { useState } from 'react';
import { Lead, LeadStatus } from './types';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { AkBadge } from '@/components/ui/AkBadge';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface LeadDetailProps {
  lead: Lead;
  onBack: () => void;
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    contact: 'Kontakt',
    check: 'Check',
    demo: 'Demo',
    newsletter: 'Newsletter',
    exit_intent: 'Exit Intent',
  };
  return labels[source] || source;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    new: 'Neu',
    contacted: 'Kontaktiert',
    qualified: 'Qualifiziert',
    won: 'Gewonnen',
    lost: 'Verloren',
  };
  return labels[status] || status;
}

function getStatusTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  const tones: Record<string, 'neutral' | 'success' | 'warning' | 'danger'> = {
    new: 'neutral',
    contacted: 'warning',
    qualified: 'warning',
    won: 'success',
    lost: 'danger',
  };
  return tones[status] || 'neutral';
}

const STATUS_OPTIONS: LeadStatus[] = ['new', 'contacted', 'qualified', 'won', 'lost'];

export function LeadDetail({ lead, onBack }: LeadDetailProps) {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>(lead.status);

  const updateStatusMutation = useMutation({
    mutationFn: async (status: LeadStatus) => {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update lead status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', lead.id] });
    },
  });

  const handleStatusChange = (status: LeadStatus) => {
    setSelectedStatus(status);
    updateStatusMutation.mutate(status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] transition-colors ak-icon-interactive"
          aria-label="Zur Liste"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-medium text-[var(--ak-color-text-primary)]">
          Lead Details
        </h1>
      </div>

      {/* Lead Info Card */}
      <div className="bg-[var(--ak-color-bg-surface)] rounded-xl border border-[var(--ak-color-border-fine)] p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center">
            <span className="text-xl font-medium text-[var(--ak-color-text-secondary)]">
              {getInitials(lead.name || lead.company || lead.email)}
            </span>
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <h2 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
                {lead.name || lead.company || lead.email || lead.phone || 'Unbekannt'}
              </h2>
              {lead.company && lead.name && (
                <p className="text-sm text-[var(--ak-color-text-muted)]">{lead.company}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <AkBadge tone="neutral" size="sm">
                {getSourceLabel(lead.source)}
              </AkBadge>
              <AkBadge tone={getStatusTone(lead.status)} size="sm">
                {getStatusLabel(lead.status)}
              </AkBadge>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--ak-color-border-fine)]">
          {lead.email && (
            <div>
              <p className="text-xs text-[var(--ak-color-text-muted)] mb-1">E-Mail</p>
              <p className="text-sm text-[var(--ak-color-text-primary)]">{lead.email}</p>
            </div>
          )}
          {lead.phone && (
            <div>
              <p className="text-xs text-[var(--ak-color-text-muted)] mb-1">Telefon</p>
              <p className="text-sm text-[var(--ak-color-text-primary)]">{lead.phone}</p>
            </div>
          )}
          {lead.city && (
            <div>
              <p className="text-xs text-[var(--ak-color-text-muted)] mb-1">Stadt</p>
              <p className="text-sm text-[var(--ak-color-text-primary)]">{lead.city}</p>
            </div>
          )}
          {lead.website && (
            <div>
              <p className="text-xs text-[var(--ak-color-text-muted)] mb-1">Website</p>
              <a
                href={lead.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--ak-color-accent)] hover:underline"
              >
                {lead.website}
              </a>
            </div>
          )}
        </div>

        {/* Message */}
        {lead.message && (
          <div className="pt-4 border-t border-[var(--ak-color-border-fine)]">
            <p className="text-xs text-[var(--ak-color-text-muted)] mb-2">Nachricht</p>
            <p className="text-sm text-[var(--ak-color-text-primary)] whitespace-pre-wrap">
              {lead.message}
            </p>
          </div>
        )}

        {/* Intent */}
        {lead.intent && (
          <div className="pt-4 border-t border-[var(--ak-color-border-fine)]">
            <p className="text-xs text-[var(--ak-color-text-muted)] mb-2">Intent</p>
            <pre className="text-xs text-[var(--ak-color-text-secondary)] bg-[var(--ak-color-bg-surface-muted)] p-3 rounded-lg overflow-auto">
              {typeof lead.intent === 'string' ? lead.intent : JSON.stringify(lead.intent, null, 2)}
            </pre>
          </div>
        )}

        {/* Status Update */}
        <div className="pt-4 border-t border-[var(--ak-color-border-fine)]">
          <p className="text-xs text-[var(--ak-color-text-muted)] mb-3">Status ändern</p>
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={updateStatusMutation.isPending}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-[var(--ak-color-accent)]'
                    : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)]'
                }`}
                style={selectedStatus === status ? { color: 'var(--ak-text-primary-dark)' } : undefined}
              >
                {getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-[var(--ak-color-border-fine)] flex gap-3">
          <button className="px-4 py-2 rounded-lg bg-[var(--ak-color-accent)] text-sm font-medium hover:opacity-90 transition-opacity" style={{ color: 'var(--ak-text-primary-dark)' }}>
            Zu Customer konvertieren
          </button>
          <button className="px-4 py-2 rounded-lg bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] text-sm font-medium hover:bg-[var(--ak-color-bg-hover)] transition-colors">
            Antworten
          </button>
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t border-[var(--ak-color-border-fine)]">
          <p className="text-xs text-[var(--ak-color-text-muted)] mb-2">Erstellt</p>
          <p className="text-xs text-[var(--ak-color-text-secondary)]">
            {new Date(lead.created_at).toLocaleString('de-DE')}
          </p>
        </div>
      </div>
    </div>
  );
}

