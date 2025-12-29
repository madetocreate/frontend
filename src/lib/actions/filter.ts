import type { ActionDefinition } from './types'

/**
 * Constants for filtering marketing/growth/reviews actions from command palette
 */
export const EXCLUDED_ACTION_PREFIXES = ['marketing.', 'growth.', 'reviews.'] as const
export const EXCLUDED_ACTION_CATEGORIES = new Set(['marketing', 'growth', 'reviews'] as const)
export const EXCLUDED_ACTION_TAGS = ['marketing', 'growth', 'reviews'] as const

/**
 * Filters out marketing/growth/reviews actions from the action registry.
 * Used to exclude these actions from the command palette.
 * 
 * @param action - Action definition from ACTION_REGISTRY
 * @returns true if action should be included, false if it should be filtered out
 */
export function isActionAvailableForCommandPalette(action: ActionDefinition): boolean {
  // Don't show hidden actions
  if (action.uiPlacement === 'hidden') return false
  
  // Filter out marketing/growth/reviews by ID prefix
  if (EXCLUDED_ACTION_PREFIXES.some(prefix => action.id.startsWith(prefix))) {
    return false
  }
  
  // Filter out by category (module prefix)
  const prefix = action.id.split('.')[0]
  if (EXCLUDED_ACTION_CATEGORIES.has(prefix as any)) {
    return false
  }
  
  // Filter out by tags if present
  if (action.tags && action.tags.some(tag => 
    EXCLUDED_ACTION_TAGS.includes(tag.toLowerCase())
  )) {
    return false
  }
  
  return true
}

/**
 * Filters an array of actions for command palette usage
 */
export function filterActionsForCommandPalette<T extends ActionDefinition>(
  actions: T[]
): T[] {
  return actions.filter(isActionAvailableForCommandPalette)
}

