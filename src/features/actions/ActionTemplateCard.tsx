'use client';

import { ActionTemplate } from './types';
import { SparklesIcon, EnvelopeIcon, MegaphoneIcon, ChatBubbleLeftRightIcon, FolderIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { CATEGORY_ICONS } from './catalog';

interface ActionTemplateCardProps {
  template: ActionTemplate;
  onClick: () => void;
  variant?: 'default' | 'colorful';
}

export function ActionTemplateCard({ template, onClick, variant = 'default' }: ActionTemplateCardProps) {
  const Icon = CATEGORY_ICONS[template.categoryId] || SparklesIcon;

  // Colorful styling based on category (matching Marketing Quick Actions style)
  const getColors = (catId: string) => {
    switch (catId) {
      case 'communication': return { bg: 'bg-[var(--ak-semantic-info)]', text: 'text-[var(--ak-color-text-inverted)]', border: 'hover:border-[var(--ak-semantic-info)]' };
      case 'marketing': return { bg: 'bg-[var(--ak-color-accent)]', text: 'text-[var(--ak-color-text-inverted)]', border: 'hover:border-[var(--ak-color-accent)]' };
      case 'ops': return { bg: 'bg-[var(--ak-accent-documents)]', text: 'text-[var(--ak-color-text-inverted)]', border: 'hover:border-[var(--ak-accent-documents)]' };
      case 'assistants': return { bg: 'bg-[var(--ak-semantic-success)]', text: 'text-[var(--ak-color-text-inverted)]', border: 'hover:border-[var(--ak-semantic-success)]' };
      case 'packs': return { bg: 'bg-[var(--ak-semantic-warning)]', text: 'text-[var(--ak-color-text-inverted)]', border: 'hover:border-[var(--ak-semantic-warning)]' };
      default: return { bg: 'bg-[var(--ak-color-text-muted)]', text: 'text-[var(--ak-color-text-inverted)]', border: 'hover:border-[var(--ak-color-text-muted)]' };
    }
  };

  const colors = getColors(template.categoryId);

  if (variant === 'colorful') {
    return (
      <button
        onClick={onClick}
        className={`p-6 rounded-2xl bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] ${colors.border} hover:shadow-lg transition-all text-left group h-full flex flex-col`}
      >
        <div className={`inline-flex p-3 rounded-xl ${colors.bg} mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className={`h-6 w-6 ${colors.text}`} />
        </div>
        <div className="text-base font-semibold text-[var(--ak-color-text-primary)] mb-1 flex items-center gap-2">
          {template.title}
          {template.isNew && (
            <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)]">
              Neu
            </span>
          )}
        </div>
        <div className="text-sm text-[var(--ak-color-text-secondary)]">
          {template.description}
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] hover:bg-[var(--ak-color-bg-hover)] hover:border-[var(--ak-color-border-subtle)] transition-all ak-button-interactive"
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-[var(--ak-color-text-primary)] line-clamp-1">
              {template.title}
            </h4>
            {template.isNew && (
              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)]">
                Neu
              </span>
            )}
            {template.isFavorite && (
              <SparklesIcon className="w-3.5 h-3.5 text-[var(--ak-color-text-muted)] flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-[var(--ak-color-text-secondary)] line-clamp-2">
            {template.description}
          </p>
        </div>
      </div>
    </button>
  );
}

