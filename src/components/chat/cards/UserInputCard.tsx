'use client'

import React, { useState } from 'react'
import { UserInputCardPayload } from './types'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { sendInput } from '@/lib/actionRuns/client'

interface UserInputCardProps {
  card: UserInputCardPayload
  onAction?: (actionId: string, params?: any) => void
}

export function UserInputCard({ card, onAction }: UserInputCardProps) {
  const [inputValue, setInputValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { stepKey, inputKey, prompt, suggestions, runId } = card.payload

  const handleSubmit = async (value?: string) => {
    const finalValue = value || inputValue
    if (!finalValue.trim() || !runId || !stepKey) {
      return
    }

    setIsSubmitting(true)
    try {
      await sendInput(runId, {
        step_key: stepKey,
        input_key: inputKey,
        input: finalValue,
      })
      onAction?.('user_input_submitted', { stepKey, inputKey, value: finalValue, runId })
      setInputValue('') // Clear input after successful submit
    } catch (error) {
      console.error('[UserInputCard] Failed to send input:', error)
      // Emit error notification
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('aklow-notification', {
            detail: { type: 'error', message: 'Fehler beim Senden der Eingabe' }
          })
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuggestionClick = (suggestion: { id: string; label: string; value?: string }) => {
    const value = suggestion.value || suggestion.label
    handleSubmit(value)
  }

  return (
    <div className="rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] p-4 shadow-sm">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)] mb-1">
            Eingabe erforderlich
          </h3>
          <p className="text-sm text-[var(--ak-color-text-primary)]">
            {prompt}
          </p>
        </div>

        {suggestions && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isSubmitting}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] border border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder="Ihre Antwort..."
            disabled={isSubmitting}
            className="flex-1 px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={() => handleSubmit()}
            disabled={isSubmitting || !inputValue.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--ak-color-accent)] text-sm font-medium hover:bg-[var(--ak-color-accent-strong)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ color: 'var(--ak-text-primary-dark)' }}
          >
            <PaperAirplaneIcon className="h-4 w-4" />
            Senden
          </button>
        </div>
      </div>
    </div>
  )
}

