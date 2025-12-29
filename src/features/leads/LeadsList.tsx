'use client';

import { Lead } from './types';
import { AkListRow } from '@/components/ui/AkListRow';
import { AkBadge } from '@/components/ui/AkBadge';
import { AkEmptyState } from '@/components/ui/AkEmptyState';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface LeadsListProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
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

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Gerade eben';
  if (diffMins < 60) return `vor ${diffMins} Min`;
  if (diffHours < 24) return `vor ${diffHours} Std`;
  if (diffDays === 1) return 'Gestern';
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
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

export function LeadsList({ leads, onSelectLead }: LeadsListProps) {
  if (leads.length === 0) {
    return (
      <AkEmptyState
        icon={<UserGroupIcon />}
        title="Keine Leads gefunden"
        description="Neue Leads erscheinen hier automatisch."
      />
    );
  }

  return (
    <div className="space-y-1">
      {leads.map((lead) => (
        <AkListRow
          key={lead.id}
          accent="customers"
          onClick={() => onSelectLead(lead)}
          leading={
            <div className="w-10 h-10 rounded-full bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center">
              <span className="text-sm font-medium text-[var(--ak-color-text-secondary)]">
                {getInitials(lead.name || lead.company || lead.email)}
              </span>
            </div>
          }
          title={
            <div className="space-y-1">
              <div>
                <h3 className="text-sm font-medium text-[var(--ak-color-text-primary)] line-clamp-1">
                  {lead.name || lead.company || lead.email || lead.phone || 'Unbekannt'}
                  {lead.company && lead.name && (
                    <span className="text-xs text-[var(--ak-color-text-muted)] ml-1">
                      · {lead.company}
                    </span>
                  )}
                </h3>
                {lead.email && (
                  <p className="text-xs text-[var(--ak-color-text-muted)] line-clamp-1">
                    {lead.email}
                  </p>
                )}
                {lead.phone && !lead.email && (
                  <p className="text-xs text-[var(--ak-color-text-muted)] line-clamp-1">
                    {lead.phone}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <AkBadge tone="neutral" size="xs">
                  {getSourceLabel(lead.source)}
                </AkBadge>
                <AkBadge tone={getStatusTone(lead.status)} size="xs">
                  {getStatusLabel(lead.status)}
                </AkBadge>
                {lead.city && (
                  <AkBadge tone="neutral" size="xs">
                    {lead.city}
                  </AkBadge>
                )}
              </div>
            </div>
          }
          trailing={
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-[var(--ak-color-text-muted)]">
                {formatTimeAgo(lead.created_at)}
              </span>
            </div>
          }
        />
      ))}
    </div>
  );
}

