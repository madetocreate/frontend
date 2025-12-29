/**
 * Selectors für Action Registry
 * Filtert und sortiert Actions für UI-Komponenten
 */

import type { ActionDefinition, ActionId, ActionModule, ActionContext, UIPlacement } from './types'
import { ACTION_REGISTRY, EXECUTABLE_ACTION_ID_SET } from './registry'

export interface GetActionsForUIOptions {
  module: ActionModule
  placement?: UIPlacement[] // Welche Placements sollen angezeigt werden (default: ['primary', 'secondary'])
  whitelist?: ActionId[] // Optional: Nur diese Actions anzeigen
  blacklist?: ActionId[] // Optional: Diese Actions ausschließen
  context?: ActionContext // Optional: Für availability-Prüfung
}

/**
 * Holt Actions für UI-Anzeige
 * - Filtert nach Modul
 * - Filtert nach uiPlacement
 * - Prüft availability (falls vorhanden)
 * - Sortiert nach uiOrder, dann label
 */
export function getActionsForUI(options: GetActionsForUIOptions): ActionDefinition[] {
  const {
    module,
    placement = ['primary', 'secondary'],
    whitelist,
    blacklist,
    context,
  } = options

  // Alle Actions für das Modul holen (nur executable)
  const moduleActions = Object.values(ACTION_REGISTRY).filter(
    (action) => 
      action.supportedModules.includes(module) &&
      EXECUTABLE_ACTION_ID_SET.has(action.id)
  )

  // Filter anwenden
  const filtered = moduleActions.filter((action) => {
    // Placement-Filter
    if (!placement.includes(action.uiPlacement)) {
      return false
    }

    // Whitelist
    if (whitelist && !whitelist.includes(action.id)) {
      return false
    }

    // Blacklist
    if (blacklist && blacklist.includes(action.id)) {
      return false
    }

    // Availability-Prüfung (falls vorhanden)
    if (action.availability && context) {
      const availability = action.availability(context)
      if (!availability.available) {
        return false
      }
    }

    return true
  })

  // Sortieren: uiOrder ASC, dann label ASC
  filtered.sort((a, b) => {
    const orderA = a.uiOrder ?? 1000
    const orderB = b.uiOrder ?? 1000
    
    if (orderA !== orderB) {
      return orderA - orderB
    }
    
    return a.label.localeCompare(b.label, 'de')
  })

  return filtered
}

/**
 * Holt nur Primary Actions für ein Modul
 */
export function getPrimaryActions(module: ActionModule, context?: ActionContext): ActionDefinition[] {
  return getActionsForUI({
    module,
    placement: ['primary'],
    context,
  })
}

/**
 * Holt nur Secondary Actions für ein Modul
 */
export function getSecondaryActions(module: ActionModule, context?: ActionContext): ActionDefinition[] {
  return getActionsForUI({
    module,
    placement: ['secondary'],
    context,
  })
}

