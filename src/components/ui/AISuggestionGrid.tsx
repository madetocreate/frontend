import React, { useEffect, useMemo, useState } from 'react'
import { SparklesIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { fetchFastActions, type FastActionSuggestion } from '@/lib/fastActionsClient'
import { dispatchAction } from '@/lib/actionHandlers'
import type { AIActionContext } from './AIActions'

type AISuggestionGridProps = {
  context: AIActionContext
  /** Primärer Inhalt oder letzte Nutzereingabe für die LLM */
  text?: string
  /** Kurze Zusammenfassung/Kontext (z.B. Betreff, Titel) */
  summary?: string
  /** Kanal (E-Mail, Chat, Telefon) falls relevant */
  channel?: string
  /** Optional: bereits bekannte Actions als Fallback */
  fallbackActions?: FastActionSuggestion[]
  className?: string
  /** Callback wenn eine Aktion ausgewählt wurde. Wenn gesetzt, wird der Wizard unterdrückt. */
  onActionSelect?: (action: SuggestionUI) => void
}

const DEFAULT_FALLBACKS: Partial<Record<AIActionContext, FastActionSuggestion[]>> = {
  inbox: [
    { id: 'reply', label: 'Antwort verfassen', handler: 'prefill_prompt', payload: {} },
    { id: 'summarize', label: 'Zusammenfassen', handler: 'prefill_prompt', payload: {} },
    { id: 'prioritize', label: 'Priorität setzen', handler: 'prefill_prompt', payload: {} },
    { id: 'translate', label: 'Übersetzen', handler: 'prefill_prompt', payload: {} },
    { id: 'suggest-followup', label: 'Follow-up vorschlagen', handler: 'prefill_prompt', payload: {} },
    { id: 'extract-tasks', label: 'Tasks extrahieren', handler: 'prefill_prompt', payload: {} },
  ],
  customer: [
    { id: 'enrich', label: 'Kunde anreichern', handler: 'prefill_prompt', payload: {} },
    { id: 'segment', label: 'Segment zuweisen', handler: 'prefill_prompt', payload: {} },
    { id: 'suggest-offer', label: 'Angebot vorschlagen', handler: 'prefill_prompt', payload: {} },
    { id: 'predict-churn', label: 'Churn-Risiko', handler: 'prefill_prompt', payload: {} },
    { id: 'recommend-product', label: 'Produkt empfehlen', handler: 'prefill_prompt', payload: {} },
    { id: 'extract-tasks', label: 'Tasks extrahieren', handler: 'prefill_prompt', payload: {} },
  ],
  document: [
    { id: 'summarize', label: 'Zusammenfassen', handler: 'prefill_prompt', payload: {} },
    { id: 'extract-keypoints', label: 'Kernpunkte extrahieren', handler: 'prefill_prompt', payload: {} },
    { id: 'translate', label: 'Übersetzen', handler: 'prefill_prompt', payload: {} },
    { id: 'suggest-improvements', label: 'Verbesserungen vorschlagen', handler: 'prefill_prompt', payload: {} },
    { id: 'check-compliance', label: 'Compliance prüfen', handler: 'prefill_prompt', payload: {} },
    { id: 'generate-summary', label: 'Executive Summary', handler: 'prefill_prompt', payload: {} },
  ],
  growth: [
    { id: 'start-campaign', label: 'Kampagne starten', handler: 'prefill_prompt', payload: {} },
    { id: 'suggest-audience', label: 'Zielgruppe vorschlagen', handler: 'prefill_prompt', payload: {} },
    { id: 'optimize-budget', label: 'Budget optimieren', handler: 'prefill_prompt', payload: {} },
    { id: 'generate-content', label: 'Content generieren', handler: 'prefill_prompt', payload: {} },
    { id: 'analyze-performance', label: 'Performance analysieren', handler: 'prefill_prompt', payload: {} },
    { id: 'suggest-channels', label: 'Kanäle vorschlagen', handler: 'prefill_prompt', payload: {} },
  ],
  telephony: [
    { id: 'summarize-call', label: 'Call zusammenfassen', handler: 'prefill_prompt', payload: {} },
    { id: 'extract-action-items', label: 'Action Items extrahieren', handler: 'prefill_prompt', payload: {} },
    { id: 'analyze-sentiment', label: 'Stimmung analysieren', handler: 'prefill_prompt', payload: {} },
    { id: 'suggest-followup', label: 'Follow-up vorschlagen', handler: 'prefill_prompt', payload: {} },
    { id: 'generate-report', label: 'Report erstellen', handler: 'prefill_prompt', payload: {} },
  ],
  website: [
    { id: 'train-bot', label: 'Antworten trainieren', handler: 'prefill_prompt', payload: {} },
    { id: 'optimize-widget', label: 'Widget optimieren', handler: 'prefill_prompt', payload: {} },
    { id: 'generate-snippets', label: 'Snippets generieren', handler: 'prefill_prompt', payload: {} },
    { id: 'analyze-traffic', label: 'Traffic analysieren', handler: 'prefill_prompt', payload: {} },
    { id: 'optimize-leads', label: 'Leadflow optimieren', handler: 'prefill_prompt', payload: {} },
  ],
  shield: [
    { id: 'policy-check', label: 'Policy Check', handler: 'prefill_prompt', payload: {} },
    { id: 'pii-mask', label: 'PII prüfen', handler: 'prefill_prompt', payload: {} },
    { id: 'risk-report', label: 'Risiko-Report', handler: 'prefill_prompt', payload: {} },
    { id: 'injection-scan', label: 'Injection Scan', handler: 'prefill_prompt', payload: {} },
  ],
}

type SuggestionUI = FastActionSuggestion & { description?: string }

export function AISuggestionGrid({
  context,
  text,
  summary,
  channel,
  fallbackActions,
  className,
  onActionSelect,
}: AISuggestionGridProps) {
  const [suggestions, setSuggestions] = useState<SuggestionUI[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    let ignore = false
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetchFastActions({
          surface: 'detail_drawer',
          language: 'de',
          max_actions: 8,
          channel,
          last_user_message: text || '',
          conversation_summary: summary || '',
        })
        if (ignore) return

        if (!res.suggestions || res.suggestions.length === 0) {
            throw new Error('Keine Vorschläge von der KI erhalten')
        }

        const mapped: SuggestionUI[] = res.suggestions.map((s) => ({
          ...s,
          description: s.why_this || s.label,
        }))
        setSuggestions(mapped)
      } catch (e: unknown) {
        console.warn('[AI Suggestions] fallback to defaults', e)
        const fb = fallbackActions ?? DEFAULT_FALLBACKS[context] ?? []
        setSuggestions(
          fb.map((s) => ({
            ...s,
            description: s.label,
          }))
        )
        const message = e instanceof Error ? e.message : 'Konnte Vorschläge nicht laden'
        setError(message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    void run()
    return () => {
      ignore = true
    }
  }, [context, text, summary, channel, fallbackActions])

  const primary = useMemo(() => suggestions.slice(0, 4), [suggestions])
  const extras = useMemo(() => suggestions.slice(4, 8), [suggestions])

  const handleClick = (s: SuggestionUI) => {
    // If a custom handler is provided, use it and skip global dispatch/wizard
    if (onActionSelect) {
      onActionSelect(s)
      return
    }

    // Trigger global action dispatcher; keep payload & handler for execution
    dispatchAction({
      type: 'ai-action',
      actionId: s.id,
      context,
      data: {
        handler: s.handler,
        payload: s.payload,
        confidence: s.confidence,
      },
    })
    // Fire wizard event for UI flows
    // Open the AI Action Wizard with the selected action
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('aklow-ai-action-wizard', {
          detail: {
            context,
            action: s,
            source: 'ai-suggestion-grid',
          },
        })
      )
    }
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
      {items.map((s) => (
        <button
          key={s.id}
          onClick={() => handleClick(s)}
          className="flex items-start gap-2 p-2 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-color-accent)] hover:shadow-sm transition-all text-left"
        >
          <div className="mt-0.5">
            <SparklesIcon className="w-4 h-4 text-[var(--ak-color-accent)]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[var(--ak-color-text-primary)] leading-tight truncate">{s.label}</p>
            {s.description && (
              <p className="text-[10px] text-[var(--ak-color-text-secondary)] leading-snug truncate">
                {s.description}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  )

  return (
    <div
      className={clsx(
        'p-4 rounded-2xl bg-[var(--ak-color-bg-elevated)] border border-[var(--ak-color-border-subtle)]',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--ak-color-bg-surface)] flex items-center justify-center shrink-0 border border-[var(--ak-color-border-hairline)]">
            <SparklesIcon className="w-4 h-4 text-[var(--ak-color-accent)]" />
          </div>
          <div className="leading-tight">
            <p className="text-[11px] font-bold text-[var(--ak-color-text-primary)]">KI-Vorschläge</p>
            {summary && (
              <p className="text-[10px] text-[var(--ak-color-text-muted)] line-clamp-1">
                Kontext: {summary}
              </p>
            )}
          </div>
        </div>
        {error && (
          <span className="text-[10px] text-[var(--ak-color-text-muted)]">{error}</span>
        )}
      </div>

      {/* 4 Hauptaktionen */}
      {primary.length > 0 && renderGrid(primary)}

      {/* Mehr Aktionen (4 weitere) */}
      {extras.length > 0 && (
        <div className="mt-2">
          {!showMore ? (
            <button
              type="button"
              onClick={() => setShowMore(true)}
              className="w-full text-center text-[10px] font-bold text-[var(--ak-color-accent)] hover:bg-[var(--ak-color-accent-soft)] py-1 rounded transition-colors"
            >
              + {extras.length} weitere Aktionen
            </button>
          ) : (
            <>
              <div className="mt-2">{renderGrid(extras)}</div>
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
      )}
    </div>
  )
}


