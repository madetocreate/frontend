'use client'

import { useState, useEffect } from 'react'
import clsx from 'clsx'
import {
  SparklesIcon,
  ArrowTopRightOnSquareIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

type DocumentKind = 'Rechnung' | 'Vertrag' | 'Foto' | 'Sonstiges'

type DocumentStatus = 'Analysiert' | 'In Arbeit' | 'Fehler'

type DocumentSource = 'Upload' | 'E-Mail' | 'Posteingang'

type KindOption = {
  label: string
  value: string
  disabled?: boolean
}

type DocumentDetailsDrawerProps = {
  documentId: string
  onClose?: () => void
}

const STATUS_BADGE_COLOR_MAP = {
  Analysiert: 'border-[var(--ak-color-border-success)] bg-[var(--ak-color-bg-success)] text-[var(--ak-color-text-success)]',
  'In Arbeit': 'border-[var(--ak-color-border-info)] bg-[var(--ak-color-bg-info)] text-[var(--ak-color-text-info)]',
  Fehler: 'border-[var(--ak-color-border-danger)] bg-[var(--ak-color-bg-danger)] text-[var(--ak-color-text-danger)]',
}

// Mock-Daten
const MOCK_DOCUMENT = {
  id: 'd_123',
  title: 'Mietvertrag Berlin',
  kind: 'Vertrag' as DocumentKind,
  status: 'In Arbeit' as DocumentStatus,
  createdAt: '2025-12-10',
  source: 'Upload' as DocumentSource,
  customerName: 'Acme GmbH',
  tags: ['Miete', '2025'],
}

const KIND_OPTIONS: KindOption[] = [
  { label: 'Rechnung', value: 'Rechnung' },
  { label: 'Vertrag', value: 'Vertrag' },
  { label: 'Foto', value: 'Foto' },
  { label: 'Sonstiges', value: 'Sonstiges' },
]

export function DocumentDetailsDrawer({ documentId, onClose }: DocumentDetailsDrawerProps) {
  const [hasDoc, setHasDoc] = useState(false)
  const [doc, setDoc] = useState<typeof MOCK_DOCUMENT | null>(null)
  const [formData, setFormData] = useState({
    kind: '',
    title: '',
    customerName: '',
    tagsCsv: '',
  })

  useEffect(() => {
    // Simuliere Laden
    const timer = setTimeout(() => {
      setHasDoc(true)
      setDoc(MOCK_DOCUMENT)
      setFormData({
        kind: MOCK_DOCUMENT.kind,
        title: MOCK_DOCUMENT.title,
        customerName: MOCK_DOCUMENT.customerName,
        tagsCsv: MOCK_DOCUMENT.tags.join(', '),
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [documentId])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Save document metadata
    console.log('Save document metadata:', formData)
  }

  const handleShowInChat = () => {
    // TODO: Show document in chat
    console.log('Show document in chat:', documentId)
    onClose?.()
  }

  const handleDownload = () => {
    // TODO: Download document
    console.log('Download document:', documentId)
  }

  const handleReanalyze = () => {
    // TODO: Reanalyze document
    console.log('Reanalyze document:', documentId)
  }

  if (!hasDoc || !doc) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <h3 className="ak-heading text-sm">Kein Dokument ausgewählt</h3>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="ak-caption text-sm text-[var(--ak-color-text-secondary)]">Dokument – Details</p>
          <h2 className="ak-heading line-clamp-1 text-base">{doc.title}</h2>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleShowInChat}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
        >
          <SparklesIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
        >
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleReanalyze}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
        >
          <ArrowPathIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="h-px bg-[var(--ak-color-border-subtle)]" />

      {/* Formular */}
      <form onSubmit={handleFormSubmit}>
        <div className="flex flex-col gap-4">
          {/* Übersicht */}
          <div className="flex flex-col gap-2">
            <p className="ak-caption text-[var(--ak-color-text-secondary)]">Übersicht</p>
            
            {/* Typ */}
            <div className="flex items-center justify-between">
              <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">Typ</p>
              <select
                name="form.kind"
                value={formData.kind}
                onChange={(e) => setFormData((prev) => ({ ...prev, kind: e.target.value }))}
                className="w-48 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-sm text-[var(--ak-color-text-primary)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)]"
              >
                {KIND_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">Status</p>
              <span
                className={clsx(
                  'inline-flex items-center rounded-[var(--ak-radius-md)] border px-2 py-0.5 text-[10px] font-medium',
                  STATUS_BADGE_COLOR_MAP[doc.status]
                )}
              >
                {doc.status}
              </span>
            </div>

            {/* Quelle */}
            <div className="flex items-center justify-between">
              <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">Quelle</p>
              <p className="ak-body text-sm text-[var(--ak-color-text-primary)]">{doc.source}</p>
            </div>

            {/* Datum */}
            <div className="flex items-center justify-between">
              <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">Datum</p>
              <p className="ak-body text-sm text-[var(--ak-color-text-primary)]">{doc.createdAt}</p>
            </div>
          </div>

          <div className="h-px bg-[var(--ak-color-border-subtle)]" />

          {/* Zuordnung */}
          <div className="flex flex-col gap-2">
            <p className="ak-caption text-[var(--ak-color-text-secondary)]">Zuordnung</p>
            
            {/* Kunde */}
            <div className="flex items-center justify-between">
              <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">Kunde</p>
              <input
                type="text"
                name="form.customerName"
                value={formData.customerName}
                onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value }))}
                placeholder="Name"
                className="w-48 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)]"
              />
            </div>

            {/* Tags */}
            <div className="flex items-center justify-between">
              <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">Tags</p>
              <input
                type="text"
                name="form.tagsCsv"
                value={formData.tagsCsv}
                onChange={(e) => setFormData((prev) => ({ ...prev, tagsCsv: e.target.value }))}
                placeholder="z. B. Projekt, 2025"
                className="w-48 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)]"
              />
            </div>
          </div>

          <div className="h-px bg-[var(--ak-color-border-subtle)]" />

          {/* Metadaten */}
          <div className="flex flex-col gap-2">
            <p className="ak-caption text-[var(--ak-color-text-secondary)]">Metadaten</p>
            
            {/* Titel */}
            <div className="flex items-center justify-between">
              <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">Titel</p>
              <input
                type="text"
                name="form.title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Titel"
                className="w-48 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)]"
              />
            </div>

            {/* Speichern Button */}
            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg border border-[var(--ak-color-accent)] bg-[var(--ak-color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--ak-color-accent)]/90"
              >
                Speichern
              </button>
            </div>
          </div>

          <div className="h-px bg-[var(--ak-color-border-subtle)]" />

          {/* Erweitert */}
          <div className="flex flex-col gap-2">
            <p className="ak-caption text-[var(--ak-color-text-secondary)]">Erweitert</p>
            <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">ID: {doc.id}</p>
            <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">
              Hinweis: Tags als kommagetrennte Liste eingeben. Leere Einträge werden ignoriert.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}

