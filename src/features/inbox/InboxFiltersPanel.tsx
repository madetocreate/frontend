'use client';

import { useState, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react';
import { InboxSource, InboxStatus } from './types';
import clsx from 'clsx';

export interface InboxFiltersDraft {
  src?: InboxSource[];
  status?: InboxStatus;
  range?: 'today' | '7d' | '30d' | 'all';
}

interface InboxFiltersPanelProps {
  initialFilters: InboxFiltersDraft;
  onChange?: (filters: InboxFiltersDraft) => void;
  onReset?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export interface InboxFiltersPanelRef {
  getDraft: () => InboxFiltersDraft;
  isDirty: () => boolean;
}

const sources: { id: InboxSource; label: string }[] = [
  { id: 'email', label: 'E-Mail' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'website', label: 'Website' },
  { id: 'phone', label: 'Telefon' },
];

const statuses: { id: InboxStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'needs_action', label: 'Needs action' },
  { id: 'open', label: 'Offen' },
  { id: 'archived', label: 'Archiv' },
];

const ranges: { id: 'today' | '7d' | '30d' | 'all'; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'today', label: 'Heute' },
  { id: '7d', label: '7 Tage' },
  { id: '30d', label: '30 Tage' },
];

// Default filters (no filters = show all)
const DEFAULT_FILTERS = {
  src: undefined,
  status: undefined,
  range: undefined,
};

// Deep compare helper
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (Array.isArray(a[key]) && Array.isArray(b[key])) {
      if (a[key].length !== b[key].length) return false;
      const sortedA = [...a[key]].sort();
      const sortedB = [...b[key]].sort();
      if (!deepEqual(sortedA, sortedB)) return false;
    } else if (!deepEqual(a[key], b[key])) {
      return false;
    }
  }

  return true;
}

// Check if filters are default (no filters)
function isDefaultFilters(filters: {
  src?: InboxSource[];
  status?: InboxStatus;
  range?: 'today' | '7d' | '30d' | 'all';
}): boolean {
  return deepEqual(filters, DEFAULT_FILTERS);
}

// Build human-readable filter summary
function buildFilterSummary(filters: {
  src?: InboxSource[];
  status?: InboxStatus;
  range?: 'today' | '7d' | '30d' | 'all';
}): string {
  const parts: string[] = [];

  // Sources
  if (filters.src && filters.src.length > 0) {
    if (filters.src.length === sources.length) {
      parts.push('Alle Quellen');
    } else {
      parts.push(`${filters.src.length} ${filters.src.length === 1 ? 'Quelle' : 'Quellen'}`);
    }
  } else {
    parts.push('Alle Quellen');
  }

  // Status
  if (filters.status) {
    const statusLabel = statuses.find((s) => s.id === filters.status)?.label || filters.status;
    parts.push(`Status: ${statusLabel}`);
  } else {
    parts.push('Status: Alle');
  }

  // Range
  if (filters.range && filters.range !== 'all') {
    const rangeLabel = ranges.find((r) => r.id === filters.range)?.label || filters.range;
    parts.push(`Zeitraum: ${rangeLabel}`);
  } else {
    parts.push('Zeitraum: Alle');
  }

  return parts.join(' · ');
}

export const InboxFiltersPanel = forwardRef<InboxFiltersPanelRef, InboxFiltersPanelProps>(
  ({ initialFilters, onChange, onReset, onDirtyChange }, ref) => {
    const [draft, setDraft] = useState(initialFilters);

    // Reset draft when initialFilters change (e.g., when overlay opens)
    useEffect(() => {
      setDraft(initialFilters);
    }, [initialFilters]);

    // Check if draft has changes
    const isDirtyValue = useMemo(() => !deepEqual(draft, initialFilters), [draft, initialFilters]);
    const isDefault = useMemo(() => isDefaultFilters(draft), [draft]);

    // Summary text
    const summary = useMemo(() => buildFilterSummary(draft), [draft]);

    // Expose draft and isDirty to parent via ref
    useImperativeHandle(ref, () => ({
      getDraft: () => draft,
      isDirty: () => isDirtyValue,
    }), [draft, isDirtyValue]);

    // Notify parent when dirty state changes
    useEffect(() => {
      if (onDirtyChange) {
        onDirtyChange(isDirtyValue);
      }
    }, [isDirtyValue, onDirtyChange]);

  const toggleSource = (source: InboxSource) => {
    const current = draft.src || [];
    const newSources = current.includes(source)
      ? current.filter((s) => s !== source)
      : [...current, source];
    setDraft({
      ...draft,
      src: newSources.length > 0 ? newSources : undefined,
    });
  };

  const setStatus = (status: InboxStatus | 'all') => {
    setDraft({
      ...draft,
      status: status === 'all' ? undefined : status,
    });
  };

  const setRange = (range: 'today' | '7d' | '30d' | 'all') => {
    setDraft({
      ...draft,
      range: range === 'all' ? undefined : range,
    });
  };

  const handleReset = () => {
    setDraft(DEFAULT_FILTERS);
    if (onReset) {
      onReset();
    }
  };

    return (
    <div className="space-y-6">
      {/* Aktive Filter Summary */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[var(--ak-color-text-secondary)] uppercase tracking-wider mb-1">
              Aktive Filter
            </p>
            <p className="text-sm text-[var(--ak-color-text-primary)] leading-relaxed">
              {summary}
            </p>
          </div>
          {!isDefault && (
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-[var(--ak-color-accent)] hover:text-[var(--ak-color-accent-strong)] transition-colors whitespace-nowrap"
            >
              Alles zurücksetzen
            </button>
          )}
        </div>
      </div>

      <div className="h-px bg-[var(--ak-color-border-subtle)] opacity-40" />

      {/* Quellen - Checkbox Liste */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-[var(--ak-color-text-primary)] uppercase tracking-wider">
          Quellen
        </label>
        <div className="space-y-1 bg-[var(--ak-color-bg-surface-muted)] rounded-xl p-1">
          {sources.map((source) => {
            const isSelected = draft.src?.includes(source.id) ?? false;
            return (
              <label
                key={source.id}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200',
                  'hover:bg-[var(--ak-color-bg-hover)]',
                  isSelected && 'bg-[var(--ak-color-bg-surface)]'
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSource(source.id)}
                  className="w-4 h-4 rounded border-[var(--ak-color-border-subtle)] text-[var(--ak-color-accent)] focus:ring-[var(--ak-color-accent)] focus:ring-offset-0"
                />
                <span className="text-sm font-medium text-[var(--ak-color-text-primary)] flex-1">
                  {source.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Status - Segmented Control */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-[var(--ak-color-text-primary)] uppercase tracking-wider">
          Status
        </label>
        <div className="flex bg-[var(--ak-color-bg-surface-muted)] p-1 rounded-xl">
          {statuses.map((status) => {
            const isSelected =
              status.id === 'all'
                ? !draft.status
                : draft.status === status.id;
            return (
              <button
                key={status.id}
                type="button"
                onClick={() => setStatus(status.id as InboxStatus | 'all')}
                className={clsx(
                  'flex-1 px-3 py-2 text-[13px] font-medium rounded-lg transition-all duration-200',
                  isSelected
                    ? 'bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] shadow-sm ring-1 ring-black/5'
                    : 'text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]'
                )}
              >
                {status.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Zeitraum - Segmented Control */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-[var(--ak-color-text-primary)] uppercase tracking-wider">
          Zeitraum
        </label>
        <div className="flex bg-[var(--ak-color-bg-surface-muted)] p-1 rounded-xl">
          {ranges.map((range) => {
            const isSelected =
              range.id === 'all'
                ? !draft.range || draft.range === 'all'
                : draft.range === range.id;
            return (
              <button
                key={range.id}
                type="button"
                onClick={() => setRange(range.id)}
                className={clsx(
                  'flex-1 px-3 py-2 text-[13px] font-medium rounded-lg transition-all duration-200',
                  isSelected
                    ? 'bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] shadow-sm ring-1 ring-black/5'
                    : 'text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]'
                )}
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
);

InboxFiltersPanel.displayName = 'InboxFiltersPanel';

/*
 * MANUELLE TEST-CHECKLISTE:
 * 
 * 1. Open/Close
 *    - Klick auf "Filter konfigurieren" öffnet Drawer
 *    - Klick auf Backdrop oder X schließt Drawer
 *    - ESC schließt Drawer
 * 
 * 2. Toggle sources multiple
 *    - Mehrere Quellen können ausgewählt werden
 *    - Checkbox-Liste funktioniert korrekt
 *    - Summary zeigt korrekte Anzahl
 * 
 * 3. Status selection
 *    - Segmented Control funktioniert
 *    - Nur ein Status kann ausgewählt werden
 *    - "Alle" deselektiert Status-Filter
 * 
 * 4. Range selection
 *    - Segmented Control funktioniert
 *    - Nur ein Zeitraum kann ausgewählt werden
 *    - "Alle" deselektiert Zeitraum-Filter
 * 
 * 5. Abbrechen verwirft
 *    - Änderungen werden verworfen
 *    - Drawer schließt
 *    - Filter bleiben unverändert
 * 
 * 6. Anwenden übernimmt
 *    - Änderungen werden übernommen
 *    - Drawer schließt
 *    - Filter werden aktualisiert
 *    - Apply Button ist disabled wenn keine Änderungen
 * 
 * 7. Reset setzt default
 *    - "Alles zurücksetzen" setzt alle Filter zurück
 *    - Summary zeigt "Alle Quellen · Status: Alle · Zeitraum: Alle"
 *    - "Alles zurücksetzen" verschwindet wenn default
 * 
 * 8. Apply Button disabled wenn nicht dirty
 *    - Button ist disabled wenn keine Änderungen
 *    - Button ist enabled wenn Änderungen vorhanden
 */
