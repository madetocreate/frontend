'use client'

import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

import { AkChip } from '@/components/ui/AkChip'
import { AkSearchField } from '@/components/ui/AkSearchField'
import { WidgetCard } from '@/components/ui/WidgetCard'

type DocumentsSidebarWidgetProps = {
  onDocumentClick?: (documentId: string) => void
  onOverviewClick?: () => void
}

type DocStatus = 'Entwurf' | 'Aktiv' | 'Archiv'

type DocumentItem = {
  id: string
  title: string
  subtitle: string
  status: DocStatus
  updatedLabel: string
}

const DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc_1',
    title: 'Angebot ACME GmbH',
    subtitle: 'Vertrieb · Q4',
    status: 'Aktiv',
    updatedLabel: 'vor 2h',
  },
  {
    id: 'doc_2',
    title: 'NDA – Partner',
    subtitle: 'Legal · Standard',
    status: 'Entwurf',
    updatedLabel: 'gestern',
  },
  {
    id: 'doc_3',
    title: 'Rahmenvertrag',
    subtitle: 'Legal · 12 Monate',
    status: 'Aktiv',
    updatedLabel: 'vor 3d',
  },
  {
    id: 'doc_4',
    title: 'Rechnung #2025-12',
    subtitle: 'Finanzen · Dezember',
    status: 'Archiv',
    updatedLabel: 'vor 7d',
  },
  {
    id: 'doc_5',
    title: 'Auftragsbestätigung',
    subtitle: 'Ops · Lieferung',
    status: 'Aktiv',
    updatedLabel: 'vor 9d',
  },
  {
    id: 'doc_6',
    title: 'Datenschutz-Update',
    subtitle: 'Compliance · DPA',
    status: 'Entwurf',
    updatedLabel: 'vor 2w',
  },
  {
    id: 'doc_7',
    title: 'Angebot – Renewal',
    subtitle: 'CS · Verlängerung',
    status: 'Entwurf',
    updatedLabel: 'vor 3w',
  },
  {
    id: 'doc_8',
    title: 'Archiv: Preislisten',
    subtitle: 'Sales Ops',
    status: 'Archiv',
    updatedLabel: 'vor 2m',
  },
]

const STATUS_CLASSES: Record<DocStatus, string> = {
  Entwurf: 'border-amber-200 bg-amber-50 text-amber-700',
  Aktiv: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Archiv: 'border-zinc-200 bg-zinc-50 text-zinc-700',
}

export function DocumentsSidebarWidget({
  onDocumentClick,
  onOverviewClick,
}: DocumentsSidebarWidgetProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | DocStatus>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return DOCUMENTS.filter((doc) => {
      const matchesFilter = filter === 'all' || doc.status === filter
      if (!matchesFilter) return false
      if (!q) return true
      return doc.title.toLowerCase().includes(q) || doc.subtitle.toLowerCase().includes(q)
    })
  }, [filter, query])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    onDocumentClick?.(id)
  }

  return (
    <WidgetCard
      className="h-full border-0 shadow-none bg-transparent"
      padding="sm"
    >
      <div className="flex flex-col gap-3">
        <AkSearchField
          value={query}
          onChange={setQuery}
          placeholder="Dokumente durchsuchen..."
          accent="documents"
        />

        <div className="flex flex-wrap gap-2 items-center flex-nowrap overflow-hidden">
          <AkChip onClick={onOverviewClick}>
            Übersicht
          </AkChip>
          <AkChip
            pressed={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            Alle
          </AkChip>
          <AkChip
            pressed={filter === 'Aktiv'}
            onClick={() => setFilter('Aktiv')}
          >
            Aktiv
          </AkChip>
          <div className="ml-auto shrink-0">
            <AkChip onClick={() => {}}>
              Mehr...
            </AkChip>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="ak-body rounded-2xl border border-dashed border-[var(--ak-color-border)] p-4 text-center text-[var(--ak-color-text-muted)]">
            Keine Treffer.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((doc) => (
              <li key={doc.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(doc.id)}
                  className={clsx(
                    'flex w-full flex-col gap-2 rounded-xl border p-3 text-left transition-all',
                    'bg-white/60 backdrop-blur-sm',
                    selectedId === doc.id
                      ? 'border-[var(--ak-color-accent)] ring-1 ring-[var(--ak-color-accent)]'
                      : 'border-slate-200 hover:bg-white/80'
                  )}
                >
                  <div className="flex w-full items-start gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--ak-color-border)] bg-white/50">
                       <DocumentTextIcon className="h-4 w-4 text-[var(--ak-color-text-secondary)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                       <div className="flex items-start justify-between gap-2">
                         <p className="ak-body font-medium text-slate-900 truncate">{doc.title}</p>
                         <span
                            className={clsx(
                              'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                              STATUS_CLASSES[doc.status],
                            )}
                          >
                            {doc.status}
                          </span>
                       </div>
                       <p className="ak-caption text-slate-500 truncate">{doc.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex w-full items-center justify-start mt-1">
                    <span className="text-[10px] text-slate-400">{doc.updatedLabel}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </WidgetCard>
  )
}
