'use client'

import { useState, useMemo } from 'react'
import clsx from 'clsx'
import {
  InformationCircleIcon,
  BoltIcon,
  BriefcaseIcon,
  PencilSquareIcon,
  EnvelopeIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'

type GrowthItem = {
  id: string
  title: string
  status: {
    label: string
    color: 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'discovery'
  }
  channel: string
  date: string
}

type FilterOption = {
  label: string
  value: 'drafts' | 'planned' | 'results'
}

type GrowthSidebarWidgetProps = {
  onItemClick?: (itemId: string) => void
  onOpenDetail?: (itemId: string) => void
  onOverviewClick?: () => void
}

// Badge-Farben-Mapping
const BADGE_COLOR_MAP = {
  secondary: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-green-100 text-green-700 border-green-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  discovery: 'bg-purple-100 text-purple-700 border-purple-200',
} as const

// Mock-Daten basierend auf dem neuen Schema
const MOCK_FILTER_OPTIONS: FilterOption[] = [
  { label: 'Entwürfe', value: 'drafts' },
  { label: 'Geplant', value: 'planned' },
  { label: 'Ergebnisse', value: 'results' },
]

const MOCK_ITEMS: GrowthItem[] = [
  {
    id: 'it_001',
    title: 'LinkedIn: Jahresrückblick',
    status: { label: 'Geplant', color: 'info' },
    channel: 'Social',
    date: '2025-12-15',
  },
  {
    id: 'it_002',
    title: 'Newsletter Q4 Wrap-up',
    status: { label: 'Live', color: 'success' },
    channel: 'Newsletter',
    date: '2025-12-05',
  },
  {
    id: 'it_003',
    title: 'Winter Sale Landingpage',
    status: { label: 'Entwurf', color: 'discovery' },
    channel: 'Kampagne',
    date: '2025-12-10',
  },
  {
    id: 'it_004',
    title: 'YouTube Short: Feature X',
    status: { label: 'Entwurf', color: 'discovery' },
    channel: 'Social',
    date: '2025-12-12',
  },
]

export function GrowthSidebarWidget({ onItemClick, onOpenDetail, onOverviewClick }: GrowthSidebarWidgetProps) {
  const [selectedFilter, setSelectedFilter] = useState<'drafts' | 'planned' | 'results'>('planned')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUpsell, setShowUpsell] = useState(false)

  // Filtere Items basierend auf Filter und Suche
  const filteredItems = useMemo(() => {
    let items = MOCK_ITEMS

    // Filter nach Status
    if (selectedFilter === 'drafts') {
      items = items.filter((item) => item.status.label === 'Entwurf')
    } else if (selectedFilter === 'planned') {
      items = items.filter((item) => item.status.label === 'Geplant')
    } else if (selectedFilter === 'results') {
      items = items.filter((item) => item.status.label === 'Live' || item.status.label === 'Abgeschlossen')
    }

    // Filter nach Suchbegriff
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.channel.toLowerCase().includes(query)
      )
    }

    return items
  }, [selectedFilter, searchQuery])

  const handleItemClick = (item: GrowthItem) => {
    if (onItemClick) {
      onItemClick(item.id)
    }
  }

  const handleInfoClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation()
    if (onOpenDetail) {
      onOpenDetail(itemId)
    }
  }

  const handleBoltClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Action Palette öffnen
  }

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      {/* Header mit Titel und Info-Button */}
      <div className="flex items-center justify-between">
        <h2 className="ak-heading text-sm">Wachstum</h2>
        <button
          type="button"
          onClick={onOverviewClick}
          className="inline-flex h-7 w-7 items-center justify-center rounded text-[var(--ak-color-text-secondary)] transition-colors hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]"
          aria-label="Details öffnen"
        >
          <InformationCircleIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Suchfeld */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Inhalte & Kampagnen suchen…"
        className="w-full rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-2 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)]"
      />

      {/* Action-Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
        >
          <BriefcaseIcon className="h-4 w-4" />
          Kampagne starten
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
        >
          <PencilSquareIcon className="h-4 w-4" />
          Social Post
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
        >
          <EnvelopeIcon className="h-4 w-4" />
          Newsletter
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
        >
          <PlusIcon className="h-4 w-4" />
          Mehr…
        </button>
      </div>

      {/* Filter RadioGroup */}
      <div className="flex items-center gap-2">
        {MOCK_FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSelectedFilter(option.value)}
            className={clsx(
              'inline-flex items-center justify-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
              selectedFilter === option.value
                ? 'border-[var(--ak-color-border-strong)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] shadow-sm'
                : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-secondary)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)]'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Liste der Items */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="flex h-32 items-center justify-center px-3 text-xs text-slate-500">
            Keine Einträge für diesen Filter.
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filteredItems.map((item) => {
              const badgeColorClass = BADGE_COLOR_MAP[item.status.color]

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="group flex w-full items-center gap-3 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/80 p-3 text-left transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] hover:border-[var(--ak-color-border-strong)] hover:bg-[var(--ak-color-bg-surface-muted)] hover:shadow-[var(--ak-shadow-card)] cursor-pointer"
                >
                  {/* Content */}
                  <div className="flex min-w-0 flex-1 flex-col gap-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="ak-body truncate text-sm font-semibold text-[var(--ak-color-text-primary)]">
                        {item.title}
                      </p>
                      <span
                        className={clsx(
                          'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
                          badgeColorClass
                        )}
                      >
                        {item.status.label}
                      </span>
                    </div>
                    <p className="ak-caption text-[var(--ak-color-text-secondary)]">
                      {item.channel} • {item.date}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleInfoClick(e, item.id)
                      }}
                      className="inline-flex h-7 w-7 items-center justify-center rounded border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-secondary)] transition-colors hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]"
                      aria-label="Details"
                    >
                      <InformationCircleIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBoltClick(e)
                      }}
                      className="inline-flex h-7 w-7 items-center justify-center rounded border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-secondary)] transition-colors hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]"
                      aria-label="Aktionen"
                    >
                      <BoltIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Upsell Box (optional) */}
      {showUpsell && (
        <div className="flex items-center gap-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-3 py-2">
          <p className="ak-body flex-1 text-sm text-[var(--ak-color-text-primary)]">
            Soll das künftig automatisch laufen?
          </p>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-[var(--ak-color-accent)] bg-[var(--ak-color-accent)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--ak-color-accent)]/90"
          >
            Automatisieren
          </button>
          <button
            type="button"
            onClick={() => setShowUpsell(false)}
            className="inline-flex items-center justify-center rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
          >
            Später
          </button>
        </div>
      )}
    </div>
  )
}
