'use client';

import { useState, useEffect } from 'react';
import { CustomerType, CustomerTag, Channel } from './types';

interface CustomersFiltersPanelProps {
  initialFilters: {
    type?: CustomerType;
    tag?: CustomerTag[];
    range?: 'today' | '7d' | '30d' | 'all';
    ch?: Channel[];
  };
  onChange: (filters: {
    type?: CustomerType;
    tag?: CustomerTag[];
    range?: 'today' | '7d' | '30d' | 'all';
    ch?: Channel[];
  }) => void;
}

const types: { id: CustomerType | 'all'; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'company', label: 'Unternehmen' },
  { id: 'contact', label: 'Kontakte' },
];

const tags: { id: CustomerTag; label: string }[] = [
  { id: 'lead', label: 'Lead' },
  { id: 'stammkunde', label: 'Stammkunde' },
  { id: 'vip', label: 'VIP' },
];

const ranges: { id: 'today' | '7d' | '30d' | 'all'; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'today', label: 'Heute' },
  { id: '7d', label: '7 Tage' },
  { id: '30d', label: '30 Tage' },
];

const channels: { id: Channel; label: string }[] = [
  { id: 'email', label: 'E-Mail' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'website', label: 'Website' },
  { id: 'phone', label: 'Telefon' },
  { id: 'docs', label: 'Dokumente' },
];

export function CustomersFiltersPanel({
  initialFilters,
  onChange,
}: CustomersFiltersPanelProps) {
  const [draftFilters, setDraftFilters] = useState(initialFilters);

  useEffect(() => {
    setDraftFilters(initialFilters);
  }, [initialFilters]);

  const setType = (type: CustomerType | 'all') => {
    setDraftFilters({
      ...draftFilters,
      type: type === 'all' ? undefined : type,
    });
  };

  const toggleTag = (tag: CustomerTag) => {
    const current = draftFilters.tag || [];
    const newTags = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    setDraftFilters({
      ...draftFilters,
      tag: newTags.length > 0 ? newTags : undefined,
    });
  };

  const setRange = (range: 'today' | '7d' | '30d' | 'all') => {
    setDraftFilters({
      ...draftFilters,
      range: range === 'all' ? undefined : range,
    });
  };

  const toggleChannel = (channel: Channel) => {
    const current = draftFilters.ch || [];
    const newChannels = current.includes(channel)
      ? current.filter((c) => c !== channel)
      : [...current, channel];
    setDraftFilters({
      ...draftFilters,
      ch: newChannels.length > 0 ? newChannels : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Type */}
      <div>
        <label className="block text-xs font-medium text-[var(--ak-color-text-primary)] mb-2">
          Typ
        </label>
        <div className="flex flex-wrap gap-2">
          {types.map((type) => {
            const isSelected =
              type.id === 'all'
                ? !draftFilters.type
                : draftFilters.type === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setType(type.id as CustomerType | 'all')}
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

      {/* Tags */}
      <div>
        <label className="block text-xs font-medium text-[var(--ak-color-text-primary)] mb-2">
          Status/Tag
        </label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const isSelected = draftFilters.tag?.includes(tag.id) ?? false;
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ak-button-interactive
                  ${
                    isSelected
                      ? 'bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)]'
                      : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]'
                  }
                `}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Range */}
      <div>
        <label className="block text-xs font-medium text-[var(--ak-color-text-primary)] mb-2">
          Letzte Aktivität
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

      {/* Channels */}
      <div>
        <label className="block text-xs font-medium text-[var(--ak-color-text-primary)] mb-2">
          Kanal (optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {channels.map((channel) => {
            const isSelected = draftFilters.ch?.includes(channel.id) ?? false;
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
    </div>
  );
}

