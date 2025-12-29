'use client';

import Link from 'next/link';
import { WorkLogEntry } from '@/lib/worklog/types';
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

interface WorkLogRowProps {
  entry: WorkLogEntry;
}

const CHANNEL_ICONS = {
  email: EnvelopeIcon,
  telegram: ChatBubbleLeftRightIcon,
  reviews: StarIcon,
  website: GlobeAltIcon,
  phone: PhoneIcon,
  docs: DocumentIcon,
  chat: ChatBubbleLeftRightIcon,
};

const TYPE_LABELS: Record<WorkLogEntry['type'], string> = {
  ingress: 'Eingang',
  suggestion: 'Vorschlag',
  executed: 'Ausgeführt',
  setup: 'Setup',
};

function formatRelativeTime(ts: string): string {
  const date = new Date(ts);
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
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

export function WorkLogRow({ entry }: WorkLogRowProps) {
  const Icon = CHANNEL_ICONS[entry.channel] || ChatBubbleLeftRightIcon;

  return (
    <AkListRow
      accent="graphite"
      leading={
        <div className="w-8 h-8 rounded-lg bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[var(--ak-color-text-secondary)]" />
        </div>
      }
      title={
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--ak-color-text-primary)]">
            {entry.title}
          </span>
          <AkBadge tone="neutral" size="xs">
            {TYPE_LABELS[entry.type]}
          </AkBadge>
        </div>
      }
      subtitle={
        <div className="space-y-1">
          {entry.detail && (
            <p className="text-xs text-[var(--ak-color-text-muted)]">{entry.detail}</p>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--ak-color-text-muted)]">
              {formatRelativeTime(entry.ts)}
            </span>
            {entry.ref?.href && (
              <Link
                href={entry.ref.href}
                className="text-xs font-medium text-[var(--ak-color-accent)] hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Öffnen →
              </Link>
            )}
          </div>
        </div>
      }
    />
  );
}

