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
import { WidgetCard } from '@/components/ui/WidgetCard'
import { AkListRow } from '@/components/ui/AkListRow'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import { AIActions } from '@/components/ui/AIActions'

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
    <div className="flex h-full flex-col gap-6 p-1">
      {/* AI Actions */}
      <AIActions context="document" />
      
      {/* Header / Preview */}
      <div className="flex flex-col items-center gap-4 py-6 border-b border-[var(--ak-color-border-hairline)]">
        <div className="h-24 w-24 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
            <DocumentIcon className="h-12 w-12" />
        </div>
        <div className="text-center">
            <h3 className="font-medium text-lg text-[var(--ak-color-text-primary)]">{doc.name}</h3>
            <p className="text-sm text-[var(--ak-color-text-secondary)]">{doc.size} • {doc.type}</p>
        </div>
        <div className="flex gap-2">
            <AkButton size="sm" variant="secondary" leftIcon={<ArrowDownTrayIcon className="h-4 w-4"/>}>Download</AkButton>
            <AkButton size="sm" variant="secondary" leftIcon={<ShareIcon className="h-4 w-4"/>}>Teilen</AkButton>
        </div>
      </div>

      {/* Metadata */}
      <WidgetCard title="Informationen" padding="none">
        <div className="divide-y divide-[var(--ak-color-border-hairline)]">
            <AkListRow 
                title="Erstellt am" 
                subtitle={doc.created} 
                leading={<ClockIcon className="h-5 w-5 text-gray-400"/>} 
            />
            <AkListRow 
                title="Klassifizierung" 
                subtitle={doc.classification} 
                leading={<InformationCircleIcon className="h-5 w-5 text-gray-400"/>} 
                trailing={<AkBadge tone="warning">Confidential</AkBadge>}
            />
             <AkListRow 
                title="Tags" 
                leading={<TagIcon className="h-5 w-5 text-gray-400"/>} 
                trailing={
                    <div className="flex gap-1">
                        {doc.tags.map(tag => (
                            <AkBadge key={tag} tone="neutral" size="sm">#{tag}</AkBadge>
                        ))}
                    </div>
                }
            />
        </div>
      </WidgetCard>

      {/* Summary */}
      <WidgetCard title="Zusammenfassung" padding="md">
        <div className="flex gap-3">
            <SparklesIcon className="h-5 w-5 text-[var(--ak-color-accent)] shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--ak-color-text-secondary)] leading-relaxed">
                {doc.summary}
            </p>
        </div>
      </WidgetCard>

      {/* Actions */}
      <div className="mt-auto border-t border-[var(--ak-color-border-hairline)] pt-4">
        <AkButton variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" leftIcon={<TrashIcon className="h-4 w-4"/>}>
            Dokument löschen
        </AkButton>
      </div>

    </div>
  )
}
