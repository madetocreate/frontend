'use client';

import { useRouter } from 'next/navigation';
import { ActionCategory, ActionTemplate } from './types';
import { ActionTemplateCard } from './ActionTemplateCard';
import { CATEGORY_ICONS } from './catalog';

interface ActionCategoryCardProps {
  category: ActionCategory;
  templates: ActionTemplate[];
  onTemplateClick: (template: ActionTemplate) => void;
}

export function ActionCategoryCard({
  category,
  templates,
  onTemplateClick,
}: ActionCategoryCardProps) {
  const router = useRouter();
  const Icon = CATEGORY_ICONS[category.id];
  const categoryTemplates = templates.filter((t) => t.categoryId === category.id);

  // Special handling for setup category - always show, even without templates
  if (category.id === 'setup') {
    return (
      <div className="p-5 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-border-subtle)] transition-colors cursor-pointer"
        onClick={() => router.push('/actions?cat=setup')}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center">
            <Icon className="w-4 h-4 text-[var(--ak-color-text-secondary)]" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-medium text-[var(--ak-color-text-primary)]">
              {category.label}
            </h3>
            <p className="text-sm text-[var(--ak-color-text-muted)] mt-1">
              Verbinde Kanäle und Bots
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (categoryTemplates.length === 0) {
    return null;
  }

  return (
    <div className="p-5 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[var(--ak-color-text-secondary)]" />
        </div>
        <h3 className="text-base font-medium text-[var(--ak-color-text-primary)]">
          {category.label}
        </h3>
      </div>

      {/* Templates */}
      <div className="space-y-2">
        {categoryTemplates.map((template) => (
          <ActionTemplateCard
            key={template.id}
            template={template}
            onClick={() => onTemplateClick(template)}
          />
        ))}
      </div>
    </div>
  );
}

