/**
 * Phase 2: NeedsInputCard - Shows missing fields for action execution.
 * 
 * Displays missing fields as input chips/fields that user can fill in.
 * When submitted, triggers action execution again with filled params.
 */
'use client'

import React, { useState } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { getReasonCodeMessage } from '@/lib/actions/reasonCodes'

interface NeedsInputCardProps {
  actionId: string
  missingFields: string[]
  errors?: string[]
  reasonCode?: string  // Phase 5: Reason code
  onFix: (params: Record<string, string>) => Promise<void>
}

export function NeedsInputCard({ actionId, missingFields, errors, reasonCode, onFix }: NeedsInputCardProps) {
  // Phase 5: Get reason code message
  const reasonMessage = reasonCode ? getReasonCodeMessage(reasonCode) : null
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFieldChange = (field: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    // Check all required fields are filled
    const allFilled = missingFields.every(field => {
      const value = fieldValues[field]
      return value && value.trim().length > 0
    })

    if (!allFilled) {
      return
    }

    setIsSubmitting(true)
    try {
      await onFix(fieldValues)
    } catch (error) {
      console.error('[NeedsInputCard] Failed to fix params:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Map field names to user-friendly labels
  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      thread_id: 'Thread ID',
      doc_id: 'Dokument ID',
      review_id: 'Review ID',
      customer_id: 'Kunden ID',
      customer_query: 'Kundensuche',
      missing_fields: 'Fehlende Felder',
    }
    return labels[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] p-4 shadow-sm">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)] mb-1">
            {reasonMessage?.title || 'Fehlende Informationen'}
          </h3>
          <p className="text-sm text-[var(--ak-color-text-secondary)]">
            {reasonMessage?.message || 'Bitte füllen Sie die folgenden Felder aus, um die Aktion auszuführen:'}
          </p>
        </div>

        {errors && errors.length > 0 && (
          <div className="rounded-lg bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-subtle)] p-3">
            <p className="text-xs font-medium text-[var(--ak-color-text-secondary)] mb-1">Fehler:</p>
            <ul className="text-xs text-[var(--ak-color-text-secondary)] list-disc list-inside space-y-1">
              {errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          {missingFields.map((field) => (
            <div key={field}>
              <label className="block text-xs font-medium text-[var(--ak-color-text-secondary)] mb-1">
                {getFieldLabel(field)}
              </label>
              <input
                type="text"
                value={fieldValues[field] || ''}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                placeholder={`${getFieldLabel(field)} eingeben...`}
                disabled={isSubmitting}
                className="w-full px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !missingFields.every(f => fieldValues[f]?.trim())}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--ak-color-accent)] text-sm font-medium hover:bg-[var(--ak-color-accent-strong)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ color: 'var(--ak-text-primary-dark)' }}
        >
          <PaperAirplaneIcon className="h-4 w-4" />
          {isSubmitting ? 'Wird gesendet...' : 'Aktion ausführen'}
        </button>
      </div>
    </div>
  )
}

