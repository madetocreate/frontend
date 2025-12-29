'use client';

import { CustomerEvent } from '../types';
import {
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  GlobeAltIcon,
  PhoneIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import { AkListRow } from '@/components/ui/AkListRow';
import { AkBadge } from '@/components/ui/AkBadge';
import { AkButton } from '@/components/ui/AkButton';

interface CustomerEventCardProps {
  event: CustomerEvent;
}

const channelIcons = {
  email: EnvelopeIcon,
  telegram: ChatBubbleLeftRightIcon,
  reviews: StarIcon,
  website: GlobeAltIcon,
  phone: PhoneIcon,
  docs: DocumentIcon,
};

const channelLabels = {
  email: 'E-Mail',
  telegram: 'Telegram',
  reviews: 'Bewertung',
  website: 'Website',
  phone: 'Anruf',
  docs: 'Dokument',
};

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

export function CustomerEventCard({ event }: CustomerEventCardProps) {
  const Icon = channelIcons[event.channel as keyof typeof channelIcons];
  const channelLabel = channelLabels[event.channel as keyof typeof channelLabels];

  return (
    <AkListRow
      accent="customers"
      leading={
        <div className="w-6 h-6 rounded-lg bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-[var(--ak-color-text-secondary)]" />
        </div>
      }
      title={
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[var(--ak-color-text-muted)]">
              {channelLabel}
            </span>
            {(() => {
              if (!event.meta || typeof event.meta !== 'object' || !('rating' in event.meta)) return null;
              const rating = (event.meta as { rating?: string | number }).rating;
              if (!rating) return null;
              return (
                <AkBadge tone="neutral" size="xs">
                  {String(rating)} ⭐
                </AkBadge>
              );
            })()}
          </div>
          <h4 className="text-sm font-medium text-[var(--ak-color-text-primary)] line-clamp-1">
            {event.title}
          </h4>
        </div>
      }
      subtitle={
        <div className="space-y-2">
          <p className="text-xs text-[var(--ak-color-text-secondary)] line-clamp-2">
            {event.preview}
          </p>
          <div className="flex items-center gap-2">
            <AkButton variant="ghost" size="sm">
              Antworten
            </AkButton>
            <AkButton variant="ghost" size="sm">
              Merken
            </AkButton>
          </div>
        </div>
      }
      trailing={
        <span className="text-xs text-[var(--ak-color-text-muted)] flex-shrink-0">
          {formatTimeAgo(event.timestamp)}
        </span>
      }
    />
  );
}

