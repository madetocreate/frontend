'use client';

import { useState, useEffect } from 'react';

interface DocsFiltersPanelProps {
  initialFilters: {
    range?: 'today' | '7d' | '30d' | 'all';
    q?: string;
  };
  onChange: (filters: {
    range?: 'today' | '7d' | '30d' | 'all';
    q?: string;
  }) => void;
}

const ranges: { id: 'today' | '7d' | '30d' | 'all'; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'today', label: 'Heute' },
  { id: '7d', label: '7 Tage' },
  { id: '30d', label: '30 Tage' },
];

export function DocsFiltersPanel({ initialFilters, onChange }: DocsFiltersPanelProps) {
  const [draftFilters, setDraftFilters] = useState(initialFilters);

  useEffect(() => {
    setDraftFilters(initialFilters);
  }, [initialFilters]);

  const setRange = (range: 'today' | '7d' | '30d' | 'all') => {
    const newFilters = {
      ...draftFilters,
      range: range === 'all' ? undefined : range,
    };
    setDraftFilters(newFilters);
    onChange(newFilters);
  };

  return (
    <div className="space-y-6">
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

