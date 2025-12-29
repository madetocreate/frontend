'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { AkButton } from '@/components/ui/AkButton'
import { getCustomInstructions, setCustomInstructions, type CustomInstructions } from '@/lib/customInstructionsStore'

interface CustomInstructionsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function CustomInstructionsDialog({ isOpen, onClose }: CustomInstructionsDialogProps) {
  const [instructions, setInstructions] = useState<CustomInstructions>({
    about: '',
    responseStyle: '',
    enabled: false,
  })
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const current = getCustomInstructions()
      setInstructions(current)
      setHasChanges(false)
    }
  }, [isOpen])

  const handleSave = () => {
    setCustomInstructions(instructions)
    setHasChanges(false)
    onClose()
  }

  const handleCancel = () => {
    const current = getCustomInstructions()
    setInstructions(current)
    setHasChanges(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--ak-color-border-subtle)] px-6 py-4">
          <div className="flex items-center gap-3">
            <SparklesIcon className="h-5 w-5 text-[var(--ak-color-accent)]" />
            <h2 className="ak-heading text-lg">Custom Instructions</h2>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex h-8 w-8 items-center justify-center rounded text-[var(--ak-color-text-secondary)] transition-colors hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]"
            aria-label="Schließen"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={instructions.enabled}
                onChange={(e) => {
                  setInstructions(prev => ({ ...prev, enabled: e.target.checked }))
                  setHasChanges(true)
                }}
                className="form-checkbox h-4 w-4 text-[var(--ak-color-accent)] rounded"
              />
              <span className="text-sm font-medium text-[var(--ak-color-text-primary)]">
                Custom Instructions aktivieren
              </span>
            </label>
            <p className="text-xs text-[var(--ak-color-text-muted)] ml-7">
              Wenn aktiviert, werden diese Anweisungen bei jedem Chat berücksichtigt.
            </p>
          </div>

          {instructions.enabled && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--ak-color-text-primary)]">
                  Was möchtest du, dass der Assistent über dich weiß?
                </label>
                <p className="text-xs text-[var(--ak-color-text-muted)] mb-2">
                  Diese Informationen helfen dem Assistenten, besser auf dich zugeschnittene Antworten zu geben.
                </p>
                <textarea
                  value={instructions.about}
                  onChange={(e) => {
                    setInstructions(prev => ({ ...prev, about: e.target.value }))
                    setHasChanges(true)
                  }}
                  placeholder="z.B. Ich bin Software-Entwickler und arbeite hauptsächlich mit TypeScript und React..."
                  className="w-full h-32 px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus-visible:outline-none focus-visible:border-[var(--ak-color-accent)] focus-visible:ring-1 focus-visible:ring-[var(--ak-color-accent-soft)] transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--ak-color-text-primary)]">
                  Wie soll der Assistent antworten?
                </label>
                <p className="text-xs text-[var(--ak-color-text-muted)] mb-2">
                  Definiere den Stil, die Länge und den Ton der Antworten.
                </p>
                <textarea
                  value={instructions.responseStyle}
                  onChange={(e) => {
                    setInstructions(prev => ({ ...prev, responseStyle: e.target.value }))
                    setHasChanges(true)
                  }}
                  placeholder="z.B. Antworte immer auf Deutsch. Erkläre technische Konzepte detailliert. Verwende Code-Beispiele wenn möglich..."
                  className="w-full h-32 px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus-visible:outline-none focus-visible:border-[var(--ak-color-accent)] focus-visible:ring-1 focus-visible:ring-[var(--ak-color-accent-soft)] transition-all resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-[var(--ak-color-border-subtle)] px-6 py-4">
          <AkButton variant="secondary" onClick={handleCancel}>
            Abbrechen
          </AkButton>
          <AkButton variant="primary" onClick={handleSave} disabled={!hasChanges}>
            Speichern
          </AkButton>
        </div>
      </div>
    </div>
  )
}

