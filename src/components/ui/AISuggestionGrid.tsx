import React, { useEffect, useMemo, useState } from 'react'
import { SparklesIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
// Fast Actions removed - use Suggestion System instead (see Phase 3)
// This component now only uses fallback actions
import type { AIActionContext } from './AIActions'
import { isExecutableActionId } from '@/lib/actions/registry'
import { authedFetch } from '@/lib/api/authedFetch'

// Fallback action type (replaces FastActionSuggestion)
type FallbackAction = {
  id: string;
  label: string;
  handler: string;
  payload?: Record<string, unknown>;
}

type AISuggestionGridProps = {
  context: AIActionContext
  /** Primärer Inhalt oder letzte Nutzereingabe für die LLM */
  text?: string
  /** Kurze Zusammenfassung/Kontext (z.B. Betreff, Titel) */
  summary?: string
  /** Kanal (E-Mail, Chat, Telefon) falls relevant */
  channel?: string
  /** Optional: bereits bekannte Actions als Fallback */
  fallbackActions?: FallbackAction[]
  className?: string
  /** Callback wenn eine Aktion ausgewählt wurde. Wenn gesetzt, wird der Wizard unterdrückt. */
  onActionSelect?: (action: SuggestionUI) => void
  /** Optional: Target für Action-Mode (wenn vorhanden, werden Backend-Suggestions geladen) */
  target?: { id: string; type: string; title?: string }
  /** Optional: Item Summary für Action-Mode */
  itemSummary?: { text?: string; title?: string }
}

// FAIL-CLOSED: Nur Core-7 executable Actions als Fallbacks
// Fast Actions removed - only fallback actions remain
const DEFAULT_FALLBACKS: Partial<Record<AIActionContext, FallbackAction[]>> = {
  inbox: [
    { id: 'inbox.summarize', label: 'Zusammenfassen', handler: 'action_start', payload: { action_id: 'inbox.summarize' } },
    { id: 'inbox.draft_reply', label: 'Antwort verfassen', handler: 'action_start', payload: { action_id: 'inbox.draft_reply' } },
    { id: 'inbox.next_steps', label: 'Nächste Schritte', handler: 'action_start', payload: { action_id: 'inbox.next_steps' } },
    { id: 'inbox.ask_missing_info', label: 'Rückfragen', handler: 'action_start', payload: { action_id: 'inbox.ask_missing_info' } },
  ],
  document: [
    { id: 'documents.extract_key_fields', label: 'Schlüsselfelder extrahieren', handler: 'action_start', payload: { action_id: 'documents.extract_key_fields' } },
    { id: 'documents.summarize', label: 'Dokument zusammenfassen', handler: 'action_start', payload: { action_id: 'documents.summarize' } },
  ],
  customer: [
    { id: 'customers.profileShort', label: 'Profil Kurzfassung', handler: 'action_start', payload: { action_id: 'customers.profileShort' } },
    { id: 'customers.timelineSummary', label: 'Verlauf zusammenfassen', handler: 'action_start', payload: { action_id: 'customers.timelineSummary' } },
  ],
  growth: [
    { id: 'marketing.optimize_campaign', label: 'Kampagne optimieren', handler: 'action_start', payload: { action_id: 'marketing.optimize_campaign' } },
    { id: 'marketing.trend_scout', label: 'Trend Scout', handler: 'action_start', payload: { action_id: 'marketing.trend_scout' } },
  ],
  telephony: [
    { id: 'telephony.transcribe', label: 'Gespräch transkribieren', handler: 'action_start', payload: { action_id: 'telephony.transcribe' } },
    { id: 'telephony.analyze', label: 'Anruf analysieren', handler: 'action_start', payload: { action_id: 'telephony.analyze' } },
  ],
  website: [
    { id: 'website.leads_summary', label: 'Leads zusammenfassen', handler: 'action_start', payload: { action_id: 'website.leads_summary' } },
    { id: 'website.chatbot_optimize', label: 'Chatbot optimieren', handler: 'action_start', payload: { action_id: 'website.chatbot_optimize' } },
  ],
}

type SuggestionUI = FallbackAction & { description?: string }

export function AISuggestionGrid({
  context,
  text,
  summary,
  channel,
  fallbackActions,
  className,
  onActionSelect,
  target,
  itemSummary,
}: AISuggestionGridProps) {
  const [suggestions, setSuggestions] = useState<SuggestionUI[]>([])
  const [extraSuggestions, setExtraSuggestions] = useState<SuggestionUI[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingExtras, setLoadingExtras] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMore, setShowMore] = useState(false)

  // Action-Mode: Load Backend Suggestions if target is present
  useEffect(() => {
    if (target) {
      loadSuggestions()
    } else {
      // Compose-Mode: Use fallback actions
      const fb = fallbackActions ?? DEFAULT_FALLBACKS[context] ?? []
      setSuggestions(
        fb.slice(0, 2).map((s) => ({
          ...s,
          description: s.label,
        }))
      )
      setLoading(false)
    }
  }, [context, fallbackActions, target, itemSummary])

  const loadSuggestions = async () => {
    if (!target) return

    setLoading(true)
    setError(null)

    try {
      // Build context for backend request
      const actionContext = {
        module: context === 'inbox' ? 'inbox' :
               context === 'document' ? 'docs' :
               context === 'customer' ? 'customers' :
               context === 'growth' ? 'growth' :
               context === 'telephony' ? 'telephony' :
               context === 'website' ? 'website' : 'inbox',
        target: {
          id: target.id,
          type: target.type,
          title: target.title,
        },
        moduleContext: {
          inbox: channel ? { channel } : undefined,
          itemSummary: itemSummary ? {
            text: itemSummary.text || text || '',
            title: itemSummary.title || summary,
          } : undefined,
          item: {
            body: text || '',
            title: summary,
          },
        },
      }

      // Call 1: Get initial 3 suggestions (primary)
      const response1 = await authedFetch('/api/actions/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: actionContext,
          maxSuggestions: 3,
        }),
      })

      if (!response1.ok) {
        throw new Error(`Backend suggest failed: ${response1.status}`)
      }

      const data1 = await response1.json()
      const backendSuggestions1 = (data1.suggestions || []) as Array<{
        action_id: string
        title: string
        description?: string
        reason?: string
      }>

      // Extract action IDs from first batch
      const actionIds1 = backendSuggestions1.map(s => s.action_id)

      // Call 2: Get additional 3 suggestions (exclude first batch)
      const response2 = await authedFetch('/api/actions/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: actionContext,
          maxSuggestions: 3,
          excludeActionIds: actionIds1,
        }),
      })

      let backendSuggestions2: typeof backendSuggestions1 = []
      if (response2.ok) {
        const data2 = await response2.json()
        backendSuggestions2 = (data2.suggestions || []) as typeof backendSuggestions1
      }

      // Merge and dedupe by action_id
      const allBackendSuggestions = [...backendSuggestions1, ...backendSuggestions2]
      const seenIds = new Set<string>()
      const uniqueSuggestions: SuggestionUI[] = []

      for (const s of allBackendSuggestions) {
        if (!seenIds.has(s.action_id)) {
          // Fail-closed: Check if action is executable
          const { normalizeExecutableActionId } = await import('@/lib/actions/registry')
          const normalized = normalizeExecutableActionId(s.action_id)
          if (normalized) {
            seenIds.add(s.action_id)
            uniqueSuggestions.push({
              id: s.action_id,
              label: s.title,
              description: s.reason || s.description || s.title,
              handler: 'action_start',
              payload: { action_id: s.action_id },
            })
          }
        }
      }

      // Limit to 6 total
      const limitedSuggestions = uniqueSuggestions.slice(0, 6)

      // Fill remaining slots with fallback if needed (max 6 total)
      if (limitedSuggestions.length < 6) {
        const fb = fallbackActions ?? DEFAULT_FALLBACKS[context] ?? []
        const fallbackSet = new Set(limitedSuggestions.map(s => s.id))
        const additionalFallbacks = fb
          .filter(s => !fallbackSet.has(s.id))
          .slice(0, 6 - limitedSuggestions.length)
          .map(s => ({
            ...s,
            description: s.label,
          }))
        limitedSuggestions.push(...additionalFallbacks)
      }

      setSuggestions(limitedSuggestions.slice(0, 2)) // Primary: first 2
      setExtraSuggestions(limitedSuggestions.slice(2, 6)) // Extra: remaining (up to 4)
    } catch (err) {
      console.error('[AISuggestionGrid] Failed to load backend suggestions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load suggestions')
      // Fallback to default fallbacks on error
      const fb = fallbackActions ?? DEFAULT_FALLBACKS[context] ?? []
      setSuggestions(
        fb.slice(0, 2).map((s) => ({
          ...s,
          description: s.label,
        }))
      )
    } finally {
      setLoading(false)
    }
  }

  const loadExtraSuggestions = async () => {
    if (extraSuggestions.length > 0) {
      // Bereits geladen, einfach anzeigen
      setShowMore(true)
      return
    }

    // Action-Mode: Extra suggestions already loaded in loadSuggestions
    if (target) {
      setShowMore(true)
      return
    }

    // Compose-Mode: Load fallback extras
    setLoadingExtras(true)
    try {
      // Exclude bereits angezeigte Action IDs für diverse Vorschläge
      const excludedIds = suggestions.map(s => s.id)
      
      // Fallback: Nimm andere aus DEFAULT_FALLBACKS
      const fb = fallbackActions ?? DEFAULT_FALLBACKS[context] ?? []
      const excluded = new Set(excludedIds)
      const extras = fb.filter(s => !excluded.has(s.id)).slice(0, 4)
      setExtraSuggestions(
        extras.map((s) => ({
          ...s,
          description: s.label,
        }))
      )
    } finally {
      setLoadingExtras(false)
      setShowMore(true)
    }
  }

  const primary = useMemo(() => suggestions.slice(0, 2), [suggestions])
  const extras = useMemo(() => extraSuggestions.slice(0, 4), [extraSuggestions])

  const handleClick = async (s: SuggestionUI) => {
    // If a custom handler is provided, use it and skip global dispatch/wizard
    if (onActionSelect) {
      onActionSelect(s)
      return
    }

    // Extract action_id from payload or use id directly
    const actionId = (s.payload as any)?.action_id || s.id

    // FAIL-CLOSED: Normalisiere und validiere actionId
    const { normalizeExecutableActionId } = await import('@/lib/actions/registry')
    const normalized = normalizeExecutableActionId(actionId)
    
    if (!normalized) {
      console.warn(
        `[AISuggestionGrid] ActionId "${actionId}" ist nicht executable. Ignoriere.`,
        { suggestion: s }
      )
      setError('Aktion nicht verfügbar')
      return
    }

    // Trigger action-start event via helper (mit normalisierter ID)
    const { dispatchActionStart } = await import('@/lib/actions/dispatch')
    dispatchActionStart(
      normalized,
      {
        module: context === 'inbox' ? 'inbox' :
               context === 'document' ? 'documents' :
               context === 'customer' ? 'customers' :
               context === 'growth' ? 'growth' : undefined,
      },
      {},
      'ai-suggestion-grid'
    )
  }

  if (!suggestions.length && loading) {
    return (
      <div className={clsx('p-4 rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)]/50', className)}>
        <div className="text-[11px] text-[var(--ak-color-text-secondary)]">Lade KI-Vorschläge…</div>
      </div>
    )
  }

  if (!suggestions.length) return null

  const renderGrid = (items: SuggestionUI[]) => (
    <div className="grid grid-cols-2 gap-2">
      {items.map((s) => {
        const actionId = (s.payload as any)?.action_id || s.id
        const executable = isExecutableActionId(actionId)
        
        return (
          <button
            key={s.id}
            onClick={() => executable && handleClick(s)}
            disabled={!executable}
            className={clsx(
              "flex items-start gap-2 p-2 rounded-lg bg-[var(--ak-color-bg-surface)] border transition-all text-left",
              executable 
                ? "border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-color-accent)] hover:shadow-sm" 
                : "opacity-50 grayscale border-dashed border-[var(--ak-color-border-subtle)] cursor-not-allowed"
            )}
            title={!executable ? "Aktion demnächst verfügbar" : undefined}
          >
            <div className="mt-0.5">
              <SparklesIcon className={clsx("w-4 h-4", executable ? "text-[var(--ak-color-accent)]" : "text-[var(--ak-color-text-muted)]")} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[var(--ak-color-text-primary)] leading-tight truncate">
                {s.label}
                {!executable && " (Coming Soon)"}
              </p>
              {s.description && (
                <p className="text-[10px] text-[var(--ak-color-text-secondary)] leading-snug truncate">
                  {s.description}
                </p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )

  return (
    <div
      className={clsx(
        'p-4 rounded-2xl bg-[var(--ak-color-bg-elevated)] border border-[var(--ak-color-border-subtle)]',
        className
      )}
    >
      {/* Keine Header/Überschrift mehr - erklärt sich von selbst */}

      {/* 2 Hauptaktionen - immer sichtbar */}
      {primary.length > 0 && renderGrid(primary)}

      {/* 4 weitere Aktionen - aufrufbar */}
      <div className="mt-2">
        {!showMore ? (
          <button
            type="button"
            onClick={loadExtraSuggestions}
            disabled={loadingExtras}
            className="w-full text-center text-[10px] font-bold text-[var(--ak-color-accent)] hover:bg-[var(--ak-color-accent-soft)] py-1 rounded transition-colors disabled:opacity-50"
          >
            {loadingExtras ? 'Lade weitere Aktionen...' : '+ 4 weitere Aktionen'}
          </button>
        ) : (
          <>
            {loadingExtras ? (
              <div className="text-center text-[10px] text-[var(--ak-color-text-secondary)] py-2">
                Lade weitere Aktionen...
              </div>
            ) : extras.length > 0 ? (
              <div className="mt-2">{renderGrid(extras)}</div>
            ) : null}
            <button
              type="button"
              onClick={() => setShowMore(false)}
              className="w-full text-center text-[10px] font-medium text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] py-1 rounded transition-colors mt-1"
            >
              Weniger
            </button>
          </>
        )}
      </div>
    </div>
  )
}


