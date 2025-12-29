'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { Channel } from '../types';

interface DraftReplyCardProps {
  channel: Channel;
  onClose: () => void;
}

export function DraftReplyCard({ channel, onClose }: DraftReplyCardProps) {
  const channelLabel = channel === 'telegram' ? 'Telegram' : 'E-Mail';

  return (
    <div className="p-4 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] mb-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-[var(--ak-color-text-primary)]">
          {channelLabel} Entwurf
        </h3>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] transition-colors ak-icon-interactive"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
      <textarea
        className="w-full h-24 px-3 py-2 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-app)] text-sm text-[var(--ak-color-text-primary)] resize-none focus:outline-none focus:border-[var(--ak-color-border-subtle)]"
        placeholder="Nachricht eingeben..."
      />
      <div className="flex items-center gap-2 mt-3">
        <button className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] hover:bg-[var(--ak-color-accent-strong)] transition-colors ak-button-interactive">
          Senden (Demo)
        </button>
        <button className="px-3 py-1.5 rounded-lg text-sm text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] transition-colors ak-button-interactive">
          In Entwürfe speichern (Demo)
        </button>
      </div>
    </div>
  );
}

interface NextStepsCardProps {
  onClose: () => void;
}

export function NextStepsCard({ onClose }: NextStepsCardProps) {
  const steps = [
    'Rückruf vorbereiten',
    'Angebot senden',
    'Termin vorschlagen',
    'Nachricht freundlich nachfassen',
  ];

  return (
    <div className="p-4 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] mb-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-[var(--ak-color-text-primary)]">
          Next Steps
        </h3>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] transition-colors ak-icon-interactive"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
      <ul className="space-y-2">
        {steps.map((step, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)] flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
              {index + 1}
            </span>
            <span className="text-sm text-[var(--ak-color-text-primary)]">{step}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface SummaryCardProps {
  onClose: () => void;
}

export function SummaryCard({ onClose }: SummaryCardProps) {
  const bullets = [
    'Kunde ist seit 2 Jahren Stammkunde',
    'Letzte Aktivität: E-Mail Anfrage zu Produktpreisen (vor 2 Stunden)',
    '1 offene Anfrage',
    'Positive Bewertung vor 10 Tagen (5 Sterne)',
    'Interesse an Premium-Paket signalisiert',
  ];

  return (
    <div className="p-4 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] mb-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-[var(--ak-color-text-primary)]">
          Stand der Dinge
        </h3>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] transition-colors ak-icon-interactive"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
      <ul className="space-y-2">
        {bullets.map((bullet, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-[var(--ak-color-text-muted)] mt-1">•</span>
            <span className="text-sm text-[var(--ak-color-text-primary)]">{bullet}</span>
          </li>
        ))}
      </ul>
      <button className="mt-3 px-3 py-1.5 rounded-lg text-xs text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] transition-colors">
        Als Notiz speichern (Demo)
      </button>
    </div>
  );
}

interface ScheduleSuggestionCardProps {
  onClose: () => void;
}

export function ScheduleSuggestionCard({ onClose }: ScheduleSuggestionCardProps) {
  return (
    <div className="p-4 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] mb-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-[var(--ak-color-text-primary)]">
          Termin vorschlagen
        </h3>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] transition-colors ak-icon-interactive"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        <div className="p-3 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-app)]">
          <div className="text-sm font-medium text-[var(--ak-color-text-primary)] mb-1">
            Montag, 15. Januar 2024, 14:00 Uhr
          </div>
          <div className="text-xs text-[var(--ak-color-text-muted)]">
            30 Minuten
          </div>
        </div>
        <div className="p-3 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-app)]">
          <div className="text-sm font-medium text-[var(--ak-color-text-primary)] mb-1">
            Dienstag, 16. Januar 2024, 10:00 Uhr
          </div>
          <div className="text-xs text-[var(--ak-color-text-muted)]">
            30 Minuten
          </div>
        </div>
      </div>
      <button className="mt-3 w-full px-3 py-2 rounded-lg text-sm font-medium bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] hover:bg-[var(--ak-color-accent-strong)] transition-colors ak-button-interactive">
        Senden (Demo)
      </button>
    </div>
  );
}

