import { ActionCategory, ActionTemplate, ActionsFilters, ActionCategoryId } from './types';
import { ACTION_CATEGORIES, ACTION_TEMPLATES } from './catalog';

/**
 * Apply filters to categories and templates
 */
export function applyActionsFilters(
  filters: ActionsFilters
): { categories: ActionCategory[]; templates: ActionTemplate[] } {
  let filteredCategories = [...ACTION_CATEGORIES];
  let filteredTemplates = [...ACTION_TEMPLATES];

  // Filter by category
  if (filters.cat && filters.cat.length > 0) {
    filteredCategories = filteredCategories.filter((cat) => filters.cat!.includes(cat.id));
    filteredTemplates = filteredTemplates.filter((template) =>
      filters.cat!.includes(template.categoryId)
    );
  }

  // Filter by type
  if (filters.type) {
    // For now, all templates are type 'template'
    // Automation filtering would go here later
    if (filters.type === 'automation') {
      filteredTemplates = []; // Automation not available yet
    }
  }

  // Filter by view
  if (filters.view) {
    switch (filters.view) {
      case 'favorites':
        filteredTemplates = filteredTemplates.filter((t) => t.isFavorite);
        break;
      case 'new':
        filteredTemplates = filteredTemplates.filter((t) => t.isNew);
        break;
      case 'archived':
        filteredTemplates = []; // Archived not implemented yet
        break;
      case 'all':
      default:
        // No filtering
        break;
    }
  }

  // Only show categories that have templates (except 'setup', 'assistants', 'packs' which have their own UI)
  const categoryIdsWithTemplates = new Set(filteredTemplates.map((t) => t.categoryId));
  filteredCategories = filteredCategories.filter((cat) =>
    cat.id === 'setup' || cat.id === 'assistants' || cat.id === 'packs' || categoryIdsWithTemplates.has(cat.id)
  );

  return {
    categories: filteredCategories,
    templates: filteredTemplates,
  };
}

/**
 * Get category ID from sidebar item key
 */
export function getCategoryIdFromSidebarKey(key: string): ActionCategoryId | null {
  const mapping: Record<string, ActionCategoryId> = {
    all: null as any,
    communication: 'communication',
    marketing: 'marketing',
    setup: 'setup',
    archive: null as any,
  };

  const categoryId = mapping[key];
  return categoryId || null;
}

