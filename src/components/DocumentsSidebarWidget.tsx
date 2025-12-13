'use client'

import { useState, useMemo } from 'react'
import clsx from 'clsx'
import { AkSearchField } from '@/components/ui/AkSearchField'
import {
  EllipsisHorizontalIcon,
  BoltIcon,
  DocumentTextIcon,
  SparklesIcon,
  Square3Stack3DIcon,
  PhotoIcon,
  DocumentIcon,
  RectangleStackIcon,
  PlusIcon,
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

// Mock-Daten
const MOCK_QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Belege',
    actionKey: 'docs_extract_receipts',
    icon: 'bolt',
  },
  {
    label: 'Sortieren',
    actionKey: 'docs_sort_pdf_stack',
    icon: 'square-text',
  },
  {
    label: 'Fragen',
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
    meta: '05.12. • PDF',
  },
  {
    id: 'doc_125',
    icon: 'document',
    title: 'Mietvertrag Wohnung',
    meta: '28.11. • DOCX',
  },
  {
    id: 'doc_126',
    icon: 'square-image',
    title: 'Quittung Supermarkt',
    meta: '21.11. • JPG',
  },
  {
    id: 'doc_127',
    icon: 'page-blank',
    title: 'Sonstige Notiz',
    meta: '10.11. • TXT',
  },
]

export function DocumentsSidebarWidget({
  onDocumentClick,
}: DocumentsSidebarWidgetProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'invoice' | 'contract' | 'photo' | 'other'>('all')

  // Filtere Dokumente
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

  return (
    <div className="flex h-full flex-col ak-surface-1" style={{ padding: 'var(--ak-space-3)' }}>
      {/* Suchfeld */}
      <div style={{ marginBottom: 'var(--ak-space-3)' }}>
        <AkSearchField
          name="search.query"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Dokumente durchsuchen…"
          accent="documents"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 'var(--ak-space-3)' }}>
        {MOCK_QUICK_ACTIONS.map((action) => {
          const IconComponent = ICON_MAP[action.icon] || DocumentTextIcon
          return (
            <button
              key={action.actionKey}
              type="button"
              className="ak-button-sm inline-flex items-center gap-1.5 ak-border-default ak-surface-1 text-[var(--ak-text-primary)] hover:ak-surface-2-hover"
            >
              <IconComponent className="h-4 w-4" />
              {action.label}
            </button>
          )
        })}
        <button className="ak-button-sm inline-flex items-center gap-1.5 ak-border-default ak-surface-1 text-[var(--ak-text-primary)] hover:ak-surface-2-hover px-2">
           <PlusIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--ak-color-border-hairline)] pb-2 mb-2 overflow-x-auto no-scrollbar">
        {MOCK_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setSelectedFilter(filter.value)}
            className={clsx(
              'px-2.5 py-1 text-[var(--ak-font-size-xs)] font-medium transition-colors rounded-md whitespace-nowrap',
              selectedFilter === filter.value
                ? 'text-[var(--ak-text-primary)] bg-[var(--ak-surface-2)]'
                : 'text-[var(--ak-text-muted)] hover:text-[var(--ak-text-primary)] hover:bg-[var(--ak-surface-2-hover)]'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Caption */}
      <div className="flex flex-col gap-2">
        <p className="ak-caption-xs text-[var(--ak-text-muted)] px-2 mt-2">Zuletzt genutzt</p>

        {/* Dokumente-Liste oder Empty State */}
        <div className="flex-1 overflow-y-auto -mx-2 px-2">
          {filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-[var(--ak-color-border-hairline)] bg-[var(--ak-surface-0)] p-8 text-center mt-4">
              <p className="ak-body text-sm text-[var(--ak-text-secondary)]">
                Keine Dokumente gefunden.
              </p>
              <button
                type="button"
                className="ak-button-sm bg-[var(--ak-accent-docs)] text-white hover:opacity-90 border-transparent"
              >
                Datei hochladen
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredDocuments.map((document) => {
                const IconComponent = ICON_MAP[document.icon] || DocumentTextIcon
                return (
                  <div
                    key={document.id}
                    onClick={() => handleDocumentClick(document)}
                    className="group relative flex items-center gap-3 ak-list-row ak-list-row-hover cursor-pointer rounded-md"
                    style={{ height: '52px' }}
                  >
                    {/* Icon Box */}
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[var(--ak-surface-2)] text-[var(--ak-text-secondary)]">
                      <IconComponent className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <p className="ak-body-sm-semibold truncate text-[var(--ak-text-primary)]">
                        {document.title}
                      </p>
                      <p className="ak-caption-xs text-[var(--ak-text-muted)]">
                        {document.meta}
                      </p>
                    </div>

                    {/* Action Button (Hover) */}
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => handleMenuClick(e)}
                        className="p-1 rounded-md text-[var(--ak-text-secondary)] hover:bg-[var(--ak-surface-2-hover)] hover:text-[var(--ak-text-primary)]"
                      >
                        <EllipsisHorizontalIcon className="h-5 w-5" />
                      </button>
                    </div>
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
