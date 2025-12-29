'use client';

import { useState, useEffect } from 'react';
import { ActionCategoryId, ActionType, ActionView } from './types';
import { ACTION_CATEGORIES } from './catalog';

interface ActionsFiltersPanelProps {
  initialFilters: {
    cat?: ActionCategoryId[];
    type?: ActionType;
    view?: ActionView;
  };
  onChange: (filters: {
    cat?: ActionCategoryId[];
    type?: ActionType;
    view?: ActionView;
  }) => void;
}

const categories = ACTION_CATEGORIES.map((cat) => ({
  id: cat.id,
  label: cat.label,
}));

const types: { id: ActionType | 'all'; label: string; disabled?: boolean }[] = [
  { id: 'template', label: 'Template' },
  { id: 'automation', label: 'Automation', disabled: true },
];

const views: { id: ActionView; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'favorites', label: 'Favoriten' },
  { id: 'new', label: 'Neu' },
];

export function ActionsFiltersPanel({ initialFilters, onChange }: ActionsFiltersPanelProps) {
  const [draftFilters, setDraftFilters] = useState(initialFilters);

  useEffect(() => {
    setDraftFilters(initialFilters);
  }, [initialFilters]);

  const toggleCategory = (categoryId: ActionCategoryId) => {
    const current = draftFilters.cat || [];
    const newCategories = current.includes(categoryId)
      ? current.filter((c) => c !== categoryId)
      : [...current, categoryId];
    setDraftFilters({
      ...draftFilters,
      cat: newCategories.length > 0 ? newCategories : undefined,
    });
  };

  const setType = (type: ActionType | 'all') => {
    if (type === 'automation') return; // Disabled
    setDraftFilters({
      ...draftFilters,
      type: type === 'all' ? undefined : type,
    });
  };

  const setView = (view: ActionView) => {
    setDraftFilters({
      ...draftFilters,
      view: view === 'all' ? undefined : view,
    });
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <label className="block text-xs font-medium text-[var(--ak-color-text-primary)] mb-2">
          Kategorie
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = draftFilters.cat?.includes(category.id) ?? false;
            return (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ak-button-interactive
                  ${
                    isSelected
                      ? 'bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)]'
                      : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]'
                  }
                `}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs font-medium text-[var(--ak-color-text-primary)] mb-2">
          Typ
        </label>
        <div className="flex flex-wrap gap-2">
          {types.map((type) => {
            const isSelected =
              type.id === 'all'
                ? !draftFilters.type || draftFilters.type === 'template'
                : draftFilters.type === type.id;
            const isDisabled = type.disabled;
            return (
              <button
                key={type.id}
                onClick={() => !isDisabled && setType(type.id as ActionType | 'all')}
                disabled={isDisabled}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ak-button-interactive
                  ${
                    isDisabled
                      ? 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-muted)] opacity-50 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)]'
                      : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]'
                  }
                `}
                title={isDisabled ? 'Kommt bald' : undefined}
              >
                {type.label}
                {isDisabled && ' (kommt bald)'}
              </button>
            );
          })}
        </div>
      </div>

      {/* View */}
      <div>
        <label className="block text-xs font-medium text-[var(--ak-color-text-primary)] mb-2">
          Ansicht
        </label>
        <div className="flex flex-wrap gap-2">
          {views.map((view) => {
            const isSelected =
              view.id === 'all'
                ? !draftFilters.view || draftFilters.view === 'all'
                : draftFilters.view === view.id;
            return (
              <button
                key={view.id}
                onClick={() => setView(view.id)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ak-button-interactive
                  ${
                    isSelected
                      ? 'bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)]'
                      : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]'
                  }
                `}
              >
                {view.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

