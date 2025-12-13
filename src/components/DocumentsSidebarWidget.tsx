'use client'

import { useState, useMemo } from 'react'
import clsx from 'clsx'
import {
  InformationCircleIcon,
  EllipsisHorizontalIcon,
  BoltIcon,
  DocumentTextIcon,
  SparklesIcon,
  ChevronRightIcon,
  Square3Stack3DIcon,
  PhotoIcon,
  DocumentIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline'

type DocumentItem = {
  id: string
  icon: string
  title: string
  meta: string
}

type QuickAction = {
  label: string
  actionKey: string
  icon: string
}

type FilterOption = {
  label: string
  value: 'all' | 'invoice' | 'contract' | 'photo' | 'other'
}

type DocumentsSidebarWidgetProps = {
  onDocumentClick?: (documentId: string) => void
  onOpenDetail?: (documentId: string) => void
  onOverviewClick?: () => void
}

// Icon-Mapping für Quick Actions und Dokumente
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  bolt: BoltIcon,
  'square-text': Square3Stack3DIcon,
  sparkle: SparklesIcon,
  document: DocumentIcon,
  'square-image': PhotoIcon,
  'page-blank': RectangleStackIcon,
}

// Mock-Daten basierend auf dem neuen Schema
const MOCK_QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Belege auslesen',
    actionKey: 'docs_extract_receipts',
    icon: 'bolt',
  },
  {
    label: 'PDF‑Stapel sortieren',
    actionKey: 'docs_sort_pdf_stack',
    icon: 'square-text',
  },
  {
    label: 'Frage an Dokumente',
    actionKey: 'docs_ask_question',
    icon: 'sparkle',
  },
]

const MOCK_FILTERS: FilterOption[] = [
  { label: 'Alle', value: 'all' },
  { label: 'Rechnungen', value: 'invoice' },
  { label: 'Verträge', value: 'contract' },
  { label: 'Fotos', value: 'photo' },
  { label: 'Sonstiges', value: 'other' },
]

const MOCK_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc_124',
    icon: 'document',
    title: 'Rechnung ACME GmbH 2025‑12',
    meta: '05.12.2025 • PDF',
  },
  {
    id: 'doc_125',
    icon: 'document',
    title: 'Mietvertrag Wohnung',
    meta: '28.11.2025 • DOCX',
  },
  {
    id: 'doc_126',
    icon: 'square-image',
    title: 'Quittung Supermarkt',
    meta: '21.11.2025 • JPG',
  },
  {
    id: 'doc_127',
    icon: 'page-blank',
    title: 'Sonstige Notiz',
    meta: '10.11.2025 • TXT',
  },
]

export function DocumentsSidebarWidget({
  onDocumentClick,
  onOpenDetail,
}: DocumentsSidebarWidgetProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'invoice' | 'contract' | 'photo' | 'other'>('all')

  // Filtere Dokumente basierend auf Filter und Suche
  const filteredDocuments = useMemo(() => {
    let documents = MOCK_DOCUMENTS

    // Filter nach Typ
    if (selectedFilter !== 'all') {
      const filterMap: Record<string, string> = {
        invoice: 'Rechnung',
        contract: 'Vertrag',
        photo: 'Quittung',
        other: 'Sonstige',
      }
      const typeFilter = filterMap[selectedFilter]
      if (typeFilter) {
        documents = documents.filter((doc) => doc.title.includes(typeFilter) || doc.meta.includes(typeFilter))
      }
    }

    // Filter nach Suchbegriff
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      documents = documents.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          doc.meta.toLowerCase().includes(query)
      )
    }

    return documents
  }, [selectedFilter, searchQuery])

  const handleDocumentClick = (document: DocumentItem) => {
    if (onDocumentClick) {
      onDocumentClick(document.id)
    }
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Action Palette öffnen
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Search action
  }

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      {/* Header mit Titel und Info-Button */}
      <div className="flex items-center justify-between">
        <h2 className="ak-heading text-base">Dokumente</h2>
        <button
          type="button"
          onClick={onOverviewClick}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-secondary)] transition-colors hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]"
          aria-label="Details öffnen"
        >
          <InformationCircleIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Suchfeld in Form */}
      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          name="search.query"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Dokumente durchsuchen…"
          className="w-full rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-4 py-2 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)]"
        />
      </form>

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {MOCK_QUICK_ACTIONS.map((action) => {
          const IconComponent = ICON_MAP[action.icon] || DocumentTextIcon
          return (
            <button
              key={action.actionKey}
              type="button"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
            >
              <IconComponent className="h-4 w-4" />
              {action.label}
            </button>
          )
        })}
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
        >
          Mehr…
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center gap-1">
        {MOCK_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setSelectedFilter(filter.value)}
            className={clsx(
              'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors',
              selectedFilter === filter.value
                ? 'border-[var(--ak-color-border-strong)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] shadow-sm'
                : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-secondary)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)]'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Caption */}
      <div className="flex flex-col gap-2">
        <p className="ak-caption text-[var(--ak-color-text-secondary)]">Zuletzt genutzt</p>

        {/* Dokumente-Liste oder Empty State */}
        <div className="flex-1 overflow-y-auto">
          {filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] p-8 text-center">
              <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">
                Noch keine Dokumente. Zieh Dateien hier rein oder starte mit 'Belege auslesen'.
              </p>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-[var(--ak-color-accent)] bg-[var(--ak-color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--ak-color-accent)]/90"
              >
                Datei hochladen
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filteredDocuments.map((document) => {
                const IconComponent = ICON_MAP[document.icon] || DocumentTextIcon
                return (
                  <div
                    key={document.id}
                    onClick={() => handleDocumentClick(document)}
                    className="group flex w-full items-center gap-3 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/80 p-3 text-left transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)] hover:shadow-[var(--ak-shadow-card)] cursor-pointer"
                  >
                    {/* Icon Box (alpha-10 background, sm radius, padding 2) */}
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-[var(--ak-color-bg-surface-muted)]/50">
                      <IconComponent className="h-5 w-5 text-[var(--ak-color-text-primary)]" />
                    </div>

                    {/* Content */}
                    <div className="flex min-w-0 flex-1 flex-col gap-0">
                      <p className="ak-body truncate text-sm font-semibold text-[var(--ak-color-text-primary)]">
                        {document.title}
                      </p>
                      <p className="ak-caption text-sm text-[var(--ak-color-text-secondary)]">
                        {document.meta}
                      </p>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Action Button (nur Dots) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMenuClick(e)
                      }}
                      className="inline-flex h-7 w-7 items-center justify-center rounded text-[var(--ak-color-text-secondary)] transition-colors hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]"
                      aria-label="Menü"
                    >
                      <EllipsisHorizontalIcon className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
