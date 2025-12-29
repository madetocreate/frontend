/**
 * Validierung für Action Registry
 * Prüft Konsistenz und Vollständigkeit der Registry
 */

import { ACTION_REGISTRY } from './registry'
import { ACTION_ICON_MAP } from './icons'
import type { ActionDefinition, UIPlacement } from './types'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

const VALID_UIPLACEMENTS: UIPlacement[] = ['primary', 'secondary', 'menu', 'hidden']

/**
 * Validiert die gesamte Action Registry
 */
export function validateActionRegistry(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const actionIds = Object.keys(ACTION_REGISTRY) as Array<keyof typeof ACTION_REGISTRY>
  const seenIds = new Set<string>()

  // Prüfe jede Action
  for (const actionId of actionIds) {
    const action = ACTION_REGISTRY[actionId]

    // 1. Unique IDs
    if (seenIds.has(actionId)) {
      errors.push(`Duplicate Action ID: ${actionId}`)
    }
    seenIds.add(actionId)

    // 2. Required fields
    if (!action.id) {
      errors.push(`Action ${actionId}: id fehlt`)
    }
    if (!action.label) {
      errors.push(`Action ${actionId}: label fehlt`)
    }
    if (action.supportedModules.length === 0) {
      errors.push(`Action ${actionId}: supportedModules ist leer`)
    }
    if (action.uiPlacement === undefined) {
      errors.push(`Action ${actionId}: uiPlacement fehlt`)
    }
    if (action.requiresApproval === undefined) {
      errors.push(`Action ${actionId}: requiresApproval fehlt`)
    }

    // 3. uiPlacement valid
    if (action.uiPlacement && !VALID_UIPLACEMENTS.includes(action.uiPlacement)) {
      errors.push(`Action ${actionId}: Ungültiger uiPlacement "${action.uiPlacement}". Erlaubt: ${VALID_UIPLACEMENTS.join(', ')}`)
    }

    // 4. Icon-String existiert in Icon-Map
    if (action.icon && !ACTION_ICON_MAP[action.icon]) {
      warnings.push(`Action ${actionId}: Icon "${action.icon}" existiert nicht in ACTION_ICON_MAP`)
    }

    // 5. uiOrder sollte gesetzt sein (Warnung, nicht Fehler)
    if (action.uiOrder === undefined) {
      warnings.push(`Action ${actionId}: uiOrder nicht gesetzt (wird als 1000 behandelt)`)
    }

    // 6. ID sollte mit Modul-Präfix beginnen
    const modulePrefix = action.supportedModules[0]
    if (!actionId.startsWith(`${modulePrefix}.`)) {
      warnings.push(`Action ${actionId}: ID sollte mit Modul-Präfix "${modulePrefix}." beginnen`)
    }
  }

  const valid = errors.length === 0

  return {
    valid,
    errors,
    warnings,
  }
}

/**
 * Validiert die Registry beim App-Start (nur in Dev)
 */
export function validateRegistryOnInit(): void {
  if (process.env.NODE_ENV === 'production') {
    return // In Production keine Validierung
  }

  const result = validateActionRegistry()

  if (result.errors.length > 0) {
    console.error('[Action Registry Validation] FEHLER:', result.errors)
    // In Dev: Throw, damit es auffällt
    throw new Error(`Action Registry Validation fehlgeschlagen: ${result.errors.join('; ')}`)
  }

  if (result.warnings.length > 0) {
    console.warn('[Action Registry Validation] Warnungen:', result.warnings)
  }

  if (result.valid) {
    console.log('[Action Registry Validation] ✓ Registry ist gültig')
  }
}

