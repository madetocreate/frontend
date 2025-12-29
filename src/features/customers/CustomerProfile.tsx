'use client';

import { useState } from 'react';
import { Customer, CustomerEvent, Channel } from './types';
import { CustomerEventCard } from './cards/CustomerEventCard';
import {
  DraftReplyCard,
  NextStepsCard,
  SummaryCard,
  ScheduleSuggestionCard,
} from './cards/CustomerActionOutputCards';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface CustomerProfileProps {
  customer: Customer;
  events: CustomerEvent[];
  onBack: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function groupEventsByDay(events: CustomerEvent[]): Record<string, CustomerEvent[]> {
  const groups: Record<string, CustomerEvent[]> = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  events.forEach((event) => {
    const eventDate = new Date(event.timestamp);
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

    let label: string;
    if (eventDay.getTime() === today.getTime()) {
      label = 'Heute';
    } else if (eventDay.getTime() === yesterday.getTime()) {
      label = 'Gestern';
    } else {
      label = eventDate.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(event);
  });

  return groups;
}

type ActionOutputType = 'draft' | 'nextSteps' | 'summary' | 'schedule' | null;

export function CustomerProfile({ customer, events, onBack }: CustomerProfileProps) {
  const [activeAction, setActiveAction] = useState<ActionOutputType>(null);
  const [draftChannel, setDraftChannel] = useState<Channel>('email');

  const groupedEvents = groupEventsByDay(events);
  const lastEvent = events[0];

  const handleAction = (action: ActionOutputType, channel?: Channel) => {
    if (action === 'draft' && channel) {
      setDraftChannel(channel);
    }
    setActiveAction(action);
  };

  const handleCloseAction = () => {
    setActiveAction(null);
  };

  // Determine default channel for draft
  const getDefaultChannel = (): Channel => {
    if (lastEvent?.channel === 'telegram') {
      return 'telegram';
    }
    return 'email';
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
          Zur Liste
        </h1>
      </div>

      {/* Profile Header */}
      <div className="p-5 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center flex-shrink-0">
            <span className="text-base font-medium text-[var(--ak-color-text-secondary)]">
              {getInitials(customer.displayName)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-medium text-[var(--ak-color-text-primary)] mb-1">
              {customer.displayName}
            </h2>
            {customer.companyName && customer.type === 'contact' && (
              <p className="text-sm text-[var(--ak-color-text-muted)] mb-2">
                {customer.companyName}
              </p>
            )}
            <div className="space-y-1 mb-3">
              {customer.email && (
                <p className="text-sm text-[var(--ak-color-text-secondary)]">
                  {customer.email}
                </p>
              )}
              {customer.phone && (
                <p className="text-sm text-[var(--ak-color-text-secondary)]">
                  {customer.phone}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {customer.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded-lg text-xs font-medium bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)]"
                >
                  {tag === 'lead' && 'Lead'}
                  {tag === 'stammkunde' && 'Stammkunde'}
                  {tag === 'vip' && 'VIP'}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => handleAction('draft', getDefaultChannel())}
          className="px-3 py-2 rounded-lg text-sm text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] transition-colors ak-button-interactive"
        >
          Antworten
        </button>
        <button
          onClick={() => handleAction('nextSteps')}
          className="px-3 py-2 rounded-lg text-sm text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] transition-colors ak-button-interactive"
        >
          Next Steps
        </button>
        <button
          onClick={() => handleAction('summary')}
          className="px-3 py-2 rounded-lg text-sm text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] transition-colors ak-button-interactive"
        >
          Zusammenfassen
        </button>
        <button
          onClick={() => handleAction('schedule')}
          className="px-3 py-2 rounded-lg text-sm text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] transition-colors ak-button-interactive"
        >
          Termin vorschlagen
        </button>
      </div>

      {/* Action Output Cards */}
      {activeAction === 'draft' && (
        <DraftReplyCard channel={draftChannel} onClose={handleCloseAction} />
      )}
      {activeAction === 'nextSteps' && <NextStepsCard onClose={handleCloseAction} />}
      {activeAction === 'summary' && <SummaryCard onClose={handleCloseAction} />}
      {activeAction === 'schedule' && (
        <ScheduleSuggestionCard onClose={handleCloseAction} />
      )}

      {/* Timeline */}
      <div className="space-y-6">
        <h3 className="text-sm font-medium text-[var(--ak-color-text-primary)]">
          Timeline
        </h3>
        {Object.entries(groupedEvents).map(([dayLabel, dayEvents]) => (
          <div key={dayLabel} className="space-y-3">
            <h4 className="text-xs font-medium text-[var(--ak-color-text-muted)] uppercase tracking-wide">
              {dayLabel}
            </h4>
            <div className="space-y-2">
              {dayEvents.map((event) => (
                <CustomerEventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-sm text-[var(--ak-color-text-muted)] text-center py-8">
            Keine Aktivitäten
          </p>
        )}
      </div>
    </div>
  );
}

