'use client'

import { useEffect } from 'react'
import clsx from 'clsx'
import { XMarkIcon } from '@heroicons/react/24/outline'

export type ThinkingStep = {
  id: string
  label: string
  status: string
  details?: string
}

type ThinkingStepsDrawerProps = {
  open: boolean
  onClose: () => void
  steps: ThinkingStep[]
  note?: string | null
  className?: string
}

function normalizeStatus(status: string): 'pending' | 'active' | 'done' {
  const s = (status || '').toLowerCase()
  if (s.includes('done') || s.includes('complete') || s.includes('success')) return 'done'
  if (s.includes('active') || s.includes('running') || s.includes('in_progress')) return 'active'
  return 'pending'
}

export function ThinkingStepsDrawer({ open, onClose, steps, note, className }: ThinkingStepsDrawerProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, open])

  if (!open) return null

  return (
    <div className={clsx('absolute inset-0 z-40', className)} aria-label="Orchestrator">
      <button
        type="button"
        className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Schließen"
      />
      <div className="absolute right-3 top-3 bottom-3 w-[360px] max-w-[92%] overflow-hidden rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-sidebar)] shadow-[var(--ak-shadow-strong)]">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--ak-color-border-subtle)] p-4">
          <div className="min-w-0">
            <p className="ak-heading truncate">Orchestrator</p>
            <p className="ak-caption mt-1 text-[var(--ak-color-text-secondary)]">
              {note ? note : 'Schritte & Status'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--ak-color-text-secondary)] transition-all duration-[var(--ak-motion-duration-fast)] ease-[var(--ak-motion-ease)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ak-color-accent)]/25"
            aria-label="Schließen"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex h-full flex-col overflow-y-auto p-4">
          {steps.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="ak-body text-[var(--ak-color-text-muted)]">Noch keine Schritte vorhanden.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {steps.map((step) => {
                const status = normalizeStatus(step.status)
                const dotClass =
                  status === 'done'
                    ? 'bg-[var(--ak-color-success)]'
                    : status === 'active'
                      ? 'bg-[var(--ak-color-accent)]'
                      : 'bg-[var(--ak-color-text-muted)]'

                return (
                  <div
                    key={step.id}
                    className="flex flex-col gap-1 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/70 p-3"
                  >
                    <div className="flex items-start gap-2">
                      <span className={clsx('mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full', dotClass, status === 'active' && 'animate-pulse')} />
                      <div className="min-w-0 flex-1">
                        <p className="ak-body truncate font-medium">{step.label}</p>
                        <p className="ak-caption mt-0.5 text-[var(--ak-color-text-muted)]">{status}</p>
                      </div>
                    </div>
                    {step.details ? (
                      <p className="ak-caption whitespace-pre-wrap text-[var(--ak-color-text-secondary)]">{step.details}</p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}

          <div className="h-10" />
        </div>
      </div>
    </div>
  )
}
