'use client'

import { useState, useEffect } from 'react'
import {
  ArrowPathIcon,
  SparklesIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  TrashIcon,
  TagIcon,
  ClockIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import { AIActions } from '@/components/ui/AIActions'
import { QuickActions } from '@/components/ui/QuickActions'

type ViewState = 'ready' | 'loading' | 'error'

type DocumentDetailsDrawerProps = {
  documentId: string
  onClose?: () => void
}

// Mock Data
const MOCK_DOC = {
    id: 'd_123',
    name: 'Projektplan Q1.pdf',
    type: 'PDF',
    size: '2.4 MB',
    created: '14.12.2025 10:30',
    classification: 'Confidential',
    summary: 'Enthält die Roadmap für Q1, Budgetplanung und Ressourcenallokation.',
    tags: ['wichtig', 'roadmap', '2025']
}

export function DocumentDetailsDrawer({ documentId, onClose }: DocumentDetailsDrawerProps) {
  const [viewState, setViewState] = useState<ViewState>('loading')
  const [doc, setDoc] = useState<typeof MOCK_DOC | null>(null)

  useEffect(() => {
    // Simuliere Laden
    const timer = setTimeout(() => {
      setViewState('ready')
      setDoc(MOCK_DOC)
    }, 500)
    return () => clearTimeout(timer)
  }, [documentId])

  if (viewState === 'loading') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-[var(--ak-color-text-secondary)]" />
        <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">Wird geladen…</p>
      </div>
    )
  }

  if (viewState === 'error' || !doc) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <AkBadge tone="danger">Fehler</AkBadge>
        <div className="flex justify-end">
          <AkButton variant="primary" onClick={onClose}>
            Schließen
          </AkButton>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6 overflow-y-auto">
      {/* Header / Preview - Apple Style */}
      <div className="apple-card flex flex-col items-center gap-5 rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)] p-8 shadow-[var(--ak-shadow-sm)]">
        <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-2 border-white shadow-lg">
            <DocumentIcon className="h-16 w-16 text-blue-600" />
        </div>
        <div className="text-center">
            <h3 className="ak-heading text-xl mb-2 text-[var(--ak-color-text-primary)]">{doc.name}</h3>
            <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">{doc.size} • {doc.type}</p>
        </div>
        <div className="flex gap-3">
            <AkButton size="sm" variant="primary" leftIcon={<ArrowDownTrayIcon className="h-4 w-4"/>} className="apple-button-primary">Download</AkButton>
            <AkButton size="sm" variant="secondary" leftIcon={<ShareIcon className="h-4 w-4"/>} className="apple-button-secondary">Teilen</AkButton>
        </div>
      </div>
      
      {/* AI Suggestions & Quick Actions - in der Mitte */}
      <div className="flex flex-col gap-3 px-4 py-3 bg-[var(--ak-color-bg-surface-muted)]/50 rounded-xl border border-[var(--ak-color-border-subtle)]">
        <AIActions context="document" />
        <QuickActions context="document" />
      </div>
      
      {/* Quick Stats Widget */}
      <div className="grid grid-cols-3 gap-3">
          <div className="apple-card rounded-xl border border-[var(--ak-color-border-subtle)] bg-gradient-to-br from-blue-50 to-blue-100/50 p-4">
              <p className="ak-caption text-blue-600 mb-1 font-semibold">Größe</p>
              <p className="ak-body text-sm font-semibold text-blue-900">{doc.size}</p>
          </div>
          <div className="apple-card rounded-xl border border-[var(--ak-color-border-subtle)] bg-gradient-to-br from-purple-50 to-purple-100/50 p-4">
              <p className="ak-caption text-purple-600 mb-1 font-semibold">Typ</p>
              <p className="ak-body text-sm font-semibold text-purple-900">{doc.type}</p>
          </div>
          <div className="apple-card rounded-xl border border-[var(--ak-color-border-subtle)] bg-gradient-to-br from-green-50 to-green-100/50 p-4">
              <p className="ak-caption text-green-600 mb-1 font-semibold">Tags</p>
              <p className="ak-body text-sm font-semibold text-green-900">{doc.tags.length}</p>
          </div>
      </div>

      {/* Metadata - Apple Style */}
      <div className="apple-section rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)] p-5">
        <h4 className="ak-heading text-base mb-4 text-[var(--ak-color-text-primary)] flex items-center gap-2">
          <InformationCircleIcon className="h-5 w-5 text-[var(--ak-color-text-secondary)]" />
          Informationen
        </h4>
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ClockIcon className="h-5 w-5 text-[var(--ak-color-text-secondary)]"/>
                    <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">Erstellt am</p>
                </div>
                <p className="ak-body text-sm font-medium text-[var(--ak-color-text-primary)]">{doc.created}</p>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <InformationCircleIcon className="h-5 w-5 text-[var(--ak-color-text-secondary)]"/>
                    <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">Klassifizierung</p>
                </div>
                <AkBadge tone="warning">Confidential</AkBadge>
            </div>
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <TagIcon className="h-5 w-5 text-[var(--ak-color-text-secondary)]"/>
                    <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">Tags</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                    {doc.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Summary - Apple Style */}
      <div className="apple-section rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)] p-5">
        <h4 className="ak-heading text-base mb-4 text-[var(--ak-color-text-primary)] flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-purple-600" />
          KI-Zusammenfassung
        </h4>
        <div className="rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 p-4">
            <p className="ak-body text-sm leading-relaxed text-[var(--ak-color-text-primary)]">
                {doc.summary}
            </p>
        </div>
      </div>
      
      {/* Related Documents Widget */}
      <div className="apple-section rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)] p-5">
        <h4 className="ak-heading text-base mb-4 text-[var(--ak-color-text-primary)]">Ähnliche Dokumente</h4>
        <div className="space-y-2">
            {[1, 2, 3].map((i) => (
                <button
                    key={i}
                    type="button"
                    className="w-full text-left apple-card rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] p-3 hover:shadow-md transition-all active:scale-[0.98]"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <DocumentIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="ak-body text-sm font-medium text-[var(--ak-color-text-primary)] truncate">Ähnliches Dokument {i}.pdf</p>
                            <p className="ak-caption text-xs text-[var(--ak-color-text-secondary)]">Vor 2 Tagen</p>
                        </div>
                    </div>
                </button>
            ))}
        </div>
      </div>

      {/* Actions - Apple Style */}
      <div className="mt-auto border-t border-[var(--ak-color-border-hairline)] pt-4">
        <button
            type="button"
            onClick={() => {
              if (confirm('Dokument wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
                console.log('Delete document:', documentId)
                // TODO: API call to delete
                window.dispatchEvent(
                  new CustomEvent('aklow-notification', {
                    detail: { type: 'success', message: 'Dokument gelöscht' }
                  })
                )
                onClose?.()
              }
            }}
            className="apple-button-secondary w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all active:scale-[0.98]"
        >
            <TrashIcon className="h-4 w-4" />
            Dokument löschen
        </button>
      </div>

    </div>
  )
}
