'use client'

import { useEffect, useMemo, useState } from 'react'
import type { AIActionContext } from '@/components/ui/AIActions'
import type { QuickActionDefinition } from './quickActionsCatalog'

const STORAGE_KEY = 'ak.quickActionsPrefs.v1'

export type QuickActionPreference = {
  id: string
  label?: string
}

type QuickActionPrefsByContext = Partial<Record<AIActionContext, QuickActionPreference[]>>

function loadPrefs(): QuickActionPrefsByContext {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as QuickActionPrefsByContext
    return parsed ?? {}
  } catch (error) {
    console.warn('[QuickActionsPrefs] Konnte Prefs nicht laden:', error)
    return {}
  }
}

function savePrefs(prefs: QuickActionPrefsByContext) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch (error) {
    console.error('[QuickActionsPrefs] Konnte Prefs nicht speichern:', error)
  }
}

function normalizePrefs(
  context: AIActionContext,
  defaults: QuickActionDefinition[],
  prefs: QuickActionPrefsByContext
): QuickActionDefinition[] {
  const allowed = new Map(defaults.map((action) => [action.id, action]))
  const contextPrefs = prefs[context] ?? []

  if (!contextPrefs.length) {
    return defaults
  }

  const resolved: QuickActionDefinition[] = []
  for (const pref of contextPrefs) {
    const base = allowed.get(pref.id)
    if (!base) continue
    resolved.push({
      ...base,
      ...(pref.label ? { label: pref.label } : {}),
    })
  }

  // Fallback auf Defaults, falls nach Filterung nichts übrig bleibt
  return resolved.length > 0 ? resolved : defaults
}

function toPrefs(actions: QuickActionDefinition[]): QuickActionPreference[] {
  return actions.map(({ id, label }) => ({ id, label }))
}

export function useQuickActionPreferences(
  context: AIActionContext,
  defaults: QuickActionDefinition[]
) {
  const defaultsKey = useMemo(() => defaults.map((a) => a.id).join('|'), [defaults])
  const [actions, setActions] = useState<QuickActionDefinition[]>(defaults)

  useEffect(() => {
    const prefs = loadPrefs()
    // Defer state update to avoid React 19 cascading render warning
    Promise.resolve().then(() => {
      setActions(normalizePrefs(context, defaults, prefs))
    })
  }, [context, defaultsKey, defaults])

  const saveForContext = (next: QuickActionDefinition[]) => {
    const currentPrefs = loadPrefs()
    const nextPrefs: QuickActionPrefsByContext = {
      ...currentPrefs,
      [context]: toPrefs(next),
    }
    savePrefs(nextPrefs)
    setActions(normalizePrefs(context, defaults, nextPrefs))
  }

  const resetForContext = () => {
    const currentPrefs = loadPrefs()
    if (currentPrefs[context]) {
      const nextPrefs = { ...currentPrefs }
      delete nextPrefs[context]
      savePrefs(nextPrefs)
      setActions(defaults)
    }
  }

  return {
    actions,
    saveForContext,
    resetForContext,
  }
}

