'use client';

import { ActionCategory, ActionTemplate } from './types';
import { ActionCategoryCard } from './ActionCategoryCard';
import { ActionTemplateCard } from './ActionTemplateCard';
import { AkEmptyState } from '@/components/ui/AkEmptyState';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface ActionsOverviewProps {
  categories: ActionCategory[];
  templates: ActionTemplate[];
  onTemplateClick: (template: ActionTemplate) => void;
}

export function ActionsOverview({
  categories,
  templates,
  onTemplateClick,
}: ActionsOverviewProps) {
  if (categories.length === 0) {
    return (
      <AkEmptyState
        icon={<SparklesIcon />}
        title="Keine Vorlagen gefunden"
        description="Passe die Filter an, um mehr Ergebnisse zu sehen."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Hint */}
      <div className="text-sm text-[var(--ak-color-text-muted)]">
        Suchen oder Befehl eingeben…
      </div>

      {/* Action Grid (Flat List of Templates with Colorful Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map((template) => (
          <ActionTemplateCard
            key={template.id}
            template={template}
            onClick={() => onTemplateClick(template)}
            variant="colorful"
          />
        ))}
      </div>

      {/* Optional Link */}
      <div className="pt-4 border-t border-[var(--ak-color-border-fine)]">
        <button
          disabled
          className="text-sm text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Weitere Vorlagen entdecken →
        </button>
      </div>
    </div>
  );
}

