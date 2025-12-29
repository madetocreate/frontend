/**
 * Actions Types
 */

export type ActionCategoryId = 'communication' | 'marketing' | 'setup' | 'ops' | 'assistants' | 'packs';
export type ActionTemplateId = string;
export type ActionType = 'template' | 'automation';
export type ActionView = 'all' | 'favorites' | 'new' | 'archived' | 'open_loops' | 'impact' | 'packs';

export interface ActionCategory {
  id: ActionCategoryId;
  label: string;
  icon?: string;
}

export interface ActionTemplate {
  id: ActionTemplateId;
  categoryId: ActionCategoryId;
  title: string;
  description: string;
  iconName?: string;
  isNew?: boolean;
  isFavorite?: boolean;
}

export interface ActionsFilters {
  cat?: ActionCategoryId[];
  type?: ActionType;
  view?: ActionView;
}

