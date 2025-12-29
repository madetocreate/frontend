'use client';

import { useState, useEffect } from 'react';
import { WorkLogType, WorkLogChannel } from '@/lib/worklog/types';

interface WorkLogFiltersPanelProps {
  initialFilters: {
    type?: WorkLogType[];
    channel?: WorkLogChannel[];
    range?: 'today' | '7d' | '30d' | 'all';
  };
  onChange: (filters: {
    type?: WorkLogType[];
    channel?: WorkLogChannel[];
    range?: 'today' | '7d' | '30d' | 'all';
  }) => void;
}

const types: { id: WorkLogType; label: string }[] = [
  { id: 'ingress', label: 'Eingang' },
  { id: 'suggestion', label: 'Vorschlag' },
  { id: 'executed', label: 'Ausgeführt' },
  { id: 'setup', label: 'Setup' },
];

const channels: { id: WorkLogChannel; label: string }[] = [
  { id: 'email', label: 'E-Mail' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'website', label: 'Website' },
  { id: 'phone', label: 'Telefon' },
  { id: 'docs', label: 'Docs' },
  { id: 'chat', label: 'Chat' },
];

const ranges: { id: 'today' | '7d' | '30d' | 'all'; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'today', label: 'Heute' },
  { id: '7d', label: '7 Tage' },
  { id: '30d', label: '30 Tage' },
];

export function WorkLogFiltersPanel({
  initialFilters,
  onChange,
}: WorkLogFiltersPanelProps) {
  const [draftFilters, setDraftFilters] = useState(initialFilters);

  useEffect(() => {
    setDraftFilters(initialFilters);
  }, [initialFilters]);

  const toggleType = (type: WorkLogType) => {
    const current = draftFilters.type || [];
    const newTypes = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    setDraftFilters({ ...draftFilters, type: newTypes.length > 0 ? newTypes : undefined });
  };

  const toggleChannel = (channel: WorkLogChannel) => {
    const current = draftFilters.channel || [];
    const newChannels = current.includes(channel)
      ? current.filter((c) => c !== channel)
      : [...current, channel];
    setDraftFilters({
      ...draftFilters,
      channel: newChannels.length > 0 ? newChannels : undefined,
    });
  };

  const setRange = (range: 'today' | '7d' | '30d' | 'all') => {
    setDraftFilters({
      ...draftFilters,
      range: range === 'all' ? undefined : range,
    });
  };

  const handleApply = () => {
    onChange(draftFilters);
  };

  return (
    <div className="space-y-6">
      {/* Types */}
      <div>
        <label className="block text-xs font-medium text-[var(--ak-color-text-primary)] mb-2">
          Typ
        </label>
        <div className="flex flex-wrap gap-2">
          {types.map((type) => {
            const isSelected = draftFilters.type?.includes(type.id) ?? false;
            return (
              <button
                key={type.id}
                onClick={() => toggleType(type.id)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ak-button-interactive
                  ${
                    isSelected
                      ? 'bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)]'
                      : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]'
                  }
                `}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Channels */}
      <div>
        <label className="block text-xs font-medium text-[var(--ak-color-text-primary)] mb-2">
          Kanal
        </label>
        <div className="flex flex-wrap gap-2">
          {channels.map((channel) => {
            const isSelected = draftFilters.channel?.includes(channel.id) ?? false;
            return (
              <button
                key={channel.id}
                onClick={() => toggleChannel(channel.id)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ak-button-interactive
                  ${
                    isSelected
                      ? 'bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)]'
                      : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]'
                  }
                `}
              >
                {channel.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Range */}
      <div>
        <label className="block text-xs font-medium text-[var(--ak-color-text-primary)] mb-2">
          Zeitraum
        </label>
        <div className="flex flex-wrap gap-2">
          {ranges.map((range) => {
            const isSelected =
              range.id === 'all'
                ? !draftFilters.range || draftFilters.range === 'all'
                : draftFilters.range === range.id;
            return (
              <button
                key={range.id}
                onClick={() => setRange(range.id)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ak-button-interactive
                  ${
                    isSelected
                      ? 'bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)]'
                      : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]'
                  }
                `}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

