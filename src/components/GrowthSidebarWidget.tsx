'use client'

import { useState, useMemo } from 'react'
import clsx from 'clsx'
import { AkSearchField } from '@/components/ui/AkSearchField'
import {
  InformationCircleIcon,
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

// Mock-Daten
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
    date: '15. Dez',
  },
  {
    id: 'it_002',
    title: 'Newsletter Q4 Wrap-up',
    status: { label: 'Live', color: 'success' },
    channel: 'Newsletter',
    date: '05. Dez',
  },
  {
    id: 'it_003',
    title: 'Winter Sale Landingpage',
    status: { label: 'Entwurf', color: 'discovery' },
    channel: 'Kampagne',
    date: '10. Dez',
  },
  {
    id: 'it_004',
    title: 'YouTube Short: Feature X',
    status: { label: 'Entwurf', color: 'discovery' },
    channel: 'Social',
    date: '12. Dez',
  },
]

export function GrowthSidebarWidget({ onItemClick, onOpenDetail }: GrowthSidebarWidgetProps) {
  const [selectedFilter, setSelectedFilter] = useState<'drafts' | 'planned' | 'results'>('planned')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUpsell, setShowUpsell] = useState(false)

  // Filtere Items
  const filteredItems = useMemo(() => {
    let items = MOCK_ITEMS

    if (selectedFilter === 'drafts') {
      items = items.filter((item) => item.status.label === 'Entwurf')
    } else if (selectedFilter === 'planned') {
      items = items.filter((item) => item.status.label === 'Geplant')
    } else if (selectedFilter === 'results') {
      items = items.filter((item) => item.status.label === 'Live' || item.status.label === 'Abgeschlossen')
    }

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

  return (
    <div className="flex h-full flex-col ak-surface-1" style={{ padding: 'var(--ak-space-3)' }}>
      {/* Suchfeld */}
      <div style={{ marginBottom: 'var(--ak-space-3)' }}>
        <AkSearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Inhalte suchen…"
          accent="growth"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 'var(--ak-space-3)' }}>
        <button className="ak-button-sm inline-flex items-center gap-1.5 ak-border-default ak-surface-1 text-[var(--ak-text-primary)] hover:ak-surface-2-hover">
          <BriefcaseIcon className="h-4 w-4" />
          Kampagne
        </button>
        <button className="ak-button-sm inline-flex items-center gap-1.5 ak-border-default ak-surface-1 text-[var(--ak-text-primary)] hover:ak-surface-2-hover">
          <PencilSquareIcon className="h-4 w-4" />
          Post
        </button>
        <button className="ak-button-sm inline-flex items-center gap-1.5 ak-border-default ak-surface-1 text-[var(--ak-text-primary)] hover:ak-surface-2-hover">
          <EnvelopeIcon className="h-4 w-4" />
          Mail
        </button>
        <button className="ak-button-sm inline-flex items-center gap-1.5 ak-border-default ak-surface-1 text-[var(--ak-text-primary)] hover:ak-surface-2-hover px-2">
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--ak-color-border-hairline)] pb-2 mb-2">
        {MOCK_FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSelectedFilter(option.value)}
            className={clsx(
              'px-2.5 py-1 text-[var(--ak-font-size-xs)] font-medium transition-colors rounded-md',
              selectedFilter === option.value
                ? 'text-[var(--ak-text-primary)] bg-[var(--ak-surface-2)]'
                : 'text-[var(--ak-text-muted)] hover:text-[var(--ak-text-primary)] hover:bg-[var(--ak-surface-2-hover)]'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto -mx-2 px-2">
        {filteredItems.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-[var(--ak-font-size-xs)] text-[var(--ak-text-muted)]">
            Keine Einträge.
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredItems.map((item) => {
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="group relative flex items-center gap-3 ak-list-row ak-list-row-hover cursor-pointer rounded-md"
                  style={{ height: '52px' }}
                >
                  {/* Status Indicator (links, sehr subtil) */}
                  <div className={clsx("w-1 h-8 rounded-full opacity-50", 
                    item.status.color === 'success' ? 'bg-[var(--ak-semantic-success)]' :
                    item.status.color === 'info' ? 'bg-[var(--ak-semantic-info)]' :
                    item.status.color === 'discovery' ? 'bg-[var(--ak-accent-growth)]' :
                    'bg-[var(--ak-text-muted)]'
                  )} />

                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <div className="flex items-center justify-between">
                      <span className="ak-body-sm-semibold truncate text-[var(--ak-text-primary)]">
                        {item.title}
                      </span>
                      <span className="ak-caption-xs text-[var(--ak-text-muted)] ml-2">
                        {item.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="ak-caption-xs text-[var(--ak-text-secondary)]">
                        {item.channel}
                      </span>
                    </div>
                  </div>

                  {/* Actions (erscheinen bei Hover) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => handleInfoClick(e, item.id)}
                      className="p-1 rounded-md text-[var(--ak-text-secondary)] hover:bg-[var(--ak-surface-2-hover)] hover:text-[var(--ak-text-primary)]"
                    >
                      <InformationCircleIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Upsell (optional, subtiler) */}
      {showUpsell && (
        <div className="mt-3 p-3 rounded-md ak-surface-2 border border-[var(--ak-color-border-hairline)]">
          <p className="ak-caption-xs text-[var(--ak-text-primary)] mb-2">
            Automatisierung vorschlagen?
          </p>
          <div className="flex gap-2">
            <button className="ak-button-sm flex-1 bg-[var(--ak-accent-growth)] text-white hover:opacity-90 border-transparent">
              Ja
            </button>
            <button 
              onClick={() => setShowUpsell(false)}
              className="ak-button-sm flex-1 ak-surface-1 border border-[var(--ak-color-border-default)]"
            >
              Nein
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
