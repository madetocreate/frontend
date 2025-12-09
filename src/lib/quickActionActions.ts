'use client'

import type { QuickActionPayload } from '@/lib/quickActionsBus'

export type QuickActionCustomAction = {
  type: string
  payload?: Record<string, unknown>
}

function normalizeSource(source?: string): string {
  if (!source) return 'generic'
  if (source.startsWith('marketing')) return 'marketing'
  if (source.startsWith('automation')) return 'automation'
  if (source.startsWith('memory')) return 'memory'
  return source
}

export function buildQuickActionCustomAction(
  payload: QuickActionPayload,
): QuickActionCustomAction | null {
  const id = payload.id ?? ''
  const source = normalizeSource(payload.source)

  return {
    type: 'quick_action.triggered',
    payload: {
      id,
      source,
    },
  }
}
